'use server';

import connectDB from '@/lib/db';
import Capital from '@/lib/models/capital';
import { calculateCompoundGrowth } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function initializeCapital() {
  try {
    await connectDB();

    // Check if capital data already exists
    const existingCapital = await Capital.findOne({});

    if (existingCapital) {
      // Stringify the result to avoid circular references
      return {
        success: true,
        data: JSON.parse(JSON.stringify(existingCapital)),
      };
    }

    // Initialize with default values
    const initialCapital = 5000;
    const monthlyGrowthTarget = 0.2;
    const startMonth = 3; // April (0-indexed)
    const startYear = 2025;

    // Generate 36 months of compound growth
    const growthData = calculateCompoundGrowth(
      initialCapital,
      monthlyGrowthTarget,
      36,
      startMonth,
      startYear
    );

    // Format monthly capital data
    const monthlyCapital = growthData.map((item) => ({
      month: item.monthIndex,
      year: item.year,
      initialCapital: item.capital,
      currentCapital: item.capital,
      targetCapital: item.target,
    }));

    // Create new capital record
    const newCapital = await Capital.create({
      initialCapital,
      currentCapital: initialCapital,
      monthlyGrowthTarget,
      startMonth,
      startYear,
      currentMonth: startMonth,
      currentYear: startYear,
      monthlyCapital,
    });

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(newCapital)) };
  } catch (error) {
    console.error('Error initializing capital:', error);
    return { success: false, error: 'Failed to initialize capital data' };
  }
}

export async function getCapitalData() {
  try {
    await connectDB();

    // Get capital data or initialize if it doesn't exist
    const capitalData = await Capital.findOne({});

    if (!capitalData) {
      const result = await initializeCapital();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    }

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(capitalData)) };
  } catch (error) {
    console.error('Error fetching capital data:', error);
    return { success: false, error: 'Failed to fetch capital data' };
  }
}

export async function updateCapital(data: {
  initialCapital?: number;
  currentCapital?: number;
  monthlyGrowthTarget?: number;
}) {
  try {
    await connectDB();

    // Get existing capital data
    const capitalData = await Capital.findOne({});

    if (!capitalData) {
      return { success: false, error: 'Capital data not found' };
    }

    // Update fields if provided
    if (data.initialCapital !== undefined) {
      capitalData.initialCapital = data.initialCapital;
    }

    if (data.currentCapital !== undefined) {
      capitalData.currentCapital = data.currentCapital;
    }

    if (data.monthlyGrowthTarget !== undefined) {
      capitalData.monthlyGrowthTarget = data.monthlyGrowthTarget;
    }

    // If initial capital or growth rate changed, recalculate monthly projections
    if (
      data.initialCapital !== undefined ||
      data.monthlyGrowthTarget !== undefined
    ) {
      const growthData = calculateCompoundGrowth(
        capitalData.initialCapital,
        capitalData.monthlyGrowthTarget,
        36,
        capitalData.startMonth,
        capitalData.startYear
      );

      // Update monthly capital data
      capitalData.monthlyCapital = growthData.map((item) => ({
        month: item.monthIndex,
        year: item.year,
        initialCapital: item.capital,
        currentCapital: item.capital,
        targetCapital: item.target,
      }));
    }

    await capitalData.save();

    revalidatePath('/capital');
    revalidatePath('/dashboard');

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(capitalData)) };
  } catch (error) {
    console.error('Error updating capital:', error);
    return { success: false, error: 'Failed to update capital data' };
  }
}

export async function updateCapitalSettings(data: {
  startMonth: number;
  startYear: number;
  durationMonths: number;
}) {
  try {
    await connectDB();

    // Get existing capital data
    const capitalData = await Capital.findOne({});

    if (!capitalData) {
      return { success: false, error: 'Capital data not found' };
    }

    // Store the current capital value before updating
    const currentCapitalValue = capitalData.currentCapital;

    // Update settings
    capitalData.startMonth = data.startMonth;
    capitalData.startYear = data.startYear;

    // Generate new compound growth data with the updated settings
    const growthData = calculateCompoundGrowth(
      capitalData.initialCapital,
      capitalData.monthlyGrowthTarget,
      data.durationMonths,
      data.startMonth,
      data.startYear
    );

    // Update monthly capital data
    capitalData.monthlyCapital = growthData.map((item) => ({
      month: item.monthIndex,
      year: item.year,
      initialCapital: item.capital,
      currentCapital: item.capital,
      targetCapital: item.target,
    }));

    // Reset current month to start month
    capitalData.currentMonth = data.startMonth;
    capitalData.currentYear = data.startYear;

    // Set current capital to the initial capital of the first month
    if (capitalData.monthlyCapital.length > 0) {
      capitalData.currentCapital = capitalData.monthlyCapital[0].initialCapital;
    } else {
      capitalData.currentCapital = capitalData.initialCapital;
    }

    await capitalData.save();

    // Revalidate all paths that might use this data
    revalidatePath('/');
    revalidatePath('/capital');
    revalidatePath('/dashboard');
    revalidatePath('/bets');
    revalidatePath('/weekly-plan');
    revalidatePath('/monthly-summary');
    revalidatePath('/statistics');

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(capitalData)) };
  } catch (error) {
    console.error('Error updating capital settings:', error);
    return { success: false, error: 'Failed to update capital settings' };
  }
}

