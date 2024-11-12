import { ApprovalQueue } from './approval-queue.js';
import { CLIApproval } from './cli-approval.js';
import { WebApprovalInterface } from './web/approval-interface.js';

async function testApprovalSystem() {
    try {
        console.log('Starting approval system test...');

        // Initialize components
        const queue = new ApprovalQueue(undefined, 5 * 60 * 1000); // 5 minute timeout for testing
        const cli = new CLIApproval(queue);
        const web = await WebApprovalInterface.create(undefined, 3002);

        // Add test tweets
        console.log('\nAdding test tweets...');
        const tweetIds = await Promise.all([
            queue.add('Test tweet 1 - Should expire in 5 minutes'),
            queue.add('Test tweet 2 - For CLI approval', {}, 10 * 60 * 1000),
            queue.add('Test tweet 3 - For web approval', {}, 10 * 60 * 1000)
        ]);

        console.log(`Added ${tweetIds.length} test tweets`);

        // Start web interface
        await web.start();
        console.log('\nWeb interface started at http://localhost:3002/twitter-approval');

        // Display initial state
        const pendingTweets = await queue.list('pending');
        console.log('\nPending tweets:', pendingTweets);

        // Start CLI approval process
        console.log('\nStarting CLI approval interface...');
        console.log('Press Ctrl+C to exit');

        await cli.startApprovalProcess();

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testApprovalSystem().catch(console.error);
}
