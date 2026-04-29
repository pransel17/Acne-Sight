"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, Save } from "lucide-react"
import { TemplateRenderer } from "@/components/reports/template-renderer"

export default function CreateTemplatePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Grab the choices from the URL (passed by the Dialog)
  const patient_id = searchParams.get("patient_id")
  const report_type = searchParams.get("report_type")
  const title = searchParams.get("title")

  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState<Record<string, string>>({})

  // Handle typing in the template inputs
  const handleChange = (field: string, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }))
  }

  // THIS is where the data finally goes to your backend
  const handleSubmit = async () => {
    setLoading(true)
    
    const payload = {
      patient_id: patient_id,
      generated_by: "System Clinician",
      report_type: report_type,
      title: title,
      content: content // The specific template data goes into the JSONB field!
    }

    try {
      const response = await fetch("http://localhost:8000/api/reports/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        // Once created successfully, go back to the main reports list
        router.push("/reports")
        router.refresh()
      }
    } catch (error) {
      console.error("Error creating report:", error)
    } finally {
      setLoading(false)
    }
  }

  // --- TEMPLATE UI RENDERERS ---
  const renderTemplate = () => {
    if (report_type === "Initial Assessment") {
      return (
        <div className="space-y-4">
          <div>
            <Label>Chief Complaint</Label>
            <Input onChange={(e) => handleChange("chief_complaint", e.target.value)} placeholder="Why is the patient here?" />
          </div>
          <div>
            <Label>Skin History</Label>
            <textarea className="w-full p-2 border rounded-md" rows={3} onChange={(e) => handleChange("history", e.target.value)} />
          </div>
          <div>
            <Label>Initial Diagnosis</Label>
            <Input onChange={(e) => handleChange("diagnosis", e.target.value)} />
          </div>
        </div>
      )
    } 
    
    if (report_type === "Progress Report") {
      return (
        <div className="space-y-4">
          <div>
            <Label>Changes in Severity</Label>
            <textarea className="w-full p-2 border rounded-md" rows={3} onChange={(e) => handleChange("severity_changes", e.target.value)} />
          </div>
          <div>
            <Label>Patient Feedback (Side effects, compliance)</Label>
            <textarea className="w-full p-2 border rounded-md" rows={3} onChange={(e) => handleChange("feedback", e.target.value)} />
          </div>
        </div>
      )
    }

    if (report_type === "Treatment Summary") {
      return (
        <div className="space-y-4">
          <div>
            <Label>Overall Outcome</Label>
            <Input onChange={(e) => handleChange("outcome", e.target.value)} />
          </div>
          <div>
            <Label>Maintenance Recommendations</Label>
            <textarea className="w-full p-2 border rounded-md" rows={4} onChange={(e) => handleChange("recommendations", e.target.value)} />
          </div>
        </div>
      )
    }

    return <div>No template selected.</div>
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Reports", href: "/reports" }, { label: "New Template" }]}>
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{report_type} • Draft Mode</p>
          </div>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save & Generate Report
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Clinical Data</CardTitle>
          </CardHeader>
            <CardContent>
                <TemplateRenderer 
                  type={report_type} 
                  content={content} 
                  onChange={handleChange} 
                />
            </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}