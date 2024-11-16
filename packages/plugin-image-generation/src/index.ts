import { elizaLogger } from "@ai16z/eliza/src/logger.ts";
import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    Plugin,
    State,
} from "@ai16z/eliza/src/types.ts";
import { generateCaption, generateImage } from "@ai16z/eliza/src/generation.ts";
import fs from 'fs';
import path from 'path';

// Helper function to save base64 images
function saveBase64Image(base64Data: string, filename: string): string {
    // Create generatedImages directory if it doesn't exist
    const imageDir = path.join(process.cwd(), 'generatedImages');
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
    }

    // Remove the data:image/png;base64 prefix if it exists
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');

    // Create a buffer from the base64 string
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // Create full file path
    const filepath = path.join(imageDir, `${filename}.png`);

    // Save the file
    fs.writeFileSync(filepath, imageBuffer);

    return filepath;
}

const imageGeneration: Action = {
    name: "GENERATE_IMAGE",
    similes: ["IMAGE_GENERATION", "IMAGE_GEN", "CREATE_IMAGE", "MAKE_PICTURE"],
    description: "Generate an image to go along with the message.",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const openAiKeyOk = !!runtime.getSetting("OPENAI_API_KEY");
        return openAiKeyOk;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        elizaLogger.log("Composing state for message:", message);
        state = (await runtime.composeState(message)) as State;
        const userId = runtime.agentId;
        elizaLogger.log("User ID:", userId);

        // Extract image prompt from the message content
        const imagePrompt = message.content.text;
        elizaLogger.log("Image prompt received:", imagePrompt);

        const res: { image: string; caption: string }[] = [];

        elizaLogger.log("Attempting image generation with prompt:", imagePrompt);
        const images = await generateImage(
            {
                prompt: imagePrompt,
                width: 1024,
                height: 1024,
                count: 1,
            },
            runtime
        );

        if (images.success && images.data && images.data.length > 0) {
            elizaLogger.log(
                "Image generation successful, number of images:",
                images.data.length
            );

            for (let i = 0; i < images.data.length; i++) {
                const base64Image = images.data[i];
                // Save the image and get filepath
                const filename = `generated_${Date.now()}_${i}`;
                const filepath = saveBase64Image(base64Image, filename);
                elizaLogger.log(`Processing image ${i + 1}:`, filename);

                res.push({ image: filepath, caption: "Generated image" });

                callback(
                    {
                        text: "Here's your generated image",
                        attachments: [
                            {
                                id: crypto.randomUUID(),
                                url: filepath,
                                title: "Generated image",
                                source: "imageGeneration",
                                description: "AI generated image",
                                text: imagePrompt,
                            },
                        ],
                    },
                    [
                        {
                            attachment: filepath,
                            name: `${filename}.png`
                        }
                    ]
                );
            }
        } else {
            const errorMessage = images.error ?
                `Image generation failed: ${images.error.message}` :
                "Image generation failed or returned no data.";
            elizaLogger.error(`Failed to generate image. Prompt: "${imagePrompt}". Error: ${errorMessage}`);
            callback(
                {
                    text: errorMessage,
                    error: true
                },
                []
            );
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Generate an image of a cat" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Here's an image of a cat",
                    action: "GENERATE_IMAGE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Generate an image of a dog" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Here's an image of a dog",
                    action: "GENERATE_IMAGE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Create an image of a cat with a hat" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Here's an image of a cat with a hat",
                    action: "GENERATE_IMAGE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Make an image of a dog with a hat" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Here's an image of a dog with a hat",
                    action: "GENERATE_IMAGE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Paint an image of a cat with a hat" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Here's an image of a cat with a hat",
                    action: "GENERATE_IMAGE",
                },
            },
        ],
    ],
} as Action;

export const imageGenerationPlugin: Plugin = {
    name: "imageGeneration",
    description: "Generate images",
    actions: [imageGeneration],
    evaluators: [],
    providers: [],
};
