"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSeverityBadgeClass } from "@/lib/mock-data"
import { ScanFace, Pill, Calendar, FileText } from "lucide-react"

interface PatientHistoryProps {
  patientId: string
}

// Mock history data
const historyEvents = [
  {
    id: "h1",
    type: "scan",
    date: "2026-01-15",
    title: "Skin Analysis Completed",
    description: "104 lesions detected. Severity score: 34",
    severity: "Moderately Severe",
  },
  {
    id: "h2",
    type: "treatment",
    date: "2026-01-15",
    title: "Treatment Plan Updated",
    description: "Started on Doxycycline 100mg + Adapalene/BP combination",
    severity: null,
  },
  {
    id: "h3",
    type: "scan",
    date: "2025-12-01",
    title: "Skin Analysis Completed",
    description: "118 lesions detected. Severity score: 42",
    severity: "Severe",
  },
  {
    id: "h4",
    type: "appointment",
    date: "2025-11-15",
    title: "Initial Consultation",
    description: "First visit. Patient history recorded.",
    severity: null,
  },
  {
    id: "h5",
    type: "report",
    date: "2025-11-15",
    title: "Baseline Report Generated",
    description: "Comprehensive baseline assessment completed",
    severity: null,
  },
]

const getEventIcon = (type: string) => {
  switch (type) {
    case "scan":
      return <ScanFace className="h-4 w-4" />
    case "treatment":
      return <Pill className="h-4 w-4" />
    case "appointment":
      return <Calendar className="h-4 w-4" />
    case "report":
      return <FileText className="h-4 w-4" />
    default:
      return <Calendar className="h-4 w-4" />
  }
}

export function PatientHistory({ patientId }: PatientHistoryProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Patient History</CardTitle>
        <CardDescription>Timeline of visits, scans, and treatments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          
          <div className="space-y-6">
            {historyEvents.map((event, index) => (
              <div key={event.id} className="relative pl-10">
                {/* Timeline dot */}
                <div className="absolute left-0 w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground">
                  {getEventIcon(event.type)}
                </div>
                
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    </div>
                    {event.severity && (
                      <Badge
                        variant="outline"
                        className={`${getSeverityBadgeClass(event.severity)} text-xs shrink-0`}
                      >
                        {event.severity}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
