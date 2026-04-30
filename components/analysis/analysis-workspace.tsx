"use client"

import { useState } from "react"
import { DetectionCanvas } from "./detection-canvas"
import { DetectionResults } from "./detection-results"
import { SeverityPanel } from "./severity-panel"
import { LesionBreakdown } from "./lesion-breakdown"
import { PatientSelector } from "./patient-info"

export function AnalysisWorkspace() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")

  const handlePatientSelect = (id: string) => {
    console.log("Selected patient in Workspace:", id)
    setSelectedPatientId(id)
  }

  const handleAnalyze = () => {
    setIsAnalyzing(true)

    setTimeout(() => {
      setIsAnalyzing(false)
      setHasResults(true)
    }, 2000)
  }

  const handleReset = () => {
    setHasResults(false)

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
        {hasResults && <DetectionResults />}
      </div>

      <div className="space-y-6">
        <PatientSelector onSelect={handlePatientSelect} />
        <SeverityPanel hasResults={hasResults} selectedPatientId={selectedPatientId} />
        {hasResults && <LesionBreakdown />}
      </div>
    </div>
  )
}