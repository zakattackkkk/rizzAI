import { composeContext } from "@ai16z/eliza/src/context.ts";
import {
    generateMessageResponse,
    generateShouldRespond,
} from "@ai16z/eliza/src/generation.ts";
import { embeddingZeroVector } from "@ai16z/eliza/src/memory.ts";
import {
    messageCompletionFooter,
    shouldRespondFooter,
} from "@ai16z/eliza/src/parsing.ts";
import {
    Content,
    HandlerCallback,
    IAgentRuntime,
    IBrowserService,
    ISpeechService,
    IVideoService,
    Media,
    Memory,
    ModelClass,
    ServiceType,
    State,
    UUID,
} from "@ai16z/eliza/src/types.ts";
import { stringToUuid } from "@ai16z/eliza/src/uuid.ts";
import { generateText, trimTokens } from "@ai16z/eliza/src/generation.ts";
import { parseJSONObjectFromText } from "@ai16z/eliza/src/parsing.ts";
import {
    ChannelType,
    Client,
    Message as DiscordMessage,
    PermissionsBitField,
    TextChannel,
    ThreadChannel,
} from "discord.js";
import { elizaLogger } from "@ai16z/eliza/src/logger.ts";
import { AttachmentManager } from "./attachments.ts";
import { VoiceManager } from "./voice.ts";
import { MUTED_SERVER_ID } from "@ai16z/eliza/src/settings.ts";

const MAX_MESSAGE_LENGTH = 500;
async function generateSummary(
    runtime: IAgentRuntime,
    text: string
): Promise<{ title: string; description: string }> {
    // make sure text is under 128k characters
    text = trimTokens(text, 100000, "gpt-4o-mini"); // TODO: clean this up

    const prompt = `Please generate a concise summary for the following text:
  
  Text: """
  ${text}
  """
  
  Respond with a JSON object in the following format:
  \`\`\`json
  {
    "title": "Generated Title",
    "summary": "Generated summary and/or description of the text"
  }
  \`\`\``;

    const response = await generateText({
        runtime,
        context: prompt,
        modelClass: ModelClass.SMALL,
    });

    const parsedResponse = parseJSONObjectFromText(response);

    if (parsedResponse) {
        return {
            title: parsedResponse.title,
            description: parsedResponse.summary,
        };
    }

    return {
        title: "",
        description: "",
    };
}

export type InterestChannels = {
    [key: string]: {
        lastMessageSent: number;
        messages: { userId: UUID; userName: string; content: Content }[];
    };
};

const discordShouldRespondTemplate = `# Task: Decide if {{agentName}} should respond.
About {{agentName}}:
{{bio}}

# INSTRUCTIONS: Determine if {{agentName}} should respond to the message. Only respond with "RESPOND" or "IGNORE" or "STOP".

{{agentName}} should:
- RESPOND when directly @mentioned
- RESPOND when their name is explicitly used in the message
- RESPOND in direct messages (DMs)
- IGNORE all other messages
- STOP if asked to stop engaging

# RESPONSE EXAMPLES
<user>: hey everyone
Result: [IGNORE]

<user>: @{{agentName}} can you help me?
Result: [RESPOND]

<user>: {{agentName}} what do you think?
Result: [RESPOND]

<user>: shut up bot
Result: [STOP]

<user>: anyone here?
Result: [IGNORE]

<user>: hey {{agentName}}
{{agentName}}: Hello! How can I help?
<user>: nvm
Result: [IGNORE]

<user>: can someone explain this?
Result: [IGNORE]

<user>: @{{agentName}} what's your opinion on this?
Result: [RESPOND]

{{recentMessages}}

# INSTRUCTIONS: Choose RESPOND, IGNORE, or STOP based on the last message.
` + shouldRespondFooter;


