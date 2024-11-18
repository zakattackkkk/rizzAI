import { Scraper } from 'agent-twitter-client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '.env') });

// Get character file path from command line argument
const characterPath = process.argv[2];
if (!characterPath) {
    console.error('Please provide a character file path as an argument');
    process.exit(1);
}

// Load character configuration
const character = JSON.parse(fs.readFileSync(characterPath, 'utf-8'));
console.log(`Initializing ${character.name} Twitter bot...`);

// Get a random post example from the character
function getRandomPost() {
    const posts = character.postExamples;
    return posts[Math.floor(Math.random() * posts.length)];
}

async function runTwitterBot() {
    console.log(`Starting Twitter bot with ${character.name} personality...`);
    
    const twitterClient = new Scraper();
    const cookiesFilePath = join(__dirname, 'tweetcache', process.env.TWITTER_USERNAME + '_cookies.json');
    
    try {
        console.log('Setting up Twitter client...');
        
        // Create tweetcache directory if it doesn't exist
        const dir = dirname(cookiesFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Check for existing cookies
        if (fs.existsSync(cookiesFilePath)) {
            console.log('Loading existing cookies...');
            const cookiesArray = JSON.parse(fs.readFileSync(cookiesFilePath, 'utf-8'));
            const cookieStrings = cookiesArray.map(
                (cookie) =>
                    `${cookie.key}=${cookie.value}; Domain=${cookie.domain}; Path=${cookie.path}; ${
                        cookie.secure ? "Secure" : ""
                    }; ${cookie.httpOnly ? "HttpOnly" : ""}; SameSite=${
                        cookie.sameSite || "Lax"
                    }`
            );
            await twitterClient.setCookies(cookieStrings);
        } else {
            console.log('Logging in to Twitter...');
            await twitterClient.login(
                process.env.TWITTER_USERNAME,
                process.env.TWITTER_PASSWORD,
                process.env.TWITTER_EMAIL
            );
            console.log('Saving cookies...');
            const cookies = await twitterClient.getCookies();
            fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies), 'utf-8');
        }

        // Start the tweet loop
        async function tweetLoop() {
            try {
                // Wait for login to complete
                let loggedInWaits = 0;
                while (!(await twitterClient.isLoggedIn())) {
                    console.log('Waiting for Twitter login...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    if (loggedInWaits > 10) {
                        console.error('Failed to login to Twitter');
                        await twitterClient.login(
                            process.env.TWITTER_USERNAME,
                            process.env.TWITTER_PASSWORD,
                            process.env.TWITTER_EMAIL
                        );
                        const cookies = await twitterClient.getCookies();
                        fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies), 'utf-8');
                        loggedInWaits = 0;
                    }
                    loggedInWaits++;
                }

                // Get a random tweet from character
                const tweetContent = getRandomPost();
                console.log('\nPreparing new tweet:', tweetContent);

                // Send the tweet
                console.log('Sending tweet...');
                const result = await twitterClient.sendTweet(tweetContent);
                const body = await result.json();

                // Handle different response structures
                let tweetId, tweetUrl;
                if (body.data?.create_tweet?.tweet_results?.result) {
                    const tweetResult = body.data.create_tweet.tweet_results.result;
                    tweetId = tweetResult.rest_id;
                    tweetUrl = `https://twitter.com/${process.env.TWITTER_USERNAME}/status/${tweetId}`;
                } else if (body.data?.create_tweet?.tweet?.rest_id) {
                    tweetId = body.data.create_tweet.tweet.rest_id;
                    tweetUrl = `https://twitter.com/${process.env.TWITTER_USERNAME}/status/${tweetId}`;
                } else {
                    throw new Error('Unexpected tweet response structure');
                }

                console.log('Tweet sent successfully:', {
                    id: tweetId,
                    text: tweetContent,
                    url: tweetUrl
                });

                // Save tweet to output file
                const outputDir = join(__dirname, 'output');
                const outputFile = join(outputDir, 'twitter-output.jsonl');
                
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }

                const tweetData = {
                    type: 'tweet',
                    content: tweetContent,
                    timestamp: new Date().toISOString(),
                    id: tweetId,
                    url: tweetUrl
                };

                fs.appendFileSync(outputFile, JSON.stringify(tweetData) + '\n');

                // Schedule next tweet in 5 minutes
                console.log('Next tweet scheduled in 5 minutes');
                setTimeout(tweetLoop, 5 * 60 * 1000);

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
