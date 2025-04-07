import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { StatsOverview } from "@/components/statistics/stats-overview"
import { BettingTrends } from "@/components/statistics/betting-trends"
import { LeaguePerformance } from "@/components/statistics/league-performance"
import { BetTypePerformance } from "@/components/statistics/bet-type-performance"
import { getBetStats } from "@/lib/actions/bet-actions"

export default async function StatisticsPage() {
  // Fetch initial data for server rendering
  const betStatsResult = await getBetStats()

  return (
    <DashboardShell>
      <DashboardHeader heading="Statistics" description="Analyze your betting performance and trends." />

      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsOverview betStats={betStatsResult.success ? betStatsResult.data : null} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Betting Trends</CardTitle>
              <CardDescription>Your betting performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <BettingTrends betStats={betStatsResult.success ? betStatsResult.data : null} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>League Performance</CardTitle>
              <CardDescription>Your performance by league</CardDescription>
            </CardHeader>
            <CardContent>
              <LeaguePerformance betStats={betStatsResult.success ? betStatsResult.data : null} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bet Type Performance</CardTitle>
            <CardDescription>Your performance by bet type</CardDescription>
          </CardHeader>
          <CardContent>
            <BetTypePerformance betStats={betStatsResult.success ? betStatsResult.data : null} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

