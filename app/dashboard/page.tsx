import { CapitalChart } from '@/components/dashboard/capital-chart';
import { CapitalOverview } from '@/components/dashboard/capital-overview';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { RecentBets } from '@/components/dashboard/recent-bets';
import { WeeklyProgress } from '@/components/dashboard/weekly-progress';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getBets, getBetStats } from '@/lib/actions/bet-actions';
import { getCapitalData } from '@/lib/actions/capital-actions';
import { getWeeklyPlan } from '@/lib/actions/weekly-plan-actions';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export default async function DashboardPage() {
  // Wrap data fetching in try/catch to prevent cascading errors
  let capitalResult = { success: false, data: null };
  let betsResult = { success: false, data: { bets: [], pagination: {} } };
  let statsResult = { success: false, data: null };
  let weeklyPlanResult = { success: false, data: null };

  try {
    // Fetch initial data for server rendering
    // @ts-ignore
    capitalResult = await getCapitalData();
  } catch (error) {
    console.error('Error fetching capital data:', error);
  }

  try {
    // @ts-ignore
    betsResult = await getBets({ limit: 5 });
  } catch (error) {
    console.error('Error fetching bets:', error);
  }

  try {
    // @ts-ignore
    statsResult = await getBetStats();
  } catch (error) {
    console.error('Error fetching bet stats:', error);
  }

  try {
    // @ts-ignore
    weeklyPlanResult = await getWeeklyPlan();
  } catch (error) {
    console.error('Error fetching weekly plan:', error);
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        description="Track your betting journey and capital growth."
      >
        <Link href="/bets/new">
          <Button className="hidden md:flex">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Bet
          </Button>
        </Link>
      </DashboardHeader>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<DashboardSkeleton />}>
            <div className="md:hidden mb-4">
              <Link href="/bets/new">
                <Button className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Bet
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <CapitalOverview
                capitalData={capitalResult.success ? capitalResult.data : null}
                betStats={statsResult.success ? statsResult.data : null}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Capital Growth</CardTitle>
                  <CardDescription>
                    Your capital growth over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CapitalChart
                    capitalData={
                      capitalResult.success ? capitalResult.data : null
                    }
                  />
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                  <CardDescription>
                    Your betting progress this week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WeeklyProgress
                    weeklyPlanData={
                      weeklyPlanResult.success ? weeklyPlanResult.data : null
                    }
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Bets</CardTitle>
                    <CardDescription>Your most recent bets</CardDescription>
                  </div>
                  <Link href="/bets">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <RecentBets
                    initialBets={betsResult.success ? betsResult.data.bets : []}
                  />
                </CardContent>
              </Card>
            </div>
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Win Rate</CardTitle>
                <CardDescription>Your win rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsResult.success &&
                  statsResult.data &&
                  // @ts-ignore
                  statsResult.data.winRate !== undefined
                    ? // @ts-ignore
                      statsResult?.data?.winRate?.toFixed(1)
                    : '0.0'}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  {statsResult.success && statsResult.data
                    ? // @ts-ignore
                      `${statsResult.data.wins || 0} wins, ${
                        // @ts-ignore
                        statsResult.data.losses || 0
                      } losses`
                    : 'No data'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROI</CardTitle>
                <CardDescription>Return on investment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsResult.success &&
                  statsResult.data &&
                  // @ts-ignore
                  statsResult?.data?.roi !== undefined
                    ? // @ts-ignore
                      statsResult.data.roi.toFixed(1)
                    : '0.0'}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on{' '}
                  {statsResult.success && statsResult.data
                    ? // @ts-ignore
                      statsResult.data.totalBets || 0
                    : 0}{' '}
                  bets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Odds</CardTitle>
                <CardDescription>Your average odds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsResult.success &&
                  statsResult.data &&
                  // @ts-ignore
                  statsResult.data.averageOdds !== undefined
                    ? // @ts-ignore
                      statsResult?.data?.averageOdds?.toFixed(2)
                    : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on completed bets
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
