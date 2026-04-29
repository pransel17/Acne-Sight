import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, User, TrendingDown, Eye } from "lucide-react"

// 1. IMPORTANT: Import the new interactive dialog!
import { NewReportDialog } from "@/components/reports/new-report-panel"
import { cookies } from "next/headers"

export default async function ReportsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  // 2. Fetch the real patients from your backend so the dropdown works
  // (If you use a token, make sure to pass it in the headers)
  const cookieStore = await cookies()
  const token = cookieStore.get("acnesight_session")?.value

  let patients = []
  try {
    const patientsRes = await fetch("http://localhost:8000/api/patients/", {
      headers: { "Cookie": `acnesight_session=${token}` },
      cache: "no-store"
    })
    if (patientsRes.ok) {
      patients = await patientsRes.json()
    }
  } catch (error) {
    console.error("Failed to fetch patients:", error)
  }

  // 3. Fetch real reports (replacing your hardcoded recentReports array)
  let recentReports = []
  try {
    const reportsRes = await fetch("http://localhost:8000/api/reports/", {
      cache: "no-store"
    })
    if (reportsRes.ok) {
      recentReports = await reportsRes.json()
    }
  } catch (error) {
    console.error("Failed to fetch reports:", error)
  }

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
          
          {/* 4. THE FIX: We replaced the static <Button> with your dynamic component */}
          <NewReportDialog patients={patients} />
          
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
              {recentReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No reports found in the database.</div>
              ) : (
                recentReports.map((report: any) => (
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
                          <p className="font-medium text-foreground">{report.report_type}</p>
                          <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                            {report.is_finalized ? "finalized" : "draft"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {report.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground">{report.report_number}</p>
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}