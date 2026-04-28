// REMOVED "use client" - This must be a Server Component!

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PatientFilters } from "@/components/patients/patient-filters"
import { PatientsList } from "@/components/patients/patients-list"
import { cookies } from "next/headers"

export default async function PatientsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  // 1. Get the token directly from the cookies (Server-side only!)
  const cookieStore = await cookies()
  const token = cookieStore.get("acnesight_session")?.value

  // 2. Pass the extracted token to your FastAPI backend
  const response = await fetch("http://localhost:8000/api/patients/", {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    cache: 'no-store' 
  })

  if (!response.ok) {
    throw new Error("Failed to fetch patients list")
  }

  const patients = await response.json()

  return (
    <DashboardLayout breadcrumbs={[{ label: "Patients" }]}>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
            <p className="text-muted-foreground">
              Manage and monitor your patient population.
            </p>
          </div>
        </div>
        
        
        <PatientFilters token={token || ""} />
        
        {/* Pass the real database patients into your list component */}
        <PatientsList initialPatients={patients} />
      </div>
    </DashboardLayout>
  )
}