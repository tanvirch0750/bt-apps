'use client';

import { getBetStats } from '@/lib/actions/bet-actions';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface LeaguePerformanceProps {
  betStats: any;
}

export function LeaguePerformance({
  betStats: initialBetStats,
}: LeaguePerformanceProps) {
  const [betStats, setBetStats] = useState(initialBetStats);
  const [loading, setLoading] = useState(!initialBetStats);
  const [leagueData, setLeagueData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!initialBetStats) {
        setLoading(true);

        const result = await getBetStats();

        if (result.success) {
          setBetStats(result.data);
        }

        setLoading(false);
      }
    }

    fetchData();
  }, [initialBetStats]);

  useEffect(() => {
    if (betStats && betStats.leagueStats) {
      // Convert league stats object to array for chart
      const data = Object.entries(betStats.leagueStats).map(
        ([league, stats]: [string, any]) => ({
          league,
          profit: stats.profit,
          bets: stats.bets,
          winRate: stats.winRate,
        })
      );

      // Sort by profit
      data.sort((a, b) => b.profit - a.profit);

      setLeagueData(data);
    }
  }, [betStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    );
  }

  if (leagueData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No league data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={leagueData}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={true}
          vertical={false}
        />
        <XAxis
          type="number"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <YAxis
          type="category"
          dataKey="league"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Profit']}
          labelFormatter={(label) => `${label}`}
        />
        <Bar
          dataKey="profit"
          // @ts-ignore
          fill={(entry) => (entry.profit >= 0 ? '#10b981' : '#ef4444')}
          radius={[0, 4, 4, 0]}
          name="Profit"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
