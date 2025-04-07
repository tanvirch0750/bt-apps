'use server';

import connectDB from '@/lib/db';
import Bet from '@/lib/models/bet';
import Capital from '@/lib/models/capital';
import WeeklyPlan from '@/lib/models/weekly-plan';
import { getCurrentWeekOfMonth } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export type BetFormData = {
  matchName: string;
  league: string;
  date: Date;
  odds: number;
  stake: number;
  betType: string;
  result: 'Win' | 'Loss' | 'Pending';
  notes?: string;
};

export async function createBet(formData: BetFormData) {
  try {
    await connectDB();

    // Get current capital data
    const capitalData = await Capital.findOne({});

    if (!capitalData) {
      return { success: false, error: 'Capital data not found' };
    }

    const { currentMonth, currentYear } = capitalData;
    const currentWeek = getCurrentWeekOfMonth();

    // Calculate profit based on result
    let profit = 0;
    if (formData.result === 'Win') {
      profit = Math.round(formData.stake * (formData.odds - 1));
    } else if (formData.result === 'Loss') {
      profit = -formData.stake;
    }

    // Create new bet
    const newBet = await Bet.create({
      ...formData,
      month: currentMonth,
      year: currentYear,
      week: currentWeek,
      profit,
    });

    // Update capital if bet is not pending
    if (formData.result !== 'Pending') {
      capitalData.currentCapital += profit;

      // Find and update the current month's capital
      const monthlyCapitalIndex = capitalData.monthlyCapital.findIndex(
        (item: any) => item.month === currentMonth && item.year === currentYear
      );

      if (monthlyCapitalIndex !== -1) {
        capitalData.monthlyCapital[monthlyCapitalIndex].currentCapital +=
          profit;
      }

      await capitalData.save();
    }

    // Update weekly plan stats
    const weeklyPlan = await WeeklyPlan.findOne({
      month: currentMonth,
      year: currentYear,
      week: currentWeek,
    });

    if (weeklyPlan) {
      weeklyPlan.betsPlaced += 1;

      if (formData.result === 'Win') {
        weeklyPlan.betsWon += 1;
      } else if (formData.result === 'Loss') {
        weeklyPlan.betsLost += 1;
      } else {
        weeklyPlan.betsPending += 1;
      }

      await weeklyPlan.save();
    }

    revalidatePath('/bets');
    revalidatePath('/dashboard');
    revalidatePath('/weekly-plan');
    revalidatePath('/monthly-summary');
    revalidatePath('/statistics');

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(newBet)) };
  } catch (error) {
    console.error('Error creating bet:', error);
    return { success: false, error: 'Failed to create bet' };
  }
}

export async function getBets(filters?: {
  month?: number;
  year?: number;
  week?: number;
  result?: string;
  league?: string;
  limit?: number;
  skip?: number;
}) {
  try {
    await connectDB();

    // Build query based on filters
    const query: any = {};

    if (filters?.month !== undefined) {
      query.month = filters.month;
    }

    if (filters?.year !== undefined) {
      query.year = filters.year;
    }

    if (filters?.week !== undefined) {
      query.week = filters.week;
    }

    if (filters?.result) {
      query.result = filters.result;
    }

    if (filters?.league) {
      query.league = filters.league;
    }

    // Get bets with pagination
    const limit = filters?.limit || 10;
    const skip = filters?.skip || 0;

    const bets = await Bet.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);
    const total = await Bet.countDocuments(query);

    // Stringify the result to avoid circular references
    return {
      success: true,
      data: {
        bets: JSON.parse(JSON.stringify(bets)),
        pagination: {
          total,
          limit,
          skip,
          hasMore: total > skip + limit,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching bets:', error);
    return { success: false, error: 'Failed to fetch bets' };
  }
}

export async function getBetById(id: string) {
  try {
    await connectDB();

    const bet = await Bet.findById(id);

    if (!bet) {
      return { success: false, error: 'Bet not found' };
    }

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(bet)) };
  } catch (error) {
    console.error('Error fetching bet:', error);
    return { success: false, error: 'Failed to fetch bet' };
  }
}

