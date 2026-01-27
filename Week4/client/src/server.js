const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// ========== ROUTES ==========

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'OpsMind AI Server is running',
    timestamp: new Date().toISOString()
  });
});

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'OpsMind AI - Enterprise SOP Neural Brain',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      upload: 'POST /api/upload',
      ask: 'POST /api/ask',
      documents: 'GET /api/documents'
    }
  });
});

// Upload PDF endpoint
app.post('/api/upload', upload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      uploadedAt: new Date().toISOString()
    };

    console.log('✅ PDF uploaded:', fileInfo.originalname);

    res.json({
      success: true,
      message: 'PDF uploaded successfully',
      file: fileInfo
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Ask question endpoint (basic implementation)
app.post('/api/ask', (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Mock response for now - you'll integrate AI later
    const response = {
      answer: `I received your question: "${question}". This is a mock response. AI integration will be added in Week 2.`,
      sources: [],
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      ...response
    });

  } catch (error) {
    console.error('Ask error:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

// List uploaded documents
app.get('/api/documents', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir)
      .filter(file => file.endsWith('.pdf'))
      .map(file => ({
        name: file,
        path: `/uploads/${file}`,
        size: fs.statSync(path.join(uploadsDir, file)).size,
        uploaded: fs.statSync(path.join(uploadsDir, file)).mtime
      }));

    res.json({
      success: true,
      count: files.length,
      documents: files
    });
  } catch (error) {
    res.json({ success: true, count: 0, documents: [] });
  }
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📁 Upload endpoint: POST http://localhost:${PORT}/api/upload`);
  console.log(`❓ Ask endpoint: POST http://localhost:${PORT}/api/ask`);
});