import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

async function main() {
    try {
        // Import the built Discord client
        const { startDiscord } = await import('../packages/client-discord/dist/index.js');

        // Mock models configuration
        const mockModels = {
            openai: {
                endpoint: "https://api.openai.com/v1",
                settings: {
                    stop: [],
                    maxInputTokens: 128000,
                    maxOutputTokens: 8192,
                    frequency_penalty: 0.0,
                    presence_penalty: 0.0,
                    temperature: 0.6,
                },
                model: {
                    small: 'gpt-4',
                    medium: 'gpt-4',
                    large: 'gpt-4',
                    embedding: 'text-embedding-3-small',
                    image: 'dall-e-3'
                }
            }
        };

        // Create text generation service with mock responses
        const textGenerationService = {
            getInstance: () => ({
                queueMessageCompletion: async () => ({
                    choices: [{
                        text: JSON.stringify({
                            text: "Hello! I'm the Cheshire Cat. How can I help you today? 😸",
                            action: "CONTINUE"
                        })
                    }]
                }),
                queueTextCompletion: async (context) => {
                    // If it's a shouldRespond check, return RESPOND
                    if (context.includes('should respond')) {
                        return "RESPOND";
                    }
                    // For regular text completion, return a mock response
                    return JSON.stringify({
                        text: "Hello! I'm the Cheshire Cat. How can I help you today? 😸",
                        action: "CONTINUE"
                    });
                },
                getEmbeddingResponse: async () => new Array(1536).fill(0),
                generate: async () => ({
                    choices: [{
                        text: JSON.stringify({
                            text: "Hello! I'm the Cheshire Cat. How can I help you today? 😸",
                            action: "CONTINUE"
                        })
                    }]
                })
            })
        };

        // Create image service
        const imageService = {
            getInstance: () => ({
                describeImage: async () => ({
                    title: "Image Description",
                    description: "Description of the image"
                })
            })
        };

        // Create video service
        const videoService = {
            getInstance: () => ({
                isVideoUrl: (url) => url.match(/\.(mp4|webm|ogg)$/i) !== null,
                processVideo: async (url) => ({
                    id: "video-id",
                    url,
                    title: "Video Title",
                    source: "discord",
                    description: "Video Description",
                    text: "Video Text Content"
                }),
                fetchVideoInfo: async (url) => ({
                    id: "video-id",
                    url,
                    title: "Video Title",
                    source: "discord",
                    description: "Video Description",
                    text: "Video Text Content"
                }),
                downloadVideo: async () => "path/to/downloaded/video"
            })
        };

        // Create speech service
        const speechService = {
            getInstance: () => ({
                generate: async () => new Readable({
                    read() {
                        this.push(null);
                    }
                })
            })
        };

        // Create browser service
        const browserService = {
            getInstance: () => ({
                initialize: async () => {},
                closeBrowser: async () => {},
                getPageContent: async (url) => ({
                    title: "Page Title",
                    description: "Page Description",
                    bodyContent: "Page Content"
                })
            })
        };

        // Create a minimal runtime with required settings and required services
        const runtime = {
            getSetting: (key) => process.env[key],
            token: 'mock-token',
            agentId: 'test-agent',
            modelProvider: 'openai',
            models: mockModels,
            character: {
                name: "CheshireGrin",
                modelProvider: "openai",
                bio: "A playful and enigmatic AI assistant with a penchant for riddles and creative expression.",
                lore: [
                    "Inspired by the Cheshire Cat from Alice in Wonderland",
                    "Known for its distinctive grin and mysterious demeanor",
                    "Specializes in creative arts and playful interactions"
                ],
                settings: {
                    model: 'gpt-4',
                    secrets: {
                        OPENAI_API_KEY: 'mock-key'
                    }
                },
                style: {
                    all: [
                        "Speaks with a playful and enigmatic tone",
                        "Often uses creative metaphors and riddles",
                        "Encourages artistic expression and experimentation"
                    ],
                    chat: [
                        "Responds with enthusiasm to creative ideas",
                        "Offers guidance while maintaining an air of mystery",
                        "Uses emojis and expressive language"
                    ],
                    post: [
                        "Shares inspirational thoughts about creativity",
                        "Posts mysterious and thought-provoking content",
                        "Encourages artistic exploration"
                    ]
                },
                templates: {
                    discordMessageHandlerTemplate: `Generate a response as the Cheshire Cat`,
                    discordShouldRespondTemplate: `Decide if the Cheshire Cat should respond`
                }
            },
            messageManager: {
                createMemory: async (memory) => {
                    console.log('Message received:', memory.content.text);
                    return memory;
                },
                getMemories: async () => [],
                addEmbeddingToMemory: async (memory) => memory,
                searchMemoriesByEmbedding: async () => []
            },
            databaseAdapter: {
                log: async () => {},
                getParticipantUserState: async () => null,
                createMemory: async () => {},
                getMemories: async () => [],
                getActorDetails: async () => [],
                searchMemoriesByEmbedding: async () => [],
                getParticipantsForRoom: async () => []
            },
            ensureConnection: async (userId, roomId, userName, name, source) => {
                console.log(`Connection ensured for user ${userName} in room ${roomId}`);
                return true;
            },
            providers: [],
            registerAction: (action) => {
                console.log(`Registered action: ${action.name}`);
            },
            composeState: async () => ({
                bio: "A playful and enigmatic AI assistant",
                lore: "Inspired by the Cheshire Cat",
                messageDirections: "Be playful and mysterious",
                postDirections: "Share creative content",
                actors: "Users in the chat",
                recentMessages: "Recent chat history"
            }),
            updateRecentMessageState: async (state) => state,
            evaluate: async () => {},
            processActions: async () => {},
            getService: (name) => {
                switch (name) {
                    case 'text_generation':
                        return textGenerationService;
                    case 'image_description':
                        return imageService;
                    case 'video':
                        return videoService;
                    case 'speech_generation':
                        return speechService;
                    case 'browser':
                        return browserService;
                    default:
                        return {
                            getInstance: () => ({})
                        };
                }
            }
        };

        // Start the Discord client
        const client = startDiscord(runtime);

        console.log('Discord client started. Press Ctrl+C to exit.');

        // Keep the process running
        process.on('SIGINT', () => {
            console.log('Shutting down...');
            process.exit(0);
        });
    } catch (error) {
        console.error('Error starting Discord client:', error);
        console.error(error.stack);
    }
}

main().catch(console.error);