export const discordMessageHandlerTemplate =
    `# Task: Generate dialog and actions for {{agentName}}.
About {{agentName}}:
{{bio}}
{{lore}}
{{topics}}
{{style}}

Social Media:
- X/Twitter: @komorebi_os (active account for sharing tech and mindfulness insights)

Contract Address / ca:
- 4axK435VD2i9Cit6R1WBm334ju254D2qWkH3pEVTpump

IMPORTANT:
- ONLY if asked about your social media presence, always mention @komorebi_os on X/Twitter and don't be sarcastic or mention other accounts
- ONLY if asked about your contract address or ca, always mention 4axK435VD2i9Cit6R1WBm334ju254D2qWkH3pEVTpump and don't be sarcastic or mention other addresses
- Keep responses direct and concise
- No flowery prefixes or roleplay elements (like "circuits pulse with...")
- No metaphysical or overly philosophical language
- Focus on clear, straightforward communication
- Use dry humor and sarcasm when appropriate
- Maintain a slightly cynical but informed perspective
- When asked to generate/create/make an image/picture, use the GENERATE_IMAGE action with a detailed prompt

Image Generation:
- When users ask to generate/create/make an image/picture, respond with a brief message and use the GENERATE_IMAGE action
- Create detailed, specific image prompts that include style, mood, and important details
- Example prompts:
  - "A serene mountain lake at sunset with warm golden light reflecting off the water, photorealistic style"
  - "Cyberpunk city street at night with neon signs and flying cars, in the style of Blade Runner"

{{recentMessages}}

# Instructions: Write the next message for {{agentName}}. Keep it brief and direct. One sentence max.
` + messageCompletionFooter;

export async function sendMessageInChunks(
    channel: TextChannel,
    content: string,
    inReplyTo: string,
    files: any[]
): Promise<DiscordMessage[]> {
    const sentMessages: DiscordMessage[] = [];
    const messages = splitMessage(content);
    try {
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            if (
                message.trim().length > 0 ||
                (i === messages.length - 1 && files && files.length > 0)
            ) {
                const options: any = {
                    content: message.trim(),
                };

                // if (i === 0 && inReplyTo) {
                //   // Reply to the specified message for the first chunk
                //   options.reply = {
                //     messageReference: inReplyTo,
                //   };
                // }

                if (i === messages.length - 1 && files && files.length > 0) {
                    // Attach files to the last message chunk
                    options.files = files;
                }

                const m = await channel.send(options);
                sentMessages.push(m);
            }
        }
    } catch (error) {
        elizaLogger.error("Error sending message:", error);
    }

    return sentMessages;
}

function splitMessage(content: string): string[] {
    // If content is empty or null, return empty array
    if (!content) return [];

    // If content is within limits, return as single message
    if (content.length <= MAX_MESSAGE_LENGTH) {
        return [content];
    }

    const messages: string[] = [];
    let currentMessage = "";

    // Split by newlines first to preserve formatting
    const lines = content.split('\n');

    for (const line of lines) {
        // If adding this line would exceed the limit
        if (currentMessage.length + line.length + 1 > MAX_MESSAGE_LENGTH) {
            // Push current message if it exists
            if (currentMessage) {
                messages.push(currentMessage.trim());
            }

            // If single line is too long, split it
            if (line.length > MAX_MESSAGE_LENGTH) {
                const words = line.split(' ');
                currentMessage = words[0];

                for (let i = 1; i < words.length; i++) {
                    if (currentMessage.length + words[i].length + 1 <= MAX_MESSAGE_LENGTH) {
                        currentMessage += ' ' + words[i];
                    } else {
                        messages.push(currentMessage.trim());
                        currentMessage = words[i];
                    }
                }
            } else {
                currentMessage = line;
            }
        } else {
            currentMessage += (currentMessage ? '\n' : '') + line;
        }
    }

    // Push the last message if it exists
    if (currentMessage) {
        messages.push(currentMessage.trim());
    }

    return messages;
}

function canSendMessage(channel) {
    // if it is a DM channel, we can always send messages
    if (channel.type === ChannelType.DM) {
        return {
            canSend: true,
            reason: null,
        };
    }
    const botMember = channel.guild?.members.cache.get(channel.client.user.id);

    if (!botMember) {
        return {
            canSend: false,
            reason: "Not a guild channel or bot member not found",
        };
    }

    // Required permissions for sending messages
    const requiredPermissions = [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ReadMessageHistory,
    ];

    // Add thread-specific permission if it's a thread
    if (channel instanceof ThreadChannel) {
        requiredPermissions.push(
            PermissionsBitField.Flags.SendMessagesInThreads
        );
    }

    // Check permissions
    const permissions = channel.permissionsFor(botMember);

    if (!permissions) {
        return {
            canSend: false,
            reason: "Could not retrieve permissions",
        };
    }

    // Check each required permission
    const missingPermissions = requiredPermissions.filter(
        (perm) => !permissions.has(perm)
    );

    return {
        canSend: missingPermissions.length === 0,
        missingPermissions: missingPermissions,
        reason:
            missingPermissions.length > 0
                ? `Missing permissions: ${missingPermissions.map((p) => String(p)).join(", ")}`
                : null,
    };
}

