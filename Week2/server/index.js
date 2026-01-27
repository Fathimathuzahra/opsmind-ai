const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// const Document = require('./models/Document'); // Loaded dynamically
const { generateEmbedding, answerQuestion } = require('./services/aiService');
const { processPDF } = require('./utils/pdfProcessor');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB with Fallback
let Document;
let useMock = false;

const connectDB = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // Fail fast (5s)
    });
    console.log('✅ MongoDB Connected');
    Document = require('./models/Document');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    console.warn('⚠️ SWITCHING TO IN-MEMORY MODE (Data will be lost on restart)');
    useMock = true;
    Document = require('./models/MockDocument');
  }
};

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Initialize DB before routes
connectDB();


const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Routes

// 1. Upload PDF
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    console.log(`Processing file: ${req.file.originalname}`);

    // Process PDF text
    // processPDF returns array of chunks: [{ text, pageNumber }]
    const chunks = await processPDF(filePath);

    // Generate Embeddings for Chunks (Week 2 Feature)
    console.log(`Debug: Processing ${chunks.length} chunks...`);

    // LIMIT CHUNKS to prevent timeout on large files (free tier API limit)
    const MAX_CHUNKS = 50;
    const chunksToProcess = chunks.slice(0, MAX_CHUNKS);
    if (chunks.length > MAX_CHUNKS) {
      console.warn(`Debug: Limiting to first ${MAX_CHUNKS} chunks (of ${chunks.length}) for performance.`);
    }

    const chunksWithEmbeddings = [];
    let fullContent = "";

    // Concat full content for reference
    for (const chunk of chunks) {
      fullContent += chunk.text + "\n";
    }

    // Embed chunks
    let processedCount = 0;
    for (const chunk of chunksToProcess) {
      const vector = await generateEmbedding(chunk.text);
      processedCount++;
      if (processedCount % 5 === 0) console.log(`Debug: Embedded ${processedCount}/${chunksToProcess.length} chunks`);

      if (vector) {
        chunksWithEmbeddings.push({
          ...chunk,
          embedding: vector
        });
      }
      // Small delay to be nice to API
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Save to MongoDB
    const newDoc = new Document({
      filename: req.file.originalname,
      path: filePath,
      size: req.file.size,
      content: fullContent,
      chunks: chunksWithEmbeddings
    });

    await newDoc.save();
    console.log("Document saved to MongoDB");

    res.json({
      success: true,
      message: "PDF processed and stored with embeddings!",
      docId: newDoc._id
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Ask Question
app.post('/api/ask', async (req, res) => {
  try {
    console.log("Debug: /api/ask called");
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question required" });

    console.log(`Debug: Question received: ${question}`);
    const questionEmbedding = await generateEmbedding(question);
    if (!questionEmbedding) {
      console.error("Debug: Embedding generation failed");
      return res.status(500).json({ error: "Failed to embed question" });
    }

    const documents = await Document.find({});
    console.log(`Debug: Found ${documents.length} documents for search`);

    let allChunks = [];
    documents.forEach(doc => {
      doc.chunks.forEach(chunk => {
        allChunks.push({
          text: chunk.text,
          embedding: chunk.embedding,
          filename: doc.filename
        });
      });
    });

    // Cosine Similarity
    function cosineSimilarity(vecA, vecB) {
      const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
      const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
      const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
      return dotProduct / (magnitudeA * magnitudeB);
    }

    // Rank chunks (Vector Search)
    let rankedChunks = allChunks.map(chunk => ({
      ...chunk,
      score: chunk.embedding && chunk.embedding.length > 0 ? cosineSimilarity(questionEmbedding, chunk.embedding) : 0
    })).sort((a, b) => b.score - a.score);

    // KEYWORD FALLBACK:
    // If top score is 0 (or very low), it means vector search failed (no embeddings or no semantic match).
    // Try simple keyword matching.
    if (rankedChunks.length === 0 || rankedChunks[0].score < 0.01) {
      console.log("Debug: Vector search yielded low results. Switching to Keyword Search.");
      const lowerQuestion = question.toLowerCase();
      const keywords = lowerQuestion.split(" ").filter(w => w.length > 3); // Simple keyword extraction

      // Rescore based on keyword hits
      rankedChunks = allChunks.map(chunk => {
        const text = chunk.text.toLowerCase();
        let matchCount = 0;
        keywords.forEach(kw => {
          if (text.includes(kw)) matchCount++;
        });
        return {
          ...chunk,
          score: matchCount * 0.1 // Arbitrary score for keywords
        };
      }).sort((a, b) => b.score - a.score);
    }

    // Take top 3
    rankedChunks = rankedChunks.slice(0, 3);
    // Filter out zero scores if any
    rankedChunks = rankedChunks.filter(c => c.score > 0);

    const context = rankedChunks.map(c => c.text).join("\n\n");

    if (!context) {
      // If still empty, return a specific message
      return res.json({
        answer: "I couldn't find any information about that in the uploaded documents. (Try capturing more general terms)",
        sources: []
      });
    }

    // 2. Generate Answer
    const answer = await answerQuestion(question, context);

    res.json({
      answer,
      sources: rankedChunks.map(c => ({ filename: c.filename, score: c.score }))
    });

  } catch (error) {
    console.error("Ask error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. List Documents
app.get('/api/documents', async (req, res) => {
  try {
    const docs = await Document.find({}, 'filename size uploadedAt');
    res.json({ documents: docs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: "OK",
    backend: "OpsMind Week 2 Final",
    mode: useMock ? "In-Memory (Offline)" : "MongoDB (Online)"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});