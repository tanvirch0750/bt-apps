'use client';

import { getCapitalData } from '@/lib/actions/capital-actions';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface CapitalChartProps {
  capitalData: any;
}

export function CapitalChart({
  capitalData: initialCapitalData,
}: CapitalChartProps) {
  const [capitalData, setCapitalData] = useState(initialCapitalData);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(!initialCapitalData);

  useEffect(() => {
    async function fetchData() {
      if (!initialCapitalData) {
        setLoading(true);

        const result = await getCapitalData();

        if (result.success) {
          setCapitalData(result.data);
        }

        setLoading(false);
      }
    }

    fetchData();
  }, [initialCapitalData]);

  useEffect(() => {
    if (capitalData) {
      // Find current month index
      const currentMonthIndex = capitalData.monthlyCapital.findIndex(
        (item: any) =>
          item.month === capitalData.currentMonth &&
          item.year === capitalData.currentYear
      );

      if (currentMonthIndex !== -1) {
        // Get 6 months of data (current month and 5 future months)
        const sixMonthsData = capitalData.monthlyCapital.slice(
          currentMonthIndex,
          currentMonthIndex + 6
        );

        // Format data for chart
        const formattedData = sixMonthsData.map((item: any) => ({
          month: `${item.month + 1}/${item.year.toString().slice(2)}`, // Format as MM/YY
          capital: item.currentCapital,
          target: item.targetCapital,
          initialCapital: item.initialCapital,
        }));

        setChartData(formattedData);
      }
    }
  }, [capitalData]);

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
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorInitial" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          domain={['auto', 'auto']}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), undefined]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="initialCapital"
          stroke="#f59e0b"
          fillOpacity={1}
          fill="url(#colorInitial)"
          name="Initial"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="capital"
          stroke="#0ea5e9"
          fillOpacity={1}
          fill="url(#colorCapital)"
          name="Current"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="target"
          stroke="#10b981"
          fillOpacity={1}
          fill="url(#colorTarget)"
          name="Target"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
