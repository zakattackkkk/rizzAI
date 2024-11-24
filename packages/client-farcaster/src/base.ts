import {
    Content,
    IAgentRuntime,
    IImageDescriptionService,
    embeddingZeroVector,
    Memory,
    State,
    elizaLogger,
    stringToUuid,
    UUID,
} from "@ai16z/eliza";
import { Cast } from "./agent-farcaster-client/casts.ts";

import { NeynarAPI } from "./agent-farcaster-client/neynar-api.ts";
import { QueryTweetsResponse } from "./agent-farcaster-client/timeline-v1.ts";

import { EventEmitter } from "events";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { glob } from "glob";

export function extractAnswer(text: string): string {
    const startIndex = text.indexOf("Answer: ") + 8;
    const endIndex = text.indexOf("<|endoftext|>", 11);
    return text.slice(startIndex, endIndex);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    static _farcasterClient: NeynarAPI;
    farcasterClient: NeynarAPI;
    runtime: IAgentRuntime;
    directions: string;
    lastCheckedCastId: number | null = null;
    tweetCacheFilePath = __dirname + "/castcache/latest_checked_tweet_id.txt";
    imageDescriptionService: IImageDescriptionService;
    temperature: number = 0.5;

    private tweetCache: Map<string, Cast> = new Map();
    requestQueue: RequestQueue = new RequestQueue();
    farcasterUserFID: string;

    async cacheCast(cast: Cast): Promise<void> {
        if (!cast) {
            console.warn("Cast is undefined, skipping cache");
            return;
        }
        const cacheDir = path.join(
            __dirname,
            "castcache",
            cast.conversationId,
            `${cast.id}.json`
        );
        await fs.promises.mkdir(path.dirname(cacheDir), { recursive: true });
        await fs.promises.writeFile(cacheDir, JSON.stringify(cast, null, 2));
        this.tweetCache.set(cast.id, cast);
    }

    async getCachedCast(castid: string): Promise<Cast | undefined> {
        if (this.tweetCache.has(castid)) {
            return this.tweetCache.get(castid);
        }

        const cacheFile = path.join(
            __dirname,
            "castcache",
            "*",
            `${castid}.json`
        );
        const files = await glob(cacheFile);
        if (files.length > 0) {
            const castData = await fs.promises.readFile(files[0], "utf-8");
            const cast = JSON.parse(castData) as Cast;
            this.tweetCache.set(cast.id, cast);
            return cast;
        }

        return undefined;
    }

    async getTweet(castid: string): Promise<Cast> {
        const cachedTweet = await this.getCachedCast(castid);
        if (cachedTweet) {
            return cachedTweet;
        }

        const tweet = await this.requestQueue.add(() =>
            this.farcasterClient.getTweet(castid)
        );
        await this.cacheCast(tweet);
        return tweet;
    }

    callback: (self: ClientBase) => any = null;

    onReady() {
        throw new Error(
            "Not implemented in base class, please call from subclass"
        );
    }

    constructor({ runtime }: { runtime: IAgentRuntime }) {
        super();
        this.runtime = runtime;
        if (ClientBase._farcasterClient) {
            this.farcasterClient = ClientBase._farcasterClient;
        } else {
            this.farcasterClient = new NeynarAPI(runtime.getSetting("FARCASTER_SIGNER_UUID"), runtime.getSetting("NEYNAR_API_KEY"), +runtime.getSetting("FARCASTER_USER_FID"), runtime.getSetting("FARCASTER_USERNAME"), !!runtime.getSetting("FARCASTER_DRY_RUN"));
            ClientBase._farcasterClient = this.farcasterClient;
        }

        this.directions =
            "- " +
            this.runtime.character.style.all.join("\n- ") +
            "- " +
            this.runtime.character.style.post.join();

        try {
            // console.log("this.tweetCacheFilePath", this.tweetCacheFilePath);
            if (fs.existsSync(this.tweetCacheFilePath)) {
                // make it?
                const data = fs.readFileSync(this.tweetCacheFilePath, "utf-8");
                this.lastCheckedCastId = parseInt(data.trim());
            } else {
                // console.warn("Cast cache file not found.");
                // console.warn(this.tweetCacheFilePath);
            }
        } catch (error) {
            console.error(
                "Error loading latest checked tweet ID from file:",
                error
            );
        }

        // async initialization
        (async () => {

            const userId = await this.requestQueue.add(async () => {
                // wait 3 seconds before getting the user id
                await new Promise((resolve) => setTimeout(resolve, 10000));
                try {
                    return await this.farcasterClient.getUserId();
                } catch (error) {
                    console.error("Error getting user ID:", error);
                    return null;
                }
            });
            if (!userId) {
                console.error("Failed to get user ID");
                return;
            }
            console.log("farcaster user ID:", userId);
            this.farcasterUserFID = userId;

            // Initialize farcaster profile
            const profile = await this.initializeProfile();
            if (profile) {
                console.log("Farcaster profile initialized:", profile);

                // Store profile info for use in responses
                this.runtime.character = {
                    ...this.runtime.character,
                    farcasterProfile: {
                        username: profile.username,
                        screenName: profile.screenName,
                        bio: profile.bio,
                        nicknames: profile.nicknames,
                    },
                };
            }

            await this.populateTimeline();

            this.onReady();
        })();
    }

    async fetchHomeTimeline(count: number): Promise<Cast[]> {
        const homeTimeline = await this.farcasterClient.fetchHomeTimeline(
            count,
            []
        );
        return homeTimeline;
    }

    async fetchSearchCasts(
        query: string,
        maxTweets: number,
        cursor?: string
    ): Promise<QueryTweetsResponse> {
        try {
            try {
                const result = await this.requestQueue.add(
                    async () =>
                        await Promise.race([
                            this.farcasterClient.fetchSearchCasts(
                                query,
                                maxTweets,
                            ),
                        ])
                );
                return (result ?? { tweets: [] }) as QueryTweetsResponse;
            } catch (error) {
                console.error("Error fetching search tweets:", error);
                return { tweets: [] };
            }
        } catch (error) {
            console.error("Error fetching search tweets:", error);
            return { tweets: [] };
        }
    }

    private async populateTimeline() {
        const cacheFile = "timeline_cache.json";

        // Check if the cache file exists
        if (fs.existsSync(cacheFile)) {
            // Read the cached search results from the file
            const cachedResults = JSON.parse(
                fs.readFileSync(cacheFile, "utf-8")
            );

            // Get the existing memories from the database
            const existingMemories =
                await this.runtime.messageManager.getMemoriesByRoomIds({
                    agentId: this.runtime.agentId,
                    roomIds: cachedResults.map((tweet) =>
                        stringToUuid(
                            tweet.conversationId + "-" + this.runtime.agentId
                        )
                    ),
                });

            // Create a Set to store the IDs of existing memories
            const existingMemoryIds = new Set(
                existingMemories.map((memory) => memory.id.toString())
            );

            // Check if any of the cached tweets exist in the existing memories
            const someCachedTweetsExist = cachedResults.some((tweet) =>
                existingMemoryIds.has(tweet.id)
            );

            if (someCachedTweetsExist) {
                // Filter out the cached tweets that already exist in the database
                const tweetsToSave = cachedResults.filter(
                    (tweet) => !existingMemoryIds.has(tweet.id)
                );

                // Save the missing tweets as memories
                for (const tweet of tweetsToSave) {
                    const roomId = stringToUuid(
                        tweet.conversationId ??
                        "default-room-" + this.runtime.agentId
                    );
                    const tweetuserId =
                        tweet.userId === this.farcasterUserFID
                            ? this.runtime.agentId
                            : stringToUuid(tweet.userId);

                    await this.runtime.ensureConnection(
                        tweetuserId,
                        roomId,
                        tweet.username,
                        tweet.name,
                        "farcaster"
                    );

                    const content = {
                        text: tweet.text,
                        url: tweet.permanentUrl,
                        source: "farcaster",
                        inReplyTo: tweet.inReplyToStatusId
                            ? stringToUuid(
                                tweet.inReplyToStatusId +
                                "-" +
                                this.runtime.agentId
                            )
                            : undefined,
                    } as Content;

                    elizaLogger.log("Creating memory for tweet", tweet.id);

                    // check if it already exists
                    const memory =
                        await this.runtime.messageManager.getMemoryById(
                            stringToUuid(tweet.id + "-" + this.runtime.agentId)
                        );
                    if (memory) {
                        elizaLogger.log(
                            "Memory already exists, skipping timeline population"
                        );
                        break;
                    }

                    await this.runtime.messageManager.createMemory({
                        id: stringToUuid(tweet.id + "-" + this.runtime.agentId),
                        userId: tweetuserId,
                        content: content,
                        agentId: this.runtime.agentId,
                        roomId,
                        embedding: embeddingZeroVector,
                        createdAt: tweet.timestamp * 1000,
                    });
                }

                elizaLogger.log(
                    `Populated ${tweetsToSave.length} missing tweets from the cache.`
                );
                return;
            }
        }

        // Get the most recent 20 mentions and interactions
        const mentionsAndInteractions = await this.fetchSearchCasts(
            this.runtime.getSetting("FARCASTER_USERNAME"),
            20,
        );

        // Combine the timeline tweets and mentions/interactions
        const allTweets = [...mentionsAndInteractions.tweets];

        // Create a Set to store unique tweet IDs
        const tweetIdsToCheck = new Set<string>();

        // Add tweet IDs to the Set
        for (const tweet of allTweets) {
            tweetIdsToCheck.add(tweet.id);
        }

        // Convert the Set to an array of UUIDs
        const tweetUuids = Array.from(tweetIdsToCheck).map((id) =>
            stringToUuid(id + "-" + this.runtime.agentId)
        );

        // Check the existing memories in the database
        const existingMemories =
            await this.runtime.messageManager.getMemoriesByRoomIds({
                agentId: this.runtime.agentId,
                roomIds: tweetUuids,
            });

        // Create a Set to store the existing memory IDs
        const existingMemoryIds = new Set<UUID>(
            existingMemories.map((memory) => memory.roomId)
        );

        // Filter out the tweets that already exist in the database
        const tweetsToSave = allTweets.filter(
            (tweet) =>
                !existingMemoryIds.has(
                    stringToUuid(tweet.id + "-" + this.runtime.agentId)
                )
        );

        await this.runtime.ensureUserExists(
            this.runtime.agentId,
            this.runtime.getSetting("FARCASTER_USERNAME"),
            this.runtime.character.name,
            "farcaster"
        );

        // Save the new tweets as memories
        for (const tweet of tweetsToSave) {
            const roomId = stringToUuid(
                tweet.conversationId ?? "default-room-" + this.runtime.agentId
            );
            const tweetuserId =
                tweet.userId === this.farcasterUserFID
                    ? this.runtime.agentId
                    : stringToUuid(tweet.userId);

            await this.runtime.ensureConnection(
                tweetuserId,
                roomId,
                tweet.username,
                tweet.name,
                "farcaster"
            );

            const content = {
                text: tweet.text,
                url: tweet.permanentUrl,
                source: "farcaster",
                inReplyTo: tweet.inReplyToStatusId
                    ? stringToUuid(tweet.inReplyToStatusId)
                    : undefined,
            } as Content;

            await this.runtime.messageManager.createMemory({
                id: stringToUuid(tweet.id + "-" + this.runtime.agentId),
                userId: tweetuserId,
                content: content,
                agentId: this.runtime.agentId,
                roomId,
                embedding: embeddingZeroVector,
                createdAt: tweet.timestamp * 1000,
            });
        }

        // Cache the search results to the file
        fs.writeFileSync(cacheFile, JSON.stringify(allTweets));
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
                console.log("Message already saved", recentMessage[0].id);
            } else {
                await this.runtime.messageManager.createMemory({
                    ...message,
                    embedding: embeddingZeroVector,
                });
            }

            await this.runtime.evaluate(message, {
                ...state,
                farcasterClient: this.farcasterClient,
            });
        }
    }

    async initializeProfile() {
        const username = this.runtime.getSetting("FARCASTER_USERNAME");
        const signerUuid = this.runtime.getSetting("FARCASTER_SIGNER_UUID");
        const apiKey = this.runtime.getSetting("FARCASTER_API_KEY");
        if (!username || !signerUuid || !apiKey) {
            console.error("Farcaster username not configured");
            return;
        }

        try {
            const profile = await this.requestQueue.add(async () => {
                const profile = await this.farcasterClient.getProfile();
                return {
                    username,
                    screenName: profile.name || this.runtime.character.name,
                    bio:
                        profile.biography ||
                            typeof this.runtime.character.bio === "string"
                            ? (this.runtime.character.bio as string)
                            : this.runtime.character.bio.length > 0 ? this.runtime.character.bio[0] : "",
                    nicknames: this.runtime.character.farcasterProfile?.nicknames || [],
                };
            });

            return profile;
        } catch (error) {
            console.error("Error fetching Farcaster profile:", error);
            return {
                username: this.runtime.character.name,
                screenName: username,
                bio:
                    typeof this.runtime.character.bio === "string"
                        ? (this.runtime.character.bio as string)
                        : this.runtime.character.bio.length > 0
                            ? this.runtime.character.bio[0]
                            : "",
                nicknames:
                    this.runtime.character.farcasterProfile?.nicknames || [],
            };
        }
    }
}
