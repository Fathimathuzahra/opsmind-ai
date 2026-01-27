const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Testing API Key:", apiKey ? "Present" : "Missing");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Test Embedding
        console.log("Testing Embedding (text-embedding-004)...");
        const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embedResult = await embedModel.embedContent("Hello world");
        console.log("Embedding Success:", embedResult.embedding.values.length > 0);

        // Test Generation
        console.log("Testing Generation (gemini-1.5-flash)...");
        const genModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await genModel.generateContent("Say hello");
        console.log("Generation Success:", result.response.text());

    } catch (error) {
        console.error("Gemini Error:", error.message);
        if (error.response) {
            console.error("Error Detail:", error.response);
        }
    }
}

testGemini();
