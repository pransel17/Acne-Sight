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
  
  const patient_id = searchParams.get("patient_id")
  const report_type = searchParams.get("report_type")
  const title = searchParams.get("title")

  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    // THIS IS THE FIX FOR THE 422 ERROR
    // We replaced "System Clinician" with a valid UUID. 
    // Tomorrow, we will swap this hardcoded ID with your real Auth Cookie ID.
    const payload = {
      patient_id: patient_id,
      scan_id: null, 
      generated_by: "fda369e8-f6db-432a-987a-90385ccdb9d7", 
      report_type: report_type,
      title: title,
      content: content 
    }

    try {
      const response = await fetch("http://localhost:8000/api/reports/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push("/reports")
        router.refresh()
      } else {
        // If it fails again, this will log the exact reason in your browser console
        const errorData = await response.json()
        console.error("Backend rejected it:", errorData)
      }
    } catch (error) {
      console.error("Error creating report:", error)
    } finally {
      setLoading(false)
    }
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