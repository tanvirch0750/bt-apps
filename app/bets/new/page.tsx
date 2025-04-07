import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { BetForm } from '@/components/bets/bet-form';
import { getCapitalData } from '@/lib/actions/capital-actions';
import { getWeeklyPlan } from '@/lib/actions/weekly-plan-actions';

export default async function NewBetPage() {
  try {
    console.log('Fetching initial data for new bet page...');
    // Fetch initial data for server rendering
    const [capitalResult, weeklyPlanResult] = await Promise.all([
      getCapitalData(),
      getWeeklyPlan(),
    ]);

    console.log('Capital data fetched:', capitalResult.success);
    console.log('Weekly plan data fetched:', weeklyPlanResult.success);

    if (weeklyPlanResult.success && weeklyPlanResult.data) {
      console.log('Weekly plan data available:', {
        hasWeeklyPlan: !!weeklyPlanResult.data.weeklyPlan,
        hasWeeklyStats: !!weeklyPlanResult.data.weeklyStats,
        stakeAmount: weeklyPlanResult.data.weeklyStats?.stakeAmount,
        averageOdds: weeklyPlanResult.data.weeklyPlan?.averageOdds,
      });
    }

    return (
      <DashboardShell>
        <DashboardHeader
          heading="Add New Bet"
          description="Record a new bet in your tracker."
        />

        <Card>
          <CardHeader>
            <CardTitle>Bet Details</CardTitle>
            <CardDescription>Enter the details of your bet</CardDescription>
          </CardHeader>
          <CardContent>
            <BetForm
              capitalData={capitalResult.success ? capitalResult.data : null}
              weeklyPlanData={
                weeklyPlanResult.success ? weeklyPlanResult.data : null
              }
            />
          </CardContent>
        </Card>
      </DashboardShell>
    );
  } catch (error) {
    console.error('Error in NewBetPage:', error);
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Add New Bet"
          description="Record a new bet in your tracker."
        />
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was an error loading the bet form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please try again later or contact support if the issue persists.
            </p>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }
}