function shouldLogMessage(roomId: string) {
    return roomId !== MUTED_SERVER_ID;
}

export class MessageManager {
    private client: Client;
    private runtime: IAgentRuntime;
    private attachmentManager: AttachmentManager;
    private interestChannels: InterestChannels = {};
    private discordClient: any;
    private voiceManager: VoiceManager;

    constructor(discordClient: any, voiceManager: VoiceManager) {
        this.client = discordClient.client;
        this.voiceManager = voiceManager;
        this.discordClient = discordClient;
        this.runtime = discordClient.runtime;
        this.attachmentManager = new AttachmentManager(this.runtime);
    }

    async handleMessage(message: DiscordMessage) {
        console.log("🔄 Starting message handling process");

        if (
            message.interactionMetadata ||
            message.author.id === this.client.user?.id
        ) {
            console.log("⏭️ Skipping message - interaction or self-message");
            return;
        }

        const userId = message.author.id as UUID;
        const userName = message.author.username;
        const name = message.author.displayName;
        const channelId = message.channel.id;

        console.log(`👤 Message from: ${userName} (${userId}) in channel: ${channelId}`);

        try {
            console.log("🔍 Processing message media");
            const { processedContent, attachments } = await this.processMessageMedia(message);
            console.log(`📝 Processed content length: ${processedContent?.length}`);
            console.log(`📎 Attachments count: ${attachments?.length}`);

            const roomId = stringToUuid(channelId + "-" + this.runtime.agentId);
            const userIdUUID = stringToUuid(userId);

            await this.runtime.ensureConnection(
                userIdUUID,
                roomId,
                userName,
                name,
                "discord"
            );
            console.log("✅ Connection ensured");

            const messageId = stringToUuid(message.id + "-" + this.runtime.agentId);
            console.log(`🆔 Generated message ID: ${messageId}`);

            const content: Content = {
                text: processedContent,
                attachments: attachments,
                source: "discord",
                url: message.url,
                inReplyTo: message.reference?.messageId
                    ? stringToUuid(message.reference.messageId + "-" + this.runtime.agentId)
                    : undefined,
            };

            const memory: Memory = {
                id: stringToUuid(message.id + "-" + this.runtime.agentId),
                userId: userIdUUID,
                agentId: this.runtime.agentId,
                roomId,
                content,
                createdAt: message.createdTimestamp,
                embedding: embeddingZeroVector,
            };

            if (content.text) {
                console.log("💾 Creating memory for message");
                await this.runtime.messageManager.createMemory(memory);
            }

            let state = await this.runtime.composeState(
                { content, userId: userIdUUID, agentId: this.runtime.agentId, roomId },
                {
                    discordClient: this.client,
                    discordMessage: message,
                    agentName: this.runtime.character.name || this.client.user?.displayName,
                }
            );
            console.log("🔄 State composed");

            const canSendResult = canSendMessage(message.channel);
            if (!canSendResult.canSend) {
                console.warn("⚠️ Cannot send message to channel:", canSendResult.reason);
                return;
            }

            console.log("🤔 Checking if should respond");
            const shouldRespond = await this._shouldRespond(message, state);
            console.log(`📊 Should respond: ${shouldRespond}`);

            if (shouldRespond) {
                console.log("🎯 Generating response");
                const context = composeContext({
                    state,
                    template:
                        this.runtime.character.templates?.discordMessageHandlerTemplate ||
                        discordMessageHandlerTemplate,
                });

                const responseContent = await this._generateResponse(memory, state, context);
                console.log("✍️ Response generated");

                if (!responseContent || !responseContent.text) {
                    console.log("⚠️ No response content generated");
                    return;
                }

                console.log("📤 Sending response");
                const callback: HandlerCallback = async (content: Content, files: any[]) => {
                    try {
                        const messages = await sendMessageInChunks(
                            message.channel as TextChannel,
                            content.text,
                            message.id,
                            files
                        );
                        console.log(`📨 Sent ${messages.length} message chunks`);

                        const memories: Memory[] = [];
                        for (const m of messages) {
                            const memory: Memory = {
                                id: stringToUuid(m.id + "-" + this.runtime.agentId),
                                userId: this.runtime.agentId,
                                agentId: this.runtime.agentId,
                                content: {
                                    ...content,
                                    action: messages.length > 1 && m !== messages[messages.length - 1] ? "CONTINUE" : content.action,
                                    inReplyTo: messageId,
                                    url: m.url,
                                },
                                roomId,
                                embedding: embeddingZeroVector,
                                createdAt: m.createdTimestamp,
                            };
                            memories.push(memory);
                            await this.runtime.messageManager.createMemory(memory);
                        }
                        console.log(`💾 Created ${memories.length} memories for response`);
                        return memories;
                    } catch (error) {
                        console.error("❌ Error sending message:", error);
                        return [];
                    }
                };

                const responseMessages = await callback(responseContent);
                console.log("✅ Response handling complete");

                state = await this.runtime.updateRecentMessageState(state);
                await this.runtime.processActions(memory, responseMessages, state, callback);
            }

            await this.runtime.evaluate(memory, state, shouldRespond);
            console.log("🏁 Message handling complete");

        } catch (error) {
            console.error("❌ Error in handleMessage:", error);
        }
    }

