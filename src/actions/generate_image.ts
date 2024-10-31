import { HandlerCallback, IAgentRuntime, Memory, State, Action, ActionExample } from "../core/types.ts";
import { generateImage, generateCaption } from "./image_utils.ts";
export default {
    name: "IMAGE_GEN",
    similes: ["GENERATE_IMAGE", "CREATE_IMAGE", "MAKE_PICTURE"],
    description: "Generate an image based on a prompt",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const anthropicApiKeyOk = !!runtime.getSetting("ANTHROPIC_API_KEY");
        const togetherApiKeyOk = !!runtime.getSetting("TOGETHER_API_KEY");
        return anthropicApiKeyOk && togetherApiKeyOk;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback,
    ) => {
        state = (await runtime.composeState(message)) as State;
        const userId = runtime.agentId;
    
        const imagePrompt = message.content.text;
        const res: { image: string, caption: string }[] = [];
        const images = await generateImage({
            prompt: imagePrompt,
            width: 1024,
            height: 1024,
            count: 1
        }, runtime);
        
        if (images.success && images.data && images.data.length > 0) {
            for(let i = 0; i < images.data.length; i++) {
                const image = images.data[i];
                const caption = await generateCaption({
                    imageUrl: image
                }, runtime);
                if (caption.success) {
                    res.push({image: image, caption: caption.caption});
                } else {
                    console.error("Failed to generate caption for image", image, caption.error);
                    res.push({image: image, caption: "Generated image"});
                }
            }
        }

        // Check if this is a Twitter source
        const isTwitter = message.content.source === "twitter";
        const responseText = `Here's what I generated for "${imagePrompt}": ${res[0]?.caption || ""}`;

        callback(null, {
            success: true,
            data: res,
            content: {
                text: responseText,
                images: res.map(r => r.image),
                source: message.content.source,
                inReplyTo: message.content.inReplyTo,
                action: isTwitter ? "TWEET" : undefined
            }
        });
    },
    examples: [
        [
            {
                user: "{{user1}}", 
                content: {
                    text: "Generate an image of a cat"
                }
            },
            {
                user: "{{user2}}", 
                content: {
                    text: "I'll generate an image of a cat for you",
                    action: "IMAGE_GEN"
                }
            }
        ],
        [
            {
                user: "{{user1}}", 
                content: {
                    text: "Generate an image of a dog"
                }
            },
            {
                user: "{{user2}}", 
                content: {
                    text: "Creating an image of a dog now",
                    action: "IMAGE_GEN"
                }
            }
        ],
        [
            {
                user: "{{user1}}", 
                content: {
                    text: "Create an image of a cat with a hat"
                }
            },
            {
                user: "{{user2}}", 
                content: {
                    text: "I'll generate that image of a cat wearing a hat",
                    action: "IMAGE_GEN"
                }
            }
        ],
        [
            {
                user: "{{user1}}", 
                content: {
                    text: "Make an image of a dog with a hat"
                }
            },
            {
                user: "{{user2}}", 
                content: {
                    text: "Generating an image of a dog wearing a hat",
                    action: "IMAGE_GEN"
                }
            }
        ],
        [
            {
                user: "{{user1}}", 
                content: {
                    text: "Paint an image of a cat with a hat"
                }
            },
            {
                user: "{{user2}}", 
                content: {
                    text: "I'll create that image of a cat with a hat for you",
                    action: "IMAGE_GEN"
                }
            }
        ]
    ] as ActionExample[][],
} as Action;