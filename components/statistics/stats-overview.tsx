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
import { ArrowUpIcon, BarChart3, Percent, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatsOverviewProps {
  betStats: any;
}

export function StatsOverview({
  betStats: initialBetStats,
}: StatsOverviewProps) {
  const [betStats, setBetStats] = useState(initialBetStats);
  const [capitalData, setCapitalData] = useState<any>(null);
  const [loading, setLoading] = useState(!initialBetStats);

  useEffect(() => {
    async function fetchData() {
      if (!initialBetStats) {
        setLoading(true);

        const [statsResult, capitalResult] = await Promise.all([
          getBetStats(),
          getCapitalData(),
        ]);

        if (statsResult.success) {
          setBetStats(statsResult.data);
        }

        if (capitalResult.success) {
          setCapitalData(capitalResult.data);
        }

        setLoading(false);
      } else {
        // Still fetch capital data if not already loaded
        const capitalResult = await getCapitalData();
        if (capitalResult.success) {
          setCapitalData(capitalResult.data);
        }
      }
    }

    fetchData();
  }, [initialBetStats]);

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

  if (!betStats) {
    return (
      <>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Error loading statistics
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  // Get start date from capital data if available
  let startDateText = 'All time';
  if (capitalData) {
    const { startMonth, startYear } = capitalData;
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    startDateText = `Since ${monthNames[startMonth]} ${startYear}`;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
            <CardDescription>All time</CardDescription>
          </div>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{betStats?.totalBets || 0}</div>
          <div className="text-xs text-muted-foreground">{startDateText}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <CardDescription>All time</CardDescription>
          </div>
          <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {betStats?.winRate !== undefined
              ? betStats.winRate.toFixed(1)
              : '0.0'}
            %
          </div>
          <div className="text-xs text-muted-foreground">
            {betStats
              ? `${betStats.wins || 0} wins, ${betStats.losses || 0} losses`
              : 'No data'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Average Odds</CardTitle>
            <CardDescription>All time</CardDescription>
          </div>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {betStats?.averageOdds !== undefined
              ? betStats.averageOdds.toFixed(2)
              : '0.00'}
          </div>
          <div className="text-xs text-muted-foreground">
            Based on {betStats?.totalBets || 0} bets
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
            Based on total stake
          </div>
        </CardContent>
      </Card>
    </>
  );
}
