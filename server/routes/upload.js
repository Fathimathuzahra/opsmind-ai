// server/routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processPDF } = require('../utils/pdfProcessor');
const { storeChunksWithEmbeddings } = require('../utils/embedding');

const router = express.Router();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads folder if not exists
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Check if PDF
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload endpoint
router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    console.log(`📤 Uploading: ${fileName}`);
    console.log(`📍 Saved to: ${filePath}`);

    // Step 1: Process PDF into chunks
    const chunks = await processPDF(filePath);
    
    // Step 2: Generate embeddings and store in MongoDB
    const storedDocs = await storeChunksWithEmbeddings(chunks, fileName);
    
    // Step 3: Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'PDF processed and stored successfully!',
      details: {
        fileName: fileName,
        chunksProcessed: chunks.length,
        chunksStored: storedDocs.length,
        fileSize: req.file.size,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: error.message || 'Upload failed',
      details: 'Check if Gemini API key is valid and MongoDB is connected'
    });
  }
});

module.exports = router;