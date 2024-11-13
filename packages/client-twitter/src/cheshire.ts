import { Tweet } from "agent-twitter-client";
import fs from "fs";
import { composeContext } from "@ai16z/eliza/src/context.ts";
import { generateText } from "@ai16z/eliza/src/generation.ts";
import { embeddingZeroVector } from "@ai16z/eliza/src/memory.ts";
import { IAgentRuntime, ModelClass } from "@ai16z/eliza/src/types.ts";
import { stringToUuid } from "@ai16z/eliza/src/uuid.ts";
import { ClientBase } from "./base.ts";
import { LangChain, Groq } from "@lang-chain/core";

// Define the Cheshire bot's settings
const TWITTER_USERNAME = "your_twitter_username";
const CHARACTER_NAME = "Cheshire";

export class CheshireBot extends ClientBase {
    constructor(runtime: IAgentRuntime) {
        super({
            runtime,
        });
    }

    onReady() {
        // Start the bot's main loop
        this.runBot();
    }

    private async generateNewTweet() {
        console.log("Generating new tweet");
        try {
            await this.runtime.ensureUserExists(
                this.runtime.agentId,
                this.runtime.getSetting(TWITTER_USERNAME),
                CHARACTER_NAME,
                "twitter"
            );

            let homeTimeline = [];

            if (!fs.existsSync("tweetcache")) fs.mkdirSync("tweetcache");
            if (fs.existsSync("tweetcache/home_timeline.json")) {
                homeTimeline = JSON.parse(
                    fs.readFileSync("tweetcache/home_timeline.json", "utf-8")
                );
            } else {
                homeTimeline = await this.fetchHomeTimeline(50);
                fs.writeFileSync(
                    "tweetcache/home_timeline.json",
                    JSON.stringify(homeTimeline, null, 2)
                );
            }

            const formattedHomeTimeline =
                `# ${CHARACTER_NAME}'s Home Timeline\n\n` +
                homeTimeline
                    .map((tweet) => {
                        return `ID: ${tweet.id}\nFrom: ${tweet.name} (@${tweet.username})${tweet.inReplyToStatusId ? ` In reply to: ${tweet.inReplyToStatusId}` : ""}\nText: ${tweet.text}\n---\n`;
                    })
                    .join("\n");

            const state = await this.runtime.composeState(
                {
                    userId: this.runtime.agentId,
                    roomId: stringToUuid("twitter_generate_room"),
                    agentId: this.runtime.agentId,
                    content: { text: "", action: "" },
                },
                {
                    twitterUsername: this.runtime.getSetting(TWITTER_USERNAME),
                    timeline: formattedHomeTimeline,
                }
            );

            const context = composeContext({
                state,
                template:
                    this.runtime.character.templates?.twitterPostTemplate ||
                    `# ${CHARACTER_NAME}'s Home Timeline\n\n${formattedHomeTimeline}\n\n# ${CHARACTER_NAME}'s New Tweet\n\n`,
            });

            const newTweetContent = await generateText({
                runtime: this.runtime,
                context,
                modelClass: ModelClass.SMALL,
            });

            const slice = newTweetContent.replaceAll(/\\n/g, "\n").trim();
            const contentLength = 240;

            let content = slice.slice(0, contentLength);
            if (content.length > 280) {
                content = content.slice(0, content.lastIndexOf("\n"));
            }
            if (content.length > contentLength) {
                content = content.slice(0, content.lastIndexOf("."));
            }
            if (content.length > contentLength) {
                content = content.slice(0, content.lastIndexOf("."));
            }

            try {
                const result = await this.requestQueue.add(
                    async () => await this.twitterClient.sendTweet(content)
                );
                const body = await result.json();
                const tweetResult = body.data.create_tweet.tweet_results.result;

                const tweet = {
                    id: tweetResult.rest_id,
                    text: tweetResult.legacy.full_text,
                    conversationId: tweetResult.legacy.conversation_id_str,
                    createdAt: tweetResult.legacy.created_at,
                    userId: tweetResult.legacy.user_id_str,
                    inReplyToStatusId: tweetResult.legacy.in_reply_to_status_id_str,
                    permanentUrl: `https://twitter.com/${this.runtime.getSetting(TWITTER_USERNAME)}/status/${tweetResult.rest_id}`,
                    hashtags: [],
                    mentions: [],
                    photos: [],
                    thread: [],
                    urls: [],
                    videos: [],
                } as Tweet;

                const postId = tweet.id;
                const conversationId = tweet.conversationId + "-" + this.runtime.agentId;
                const roomId = stringToUuid(conversationId);

                await this.runtime.ensureRoomExists(roomId);
                await this.runtime.ensureParticipantInRoom(
                    this.runtime.agentId,
                    roomId
                );

                await this.cacheTweet(tweet);

                await this.runtime.messageManager.createMemory({
                    id: stringToUuid(postId + "-" + this.runtime.agentId),
                    userId: this.runtime.agentId,
                    agentId: this.runtime.agentId,
                    content: {
                        text: newTweetContent.trim(),
                        url: tweet.permanentUrl,
                        source: "twitter",
                    },
                    roomId,
                    embedding: embeddingZeroVector,
                    createdAt: tweet.timestamp * 1000,
                });
            } catch (error) {
                console.error("Error sending tweet:", error);
            }
        } catch (error) {
            console.error("Error generating new tweet:", error);
        }
    }

    private async fetchAndCacheTweets() {
        try {
            const groqQuery = Groq.query(`
                *[_type == "tweet"] {
                    id,
                    text,
                    conversationId,
                    createdAt,
                    userId,
                    inReplyToStatusId,
                    permanentUrl
                }
            `);

            const response = await fetch(`https://api.twitter.com/2/tweets?query=${groqQuery}&limit=100`, {
                headers: {
                    "Authorization": `Bearer ${this.runtime.getSetting("TWITTER_TOKEN")}`,
                },
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const tweetData = await response.json();
            for (const tweet of tweetData.data) {
                await this.cacheTweet(tweet);
            }
        } catch (error) {
            console.error("Error fetching and caching tweets:", error);
        }
    }

    private async scheduleTweets() {
        try {
            await this.fetchAndCacheTweets();

            const scheduledTweetContent = await generateText({
                runtime: this.runtime,
                context: {
                    text: `This is a scheduled tweet from ${CHARACTER_NAME}`,
                },
                modelClass: ModelClass.SMALL,
            });

            await this.requestQueue.add(
                async () => await this.twitterClient.sendTweet(scheduledTweetContent)
            );
        } catch (error) {
            console.error("Error scheduling tweets:", error);
        }
    }

    private async runBot() {
        while (true) {
            try {
                // Fetch and cache tweets
                await this.fetchAndCacheTweets();

                // Generate new tweet
                await this.generateNewTweet();

                // Schedule tweets
                await this.scheduleTweets();

                // Wait for a random interval between 2-20 minutes
                const interval = (Math.floor(Math.random() * (20 - 2 + 1)) + 2) * 60 * 1000;
                await new Promise(resolve => setTimeout(resolve, interval));
            } catch (error) {
                console.error("Error in bot loop:", error);
                // Wait 5 minutes before retrying on error
                await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
            }
        }
    }
}

// Export a function to create and start the bot
export function createCheshireBot(runtime: IAgentRuntime) {
    return new CheshireBot(runtime);
}
