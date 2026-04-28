"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface RecentPatientsProps {
  patients: any[]
}

export function RecentPatients({ patients }: RecentPatientsProps) {
  // Take only the 5 most recent
  const recentPatients = (patients || []).slice(0, 5)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Recent Patients</CardTitle>
          <CardDescription>Latest patient additions</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/patients">
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentPatients.map((patient) => {
            // Calculate age dynamically
            const birthYear = patient.date_of_birth ? new Date(patient.date_of_birth).getFullYear() : null
            const currentYear = new Date().getFullYear()
            const age = birthYear ? currentYear - birthYear : "N/A"

            // Initials for Avatar
            const initials = `${patient.first_name?.[0] || ""}${patient.last_name?.[0] || ""}`.toUpperCase()

            return (
              <div
                key={patient.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {patient.first_name} {patient.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {patient.patient_number} | Age {age}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">
                      Added: {new Date(patient.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-secondary text-secondary-foreground text-[10px]"
                  >
                    Pending Scan
                  </Badge>
                </div>
              </div>
            )
          })}

          {recentPatients.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No recent activity found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}