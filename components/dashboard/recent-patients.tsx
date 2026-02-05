"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { patients, getSeverityBadgeClass } from "@/lib/mock-data"
import { ArrowRight } from "lucide-react"

export function RecentPatients() {
  const recentPatients = patients.slice(0, 5)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Recent Patients</CardTitle>
          <CardDescription>Latest patient assessments</CardDescription>
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
          {recentPatients.map((patient) => (
            <div
              key={patient.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground text-sm">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {patient.id} | Age {patient.age}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-mono text-foreground">Score: {patient.severityScore}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(patient.lastVisit).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`${getSeverityBadgeClass(patient.severityLevel)} text-xs`}
                >
                  {patient.severityLevel}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
