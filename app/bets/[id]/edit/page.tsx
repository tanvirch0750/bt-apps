import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { BetForm } from "@/components/bets/bet-form"
import { getCapitalData } from "@/lib/actions/capital-actions"
import { getWeeklyPlan } from "@/lib/actions/weekly-plan-actions"
import { getBetById } from "@/lib/actions/bet-actions"
import { notFound } from "next/navigation"

interface EditBetPageProps {
  params: {
    id: string
  }
}

export default async function EditBetPage({ params }: EditBetPageProps) {
  // Fetch initial data for server rendering
  const [capitalResult, weeklyPlanResult, betResult] = await Promise.all([
    getCapitalData(),
    getWeeklyPlan(),
    getBetById(params.id),
  ])

  if (!betResult.success) {
    notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Edit Bet" description="Update the details of your bet." />

      <Card>
        <CardHeader>
          <CardTitle>Bet Details</CardTitle>
          <CardDescription>Edit the details of your bet</CardDescription>
        </CardHeader>
        <CardContent>
          <BetForm
            capitalData={capitalResult.success ? capitalResult.data : null}
            weeklyPlanData={weeklyPlanResult.success ? weeklyPlanResult.data : null}
            betData={betResult.data}
            isEditing={true}
          />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

