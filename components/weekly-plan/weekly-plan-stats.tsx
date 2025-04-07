"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, calculateProgress } from "@/lib/utils"
import { getWeeklyPlan } from "@/lib/actions/weekly-plan-actions"

interface WeeklyPlanStatsProps {
  weeklyPlanData: any
}

export function WeeklyPlanStats({ weeklyPlanData: initialWeeklyPlanData }: WeeklyPlanStatsProps) {
  const [weeklyPlanData, setWeeklyPlanData] = useState(initialWeeklyPlanData)
  const [loading, setLoading] = useState(!initialWeeklyPlanData)
  const [betsProgress, setBetsProgress] = useState(0)
  const [profitProgress, setProfitProgress] = useState(0)
  const [monthlyProgress, setMonthlyProgress] = useState(0)

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
      const { weeklyPlan, weeklyStats, monthlyCapital } = weeklyPlanData

      // Calculate progress
      const betsProgress =
        weeklyPlan.targetBets > 0 ? calculateProgress(weeklyPlan.betsPlaced, weeklyPlan.targetBets) : 0

      const profitProgress =
        weeklyStats.targetProfit > 0 ? calculateProgress(weeklyStats.currentProfit, weeklyStats.targetProfit) : 0

      const monthlyTarget = monthlyCapital.targetCapital - monthlyCapital.initialCapital
      const currentProgress = monthlyCapital.currentCapital - monthlyCapital.initialCapital
      const monthlyProgress = monthlyTarget > 0 ? calculateProgress(currentProgress, monthlyTarget) : 0

      setBetsProgress(betsProgress)
      setProfitProgress(profitProgress)
      setMonthlyProgress(monthlyProgress)
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

  const { weeklyPlan, weeklyStats, monthlyCapital } = weeklyPlanData

  return (
    <div className="space-y-6">
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Monthly Progress</span>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(monthlyCapital.currentCapital)}/{formatCurrency(monthlyCapital.targetCapital)}
            </span>
          </div>
          <Progress value={monthlyProgress} />
        </div>
      </div>

      <div className="pt-4 border-t">
        <h4 className="font-medium mb-3">Weekly Stats</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Win Rate</p>
            <p className="text-lg font-medium">
              {weeklyPlan.betsPlaced > 0 ? Math.round((weeklyPlan.betsWon / weeklyPlan.betsPlaced) * 100) : 0}%
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Wins Needed</p>
            <p className="text-lg font-medium">{weeklyStats.winsNeeded} more</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">ROI</p>
            <p className="text-lg font-medium">
              {weeklyPlan.betsPlaced > 0
                ? ((weeklyStats.currentProfit / (weeklyStats.stakeAmount * weeklyPlan.betsPlaced)) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Remaining Bets</p>
            <p className="text-lg font-medium">{weeklyStats.remainingBets}</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h4 className="font-medium mb-3">Recommendations</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-500">•</span>
            <span>
              You need {formatCurrency(weeklyStats.targetProfit - weeklyStats.currentProfit)} more profit to reach your
              weekly goal.
            </span>
          </li>
          {weeklyPlan.betsPlaced > 0 && weeklyPlan.betsWon / weeklyPlan.betsPlaced < 0.5 && (
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              <span>Your win rate is below 50%. Consider adjusting your strategy or bet selection.</span>
            </li>
          )}
          {weeklyPlan.averageOdds < 1.5 && (
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              <span>Consider increasing your average odds slightly to improve potential returns.</span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>
              Maintain discipline and stick to your unit size of {formatCurrency(weeklyStats.stakeAmount)} per bet.
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

