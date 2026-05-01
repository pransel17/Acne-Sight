"use client"

import { useState } from "react"
import { DetectionCanvas } from "./detection-canvas"
import { DetectionResults } from "./detection-results"
import { SeverityPanel } from "./severity-panel"
import { LesionBreakdown } from "./lesion-breakdown"
import { PatientSelector } from "./patient-info"
import { Button } from "@/components/ui/button"

export function AnalysisWorkspace() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [imageUrl, setImageUrl] = useState<string>("");

  const handlePatientSelect = (id: string) => {
    setSelectedPatientId(id)
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("http://192.168.1.62:5000/capture", { 
        method: "POST",
      });
      const data = await response.json()

      setAnalysisData(data)
      setImageUrl(data.image_url) 
      setHasResults(true)
    } catch (error) {
      console.error("Analysis failed:", error)
      alert("Could not connect to Raspberry Pi.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleConfirmSave = async () => {
      if (!selectedPatientId || !analysisData || !imageUrl) {
        alert("Please select a patient and capture an image first.");
        return;
      }

      try {

        const payload = {
          patient_id: selectedPatientId,
          image_url: imageUrl, 
          severity_score: 34, 
          severity_level: "moderate", 
          confidence_threshold: 0.10,
          notes: "Captured via Raspberry Pi",
          predictions: analysisData.predictions.map((d: any) => ({
            class: d.class,
            confidence: d.confidence,
            x: d.x,
            y: d.y,
            width: d.width,
            height: d.height
          }))
        };

        const response = await fetch("/api/scans", { 
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          alert("Scan saved successfully!");
          handleReset();
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.error}`);
        }
      } catch (error) {
        console.error("Error saving:", error);
        alert("Network error: Could not save to database.");
      }
  };

  const handleReset = () => {
    setHasResults(false)
    setAnalysisData(null)
    setImageUrl("")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <DetectionCanvas 
          selectedPatientId={selectedPatientId} 
          isAnalyzing={isAnalyzing} 
          hasResults={hasResults}
          onAnalyze={handleAnalyze}
          onReset={handleReset}
        />
        {hasResults && (
          <div className="space-y-4">
            <DetectionResults detections={analysisData?.predictions || []} />
            <div className="flex justify-end gap-4 p-4 bg-card border rounded-lg">
              <Button variant="outline" onClick={handleReset}>Retake / Discard</Button>
              <Button onClick={handleConfirmSave} className="bg-primary text-primary-foreground">
                Confirm & Save to Record
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <PatientSelector onSelect={handlePatientSelect} />
        <SeverityPanel hasResults={hasResults} selectedPatientId={selectedPatientId} />
        {hasResults && <LesionBreakdown detections={analysisData?.predictions || []} />}
      </div>
    </div>
  )
}