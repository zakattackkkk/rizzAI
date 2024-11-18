import fetch from 'node-fetch';

async function testXAI() {
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xai-zEeTg7lzDdVDf89Ex94H9QW7z4Y0JW39qEbA3Mgzhz7EYhLda5FzeSw9UdLmKkXga42AWm4F2lFtTGp3'
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a test assistant."
          },
          {
            role: "user",
            content: "Testing. Just say hi and hello world and nothing else."
          }
        ],
        model: "grok-beta",
        stream: false,
        temperature: 0
      })
    });

    const data = await response.json();
    console.log('Full Response:', JSON.stringify(data, null, 2));
    console.log('\nAssistant Message:', data.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error);
  }
}

testXAI();
