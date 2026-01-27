const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  size: Number,
  path: String,
  content: String,
  chunks: [{
    text: String,
    pageNumber: Number,
    chunkIndex: Number,
    embedding: {
      type: [Number],
      default: [] // For vector search
    }
  }]
});

module.exports = mongoose.model('Document', DocumentSchema);
