"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, BookOpen } from "lucide-react"

const guidelines = [
  {
    id: "g1",
    title: "AAD Guidelines 2024",
    source: "American Academy of Dermatology",
    relevance: "Primary",
    url: "#",
  },
  {
    id: "g2",
    title: "Cochrane Review: Acne",
    source: "Cochrane Library",
    relevance: "Supporting",
    url: "#",
  },
  {
    id: "g3",
    title: "Global Alliance Guidelines",
    source: "Global Alliance to Improve Outcomes in Acne",
    relevance: "Supporting",
    url: "#",
  },
]

export function TreatmentGuidelines() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Evidence Sources
        </CardTitle>
        <CardDescription>Clinical guidelines and references</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {guidelines.map((guideline) => (
          <a
            key={guideline.id}
            href={guideline.url}
            className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {guideline.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{guideline.source}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
            <Badge
              variant="outline"
              className={`mt-2 text-xs ${
                guideline.relevance === "Primary"
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {guideline.relevance}
            </Badge>
          </a>
        ))}

        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Recommendations are generated based on current clinical guidelines and may be customized
            based on individual patient factors.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
