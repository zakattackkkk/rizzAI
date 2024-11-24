import { FarcasterPostClient } from "./post.ts";
import { FarcasterInteractionClient } from "./interactions.ts";
import { IAgentRuntime, Client } from "@ai16z/eliza";

class FarcasterAllClient {
    post: FarcasterPostClient;
    interaction: FarcasterInteractionClient;
    constructor(runtime: IAgentRuntime) {
        this.post = new FarcasterPostClient(runtime);
        this.interaction = new FarcasterInteractionClient(runtime);
    }
}

export const FarcasterClientInterface: Client = {
    async start(runtime: IAgentRuntime) {
        console.log("Farcaster client started");
        return new FarcasterAllClient(runtime);
    },
    async stop(runtime: IAgentRuntime) {
        console.warn("Farcaster client does not support stopping yet");
    },
};

export default FarcasterClientInterface;
