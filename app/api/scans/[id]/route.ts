import { NextRequest, NextResponse } from "next/server"
import { sql, type LesionType, type SeverityLevel } from "@/lib/db"
import { getCurrentUser, logAudit } from "@/lib/auth"

// GET /api/scans/[id] - Get scan details with detections
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

    const scanResult = await sql`
      SELECT s.*, 
             p.first_name as patient_first_name, 
             p.last_name as patient_last_name,
             p.patient_number,
             u.first_name as clinician_first_name, 
             u.last_name as clinician_last_name
      FROM scans s
      LEFT JOIN patients p ON s.patient_id = p.id
      LEFT JOIN users u ON s.performed_by = u.id
      WHERE s.id = ${id}
    `

    if (scanResult.length === 0) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 })
    }

    const scan = scanResult[0]

    // Get lesion detections
    const detections = await sql`
      SELECT * FROM lesion_detections
      WHERE scan_id = ${id}
      ORDER BY confidence DESC
    `

    return NextResponse.json({ scan, detections })
  } catch (error) {
    console.error("Error fetching scan:", error)
    return NextResponse.json({ error: "Failed to fetch scan" }, { status: 500 })
  }
}

// PUT /api/scans/[id] - Update scan (e.g., after processing)
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

    const {
      status,
      severity_score,
      severity_level,
      total_lesions,
      inflammatory_count,
      non_inflammatory_count,
      processing_time_ms,
      model_version,
      notes,
    } = body

    const result = await sql`
      UPDATE scans SET
        status = COALESCE(${status}, status),
        severity_score = COALESCE(${severity_score}, severity_score),
        severity_level = COALESCE(${severity_level}, severity_level),
        total_lesions = COALESCE(${total_lesions}, total_lesions),
        inflammatory_count = COALESCE(${inflammatory_count}, inflammatory_count),
        non_inflammatory_count = COALESCE(${non_inflammatory_count}, non_inflammatory_count),
        processing_time_ms = COALESCE(${processing_time_ms}, processing_time_ms),
        model_version = COALESCE(${model_version}, model_version),
        notes = COALESCE(${notes}, notes)
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 })
    }

    const scan = result[0]

    await logAudit(user.id, "UPDATE", "scan", id, undefined, scan)

    return NextResponse.json({ scan })
  } catch (error) {
    console.error("Error updating scan:", error)
    return NextResponse.json({ error: "Failed to update scan" }, { status: 500 })
  }
}

// POST /api/scans/[id]/analyze - Trigger AI analysis (simulated YOLOv8)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Update status to processing
    await sql`UPDATE scans SET status = 'processing' WHERE id = ${id}`

    const startTime = Date.now()

    // Simulate YOLOv8 detection results
    // In production, this would call your actual ML inference endpoint
    const simulatedDetections = generateSimulatedDetections()

    // Insert detections
    for (const detection of simulatedDetections) {
      await sql`
        INSERT INTO lesion_detections (
          scan_id, lesion_type, confidence, bbox_x, bbox_y, bbox_width, bbox_height, facial_zone
        ) VALUES (
          ${id}, ${detection.lesion_type}, ${detection.confidence},
          ${detection.bbox_x}, ${detection.bbox_y}, ${detection.bbox_width}, ${detection.bbox_height},
          ${detection.facial_zone}
        )
      `
    }

    // Calculate severity
    const { severityScore, severityLevel, inflammatory, nonInflammatory } = 
      calculateSeverity(simulatedDetections)

    const processingTime = Date.now() - startTime

    // Update scan with results
    const result = await sql`
      UPDATE scans SET
        status = 'completed',
        severity_score = ${severityScore},
        severity_level = ${severityLevel},
        total_lesions = ${simulatedDetections.length},
        inflammatory_count = ${inflammatory},
        non_inflammatory_count = ${nonInflammatory},
        processing_time_ms = ${processingTime},
        model_version = 'YOLOv8m-acne-v1.0'
      WHERE id = ${id}
      RETURNING *
    `

    const scan = result[0]

    await logAudit(user.id, "ANALYZE", "scan", id, undefined, { 
      detections_count: simulatedDetections.length,
      severity_level: severityLevel 
    })

    return NextResponse.json({ 
      scan, 
      detections: simulatedDetections,
      processing_time_ms: processingTime 
    })
  } catch (error) {
    console.error("Error analyzing scan:", error)
    
    // Update status to failed
    const { id } = await params
    await sql`UPDATE scans SET status = 'failed' WHERE id = ${id}`
    
    return NextResponse.json({ error: "Failed to analyze scan" }, { status: 500 })
  }
}

// Helper: Generate simulated detections
function generateSimulatedDetections() {
  const lesionTypes: LesionType[] = [
    "comedone_open", "comedone_closed", "papule", "pustule", "nodule", "cyst", "pih_mark"
  ]
  const facialZones = ["forehead", "left_cheek", "right_cheek", "nose", "chin", "jawline"]
  
  const numDetections = Math.floor(Math.random() * 30) + 10 // 10-40 detections
  const detections = []

  for (let i = 0; i < numDetections; i++) {
    detections.push({
      lesion_type: lesionTypes[Math.floor(Math.random() * lesionTypes.length)],
      confidence: Math.round((0.7 + Math.random() * 0.29) * 1000) / 1000,
      bbox_x: Math.round(Math.random() * 400 * 100) / 100,
      bbox_y: Math.round(Math.random() * 400 * 100) / 100,
      bbox_width: Math.round((20 + Math.random() * 40) * 100) / 100,
      bbox_height: Math.round((20 + Math.random() * 40) * 100) / 100,
      facial_zone: facialZones[Math.floor(Math.random() * facialZones.length)],
    })
  }

  return detections
}

// Helper: Calculate severity from detections
function calculateSeverity(detections: Array<{ lesion_type: LesionType; confidence: number }>) {
  const weights: Record<LesionType, number> = {
    comedone_open: 0.5,
    comedone_closed: 0.5,
    papule: 1.5,
    pustule: 2,
    nodule: 3,
    cyst: 4,
    pih_mark: 0.25,
  }

  const inflammatoryTypes = ["papule", "pustule", "nodule", "cyst"]
  
  let totalScore = 0
  let inflammatory = 0
  let nonInflammatory = 0

  for (const detection of detections) {
    totalScore += weights[detection.lesion_type] * detection.confidence
    if (inflammatoryTypes.includes(detection.lesion_type)) {
      inflammatory++
    } else {
      nonInflammatory++
    }
  }

  const severityScore = Math.round(totalScore * 100) / 100

  let severityLevel: SeverityLevel
  if (severityScore <= 5) severityLevel = "clear"
  else if (severityScore <= 10) severityLevel = "almost_clear"
  else if (severityScore <= 20) severityLevel = "mild"
  else if (severityScore <= 35) severityLevel = "moderate"
  else if (severityScore <= 50) severityLevel = "severe"
  else severityLevel = "very_severe"

  return { severityScore, severityLevel, inflammatory, nonInflammatory }
}
