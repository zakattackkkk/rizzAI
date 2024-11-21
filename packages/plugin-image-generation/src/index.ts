import { elizaLogger } from "@ai16z/eliza";
import {
    Action,
    composeContext,
    generateText,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    Plugin,
    State,
} from "@ai16z/eliza";
import { generateImage } from "@ai16z/eliza";

import fs from "fs";
import path from "path";
import { validateImageGenConfig } from "./enviroment";

const imagePromptTemplate = `# Knowledge
{{knowledge}}

About {{agentName}}:
{{bio}}
{{lore}}
{{postDirections}}

{{providers}}

{{recentPosts}}

# Task: Generate an image description in the voice and style of {{agentName}} according to the previous <user_message>.
Write a two sentence image description that considers the <user_message> and may also include {{adjective}} about {{topic}} (without mentioning {{topic}} directly), from the perspective of {{agentName}}. Try to write something totally different than previous posts. Do not add commentary or acknowledge this request, just write the description of the image to be generated.
Your response should not contain any questions. Brief, concise statements only. No emojis. Use \\n\\n (double spaces) between statements.`;

export function saveBase64Image(base64Data: string, filename: string): string {
    // Create generatedImages directory if it doesn't exist
    const imageDir = path.join(process.cwd(), "generatedImages");
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
    }

    // Remove the data:image/png;base64 prefix if it exists
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");

    // Create a buffer from the base64 string
    const imageBuffer = Buffer.from(base64Image, "base64");

    // Create full file path
    const filepath = path.join(imageDir, `${filename}.png`);

    // Save the file
    fs.writeFileSync(filepath, imageBuffer);

    return filepath;
}

export async function saveHeuristImage(
    imageUrl: string,
    filename: string
): Promise<string> {
    const imageDir = path.join(process.cwd(), "generatedImages");
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
    }

    // Fetch image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Create full file path
    const filepath = path.join(imageDir, `${filename}.png`);

    // Save the file
    fs.writeFileSync(filepath, imageBuffer);

    return filepath;
}

