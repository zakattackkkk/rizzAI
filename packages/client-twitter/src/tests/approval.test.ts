import { ApprovalQueue, PendingTweet } from '../approval-queue.js';
import { expect } from 'chai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestApprovalQueue extends ApprovalQueue {
    async testCleanupExpired(): Promise<void> {
        await this.cleanupExpired();
    }
}

describe('ApprovalQueue', () => {
    let queue: TestApprovalQueue;
    const testDbPath = path.join(__dirname, 'test-approval-queue.db');
    const testTimeout = 1000; // 1 second for faster testing
    const mockWebhookUrl = 'http://localhost:3000/webhook';
    let webhookCalls: any[] = [];

    beforeEach(async () => {
        // Delete test database if it exists
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
        queue = new TestApprovalQueue(testDbPath, testTimeout, mockWebhookUrl);
        await queue.init();
        webhookCalls = [];

        // Setup fetch mock
        global.fetch = async (url: string, options: any) => {
            webhookCalls.push({ url, options });
            return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
        };
    });

    afterEach(async () => {
        await queue.close();
        // Clean up test database
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    describe('Queue Management', () => {
        it('should add a tweet to the queue', async () => {
            const content = 'Test tweet';
            const id = await queue.add(content);
            const tweet = await queue.get(id);
            expect(tweet).to.not.be.null;
            expect(tweet?.content).to.equal(content);
            expect(tweet?.status).to.equal('pending');
        });

        it('should list pending tweets', async function() {
            this.timeout(5000);
            const content1 = 'Test tweet 1';
            const content2 = 'Test tweet 2';
            await queue.add(content1);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await queue.add(content2);
            const tweets = await queue.list('pending');
            expect(tweets).to.have.lengthOf(2);
            expect(tweets[0].createdAt.getTime()).to.be.greaterThan(tweets[1].createdAt.getTime());
            expect(tweets[0].content).to.equal(content2);
            expect(tweets[1].content).to.equal(content1);
        });
    });

    describe('Approval Flow', () => {
        it('should approve a pending tweet', async () => {
            const content = 'Test tweet';
            const id = await queue.add(content);
            await queue.approve(id);
            const tweet = await queue.get(id);
            expect(tweet?.status).to.equal('approved');
        });

        it('should reject a pending tweet', async () => {
            const content = 'Test tweet';
            const id = await queue.add(content);
            await queue.reject(id);
            const tweet = await queue.get(id);
            expect(tweet?.status).to.equal('rejected');
        });

        it('should not allow approving expired tweets', async function() {
            this.timeout(5000);
            const shortTimeout = 500;
            const testQueue = new TestApprovalQueue(testDbPath, shortTimeout);
            await testQueue.init();

            const id = await testQueue.add('Test tweet');
            await new Promise(resolve => setTimeout(resolve, 600));

            try {
                await testQueue.approve(id);
                expect.fail('Expected approve to throw an error');
            } catch (e) {
                expect((e as Error).message).to.include('expired');
            }
            await testQueue.close();
        });

        it('should handle batch approvals', async () => {
            const tweets = [
                'Batch tweet 1',
                'Batch tweet 2',
                'Batch tweet 3'
            ];

            const ids = await Promise.all(tweets.map(content => queue.add(content)));

            await Promise.all(ids.map(id => queue.approve(id)));

            const approvedTweets = await queue.list('approved');
            expect(approvedTweets).to.have.lengthOf(3);
            approvedTweets.forEach((tweet, index) => {
                expect(tweet.content).to.equal(tweets[index]);
                expect(tweet.status).to.equal('approved');
            });
        });

        it('should handle custom timeout configurations', async function() {
            this.timeout(3000);
            const veryShortTimeout = 200;
            const customQueue = new TestApprovalQueue(testDbPath, veryShortTimeout);
            await customQueue.init();

            const id = await customQueue.add('Quick expiring tweet');
            await new Promise(resolve => setTimeout(resolve, 250));

            // Force cleanup of expired tweets
            await customQueue.testCleanupExpired();

            // Verify tweet status is now rejected due to expiration
            const tweet = await customQueue.get(id);
            expect(tweet?.status).to.equal('rejected');

            try {
                await customQueue.approve(id);
                expect.fail('Expected approve to throw due to expiration');
            } catch (e) {
                expect((e as Error).message).to.include('expired');
            }

            const tweets = await customQueue.list('pending');
            expect(tweets).to.have.lengthOf(0);
            await customQueue.close();
        });

        it('should handle multiple webhook configurations', async () => {
            const webhookQueue = new TestApprovalQueue(
                testDbPath,
                24 * 60 * 60 * 1000,
                'http://webhook1.test,http://webhook2.test'
            );
            await webhookQueue.init();

            const id = await webhookQueue.add('Multi-webhook test');
            await webhookQueue.approve(id);

            const tweet = await webhookQueue.get(id);
            expect(tweet?.status).to.equal('approved');
        });
    });

    describe('Timeout Handling', () => {
        it('should handle tweet expiration', async function() {
            this.timeout(5000); // Increase timeout for this test
            const shortTimeout = 500; // 500ms timeout
            const testQueue = new TestApprovalQueue(testDbPath, shortTimeout);
            await testQueue.init();

            const id = await testQueue.add('Test tweet');
            await new Promise(resolve => setTimeout(resolve, 600)); // Wait for expiration

            await testQueue.testCleanupExpired();
            const tweet = await testQueue.get(id);
            expect(tweet?.status).to.equal('rejected');
            await testQueue.close();
        });

        it('should cleanup old tweets', async function() {
            this.timeout(5000); // Increase timeout for this test
            const testQueue = new TestApprovalQueue(testDbPath, 1000);
            await testQueue.init();

            await testQueue.add('Old tweet');
            await new Promise(resolve => setTimeout(resolve, 1100));
            await testQueue.testCleanupExpired();

            const tweets = await testQueue.list('pending');
            expect(tweets).to.have.lengthOf(0);
            await testQueue.close();
        });
    });

    describe('Configuration Validation', () => {
        it('should respect custom timeout', async () => {
            const customTimeout = 2000; // 2 seconds
            const testQueue = new TestApprovalQueue(testDbPath, customTimeout);
            await testQueue.init();
            const id = await testQueue.add('Test tweet');
            const tweet = await testQueue.get(id);
            const expectedExpiry = new Date(Date.now() + customTimeout);
            const actualExpiry = tweet?.expiresAt as Date;
            expect(Math.abs(actualExpiry.getTime() - expectedExpiry.getTime())).to.be.lessThan(100);
            await testQueue.close();
        });

        it('should handle webhook failures gracefully', async () => {
            // Mock webhook failure
            global.fetch = async () => {
                throw new Error('Webhook failed');
            };

            const content = 'Test tweet';
            const id = await queue.add(content);

            // Should not throw error on webhook failure
            let error: Error | undefined;
            try {
                await queue.approve(id);
            } catch (e) {
                error = e as Error;
            }
            expect(error).to.be.undefined;
            const tweet = await queue.get(id);
            expect(tweet?.status).to.equal('approved');
        });

        it('should store and retrieve metadata', async () => {
            const content = 'Test tweet';
            const metadata = { source: 'test', priority: 'high' };
            const id = await queue.add(content, metadata);
            const tweet = await queue.get(id);
            expect(tweet).to.not.be.null;
            expect(tweet?.metadata).to.deep.equal(metadata);
        });
    });
});
