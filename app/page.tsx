import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { SeverityDistributionChart } from "@/components/dashboard/severity-distribution-chart"
import { WeeklyScansChart } from "@/components/dashboard/weekly-scans-chart"
import { RecentPatients } from "@/components/dashboard/recent-patients"
import { cookies } from "next/headers"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("acnesight_session")?.value

  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const response = await fetch("http://localhost:8000/api/patients/", {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  })

  let patients = []
  if (response.ok) {
    patients = await response.json()
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
          <WeeklyScansChart patients={patients} />
          <SeverityDistributionChart />
        </div>

        <RecentPatients patients={patients} />
      </div>
    </DashboardLayout>
  )
}