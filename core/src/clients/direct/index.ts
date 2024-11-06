import bodyParser from "body-parser";
import express from "express";
import { composeContext } from "../../core/context.ts";
import { AgentRuntime } from "../../core/runtime.ts";
import { Content, Memory, ModelClass, State } from "../../core/types.ts";
import { stringToUuid } from "../../core/uuid.ts";
import cors from "cors";
import { messageCompletionFooter } from "../../core/parsing.ts";
import multer, { File } from "multer";
import { Request as ExpressRequest } from "express";
import { generateMessageResponse } from "../../core/generation.ts";
import {
    generateCaption,
    generateImage,
} from "../../actions/imageGenerationUtils.ts";
import { embeddingZeroVector } from "../../core/memory.ts";

const upload = multer({ storage: multer.memoryStorage() });

export const messageHandlerTemplate =
    // {{goals}}
    //   `# Action Examples
    // {{actionExamples}}
    // (Action examples are for reference only. Do not use the information from them in your response.)

    `# Task: Generate dialog and actions for the character {{agentName}}.
About {{agentName}}:
{{bio}}
{{lore}}

{{providers}}

{{attachments}}

# Capabilities
Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including images, videos, audio, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

{{messageDirections}}

{{recentMessages}}

{{actions}}

# Instructions: Write the next message for {{agentName}}.
` + messageCompletionFooter;

export interface SimliClientConfig {
    apiKey: string;
    faceID: string;
    handleSilence: boolean;
    videoRef: any;
    audioRef: any;
}
class DirectClient {
    private app: express.Application;
    private agents: Map<string, AgentRuntime>;

