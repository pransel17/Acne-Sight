-- ACNE SIGHT Database Schema
-- PostgreSQL v18.2 Compatible

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Clinicians/Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'dermatologist' CHECK (role IN ('admin', 'dermatologist', 'nurse', 'receptionist')),
  license_number VARCHAR(100),
  specialization VARCHAR(100),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PATIENTS
-- ============================================

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  skin_type VARCHAR(10) CHECK (skin_type IN ('I', 'II', 'III', 'IV', 'V', 'VI')),
  medical_history TEXT,
  allergies TEXT[],
  current_medications TEXT[],
  is_pregnant BOOLEAN DEFAULT false,
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(50),
  notes TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCANS & DETECTIONS
-- ============================================

-- Scan sessions
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  performed_by UUID REFERENCES users(id),
  scan_date TIMESTAMPTZ DEFAULT NOW(),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Overall severity assessment
  severity_score INTEGER CHECK (severity_score >= 0 AND severity_score <= 100),
  severity_grade VARCHAR(20) CHECK (severity_grade IN ('clear', 'almost_clear', 'mild', 'moderate', 'severe', 'very_severe')),
  
  -- Lesion counts by type
  comedones_count INTEGER DEFAULT 0,
  papules_count INTEGER DEFAULT 0,
  pustules_count INTEGER DEFAULT 0,
  nodules_count INTEGER DEFAULT 0,
  cysts_count INTEGER DEFAULT 0,
  pih_marks_count INTEGER DEFAULT 0,
  total_lesions INTEGER DEFAULT 0,
  
  -- Regional scores (0-100)
  forehead_score INTEGER DEFAULT 0,
  left_cheek_score INTEGER DEFAULT 0,
  right_cheek_score INTEGER DEFAULT 0,
  nose_score INTEGER DEFAULT 0,
  chin_score INTEGER DEFAULT 0,
  
  -- Detection metadata
  confidence_threshold DECIMAL(3,2) DEFAULT 0.75,
  model_version VARCHAR(50) DEFAULT 'yolov8m',
  processing_time_ms INTEGER,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual lesion detections
CREATE TABLE IF NOT EXISTS lesion_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  
  -- Detection details
  lesion_type VARCHAR(50) NOT NULL CHECK (lesion_type IN ('comedone', 'papule', 'pustule', 'nodule', 'cyst', 'pih_mark')),
  confidence DECIMAL(4,3) NOT NULL,
  
  -- Bounding box coordinates (normalized 0-1)
  bbox_x DECIMAL(6,5) NOT NULL,
  bbox_y DECIMAL(6,5) NOT NULL,
  bbox_width DECIMAL(6,5) NOT NULL,
  bbox_height DECIMAL(6,5) NOT NULL,
  
  -- Facial region
  facial_region VARCHAR(50) CHECK (facial_region IN ('forehead', 'left_cheek', 'right_cheek', 'nose', 'chin', 'other')),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TREATMENTS
-- ============================================

-- Treatment plans
CREATE TABLE IF NOT EXISTS treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES scans(id),
  created_by UUID REFERENCES users(id),
  
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'discontinued')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  
  -- AI recommendation metadata
  is_ai_generated BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(4,3),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Treatment items (individual medications/procedures)
CREATE TABLE IF NOT EXISTS treatment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_plan_id UUID NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
  
  treatment_type VARCHAR(50) NOT NULL CHECK (treatment_type IN ('topical', 'oral', 'procedure', 'lifestyle')),
  name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  duration VARCHAR(100),
  instructions TEXT,
  
  -- Evidence level
  evidence_grade VARCHAR(10) CHECK (evidence_grade IN ('A', 'B', 'C', 'D')),
  
  is_active BOOLEAN DEFAULT true,
  started_at DATE DEFAULT CURRENT_DATE,
  ended_at DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPOINTMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinician_id UUID REFERENCES users(id),
  
  appointment_type VARCHAR(50) DEFAULT 'follow_up' CHECK (appointment_type IN ('initial', 'follow_up', 'scan', 'procedure', 'consultation')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REPORTS
-- ============================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,
  generated_by UUID REFERENCES users(id),
  
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('scan_analysis', 'progress_report', 'treatment_summary', 'clinical_notes')),
  title VARCHAR(255) NOT NULL,
  content JSONB,
  pdf_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_patients_patient_number ON patients(patient_number);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_patients_created_by ON patients(created_by);

CREATE INDEX IF NOT EXISTS idx_scans_patient_id ON scans(patient_id);
CREATE INDEX IF NOT EXISTS idx_scans_date ON scans(scan_date);
CREATE INDEX IF NOT EXISTS idx_scans_severity ON scans(severity_grade);

CREATE INDEX IF NOT EXISTS idx_lesion_detections_scan_id ON lesion_detections(scan_id);
CREATE INDEX IF NOT EXISTS idx_lesion_detections_type ON lesion_detections(lesion_type);

CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient_id ON treatment_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_status ON treatment_plans(status);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinician_id ON appointments(clinician_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_treatment_plans_updated_at ON treatment_plans;
CREATE TRIGGER update_treatment_plans_updated_at BEFORE UPDATE ON treatment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