export async function updateMonthlyCapital(
  month: number,
  year: number,
  initialCapital: number
) {
  try {
    await connectDB();

    // Get existing capital data
    const capitalData = await Capital.findOne({});

    if (!capitalData) {
      return { success: false, error: 'Capital data not found' };
    }

    // Find the monthly capital entry to update
    const monthlyCapitalIndex = capitalData.monthlyCapital.findIndex(
      (item: any) => item.month === month && item.year === year
    );

    if (monthlyCapitalIndex === -1) {
      return { success: false, error: 'Monthly capital entry not found' };
    }

    // Update the initial capital for the month
    capitalData.monthlyCapital[monthlyCapitalIndex].initialCapital =
      initialCapital;
    capitalData.monthlyCapital[monthlyCapitalIndex].currentCapital =
      initialCapital;

    // Recalculate target capital
    capitalData.monthlyCapital[monthlyCapitalIndex].targetCapital = Math.round(
      initialCapital * (1 + capitalData.monthlyGrowthTarget)
    );

    // Update future months based on the new value
    for (
      let i = monthlyCapitalIndex + 1;
      i < capitalData.monthlyCapital.length;
      i++
    ) {
      const prevMonth = capitalData.monthlyCapital[i - 1];
      const targetCapital = Math.round(
        prevMonth.targetCapital * (1 + capitalData.monthlyGrowthTarget)
      );

      capitalData.monthlyCapital[i].initialCapital = prevMonth.targetCapital;
      capitalData.monthlyCapital[i].currentCapital = prevMonth.targetCapital;
      capitalData.monthlyCapital[i].targetCapital = targetCapital;
    }

    // If updating the current month, also update the current capital
    if (
      month === capitalData.currentMonth &&
      year === capitalData.currentYear
    ) {
      capitalData.currentCapital = initialCapital;
    }

    await capitalData.save();

    revalidatePath('/capital');
    revalidatePath('/dashboard');

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(capitalData)) };
  } catch (error) {
    console.error('Error updating monthly capital:', error);
    return { success: false, error: 'Failed to update monthly capital' };
  }
}

export async function advanceToNextMonth() {
  try {
    await connectDB();

    // Get existing capital data
    const capitalData = await Capital.findOne({});

    if (!capitalData) {
      return { success: false, error: 'Capital data not found' };
    }

    // Calculate next month
    let nextMonth = capitalData.currentMonth + 1;
    let nextYear = capitalData.currentYear;

    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }

    // Find the monthly capital entry for the next month
    const nextMonthCapital = capitalData.monthlyCapital.find(
      (item: any) => item.month === nextMonth && item.year === nextYear
    );

    if (!nextMonthCapital) {
      return { success: false, error: 'Next month capital entry not found' };
    }

    // Update current month and year
    capitalData.currentMonth = nextMonth;
    capitalData.currentYear = nextYear;

    // Update current capital to the initial capital of the next month
    capitalData.currentCapital = nextMonthCapital.initialCapital;

    await capitalData.save();

    revalidatePath('/capital');
    revalidatePath('/dashboard');

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(capitalData)) };
  } catch (error) {
    console.error('Error advancing to next month:', error);
    return { success: false, error: 'Failed to advance to next month' };
  }
}

export async function goToPreviousMonth() {
  try {
    await connectDB();

    // Get existing capital data
    const capitalData = await Capital.findOne({});

    if (!capitalData) {
      return { success: false, error: 'Capital data not found' };
    }

    // Check if we're at the first month
    if (
      capitalData.currentMonth === capitalData.startMonth &&
      capitalData.currentYear === capitalData.startYear
    ) {
      return { success: false, error: 'Already at the first month' };
    }

    // Calculate previous month
    let prevMonth = capitalData.currentMonth - 1;
    let prevYear = capitalData.currentYear;

    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }

    // Find the monthly capital entry for the previous month
    const prevMonthCapital = capitalData.monthlyCapital.find(
      (item: any) => item.month === prevMonth && item.year === prevYear
    );

    if (!prevMonthCapital) {
      return {
        success: false,
        error: 'Previous month capital entry not found',
      };
    }

    // Update current month and year
    capitalData.currentMonth = prevMonth;
    capitalData.currentYear = prevYear;

    // Update current capital to the current capital of the previous month
    capitalData.currentCapital = prevMonthCapital.currentCapital;

    await capitalData.save();

    revalidatePath('/capital');
    revalidatePath('/dashboard');

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(capitalData)) };
  } catch (error) {
    console.error('Error going to previous month:', error);
    return { success: false, error: 'Failed to go to previous month' };
  }
}

export async function resetCapital() {
  try {
    await connectDB();

    // Get existing capital data
    const capitalData = await Capital.findOne({});

    if (!capitalData) {
      return { success: false, error: 'Capital data not found' };
    }

    // Store original start values
    const { startMonth, startYear, initialCapital, monthlyGrowthTarget } =
      capitalData;

    // Get the duration from the current monthlyCapital array length
    const durationMonths = capitalData.monthlyCapital.length || 36;

    // Regenerate compound growth data
    const growthData = calculateCompoundGrowth(
      initialCapital,
      monthlyGrowthTarget,
      durationMonths,
      startMonth,
      startYear
    );

    // Reset monthly capital data
    capitalData.monthlyCapital = growthData.map((item) => ({
      month: item.monthIndex,
      year: item.year,
      initialCapital: item.capital,
      currentCapital: item.capital,
      targetCapital: item.target,
    }));

    // Reset current month and year to start values
    capitalData.currentMonth = startMonth;
    capitalData.currentYear = startYear;

    // Reset current capital to initial capital
    capitalData.currentCapital = initialCapital;

    await capitalData.save();

    revalidatePath('/capital');
    revalidatePath('/dashboard');
    revalidatePath('/weekly-plan');
    revalidatePath('/monthly-summary');
    revalidatePath('/statistics');

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(capitalData)) };
  } catch (error) {
    console.error('Error resetting capital:', error);
    return { success: false, error: 'Failed to reset capital data' };
  }
}
