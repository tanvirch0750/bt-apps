'use server';

import connectDB from '@/lib/db';
import Bet from '@/lib/models/bet';
import Capital from '@/lib/models/capital';
import WeeklyPlan from '@/lib/models/weekly-plan';
import { getCurrentWeekOfMonth } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export type WeeklyPlanFormData = {
  targetBets: number;
  averageOdds: number;
  unitSize: number;
  week: number;
};

export async function createOrUpdateWeeklyPlan(formData: WeeklyPlanFormData) {
  try {
    await connectDB();

    // Get current capital data
    const capitalData = await Capital.findOne({});

    if (!capitalData) {
      return { success: false, error: 'Capital data not found' };
    }

    const { currentMonth, currentYear } = capitalData;
    const week = formData.week || getCurrentWeekOfMonth();

    // Check if weekly plan already exists
    let weeklyPlan = await WeeklyPlan.findOne({
      month: currentMonth,
      year: currentYear,
      week,
    });

    if (weeklyPlan) {
      // Update existing plan
      weeklyPlan.targetBets = formData.targetBets;
      weeklyPlan.averageOdds = formData.averageOdds;
      weeklyPlan.unitSize = formData.unitSize / 100; // Convert percentage to decimal
    } else {
      // Create new plan
      weeklyPlan = new WeeklyPlan({
        month: currentMonth,
        year: currentYear,
        week,
        targetBets: formData.targetBets,
        averageOdds: formData.averageOdds,
        unitSize: formData.unitSize / 100, // Convert percentage to decimal
        betsPlaced: 0,
        betsWon: 0,
        betsLost: 0,
        betsPending: 0,
      });
    }

    await weeklyPlan.save();

    revalidatePath('/weekly-plan');
    revalidatePath('/dashboard');
    // Revalidate all paths that might use this data
    revalidatePath('/bets');
    revalidatePath('/bets/new');
    revalidatePath('/capital');

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(weeklyPlan)) };
  } catch (error) {
    console.error('Error creating/updating weekly plan:', error);
    return { success: false, error: 'Failed to save weekly plan' };
  }
}

export async function getWeeklyPlan(week?: number) {
  try {
    await connectDB();

    // Get current capital data
    const capitalData = await Capital.findOne({});

    if (!capitalData) {
      return { success: false, error: 'Capital data not found' };
    }

    const { currentMonth, currentYear } = capitalData;
    const currentWeek = week || getCurrentWeekOfMonth();

    // Get weekly plan
    let weeklyPlan = await WeeklyPlan.findOne({
      month: currentMonth,
      year: currentYear,
      week: currentWeek,
    });

    // If no plan exists, return default values
    if (!weeklyPlan) {
      // @ts-ignore
      weeklyPlan = {
        month: currentMonth,
        year: currentYear,
        week: currentWeek,
        targetBets: 5,
        averageOdds: 1.8,
        unitSize: 0.05, // 5% of monthly capital
        betsPlaced: 0,
        betsWon: 0,
        betsLost: 0,
        betsPending: 0,
      };
    } else {
      // Convert to plain object
      // @ts-ignore
      weeklyPlan = weeklyPlan.toObject();
    }

    // Get monthly capital data
    const monthlyCapital = capitalData.monthlyCapital.find(
      (item: any) => item.month === currentMonth && item.year === currentYear
    );

    const initialCapital = monthlyCapital
      ? monthlyCapital.initialCapital
      : capitalData.initialCapital;
    const currentCapital = monthlyCapital
      ? monthlyCapital.currentCapital
      : capitalData.currentCapital;
    const targetCapital = monthlyCapital
      ? monthlyCapital.targetCapital
      : capitalData.initialCapital * 1.2;

    // Calculate weekly target profit (20% of monthly target divided by 4 weeks)
    const monthlyTargetProfit = targetCapital - initialCapital;
    const weeklyTargetProfit = Math.round(monthlyTargetProfit / 4);

    // Get bets for the current week
    const weeklyBets = await Bet.find({
      month: currentMonth,
      year: currentYear,
      week: currentWeek,
    });

    // Calculate current weekly profit
    const weeklyProfit = weeklyBets.reduce((sum, bet) => sum + bet.profit, 0);

    // Calculate wins needed to reach weekly target
    // @ts-ignore
    const stakeAmount = Math.round(initialCapital * weeklyPlan.unitSize);
    const potentialWinPerBet = Math.round(
      // @ts-ignore
      stakeAmount * (weeklyPlan.averageOdds - 1)
    );
    const remainingProfit = weeklyTargetProfit - weeklyProfit;
    const winsNeeded = Math.ceil(remainingProfit / potentialWinPerBet);

    // Create a plain object with all the data
    const weeklyPlanData = {
      weeklyPlan,
      monthlyCapital: {
        initialCapital,
        currentCapital,
        targetCapital,
      },
      weeklyStats: {
        targetProfit: weeklyTargetProfit,
        currentProfit: weeklyProfit,
        stakeAmount,
        winsNeeded: Math.max(0, winsNeeded),
        remainingBets: Math.max(
          0,
          // @ts-ignore
          weeklyPlan.targetBets - weeklyPlan.betsPlaced
        ),
      },
    };

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(weeklyPlanData)) };
  } catch (error) {
    console.error('Error fetching weekly plan:', error);
    return { success: false, error: 'Failed to fetch weekly plan' };
  }
}

export async function getAllWeeklyPlans() {
  try {
    await connectDB();

    // Get current capital data
    const capitalData = await Capital.findOne({});

    if (!capitalData) {
      return { success: false, error: 'Capital data not found' };
    }

    const { currentMonth, currentYear } = capitalData;

    // Get all weekly plans for the current month
    const weeklyPlans = await WeeklyPlan.find({
      month: currentMonth,
      year: currentYear,
    }).sort({ week: 1 });

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(weeklyPlans)) };
  } catch (error) {
    console.error('Error fetching weekly plans:', error);
    return { success: false, error: 'Failed to fetch weekly plans' };
  }
}
