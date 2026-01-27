// server/test-password.js
const mongoose = require('mongoose');

// Test different password formats
const testPasswords = [
  'opsoind123',           // Simple
  'password123',          // Simple
  'mongodb@2026',         // Has @
  'mongodb#2026',         // Has #
  'mongodb$2026',         // Has $
];

async function testConnection(password) {
  console.log(`\n🔗 Testing password: ${password}`);
  
  // Encode special characters
  const encodedPassword = encodeURIComponent(password);
  console.log(`🔐 Encoded: ${encodedPassword}`);
  
  const connectionString = `mongodb+srv://admin:${encodedPassword}@cluster1.sepk203.mongodb.net/opsoind_db`;
  
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connection successful!');
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    return false;
  }
}

async function runTests() {
  for (const password of testPasswords) {
    const success = await testConnection(password);
    if (success) {
      console.log(`\n🎉 Use this password: ${password}`);
      console.log(`🔗 Connection string:`);
      console.log(`mongodb+srv://admin:${encodeURIComponent(password)}@cluster1.sepk203.mongodb.net/opsoind_db`);
      return;
    }
  }
  console.log('\n❌ All tests failed. Reset your password in MongoDB Atlas.');
}

runTests();