import { Clients, AgentRuntime } from "@ai16z/eliza";
import { TelegramClient } from "./telegramClient.ts";

export const TelegramClientInterface = {
    start: async (runtime: AgentRuntime) => {
        const botToken = runtime.getSetting("TELEGRAM_BOT_TOKEN");
        const tg = new TelegramClient(runtime, botToken);
        await tg.start();

        console.log(
            `✅ Telegram client successfully started for character ${runtime.character.name}`
        );
        return tg;
    },
    stop: async (runtime: AgentRuntime) => {
        console.warn("Telegram client does not support stopping yet");
    },
};

export default TelegramClientInterface;
