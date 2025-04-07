import { BetTable } from '@/components/bets/bet-table';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getBets } from '@/lib/actions/bet-actions';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default async function BetsPage() {
  // Fetch initial data for server rendering
  const betsResult = await getBets({ limit: 10 });

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Bet Tracker"
        description="Track and manage your bets."
      >
        <Link href="/bets/new">
          <Button className="hidden md:flex">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Bet
          </Button>
        </Link>
      </DashboardHeader>

      <div className="grid gap-4">
        <Card className="md:hidden">
          <CardHeader>
            <CardTitle>Add New Bet</CardTitle>
            <CardDescription>Record a new bet in your tracker</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/bets/new">
              <Button className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Bet
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bet History</CardTitle>
            <CardDescription>
              View and manage your betting history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BetTable
              initialBets={betsResult?.success ? betsResult?.data?.bets : []}
              initialPagination={
                betsResult?.success ? betsResult?.data?.pagination : null
              }
            />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
