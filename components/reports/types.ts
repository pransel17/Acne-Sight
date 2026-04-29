// components/reports/types.ts

export interface InitialAssessmentData {
  hpi: string; 
  fitzpatrick_scale: string; 
  lesion_distribution: string; 
  prior_treatments: string; 
  clinical_impression: string; 
  treatment_plan: string; 
}

export interface ProgressReportData {
  interval_history: string; 
  tolerability: string; 
  adherence: string; 
  clinical_assessment: string; 
  plan_adjustments: string; 
}

export interface TreatmentSummaryData {
  treatment_duration: string; 
  medications_used: string; 
  overall_outcome: string; 
  maintenance_regimen: string; 
  follow_up_instructions: string; 
}