import { SearchMode, Tweet } from "agent-twitter-client";
import fs from "fs";
import { composeContext } from "@ai16z/eliza/src/context.ts";
import {
    generateMessageResponse,
    generateShouldRespond,
} from "@ai16z/eliza/src/generation.ts";
import {
    messageCompletionFooter,
    shouldRespondFooter,
} from "@ai16z/eliza/src/parsing.ts";
import {
    Content,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
} from "@ai16z/eliza";
import { stringToUuid } from "@ai16z/eliza/src/uuid.ts";
import { ClientBase } from "./base.ts";
import { buildConversationThread, sendTweet, wait } from "./utils.ts";

export const twitterMessageHandlerTemplate =
    `{{timeline}}

# Knowledge
{{knowledge}}

# Task: Generate a post for the character {{agentName}}.
About {{agentName}} (@{{twitterUserName}}):
{{bio}}
{{lore}}
{{topics}}

{{providers}}

{{characterPostExamples}}

{{postDirections}}

Recent interactions between {{agentName}} and other users:
{{recentPostInteractions}}

{{recentPosts}}

# Task: Generate a post in the voice, style and perspective of {{agentName}} (@{{twitterUserName}}):
{{currentPost}}

` + messageCompletionFooter;

export const twitterShouldRespondTemplate =
    `# INSTRUCTIONS: Determine if {{agentName}} (@{{twitterUserName}}) should respond to the message and participate in the conversation. Do not comment. Just respond with "true" or "false".

Response options are RESPOND, IGNORE and STOP.

{{agentName}} should respond to messages that are directed at them, or participate in conversations that are interesting or relevant to their background, IGNORE messages that are irrelevant to them, and should STOP if the conversation is concluded.

{{agentName}} is in a room with other users and wants to be conversational, but not annoying.
{{agentName}} should RESPOND to messages that are directed at them, or participate in conversations that are interesting or relevant to their background.
If a message is not interesting or relevant, {{agentName}} should IGNORE.
Unless directly RESPONDing to a user, {{agentName}} should IGNORE messages that are very short or do not contain much information.
If a user asks {{agentName}} to stop talking, {{agentName}} should STOP.
If {{agentName}} concludes a conversation and isn't part of the conversation anymore, {{agentName}} should STOP.

{{recentPosts}}

IMPORTANT: {{agentName}} (aka @{{twitterUserName}}) is particularly sensitive about being annoying, so if there is any doubt, it is better to IGNORE than to RESPOND.

{{currentPost}}

# INSTRUCTIONS: Respond with [RESPOND] if {{agentName}} should respond, or [IGNORE] if {{agentName}} should not respond to the last message and [STOP] if {{agentName}} should stop participating in the conversation.
` + shouldRespondFooter;

export class TwitterInteractionClient extends ClientBase {
    onReady() {
        const handleTwitterInteractionsLoop = async () => {
            try {
                await this.handleTwitterInteractions();
            } catch (error) {
                console.error("Error in Twitter interaction loop:", error);
            } finally {
                setTimeout(
                    handleTwitterInteractionsLoop,
                    (Math.floor(Math.random() * (5 - 2 + 1)) + 2) * 60 * 1000 // Random interval between 2-5 minutes
                );
            }
        };
        handleTwitterInteractionsLoop();
    }

    constructor(runtime: IAgentRuntime) {
        super({ runtime });
    }

    async handleTwitterInteractions() {
        try {
            const tweets = await this.fetchSearchTweets(
                `@${this.runtime.getSetting("TWITTER_USERNAME")}`,
                20,
                SearchMode.Latest
            );
            const tweetCandidates = this.filterValidTweets(tweets.tweets);
            const groupedTweets =
                this.groupTweetsByConversation(tweetCandidates);

            for (const [conversationId, tweets] of Object.entries(
                groupedTweets
            )) {
                await this.handleConversation(conversationId, tweets);
            }
        } catch (error) {
            console.error("Error while handling Twitter interactions:", error);
        }
    }

    filterValidTweets(tweets: Tweet[]): Tweet[] {
        const seenIds = new Set();
        return tweets
            .filter(
                (tweet) =>
                    tweet.userId !== this.twitterUserId && // Exclude bot's tweets
                    tweet.text && // Exclude empty tweets
                    !seenIds.has(tweet.id) // Exclude duplicate tweets
            )
            .map((tweet) => {
                seenIds.add(tweet.id);
                return tweet;
            });
    }

