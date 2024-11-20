import { Context, Telegraf } from 'telegraf';
import {
    AgentRuntime,
    type Content,
    type Memory,
    type State,
    type UUID
} from '@ai16z/eliza';
import { elizaLogger } from '@ai16z/eliza/src/logger.ts';

export class MessageManager {
    public bot: Telegraf<Context>;
    private runtime: AgentRuntime;

    constructor(bot: Telegraf<Context>, runtime: AgentRuntime) {
        this.bot = bot;
        this.runtime = runtime;
    }

    public async handleMessage(ctx: Context): Promise<void> {
        if (!ctx.message || !('text' in ctx.message)) {
            elizaLogger.log('Received non-text message');
            return;
        }

        const message = ctx.message;
        const text = message.text;
        const userId = message.from.id.toString() as UUID;
        const roomId = message.chat.id.toString() as UUID;

        try {
            // Ensure the user and room exist in our system
            await this.runtime.ensureConnection(
                userId,
                roomId,
                message.from.username || null,
                message.from.first_name || null,
                'telegram'
            );

            // Create a memory object for this message
            const memory: Memory = {
                userId,
                roomId,
                agentId: this.runtime.agentId,
                content: {
                    text,
                },
            };

            // Add the memory to our system
            await this.runtime.messageManager.createMemory(memory);

            // Compose the state for processing
            const state = await this.runtime.composeState(memory);

            // Process actions based on the message
            await this.runtime.processActions(
                memory,
                [],
                state,
                async (response: Content) => {
                    if (response.text) {
                        await ctx.reply(response.text);
                    }
                    return [];
                }
            );

            // Evaluate the interaction
            await this.runtime.evaluate(memory, state, true);
        } catch (error) {
            elizaLogger.error('Error handling message:', error);
            await ctx.reply('An error occurred while processing your message.');
        }
    }
}
