import { ApprovalQueue, PendingTweet } from '../approval-queue.js';
import { expect } from 'chai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ApprovalQueue', () => {
    let approvalQueue: ApprovalQueue;
    const testDbPath = path.join(__dirname, 'test-approval-queue.db');
    const testTimeout = 5000; // 5 seconds for testing
    const mockWebhookUrl = 'http://localhost:3000/webhook';

    // Mock webhook server responses
    let webhookCalls: { action: string; tweet: PendingTweet }[] = [];

    beforeEach(async () => {
        // Clean up previous test database if exists
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
        approvalQueue = new ApprovalQueue(testDbPath, testTimeout, mockWebhookUrl);
        await approvalQueue.init();
        webhookCalls = [];

        // Setup fetch mock
        global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
            const body = init?.body ? JSON.parse(init.body as string) : {};
            webhookCalls.push(body);
            return new Response(JSON.stringify({ status: 'ok' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        };
    });

    afterEach(async () => {
        await approvalQueue.close();
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    describe('Queue Management', () => {
        it('should add a tweet to the queue', async () => {
            const content = 'Test tweet';
            const id = await approvalQueue.add(content);
            const tweet = await approvalQueue.get(id);

            expect(tweet).to.not.be.null;
            expect(tweet?.content).to.equal(content);
            expect(tweet?.status).to.equal('pending');
        });

        it('should list pending tweets', async () => {
            const content1 = 'Test tweet 1';
            const content2 = 'Test tweet 2';

            await approvalQueue.add(content1);
            await approvalQueue.add(content2);

            const pendingTweets = await approvalQueue.list('pending');
            expect(pendingTweets).to.have.length(2);
            expect(pendingTweets[0].content).to.equal(content2);
            expect(pendingTweets[1].content).to.equal(content1);
        });
    });

    describe('Approval Flow', () => {
        it('should approve a pending tweet', async () => {
            const content = 'Test tweet';
            const id = await approvalQueue.add(content);

            await approvalQueue.approve(id);
            const tweet = await approvalQueue.get(id);

            expect(tweet).to.not.be.null;
            expect(tweet?.status).to.equal('approved');
            expect(webhookCalls).to.have.length(1);
            expect(webhookCalls[0].action).to.equal('approved');
        });

        it('should reject a pending tweet', async () => {
            const content = 'Test tweet';
            const id = await approvalQueue.add(content);

            await approvalQueue.reject(id);
            const tweet = await approvalQueue.get(id);

            expect(tweet).to.not.be.null;
            expect(tweet?.status).to.equal('rejected');
            expect(webhookCalls).to.have.length(1);
            expect(webhookCalls[0].action).to.equal('rejected');
        });

        it('should not allow approving expired tweets', async () => {
            const content = 'Test tweet';
            const id = await approvalQueue.add(content);

            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, testTimeout + 100));

            try {
                await approvalQueue.approve(id);
                throw new Error('Should have thrown an error');
            } catch (error) {
                expect((error as Error).message).to.include('expired');
            }
        });
    });

    describe('Timeout Handling', () => {
        it('should handle tweet expiration', async () => {
            const content = 'Test tweet';
            const id = await approvalQueue.add(content);

            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, testTimeout + 100));

            // Trigger cleanup
            await approvalQueue['cleanupExpired']();

            const tweet = await approvalQueue.get(id);
            expect(tweet).to.not.be.null;
            expect(tweet?.status).to.equal('rejected');
        });

        it('should cleanup old tweets', async () => {
            const content = 'Test tweet';
            await approvalQueue.add(content);

            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 100));

            // Clean up tweets older than current time
            await approvalQueue.cleanupOld(0);

            const tweets = await approvalQueue.list();
            expect(tweets).to.have.length(0);
        });
    });

    describe('Configuration Validation', () => {
        it('should respect custom timeout', async () => {
            const customTimeout = 2000; // 2 seconds
            const customQueue = new ApprovalQueue(testDbPath, customTimeout);

            const content = 'Test tweet';
            const id = await customQueue.add(content);
            const tweet = await customQueue.get(id);

            expect(tweet).to.not.be.null;
            if (tweet) {
                const timeDiff = tweet.expiresAt.getTime() - tweet.createdAt.getTime();
                expect(timeDiff).to.be.closeTo(customTimeout, 100);
            }

            await customQueue.close();
        });

        it('should handle webhook failures gracefully', async () => {
            // Mock webhook failure
            global.fetch = async (): Promise<Response> => {
                throw new Error('Webhook failed');
            };

            const content = 'Test tweet';
            const id = await approvalQueue.add(content);

            // Should not throw error on webhook failure
            let error: Error | undefined;
            try {
                await approvalQueue.approve(id);
            } catch (e) {
                error = e as Error;
            }
            expect(error).to.be.undefined;
            const tweet = await approvalQueue.get(id);
            expect(tweet).to.not.be.null;
            expect(tweet?.status).to.equal('approved');
        });

        it('should store and retrieve metadata', async () => {
            const content = 'Test tweet';
            const metadata = { source: 'test', priority: 'high' };
            const id = await approvalQueue.add(content, metadata);

            const tweet = await approvalQueue.get(id);
            expect(tweet).to.not.be.null;
            expect(tweet?.metadata).to.deep.equal(metadata);
        });
    });
});
