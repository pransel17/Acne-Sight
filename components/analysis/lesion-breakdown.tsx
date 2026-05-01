"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = [
  "hsl(199, 89%, 48%)", // Comedone/Blue
  "hsl(142, 76%, 36%)", // Papule/Green
  "hsl(48, 96%, 53%)",  // Pustule/Yellow
  "hsl(25, 95%, 53%)",  // Nodule/Orange
  "hsl(0, 72%, 51%)",   // Cyst/Red
  "hsl(215, 16%, 47%)", // Others/Gray
]

export function LesionBreakdown({ detections = [] }: { detections?: any[] }) {
  
  const types = ["comedone", "papule", "pustule", "nodule", "cyst"];
  
  const dynamicCounts = types.map(type => ({
    type: type.charAt(0).toUpperCase() + type.slice(1) + "s",
    count: detections.filter(d => d.class.toLowerCase() === type).length
  })).filter(item => item.count > 0); 

  const totalLesions = detections.length;
  
  const inflammatoryCount = detections.filter((d) => 
    ["papule", "pustule", "nodule", "cyst"].includes(d.class.toLowerCase())
  ).length;

  const nonInflammatoryCount = detections.filter((d) => 
    d.class.toLowerCase() === "comedone"
  ).length;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Lesion Breakdown</CardTitle>
        <CardDescription>Distribution by type</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalLesions > 0 ? (
          <>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dynamicCounts}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="type"
                  >
                    {dynamicCounts.map((entry, index) => (
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

            <div className="grid grid-cols-2 gap-2">
              {dynamicCounts.map((item, index) => (
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
          </>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            No lesions to display
          </div>
        )}

        <div className="pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Lesions</span>
            <span className="font-mono font-bold text-foreground">{totalLesions}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Inflammatory</span>
            <span className="font-mono text-foreground">
              {inflammatoryCount} ({totalLesions > 0 ? Math.round((inflammatoryCount / totalLesions) * 100) : 0}%)
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Non-Inflammatory</span>
            <span className="font-mono text-foreground">
              {nonInflammatoryCount} ({totalLesions > 0 ? Math.round((nonInflammatoryCount / totalLesions) * 100) : 0}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}