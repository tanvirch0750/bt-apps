"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, getCurrentWeekOfMonth, getWeeksInMonth } from "@/lib/utils"
import { getWeeklyPlan, createOrUpdateWeeklyPlan } from "@/lib/actions/weekly-plan-actions"
import { getCapitalData } from "@/lib/actions/capital-actions"
import { useToast } from "@/components/ui/use-toast"

interface WeeklyPlanFormProps {
  weeklyPlanData: any
  allWeeklyPlans: any[]
  capitalData: any
}

export function WeeklyPlanForm({
  weeklyPlanData: initialWeeklyPlanData,
  allWeeklyPlans: initialAllWeeklyPlans,
  capitalData: initialCapitalData,
}: WeeklyPlanFormProps) {
  const { toast } = useToast()

  const [weeklyPlanData, setWeeklyPlanData] = useState(initialWeeklyPlanData)
  const [allWeeklyPlans, setAllWeeklyPlans] = useState(initialAllWeeklyPlans || [])
  const [capitalData, setCapitalData] = useState(initialCapitalData)
  const [loading, setLoading] = useState(!initialWeeklyPlanData || !initialCapitalData)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    targetBets: 5,
    averageOdds: 1.8,
    unitSize: 5, // 5% of monthly capital
    week: getCurrentWeekOfMonth(),
  })

  const [availableWeeks, setAvailableWeeks] = useState<number[]>([])

  useEffect(() => {
    async function fetchData() {
      if (!initialWeeklyPlanData || !initialCapitalData) {
        setLoading(true)

        const [weeklyPlanResult, capitalResult] = await Promise.all([getWeeklyPlan(), getCapitalData()])

        if (weeklyPlanResult.success) {
          setWeeklyPlanData(weeklyPlanResult.data)
        }

        if (capitalResult.success) {
          setCapitalData(capitalResult.data)
        }

        setLoading(false)
      }
    }

    fetchData()
  }, [initialWeeklyPlanData, initialCapitalData])

  useEffect(() => {
    // Set form data from weekly plan if available
    if (weeklyPlanData && weeklyPlanData.weeklyPlan) {
      const { weeklyPlan } = weeklyPlanData

      setFormData({
        targetBets: weeklyPlan.targetBets,
        averageOdds: weeklyPlan.averageOdds,
        unitSize: Math.round(weeklyPlan.unitSize * 100), // Convert decimal to percentage
        week: weeklyPlan.week,
      })
    }
  }, [weeklyPlanData])

  useEffect(() => {
    // Calculate available weeks in the month
    if (capitalData) {
      const { currentMonth, currentYear } = capitalData
      const weeksInMonth = getWeeksInMonth(currentMonth, currentYear)

      const weeks = Array.from({ length: weeksInMonth }, (_, i) => i + 1)
      setAvailableWeeks(weeks)
    }
  }, [capitalData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Validate input
    if (name === "targetBets") {
      const numValue = Number.parseInt(value)
      if (!isNaN(numValue) && numValue > 0) {
        setFormData((prev) => ({ ...prev, [name]: numValue }))
      }
    } else if (name === "averageOdds") {
      const numValue = Number.parseFloat(value)
      if (!isNaN(numValue) && numValue >= 1) {
        setFormData((prev) => ({ ...prev, [name]: numValue }))
      }
    } else if (name === "unitSize") {
      const numValue = Number.parseInt(value)
      if (!isNaN(numValue) && numValue > 0 && numValue <= 20) {
        setFormData((prev) => ({ ...prev, [name]: numValue }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleWeekChange = (week: string) => {
    setFormData((prev) => ({ ...prev, week: Number.parseInt(week) }))

    // Load plan for selected week if it exists
    const selectedWeekPlan = allWeeklyPlans.find((plan) => plan.week === Number.parseInt(week))

    if (selectedWeekPlan) {
      setFormData({
        targetBets: selectedWeekPlan.targetBets,
        averageOdds: selectedWeekPlan.averageOdds,
        unitSize: Math.round(selectedWeekPlan.unitSize * 100), // Convert decimal to percentage
        week: selectedWeekPlan.week,
      })
    } else {
      // Reset to defaults if no plan exists for this week
      setFormData((prev) => ({
        ...prev,
        targetBets: 5,
        averageOdds: 1.8,
        unitSize: 5,
        week: Number.parseInt(week),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validate form data
      if (formData.targetBets <= 0 || formData.averageOdds < 1 || formData.unitSize <= 0) {
        toast({
          title: "Validation Error",
          description: "Please enter valid values for all fields",
          variant: "destructive",
        })
        return
      }

      const result = await createOrUpdateWeeklyPlan(formData)

      if (result.success) {
        setWeeklyPlanData({
          ...weeklyPlanData,
          weeklyPlan: result.data,
        })

        toast({
          title: "Success",
          description: "Weekly plan saved successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save weekly plan",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">Loading weekly plan data...</p>
      </div>
    )
  }

  // Calculate projections
  const monthlyCapital = weeklyPlanData?.monthlyCapital?.initialCapital || 5000
  const stakeAmount = Math.round((formData.unitSize / 100) * monthlyCapital)
  const potentialProfit = Math.round(stakeAmount * (formData.averageOdds - 1) * formData.targetBets)
  const potentialReturn = stakeAmount * formData.targetBets + potentialProfit

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="week">Week</Label>
        <Select value={formData.week.toString()} onValueChange={handleWeekChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select week" />
          </SelectTrigger>
          <SelectContent>
            {availableWeeks.map((week) => (
              <SelectItem key={week} value={week.toString()}>
                Week {week}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="target-bets">Target Bets Per Week</Label>
        <Input
          id="target-bets"
          name="targetBets"
          type="number"
          min="1"
          value={formData.targetBets}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="average-odds">Average Odds</Label>
        <Input
          id="average-odds"
          name="averageOdds"
          type="number"
          min="1.01"
          step="0.01"
          value={formData.averageOdds}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit-size">Unit Size (% of Monthly Capital)</Label>
        <Input
          id="unit-size"
          name="unitSize"
          type="number"
          min="1"
          max="20"
          value={formData.unitSize}
          onChange={handleChange}
        />
        <p className="text-xs text-muted-foreground">
          {formData.unitSize}% of {formatCurrency(monthlyCapital)} = {formatCurrency(stakeAmount)} per bet
        </p>
      </div>

      <div className="pt-4 border-t">
        <h4 className="font-medium mb-2">Weekly Projection</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Stake:</span>
            <span>{formatCurrency(stakeAmount * formData.targetBets)}</span>
          </div>
          <div className="flex justify-between">
            <span>Potential Profit:</span>
            <span className="text-green-600">+{formatCurrency(potentialProfit)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Potential Return:</span>
            <span>{formatCurrency(potentialReturn)}</span>
          </div>
        </div>
      </div>

      <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Saving..." : "Save Weekly Plan"}
      </Button>
    </div>
  )
}

