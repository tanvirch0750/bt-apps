'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getBetStats } from '@/lib/actions/bet-actions';
import { getCapitalData } from '@/lib/actions/capital-actions';
import { calculateProgress, formatCurrency, getMonthName } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CapitalOverviewProps {
  capitalData: any;
  betStats: any;
}

export function CapitalOverview({
  capitalData: initialCapitalData,
  betStats: initialBetStats,
}: CapitalOverviewProps) {
  const [capitalData, setCapitalData] = useState(initialCapitalData);
  const [betStats, setBetStats] = useState(initialBetStats);
  const [loading, setLoading] = useState(
    !initialCapitalData || !initialBetStats
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!initialCapitalData || !initialBetStats) {
        setLoading(true);

        const [capitalResult, statsResult] = await Promise.all([
          getCapitalData(),
          getBetStats(),
        ]);

        if (capitalResult.success) {
          setCapitalData(capitalResult.data);
        }

        if (statsResult.success) {
          setBetStats(statsResult.data);
        }

        setLoading(false);
      }
    }

    fetchData();
  }, [initialCapitalData, initialBetStats]);

  useEffect(() => {
    if (capitalData) {
      // Find current month's capital data
      const currentMonthData = capitalData.monthlyCapital.find(
        (item: any) =>
          item.month === capitalData.currentMonth &&
          item.year === capitalData.currentYear
      );

      if (currentMonthData) {
        const currentProgress = calculateProgress(
          currentMonthData.currentCapital - currentMonthData.initialCapital,
          currentMonthData.targetCapital - currentMonthData.initialCapital
        );
        setProgress(currentProgress);
      }
    }
  }, [capitalData]);

  if (loading) {
    return (
      <>
        <Card className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-5 w-1/2 bg-muted rounded"></div>
            <div className="h-4 w-1/3 bg-muted rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-full bg-muted rounded"></div>
            <div className="h-4 w-2/3 bg-muted rounded mt-2"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-5 w-1/2 bg-muted rounded"></div>
            <div className="h-4 w-1/3 bg-muted rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-full bg-muted rounded"></div>
            <div className="h-4 w-2/3 bg-muted rounded mt-2"></div>
            <div className="h-4 w-full bg-muted rounded mt-2"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-5 w-1/2 bg-muted rounded"></div>
            <div className="h-4 w-1/3 bg-muted rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-full bg-muted rounded"></div>
            <div className="h-4 w-2/3 bg-muted rounded mt-2"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-5 w-1/2 bg-muted rounded"></div>
            <div className="h-4 w-1/3 bg-muted rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-full bg-muted rounded"></div>
            <div className="h-4 w-2/3 bg-muted rounded mt-2"></div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!capitalData) {
    return <div>Error loading capital data</div>;
  }

  // Find current month's capital data
  const currentMonthData = capitalData.monthlyCapital.find(
    (item: any) =>
      item.month === capitalData.currentMonth &&
      item.year === capitalData.currentYear
  );

  if (!currentMonthData) {
    return <div>Error: Current month data not found</div>;
  }

  const initialCapital = currentMonthData.initialCapital;
  const currentCapital = currentMonthData.currentCapital;
  const targetCapital = currentMonthData.targetCapital;

  const profitLoss = currentCapital - initialCapital;
  const isProfit = profitLoss >= 0;
  const remainingToTarget = targetCapital - currentCapital;

  // Get month number in the journey
  const startDate = new Date(capitalData.startYear, capitalData.startMonth);
  const currentDate = new Date(
    capitalData.currentYear,
    capitalData.currentMonth
  );
  const monthDiff =
    (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
    (currentDate.getMonth() - startDate.getMonth()) +
    1;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              Current Capital
            </CardTitle>
            <CardDescription>
              Month {monthDiff}: {getMonthName(capitalData.currentMonth)}{' '}
              {capitalData.currentYear}
            </CardDescription>
          </div>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(currentCapital)}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span className={isProfit ? 'text-green-500' : 'text-red-500'}>
              {isProfit ? '+' : ''}
              {formatCurrency(profitLoss)}
            </span>
            <span>from initial {formatCurrency(initialCapital)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
            <CardDescription>20% growth target</CardDescription>
          </div>
          <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(targetCapital)}
          </div>
          <div className="text-xs text-muted-foreground">
            Need {formatCurrency(remainingToTarget)} more
          </div>
          <Progress value={progress} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              Bets This Month
            </CardTitle>
            <CardDescription>Win/Loss ratio</CardDescription>
          </div>
          <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {betStats ? betStats.totalBets || 0 : 0}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span className="text-green-500">
              {betStats ? betStats.wins || 0 : 0} Won
            </span>
            <span>•</span>
            <span className="text-red-500">
              {betStats ? betStats.losses || 0 : 0} Lost
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
            <CardDescription>This month</CardDescription>
          </div>
          {isProfit ? (
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              isProfit ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {isProfit ? '+' : ''}
            {formatCurrency(profitLoss)}
          </div>
          <div className="text-xs text-muted-foreground">
            {initialCapital > 0
              ? ((profitLoss / initialCapital) * 100).toFixed(1)
              : 0}
            % of initial capital
          </div>
        </CardContent>
      </Card>
    </>
  );
}
