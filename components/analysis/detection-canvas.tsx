"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { sampleDetections } from "@/lib/mock-data"
import { Camera, Upload, RotateCcw, Zap, Eye, EyeOff, Settings, Video, VideoOff } from "lucide-react"

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
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState("")
  const [videoReady, setVideoReady] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // CLEANUP AND STOP LOGIC
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
    setVideoReady(false)
  }, [])

  // START CAMERA LOGIC
  const startCamera = useCallback(async () => {
    setCameraError("")
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "user", // Change to "environment" for back camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      setIsCameraActive(true) // Trigger the UI switch
    } catch (err) {
      console.error("Camera error:", err)
      setCameraError("Could not access camera. Please check permissions.")
    }
  }, [])

  // EFFECT TO SYNC STREAM TO VIDEO TAG
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(e => console.error("Error playing video:", e))
    }
  }, [isCameraActive])

  // CAPTURE LOGIC
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // If you mirrored the video in UI, mirror the draw as well
    context.translate(canvas.width, 0)
    context.scale(-1, 1)
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    stopCamera()
    setImageLoaded(true)
  }, [stopCamera])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageLoaded(true)
    }
  }

  const filteredDetections = sampleDetections.filter(
    (d) => d.confidence * 100 >= confidenceThreshold[0]
  )

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Detection View</CardTitle>
        {hasResults && (
          <Button variant="ghost" size="sm" onClick={() => setShowDetections(!showDetections)}>
            {showDetections ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showDetections ? "Hide" : "Show"} Detections
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative aspect-[4/3] bg-secondary rounded-lg overflow-hidden border border-border">
          
          {/* 1. CAMERA LIVE FEED MODE */}
          {isCameraActive ? (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onCanPlay={() => setVideoReady(true)}
                // scale-x-[-1] makes it feel like a mirror
                className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
              />
              
          
              {videoReady && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <svg viewBox="0 0 280 340" className="w-[70%] h-[85%] opacity-40 text-primary">
                    <ellipse
                      cx="140"
                      cy="150"
                      rx="120"
                      ry="150"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="8 4" // Makes it look like a clinical guide
                    />
                    {/* Optional: Add "Align Face Here" text */}
                    <text x="140" y="320" textAnchor="middle" fill="currentColor" className="text-[9px] font-bold uppercase tracking-widest">
                      Align Area of Interest
                    </text>
                  </svg>
                </div>
              )}

              {/* Overlay Controls */}
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-3 z-20">
                <Button size="lg" onClick={captureImage} className="rounded-full h-10 px-4 shadow-xl">
                  <Camera className="h-4 w-6 mr-2" />
                  Capture Photo
                </Button>
                <Button size="lg" variant="secondary" onClick={stopCamera} className="rounded-full h-10 w-10 p-0 shadow-xl">
                  <VideoOff className="h-6 w-6" />
                </Button>
              </div>

              <div className="absolute top-4 left-4 z-20">
                <Badge className="bg-red-500/80 hover:bg-red-500/80 animate-pulse border-none">
                  LIVE FEED
                </Badge>
              </div>
            </div>
          ) : !imageLoaded ? (
            /* 2. INITIAL UPLOAD / START CAMERA UI */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="text-center px-4">
                <p className="text-foreground font-medium">No image loaded</p>
                <p className="text-sm text-muted-foreground">
                  Provide a clear photo of the affected area
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button variant="outline" onClick={startCamera}>
                  <Video className="h-4 w-4 mr-2" />
                  Open Camera
                </Button>
              </div>
              {cameraError && <p className="text-xs text-destructive">{cameraError}</p>}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            /* 3. STATIC IMAGE + ANALYSIS VIEW */
            <>
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <svg viewBox="0 0 280 340" className="w-[70%] h-[85%]">
                   <ellipse cx="140" cy="170" rx="100" ry="130" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>

              {hasResults && showDetections && (
                <div className="absolute inset-0">
                  {filteredDetections.map((detection) => (
                    <div
                      key={detection.id}
                      className="absolute border-2 rounded-sm"
                      style={{
                        left: `${(detection.x / 280) * 100}%`,
                        top: `${(detection.y / 340) * 100}%`,
                        width: `${(detection.width / 280) * 100}%`,
                        height: `${(detection.height / 340) * 100}%`,
                        borderColor: lesionColors[detection.type],
                        backgroundColor: `${lesionColors[detection.type]}20`,
                      }}
                    >
                      <span className="absolute -top-5 left-0 text-[10px] font-mono px-1 rounded" style={{ backgroundColor: lesionColors[detection.type], color: "#000" }}>
                        {detection.type.charAt(0)} {Math.round(detection.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-4 z-30">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="font-medium">ACNE-SIGHT YOLOv8 Analyzing...</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Controls */}
        {imageLoaded && (
          <div className="flex flex-col gap-4">
             <div className="flex gap-2">
                {!hasResults ? (
                  <Button className="flex-1" onClick={onAnalyze} disabled={isAnalyzing}>
                    <Zap className="h-4 w-4 mr-2" />
                    {isAnalyzing ? "Processing..." : "Run Analysis"}
                  </Button>
                ) : (
                  <Button className="flex-1" variant="outline" onClick={onReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setImageLoaded(false)}>Change Image</Button>
             </div>
             
             {hasResults && (
                <div className="p-3 bg-secondary/50 rounded-md border border-border">
                   <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Confidence Filter</span>
                      <span className="text-primary font-mono">{confidenceThreshold[0]}%</span>
                   </div>
                   <Slider value={confidenceThreshold} onValueChange={setConfidenceThreshold} min={50} max={100} step={5} />
                </div>
             )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}