// server/utils/pdfProcessor.js
const fs = require('fs');
const pdfParse = require('pdf-parse');

async function processPDF(filePath) {
  try {
    console.log(`📄 Processing PDF: ${filePath}`);
    
    // Read PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Extract text from PDF
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    
    console.log(`✓ Extracted ${text.length} characters`);
    
    // Split text into chunks (simple method)
    const chunkSize = 1000;
    const overlap = 200;
    const chunks = [];
    
    for (let i = 0; i < text.length; i += (chunkSize - overlap)) {
      const chunk = text.substring(i, i + chunkSize);
      if (chunk.trim().length > 50) {
        chunks.push({
          text: chunk,
          pageNumber: 1, // Simple version
          chunkIndex: chunks.length
        });
      }
    }
    
    console.log(`✓ Split into ${chunks.length} chunks`);
    return chunks;
    
  } catch (error) {
    console.error('❌ PDF Processing Error:', error);
    throw error;
  }
}

module.exports = { processPDF };