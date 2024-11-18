import { Scraper } from 'agent-twitter-client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '.env') });

// Load Cheshire character
const cheshireChar = JSON.parse(fs.readFileSync(join(__dirname, 'characters', 'cheshire-character.json'), 'utf-8'));

// Get a random post example from the character
function getRandomPost() {
    const posts = cheshireChar.postExamples;
    return posts[Math.floor(Math.random() * posts.length)];
}

async function testTwitter() {
    console.log('Starting Twitter test...');
    
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

        // Get a random Cheshire cat tweet
        const tweetContent = getRandomPost();
        console.log('Tweet content:', tweetContent);

        // Send the tweet
        console.log('Sending tweet...');
        const result = await twitterClient.sendTweet(tweetContent);
        const body = await result.json();
        const tweetResult = body.data.create_tweet.tweet_results.result;

        console.log('Tweet sent successfully:', {
            id: tweetResult.rest_id,
            text: tweetResult.legacy.full_text,
            url: `https://twitter.com/${process.env.TWITTER_USERNAME}/status/${tweetResult.rest_id}`
        });

    } catch (error) {
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
    }
}

console.log('Starting test...');
await testTwitter();
console.log('Test completed.');