export async function updateBet(id: string, formData: Partial<BetFormData>) {
  try {
    await connectDB();

    // Get bet
    const bet = await Bet.findById(id);

    if (!bet) {
      return { success: false, error: 'Bet not found' };
    }

    // Get capital data
    const capitalData = await Capital.findOne({});

    if (!capitalData) {
      return { success: false, error: 'Capital data not found' };
    }

    // Calculate old profit
    const oldProfit = bet.profit;

    // Calculate new profit if result or odds or stake changed
    let newProfit = oldProfit;
    if (formData.result || formData.odds || formData.stake) {
      const result = formData.result || bet.result;
      const odds = formData.odds || bet.odds;
      const stake = formData.stake || bet.stake;

      if (result === 'Win') {
        newProfit = Math.round(stake * (odds - 1));
      } else if (result === 'Loss') {
        newProfit = -stake;
      } else {
        newProfit = 0;
      }
    }

    // Update weekly plan stats if result changed
    if (formData.result && formData.result !== bet.result) {
      const weeklyPlan = await WeeklyPlan.findOne({
        month: bet.month,
        year: bet.year,
        week: bet.week,
      });

      if (weeklyPlan) {
        // Remove old result
        if (bet.result === 'Win') {
          weeklyPlan.betsWon -= 1;
        } else if (bet.result === 'Loss') {
          weeklyPlan.betsLost -= 1;
        } else if (bet.result === 'Pending') {
          weeklyPlan.betsPending -= 1;
        }

        // Add new result
        if (formData.result === 'Win') {
          weeklyPlan.betsWon += 1;
        } else if (formData.result === 'Loss') {
          weeklyPlan.betsLost += 1;
        } else if (formData.result === 'Pending') {
          weeklyPlan.betsPending += 1;
        }

        await weeklyPlan.save();
      }
    }

    // Update capital if profit changed
    if (newProfit !== oldProfit) {
      // Adjust capital
      const profitDifference = newProfit - oldProfit;

      // Only adjust capital if the bet was not pending before and after update
      if (bet.result !== 'Pending' || formData.result !== 'Pending') {
        capitalData.currentCapital += profitDifference;

        // Find and update the current month's capital
        const monthlyCapitalIndex = capitalData.monthlyCapital.findIndex(
          (item: any) => item.month === bet.month && item.year === bet.year
        );

        if (monthlyCapitalIndex !== -1) {
          capitalData.monthlyCapital[monthlyCapitalIndex].currentCapital +=
            profitDifference;
        }

        await capitalData.save();
      }
    }

    // Update bet
    Object.assign(bet, formData);
    bet.profit = newProfit;
    await bet.save();

    revalidatePath('/bets');
    revalidatePath('/dashboard');
    revalidatePath('/weekly-plan');
    revalidatePath('/monthly-summary');
    revalidatePath('/statistics');

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(bet)) };
  } catch (error) {
    console.error('Error updating bet:', error);
    return { success: false, error: 'Failed to update bet' };
  }
}

export async function deleteBet(id: string) {
  try {
    await connectDB();

    // Get bet
    const bet = await Bet.findById(id);

    if (!bet) {
      return { success: false, error: 'Bet not found' };
    }

    // Get capital data
    const capitalData = await Capital.findOne({});

    if (!capitalData) {
      return { success: false, error: 'Capital data not found' };
    }

    // Update weekly plan stats
    const weeklyPlan = await WeeklyPlan.findOne({
      month: bet.month,
      year: bet.year,
      week: bet.week,
    });

    if (weeklyPlan) {
      weeklyPlan.betsPlaced -= 1;

      if (bet.result === 'Win') {
        weeklyPlan.betsWon -= 1;
      } else if (bet.result === 'Loss') {
        weeklyPlan.betsLost -= 1;
      } else if (bet.result === 'Pending') {
        weeklyPlan.betsPending -= 1;
      }

      await weeklyPlan.save();
    }

    // Update capital if bet was not pending
    if (bet.result !== 'Pending') {
      capitalData.currentCapital -= bet.profit;

      // Find and update the current month's capital
      const monthlyCapitalIndex = capitalData.monthlyCapital.findIndex(
        (item: any) => item.month === bet.month && item.year === bet.year
      );

      if (monthlyCapitalIndex !== -1) {
        capitalData.monthlyCapital[monthlyCapitalIndex].currentCapital -=
          bet.profit;
      }

      await capitalData.save();
    }

    // Delete bet
    await Bet.findByIdAndDelete(id);

    revalidatePath('/bets');
    revalidatePath('/dashboard');
    revalidatePath('/weekly-plan');
    revalidatePath('/monthly-summary');
    revalidatePath('/statistics');

    return { success: true };
  } catch (error) {
    console.error('Error deleting bet:', error);
    return { success: false, error: 'Failed to delete bet' };
  }
}

