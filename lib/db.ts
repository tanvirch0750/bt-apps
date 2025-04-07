// Import all models here to ensure they're registered with Mongoose

// @ts-nocheck
import { Bet } from '@/lib/models/bet';
import { Capital } from '@/lib/models/capital';
import { Settings } from '@/lib/models/settings';
import { WeeklyPlan } from '@/lib/models/weekly-plan';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Declare global interface for TypeScript
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Create a cached connection variable
const cached = global.mongoose || { conn: null, promise: null };

// Only assign to global in development to prevent memory leaks in production
if (process.env.NODE_ENV === 'development') {
  global.mongoose = cached;
}

async function connectDB() {
  // If we have a connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is already being established, wait for it
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (e) {
      cached.promise = null;
      throw e;
    }
  }

  // Create a new connection promise
  // @ts-ignore
  cached.promise = mongoose.connect(MONGODB_URI!, {
    bufferCommands: false,
  });

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
