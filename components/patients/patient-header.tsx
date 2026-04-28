"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScanFace, FileText, Calendar, Mail, Phone } from "lucide-react"

interface PatientHeaderProps {
  patient: any
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  const birthYear = patient.date_of_birth ? new Date(patient.date_of_birth).getFullYear() : null
  const currentYear = new Date().getFullYear()
  const age = birthYear ? currentYear - birthYear : "Unknown"

  const initials = `${patient.first_name?.[0] || ""}${patient.last_name?.[0] || ""}`.toUpperCase()

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary/20 text-primary text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {patient.first_name} {patient.last_name}
                </h1>
                <p className="text-muted-foreground font-mono">{patient.patient_number}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href={`/analysis?patient=${patient.id}`}>
                    <ScanFace className="h-4 w-4 mr-2" />
                    New Scan
                  </Link>
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Report
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Age / Gender</p>
                <p className="font-medium text-foreground">{age} years, {patient.gender || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Skin Type</p>
                <p className="font-medium text-foreground">{patient.skin_type || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Severity Score</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground text-lg">--</span>
                  <Badge
                    variant="outline"
                    className="bg-secondary text-secondary-foreground text-xs"
                  >
                    Pending Scan
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Added On</p>
                <p className="font-medium text-foreground">
                  {new Date(patient.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground mb-1">Current Treatment Plan</p>
              <p className="text-foreground text-sm">No treatment plan generated yet. Run a scan to begin.</p>
            </div>

            <div className="flex gap-4 text-sm">
              <button className="flex items-center gap-1 text-primary hover:underline">
                <Mail className="h-4 w-4" />
                Send Email
              </button>
              <button className="flex items-center gap-1 text-primary hover:underline">
                <Phone className="h-4 w-4" />
                Call Patient
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}