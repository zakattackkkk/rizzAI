import {
    Action,
    IAgentRuntime,
    Memory,
    State,
    HandlerCallback,
} from "@ai16z/eliza";
import { z } from "zod";
import { generateObjectV2, composeContext, ModelClass, Content } from "@ai16z/eliza";
import { createPublicClient, createWalletClient, http, parseCFX } from "cive";
import { privateKeyToAccount } from "cive/accounts";
import { testnet } from "cive/chains";
import { confluxTransferTemplate } from "../templates/transfer";

const TransferSchema = z.object({
    to: z.string(),
    amount: z.string(), // use string to allow for decimal values
});

interface TransferContent extends Content {
    to: string;
    amount: string;
}

const isTransferContent = (content: any): content is TransferContent => {
    return TransferSchema.safeParse(content).success;
};

const sendCFX = async (
    secretKey: `0x${string}`,
    rpcUrl: string,
    to: string,
    amount: string
) => {
    const client = createPublicClient({
        transport: http(rpcUrl),
    });
    const networkId = await client.getChainId();
    const account = privateKeyToAccount(secretKey, { networkId });

    const walletClient = createWalletClient({
        transport: http(rpcUrl),
        chain: testnet,
    });

    const hash = await walletClient.sendTransaction({
        account,
        to,
        value: parseCFX(amount),
        chain: testnet,
    });

    await client.waitForTransactionReceipt({
        hash,
    });
    return hash;
};

export const transfer: Action = {
    name: "SEND_CFX",
    description:
        "Transfer CFX from one address to another in Conflux Core Space",
    similes: ["SEND_CONFLUX", "SEND_CFX_CORE_SPACE", "TRANSFER_CFX"],
    examples: [],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        // no extra validation needed
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        options?: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        const context = composeContext({
            state,
            template: confluxTransferTemplate,
        });

        const content = await generateObjectV2({
            runtime,
            context,
            modelClass: ModelClass.LARGE,
            schema: TransferSchema,
        });

        if (!isTransferContent(content)) {
            throw new Error("Invalid content");
        }

        const secretKey = runtime.getSetting("CONFLUX_CORE_PRIVATE_KEY") as `0x${string}`;
        const rpcUrl = runtime.getSetting("CONFLUX_CORE_SPACE_RPC_URL");

        let success = false;

        try {
            const hash = await sendCFX(secretKey, rpcUrl, content.to, content.amount);
            success = true;
            if (!callback) {
                return success;
            }
            callback({
                text: `${content.amount} CFX sent to ${content.to}: ${hash}`,
                content,
            });
        } catch (error) {
            console.error(`Error sending CFX: ${error}`);
            if (!callback) {
                return success;
            }
            callback({
                text: `Failed to send ${content.amount} CFX to ${content.to}: ${error}`,
            });
        }
        return success;
    },
};
