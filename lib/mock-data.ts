// Mock data for ACNE SIGHT dashboard

export interface Patient {
  id: string
  name: string
  age: number
  gender: "Male" | "Female" | "Other"
  lastVisit: string
  nextAppointment: string | null
  severityScore: number
  severityLevel: "Clear" | "Mild" | "Moderate" | "Moderately Severe" | "Severe"
  skinType: string
  treatmentPlan: string
  avatar?: string
}

export interface LesionCount {
  type: string
  count: number
  color: string
}

export interface SeverityTrend {
  date: string
  score: number
}

export interface DetectionResult {
  id: string
  type: "Comedone" | "Papule" | "Pustule" | "Nodule" | "Cyst" | "PIH"
  confidence: number
  x: number
  y: number
  width: number
  height: number
  region: "Forehead" | "Left Cheek" | "Right Cheek" | "Nose" | "Chin"
}

export interface TreatmentRecommendation {
  id: string
  name: string
  type: "Topical" | "Oral" | "Procedural" | "Lifestyle"
  dosage?: string
  frequency: string
  duration: string
  evidenceLevel: "A" | "B" | "C"
  notes?: string
}

// Sample patients
export const patients: Patient[] = [
  {
    id: "PT-2024-0847",
    name: "Jane Doe",
    age: 24,
    gender: "Female",
    lastVisit: "2026-01-15",
    nextAppointment: "2026-02-12",
    severityScore: 34,
    severityLevel: "Moderately Severe",
    skinType: "Type III (Fitzpatrick)",
    treatmentPlan: "Oral antibiotics + Topical retinoid",
  },
  {
    id: "PT-2024-0923",
    name: "John Smith",
    age: 19,
    gender: "Male",
    lastVisit: "2026-01-28",
    nextAppointment: "2026-02-25",
    severityScore: 18,
    severityLevel: "Moderate",
    skinType: "Type II (Fitzpatrick)",
    treatmentPlan: "Topical combination therapy",
  },
  {
    id: "PT-2024-1102",
    name: "Emily Chen",
    age: 31,
    gender: "Female",
    lastVisit: "2026-02-01",
    nextAppointment: "2026-02-15",
    severityScore: 42,
    severityLevel: "Severe",
    skinType: "Type IV (Fitzpatrick)",
    treatmentPlan: "Isotretinoin evaluation",
  },
  {
    id: "PT-2024-1205",
    name: "Michael Brown",
    age: 16,
    gender: "Male",
    lastVisit: "2026-02-03",
    nextAppointment: "2026-03-01",
    severityScore: 12,
    severityLevel: "Mild",
    skinType: "Type I (Fitzpatrick)",
    treatmentPlan: "Benzoyl peroxide + Adapalene",
  },
  {
    id: "PT-2024-1298",
    name: "Sarah Wilson",
    age: 27,
    gender: "Female",
    lastVisit: "2026-02-04",
    nextAppointment: null,
    severityScore: 5,
    severityLevel: "Mild",
    skinType: "Type II (Fitzpatrick)",
    treatmentPlan: "Maintenance therapy",
  },
]

// Lesion counts for a sample detection
export const sampleLesionCounts: LesionCount[] = [
  { type: "Comedones", count: 42, color: "hsl(var(--chart-1))" },
  { type: "Papules", count: 28, color: "hsl(var(--chart-2))" },
  { type: "Pustules", count: 15, color: "hsl(var(--chart-3))" },
  { type: "Nodules", count: 6, color: "hsl(var(--chart-4))" },
  { type: "Cysts", count: 2, color: "hsl(var(--chart-5))" },
  { type: "PIH Marks", count: 11, color: "hsl(215 16% 47%)" },
]

// Severity trend data
export const severityTrendData: SeverityTrend[] = [
  { date: "Jan", score: 48 },
  { date: "Feb", score: 42 },
  { date: "Mar", score: 38 },
  { date: "Apr", score: 28 },
  { date: "May", score: 22 },
  { date: "Jun", score: 12 },
]

