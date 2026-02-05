import { DashboardLayout } from "@/components/dashboard-layout"
import { AnalysisWorkspace } from "@/components/analysis/analysis-workspace"

export default function AnalysisPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Analysis" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skin Analysis</h1>
          <p className="text-muted-foreground">
            Real-time lesion detection and severity assessment
          </p>
        </div>

        <AnalysisWorkspace />
      </div>
    </DashboardLayout>
  )
}
