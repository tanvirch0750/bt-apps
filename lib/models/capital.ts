import connectDB from '@/lib/db';
import mongoose, { Schema, model, type Model } from 'mongoose';

// Define interface for type safety
interface MonthlyCapital {
  month: number;
  year: number;
  initialCapital: number;
  currentCapital: number;
  targetCapital: number;
}

interface CapitalDocument extends mongoose.Document {
  initialCapital: number;
  currentCapital: number;
  monthlyGrowthTarget: number;
  startMonth: number;
  startYear: number;
  currentMonth: number;
  currentYear: number;
  monthlyCapital: MonthlyCapital[];
}

// Connect to the database before defining models
connectDB().catch((err) => console.error('Failed to connect to DB:', err));

const MonthlyCapitalSchema = new Schema<MonthlyCapital>(
  {
    month: Number,
    year: Number,
    initialCapital: Number,
    currentCapital: Number,
    targetCapital: Number,
  },
  { _id: false }
);

const CapitalSchema = new Schema<CapitalDocument>(
  {
    initialCapital: {
      type: Number,
      required: true,
      default: 5000,
    },
    currentCapital: {
      type: Number,
      required: true,
      default: 5000,
    },
    monthlyGrowthTarget: {
      type: Number,
      required: true,
      default: 0.2, // 20%
    },
    startMonth: {
      type: Number,
      required: true,
      default: 3, // April (0-indexed)
    },
    startYear: {
      type: Number,
      required: true,
      default: 2025,
    },
    currentMonth: {
      type: Number,
      required: true,
      default: 3, // April (0-indexed)
    },
    currentYear: {
      type: Number,
      required: true,
      default: 2025,
    },
    monthlyCapital: [MonthlyCapitalSchema],
  },
  { timestamps: true }
);

// Use a safer approach to model creation
const Capital: Model<CapitalDocument> =
  mongoose.models.Capital || model<CapitalDocument>('Capital', CapitalSchema);

export default Capital;
