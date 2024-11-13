import fetch from 'node-fetch';

const BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAHiFwQEAAAAAAboHBXjkBZMK3usED87%2FeyZc1EI%3Duj7NYSpaKBbHcbdT69SFsrvkphwzMIAsMoerNo4wYeGwJFC3rS";

async function testTwitterAPI() {
    try {
        const response = await fetch('https://api.twitter.com/2/users/me', {
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`
            }
        });
        
        const data = await response.json();
        console.log('Twitter API Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

testTwitterAPI();
