// server/utils/embedding.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// MongoDB Schema
const docSchema = new mongoose.Schema({
  text: String,
  embedding: [Number],
  fileName: String,
  pageNumber: Number,
  chunkIndex: Number,
  createdAt: { type: Date, default: Date.now }
});

const Document = mongoose.model('Document', docSchema, 'documents');

// Generate embedding
async function generateEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('❌ Embedding Error:', error);
    throw error;
  }
}

// Store chunks with embeddings
async function storeChunksWithEmbeddings(chunks, fileName) {
  const storedDocs = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    try {
      console.log(`📊 Processing chunk ${i+1}/${chunks.length}...`);
      
      // Generate embedding
      const embedding = await generateEmbedding(chunk.text);
      
      // Create document
      const doc = new Document({
        text: chunk.text,
        embedding: embedding,
        fileName: fileName,
        pageNumber: chunk.pageNumber || 1,
        chunkIndex: i
      });
      
      // Save to MongoDB
      await doc.save();
      storedDocs.push(doc);
      
      console.log(`✓ Stored chunk ${i+1}`);
      
    } catch (error) {
      console.error(`❌ Failed chunk ${i}:`, error.message);
    }
  }
  
  return storedDocs;
}

module.exports = { 
  generateEmbedding, 
  storeChunksWithEmbeddings, 
  Document 
};