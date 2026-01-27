const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate embedding for a text string
async function generateEmbedding(text) {
    try {
        console.log(`Debug: Generating embedding for text length ${text.length}`);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        const embedding = result.embedding;
        console.log("Debug: Embedding generated successfully");
        return embedding.values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        return null;
    }
}

// Answer question using context
async function answerQuestion(question, context) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are OpsMind AI, an intelligent assistant for analyzing Enterprise SOPs.
      
      Context information is below:
      ---------------------
      ${context}
      ---------------------
      
      Given the context information and not prior knowledge, answer the query.
      Query: ${question}
      
      Answer:
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating answer:", error.message);

        // Fallback: If AI generation fails (e.g. 429 quota, 503 overload),
        // return the top search results directly so the user still gets value.
        return `**AI Generation Unavailable (Fallback Mode)**\n\nI couldn't generate a summarized answer due to API limitations, but here is the most relevant information found in your documents:\n\n${context}`;
    }
}

module.exports = {
    generateEmbedding,
    answerQuestion
};
