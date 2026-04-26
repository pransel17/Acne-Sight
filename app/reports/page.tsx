import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Calendar, User, TrendingDown, Eye } from "lucide-react"

export default async function ReportsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  // 1. Define your data inside the function (or above it)
  const recentReports = [
    {
      id: "RPT-2026-0234",
      patient: "Jane Doe",
      patientId: "PT-2024-0847",
      type: "Progress Report",
      date: "2026-02-01",
      status: "completed",
    },
    {
      id: "RPT-2026-0233",
      patient: "John Smith",
      patientId: "PT-2024-0923",
      type: "Initial Assessment",
      date: "2026-01-28",
      status: "completed",
    },
    {
      id: "RPT-2026-0232",
      patient: "Emily Chen",
      patientId: "PT-2024-1102",
      type: "Treatment Evaluation",
      date: "2026-01-25",
      status: "completed",
    },
    {
      id: "RPT-2026-0231",
      patient: "Michael Brown",
      patientId: "PT-2024-1205",
      type: "Progress Report",
      date: "2026-01-22",
      status: "completed",
    },
  ]

  const reportTemplates = [
    {
      id: "t1",
      name: "Initial Assessment",
      description: "Comprehensive baseline assessment for new patients",
      icon: User,
    },
    {
      id: "t2",
      name: "Progress Report",
      description: "Treatment progress and severity comparison",
      icon: TrendingDown,
    },
    {
      id: "t3",
      name: "Treatment Summary",
      description: "Complete treatment history and outcomes",
      icon: FileText,
    },
  ]

  // 2. Return the UI
  return (
    <DashboardLayout breadcrumbs={[{ label: "Reports" }]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">
              Generate and manage clinical reports
            </p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>

        {/* Report Templates */}
        <div className="grid gap-4 md:grid-cols-3">
          {reportTemplates.map((template) => (
            <Card key={template.id} className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <template.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Reports */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Reports</CardTitle>
            <CardDescription>Previously generated clinical reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{report.type}</p>
                        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {report.patient} ({report.patientId})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(report.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">{report.id}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View report</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download report</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}