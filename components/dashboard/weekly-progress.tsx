"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { getWeeklyPlan } from "@/lib/actions/weekly-plan-actions"

interface WeeklyProgressProps {
  weeklyPlanData: any
}

export function WeeklyProgress({ weeklyPlanData: initialWeeklyPlanData }: WeeklyProgressProps) {
  const [weeklyPlanData, setWeeklyPlanData] = useState(initialWeeklyPlanData)
  const [loading, setLoading] = useState(!initialWeeklyPlanData)
  const [betsProgress, setBetsProgress] = useState(0)
  const [profitProgress, setProfitProgress] = useState(0)

  useEffect(() => {
    async function fetchData() {
      if (!initialWeeklyPlanData) {
        setLoading(true)

        const result = await getWeeklyPlan()

        if (result.success) {
          setWeeklyPlanData(result.data)
        }

        setLoading(false)
      }
    }

    fetchData()
  }, [initialWeeklyPlanData])

  useEffect(() => {
    if (weeklyPlanData) {
      const { weeklyPlan, weeklyStats } = weeklyPlanData

      // Calculate progress
      const betsProgress = weeklyPlan.targetBets > 0 ? (weeklyPlan.betsPlaced / weeklyPlan.targetBets) * 100 : 0

      const profitProgress =
        weeklyStats.targetProfit > 0 ? (weeklyStats.currentProfit / weeklyStats.targetProfit) * 100 : 0

      setBetsProgress(Math.min(betsProgress, 100))
      setProfitProgress(Math.min(profitProgress, 100))
    }
  }, [weeklyPlanData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">Loading weekly progress...</p>
      </div>
    )
  }

  if (!weeklyPlanData) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">No weekly plan data available</p>
      </div>
    )
  }

  const { weeklyPlan, weeklyStats } = weeklyPlanData

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Bets Placed</span>
          <span className="text-sm text-muted-foreground">
            {weeklyPlan.betsPlaced}/{weeklyPlan.targetBets}
          </span>
        </div>
        <Progress value={betsProgress} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Weekly Profit</span>
          <span className="text-sm text-muted-foreground">
            {formatCurrency(weeklyStats.currentProfit)}/{formatCurrency(weeklyStats.targetProfit)}
          </span>
        </div>
        <Progress value={profitProgress} />
      </div>

      <div className="pt-2 border-t">
        <h4 className="text-sm font-medium mb-2">Weekly Plan</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Wins Needed</p>
            <p className="font-medium">{weeklyStats.winsNeeded} more</p>
          </div>
          <div>
            <p className="text-muted-foreground">Average Odds</p>
            <p className="font-medium">{weeklyPlan.averageOdds.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Unit Size</p>
            <p className="font-medium">{formatCurrency(weeklyStats.stakeAmount)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Win Rate</p>
            <p className="font-medium">
              {weeklyPlan.betsPlaced > 0 ? Math.round((weeklyPlan.betsWon / weeklyPlan.betsPlaced) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

