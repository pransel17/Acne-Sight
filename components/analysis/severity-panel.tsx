"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { regionalDistribution } from "@/lib/mock-data"
import { AlertTriangle, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SeverityPanelProps {
  hasResults: boolean
  selectedPatientId: string;
}

export function SeverityPanel({ hasResults }: SeverityPanelProps) {
  const overallScore = 34
  const severityLevel = "Moderately Severe"

  if (!hasResults) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Severity Assessment</CardTitle>
          <CardDescription>Run analysis to see results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              No analysis data available
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload and analyze an image to view severity assessment
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Severity Assessment</CardTitle>
        <CardDescription>Global Acne Severity Score (GASS)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(220, 13%, 18%)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(25, 95%, 53%)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(overallScore / 50) * 251.2} 251.2`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{overallScore}</span>
              <span className="text-xs text-muted-foreground">/ 50</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-sm">
            {severityLevel}
          </Badge>
          <div className="flex items-center justify-center gap-1 mt-2 text-emerald-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">5 points lower than last visit</span>
          </div>
        </div>

        {/* Regional Breakdown */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Regional Distribution</p>
          {regionalDistribution.map((region) => (
            <div key={region.region} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-24">{region.region}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(region.score / 20) * 100}%`,
                    backgroundColor:
                      region.score > 12
                        ? "hsl(0, 72%, 51%)"
                        : region.score > 8
                          ? "hsl(25, 95%, 53%)"
                          : "hsl(48, 96%, 53%)",
                  }}
                />
              </div>
              <span className="text-sm font-mono text-foreground w-8">{region.score}</span>
            </div>
          ))}
        </div>

        {/* Action */}
        <Button className="w-full" asChild>
          <Link href="/treatments">
            View Treatment Options
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
