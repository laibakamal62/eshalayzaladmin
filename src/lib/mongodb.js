import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export async function connectMade() {
  // Prevent multiple connections
  if (mongoose.connection.readyState >= 1) {
    console.log("Already connected to DB");
    return mongoose.connection;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Missing MONGODB_URI in environment variables");
    }

    const connect = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });

    console.log("DB connected successfully");
    return connect;
  } catch (error) {
    console.error("DB connection error:", error);
    throw error;
  }
}
