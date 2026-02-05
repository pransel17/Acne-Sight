"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { treatmentRecommendations } from "@/lib/mock-data"
import { Pill, Droplets, Sparkles, Leaf, Copy, FileText, Star, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const typeIcons: Record<string, React.ReactNode> = {
  Oral: <Pill className="h-4 w-4" />,
  Topical: <Droplets className="h-4 w-4" />,
  Procedural: <Sparkles className="h-4 w-4" />,
  Lifestyle: <Leaf className="h-4 w-4" />,
}

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  Oral: { bg: "bg-violet-500/20", text: "text-violet-400", border: "border-violet-500/30" },
  Topical: { bg: "bg-sky-500/20", text: "text-sky-400", border: "border-sky-500/30" },
  Procedural: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
  Lifestyle: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
}

export function TreatmentRecommendations() {
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>(
    treatmentRecommendations.map((t) => t.id)
  )

  const toggleTreatment = (id: string) => {
    setSelectedTreatments((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const renderEvidenceStars = (level: string) => {
    const count = level === "A" ? 5 : level === "B" ? 4 : 3
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={`star-${level}-${i}`}
            className={`h-3 w-3 ${i < count ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
          />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">Grade {level}</span>
      </div>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-foreground">Recommended Treatment Plan</CardTitle>
            <CardDescription>
              Based on: Moderately Severe acne (Score: 34), Predominant inflammatory lesions (67%)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Generate Prescription
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {treatmentRecommendations.map((treatment) => (
          <div
            key={treatment.id}
            className={`p-4 rounded-lg border transition-colors ${
              selectedTreatments.includes(treatment.id)
                ? "bg-secondary border-primary/50"
                : "bg-secondary/50 border-border"
            }`}
          >
            <div className="flex items-start gap-4">
              <Checkbox
                id={treatment.id}
                checked={selectedTreatments.includes(treatment.id)}
                onCheckedChange={() => toggleTreatment(treatment.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{treatment.name}</span>
                      <Badge
                        variant="outline"
                        className={`${typeColors[treatment.type]?.bg} ${typeColors[treatment.type]?.text} ${typeColors[treatment.type]?.border}`}
                      >
                        {typeIcons[treatment.type]}
                        <span className="ml-1">{treatment.type}</span>
                      </Badge>
                    </div>
                    {treatment.dosage && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Dosage: {treatment.dosage}
                      </p>
                    )}
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {renderEvidenceStars(treatment.evidenceLevel)}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Evidence Level {treatment.evidenceLevel}: {
                          treatment.evidenceLevel === "A" 
                            ? "Strong recommendation based on high-quality evidence"
                            : "Moderate recommendation based on good evidence"
                        }</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="ml-2 text-foreground">{treatment.frequency}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-2 text-foreground">{treatment.duration}</span>
                  </div>
                </div>

                {treatment.notes && (
                  <div className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm">
                    <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{treatment.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Alternative Options */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm font-medium text-foreground mb-3">Alternative Options</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              <input type="radio" name="alternative" className="text-primary" />
              Isotretinoin pathway (if no response in 12 weeks)
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              <input type="radio" name="alternative" className="text-primary" />
              Hormonal therapy (for adult female patients)
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              <input type="radio" name="alternative" className="text-primary" />
              Chemical peels (adjunctive therapy)
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
