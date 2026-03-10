import { NextRequest, NextResponse } from "next/server"
import { sql, generatePatientNumber } from "@/lib/db"
import { getCurrentUser, logAudit } from "@/lib/auth"

// GET /api/patients - List all patients
export async function GET(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const severity = searchParams.get("severity")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let patients
    if (search) {
      patients = await sql`
        SELECT p.*, 
               (SELECT COUNT(*) FROM scans WHERE patient_id = p.id) as total_scans,
               (SELECT severity_level FROM scans WHERE patient_id = p.id ORDER BY created_at DESC LIMIT 1) as latest_severity
        FROM patients p
        WHERE p.is_active = true
          AND (
            p.first_name ILIKE ${"%" + search + "%"} 
            OR p.last_name ILIKE ${"%" + search + "%"}
            OR p.patient_number ILIKE ${"%" + search + "%"}
            OR p.email ILIKE ${"%" + search + "%"}
          )
        ORDER BY p.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      patients = await sql`
        SELECT p.*, 
               (SELECT COUNT(*) FROM scans WHERE patient_id = p.id) as total_scans,
               (SELECT severity_level FROM scans WHERE patient_id = p.id ORDER BY created_at DESC LIMIT 1) as latest_severity
        FROM patients p
        WHERE p.is_active = true
        ORDER BY p.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    // Filter by severity if specified
    if (severity && severity !== "all") {
      patients = patients.filter((p: Record<string, unknown>) => p.latest_severity === severity)
    }

    const countResult = await sql`SELECT COUNT(*) as total FROM patients WHERE is_active = true`
    const total = countResult[0]?.total || 0

    return NextResponse.json({ patients, total, limit, offset })
  } catch (error) {
    console.error("Error fetching patients:", error)
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
  }
}

// POST /api/patients - Create a new patient
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
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

    if (!first_name || !last_name || !date_of_birth) {
      return NextResponse.json(
        { error: "First name, last name, and date of birth are required" },
        { status: 400 }
      )
    }

    const patient_number = generatePatientNumber()

    const result = await sql`
      INSERT INTO patients (
        patient_number, first_name, last_name, date_of_birth, gender, email, phone,
        address, emergency_contact_name, emergency_contact_phone, skin_type,
        allergies, medical_history, current_medications, insurance_provider,
        insurance_number, notes, created_by
      ) VALUES (
        ${patient_number}, ${first_name}, ${last_name}, ${date_of_birth}, ${gender || null},
        ${email || null}, ${phone || null}, ${address || null}, ${emergency_contact_name || null},
        ${emergency_contact_phone || null}, ${skin_type || null}, ${allergies || null},
        ${medical_history || null}, ${current_medications || null}, ${insurance_provider || null},
        ${insurance_number || null}, ${notes || null}, ${user.id}
      )
      RETURNING *
    `

    const patient = result[0]

    await logAudit(user.id, "CREATE", "patient", patient.id, undefined, patient)

    return NextResponse.json({ patient }, { status: 201 })
  } catch (error) {
    console.error("Error creating patient:", error)
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
  }
}
