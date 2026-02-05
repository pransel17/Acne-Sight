"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

const checks = [
  {
    id: "c1",
    label: "Drug allergies",
    status: "clear",
    detail: "No known allergies",
  },
  {
    id: "c2",
    label: "Pregnancy status",
    status: "clear",
    detail: "Not applicable / Negative",
  },
  {
    id: "c3",
    label: "Liver function",
    status: "clear",
    detail: "Within normal range",
  },
  {
    id: "c4",
    label: "Drug interactions",
    status: "clear",
    detail: "No conflicts detected",
  },
  {
    id: "c5",
    label: "Age restrictions",
    status: "clear",
    detail: "Patient meets age criteria",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "clear":
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-400" />
    case "blocked":
      return <XCircle className="h-4 w-4 text-red-400" />
    default:
      return null
  }
}

export function ContraindicationCheck() {
  const allClear = checks.every((c) => c.status === "clear")

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Contraindication Check</CardTitle>
        <CardDescription>Automated safety screening</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div
          className={`p-3 rounded-lg flex items-center gap-3 ${
            allClear
              ? "bg-emerald-500/10 border border-emerald-500/30"
              : "bg-yellow-500/10 border border-yellow-500/30"
          }`}
        >
          {allClear ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          )}
          <div>
            <p className={`font-medium ${allClear ? "text-emerald-400" : "text-yellow-400"}`}>
              {allClear ? "All Clear" : "Review Required"}
            </p>
            <p className="text-xs text-muted-foreground">
              {allClear ? "No contraindications detected" : "Some items need attention"}
            </p>
          </div>
        </div>

        {/* Individual Checks */}
        <div className="space-y-2">
          {checks.map((check) => (
            <div
              key={check.id}
              className="flex items-center justify-between p-2 rounded bg-secondary/50"
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(check.status)}
                <span className="text-sm text-foreground">{check.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">{check.detail}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
