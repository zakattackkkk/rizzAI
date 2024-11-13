import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import fetch from 'node-fetch';

const oauth = new OAuth({
    consumer: {
        key: 'T6FH1zQwriwSEhMt8wRlJqtsD',
        secret: 'lY1T4CdnXdff9X0JAtVaC4PEFuYRR6Tdm3tPPYSI0JfV4HC2pf'
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
        return crypto
            .createHmac('sha1', key)
            .update(base_string)
            .digest('base64');
    }
});

const token = {
    key: '1723999359635709952-Hpwvk1kB4CiyVbxxhkVWKPPRWbaQU5',
    secret: 'sblHdDdZfklYyHjGRw53B6-o84naoXB_1Pd0TTIofCxUcj7XS9'
};

const request_data = {
    url: 'https://api.twitter.com/2/tweets',
    method: 'POST',
    data: { text: "Testing Twitter API connection 🚀" }
};

async function testTwitterAPI() {
    try {
        const auth = oauth.authorize(request_data, token);
        const headers = oauth.toHeader(auth);

        const response = await fetch(request_data.url, {
            method: request_data.method,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request_data.data)
        });
        
        const data = await response.json();
        console.log('Twitter API Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

testTwitterAPI();
