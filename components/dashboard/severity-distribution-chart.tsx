"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { severityDistribution } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const severityColors = [
  "hsl(142, 76%, 36%)", // Clear - green
  "hsl(48, 96%, 53%)",  // Mild - yellow
  "hsl(25, 95%, 53%)",  // Moderate - orange
  "hsl(25, 95%, 43%)",  // Mod. Severe - darker orange
  "hsl(0, 72%, 51%)",   // Severe - red
]

export function SeverityDistributionChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Severity Distribution</CardTitle>
        <CardDescription>Patient population by acne severity level</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityDistribution} layout="vertical">
              <XAxis type="number" stroke="hsl(215, 16%, 47%)" fontSize={12} />
              <YAxis 
                dataKey="level" 
                type="category" 
                stroke="hsl(215, 16%, 47%)" 
                fontSize={12}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 13%, 8%)",
                  border: "1px solid hsl(220, 13%, 18%)",
                  borderRadius: "8px",
                  color: "hsl(210, 20%, 98%)",
                }}
                formatter={(value: number, name: string, props: { payload: { level: string; percentage: number } }) => [
                  `${value} patients (${props.payload.percentage}%)`,
                  props.payload.level,
                ]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {severityDistribution.map((entry, index) => (
                  <Cell key={`cell-${entry.level}`} fill={severityColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
