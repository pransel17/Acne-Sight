"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { weeklyScanData } from "@/lib/mock-data"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function WeeklyScansChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Weekly Scans</CardTitle>
        <CardDescription>Number of patient scans this week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyScanData}>
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 13%, 8%)",
                  border: "1px solid hsl(220, 13%, 18%)",
                  borderRadius: "8px",
                  color: "hsl(210, 20%, 98%)",
                }}
                formatter={(value: number) => [`${value} scans`, "Total"]}
              />
              <Area
                type="monotone"
                dataKey="scans"
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
