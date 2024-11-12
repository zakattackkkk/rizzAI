import { ApprovalQueue, PendingTweet } from './approval-queue.js';
import readline from 'readline';
import { promisify } from 'util';

export class CLIApproval {
    private queue: ApprovalQueue;
    private rl: readline.Interface;

    constructor(queue: ApprovalQueue) {
        this.queue = queue;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    private async question(query: string): Promise<string> {
        const questionAsync = promisify(this.rl.question).bind(this.rl);
        return await questionAsync(query);
    }

    async reviewTweet(tweet: PendingTweet): Promise<boolean> {
        console.log('\n=== Tweet Review ===');
        console.log(`Content: ${tweet.content}`);
        console.log(`Created: ${tweet.createdAt.toLocaleString()}`);
        console.log('==================\n');

        const answer = await this.question('Approve this tweet? (y/n): ');
        return answer.toLowerCase().startsWith('y');
    }

    async startApprovalProcess(): Promise<void> {
        try {
            while (true) {
                const pendingTweets = await this.queue.list('pending');

                if (pendingTweets.length === 0) {
                    console.log('No pending tweets to review.');
                    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before checking again
                    continue;
                }

                for (const tweet of pendingTweets) {
                    const approved = await this.reviewTweet(tweet);

                    if (approved) {
                        await this.queue.approve(tweet.id);
                        console.log('Tweet approved and will be posted.');
                    } else {
                        await this.queue.reject(tweet.id);
                        console.log('Tweet rejected.');
                    }
                }
            }
        } catch (error) {
            console.error('Error in approval process:', error);
            throw error;
        }
    }

    async close(): Promise<void> {
        this.rl.close();
        await this.queue.close();
    }

    static async create(dbPath?: string): Promise<CLIApproval> {
        const queue = new ApprovalQueue(dbPath);
        return new CLIApproval(queue);
    }
}

// Example usage:
if (require.main === module) {
    (async () => {
        const cli = await CLIApproval.create();
        try {
            await cli.startApprovalProcess();
        } catch (error) {
            console.error('Fatal error:', error);
            process.exit(1);
        }
    })();
}
