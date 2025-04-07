"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { getBetStats } from "@/lib/actions/bet-actions"

interface BetTypePerformanceProps {
  betStats: any
}

export function BetTypePerformance({ betStats: initialBetStats }: BetTypePerformanceProps) {
  const [betStats, setBetStats] = useState(initialBetStats)
  const [loading, setLoading] = useState(!initialBetStats)
  const [betTypeData, setBetTypeData] = useState<any[]>([])

  // Define colors for different bet types
  const colors = {
    Win: "#10b981",
    Draw: "#0ea5e9",
    Over: "#8b5cf6",
    Under: "#f43f5e",
    BTTS: "#f59e0b",
    Other: "#6b7280",
  }

  useEffect(() => {
    async function fetchData() {
      if (!initialBetStats) {
        setLoading(true)

        const result = await getBetStats()

        if (result.success) {
          setBetStats(result.data)
        }

        setLoading(false)
      }
    }

    fetchData()
  }, [initialBetStats])

  useEffect(() => {
    if (betStats && betStats.betTypeStats) {
      // Convert bet type stats object to array for chart
      const data = Object.entries(betStats.betTypeStats).map(([name, stats]: [string, any]) => ({
        name,
        value: stats.bets,
        profit: stats.profit,
        winRate: stats.winRate,
        color: colors[name as keyof typeof colors] || "#6b7280",
      }))

      setBetTypeData(data)
    }
  }, [betStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    )
  }

  if (betTypeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No bet type data available</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <h4 className="text-sm font-medium mb-4 text-center">Bet Types Distribution</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={betTypeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {betTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                return [`${value} bets`, name]
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-4">Performance by Bet Type</h4>
        <div className="space-y-4">
          {betTypeData.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className={`text-sm font-medium ${item.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {item.profit >= 0 ? "+" : ""}
                    {formatCurrency(item.profit)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.value} bets</span>
                  <span>{item.winRate.toFixed(1)}% Win Rate</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

