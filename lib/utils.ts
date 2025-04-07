import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

export function getMonthName(monthIndex: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  return months[monthIndex]
}

export function calculateCompoundGrowth(
  initialCapital: number,
  monthlyGrowthRate: number,
  months: number,
  startMonth: number,
  startYear: number,
): {
  month: number
  monthIndex: number
  year: number
  monthName: string
  capital: number
  target: number
  growth: number
}[] {
  const result = []
  let currentCapital = initialCapital

  for (let i = 0; i < months; i++) {
    const monthIndex = (startMonth + i) % 12
    const yearOffset = Math.floor((startMonth + i) / 12)
    const year = startYear + yearOffset

    const targetCapital = Math.round(currentCapital * (1 + monthlyGrowthRate))
    const growth = targetCapital - currentCapital

    result.push({
      month: i + 1,
      monthIndex,
      year,
      monthName: getMonthName(monthIndex),
      capital: currentCapital,
      target: targetCapital,
      growth,
    })

    currentCapital = targetCapital
  }

  return result
}

export function getCurrentWeekOfMonth(): number {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const pastDaysOfMonth = now.getDate() - 1

  return Math.ceil((pastDaysOfMonth + firstDayOfMonth.getDay()) / 7)
}

export function getWeeksInMonth(month: number, year: number): number {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  return Math.ceil((daysInMonth + firstDayOfWeek) / 7)
}

export function calculateROI(profit: number, investment: number): number {
  if (investment === 0) return 0
  return (profit / investment) * 100
}

export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0
  return (wins / total) * 100
}

