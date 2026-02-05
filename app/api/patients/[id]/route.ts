import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser, logAudit } from "@/lib/auth"

// GET /api/patients/[id] - Get patient details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const patientResult = await sql`
      SELECT * FROM patients WHERE id = ${id} AND is_active = true
    `

    if (patientResult.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    const patient = patientResult[0]

    // Get patient's scans
    const scans = await sql`
      SELECT s.*, u.first_name as clinician_first_name, u.last_name as clinician_last_name
      FROM scans s
      LEFT JOIN users u ON s.performed_by = u.id
      WHERE s.patient_id = ${id}
      ORDER BY s.created_at DESC
    `

    // Get patient's treatment plans
    const treatmentPlans = await sql`
      SELECT tp.*, u.first_name as clinician_first_name, u.last_name as clinician_last_name
      FROM treatment_plans tp
      LEFT JOIN users u ON tp.created_by = u.id
      WHERE tp.patient_id = ${id}
      ORDER BY tp.created_at DESC
    `

    // Get patient's appointments
    const appointments = await sql`
      SELECT a.*, u.first_name as clinician_first_name, u.last_name as clinician_last_name
      FROM appointments a
      LEFT JOIN users u ON a.clinician_id = u.id
      WHERE a.patient_id = ${id}
      ORDER BY a.scheduled_date DESC, a.scheduled_time DESC
    `

    return NextResponse.json({
      patient,
      scans,
      treatmentPlans,
      appointments,
    })
  } catch (error) {
    console.error("Error fetching patient:", error)
    return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 })
  }
}

// PUT /api/patients/[id] - Update patient
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Get current patient data for audit
    const currentResult = await sql`SELECT * FROM patients WHERE id = ${id}`
    if (currentResult.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }
    const oldPatient = currentResult[0]

    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      email,
      phone,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      skin_type,
      allergies,
      medical_history,
      current_medications,
      insurance_provider,
      insurance_number,
      notes,
    } = body

    const result = await sql`
      UPDATE patients SET
        first_name = COALESCE(${first_name}, first_name),
        last_name = COALESCE(${last_name}, last_name),
        date_of_birth = COALESCE(${date_of_birth}, date_of_birth),
        gender = COALESCE(${gender}, gender),
        email = COALESCE(${email}, email),
        phone = COALESCE(${phone}, phone),
        address = COALESCE(${address}, address),
        emergency_contact_name = COALESCE(${emergency_contact_name}, emergency_contact_name),
        emergency_contact_phone = COALESCE(${emergency_contact_phone}, emergency_contact_phone),
        skin_type = COALESCE(${skin_type}, skin_type),
        allergies = COALESCE(${allergies}, allergies),
        medical_history = COALESCE(${medical_history}, medical_history),
        current_medications = COALESCE(${current_medications}, current_medications),
        insurance_provider = COALESCE(${insurance_provider}, insurance_provider),
        insurance_number = COALESCE(${insurance_number}, insurance_number),
        notes = COALESCE(${notes}, notes)
      WHERE id = ${id}
      RETURNING *
    `

    const patient = result[0]

    await logAudit(user.id, "UPDATE", "patient", id, oldPatient, patient)

    return NextResponse.json({ patient })
  } catch (error) {
    console.error("Error updating patient:", error)
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 })
  }
}

// DELETE /api/patients/[id] - Soft delete patient
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can delete patients
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    const result = await sql`
      UPDATE patients SET is_active = false WHERE id = ${id} RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    await logAudit(user.id, "DELETE", "patient", id)

    return NextResponse.json({ message: "Patient deleted successfully" })
  } catch (error) {
    console.error("Error deleting patient:", error)
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 })
  }
}
