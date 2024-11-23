import {
    Content,
    IAgentRuntime,
    IImageDescriptionService,
    Memory,
    State,
    UUID,
    embeddingZeroVector,
    elizaLogger,
    stringToUuid,
} from "@ai16z/eliza";
import { Scraper, SearchMode, Tweet } from "agent-twitter-client";
import { EventEmitter } from "events";
import TwitterApi from "twitter-api-v2";

export function extractAnswer(text: string): string {
    const startIndex = text.indexOf("Answer: ") + 8;
    const endIndex = text.indexOf("<|endoftext|>", 11);
    return text.slice(startIndex, endIndex);
}

type TwitterProfile = {
    id: string;
    username: string;
    screenName: string;
    bio: string;
    nicknames: string[];
};

class RequestQueue {
    private queue: (() => Promise<any>)[] = [];
    private processing: boolean = false;

    async add<T>(request: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await request();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
            this.processQueue();
        });
    }

    private async processQueue(): Promise<void> {
        if (this.processing || this.queue.length === 0) {
            return;
        }
        this.processing = true;

        while (this.queue.length > 0) {
            const request = this.queue.shift()!;
            try {
                await request();
            } catch (error) {
                console.error("Error processing request:", error);
                this.queue.unshift(request);
                await this.exponentialBackoff(this.queue.length);
            }
            await this.randomDelay();
        }

        this.processing = false;
    }

    private async exponentialBackoff(retryCount: number): Promise<void> {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    private async randomDelay(): Promise<void> {
        const delay = Math.floor(Math.random() * 2000) + 1500;
        await new Promise((resolve) => setTimeout(resolve, delay));
    }
}

export class ClientBase extends EventEmitter {
    static _twitterClient: Scraper;
    twitterClient: Scraper;
    runtime: IAgentRuntime;
    directions: string;
    lastCheckedTweetId: number | null = null;
    imageDescriptionService: IImageDescriptionService;
    temperature: number = 0.5;

    requestQueue: RequestQueue = new RequestQueue();

    profile: TwitterProfile | null;

    async cacheTweet(tweet: Tweet): Promise<void> {
        if (!tweet) {
            console.warn("Tweet is undefined, skipping cache");
            return;
        }

        this.runtime.cacheManager.set(`twitter/tweets/${tweet.id}`, tweet);
    }

    async getCachedTweet(tweetId: string): Promise<Tweet | undefined> {
        const cached = await this.runtime.cacheManager.get<Tweet>(
            `twitter/tweets/${tweetId}`
        );

        return cached;
    }

    async getTweet(tweetId: string): Promise<Tweet> {
        const cachedTweet = await this.getCachedTweet(tweetId);

        if (cachedTweet) {
            return cachedTweet;
        }
        const hasV2Settings =
            this.runtime.getSetting("TWITTER_API_KEY") &&
            this.runtime.getSetting("TWITTER_API_SECRET_KEY") &&
            this.runtime.getSetting("TWITTER_ACCESS_TOKEN") &&
            this.runtime.getSetting("TWITTER_ACCESS_TOKEN_SECRET");
        const tweet = await this.requestQueue.add(() =>
            hasV2Settings
                ? this.twitterClient.getTweetV2(tweetId)
                : this.twitterClient.getTweet(tweetId)
        );

        await this.cacheTweet(tweet);
        return tweet;
    }

    callback: (self: ClientBase) => any = null;

    onReady() {
        throw new Error(
            "Not implemented in base class, please call from subclass"
        );
    }

    constructor(runtime: IAgentRuntime) {
        super();
        this.runtime = runtime;
        if (ClientBase._twitterClient) {
            this.twitterClient = ClientBase._twitterClient;
        } else {
            this.twitterClient = new Scraper();
            ClientBase._twitterClient = this.twitterClient;
        }

        this.directions =
            "- " +
            this.runtime.character.style.all.join("\n- ") +
            "- " +
            this.runtime.character.style.post.join();
    }

