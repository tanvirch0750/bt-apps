import connectDB from '@/lib/db';
import mongoose, { Schema, model, type Model } from 'mongoose';

// Define interface for type safety
interface WeeklyPlanDocument extends mongoose.Document {
  month: number;
  year: number;
  week: number;
  targetBets: number;
  averageOdds: number;
  unitSize: number;
  betsPlaced: number;
  betsWon: number;
  betsLost: number;
  betsPending: number;
}

// Connect to the database before defining models
connectDB().catch((err) => console.error('Failed to connect to DB:', err));

const WeeklyPlanSchema = new Schema<WeeklyPlanDocument>(
  {
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
    targetBets: {
      type: Number,
      required: true,
      default: 5,
    },
    averageOdds: {
      type: Number,
      required: true,
      default: 1.8,
    },
    unitSize: {
      type: Number,
      required: true,
      default: 0.05, // 5% of monthly capital
    },
    betsPlaced: {
      type: Number,
      default: 0,
    },
    betsWon: {
      type: Number,
      default: 0,
    },
    betsLost: {
      type: Number,
      default: 0,
    },
    betsPending: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Use a safer approach to model creation
const WeeklyPlan: Model<WeeklyPlanDocument> =
  mongoose.models.WeeklyPlan ||
  model<WeeklyPlanDocument>('WeeklyPlan', WeeklyPlanSchema);

export default WeeklyPlan;
