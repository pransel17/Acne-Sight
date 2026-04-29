"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ScanFace, TrendingDown, Calendar } from "lucide-react"
import { dashboardStats } from "@/lib/mock-data"

export function StatsCards() {
  const [patientData, setPatientData] = useState({ total: 0, thisWeek: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPatientStats() {
      try {
        const response = await fetch("http://localhost:8000/api/patients/", {
          method: "GET",
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          
          // Calculate patients added this week
          const now = new Date()
          const startOfWeek = new Date(now)
          // Set to last Sunday or Monday (e.g., 7 days ago)
          startOfWeek.setDate(now.getDate() - 7) 

          const addedThisWeek = data.filter((p: any) => {
            const createdDate = new Date(p.created_at)
            return createdDate >= startOfWeek
          }).length

          setPatientData({
            total: data.length,
            thisWeek: addedThisWeek
          })
        }
      } catch (error) {
        console.error("Failed to fetch patient stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatientStats()
  }, [])

  const stats = [
    {
      title: "Total Patients",
      value: isLoading ? "---" : patientData.total.toLocaleString(),
      description: isLoading ? "Loading..." : `+${patientData.thisWeek} this week`,
      icon: Users,
      trend: "up",
    },
    {
      title: "Scans Today",
      value: dashboardStats.scansToday.toString(),
      description: "8 pending analysis",
      icon: ScanFace,
      trend: "neutral",
    },
    {
      title: "Avg. Severity Reduction",
      value: `${dashboardStats.avgSeverityReduction}%`,
      description: "Last 30 days",
      icon: TrendingDown,
      trend: "up",
    },
    {
      title: "Upcoming Appointments",
      value: dashboardStats.upcomingAppointments.toString(),
      description: "Next 7 days",
      icon: Calendar,
      trend: "neutral",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}