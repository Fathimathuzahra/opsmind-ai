const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();

// ========== CONFIGURATION ==========
const PORT = 5001; // Must match React proxy: 5001
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOADS_DIR));

// ========== MULTER SETUP FOR PDF UPLOADS ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// ========== ROUTES ==========

// 1. Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'OpsMind AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET  /health',
      'GET  /',
      'POST /api/upload',
      'POST /api/ask',
      'GET  /api/documents'
    ]
  });
});

// 2. Home
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to OpsMind AI - Enterprise SOP Neural Brain',
    project: 'Week 1 Completed - Backend API',
    next: 'Week 2: MongoDB Vector Search & Gemini AI Integration'
  });
});

// 3. Upload PDF
app.post('/api/upload', upload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const fileInfo = {
      id: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: `/uploads/${req.file.filename}`,
      uploadedAt: new Date().toISOString()
    };

    console.log(`✅ PDF Uploaded: ${fileInfo.originalName} (${fileInfo.size} bytes)`);

    res.json({
      success: true,
      message: 'PDF uploaded successfully',
      file: fileInfo
    });

  } catch (error) {
    console.error('❌ Upload Error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      details: error.message
    });
  }
});

// 4. Ask Question
app.post('/api/ask', (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    // Mock response (Will be replaced with AI in Week 2)
    const mockResponse = {
      answer: `I received: "${question}".\n\nThis is a mock response from OpsMind AI. In Week 2, this will connect to Gemini AI and search through your uploaded documents.`,
      confidence: 0.95,
      sources: [
        { document: 'Magento-2-Developer-Guide.pdf', page: 1, relevance: 0.9 }
      ],
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      ...mockResponse
    });

  } catch (error) {
    console.error('❌ Ask Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process question'
    });
  }
});

// 5. List Documents
app.get('/api/documents', (req, res) => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      return res.json({ success: true, count: 0, documents: [] });
    }

    const files = fs.readdirSync(UPLOADS_DIR)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => {
        const filePath = path.join(UPLOADS_DIR, file);
        const stats = fs.statSync(filePath);
        
        return {
          id: file,
          name: file,
          originalName: file.replace(/^\d+-/, ''), // Remove timestamp prefix
          size: stats.size,
          uploaded: stats.mtime,
          url: `/uploads/${file}`
        };
      });

    res.json({
      success: true,
      count: files.length,
      documents: files
    });

  } catch (error) {
    console.error('❌ Documents Error:', error);
    res.json({ success: true, count: 0, documents: [] });
  }
});

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`\n🚀 OpsMind AI Backend Started!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔍 Health: http://localhost:${PORT}/health`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads/`);
  console.log(`\n✅ Ready for React frontend at http://localhost:3000\n`);
});