// Regional distribution
export const regionalDistribution = [
  { region: "Forehead", score: 8, level: "Moderate" },
  { region: "Left Cheek", score: 14, level: "Severe" },
  { region: "Right Cheek", score: 12, level: "Severe" },
  { region: "Nose", score: 4, level: "Mild" },
  { region: "Chin", score: 12, level: "Moderate-Severe" },
]

// Sample detection results
export const sampleDetections: DetectionResult[] = [
  { id: "d1", type: "Papule", confidence: 0.94, x: 120, y: 80, width: 24, height: 24, region: "Forehead" },
  { id: "d2", type: "Comedone", confidence: 0.89, x: 85, y: 140, width: 18, height: 18, region: "Left Cheek" },
  { id: "d3", type: "Pustule", confidence: 0.92, x: 195, y: 145, width: 22, height: 22, region: "Right Cheek" },
  { id: "d4", type: "Comedone", confidence: 0.87, x: 140, y: 160, width: 16, height: 16, region: "Nose" },
  { id: "d5", type: "Papule", confidence: 0.91, x: 145, y: 210, width: 20, height: 20, region: "Chin" },
  { id: "d6", type: "Nodule", confidence: 0.85, x: 70, y: 165, width: 28, height: 28, region: "Left Cheek" },
]

// Treatment recommendations
export const treatmentRecommendations: TreatmentRecommendation[] = [
  {
    id: "tr1",
    name: "Doxycycline 100mg",
    type: "Oral",
    dosage: "100mg",
    frequency: "Once daily",
    duration: "12 weeks",
    evidenceLevel: "A",
    notes: "Take with food to minimize GI upset",
  },
  {
    id: "tr2",
    name: "Adapalene 0.3% + Benzoyl Peroxide 2.5%",
    type: "Topical",
    frequency: "Once nightly",
    duration: "Ongoing",
    evidenceLevel: "A",
    notes: "Apply pea-sized amount after cleansing",
  },
  {
    id: "tr3",
    name: "Gentle Non-Comedogenic Cleanser",
    type: "Topical",
    frequency: "Twice daily",
    duration: "Ongoing",
    evidenceLevel: "B",
  },
  {
    id: "tr4",
    name: "SPF 30+ Sunscreen",
    type: "Topical",
    frequency: "Daily (AM)",
    duration: "Ongoing",
    evidenceLevel: "B",
    notes: "Required with retinoid use",
  },
]

// Dashboard stats
export const dashboardStats = {
  totalPatients: 847,
  scansToday: 23,
  avgSeverityReduction: 42,
  upcomingAppointments: 12,
}

// Weekly scan data
export const weeklyScanData = [
  { day: "Mon", scans: 18 },
  { day: "Tue", scans: 24 },
  { day: "Wed", scans: 21 },
  { day: "Thu", scans: 28 },
  { day: "Fri", scans: 32 },
  { day: "Sat", scans: 8 },
  { day: "Sun", scans: 0 },
]

// Severity distribution
export const severityDistribution = [
  { level: "Clear", count: 127, percentage: 15 },
  { level: "Mild", count: 237, percentage: 28 },
  { level: "Moderate", count: 271, percentage: 32 },
  { level: "Mod. Severe", count: 153, percentage: 18 },
  { level: "Severe", count: 59, percentage: 7 },
]

export function getSeverityColor(level: string): string {
  switch (level.toLowerCase()) {
    case "clear":
      return "hsl(var(--severity-clear))"
    case "mild":
      return "hsl(var(--severity-mild))"
    case "moderate":
      return "hsl(var(--chart-4))"
    case "moderately severe":
    case "mod. severe":
      return "hsl(var(--chart-4))"
    case "severe":
      return "hsl(var(--severity-severe))"
    default:
      return "hsl(var(--muted-foreground))"
  }
}

export function getSeverityBadgeClass(level: string): string {
  switch (level.toLowerCase()) {
    case "clear":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    case "mild":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "moderate":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    case "moderately severe":
    case "mod. severe":
      return "bg-orange-600/20 text-orange-300 border-orange-600/30"
    case "severe":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}