export async function getBetStats(filters?: {
  month?: number;
  year?: number;
  week?: number;
  league?: string;
}) {
  try {
    await connectDB();

    // Build query based on filters
    const query: any = {};

    if (filters?.month !== undefined) {
      query.month = filters.month;
    }

    if (filters?.year !== undefined) {
      query.year = filters.year;
    }

    if (filters?.week !== undefined) {
      query.week = filters.week;
    }

    if (filters?.league) {
      query.league = filters.league;
    }

    // Get all bets matching the query
    const bets = await Bet.find(query);

    // Calculate stats
    const totalBets = bets.length;
    const wins = bets.filter((bet) => bet.result === 'Win').length;
    const losses = bets.filter((bet) => bet.result === 'Loss').length;
    const pending = bets.filter((bet) => bet.result === 'Pending').length;

    const totalProfit = bets.reduce((sum, bet) => sum + bet.profit, 0);
    const totalStake = bets.reduce(
      (sum, bet) => sum + (bet.result !== 'Pending' ? bet.stake : 0),
      0
    );

    const winRate = totalBets > 0 ? (wins / (wins + losses)) * 100 : 0;
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;

    // Calculate average odds
    const completedBets = bets.filter((bet) => bet.result !== 'Pending');
    const averageOdds =
      completedBets.length > 0
        ? completedBets.reduce((sum, bet) => sum + bet.odds, 0) /
          completedBets.length
        : 0;

    // Get stats by league
    const leagueStats = {};
    const leagues = [...new Set(bets.map((bet) => bet.league))];

    leagues.forEach((league) => {
      const leagueBets = bets.filter((bet) => bet.league === league);
      const leagueWins = leagueBets.filter(
        (bet) => bet.result === 'Win'
      ).length;
      const leagueLosses = leagueBets.filter(
        (bet) => bet.result === 'Loss'
      ).length;
      const leagueProfit = leagueBets.reduce((sum, bet) => sum + bet.profit, 0);
      // @ts-ignore
      leagueStats[league] = {
        bets: leagueBets.length,
        wins: leagueWins,
        losses: leagueLosses,
        profit: leagueProfit,
        winRate:
          leagueBets.length > 0
            ? (leagueWins / (leagueWins + leagueLosses)) * 100
            : 0,
      };
    });

    // Get stats by bet type
    const betTypeStats = {};
    const betTypes = [...new Set(bets.map((bet) => bet.betType))];

    betTypes.forEach((betType) => {
      const typeBets = bets.filter((bet) => bet.betType === betType);
      const typeWins = typeBets.filter((bet) => bet.result === 'Win').length;
      const typeLosses = typeBets.filter((bet) => bet.result === 'Loss').length;
      const typeProfit = typeBets.reduce((sum, bet) => sum + bet.profit, 0);
      // @ts-ignore
      betTypeStats[betType] = {
        bets: typeBets.length,
        wins: typeWins,
        losses: typeLosses,
        profit: typeProfit,
        winRate:
          typeBets.length > 0 ? (typeWins / (typeWins + typeLosses)) * 100 : 0,
      };
    });

    // Create a plain object with all the stats
    const statsData = {
      totalBets,
      wins,
      losses,
      pending,
      totalProfit,
      totalStake,
      winRate,
      roi,
      averageOdds,
      leagueStats,
      betTypeStats,
    };

    // Stringify the result to avoid circular references
    return { success: true, data: JSON.parse(JSON.stringify(statsData)) };
  } catch (error) {
    console.error('Error fetching bet stats:', error);
    // Return default values in case of error
    return {
      success: false,
      error: 'Failed to fetch bet statistics',
      data: {
        totalBets: 0,
        wins: 0,
        losses: 0,
        pending: 0,
        totalProfit: 0,
        totalStake: 0,
        winRate: 0,
        roi: 0,
        averageOdds: 0,
        leagueStats: {},
        betTypeStats: {},
      },
    };
  }
}