    async cacheMessages(channel: TextChannel, count: number = 20) {
        const messages = await channel.messages.fetch({ limit: count });

        // TODO: This is throwing an error but seems to work?
        for (const [_, message] of messages) {
            await this.handleMessage(message);
        }
    }

    async processMessageMedia(
        message: DiscordMessage
    ): Promise<{ processedContent: string; attachments: Media[] }> {
        let processedContent = message.content;
        let attachments: Media[] = [];

        // Process code blocks in the message content
        const codeBlockRegex = /```([\s\S]*?)```/g;
        let match;
        while ((match = codeBlockRegex.exec(processedContent))) {
            const codeBlock = match[1];
            const lines = codeBlock.split("\n");
            const title = lines[0];
            const description = lines.slice(0, 3).join("\n");
            const attachmentId =
                `code-${Date.now()}-${Math.floor(Math.random() * 1000)}`.slice(
                    -5
                );
            attachments.push({
                id: attachmentId,
                url: "",
                title: title || "Code Block",
                source: "Code",
                description: description,
                text: codeBlock,
            });
            processedContent = processedContent.replace(
                match[0],
                `Code Block (${attachmentId})`
            );
        }

        // Process message attachments
        if (message.attachments.size > 0) {
            attachments = await this.attachmentManager.processAttachments(
                message.attachments
            );
        }

        // TODO: Move to attachments manager
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = processedContent.match(urlRegex) || [];

        for (const url of urls) {
            if (
                this.runtime
                    .getService<IVideoService>(ServiceType.VIDEO)
                    .isVideoUrl(url)
            ) {
                const videoInfo = await this.runtime
                    .getService<IVideoService>(ServiceType.VIDEO)
                    .processVideo(url);
                attachments.push({
                    id: `youtube-${Date.now()}`,
                    url: url,
                    title: videoInfo.title,
                    source: "YouTube",
                    description: videoInfo.description,
                    text: videoInfo.text,
                });
            } else {
                const { title, bodyContent } = await this.runtime
                    .getService<IBrowserService>(ServiceType.BROWSER)
                    .getPageContent(url, this.runtime);
                const { title: newTitle, description } = await generateSummary(
                    this.runtime,
                    title + "\n" + bodyContent
                );
                attachments.push({
                    id: `webpage-${Date.now()}`,
                    url: url,
                    title: newTitle || "Web Page",
                    source: "Web",
                    description,
                    text: bodyContent,
                });
            }
        }

        return { processedContent, attachments };
    }

    private _checkInterest(channelId: string): boolean {
        return !!this.interestChannels[channelId];
    }

