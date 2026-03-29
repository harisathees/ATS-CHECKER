const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

async function test() {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const match = envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
    const apiKey = match ? match[1].trim() : null;

    if (!apiKey) throw new Error("API Key not found in .env");

    const ai = new GoogleGenAI({ apiKey });
    
    console.log("Testing with valid prompt...");
    const contents = [
        { text: "Hello" }
    ];

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
    });
    
    console.log("Success:", response.text ? "Yes" : "No");
  } catch (error) {
    console.error("SDK Error:", error.message || error);
  }
}

test();