const imageGeneration: Action = {
    name: "GENERATE_IMAGE",
    similes: [
        "IMAGE_GENERATION",
        "IMAGE_GEN",
        "CREATE_IMAGE",
        "MAKE_PICTURE",
        "GENERATE_IMAGE",
        "GENERATE_A",
        "DRAW",
        "DRAW_A",
        "MAKE_A",
    ],
    description: "Generate an image to go along with the message.",
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        await validateImageGenConfig(runtime);

        const anthropicApiKeyOk = !!runtime.getSetting("ANTHROPIC_API_KEY");
        const togetherApiKeyOk = !!runtime.getSetting("TOGETHER_API_KEY");
        const heuristApiKeyOk = !!runtime.getSetting("HEURIST_API_KEY");

        // TODO: Add openai DALL-E generation as well

        return anthropicApiKeyOk || togetherApiKeyOk || heuristApiKeyOk;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        const agentContext = composeContext({
            state,
            template:
                runtime.character.templates?.imagePromptTemplate ||
                imagePromptTemplate,
        });

        const agentImagePrompt = await generateText({
            runtime,
            context: `${agentContext}\n\n<user message>${message.content.text}</user message>`,
            modelClass: ModelClass.SMALL,
        });

        elizaLogger.log("Agent image prompt:", agentImagePrompt);


        //state = (await runtime.composeState(message)) as State;
        const userId = runtime.agentId;
        elizaLogger.log("User ID:", userId);

        const context = `You are an AI assistant specialized in crafting effective prompts for image generation. Your task is to analyze a user's message and create a comprehensive, natural-language prompt that will guide an image generation algorithm to produce high-quality, visually appealing images.\n\nHere is the user's message:\n<user_message> ${agentImagePrompt} </user_message>\n\nBegin by analyzing the content of the user's message. Follow these steps:\n\n1. List out key elements from the user's message, categorizing them to ensure comprehensive coverage:\n   * Topic: The main subject or scene with specific details\n   * Material: The medium or style (e.g., digital painting, 3D render)\n   * Style: The artistic direction (e.g., fantasy, vaporwave)\n   * Artist: Specific artists to influence the visual style\n   * Webpage Influence: Art platforms like ArtStation or DeviantArt for quality enhancement\n   * Sharpness: Terms like "sharp focus" or "highly detailed" for clarity\n   * Extra Details: Descriptors to enhance atmosphere (e.g., cinematic, dystopian)\n   * Shade and Color: Color-related keywords to control mood (e.g., moody lighting)\n   * Lighting and Brightness: Specific lighting styles (e.g., dramatic shadows)\n   * Camera Angle: Perspective and framing (e.g., close-up, wide shot, aerial view)\n   * Composition: Layout guidance (e.g., rule of thirds, centered, dynamic)\n   * Time Period: Temporal context if relevant\n   * Cultural Elements: Any specific cultural influences\n   * Textures: Surface quality descriptions\n   * Weather/Atmosphere: Environmental conditions if applicable\n   * Negative Prompts: Elements to exclude from the image\n\n2. Brainstorm complementary elements that would enhance the user's vision:\n   * Suggest fitting artists and styles if not specified\n   * Consider atmospheric elements that would strengthen the concept\n   * Identify potential technical aspects that would improve the result\n   * Note any elements that should be avoided to maintain the desired look\n\n3. Construct your final prompt by:\n   * Leading with the most important scene/subject details from the user's message\n   * Incorporating all relevant technical and stylistic elements\n   * Grouping related concepts together naturally\n   * Maintaining clear, flowing language throughout\n   * Adding complementary details that enhance but don't alter the core concept\n   * Concluding with negative prompts separated by a "Negative:" marker\n\nRemember:\n- Preserve ALL specific details from the user's original message\n- Don't force details into a rigid template\n- Create a cohesive, readable description\n- Keep the focus on the user's core concept while enhancing it with technical and artistic refinements\n\nYour output should contain ONLY the final prompt text, with no additional explanations, tags, or formatting.`;

        const imagePrompt = await generateText({
            runtime,
            context,
            modelClass: ModelClass.SMALL,
        });
        elizaLogger.log("Image prompt received:", imagePrompt);

        const res: { image: string; caption: string }[] = [];

        elizaLogger.log("Generating image with prompt:", imagePrompt);
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
                const image = images.data[i];

                // Save the image and get filepath
                const filename = `generated_${Date.now()}_${i}`;

                // Choose save function based on image data format
                const filepath = image.startsWith("http")
                    ? await saveHeuristImage(image, filename)
                    : saveBase64Image(image, filename);

                elizaLogger.log(`Processing image ${i + 1}:`, filename);

                //just dont even add a caption or a description just have it generate & send
                /*
                try {
                    const imageService = runtime.getService(ServiceType.IMAGE_DESCRIPTION);
                    if (imageService && typeof imageService.describeImage === 'function') {
                        const caption = await imageService.describeImage({ imageUrl: filepath });
                        captionText = caption.description;
                        captionTitle = caption.title;
                    }
                } catch (error) {
                    elizaLogger.error("Caption generation failed, using default caption:", error);
                }*/

                //const caption = "...";
                /*= await generateCaption(
                    {
                        imageUrl: image,
                    },
                    runtime
                );*/

                res.push({ image: filepath, caption: agentImagePrompt }); //caption.title });

                elizaLogger.log(
                    `Generated caption for image ${i + 1}:`,
                    agentImagePrompt //caption.title
                );
                //res.push({ image: image, caption: caption.title });

                callback(
                    {
                        text: agentImagePrompt, //caption.description,
                        attachments: [
                            {
                                id: crypto.randomUUID(),
                                url: filepath,
                                title: "Generated image",
                                source: "imageGeneration",
                                description: imagePrompt, //caption.title,
                                text: agentImagePrompt, //caption.description,
                            },
                        ],
                    },
                    [
                        {
                            attachment: filepath,
                            name: `${filename}.png`,
                        },
                    ]
                );
            }
        } else {
            elizaLogger.error("Image generation failed or returned no data.");
        }
    },
    examples: [
        // TODO: We want to generate images in more abstract ways, not just when asked to generate an image

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
        [
            {
                user: "{{user1}}",
                content: { text: "Show me a picture of you" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Here's a picture of me",
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
