import 'dotenv/config';

async function generateImage() {
  try {
    const response = await fetch('https://api.together.xyz/inference', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "stabilityai/stable-diffusion-xl-base-1.0",
        prompt: "A magical cheshire cat in wonderland, digital art style, highly detailed, fantasy art",
        width: 512,
        height: 512,
        steps: 40,
        n: 1,
        seed: 10000,
        response_format: "b64_json"
      })
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generateImage();
