"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { sampleLesionCounts } from "@/lib/mock-data"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = [
  "hsl(199, 89%, 48%)", // Primary blue
  "hsl(142, 76%, 36%)", // Green
  "hsl(48, 96%, 53%)",  // Yellow
  "hsl(25, 95%, 53%)",  // Orange
  "hsl(0, 72%, 51%)",   // Red
  "hsl(215, 16%, 47%)", // Gray
]

export function LesionBreakdown() {
  const totalLesions = sampleLesionCounts.reduce((sum, item) => sum + item.count, 0)
  const inflammatoryCount = sampleLesionCounts
    .filter((l) => ["Papules", "Pustules", "Nodules", "Cysts"].includes(l.type))
    .reduce((sum, item) => sum + item.count, 0)
  const nonInflammatoryCount = sampleLesionCounts
    .filter((l) => l.type === "Comedones")
    .reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Lesion Breakdown</CardTitle>
        <CardDescription>Distribution by type</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pie Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sampleLesionCounts}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
                nameKey="type"
              >
                {sampleLesionCounts.map((entry, index) => (
                  <Cell key={`cell-${entry.type}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 13%, 8%)",
                  border: "1px solid hsl(220, 13%, 18%)",
                  borderRadius: "8px",
                  color: "hsl(210, 20%, 98%)",
                }}
                formatter={(value: number, name: string) => [
                  `${value} (${Math.round((value / totalLesions) * 100)}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2">
          {sampleLesionCounts.map((item, index) => (
            <div key={item.type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-muted-foreground">{item.type}</span>
              <span className="text-xs font-mono text-foreground ml-auto">{item.count}</span>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Lesions</span>
            <span className="font-mono font-bold text-foreground">{totalLesions}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Inflammatory</span>
            <span className="font-mono text-foreground">
              {inflammatoryCount} ({Math.round((inflammatoryCount / totalLesions) * 100)}%)
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Non-Inflammatory</span>
            <span className="font-mono text-foreground">
              {nonInflammatoryCount} ({Math.round((nonInflammatoryCount / totalLesions) * 100)}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