    async init() {
        const username = this.runtime.getSetting("TWITTER_USERNAME");
        const apiKey = this.runtime.getSetting("TWITTER_API_KEY");

        if (!username && !apiKey) {
            throw new Error("Twitter username or apiKey not configured");
        }

        // Check for Twitter cookies
        const cookies = this.runtime.getSetting("TWITTER_COOKIES");
        if (cookies) {
            const cookiesArray = JSON.parse(cookies);
            await this.setCookiesFromArray(cookiesArray);
        } else {
            await this.twitterClient.login(
                this.runtime.getSetting("TWITTER_USERNAME"),
                this.runtime.getSetting("TWITTER_PASSWORD"),
                this.runtime.getSetting("TWITTER_EMAIL"),
                this.runtime.getSetting("TWITTER_2FA_SECRET"),
                this.runtime.getSetting("TWITTER_API_KEY"),
                this.runtime.getSetting("TWITTER_API_SECRET_KEY"),
                this.runtime.getSetting("TWITTER_ACCESS_TOKEN"),
                this.runtime.getSetting("TWITTER_ACCESS_TOKEN_SECRET")
            );
            elizaLogger.log("Logged in to Twitter");
            const cachedCookies = await this.getCachedCookies(username);
            if (cachedCookies) {
                await this.setCookiesFromArray(cachedCookies);
            }
        }
        let loggedInWaits = 0;

        while (!(await this.twitterClient.isLoggedIn())) {
            console.log("Waiting for Twitter login...");
            await new Promise((resolve) => setTimeout(resolve, 2000));
            loggedInWaits++;

            if (loggedInWaits > 10) {
                console.error("Failed to login to Twitter, retrying...");
                await this.twitterClient.login(
                    this.runtime.getSetting("TWITTER_USERNAME"),
                    this.runtime.getSetting("TWITTER_PASSWORD"),
                    this.runtime.getSetting("TWITTER_EMAIL"),
                    this.runtime.getSetting("TWITTER_2FA_SECRET"),
                    this.runtime.getSetting("TWITTER_API_KEY"),
                    this.runtime.getSetting("TWITTER_API_SECRET_KEY"),
                    this.runtime.getSetting("TWITTER_ACCESS_TOKEN"),
                    this.runtime.getSetting("TWITTER_ACCESS_TOKEN_SECRET")
                );

                if (await this.twitterClient.isLoggedIn()) {
                    const refreshedCookies =
                        await this.twitterClient.getCookies();
                    await this.cacheCookies(username, refreshedCookies);
                    break;
                }

                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }

        if (!(await this.twitterClient.isLoggedIn())) {
            throw new Error(
                "Failed to log in to Twitter after multiple attempts"
            );
        }

        // Initialize Twitter profile
        this.profile = await this.fetchProfile(username);

        if (this.profile) {
            elizaLogger.log("Twitter user ID:", this.profile.id);
            elizaLogger.log(
                "Twitter profile loaded:",
                JSON.stringify(this.profile, null, 2)
            );

            // Store profile info for use in responses
            this.runtime.character.twitterProfile = {
                id: this.profile.id,
                username: this.profile.username,
                screenName: this.profile.screenName,
                bio: this.profile.bio,
                nicknames: this.profile.nicknames,
            };
        } else {
            throw new Error("Failed to load Twitter profile");
        }

        await this.loadLatestCheckedTweetId();
        await this.populateTimeline();
    }

    private async populateTimeline() {
        elizaLogger.debug("Populating timeline...");

        const useV2API = true;

        // Retrieve cached timeline if it exists
        const cachedTimeline = await this.getCachedTimeline();

        if (cachedTimeline) {
            const existingMemories =
                await this.runtime.messageManager.getMemoriesByRoomIds({
                    agentId: this.runtime.agentId,
                    roomIds: cachedTimeline.map((tweet) =>
                        stringToUuid(tweet.id + "-" + this.runtime.agentId)
                    ),
                });

            const existingMemoryIds = new Set(
                existingMemories.map((memory) => memory.id.toString())
            );

            const tweetsToSave = cachedTimeline.filter(
                (tweet) =>
                    !existingMemoryIds.has(
                        stringToUuid(tweet.id + "-" + this.runtime.agentId)
                    )
            );

            if (tweetsToSave.length > 0) {
                elizaLogger.log(
                    `Processing ${tweetsToSave.length} cached tweets.`
                );
                for (const tweet of tweetsToSave) {
                    const roomId = stringToUuid(
                        tweet.id + "-" + this.runtime.agentId
                    );

                    const userId =
                        tweet.userId === this.profile.id
                            ? this.runtime.agentId
                            : stringToUuid(tweet.userId);

                    if (tweet.userId === this.profile.id) {
                        await this.runtime.ensureConnection(
                            this.runtime.agentId,
                            roomId,
                            this.profile.username,
                            this.profile.screenName,
                            "twitter"
                        );
                    } else {
                        await this.runtime.ensureConnection(
                            userId,
                            roomId,
                            tweet.username,
                            tweet.name,
                            "twitter"
                        );
                    }

                    const content = {
                        text: tweet.text,
                        url: tweet.permanentUrl,
                        source: "twitter",
                        inReplyTo: tweet.inReplyToStatusId
                            ? stringToUuid(
                                  tweet.inReplyToStatusId +
                                      "-" +
                                      this.runtime.agentId
                              )
                            : undefined,
                    } as Content;

                    elizaLogger.log("Creating memory for tweet", tweet.id);

                    const memory =
                        await this.runtime.messageManager.getMemoryById(
                            stringToUuid(tweet.id + "-" + this.runtime.agentId)
                        );

                    if (memory) {
                        elizaLogger.log(
                            "Memory already exists, skipping timeline population"
                        );
                        continue;
                    }

                    await this.runtime.messageManager.createMemory({
                        id: stringToUuid(tweet.id + "-" + this.runtime.agentId),
                        userId,
                        content: content,
                        agentId: this.runtime.agentId,
                        roomId,
                        embedding: embeddingZeroVector,
                        createdAt: tweet.timestamp * 1000,
                    });

                    await this.cacheTweet(tweet);
                }

                elizaLogger.log(
                    `Populated ${tweetsToSave.length} missing tweets from the cache.`
                );
                return;
            }
        }

        let mentionsAndInteractions: any[] = [];
        let timeline: any[] = [];

        // Fetch timeline and mentions based on API version
        if (useV2API) {
            elizaLogger.debug("Using Twitter API v2 for timeline population.");
            const twitterClientV2 = new TwitterApi({
                appKey:
                    this.runtime.getSetting("TWITTER_API_KEY") ||
                    process.env.TWITTER_API_KEY,
                appSecret:
                    this.runtime.getSetting("TWITTER_API_SECRET_KEY") ||
                    process.env.TWITTER_API_SECRET_KEY,
                accessToken:
                    this.runtime.getSetting("TWITTER_ACCESS_TOKEN") ||
                    process.env.TWITTER_ACCESS_TOKEN,
                accessSecret:
                    this.runtime.getSetting("TWITTER_ACCESS_TOKEN_SECRET") ||
                    process.env.TWITTER_ACCESS_TOKEN_SECRET,
            });

            // Fetch timeline (v2)
            const timelineResponse = await twitterClientV2.v2.homeTimeline({
                max_results: cachedTimeline ? 10 : 10,
            });
            timeline = timelineResponse.data?.data || [];
            // Fetch mentions (v2)
            const mentionsResponse = await twitterClientV2.v2.search(
                `@${this.runtime.getSetting("TWITTER_USERNAME")}`,
                {
                    max_results: 10,
                    expansions: ["author_id", "in_reply_to_user_id"],
                }
            );
            mentionsAndInteractions = mentionsResponse.data?.data || [];
        } else {
            elizaLogger.debug("Using Twitter API v1 for timeline population.");

            const timelineResponse = await this.twitterClient.fetchHomeTimeline(
                cachedTimeline ? 10 : 50,
                cachedTimeline.map((t) => t.id)
            );
            timeline = timelineResponse || [];

            const mentionsResponse = await this.twitterClient.fetchSearchTweets(
                `@${this.runtime.getSetting("TWITTER_USERNAME")}`,
                20,
                SearchMode.Latest
            );
            mentionsAndInteractions = mentionsResponse.tweets || [];
        }

        const allV2Tweets = [...timeline, ...mentionsAndInteractions];
        const allTweets = (
            await this.twitterClient.getTweetsV2(allV2Tweets.map((t) => t.id))
        ).slice(0, 10);
        const roomIds = new Set<UUID>();
        for (const tweet of allTweets) {
            const conversationId = tweet.id;

            roomIds.add(
                stringToUuid(conversationId + "-" + this.runtime.agentId)
            );
        }

        const existingMemories =
            await this.runtime.messageManager.getMemoriesByRoomIds({
                agentId: this.runtime.agentId,
                roomIds: Array.from(roomIds),
            });

        const existingMemoryIds = new Set(
            existingMemories.map((memory) => memory.id.toString())
        );
        const tweetsToSave = allTweets.filter(
            (tweet) =>
                !existingMemoryIds.has(
                    stringToUuid(tweet.id + "-" + this.runtime.agentId)
                )
        );

        elizaLogger.debug({
            processingTweets: tweetsToSave.map((tweet) => tweet.id).join(","),
        });

        await this.runtime.ensureUserExists(
            this.runtime.agentId,
            this.profile.username,
            this.runtime.character.name,
            "twitter"
        );
        // Save the new tweets as memories
        for (const tweet of tweetsToSave) {
            elizaLogger.error("tweet:", tweet);
            const roomId = stringToUuid(tweet.id + "-" + this.runtime.agentId);
            const userId =
                tweet.userId === this.profile.id
                    ? this.runtime.agentId
                    : stringToUuid(tweet.userId);

            const content = {
                text: tweet.text,
                url: `https://twitter.com/${tweet.username}/status/${tweet.id}`,
                source: "twitter",
                inReplyTo: tweet.inReplyToStatusId
                    ? stringToUuid(tweet.inReplyToStatusId)
                    : undefined,
            } as Content;

            await this.runtime.messageManager.createMemory({
                id: stringToUuid(tweet.id + "-" + this.runtime.agentId),
                userId,
                content,
                agentId: this.runtime.agentId,
                roomId,
                embedding: embeddingZeroVector,
                createdAt: tweet.timestamp * 1000,
            });

            await this.cacheTweet(tweet);
        }

        await this.cacheTimeline(timeline);
        await this.cacheMentions(mentionsAndInteractions);
    }

    async setCookiesFromArray(cookiesArray: any[]) {
        const cookieStrings = cookiesArray.map(
            (cookie) =>
                `${cookie.key}=${cookie.value}; Domain=${cookie.domain}; Path=${cookie.path}; ${
                    cookie.secure ? "Secure" : ""
                }; ${cookie.httpOnly ? "HttpOnly" : ""}; SameSite=${
                    cookie.sameSite || "Lax"
                }`
        );
        await this.twitterClient.setCookies(cookieStrings);
    }

    async saveRequestMessage(message: Memory, state: State) {
        if (message.content.text) {
            const recentMessage = await this.runtime.messageManager.getMemories(
                {
                    roomId: message.roomId,
                    agentId: this.runtime.agentId,
                    count: 1,
                    unique: false,
                }
            );

            if (
                recentMessage.length > 0 &&
                recentMessage[0].content === message.content
            ) {
                elizaLogger.debug("Message already saved", recentMessage[0].id);
            } else {
                await this.runtime.messageManager.createMemory({
                    ...message,
                    embedding: embeddingZeroVector,
                });
            }

            await this.runtime.evaluate(message, {
                ...state,
                twitterClient: this.twitterClient,
            });
        }
    }

    async loadLatestCheckedTweetId(): Promise<void> {
        const latestCheckedTweetId =
            await this.runtime.cacheManager.get<number>(
                `twitter/${this.profile.username}/latest_checked_tweet_id`
            );

        if (latestCheckedTweetId) {
            this.lastCheckedTweetId = latestCheckedTweetId;
        }
    }

    async cacheLatestCheckedTweetId() {
        if (this.lastCheckedTweetId) {
            await this.runtime.cacheManager.set(
                `twitter/${this.profile.username}/latest_checked_tweet_id`,
                this.lastCheckedTweetId
            );
        }
    }

    async getCachedTimeline(): Promise<Tweet[] | undefined> {
        return await this.runtime.cacheManager.get<Tweet[]>(
            `twitter/${this.profile.username}/timeline`
        );
    }

    async cacheTimeline(timeline: Tweet[]) {
        await this.runtime.cacheManager.set(
            `twitter/${this.profile.username}/timeline`,
            timeline,
            { expires: 10 * 1000 }
        );
    }

    async cacheMentions(mentions: Tweet[]) {
        await this.runtime.cacheManager.set(
            `twitter/${this.profile.username}/mentions`,
            mentions,
            { expires: 10 * 1000 }
        );
    }

    async getCachedCookies(username: string) {
        return await this.runtime.cacheManager.get<any[]>(
            `twitter/${username}/cookies`
        );
    }

    async cacheCookies(username: string, cookies: any[]) {
        await this.runtime.cacheManager.set(
            `twitter/${username}/cookies`,
            cookies
        );
    }

    async getCachedProfile(username: string) {
        return await this.runtime.cacheManager.get<TwitterProfile>(
            `twitter/${username}/profile`
        );
    }

    async cacheProfile(profile: TwitterProfile) {
        await this.runtime.cacheManager.set(
            `twitter/${profile.username}/profile`,
            profile
        );
    }

    async fetchProfile(username: string): Promise<TwitterProfile> {
        try {
            // Fetch profile by username
            const twitterClientV2 = new TwitterApi({
                appKey:
                    this.runtime.getSetting("TWITTER_API_KEY") ||
                    process.env.TWITTER_API_KEY,
                appSecret:
                    this.runtime.getSetting("TWITTER_API_SECRET_KEY") ||
                    process.env.TWITTER_API_SECRET_KEY,
                accessToken:
                    this.runtime.getSetting("TWITTER_ACCESS_TOKEN") ||
                    process.env.TWITTER_ACCESS_TOKEN,
                accessSecret:
                    this.runtime.getSetting("TWITTER_ACCESS_TOKEN_SECRET") ||
                    process.env.TWITTER_ACCESS_TOKEN_SECRET,
            });
            const user = await twitterClientV2.v2.userByUsername(username);
            return {
                id: user.data.id,
                username: user.data.username,
                screenName: user.data.name,
                bio: user.data.description,
                nicknames: [user.data.name], // Add logic to infer nicknames if necessary
            };
        } catch (error) {
            console.error("Error fetching profile:", error);
            return null;
        }
        const cached = await this.getCachedProfile(username);

        if (cached) return cached;

        // try {
        //     // Fetch profile by username
        //     const user = await this.twitterClient.getU userByUsername(username);
        //     return {
        //         id: user.data.id,
        //         username: user.data.username,
        //         screenName: user.data.name,
        //         bio: user.data.description,
        //         nicknames: [user.data.name], // Add logic to infer nicknames if necessary
        //     };
        // } catch (error) {
        //     console.error('Error fetching profile:', error);
        //     return null;
        // }

        try {
            const profile = await this.requestQueue.add(async () => {
                const profile = await this.twitterClient.getProfile(username);
                // console.log({ profile });
                return {
                    id: profile.userId,
                    username,
                    screenName: profile.name || this.runtime.character.name,
                    bio:
                        profile.biography ||
                        typeof this.runtime.character.bio === "string"
                            ? (this.runtime.character.bio as string)
                            : this.runtime.character.bio.length > 0
                              ? this.runtime.character.bio[0]
                              : "",
                    nicknames:
                        this.runtime.character.twitterProfile?.nicknames || [],
                } satisfies TwitterProfile;
            });

            this.cacheProfile(profile);

            return profile;
        } catch (error) {
            console.error("Error fetching Twitter profile:", error);

            return undefined;
        }
    }
}
