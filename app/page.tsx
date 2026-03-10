import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { SeverityDistributionChart } from "@/components/dashboard/severity-distribution-chart"
import { WeeklyScansChart } from "@/components/dashboard/weekly-scans-chart"
import { RecentPatients } from "@/components/dashboard/recent-patients"

export default async function DashboardPage() {
  // Check if user is authenticated
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of clinical operations and patient analytics
          </p>
        </div>

        <StatsCards />

        <div className="grid gap-6 lg:grid-cols-2">
          <WeeklyScansChart />
          <SeverityDistributionChart />
        </div>

        <RecentPatients />
      </div>
    </DashboardLayout>
  )
}
