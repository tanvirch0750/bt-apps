"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Calendar, CreditCard, Home, LineChart, List, Menu, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "Capital Management",
    icon: CreditCard,
    href: "/capital",
  },
  {
    label: "Bet Tracker",
    icon: List,
    href: "/bets",
  },
  {
    label: "Weekly Plan",
    icon: Calendar,
    href: "/weekly-plan",
  },
  {
    label: "Monthly Summary",
    icon: BarChart3,
    href: "/monthly-summary",
  },
  {
    label: "Statistics",
    icon: LineChart,
    href: "/statistics",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex flex-col h-full">
            <div className="px-3 py-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Betting Tracker</h2>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid gap-1 px-2">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                      pathname === route.href ? "bg-muted font-medium text-primary" : "text-muted-foreground",
                    )}
                  >
                    <route.icon className="h-4 w-4" />
                    {route.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <div className="hidden border-r bg-background md:block md:w-64">
        <div className="flex flex-col h-full">
          <div className="px-3 py-4 border-b">
            <h2 className="text-lg font-semibold">Betting Tracker</h2>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid gap-1 px-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                    pathname === route.href ? "bg-muted font-medium text-primary" : "text-muted-foreground",
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}

