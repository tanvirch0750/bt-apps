import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { WeeklyPlanForm } from "@/components/weekly-plan/weekly-plan-form"
import { WeeklyPlanStats } from "@/components/weekly-plan/weekly-plan-stats"
import { getWeeklyPlan, getAllWeeklyPlans } from "@/lib/actions/weekly-plan-actions"
import { getCapitalData } from "@/lib/actions/capital-actions"

export default async function WeeklyPlanPage() {
  // Fetch initial data for server rendering
  const weeklyPlanResult = await getWeeklyPlan()
  const allWeeklyPlansResult = await getAllWeeklyPlans()
  const capitalResult = await getCapitalData()

  return (
    <DashboardShell>
      <DashboardHeader heading="Weekly Betting Plan" description="Plan and track your weekly betting strategy." />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Plan</CardTitle>
            <CardDescription>Set your betting plan for the week</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyPlanForm
              weeklyPlanData={weeklyPlanResult.success ? weeklyPlanResult.data : null}
              allWeeklyPlans={allWeeklyPlansResult.success ? allWeeklyPlansResult.data : []}
              capitalData={capitalResult.success ? capitalResult.data : null}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Track your progress against your weekly plan</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyPlanStats weeklyPlanData={weeklyPlanResult.success ? weeklyPlanResult.data : null} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

