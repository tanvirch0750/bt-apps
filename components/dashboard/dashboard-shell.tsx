import type React from "react"
interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <div className="flex-1 space-y-4 p-0 pt-6">{children}</div>
    </div>
  )
}