    constructor() {
        this.app = express();
        this.app.use(cors());
        this.agents = new Map();

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));

        // Define an interface that extends the Express Request interface
        interface CustomRequest extends ExpressRequest {
            file: File;
        }

        // Update the route handler to use CustomRequest instead of express.Request
        this.app.post(
            "/:agentId/whisper",
            upload.single("file"),
            async (req: CustomRequest, res: express.Response) => {
                const audioFile = req.file; // Access the uploaded file using req.file
                const agentId = req.params.agentId;

                if (!audioFile) {
                    res.status(400).send("No audio file provided");
                    return;
                }

                let runtime = this.agents.get(agentId);

                // if runtime is null, look for runtime with the same name
                if (!runtime) {
                    runtime = Array.from(this.agents.values()).find(
                        (a) =>
                            a.character.name.toLowerCase() ===
                            agentId.toLowerCase()
                    );
                }

                if (!runtime) {
                    res.status(404).send("Agent not found");
                    return;
                }

                const formData = new FormData();
                const audioBlob = new Blob([audioFile.buffer], {
                    type: audioFile.mimetype,
                });
                formData.append("file", audioBlob, audioFile.originalname);
                formData.append("model", "whisper-1");

                const response = await fetch(
                    "https://api.openai.com/v1/audio/transcriptions",
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${runtime.token}`,
                        },
                        body: formData,
                    }
                );

                const data = await response.json();
                res.json(data);
            }
        );

        this.app.post(
            "/:agentId/message",
            async (req: express.Request, res: express.Response) => {
                // message handler filled by callback function on actions
                const messages = [];
                const sendMessageInChunks = async (content, id) => {
                    messages.push({
                        text: content.text,
                        content: content,
                        message_id: id,
                    });
                    return messages;
                };

                try {
                    const agentId = req.params.agentId;
                    const roomId = stringToUuid(
                        req.body.roomId ?? "default-room-" + agentId
                    );
                    const messageId = crypto.randomUUID();
                    const userId = stringToUuid(req.body.userId ?? "user");

                    let runtime = this.agents.get(agentId);

                    // if runtime is null, look for runtime with the same name
                    if (!runtime) {
                        runtime = Array.from(this.agents.values()).find(
                            (a) =>
                                a.character.name.toLowerCase() ===
                                agentId.toLowerCase()
                        );
                    }

                    if (!runtime) {
                        res.status(404).send({
                            success: false,
                            error: "Agent not found",
                        });
                        return;
                    }

                    await runtime.ensureConnection(
                        userId,
                        roomId,
                        req.body.userName,
                        req.body.name,
                        "direct"
                    );

                    const text = req.body.text;

                    const content: Content = {
                        text,
                        attachments: [],
                        source: "direct",
                        inReplyTo: undefined,
                    };

                    const userMessage = {
                        content,
                        userId,
                        roomId,
                        agentId: runtime.agentId,
                    };

                    const memory: Memory = {
                        id: messageId,
                        agentId: runtime.agentId,
                        userId,
                        roomId,
                        content,
                        createdAt: Date.now(),
                    };

                    await runtime.messageManager.createMemory(memory);

                    // Update state with the new memory
                    let state = await runtime.composeState(memory);
                    state = await runtime.updateRecentMessageState(state);

                    const context = composeContext({
                        state,
                        template: messageHandlerTemplate,
                    });

                    const responseContent = await generateMessageResponse({
                        runtime: runtime,
                        context,
                        modelClass: ModelClass.SMALL,
                    });

                    // save response to memory
                    const responseMessage = {
                        ...userMessage,
                        userId: runtime.agentId,
                        content: responseContent,
                    };

                    await runtime.messageManager.createMemory(responseMessage);

                    if (!responseContent || !responseContent.text) {
                        res.json({
                            success: false,
                            error: "No response generated",
                        });
                        return;
                    }

                    // Send response collecting chunks
                    const callback = async (content: Content) => {
                        const sentMessages = await sendMessageInChunks(
                            content,
                            messageId
                        );

                        const memories: Memory[] = [];

                        // Create memories for each sent message
                        for (let i = 0; i < sentMessages.length; i++) {
                            const sentMessage = sentMessages[i];
                            const isLastMessage = i === sentMessages.length - 1;

                            const memory: Memory = {
                                id: stringToUuid(
                                    sentMessage.message_id.toString() +
                                        "-" +
                                        runtime.agentId
                                ),
                                agentId: runtime.agentId,
                                userId,
                                roomId,
                                content: {
                                    ...content,
                                    text: sentMessage.text,
                                    action: !isLastMessage
                                        ? "CONTINUE"
                                        : content.action,
                                    inReplyTo: messageId,
                                },
                                createdAt: sentMessage.date * 1000,
                                embedding: embeddingZeroVector,
                            };

                            await runtime.messageManager.createMemory(memory);
                            memories.push(memory);
                        }

                        return memories;
                    };

                    // Execute callback to send messages and log memories
                    const responseMessages = await callback(responseContent);

                    // Update state after response
                    state = await runtime.updateRecentMessageState(state);
                    await runtime.evaluate(memory, state);
                    console.log("✅ Message handled successfully");
                    console.log("📝 Response:", responseMessages);
                    // Handle any resulting actions
                    await runtime.processActions(
                        memory,
                        responseMessages,
                        state,
                        callback
                    );
                } catch (error) {
                    console.error("❌ Error handling message:", error);
                    res.json({
                        success: false,
                        error:
                            error.message ||
                            "Sorry, I encountered an error while processing your request.",
                    });
                } finally {
                    res.json({ success: true, data: messages });
                }
            }
        );

        this.app.post(
            "/:agentId/image",
            async (req: express.Request, res: express.Response) => {
                const agentId = req.params.agentId;
                const agent = this.agents.get(agentId);
                if (!agent) {
                    res.status(404).send("Agent not found");
                    return;
                }

                const images = await generateImage({ ...req.body }, agent);
                const imagesRes: { image: string; caption: string }[] = [];
                if (images.data && images.data.length > 0) {
                    for (let i = 0; i < images.data.length; i++) {
                        const caption = await generateCaption(
                            { imageUrl: images.data[i] },
                            agent
                        );
                        imagesRes.push({
                            image: images.data[i],
                            caption: caption.title,
                        });
                    }
                }
                res.json({ images: imagesRes });
            }
        );
    }

    public registerAgent(runtime: AgentRuntime) {
        this.agents.set(runtime.agentId, runtime);
    }

    public unregisterAgent(runtime: AgentRuntime) {
        this.agents.delete(runtime.agentId);
    }

    public start(port: number) {
        this.app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}/`);
        });
    }
}

export { DirectClient };
