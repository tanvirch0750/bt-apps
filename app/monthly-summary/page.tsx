import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { MonthlySummaryStats } from "@/components/monthly-summary/monthly-summary-stats"
import { MonthlySummaryChart } from "@/components/monthly-summary/monthly-summary-chart"
import { MonthlySummaryTable } from "@/components/monthly-summary/monthly-summary-table"
import { getCapitalData } from "@/lib/actions/capital-actions"
import { getBetStats } from "@/lib/actions/bet-actions"
import { getAllWeeklyPlans } from "@/lib/actions/weekly-plan-actions"

export default async function MonthlySummaryPage() {
  // Fetch initial data for server rendering
  const capitalResult = await getCapitalData()
  const betStatsResult = await getBetStats()
  const weeklyPlansResult = await getAllWeeklyPlans()

  return (
    <DashboardShell>
      <DashboardHeader heading="Monthly Summary" description="Review your monthly betting performance." />

      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MonthlySummaryStats
            capitalData={capitalResult.success ? capitalResult.data : null}
            betStats={betStatsResult.success ? betStatsResult.data : null}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
              <CardDescription>Your betting performance this month</CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlySummaryChart weeklyPlans={weeklyPlansResult.success ? weeklyPlansResult.data : []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
              <CardDescription>Detailed breakdown of your monthly performance</CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlySummaryTable weeklyPlans={weeklyPlansResult.success ? weeklyPlansResult.data : []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}

