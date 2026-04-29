// components/reports/template-renderer.tsx
"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Import the TypeScript interfaces we created
import { InitialAssessmentData, ProgressReportData, TreatmentSummaryData } from "./types"

// ============================================================================
// 1. Initial Assessment Form
// ============================================================================
export const InitialAssessmentForm = ({ 
  content, 
  onChange 
}: { 
  content: Partial<InitialAssessmentData>, 
  onChange: (key: string, value: string) => void 
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>Fitzpatrick Skin Type</Label>
        <Select value={content.fitzpatrick_scale} onValueChange={(val) => onChange("fitzpatrick_scale", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Skin Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Type I (Always burns, never tans)">Type I (Always burns)</SelectItem>
            <SelectItem value="Type II (Usually burns, tans minimally)">Type II (Usually burns)</SelectItem>
            <SelectItem value="Type III (Sometimes burns, tans uniformly)">Type III (Sometimes burns)</SelectItem>
            <SelectItem value="Type IV (Burns minimally, always tans)">Type IV (Burns minimally)</SelectItem>
            <SelectItem value="Type V (Rarely burns, tans profusely)">Type V (Rarely burns)</SelectItem>
            <SelectItem value="Type VI (Never burns, deeply pigmented)">Type VI (Never burns)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Lesion Distribution</Label>
        <Select value={content.lesion_distribution} onValueChange={(val) => onChange("lesion_distribution", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Zones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="T-Zone Only">T-Zone Only</SelectItem>
            <SelectItem value="U-Zone (Cheeks/Jawline)">U-Zone (Cheeks/Jawline)</SelectItem>
            <SelectItem value="Pan-facial">Pan-facial</SelectItem>
            <SelectItem value="Face & Truncal (Back/Chest)">Face & Truncal (Back/Chest)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    
    <div>
      <Label>History of Present Illness (HPI)</Label>
      <Textarea 
        value={content.hpi || ""} 
        onChange={(e) => onChange("hpi", e.target.value)} 
        placeholder="Onset, duration, triggers (e.g., hormonal, stress, diet)..." 
      />
    </div>
    <div>
      <Label>Prior Failed Treatments</Label>
      <Textarea 
        value={content.prior_treatments || ""} 
        onChange={(e) => onChange("prior_treatments", e.target.value)} 
        placeholder="List OTC cleansers, prior antibiotics, or topicals..." 
      />
    </div>
    <div>
      <Label>Clinical Impression</Label>
      <Textarea 
        value={content.clinical_impression || ""} 
        onChange={(e) => onChange("clinical_impression", e.target.value)} 
        placeholder="e.g., Moderate Inflammatory Acne Vulgaris..." 
      />
    </div>
    <div>
      <Label>Treatment Plan</Label>
      <Textarea 
        value={content.treatment_plan || ""} 
        onChange={(e) => onChange("treatment_plan", e.target.value)} 
        placeholder="Prescribed regimen and lifestyle recommendations..." 
        className="min-h-[100px]" 
      />
    </div>
  </div>
);

// ============================================================================
// 2. Progress Report Form
// ============================================================================
export const ProgressReportForm = ({ 
  content, 
  onChange 
}: { 
  content: Partial<ProgressReportData>, 
  onChange: (key: string, value: string) => void 
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>Medication Adherence</Label>
        <Select value={content.adherence} onValueChange={(val) => onChange("adherence", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select adherence level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Excellent (Uses as directed)">Excellent (Uses as directed)</SelectItem>
            <SelectItem value="Fair (Misses occasionally)">Fair (Misses occasionally)</SelectItem>
            <SelectItem value="Poor (Rarely uses)">Poor (Rarely uses)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Clinical Assessment</Label>
        <Select value={content.clinical_assessment} onValueChange={(val) => onChange("clinical_assessment", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Significant Improvement">Significant Improvement</SelectItem>
            <SelectItem value="Mild Improvement">Mild Improvement</SelectItem>
            <SelectItem value="Stable / Unchanged">Stable / Unchanged</SelectItem>
            <SelectItem value="Worsening">Worsening</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div>
      <Label>Interval History</Label>
      <Textarea 
        value={content.interval_history || ""} 
        onChange={(e) => onChange("interval_history", e.target.value)} 
        placeholder="Patient notes on breakouts since last visit..." 
      />
    </div>
    <div>
      <Label>Tolerability & Adverse Effects</Label>
      <Textarea 
        value={content.tolerability || ""} 
        onChange={(e) => onChange("tolerability", e.target.value)} 
        placeholder="Note any erythema (redness), peeling, dryness, or stinging..." 
      />
    </div>
    <div>
      <Label>Plan Adjustments</Label>
      <Textarea 
        value={content.plan_adjustments || ""} 
        onChange={(e) => onChange("plan_adjustments", e.target.value)} 
        placeholder="e.g., Decrease retinoid to 3x/week, switch moisturizer..." 
      />
    </div>
  </div>
);

// ============================================================================
// 3. Treatment Summary Form
// ============================================================================
export const TreatmentSummaryForm = ({ 
  content, 
  onChange 
}: { 
  content: Partial<TreatmentSummaryData>, 
  onChange: (key: string, value: string) => void 
}) => (
  <div className="space-y-4">
    <div>
      <Label>Treatment Duration</Label>
      <Textarea 
        value={content.treatment_duration || ""} 
        onChange={(e) => onChange("treatment_duration", e.target.value)} 
        placeholder="e.g., 6 months of active treatment..." 
        rows={2}
      />
    </div>
    <div>
      <Label>Medications Used</Label>
      <Textarea 
        value={content.medications_used || ""} 
        onChange={(e) => onChange("medications_used", e.target.value)} 
        placeholder="Comprehensive list of treatments that were effective..." 
      />
    </div>
    <div>
      <Label>Overall Outcome</Label>
      <Textarea 
        value={content.overall_outcome || ""} 
        onChange={(e) => onChange("overall_outcome", e.target.value)} 
        placeholder="Final results compared to baseline (e.g., 90% clearance)..." 
      />
    </div>
    <div>
      <Label>Maintenance Regimen</Label>
      <Textarea 
        value={content.maintenance_regimen || ""} 
        onChange={(e) => onChange("maintenance_regimen", e.target.value)} 
        placeholder="Long-term skincare routine to prevent relapse..." 
      />
    </div>
    <div>
      <Label>Follow-up Instructions</Label>
      <Textarea 
        value={content.follow_up_instructions || ""} 
        onChange={(e) => onChange("follow_up_instructions", e.target.value)} 
        placeholder="When the patient should return to the clinic..." 
        rows={2}
      />
    </div>
  </div>
);

// ============================================================================
// 4. Master Switcher Component
// ============================================================================
export const TemplateRenderer = ({ 
  type, 
  content, 
  onChange 
}: { 
  type: string | null, 
  content: any, 
  onChange: (key: string, value: string) => void 
}) => {
  switch (type) {
    case "Initial Assessment": 
      return <InitialAssessmentForm content={content} onChange={onChange} />;
    case "Progress Report": 
      return <ProgressReportForm content={content} onChange={onChange} />;
    case "Treatment Summary": 
      return <TreatmentSummaryForm content={content} onChange={onChange} />;
    default: 
      return (
        <div className="text-muted-foreground p-8 text-center border border-dashed rounded-md bg-secondary/20">
          No template selected. Please go back and select a report type.
        </div>
      );
  }
};