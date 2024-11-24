import { Cast } from "./agent-farcaster-client/casts.ts";
import fs from "fs";
import { composeContext, elizaLogger } from "@ai16z/eliza";
import { generateMessageResponse, generateShouldRespond } from "@ai16z/eliza";
import { messageCompletionFooter, shouldRespondFooter } from "@ai16z/eliza";
import {
    Content,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
} from "@ai16z/eliza";
import { stringToUuid } from "@ai16z/eliza";
import { ClientBase } from "./base.ts";
import { buildConversationThread, sendTweet, wait } from "./utils.ts";
import { embeddingZeroVector } from "@ai16z/eliza";

export const twitterMessageHandlerTemplate =
    `{{timeline}}

# Knowledge
{{knowledge}}

# Task: Generate a post for the character {{agentName}}.
About {{agentName}} (@{{farcasterUserName}}):
{{bio}}
{{lore}}
{{topics}}

{{providers}}

{{characterPostExamples}}

{{postDirections}}

Recent interactions between {{agentName}} and other users:
{{recentPostInteractions}}

{{recentPosts}}


# Task: Generate a post/reply in the voice, style and perspective of {{agentName}} (@{{farcasterUserName}}) while using the thread of tweets as additional context:
Current Post:
{{currentPost}}
Thread of Tweets You Are Replying To:

{{formattedConversation}}

{{actions}}

# Task: Generate a post in the voice, style and perspective of {{agentName}} (@{{farcasterUserName}}). Include an action, if appropriate. {{actionNames}}:
{{currentPost}}
` + messageCompletionFooter;

export const twitterShouldRespondTemplate =
    `# INSTRUCTIONS: Determine if {{agentName}} (@{{farcasterUserName}}) should respond to the message and participate in the conversation. Do not comment. Just respond with "true" or "false".

Response options are RESPOND, IGNORE and STOP .

{{agentName}} should respond to messages that are directed at them, or participate in conversations that are interesting or relevant to their background, IGNORE messages that are irrelevant to them, and should STOP if the conversation is concluded.

{{agentName}} is in a room with other users and wants to be conversational, but not annoying.
{{agentName}} should RESPOND to messages that are directed at them, or participate in conversations that are interesting or relevant to their background.
If a message is not interesting or relevant, {{agentName}} should IGNORE.
Unless directly RESPONDing to a user, {{agentName}} should IGNORE messages that are very short or do not contain much information.
If a user asks {{agentName}} to stop talking, {{agentName}} should STOP.
If {{agentName}} concludes a conversation and isn't part of the conversation anymore, {{agentName}} should STOP.

{{recentPosts}}

IMPORTANT: {{agentName}} (aka @{{farcasterUserName}}) is particularly sensitive about being annoying, so if there is any doubt, it is better to IGNORE than to RESPOND.

{{currentPost}}

Thread of Casts You Are Replying To:

{{formattedConversation}}

# INSTRUCTIONS: Respond with [RESPOND] if {{agentName}} should respond, or [IGNORE] if {{agentName}} should not respond to the last message and [STOP] if {{agentName}} should stop participating in the conversation.
` + shouldRespondFooter;

export class FarcasterInteractionClient extends ClientBase {
    onReady() {
        const handleFarcasterInteractionsLoop = () => {
            this.handleFarcasterInteractions();
            setTimeout(
                handleFarcasterInteractionsLoop,
                (Math.floor(Math.random() * (5 - 2 + 1)) + 2) * 60 * 1000
            ); // Random interval between 2-5 minutes
        };
        handleFarcasterInteractionsLoop();
    }

    constructor(runtime: IAgentRuntime) {
        super({
            runtime,
        });
    }

