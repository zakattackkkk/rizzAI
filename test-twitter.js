import fetch from 'node-fetch';

const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAHiFwQEAAAAAHAuEHfVzgFY%2FO3DojXGQiF9NNc4%3D1sREkMMottR1f4i7D8AXp2vmAUCs5AvyWXuB0uSxaGjdUQ2aNH';

const messages = [
    "✓ Registering action: IGNORE",
    "✓ Registering action: NONE",
    "✓ Registering action: MUTE_ROOM",
    "✓ Registering action: UNMUTE_ROOM",
    "Registering service: browser\nRegistering service: image_description\nRegistering service: text_generation\nRegistering service: pdf\nRegistering service: speech_generation\nRegistering service: transcription\nRegistering service: video\nChat started. Type 'exit' to quit.\nServer running at http://localhost:3000/"
];

async function postTweet(text) {
    const url = 'https://api.twitter.com/2/tweets';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });
        
        const data = await response.json();
        console.log('Tweet posted:', text);
        console.log('Twitter API Response:', data);
        return data;
    } catch (error) {
        console.error('Error posting tweet:', error);
        throw error;
    }
}

async function postAllTweets() {
    for (const message of messages) {
        try {
            await postTweet(message);
            // Wait 2 seconds between tweets to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error('Failed to post tweet:', message);
        }
    }
}

postAllTweets();