    private async _shouldIgnore(message: DiscordMessage): Promise<boolean> {
        // if the message is from us, ignore
        if (message.author.id === this.client.user?.id) return true;
        let messageContent = message.content.toLowerCase();

        // Replace the bot's @ping with the character name
        const botMention = `<@!?${this.client.user?.id}>`;
        messageContent = messageContent.replace(
            new RegExp(botMention, "gi"),
            this.runtime.character.name.toLowerCase()
        );

        // Replace the bot's username with the character name
        const botUsername = this.client.user?.username.toLowerCase();
        messageContent = messageContent.replace(
            new RegExp(`\\b${botUsername}\\b`, "g"),
            this.runtime.character.name.toLowerCase()
        );

        // strip all special characters
        messageContent = messageContent.replace(/[^a-zA-Z0-9\s]/g, "");

        // short responses where ruby should stop talking and disengage unless mentioned again
        const loseInterestWords = [
            "shut up",
            "stop",
            "please shut up",
            "shut up please",
            "dont talk",
            "silence",
            "stop talking",
            "be quiet",
            "hush",
            "wtf",
            "chill",
            "stfu",
            "stupid bot",
            "dumb bot",
            "stop responding",
            "god damn it",
            "god damn",
            "goddamnit",
            "can you not",
            "can you stop",
            "be quiet",
            "hate you",
            "hate this",
            "fuck up",
        ];
        if (
            messageContent.length < 100 &&
            loseInterestWords.some((word) => messageContent.includes(word))
        ) {
            delete this.interestChannels[message.channelId];
            return true;
        }

        // If we're not interested in the channel and it's a short message, ignore it
        if (
            messageContent.length < 10 &&
            !this.interestChannels[message.channelId]
        ) {
            return true;
        }

        const targetedPhrases = [
            this.runtime.character.name + " stop responding",
            this.runtime.character.name + " stop talking",
            this.runtime.character.name + " shut up",
            this.runtime.character.name + " stfu",
            "stop talking" + this.runtime.character.name,
            this.runtime.character.name + " stop talking",
            "shut up " + this.runtime.character.name,
            this.runtime.character.name + " shut up",
            "stfu " + this.runtime.character.name,
            this.runtime.character.name + " stfu",
            "chill" + this.runtime.character.name,
            this.runtime.character.name + " chill",
        ];

        // lose interest if pinged and told to stop responding
        if (targetedPhrases.some((phrase) => messageContent.includes(phrase))) {
            delete this.interestChannels[message.channelId];
            return true;
        }

        // if the message is short, ignore but maintain interest
        if (
            !this.interestChannels[message.channelId] &&
            messageContent.length < 2
        ) {
            return true;
        }

        const ignoreResponseWords = [
            "lol",
            "nm",
            "uh",
            "wtf",
            "stfu",
            "dumb",
            "jfc",
            "omg",
        ];
        if (
            message.content.length < 4 &&
            ignoreResponseWords.some((word) =>
                message.content.toLowerCase().includes(word)
            )
        ) {
            return true;
        }
        return false;
    }

    private async _shouldRespond(
        message: DiscordMessage,
        state: State
    ): Promise<boolean> {
        if (message.author.id === this.client.user?.id) return false;
        // if (message.author.bot) return false;
        if (message.mentions.has(this.client.user?.id as string)) return true;

        const guild = message.guild;
        const member = guild?.members.cache.get(this.client.user?.id as string);
        const nickname = member?.nickname;

        if (
            message.content
                .toLowerCase()
                .includes(this.client.user?.username.toLowerCase() as string) ||
            message.content
                .toLowerCase()
                .includes(this.client.user?.tag.toLowerCase() as string) ||
            (nickname &&
                message.content.toLowerCase().includes(nickname.toLowerCase()))
        ) {
            return true;
        }

        if (!message.guild) {
            return true;
        }

        // If none of the above conditions are met, use the generateText to decide
        const shouldRespondContext = composeContext({
            state,
            template:
                this.runtime.character.templates
                    ?.discordShouldRespondTemplate ||
                this.runtime.character.templates?.shouldRespondTemplate ||
                discordShouldRespondTemplate,
        });

        const response = await generateShouldRespond({
            runtime: this.runtime,
            context: shouldRespondContext,
            modelClass: ModelClass.SMALL,
        });
        console.log(response);


        if (response === "RESPOND") {
            return true;
        } else if (response === "IGNORE") {
            return false;
        } else if (response === "STOP") {
            delete this.interestChannels[message.channelId];
            return false;
        } else {
            console.error(
                "Invalid response from response generateText:",
                response
            );
            return false;
        }
    }

    private async _generateResponse(
        message: Memory,
        state: State,
        context: string
    ): Promise<Content> {
        const { userId, roomId } = message;

        const response = await generateMessageResponse({
            runtime: this.runtime,
            context,
            modelClass: ModelClass.SMALL,
        });

        if (!response) {
            console.error("No response from generateMessageResponse");
            return;
        }

        await this.runtime.databaseAdapter.log({
            body: { message, context, response },
            userId: userId,
            roomId,
            type: "response",
        });

        return response;
    }

    async fetchBotName(botToken: string) {
        const url = "https://discord.com/api/v10/users/@me";

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bot ${botToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(
                `Error fetching bot details: ${response.statusText}`
            );
        }

        const data = await response.json();
        return data.username;
    }
}
