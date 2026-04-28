"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface WeeklyScansChartProps {
  patients: any[]
}

export function WeeklyScansChart({ patients }: WeeklyScansChartProps) {
  
  const chartData = (() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const last7Days: { day: string; dateStr: string; count: number }[] = []
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      last7Days.push({
        day: days[d.getDay()],
        dateStr: d.toISOString().split('T')[0],
        count: 0
      })
    }

    patients?.forEach(patient => {
      if (patient.created_at) {
        const patientDate = new Date(patient.created_at).toISOString().split('T')[0]
        const dayMatch = last7Days.find(d => d.dateStr === patientDate)
        if (dayMatch) {
          dayMatch.count += 1
        }
      }
    })

    return last7Days
  })()

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Patient Registrations</CardTitle>
        <CardDescription>New patient records created this week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                stroke="hsl(215, 16%, 47%)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(215, 16%, 47%)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 13%, 8%)",
                  border: "1px solid hsl(220, 13%, 18%)",
                  borderRadius: "8px",
                  color: "hsl(210, 20%, 98%)",
                }}
                formatter={(value: number) => [`${value} New Patients`, "Count"]}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(199, 89%, 48%)"
                strokeWidth={2}
                fill="url(#scanGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}