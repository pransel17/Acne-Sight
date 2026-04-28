import { redirect, notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PatientHeader } from "@/components/patients/patient-header"
import { PatientHistory } from "@/components/patients/patient-history"
import { PatientSeverityTrend } from "@/components/patients/patient-severity-trend"
import { cookies } from "next/headers" 

interface PatientPageProps {
  params: Promise<{ id: string }>
}

export default async function PatientPage({ params }: PatientPageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { id } = await params


  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value


  const response = await fetch(`http://localhost:8000/api/patients/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    cache: 'no-store'
  })


  if (!response.ok) {
    if (response.status === 404) notFound()
    throw new Error("Failed to fetch patient details")
  }

  
  const patient = await response.json()

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Patients", href: "/patients" },
       
        { label: `${patient.first_name} ${patient.last_name}` },
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