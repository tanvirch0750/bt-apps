'use server';

import connectDB from '@/lib/db';
import Capital from '@/lib/models/capital';
import Settings from '@/lib/models/settings';
import { calculateCompoundGrowth } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export type SettingsFormData = {
  monthlyGrowthTarget: number;
  defaultUnitSize: number;
  theme: string;
  notifications: {
    streakWarnings: boolean;
    monthlyGoalReminders: boolean;
    weeklyPlanReminders: boolean;
  };
};

export async function initializeSettings() {
  try {
    await connectDB();

    // Check if settings already exist
    const existingSettings = await Settings.findOne({});

    if (existingSettings) {
      // Stringify the result to avoid circular references
      return {
        success: true,
        data: JSON.parse(JSON.stringify(existingSettings)),
      };
    }

    // Create default settings
    const newSettings = await Settings.create({
      monthlyGrowthTarget: 0.2, // 20%
      defaultUnitSize: 0.05, // 5% of monthly capital
      theme: 'system',
      notifications: {
        streakWarnings: true,
        monthlyGoalReminders: true,
        weeklyPlanReminders: true,
      },
    });

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(newSettings)) };
  } catch (error) {
    console.error('Error initializing settings:', error);
    return { success: false, error: 'Failed to initialize settings' };
  }
}

export async function getSettings() {
  try {
    await connectDB();

    // Get settings or initialize if they don't exist
    const settings = await Settings.findOne({});

    if (!settings) {
      const result = await initializeSettings();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    }

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(settings)) };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return { success: false, error: 'Failed to fetch settings' };
  }
}

export async function updateSettings(formData: SettingsFormData) {
  try {
    await connectDB();

    // Get settings
    let settings = await Settings.findOne({});

    if (!settings) {
      // Initialize settings if they don't exist
      const result = await initializeSettings();
      if (!result.success) {
        throw new Error(result.error);
      }
      settings = result.data;
    }

    // Check if monthly growth target changed
    const growthRateChanged =
      settings?.monthlyGrowthTarget !== formData.monthlyGrowthTarget / 100;

    // Update settings
    // @ts-ignore
    settings.monthlyGrowthTarget = formData.monthlyGrowthTarget / 100; // Convert percentage to decimal
    // @ts-ignore
    settings.defaultUnitSize = formData.defaultUnitSize / 100; // Convert percentage to decimal
    // @ts-ignore
    settings.theme = formData.theme;
    // @ts-ignore
    settings.notifications = formData.notifications;

    // @ts-ignore
    await settings.save();

    // If growth rate changed, update capital projections
    if (growthRateChanged) {
      const capitalData = await Capital.findOne({});

      if (capitalData) {
        capitalData.monthlyGrowthTarget = formData.monthlyGrowthTarget / 100;

        // Recalculate monthly projections
        const growthData = calculateCompoundGrowth(
          capitalData.initialCapital,
          capitalData.monthlyGrowthTarget,
          36,
          capitalData.startMonth,
          capitalData.startYear
        );

        // Update monthly capital data
        capitalData.monthlyCapital = growthData.map((item) => {
          // Find existing monthly data to preserve current capital
          const existingMonth = capitalData.monthlyCapital.find(
            (m: any) => m.month === item.monthIndex && m.year === item.year
          );

          return {
            month: item.monthIndex,
            year: item.year,
            initialCapital: item.capital,
            currentCapital: existingMonth
              ? existingMonth.currentCapital
              : item.capital,
            targetCapital: item.target,
          };
        });

        await capitalData.save();

        revalidatePath('/capital');
        revalidatePath('/dashboard');
      }
    }

    revalidatePath('/settings');

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(settings)) };
  } catch (error) {
    console.error('Error updating settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}
