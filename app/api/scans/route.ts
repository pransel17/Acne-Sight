import { NextRequest, NextResponse } from "next/server"
import { sql, generateScanNumber } from "@/lib/db"
import { getCurrentUser, logAudit } from "@/lib/auth"

// GET /api/scans - List all scans
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const patientId = searchParams.get("patient_id")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let scans
    if (patientId) {
      scans = await sql`
        SELECT s.*, 
               p.first_name as patient_first_name, 
               p.last_name as patient_last_name,
               p.patient_number,
               u.first_name as clinician_first_name, 
               u.last_name as clinician_last_name
        FROM scans s
        LEFT JOIN patients p ON s.patient_id = p.id
        LEFT JOIN users u ON s.performed_by = u.id
        WHERE s.patient_id = ${patientId}
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (status) {
      scans = await sql`
        SELECT s.*, 
               p.first_name as patient_first_name, 
               p.last_name as patient_last_name,
               p.patient_number,
               u.first_name as clinician_first_name, 
               u.last_name as clinician_last_name
        FROM scans s
        LEFT JOIN patients p ON s.patient_id = p.id
        LEFT JOIN users u ON s.performed_by = u.id
        WHERE s.status = ${status}
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      scans = await sql`
        SELECT s.*, 
               p.first_name as patient_first_name, 
               p.last_name as patient_last_name,
               p.patient_number,
               u.first_name as clinician_first_name, 
               u.last_name as clinician_last_name
        FROM scans s
        LEFT JOIN patients p ON s.patient_id = p.id
        LEFT JOIN users u ON s.performed_by = u.id
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    const countResult = await sql`SELECT COUNT(*) as total FROM scans`
    const total = countResult[0]?.total || 0

    return NextResponse.json({ scans, total, limit, offset })
  } catch (error) {
    console.error("Error fetching scans:", error)
    return NextResponse.json({ error: "Failed to fetch scans" }, { status: 500 })
  }
}

// POST /api/scans - Create a new scan
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      patient_id,
      image_url,
      thumbnail_url,
      original_filename,
      file_size,
      image_width,
      image_height,
      confidence_threshold,
      notes,
    } = body

    if (!patient_id || !image_url) {
      return NextResponse.json(
        { error: "Patient ID and image URL are required" },
        { status: 400 }
      )
    }

    // Verify patient exists
    const patientCheck = await sql`SELECT id FROM patients WHERE id = ${patient_id} AND is_active = true`
    if (patientCheck.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    const scan_number = generateScanNumber()

    const result = await sql`
      INSERT INTO scans (
        patient_id, performed_by, scan_number, image_url, thumbnail_url,
        original_filename, file_size, image_width, image_height,
        status, confidence_threshold, notes
      ) VALUES (
        ${patient_id}, ${user.id}, ${scan_number}, ${image_url}, ${thumbnail_url || null},
        ${original_filename || null}, ${file_size || null}, ${image_width || null}, ${image_height || null},
        'pending', ${confidence_threshold || 0.75}, ${notes || null}
      )
      RETURNING *
    `

    const scan = result[0]

    await logAudit(user.id, "CREATE", "scan", scan.id, undefined, scan)

    return NextResponse.json({ scan }, { status: 201 })
  } catch (error) {
    console.error("Error creating scan:", error)
    return NextResponse.json({ error: "Failed to create scan" }, { status: 500 })
  }
}
