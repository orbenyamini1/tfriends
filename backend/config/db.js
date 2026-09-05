const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`🚀 MongoDB Connected to tfriends DB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to Database: ${error.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;