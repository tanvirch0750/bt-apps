import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { BetForm } from "@/components/bets/bet-form"
import { getCapitalData } from "@/lib/actions/capital-actions"
import { getWeeklyPlan } from "@/lib/actions/weekly-plan-actions"

export default async function NewBetPage() {
  // Fetch initial data for server rendering
  const capitalResult = await getCapitalData()
  const weeklyPlanResult = await getWeeklyPlan()

  return (
    <DashboardShell>
      <DashboardHeader heading="Add New Bet" description="Record a new bet in your tracker." />

      <Card>
        <CardHeader>
          <CardTitle>Bet Details</CardTitle>
          <CardDescription>Enter the details of your bet</CardDescription>
        </CardHeader>
        <CardContent>
          <BetForm
            capitalData={capitalResult.success ? capitalResult.data : null}
            weeklyPlanData={weeklyPlanResult.success ? weeklyPlanResult.data : null}
          />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

