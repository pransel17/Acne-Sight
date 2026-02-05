"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { sampleDetections } from "@/lib/mock-data"
import { Camera, Upload, RotateCcw, Zap, Eye, EyeOff, Settings } from "lucide-react"

interface DetectionCanvasProps {
  isAnalyzing: boolean
  hasResults: boolean
  onAnalyze: () => void
  onReset: () => void
}

const lesionColors: Record<string, string> = {
  Comedone: "#0ea5e9",
  Papule: "#22c55e",
  Pustule: "#eab308",
  Nodule: "#f97316",
  Cyst: "#ef4444",
  PIH: "#8b5cf6",
}

export function DetectionCanvas({ isAnalyzing, hasResults, onAnalyze, onReset }: DetectionCanvasProps) {
  const [showDetections, setShowDetections] = useState(true)
  const [confidenceThreshold, setConfidenceThreshold] = useState([75])
  const [imageLoaded, setImageLoaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = () => {
    // Simulate image upload
    setImageLoaded(true)
  }

  const filteredDetections = sampleDetections.filter(
    (d) => d.confidence * 100 >= confidenceThreshold[0]
  )

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Detection View</CardTitle>
        <div className="flex items-center gap-2">
          {hasResults && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetections(!showDetections)}
            >
              {showDetections ? (
                <EyeOff className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {showDetections ? "Hide" : "Show"} Detections
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Canvas Area */}
        <div className="relative aspect-[4/3] bg-secondary rounded-lg overflow-hidden border border-border">
          {!imageLoaded ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-foreground font-medium">No image loaded</p>
                <p className="text-sm text-muted-foreground">
                  Upload an image or capture from camera
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleImageUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <Button variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          ) : (
            <>
              {/* Simulated face outline */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 280 340" className="w-[70%] h-[85%] opacity-30">
                  <ellipse
                    cx="140"
                    cy="170"
                    rx="100"
                    ry="130"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted-foreground"
                  />
                  {/* Facial features placeholder */}
                  <ellipse cx="100" cy="130" rx="15" ry="10" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
                  <ellipse cx="180" cy="130" rx="15" ry="10" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
                  <ellipse cx="140" cy="175" rx="12" ry="18" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
                  <path d="M 110 220 Q 140 250 170 220" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
                </svg>
              </div>

              {/* Detection overlays */}
              {hasResults && showDetections && (
                <div className="absolute inset-0">
                  {filteredDetections.map((detection) => (
                    <div
                      key={detection.id}
                      className="absolute border-2 rounded-sm transition-all duration-200 hover:scale-105"
                      style={{
                        left: `${(detection.x / 280) * 100}%`,
                        top: `${(detection.y / 340) * 100}%`,
                        width: `${(detection.width / 280) * 100}%`,
                        height: `${(detection.height / 340) * 100}%`,
                        borderColor: lesionColors[detection.type],
                        backgroundColor: `${lesionColors[detection.type]}20`,
                      }}
                    >
                      <span
                        className="absolute -top-5 left-0 text-[10px] font-mono px-1 rounded"
                        style={{
                          backgroundColor: lesionColors[detection.type],
                          color: "#0a0b0d",
                        }}
                      >
                        {detection.type.charAt(0)} {Math.round(detection.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Analyzing overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/30 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-foreground font-medium">Analyzing with YOLOv8...</p>
                  <p className="text-sm text-muted-foreground">Detecting and classifying lesions</p>
                </div>
              )}

              {/* Quality indicators */}
              {!isAnalyzing && (
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Quality: 94%
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Lighting: Optimal
                  </Badge>
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls */}
        {imageLoaded && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {!hasResults ? (
                <Button className="flex-1" onClick={onAnalyze} disabled={isAnalyzing}>
                  <Zap className="h-4 w-4 mr-2" />
                  {isAnalyzing ? "Analyzing..." : "Run Analysis"}
                </Button>
              ) : (
                <Button className="flex-1 bg-transparent" variant="outline" onClick={onReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Analysis
                </Button>
              )}
              <Button variant="outline" onClick={() => setImageLoaded(false)}>
                <Upload className="h-4 w-4 mr-2" />
                Change Image
              </Button>
            </div>

            {hasResults && (
              <div className="p-4 bg-secondary rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Confidence Threshold</span>
                  </div>
                  <span className="text-sm font-mono text-primary">{confidenceThreshold[0]}%</span>
                </div>
                <Slider
                  value={confidenceThreshold}
                  onValueChange={setConfidenceThreshold}
                  min={50}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Showing {filteredDetections.length} of {sampleDetections.length} detections
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