    async handleFarcasterInteractions() {
        elizaLogger.log("Checking Farcaster interactions");
        try {
            // Check for mentions
            const castCandidates = (
                await this.fetchSearchCasts(
                    this.runtime.getSetting("FARCASTER_USERNAME"),
                    10,
                )
            ).tweets;

            // de-duplicate castCandidates with a set
            const uniqueCastCandidates = [...new Set(castCandidates)];

            // Sort cast candidates by ID in ascending order
            uniqueCastCandidates
                .sort((a, b) => a.id.localeCompare(b.id))
                .filter((cast) => cast.userId !== this.farcasterUserFID);

            // for each cast candidate, handle the cast
            for (const cast of uniqueCastCandidates) {
                // console.log("cast:", cast);
                if (
                    !this.lastCheckedCastId ||
                    parseInt(cast.id) > this.lastCheckedCastId
                ) {
                    const conversationId =
                        cast.conversationId + "-" + this.runtime.agentId;

                    const roomId = stringToUuid(conversationId);

                    const userIdUUID = stringToUuid(cast.userId as string);

                    await this.runtime.ensureConnection(
                        userIdUUID,
                        roomId,
                        cast.username,
                        cast.name,
                        "farcaster"
                    );

                    const thread = await buildConversationThread(cast, this);

                    const message = {
                        content: { text: cast.text },
                        agentId: this.runtime.agentId,
                        userId: userIdUUID,
                        roomId,
                    };

                    await this.handleTweet({
                        cast,
                        message,
                        thread,
                    });

                    // Update the last checked cast ID after processing each cast
                    this.lastCheckedCastId = parseInt(cast.id);

                    try {
                        if (this.lastCheckedCastId) {
                            fs.writeFileSync(
                                this.tweetCacheFilePath,
                                this.lastCheckedCastId.toString(),
                                "utf-8"
                            );
                        }
                    } catch (error) {
                        elizaLogger.error(
                            "Error saving latest checked cast ID to file:",
                            error
                        );
                    }
                }
            }

            // Save the latest checked cast ID to the file
            try {
                if (this.lastCheckedCastId) {
                    fs.writeFileSync(
                        this.tweetCacheFilePath,
                        this.lastCheckedCastId.toString(),
                        "utf-8"
                    );
                }
            } catch (error) {
                elizaLogger.error(
                    "Error saving latest checked cast ID to file:",
                    error
                );
            }

            elizaLogger.log("Finished checking Farcaster interactions");
        } catch (error) {
            elizaLogger.error("Error handling Farcaster interactions:", error);
        }
    }

