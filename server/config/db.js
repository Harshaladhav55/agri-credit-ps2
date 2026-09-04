import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pathcraft_ai');
    console.log(`[MongoDB Connected] Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    // Process continues so fallback mock storage remains operational if local Mongo service is offline
  }
};
