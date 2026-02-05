import { DashboardLayout } from "@/components/dashboard-layout"
import { PatientHeader } from "@/components/patients/patient-header"
import { PatientHistory } from "@/components/patients/patient-history"
import { PatientSeverityTrend } from "@/components/patients/patient-severity-trend"
import { patients } from "@/lib/mock-data"
import { notFound } from "next/navigation"

interface PatientPageProps {
  params: Promise<{ id: string }>
}

export default async function PatientPage({ params }: PatientPageProps) {
  const { id } = await params
  const patient = patients.find((p) => p.id === id)

  if (!patient) {
    notFound()
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Patients", href: "/patients" },
        { label: patient.name },
      ]}
    >
      <div className="space-y-6">
        <PatientHeader patient={patient} />
        
        <div className="grid gap-6 lg:grid-cols-2">
          <PatientSeverityTrend />
          <PatientHistory patientId={patient.id} />
        </div>
      </div>
    </DashboardLayout>
  )
}
