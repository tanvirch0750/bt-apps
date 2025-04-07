'use client';

import { getBetStats } from '@/lib/actions/bet-actions';
import { getAllWeeklyPlans } from '@/lib/actions/weekly-plan-actions';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface MonthlySummaryChartProps {
  weeklyPlans: any[];
}

export function MonthlySummaryChart({
  weeklyPlans: initialWeeklyPlans,
}: MonthlySummaryChartProps) {
  const [weeklyPlans, setWeeklyPlans] = useState<any[]>(
    initialWeeklyPlans || []
  );
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(initialWeeklyPlans.length === 0);

  useEffect(() => {
    async function fetchData() {
      if (initialWeeklyPlans.length === 0) {
        setLoading(true);

        const result = await getAllWeeklyPlans();

        if (result.success) {
          setWeeklyPlans(result.data);
        }

        setLoading(false);
      }
    }

    fetchData();
  }, [initialWeeklyPlans]);

  useEffect(() => {
    async function generateChartData() {
      if (weeklyPlans.length > 0) {
        setLoading(true);

        // Sort weekly plans by week number
        const sortedPlans = [...weeklyPlans].sort((a, b) => a.week - b.week);

        // Get bet stats for each week
        const weeklyData = await Promise.all(
          sortedPlans.map(async (plan) => {
            const statsResult = await getBetStats({
              month: plan.month,
              year: plan.year,
              week: plan.week,
            });

            const stats =
              statsResult.success && statsResult.data
                ? statsResult.data
                : {
                    totalProfit: 0,
                    totalBets: 0,
                    wins: 0,
                    losses: 0,
                  };

            return {
              week: `Week ${plan.week}`,
              profit: stats.totalProfit,
              bets: stats.totalBets,
              wins: stats.wins,
              losses: stats.losses,
            };
          })
        );

        setChartData(weeklyData);
        setLoading(false);
      }
    }

    generateChartData();
  }, [weeklyPlans]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">
          No data available for the current month
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          domain={[0, 'auto']}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === 'profit') return [formatCurrency(value), 'Profit'];
            if (name === 'wins') return [value, 'Wins'];
            if (name === 'losses') return [value, 'Losses'];
            return [value, 'Bets'];
          }}
          labelFormatter={(label) => `${label}`}
        />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="profit"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
          name="Profit"
        />
        <Bar
          yAxisId="right"
          dataKey="wins"
          fill="#0ea5e9"
          radius={[4, 4, 0, 0]}
          name="Wins"
          stackId="a"
        />
        <Bar
          yAxisId="right"
          dataKey="losses"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
          name="Losses"
          stackId="a"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
