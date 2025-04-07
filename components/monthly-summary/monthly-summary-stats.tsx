'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getBetStats } from '@/lib/actions/bet-actions';
import { getCapitalData } from '@/lib/actions/capital-actions';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpIcon, BarChart3, Percent, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MonthlySummaryStatsProps {
  capitalData: any;
  betStats: any;
}

export function MonthlySummaryStats({
  capitalData: initialCapitalData,
  betStats: initialBetStats,
}: MonthlySummaryStatsProps) {
  const [capitalData, setCapitalData] = useState(initialCapitalData);
  const [betStats, setBetStats] = useState(initialBetStats);
  const [loading, setLoading] = useState(
    !initialCapitalData || !initialBetStats
  );

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

  if (!capitalData || !betStats) {
    return (
      <>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Error loading data
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  // Find current month's capital data
  const currentMonthData = capitalData.monthlyCapital.find(
    (item: any) =>
      item.month === capitalData.currentMonth &&
      item.year === capitalData.currentYear
  );

  if (!currentMonthData) {
    return (
      <>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Current month data not found
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  const initialCapital = currentMonthData.initialCapital;
  const currentCapital = currentMonthData.currentCapital;
  const profitLoss = currentCapital - initialCapital;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
            <CardDescription>This month</CardDescription>
          </div>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{betStats?.totalBets || 0}</div>
          <div className="text-xs text-muted-foreground">
            {Math.round((betStats?.totalBets || 0) / 4)} bets per week
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              Win/Loss Ratio
            </CardTitle>
            <CardDescription>This month</CardDescription>
          </div>
          <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {betStats?.winRate !== undefined
              ? betStats.winRate.toFixed(0)
              : '0'}
            %
          </div>
          <div className="text-xs text-muted-foreground">
            {betStats?.wins || 0} wins, {betStats?.losses || 0} losses
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <CardDescription>This month</CardDescription>
          </div>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {profitLoss >= 0 ? '+' : ''}
            {formatCurrency(profitLoss)}
          </div>
          <div className="text-xs text-muted-foreground">
            {initialCapital > 0
              ? ((profitLoss / initialCapital) * 100).toFixed(1)
              : '0.0'}
            % of monthly goal
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <CardDescription>Return on investment</CardDescription>
          </div>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {betStats?.roi !== undefined ? betStats.roi.toFixed(1) : '0.0'}%
          </div>
          <div className="text-xs text-muted-foreground">
            Based on {formatCurrency(betStats?.totalStake || 0)} stake
          </div>
        </CardContent>
      </Card>
    </>
  );
}
