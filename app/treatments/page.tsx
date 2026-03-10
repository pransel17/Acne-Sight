import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TreatmentRecommendations } from "@/components/treatments/treatment-recommendations"
import { TreatmentGuidelines } from "@/components/treatments/treatment-guidelines"
import { ContraindicationCheck } from "@/components/treatments/contraindication-check"

export default async function TreatmentsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }
  return (
    <DashboardLayout breadcrumbs={[{ label: "Treatment Plans" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Treatment Plans</h1>
          <p className="text-muted-foreground">
            AI-generated treatment recommendations based on severity assessment
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <TreatmentRecommendations />
          </div>
          <div className="space-y-6">
            <ContraindicationCheck />
            <TreatmentGuidelines />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
