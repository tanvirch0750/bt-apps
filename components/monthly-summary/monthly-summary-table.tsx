"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { getAllWeeklyPlans } from "@/lib/actions/weekly-plan-actions"
import { getBetStats } from "@/lib/actions/bet-actions"

interface MonthlySummaryTableProps {
  weeklyPlans: any[]
}

export function MonthlySummaryTable({ weeklyPlans: initialWeeklyPlans }: MonthlySummaryTableProps) {
  const [weeklyPlans, setWeeklyPlans] = useState<any[]>(initialWeeklyPlans || [])
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [monthlyTotals, setMonthlyTotals] = useState({
    wins: 0,
    losses: 0,
    profit: 0,
    roi: 0,
  })

  useEffect(() => {
    async function fetchData() {
      if (initialWeeklyPlans.length === 0) {
        const result = await getAllWeeklyPlans()

        if (result.success) {
          setWeeklyPlans(result.data)
        }
      }
    }

    fetchData()
  }, [initialWeeklyPlans])

  useEffect(() => {
    async function generateWeeklyData() {
      if (weeklyPlans.length > 0) {
        setLoading(true)

        // Sort weekly plans by week number
        const sortedPlans = [...weeklyPlans].sort((a, b) => a.week - b.week)

        // Get bet stats for each week
        const data = await Promise.all(
          sortedPlans.map(async (plan) => {
            const statsResult = await getBetStats({
              month: plan.month,
              year: plan.year,
              week: plan.week,
            })

            const stats = statsResult.success
              ? statsResult.data
              : {
                  wins: 0,
                  losses: 0,
                  totalProfit: 0,
                  totalStake: 0,
                  roi: 0,
                }

            return {
              week: `Week ${plan.week}`,
              bets: plan.betsPlaced,
              wins: stats.wins,
              losses: stats.losses,
              profit: stats.totalProfit,
              roi: stats.roi,
            }
          }),
        )

        setWeeklyData(data)

        // Calculate monthly totals
        const totals = data.reduce(
          (acc, week) => {
            return {
              wins: acc.wins + week.wins,
              losses: acc.losses + week.losses,
              profit: acc.profit + week.profit,
              roi: 0, // Will calculate average ROI after
            }
          },
          { wins: 0, losses: 0, profit: 0, roi: 0 },
        )

        // Calculate average ROI
        totals.roi = data.length > 0 ? data.reduce((sum, week) => sum + week.roi, 0) / data.length : 0

        setMonthlyTotals(totals)
        setLoading(false)
      }
    }

    generateWeeklyData()
  }, [weeklyPlans])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Loading data...</p>
      </div>
    )
  }

  if (weeklyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No data available for the current month</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {weeklyData.map((week, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{week.week}</h4>
            <span className="text-sm text-muted-foreground">
              {week.wins} wins, {week.losses} losses
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Win Rate</span>
              <span>{week.bets > 0 ? Math.round((week.wins / (week.wins + week.losses)) * 100) : 0}%</span>
            </div>
            <Progress value={week.bets > 0 ? (week.wins / (week.wins + week.losses)) * 100 : 0} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Profit</p>
              <p className={`font-medium ${week.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {week.profit >= 0 ? "+" : ""}
                {formatCurrency(week.profit)}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">ROI</p>
              <p className="font-medium">{week.roi.toFixed(1)}%</p>
            </div>
          </div>

          {index < weeklyData.length - 1 && <div className="border-t my-2" />}
        </div>
      ))}

      <div className="pt-2 border-t">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Monthly Total</h4>
          <span className="text-sm text-muted-foreground">
            {monthlyTotals.wins} wins, {monthlyTotals.losses} losses
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
          <div>
            <p className="text-muted-foreground">Total Profit</p>
            <p className={`font-medium ${monthlyTotals.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {monthlyTotals.profit >= 0 ? "+" : ""}
              {formatCurrency(monthlyTotals.profit)}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">Average ROI</p>
            <p className="font-medium">{monthlyTotals.roi.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

