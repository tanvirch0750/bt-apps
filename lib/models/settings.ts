import connectDB from '@/lib/db';
import mongoose, { Schema, model, type Model } from 'mongoose';

// Define interface for type safety
interface SettingsDocument extends mongoose.Document {
  monthlyGrowthTarget: number;
  defaultUnitSize: number;
  theme: string;
  notifications: {
    streakWarnings: boolean;
    monthlyGoalReminders: boolean;
    weeklyPlanReminders: boolean;
  };
}

// Connect to the database before defining models
connectDB().catch((err) => console.error('Failed to connect to DB:', err));

const SettingsSchema = new Schema<SettingsDocument>(
  {
    monthlyGrowthTarget: {
      type: Number,
      required: true,
      default: 0.2, // 20%
    },
    defaultUnitSize: {
      type: Number,
      required: true,
      default: 0.05, // 5% of monthly capital
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    notifications: {
      streakWarnings: {
        type: Boolean,
        default: true,
      },
      monthlyGoalReminders: {
        type: Boolean,
        default: true,
      },
      weeklyPlanReminders: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

// Use a safer approach to model creation
const Settings: Model<SettingsDocument> =
  mongoose.models.Settings ||
  model<SettingsDocument>('Settings', SettingsSchema);

export default Settings;
