import { IAgentRuntime } from "@ai16z/eliza";
import { z } from "zod";

export const twitterEnvSchema = z.object({
    TWITTER_DRY_RUN: z
        .string()
        .transform((val) => val.toLowerCase() === "true"),
    TWITTER_USERNAME: z.string().optional(),
    TWITTER_PASSWORD: z.string().optional(),
    TWITTER_EMAIL: z.string().optional(),
    TWITTER_COOKIES: z.string().optional(),
    TWITTER_API_KEY: z.string().optional(),
    TWITTER_API_SECRET_KEY: z.string().optional(),
    TWITTER_ACCESS_TOKEN: z.string().optional(),
    TWITTER_ACCESS_TOKEN_SECRET: z.string().optional(),
});

export type TwitterConfig = z.infer<typeof twitterEnvSchema>;

export async function validateTwitterConfig(
    runtime: IAgentRuntime
): Promise<TwitterConfig> {
    try {
        const config = {
            TWITTER_DRY_RUN:
                runtime.getSetting("TWITTER_DRY_RUN") ||
                process.env.TWITTER_DRY_RUN,
            TWITTER_USERNAME:
                runtime.getSetting("TWITTER_USERNAME") ||
                process.env.TWITTER_USERNAME,
            TWITTER_PASSWORD:
                runtime.getSetting("TWITTER_PASSWORD") ||
                process.env.TWITTER_PASSWORD,
            TWITTER_EMAIL:
                runtime.getSetting("TWITTER_EMAIL") ||
                process.env.TWITTER_EMAIL,
            TWITTER_COOKIES:
                runtime.getSetting("TWITTER_COOKIES") ||
                process.env.TWITTER_COOKIES,
            TWITTER_API_KEY:
                runtime.getSetting("TWITTER_API_KEY") ||
                process.env.TWITTER_API_KEY,
            TWITTER_API_SECRET_KEY:
                runtime.getSetting("TWITTER_API_SECRET_KEY") ||
                process.env.TWITTER_API_SECRET_KEY,
            TWITTER_ACCESS_TOKEN:
                runtime.getSetting("TWITTER_ACCESS_TOKEN") ||
                process.env.TWITTER_ACCESS_TOKEN,
            TWITTER_ACCESS_TOKEN_SECRET:
                runtime.getSetting("TWITTER_ACCESS_TOKEN_SECRET") ||
                process.env.TWITTER_ACCESS_TOKEN_SECRET,
        };

        return twitterEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Twitter configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