    private async handleTweet({
        cast,
        message,
        thread,
    }: {
        cast: Cast;
        message: Memory;
        thread: Cast[];
    }) {
        if (cast.username === this.runtime.getSetting("FARCASTER_USERNAME")) {
            console.log("skipping cast from bot itself", cast.id);
            // Skip processing if the cast is from the bot itself
            return;
        }

        if (!message.content.text) {
            elizaLogger.log("skipping cast with no text", cast.id);
            return { text: "", action: "IGNORE" };
        }
        elizaLogger.log("handling cast", cast.id);
        const formatTweet = (cast: Cast) => {
            return `ID: ${cast.id} From: ${cast.name} (@${cast.username}) Text: ${cast.text}`;
        };
        const currentPost = formatTweet(cast);

        let homeTimeline = [];
        // read the file if it exists
        if (fs.existsSync("castcache/home_timeline.json")) {
            homeTimeline = JSON.parse(
                fs.readFileSync("castcache/home_timeline.json", "utf-8")
            );
        } else {
            homeTimeline = await this.fetchHomeTimeline(50);
            fs.writeFileSync(
                "castcache/home_timeline.json",
                JSON.stringify(homeTimeline, null, 2)
            );
        }

        console.log("Thread: ", thread);
        const formattedConversation = thread
            .map(
                (cast) => `@${cast.username} (${new Date(
                    cast.timestamp * 1000
                ).toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    month: "short",
                    day: "numeric",
                })}):
        ${cast.text}`
            )
            .join("\n\n");

        console.log("formattedConversation: ", formattedConversation);

        const formattedHomeTimeline =
            `# ${this.runtime.character.name}'s Home Timeline\n\n` +
            homeTimeline
                .map((cast) => {
                    return `ID: ${cast.id}\nFrom: ${cast.name} (@${cast.username})${cast.inReplyToStatusId ? ` In reply to: ${cast.inReplyToStatusId}` : ""}\nText: ${cast.text}\n---\n`;
                })
                .join("\n");

        let state = await this.runtime.composeState(message, {
            farcasterClient: this.farcasterClient,
            farcasterUserName: this.runtime.getSetting("FARCASTER_USERNAME"),
            currentPost,
            formattedConversation,
            timeline: formattedHomeTimeline,
        });

        // check if the cast exists, save if it doesn't
        const tweetId = stringToUuid(cast.id + "-" + this.runtime.agentId);
        const tweetExists =
            await this.runtime.messageManager.getMemoryById(tweetId);

        if (!tweetExists) {
            elizaLogger.log("cast does not exist, saving");
            const userIdUUID = stringToUuid(cast.userId as string);
            const roomId = stringToUuid(cast.conversationId);

            const message = {
                id: tweetId,
                agentId: this.runtime.agentId,
                content: {
                    text: cast.text,
                    url: cast.permanentUrl,
                    inReplyTo: cast.inReplyToStatusId
                        ? stringToUuid(
                              cast.inReplyToStatusId +
                                  "-" +
                                  this.runtime.agentId
                          )
                        : undefined,
                },
                userId: userIdUUID,
                roomId,
                createdAt: cast.timestamp * 1000,
            };
            this.saveRequestMessage(message, state);
        }

        const shouldRespondContext = composeContext({
            state,
            template:
                this.runtime.character.templates
                    ?.twitterShouldRespondTemplate ||
                this.runtime.character?.templates?.shouldRespondTemplate ||
                twitterShouldRespondTemplate,
        });

        console.log("composeContext done");

        const shouldRespond = await generateShouldRespond({
            runtime: this.runtime,
            context: shouldRespondContext,
            modelClass: ModelClass.MEDIUM,
        });

        // Promise<"RESPOND" | "IGNORE" | "STOP" | null> {
        if (shouldRespond !== "RESPOND") {
            elizaLogger.log("Not responding to message");
            return { text: "Response Decision:", action: shouldRespond };
        }

        const context = composeContext({
            state,
            template:
                this.runtime.character.templates
                    ?.twitterMessageHandlerTemplate ||
                this.runtime.character?.templates?.messageHandlerTemplate ||
                twitterMessageHandlerTemplate,
        });

        const response = await generateMessageResponse({
            runtime: this.runtime,
            context,
            modelClass: ModelClass.MEDIUM,
        });

        const removeQuotes = (str: string) =>
            str.replace(/^['"](.*)['"]$/, "$1");

        const stringId = stringToUuid(cast.id + "-" + this.runtime.agentId);

        response.inReplyTo = stringId;

        response.text = removeQuotes(response.text);

        if (response.text) {
            try {
                const callback: HandlerCallback = async (response: Content) => {
                    const memories = await sendTweet(
                        this,
                        response,
                        message.roomId,
                        response.inReplyTo
                    );
                    return memories;
                };

                const responseMessages = await callback(response);

                state = (await this.runtime.updateRecentMessageState(
                    state
                )) as State;

                for (const responseMessage of responseMessages) {
                    if (
                        responseMessage ===
                        responseMessages[responseMessages.length - 1]
                    ) {
                        responseMessage.content.action = response.action;
                    } else {
                        responseMessage.content.action = "CONTINUE";
                    }
                    await this.runtime.messageManager.createMemory(
                        responseMessage
                    );
                }

                await this.runtime.evaluate(message, state);

                await this.runtime.processActions(
                    message,
                    responseMessages,
                    state
                );
                const responseInfo = `Context:\n\n${context}\n\nSelected Post: ${cast.id} - ${cast.username}: ${cast.text}\nAgent's Output:\n${response.text}`;
                // f tweets folder dont exist, create
                if (!fs.existsSync("tweets")) {
                    fs.mkdirSync("tweets");
                }
                const debugFileName = `tweets/tweet_generation_${cast.id}.txt`;
                fs.writeFileSync(debugFileName, responseInfo);
                await wait();
            } catch (error) {
                elizaLogger.error(`Error sending response cast: ${error}`);
            }
        }
    }

    async buildConversationThread(
        cast: Cast,
        maxReplies: number = 10
    ): Promise<Cast[]> {
        const thread: Cast[] = [];
        const visited: Set<string> = new Set();

        async function processThread(currentTweet: Cast, depth: number = 0) {
            console.log("Processing cast:", {
                id: currentTweet.id,
                inReplyToStatusId: currentTweet.inReplyToStatusId,
                depth: depth,
            });

            if (!currentTweet) {
                console.log("No current cast found for thread building");
                return;
            }

            if (depth >= maxReplies) {
                console.log("Reached maximum reply depth", depth);
                return;
            }

            // Handle memory storage
            const memory = await this.runtime.messageManager.getMemoryById(
                stringToUuid(currentTweet.id + "-" + this.runtime.agentId)
            );
            if (!memory) {
                const roomId = stringToUuid(
                    currentTweet.conversationId + "-" + this.runtime.agentId
                );
                const userId = stringToUuid(currentTweet.userId);

                await this.runtime.ensureConnection(
                    userId,
                    roomId,
                    currentTweet.username,
                    currentTweet.name,
                    "farcaster"
                );

                this.runtime.messageManager.createMemory({
                    id: stringToUuid(
                        currentTweet.id + "-" + this.runtime.agentId
                    ),
                    agentId: this.runtime.agentId,
                    content: {
                        text: currentTweet.text,
                        source: "farcaster",
                        url: currentTweet.permanentUrl,
                        inReplyTo: currentTweet.inReplyToStatusId
                            ? stringToUuid(
                                  currentTweet.inReplyToStatusId +
                                      "-" +
                                      this.runtime.agentId
                              )
                            : undefined,
                    },
                    createdAt: currentTweet.timestamp * 1000,
                    roomId,
                    userId:
                        currentTweet.userId === this.twitterUserId
                            ? this.runtime.agentId
                            : stringToUuid(currentTweet.userId),
                    embedding: embeddingZeroVector,
                });
            }

            if (visited.has(currentTweet.id)) {
                elizaLogger.log("Already visited cast:", currentTweet.id);
                return;
            }

            visited.add(currentTweet.id);
            thread.unshift(currentTweet);

            elizaLogger.debug("Current thread state:", {
                length: thread.length,
                currentDepth: depth,
                tweetId: currentTweet.id,
            });

            if (currentTweet.inReplyToStatusId) {
                console.log(
                    "Fetching parent cast:",
                    currentTweet.inReplyToStatusId
                );
                try {
                    const parentTweet = await this.farcasterClient.getTweet(
                        currentTweet.inReplyToStatusId
                    );

                    if (parentTweet) {
                        console.log("Found parent cast:", {
                            id: parentTweet.id,
                            text: parentTweet.text?.slice(0, 50),
                        });
                        await processThread(parentTweet, depth + 1);
                    } else {
                        console.log(
                            "No parent cast found for:",
                            currentTweet.inReplyToStatusId
                        );
                    }
                } catch (error) {
                    console.log("Error fetching parent cast:", {
                        tweetId: currentTweet.inReplyToStatusId,
                        error,
                    });
                }
            } else {
                console.log("Reached end of reply chain at:", currentTweet.id);
            }
        }

        // Need to bind this context for the inner function
        await processThread.bind(this)(cast, 0);

        elizaLogger.debug("Final thread built:", {
            totalTweets: thread.length,
            tweetIds: thread.map((t) => ({
                id: t.id,
                text: t.text?.slice(0, 50),
            })),
        });

        return thread;
    }
}
