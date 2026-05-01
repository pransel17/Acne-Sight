"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const lesionColors: Record<string, { bg: string; text: string; border: string }> = {
  Comedone: { bg: "bg-sky-500/20", text: "text-sky-400", border: "border-sky-500/30" },
  Papule: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  Pustule: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  Nodule: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  Cyst: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  PIH: { bg: "bg-violet-500/20", text: "text-violet-400", border: "border-violet-500/30" },
}

interface Detection {
  class: string;
  confidence: number;
  region?: string;
}

export function DetectionResults({ detections }: { detections: Detection[] }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Detection Results</CardTitle>
        <CardDescription>Individual lesions identified by YOLOv8</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Region</TableHead>
              <TableHead className="text-muted-foreground">Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>

            {detections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No lesions detected.
                </TableCell>
              </TableRow>
            ) : (
              detections.map((detection, index) => {

                const typeLabel = detection.class.charAt(0).toUpperCase() + detection.class.slice(1);
                
                return (
                  <TableRow key={index} className="border-border hover:bg-secondary/50">
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${lesionColors[typeLabel]?.bg} ${lesionColors[typeLabel]?.text} ${lesionColors[typeLabel]?.border}`}
                      >
                        {typeLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {detection.region || "Face"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${detection.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono text-foreground">
                          {Math.round(detection.confidence * 100)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}