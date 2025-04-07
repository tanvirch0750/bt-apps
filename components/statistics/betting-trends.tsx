'use client';

import { getBetStats } from '@/lib/actions/bet-actions';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface BettingTrendsProps {
  betStats: any;
}

export function BettingTrends({
  betStats: initialBetStats,
}: BettingTrendsProps) {
  const [betStats, setBetStats] = useState(initialBetStats);
  const [loading, setLoading] = useState(!initialBetStats);
  const [trendData, setTrendData] = useState<any[]>([]);

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
    async function fetchTrendData() {
      // In a real app, we would fetch historical data from the API
      // For now, we'll generate data based on the current stats

      if (betStats) {
        setLoading(true);

        try {
          // Get the last 7 days of data
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

          // Create a more realistic trend based on actual data
          const baseWinRate = betStats.winRate || 50;
          const baseROI = betStats.roi || 10;

          const trendData = days.map((day, index) => {
            // Create slight variations around the actual values
            const variation = Math.sin(index) * 10; // -10 to 10 variation
            const winRate = Math.max(0, Math.min(100, baseWinRate + variation));
            const roi = Math.max(0, baseROI + variation);

            return {
              day,
              winRate: Math.round(winRate),
              roi: Math.round(roi),
            };
          });

          setTrendData(trendData);
        } catch (error) {
          console.error('Error generating trend data:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchTrendData();
  }, [betStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    );
  }

  if (trendData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No trend data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={trendData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          formatter={(value: number) => [`${value}%`, undefined]}
          labelFormatter={(label) => `${label}`}
        />
        <Line
          type="monotone"
          dataKey="winRate"
          stroke="#0ea5e9"
          name="Win Rate"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="roi"
          stroke="#10b981"
          name="ROI"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
