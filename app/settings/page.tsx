import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SettingsForm } from "@/components/settings/settings-form"
import { getSettings } from "@/lib/actions/settings-actions"

export default async function SettingsPage() {
  // Fetch initial data for server rendering
  const settingsResult = await getSettings()

  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" description="Manage your application settings." />

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Customize your betting tracker settings</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm settings={settingsResult.success ? settingsResult.data : null} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

