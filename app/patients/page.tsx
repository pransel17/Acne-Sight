import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PatientsList } from "@/components/patients/patients-list"
import { PatientFilters } from "@/components/patients/patient-filters"

export default async function PatientsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Patients" }]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Patients</h1>
            <p className="text-muted-foreground">
              Manage and monitor patient records
            </p>
          </div>
        </div>

        <PatientFilters />
        <PatientsList />
      </div>
    </DashboardLayout>
  )
}
