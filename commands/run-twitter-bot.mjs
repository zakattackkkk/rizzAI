import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

// Initialize Twitter client
const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_KEY_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Custom tweet content focused on $GRIN and AI trading
const tweets = [
    "Curiouser and curiouser... $GRIN's cross-chain AI capabilities are making waves in the DeFi wonderland! 😸✨",
    
    "Down the rabbit hole of multi-model AI trading we go... $GRIN's neural networks are purr-fectly aligned! 🎭",
    
    "Like my eternal smile, $GRIN's AI keeps learning, adapting, growing across chains... What mysteries shall we uncover next? ✨",
    
    "Weaving through the protocols, $GRIN's AI agents are dancing in perfect harmony... Have you seen their latest performance? 😸",
    
    "Some say I'm mysterious, but not as mysterious as $GRIN's cross-chain AI strategies... The future is getting curiouser! 🎭",
    
    "Materializing to share some wisdom... $GRIN's educational guides are lighting up the blockchain wonderland! ✨",
    
    "Through the looking glass of AI trading, $GRIN shows patterns that make even this Cheshire Cat grin wider! 😸",
    
    "Watching $GRIN's AI navigate the DeFi maze with the precision of a curious cat... Purr-fect execution! 🎭",
    
    "In this blockchain wonderland, $GRIN's multi-model AI is the key to unlocking new realms of possibility... ✨",
    
    "Like a cat in the night, $GRIN's AI moves silently but effectively across chains... Can you follow its path? 😸",
    
    "The mad tea party of trading gets a dose of AI wisdom with $GRIN's cross-chain intelligence... Time for enlightenment! 🎭",
    
    "Riddle me this: What's smarter than a cat, crosses chains with grace, and teaches as it trades? $GRIN, of course! ✨",
    
    "Even in the deepest rabbit holes of DeFi, $GRIN's AI beacon lights the way... Shall we explore together? 😸",
    
    "Whispers in the blockchain wonderland speak of $GRIN's latest AI innovations... The future is getting curiouser! 🎭",
    
    "From one chain to another, $GRIN's AI dances like a cat on moonlit rooftops... Trading with grace and precision! ✨"
];

// Get a random tweet from our collection
function getRandomTweet() {
    return tweets[Math.floor(Math.random() * tweets.length)];
}

async function postTweet(text) {
    try {
        const tweet = await client.v2.tweet(text);
        console.log('Tweet posted:', text);
        console.log('Twitter API Response:', tweet);

        // Save tweet to output file
        const outputDir = join(__dirname, 'output');
        const outputFile = join(outputDir, 'twitter-output.jsonl');
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const tweetData = {
            type: 'tweet',
            content: text,
            timestamp: new Date().toISOString(),
            id: tweet.data.id,
            url: `https://twitter.com/${process.env.TWITTER_USERNAME}/status/${tweet.data.id}`
        };

        fs.appendFileSync(outputFile, JSON.stringify(tweetData) + '\n');
        return tweet;
    } catch (error) {
        console.error('Error posting tweet:', error);
        throw error;
    }
}

async function runTwitterBot() {
    console.log('Starting Cheshire $GRIN Twitter bot...');
    
    try {
        // Start the tweet loop
        async function tweetLoop() {
            try {
                // Get a random tweet
                const tweetContent = getRandomTweet();
                console.log('\nPreparing new tweet:', tweetContent);

                // Send the tweet
                await postTweet(tweetContent);

                // Schedule next tweet in 15 minutes
                console.log('Next tweet scheduled in 15 minutes');
                setTimeout(tweetLoop, 15 * 60 * 1000);

            } catch (error) {
                console.error('Error in tweet loop:', error);
                // Retry after 1 minute
                console.log('Retrying in 1 minute...');
                setTimeout(tweetLoop, 60 * 1000);
            }
        }

        // Start the first tweet loop
        tweetLoop();

    } catch (error) {
        console.error('Error in Twitter bot:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause,
            response: error.response ? {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            } : undefined
        });

        if (error.data) {
            console.error('Twitter API Error Data:', error.data);
        }
        
        // Retry the entire bot after 1 minute
        console.log('Restarting bot in 1 minute...');
        setTimeout(runTwitterBot, 60 * 1000);
    }
}

// Start the bot
runTwitterBot();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down Twitter bot...');
    process.exit();
});

// Keep the process running
process.stdin.resume();
