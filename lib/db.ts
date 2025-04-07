/* eslint-disable @typescript-eslint/no-unused-vars */

// Import all models here to ensure they're registered with Mongoose
import mongoose from 'mongoose';

// @ts-ignore
import { Bet } from '@/lib/models/bet';
// @ts-ignore
import { Capital } from '@/lib/models/capital';
// @ts-ignore
import { Settings } from '@/lib/models/settings';
// @ts-ignore
import { WeeklyPlan } from '@/lib/models/weekly-plan';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Declare global interface for TypeScript
// @ts-ignore
let cached = global.mongoose;

if (!cached) {
  // @ts-ignore
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    // If a connection is already established, reuse it
    return cached.conn;
  }

  if (!cached.promise) {
    // If no promise exists, create one and initiate the connection
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // @ts-ignore
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Await the promise and store the connection
    cached.conn = await cached.promise;
    console.log('MongoDB connected');
    return cached.conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}

export default connectDB;
