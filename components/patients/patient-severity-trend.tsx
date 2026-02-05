"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { severityTrendData } from "@/lib/mock-data"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { TrendingDown } from "lucide-react"

export function PatientSeverityTrend() {
  const firstScore = severityTrendData[0]?.score || 0
  const lastScore = severityTrendData[severityTrendData.length - 1]?.score || 0
  const improvement = Math.round(((firstScore - lastScore) / firstScore) * 100)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Severity Trend</CardTitle>
            <CardDescription>Treatment progress over time</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingDown className="h-5 w-5" />
            <span className="font-bold text-lg">{improvement}%</span>
            <span className="text-sm text-muted-foreground">improvement</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={severityTrendData}>
              <XAxis
                dataKey="date"
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
                domain={[0, 60]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 13%, 8%)",
                  border: "1px solid hsl(220, 13%, 18%)",
                  borderRadius: "8px",
                  color: "hsl(210, 20%, 98%)",
                }}
                formatter={(value: number) => [`Score: ${value}`, "Severity"]}
              />
              {/* Reference lines for severity zones */}
              <ReferenceLine y={10} stroke="hsl(142, 76%, 36%)" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={25} stroke="hsl(48, 96%, 53%)" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={40} stroke="hsl(25, 95%, 53%)" strokeDasharray="3 3" strokeOpacity={0.5} />
              
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(199, 89%, 48%)"
                strokeWidth={3}
                dot={{
                  fill: "hsl(199, 89%, 48%)",
                  strokeWidth: 2,
                  stroke: "hsl(220, 13%, 8%)",
                  r: 5,
                }}
                activeDot={{
                  r: 7,
                  fill: "hsl(199, 89%, 48%)",
                  stroke: "hsl(210, 20%, 98%)",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-emerald-500" />
            <span>Mild (0-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-yellow-500" />
            <span>Moderate (11-25)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-orange-500" />
            <span>Mod. Severe (26-40)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