    groupTweetsByConversation(tweets: Tweet[]): Record<string, Tweet[]> {
        return tweets.reduce((acc, tweet) => {
            const key = `${tweet.conversationId}-${this.runtime.agentId}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(tweet);
            return acc;
        }, {});
    }

    async handleConversation(conversationId: string, tweets: Tweet[]) {
        try {
            const roomId = stringToUuid(conversationId);
            for (const tweet of tweets) {
                const userIdUUID = stringToUuid(tweet.userId as string);

                await this.runtime.ensureConnection(
                    userIdUUID,
                    roomId,
                    tweet.username,
                    tweet.name,
                    "twitter"
                );

                const message = {
                    content: { text: tweet.text },
                    agentId: this.runtime.agentId,
                    userId: userIdUUID,
                    roomId,
                };

                await this.handleTweet({ tweet, message });
                this.updateLastCheckedTweetId(tweet.id);
            }
        } catch (error) {
            console.error(
                `Error processing conversation ${conversationId}:`,
                error
            );
        }
    }

    async handleTweet({ tweet, message }: { tweet: Tweet; message: Memory }) {
        if (tweet.username === this.runtime.getSetting("TWITTER_USERNAME")) {
            return;
        }

        if (!message.content.text) {
            return;
        }

        const context = await this.composeTweetContext(tweet, message);

        const shouldRespond = await this.evaluateShouldRespond(context);
        if (!shouldRespond) {
            return;
        }

        const response = await this.generateResponse(context);
        if (response?.text) {
            await this.sendTweetResponse(tweet, response, message.roomId);
        }
    }

    async composeTweetContext(tweet: Tweet, message: Memory): Promise<State> {
        const formattedTimeline = await this.getFormattedTimeline();
        const currentPost = this.formatTweet(tweet);

        return this.runtime.composeState(message, {
            twitterClient: this.twitterClient,
            twitterUserName: this.runtime.getSetting("TWITTER_USERNAME"),
            currentPost,
            timeline: formattedTimeline,
        });
    }

    async evaluateShouldRespond(context: State): Promise<boolean> {
        const shouldRespondContext = composeContext({
            state: context,
            template:
                this.runtime.character.templates
                    ?.twitterShouldRespondTemplate ||
                twitterShouldRespondTemplate,
        });

        const result = await generateShouldRespond({
            runtime: this.runtime,
            context: shouldRespondContext,
            modelClass: ModelClass.SMALL,
        });

        return result === "RESPOND";
    }

    async generateResponse(context: State): Promise<Content> {
        const responseContext = composeContext({
            state: context,
            template:
                this.runtime.character.templates
                    ?.twitterMessageHandlerTemplate ||
                twitterMessageHandlerTemplate,
        });

        return await generateMessageResponse({
            runtime: this.runtime,
            context: responseContext,
            modelClass: ModelClass.SMALL,
        });
    }

    async sendTweetResponse(tweet: Tweet, response: Content, roomId: string) {
        try {
            const memories = await sendTweet(
                this,
                response,
                roomId,
                this.runtime.getSetting("TWITTER_USERNAME"),
                tweet.id
            );

            for (const memory of memories) {
                await this.runtime.messageManager.createMemory(memory);
            }
        } catch (error) {
            console.error(
                `Error sending tweet response to ${tweet.id}:`,
                error
            );
        }
    }

    formatTweet(tweet: Tweet): string {
        return `ID: ${tweet.id}\nFrom: ${tweet.name} (@${tweet.username})\nText: ${tweet.text}`;
    }

    async getFormattedTimeline(): Promise<string> {
        try {
            let homeTimeline = [];
            const cacheFile = "tweetcache/home_timeline.json";

            if (fs.existsSync(cacheFile)) {
                homeTimeline = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
            } else {
                homeTimeline = await this.fetchHomeTimeline(50);
                fs.writeFileSync(
                    cacheFile,
                    JSON.stringify(homeTimeline, null, 2)
                );
            }

            return homeTimeline
                .map((tweet) => this.formatTweet(tweet))
                .join("\n---\n");
        } catch (error) {
            console.error("Error fetching or formatting home timeline:", error);
            return "Error loading timeline.";
        }
    }

    updateLastCheckedTweetId(tweetId: string) {
        this.lastCheckedTweetId = parseInt(tweetId, 10);
        fs.writeFileSync(
            this.tweetCacheFilePath,
            this.lastCheckedTweetId.toString(),
            "utf-8"
        );
    }
}
