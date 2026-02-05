"use client"

import { useState } from "react"
import { DetectionCanvas } from "./detection-canvas"
import { DetectionResults } from "./detection-results"
import { SeverityPanel } from "./severity-panel"
import { LesionBreakdown } from "./lesion-breakdown"

export function AnalysisWorkspace() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasResults, setHasResults] = useState(false)

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    // Simulate analysis
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
          isAnalyzing={isAnalyzing} 
          hasResults={hasResults}
          onAnalyze={handleAnalyze}
          onReset={handleReset}
        />
        {hasResults && <DetectionResults />}
      </div>
      <div className="space-y-6">
        <SeverityPanel hasResults={hasResults} />
        {hasResults && <LesionBreakdown />}
      </div>
    </div>
  )
}
