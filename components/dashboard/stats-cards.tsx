"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ScanFace, TrendingDown, Calendar } from "lucide-react"
import { dashboardStats } from "@/lib/mock-data"

const stats = [
  {
    title: "Total Patients",
    value: dashboardStats.totalPatients.toLocaleString(),
    description: "+12 this week",
    icon: Users,
    trend: "up",
  },
  {
    title: "Scans Today",
    value: dashboardStats.scansToday.toString(),
    description: "8 pending analysis",
    icon: ScanFace,
    trend: "neutral",
  },
  {
    title: "Avg. Severity Reduction",
    value: `${dashboardStats.avgSeverityReduction}%`,
    description: "Last 30 days",
    icon: TrendingDown,
    trend: "up",
  },
  {
    title: "Upcoming Appointments",
    value: dashboardStats.upcomingAppointments.toString(),
    description: "Next 7 days",
    icon: Calendar,
    trend: "neutral",
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
