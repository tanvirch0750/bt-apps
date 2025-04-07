import connectDB from '@/lib/db';
import mongoose, { Schema, model, type Model } from 'mongoose';

// Define interface for type safety
interface BetDocument extends mongoose.Document {
  matchName: string;
  league: string;
  date: Date;
  odds: number;
  stake: number;
  betType: string;
  result: string;
  profit: number;
  notes?: string;
  month: number;
  year: number;
  week: number;
}

// Connect to the database before defining models
connectDB().catch((err) => console.error('Failed to connect to DB:', err));

const BetSchema = new Schema<BetDocument>(
  {
    matchName: {
      type: String,
      required: true,
    },
    league: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    odds: {
      type: Number,
      required: true,
    },
    stake: {
      type: Number,
      required: true,
    },
    betType: {
      type: String,
      required: true,
      enum: ['Win', 'Draw', 'Over', 'Under', 'BTTS', 'Other'],
    },
    result: {
      type: String,
      required: true,
      enum: ['Win', 'Loss', 'Pending'],
      default: 'Pending',
    },
    profit: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    week: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Use a safer approach to model creation
const Bet: Model<BetDocument> =
  mongoose.models.Bet || model<BetDocument>('Bet', BetSchema);

export default Bet;
