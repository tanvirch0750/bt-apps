import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CapitalManagement } from "@/components/capital/capital-management"
import { CompoundGrowthTable } from "@/components/capital/compound-growth-table"
import { getCapitalData } from "@/lib/actions/capital-actions"

export default async function CapitalPage() {
  // Fetch initial data for server rendering
  const capitalResult = await getCapitalData()

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Capital Management"
        description="Manage your betting capital and track your growth targets."
      />

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Capital Overview</CardTitle>
            <CardDescription>Manage your initial and current capital</CardDescription>
          </CardHeader>
          <CardContent>
            <CapitalManagement capitalData={capitalResult.success ? capitalResult.data : null} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>36-Month Compound Growth Plan</CardTitle>
            <CardDescription>20% monthly growth projection for 36 months</CardDescription>
          </CardHeader>
          <CardContent>
            <CompoundGrowthTable capitalData={capitalResult.success ? capitalResult.data : null} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

