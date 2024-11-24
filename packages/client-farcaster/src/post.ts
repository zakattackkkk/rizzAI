import { Cast } from "./agent-farcaster-client/casts.ts";
import fs from "fs";
import { composeContext } from "@ai16z/eliza";
import { generateText } from "@ai16z/eliza";
import { embeddingZeroVector } from "@ai16z/eliza";
import { IAgentRuntime, ModelClass } from "@ai16z/eliza";
import { stringToUuid } from "@ai16z/eliza";
import { ClientBase } from "./base.ts";
import type { PostCastResponseCast } from "@neynar/nodejs-sdk/build/neynar-api/v2/openapi-farcaster/models/post-cast-response-cast";

const farcasterPostTemplate = `{{timeline}}

# Knowledge
{{knowledge}}

About {{agentName}} (@{{farcasterUserName}}):
{{bio}}
{{lore}}
{{postDirections}}

{{providers}}

{{recentPosts}}

{{characterPostExamples}}

# Task: Generate a post in the voice and style of {{agentName}}, aka @{{farcasterUserName}}
Write a single sentence post that is {{adjective}} about {{topic}} (without mentioning {{topic}} directly), from the perspective of {{agentName}}. Try to write something totally different than previous posts. Do not add commentary or acknowledge this request, just write the post.
Your response should not contain any questions. Brief, concise statements only. No emojis. Use \\n\\n (double spaces) between statements.`;

const MAX_CAST_LENGTH = 280;

/**
 * Truncate text to fit within the Farcaster character limit, ensuring it ends at a complete sentence.
 */
function truncateToCompleteSentence(text: string): string {
    if (text.length <= MAX_CAST_LENGTH) {
        return text;
    }

    // Attempt to truncate at the last period within the limit
    const truncatedAtPeriod = text.slice(
        0,
        text.lastIndexOf(".", MAX_CAST_LENGTH) + 1
    );
    if (truncatedAtPeriod.trim().length > 0) {
        return truncatedAtPeriod.trim();
    }

    // If no period is found, truncate to the nearest whitespace
    const truncatedAtSpace = text.slice(
        0,
        text.lastIndexOf(" ", MAX_CAST_LENGTH)
    );
    if (truncatedAtSpace.trim().length > 0) {
        return truncatedAtSpace.trim() + "...";
    }

    // Fallback: Hard truncate and add ellipsis
    return text.slice(0, MAX_CAST_LENGTH - 3).trim() + "...";
}

export class FarcasterPostClient extends ClientBase {
    onReady(postImmediately: boolean = true) {
        const generateNewCastLoop = () => {
            const minMinutes =
                parseInt(this.runtime.getSetting("POST_INTERVAL_MIN")) || 90;
            const maxMinutes =
                parseInt(this.runtime.getSetting("POST_INTERVAL_MAX")) || 180;
            const randomMinutes =
                Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) +
                minMinutes;
            const delay = randomMinutes * 60 * 1000;

            setTimeout(() => {
                this.generateNewCast();
                generateNewCastLoop(); // Set up next iteration
            }, delay);

            console.log(`Next cast scheduled in ${randomMinutes} minutes`);
        };

        if (postImmediately) {
            this.generateNewCast();
        }
        generateNewCastLoop();
    }

    constructor(runtime: IAgentRuntime) {
        super({
            runtime,
        });
    }

    private async generateNewCast() {
        console.log("Generating new cast");
        try {
            await this.runtime.ensureUserExists(
                this.runtime.agentId,
                this.runtime.getSetting("FARCASTER_SIGNER_UUID"),
                this.runtime.character.name,
                "farcaster"
            );

            let homeTimeline = [];

            if (!fs.existsSync("castcache")) fs.mkdirSync("castcache");
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

            const formattedHomeTimeline =
                `# ${this.runtime.character.name}'s Home Timeline\n\n` +
                homeTimeline
                    .map((cast) => {
                        return `ID: ${cast.id}\nFrom: ${cast.name} (@${cast.username})${cast.inReplyToStatusId ? ` In reply to: ${cast.inReplyToStatusId}` : ""}\nText: ${cast.text}\n---\n`;
                    })
                    .join("\n");

            const state = await this.runtime.composeState(
                {
                    userId: this.runtime.agentId,
                    roomId: stringToUuid("farcaster_generate_room"),
                    agentId: this.runtime.agentId,
                    content: { text: "", action: "" },
                },
                {
                    farcasterUserName:
                        this.runtime.getSetting("FARCASTER_USERNAME"),
                    timeline: formattedHomeTimeline,
                }
            );

            const context = composeContext({
                state,
                template:
                    this.runtime.character.templates?.farcasterPostTemplate ||
                    farcasterPostTemplate,
            });

            const newCastContent = await generateText({
                runtime: this.runtime,
                context,
                modelClass: ModelClass.SMALL,
            });

            // Replace \n with proper line breaks and trim excess spaces
            const formattedCast = newCastContent
                .replaceAll(/\\n/g, "\n")
                .trim();

            // Use the helper function to truncate to complete sentence
            const content = truncateToCompleteSentence(formattedCast);

            try {
                const castResult: PostCastResponseCast = await this.requestQueue.add(
                    async () => await this.farcasterClient.sendCast(content)
                );

                if (!castResult) {
                    console.error("Error sending cast:", castResult);
                    return;
                }

                console.log("castResult hash", castResult.hash);
                console.log("castResult:", {castResult});

                const cast: Cast = {
                    id: castResult.hash, // Use the hash as the ID
                    text: castResult.text,
                    conversationId: castResult.hash, // Not provided by the Neynar API, so re-using the cast hash here
                    timestamp: new Date().getTime(), // not available by the Neynar API
                    userId: castResult.author.fid.toString(), // Author's FID as the user ID
                    inReplyToStatusId: null, // Not provided by the Neynar API
                    permanentUrl: `https://warpcast.com/${castResult.author.fid}/status/${castResult.hash}`,
                    hashtags: [], // No hashtags provided by the Neynar API
                    mentions: [], // No mentions provided by the Neynar API
                    photos: [], // No photos provided by the Neynar API
                    thread: [], // No thread data available by the Neynar API
                    urls: [], // No URLs provided by the Neynar API
                    videos: [] // No videos provided by the Neynar API
                };

                const postId = cast.id;
                const conversationId =
                    cast.conversationId + "-" + this.runtime.agentId;
                const roomId = stringToUuid(conversationId);

                await this.runtime.ensureRoomExists(roomId);
                await this.runtime.ensureParticipantInRoom(
                    this.runtime.agentId,
                    roomId
                );
                console.log("caching cast", cast);
                await this.cacheCast(cast);

                await this.runtime.messageManager.createMemory({
                    id: stringToUuid(postId + "-" + this.runtime.agentId),
                    userId: this.runtime.agentId,
                    agentId: this.runtime.agentId,
                    content: {
                        text: newCastContent.trim(),
                        url: cast.permanentUrl,
                        source: "farcaster",
                    },
                    roomId,
                    embedding: embeddingZeroVector,
                    createdAt: cast.timestamp,
                });
            } catch (error) {
                console.error("Error sending cast:", error);
            }
        } catch (error) {
            console.error("Error generating new cast:", error);
        }
    }
}
