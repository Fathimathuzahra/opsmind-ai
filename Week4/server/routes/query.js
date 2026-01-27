// server/routes/query.js
const express = require('express');
const { Document } = require('../utils/embedding');
const { generateEmbedding } = require('../utils/embedding');

const router = express.Router();

// Search similar chunks
async function searchSimilarChunks(queryEmbedding, limit = 3) {
  try {
    const collection = Document.collection;
    
    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: limit
        }
      },
      {
        $project: {
          text: 1,
          fileName: 1,
          pageNumber: 1,
          chunkIndex: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ];
    
    const results = await collection.aggregate(pipeline).toArray();
    return results;
    
  } catch (error) {
    console.error('❌ Search error:', error);
    return [];
  }
}

// Ask question endpoint
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log(`🤔 Question: "${question}"`);

    // Step 1: Generate embedding for the question
    const queryEmbedding = await generateEmbedding(question);
    
    // Step 2: Search for similar chunks
    const relevantChunks = await searchSimilarChunks(queryEmbedding);
    
    if (relevantChunks.length === 0) {
      return res.json({
        answer: "I don't know. This information is not in the provided documents.",
        sources: [],
        confidence: 0
      });
    }

    // Step 3: Format context for Gemini
    const context = relevantChunks.map((chunk, index) => 
      `[Source ${index + 1}: ${chunk.fileName}, Page: ${chunk.pageNumber}]\n${chunk.text}`
    ).join('\n\n');

    // Step 4: Create prompt
    const prompt = `
You are OpsMind AI, a helpful assistant that answers questions based on provided context.

CONTEXT:
${context}

QUESTION: ${question}

INSTRUCTIONS:
1. Answer ONLY using the context above
2. If the answer is not in the context, say "I don't know"
3. Include citations like [FileName, Page X]
4. Keep answers concise and accurate

ANSWER:
`;

    // Step 5: Get answer from Gemini
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({
      answer: answer,
      sources: relevantChunks,
      confidence: relevantChunks[0]?.score || 0,
      chunksReturned: relevantChunks.length
    });

  } catch (error) {
    console.error('❌ Query error:', error);
    res.status(500).json({ 
      error: error.message || 'Query failed',
      note: 'Check if Vector Search index is created in MongoDB Atlas'
    });
  }
});

// List all documents
router.get('/documents', async (req, res) => {
  try {
    const documents = await Document.find({})
      .select('fileName pageNumber chunkIndex createdAt')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Group by fileName
    const grouped = {};
    documents.forEach(doc => {
      if (!grouped[doc.fileName]) {
        grouped[doc.fileName] = {
          fileName: doc.fileName,
          chunks: 0,
          firstUploaded: doc.createdAt,
          lastUploaded: doc.createdAt
        };
      }
      grouped[doc.fileName].chunks++;
      if (doc.createdAt < grouped[doc.fileName].firstUploaded) {
        grouped[doc.fileName].firstUploaded = doc.createdAt;
      }
    });
    
    res.json({
      count: documents.length,
      files: Object.values(grouped),
      allDocuments: documents
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;