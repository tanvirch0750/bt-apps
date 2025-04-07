"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn, formatCurrency } from "@/lib/utils"
import { createBet, updateBet } from "@/lib/actions/bet-actions"
import { getCapitalData } from "@/lib/actions/capital-actions"
import { getWeeklyPlan } from "@/lib/actions/weekly-plan-actions"
import { useToast } from "@/components/ui/use-toast"

interface BetFormProps {
  capitalData: any
  weeklyPlanData: any
  betData?: any
  isEditing?: boolean
}

export function BetForm({
  capitalData: initialCapitalData,
  weeklyPlanData: initialWeeklyPlanData,
  betData,
  isEditing = false,
}: BetFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [capitalData, setCapitalData] = useState(initialCapitalData)
  const [weeklyPlanData, setWeeklyPlanData] = useState(initialWeeklyPlanData)
  const [loading, setLoading] = useState(!initialCapitalData || !initialWeeklyPlanData)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    matchName: betData?.matchName || "",
    league: betData?.league || "",
    date: betData?.date ? new Date(betData.date) : new Date(),
    odds: betData?.odds?.toString() || "",
    stake: betData?.stake?.toString() || "",
    betType: betData?.betType || "Win",
    result: betData?.result || "Pending",
    notes: betData?.notes || "",
  })

  useEffect(() => {
    async function fetchData() {
      if (!initialCapitalData || !initialWeeklyPlanData) {
        setLoading(true)

        const [capitalResult, weeklyPlanResult] = await Promise.all([getCapitalData(), getWeeklyPlan()])

        if (capitalResult.success) {
          setCapitalData(capitalResult.data)
        }

        if (weeklyPlanResult.success) {
          setWeeklyPlanData(weeklyPlanResult.data)
        }

        setLoading(false)
      }
    }

    fetchData()
  }, [initialCapitalData, initialWeeklyPlanData])

  useEffect(() => {
    // Set default stake from weekly plan if available
    if (weeklyPlanData && !isEditing && !formData.stake) {
      const { weeklyStats } = weeklyPlanData
      if (weeklyStats && weeklyStats.stakeAmount) {
        setFormData((prev) => ({
          ...prev,
          stake: weeklyStats.stakeAmount.toString(),
        }))
      }
    }

    // Set default odds from weekly plan if available
    if (weeklyPlanData && !isEditing && !formData.odds) {
      const { weeklyPlan } = weeklyPlanData
      if (weeklyPlan && weeklyPlan.averageOdds) {
        setFormData((prev) => ({
          ...prev,
          odds: weeklyPlan.averageOdds.toString(),
        }))
      }
    }
  }, [weeklyPlanData, isEditing, formData.stake, formData.odds])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validate form data
      if (
        !formData.matchName ||
        !formData.league ||
        !formData.date ||
        !formData.odds ||
        !formData.stake ||
        !formData.betType ||
        !formData.result
      ) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const betFormData = {
        matchName: formData.matchName,
        league: formData.league,
        date: formData.date,
        odds: Number.parseFloat(formData.odds),
        stake: Number.parseInt(formData.stake),
        betType: formData.betType,
        result: formData.result as "Win" | "Loss" | "Pending",
        notes: formData.notes,
      }

      if (isEditing && betData) {
        // Update existing bet
        const result = await updateBet(betData._id, betFormData)

        if (result.success) {
          toast({
            title: "Success",
            description: "Bet updated successfully",
          })
          router.push("/bets")
          router.refresh()
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update bet",
            variant: "destructive",
          })
        }
      } else {
        // Create new bet
        const result = await createBet(betFormData)

        if (result.success) {
          toast({
            title: "Success",
            description: "Bet created successfully",
          })
          router.push("/bets")
          router.refresh()
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create bet",
            variant: "destructive",
          })
        }
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
        <p className="text-muted-foreground">Loading form data...</p>
      </div>
    )
  }

  // Calculate potential profit
  const odds = Number.parseFloat(formData.odds) || 0
  const stake = Number.parseInt(formData.stake) || 0
  const potentialProfit = Math.round(stake * (odds - 1))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="match-name">Match Name *</Label>
          <Input
            id="match-name"
            name="matchName"
            value={formData.matchName}
            onChange={handleChange}
            placeholder="e.g. Arsenal vs Chelsea"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="league">League *</Label>
          <Input
            id="league"
            name="league"
            value={formData.league}
            onChange={handleChange}
            placeholder="e.g. Premier League"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !formData.date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(formData.date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={formData.date} onSelect={handleDateChange} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bet-type">Bet Type *</Label>
          <Select value={formData.betType} onValueChange={(value) => handleSelectChange("betType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select bet type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Win">Win</SelectItem>
              <SelectItem value="Draw">Draw</SelectItem>
              <SelectItem value="Over">Over</SelectItem>
              <SelectItem value="Under">Under</SelectItem>
              <SelectItem value="BTTS">BTTS</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="odds">Odds *</Label>
          <Input
            id="odds"
            name="odds"
            value={formData.odds}
            onChange={handleChange}
            type="number"
            step="0.01"
            min="1"
            placeholder="e.g. 1.85"
            required
          />
          {weeklyPlanData?.weeklyPlan?.averageOdds && (
            <p className="text-xs text-muted-foreground">
              Weekly plan average odds: {weeklyPlanData.weeklyPlan.averageOdds.toFixed(2)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stake">Stake Amount *</Label>
          <Input
            id="stake"
            name="stake"
            value={formData.stake}
            onChange={handleChange}
            type="number"
            min="1"
            placeholder="e.g. 250"
            required
          />
          {weeklyPlanData?.weeklyStats?.stakeAmount && (
            <p className="text-xs text-muted-foreground">
              Recommended stake: {formatCurrency(weeklyPlanData.weeklyStats.stakeAmount)}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="result">Result *</Label>
        <Select value={formData.result} onValueChange={(value) => handleSelectChange("result", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Win">Win</SelectItem>
            <SelectItem value="Loss">Loss</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add any notes about this bet"
        />
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-medium mb-2">Bet Summary</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Stake</p>
            <p className="font-medium">{formatCurrency(stake)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Potential Return</p>
            <p className="font-medium">{formatCurrency(stake + potentialProfit)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Potential Profit</p>
            <p className="font-medium text-green-600">+{formatCurrency(potentialProfit)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">ROI</p>
            <p className="font-medium">{stake > 0 ? ((potentialProfit / stake) * 100).toFixed(1) : "0.0"}%</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.push("/bets")} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : isEditing ? "Update Bet" : "Save Bet"}
        </Button>
      </div>
    </form>
  )
}

