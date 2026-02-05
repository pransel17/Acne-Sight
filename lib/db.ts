import { neon } from "@neondatabase/serverless"

// Create the SQL client
export const sql = neon(process.env.DATABASE_URL!)

// Type definitions for database entities
export type UserRole = "admin" | "dermatologist" | "nurse" | "receptionist"
export type SeverityLevel = "clear" | "almost_clear" | "mild" | "moderate" | "severe" | "very_severe"
export type LesionType = "comedone_open" | "comedone_closed" | "papule" | "pustule" | "nodule" | "cyst" | "pih_mark"
export type ScanStatus = "pending" | "processing" | "completed" | "failed"
export type AppointmentStatus = "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show"

export interface User {
  id: string
  email: string
  password_hash: string
  first_name: string
  last_name: string
  role: UserRole
  avatar_url: string | null
  phone: string | null
  license_number: string | null
  specialization: string | null
  is_active: boolean
  email_verified: boolean
  created_at: Date
  updated_at: Date
}

export interface Session {
  id: string
  user_id: string
  token: string
  expires_at: Date
  ip_address: string | null
  user_agent: string | null
  created_at: Date
}

export interface Patient {
  id: string
  patient_number: string
  first_name: string
  last_name: string
  date_of_birth: Date
  gender: string | null
  email: string | null
  phone: string | null
  address: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  skin_type: string | null
  allergies: string[] | null
  medical_history: string | null
  current_medications: string[] | null
  insurance_provider: string | null
  insurance_number: string | null
  notes: string | null
  is_active: boolean
  created_by: string | null
  created_at: Date
  updated_at: Date
}

export interface Scan {
  id: string
  patient_id: string
  performed_by: string
  scan_number: string
  image_url: string
  thumbnail_url: string | null
  original_filename: string | null
  file_size: number | null
  image_width: number | null
  image_height: number | null
  status: ScanStatus
  severity_score: number | null
  severity_level: SeverityLevel | null
  total_lesions: number
  inflammatory_count: number
  non_inflammatory_count: number
  confidence_threshold: number
  processing_time_ms: number | null
  model_version: string | null
  notes: string | null
  created_at: Date
  updated_at: Date
}

export interface LesionDetection {
  id: string
  scan_id: string
  lesion_type: LesionType
  confidence: number
  bbox_x: number
  bbox_y: number
  bbox_width: number
  bbox_height: number
  facial_zone: string | null
  area_pixels: number | null
  is_verified: boolean
  verified_by: string | null
  verified_at: Date | null
  created_at: Date
}

export interface TreatmentPlan {
  id: string
  patient_id: string
  scan_id: string | null
  created_by: string
  plan_name: string
  severity_at_creation: SeverityLevel | null
  start_date: Date
  end_date: Date | null
  is_active: boolean
  follow_up_interval_days: number
  special_instructions: string | null
  contraindications: string[] | null
  notes: string | null
  created_at: Date
  updated_at: Date
}

export interface TreatmentItem {
  id: string
  treatment_plan_id: string
  treatment_type: string
  medication_name: string
  dosage: string | null
  frequency: string | null
  duration: string | null
  application_method: string | null
  evidence_grade: string | null
  is_primary: boolean
  notes: string | null
  created_at: Date
}

export interface Appointment {
  id: string
  patient_id: string
  clinician_id: string
  appointment_type: string
  scheduled_date: Date
  scheduled_time: string
  duration_minutes: number
  status: AppointmentStatus
  reason: string | null
  notes: string | null
  reminder_sent: boolean
  created_at: Date
  updated_at: Date
}

export interface Report {
  id: string
  patient_id: string
  scan_id: string | null
  generated_by: string
  report_type: string
  report_number: string
  title: string
  content: Record<string, unknown> | null
  pdf_url: string | null
  is_finalized: boolean
  finalized_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: Date
}

// Helper to generate unique IDs
export function generatePatientNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
  return `PT-${year}-${random}`
}

export function generateScanNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
  return `SCN-${timestamp}-${random}`
}

export function generateReportNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
  return `RPT-${year}-${random}`
}
