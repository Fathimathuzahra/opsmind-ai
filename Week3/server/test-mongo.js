// server/test-mongo.js
const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB connection...');
console.log('Connection string:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database:', mongoose.connection.db.databaseName);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Check if password is correct');
    console.log('2. Check if cluster name is correct');
    console.log('3. Check network access in MongoDB Atlas');
    process.exit(1);
  });