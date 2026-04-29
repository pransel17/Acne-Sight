"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Upload, RotateCcw, Zap, Eye, EyeOff, Wifi, Image as ImageIcon, Camera } from "lucide-react"

interface Detection {
  id: string;
  type: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DetectionCanvasProps {
  isAnalyzing: boolean;
  hasResults: boolean;
  onAnalyze: () => void;
  onReset: () => void;
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
  
  // IoT States
  const [isWaitingForPi, setIsWaitingForPi] = useState(false)
  const [piScanImageUrl, setPiScanImageUrl] = useState<string | null>(null)
  const [piDetections, setPiDetections] = useState<Detection[]>([])

  // ==========================================
  // REPLACE THIS WITH YOUR RASPBERRY PI'S IP!
  // ==========================================
  const RASPBERRY_PI_IP = "10.166.133.75";
  
  const startListeningToPi = () => {
    setIsWaitingForPi(true)
  }

  const triggerCapture = async () => {
    try {
      // 1. Tell the Pi to snap the photo and send it to the backend
      const response = await fetch(`http://${RASPBERRY_PI_IP}:5000/capture`, { 
        method: 'POST' 
      });
      
      if (response.ok) {
        console.log("📸 Pi successfully captured and sent the image!");
        
        // 2. Stop the live feed UI
        setIsWaitingForPi(false); 
        setImageLoaded(true);
        
        // 3. For testing, we load the mock image so you see something instantly.
        // Once your DB is hooked up, your parent component will feed the real image here.
        setPiScanImageUrl("/mock-patient-scan.jpg");
        
        // 4. Trigger the parent to sync AI results
        onAnalyze(); 
      } else {
        console.error("Pi capture failed:", await response.text());
      }
    } catch (error) {
      console.error("Failed to reach the Raspberry Pi. Is the Python script running?", error);
    }
  }

  const cancelListening = () => {
    setIsWaitingForPi(false)
  }

  const handleReset = () => {
    setImageLoaded(false)
    setPiScanImageUrl(null)
    setPiDetections([])
    onReset()
  }

  const filteredDetections = piDetections.filter(
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
          
          {/* 1. LIVE RASPBERRY PI VIEWFINDER */}
          {isWaitingForPi ? (
            <div className="absolute inset-0 bg-black flex flex-col">
              <img 
                src={`http://${RASPBERRY_PI_IP}:5000/video_feed`}
                alt="Live Pi Feed" 
                className="w-full h-full object-cover"
              />
              
              <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4 z-20">
                <Button size="lg" onClick={triggerCapture} className="rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white">
                  <Camera className="h-5 w-5 mr-2" />
                  Capture & Analyze
                </Button>
                <Button variant="destructive" onClick={cancelListening} className="rounded-full shadow-xl">
                  Cancel
                </Button>
              </div>
              
              <div className="absolute top-4 left-4 z-20">
                <Badge className="bg-red-500 hover:bg-red-600 animate-pulse border-none text-white">
                  <Wifi className="h-3 w-3 mr-1 inline" /> LIVE Pi FEED
                </Badge>
              </div>
            </div>
          ) : !imageLoaded ? (
            
            /* 2. INITIAL CONNECT UI */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <ImageIcon className="h-12 w-12 text-primary" />
              </div>
              <div className="text-center px-4">
                <p className="text-foreground font-medium">No scan loaded</p>
                <p className="text-sm text-muted-foreground">
                  Connect to the Raspberry Pi hardware to begin.
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="default" onClick={startListeningToPi} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                  <Wifi className="h-4 w-4 mr-2" />
                  Connect to Pi Scanner
                </Button>
              </div>
            </div>
          ) : (
            
            /* 3. STATIC IMAGE + PI YOLOv8 RESULTS VIEW */
            <>
              {piScanImageUrl && (
                <img 
                  src={piScanImageUrl} 
                  alt="Clinical Scan from Pi" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

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
                        borderColor: lesionColors[detection.type] || "#fff",
                        backgroundColor: `${lesionColors[detection.type] || "#fff"}20`,
                      }}
                    >
                      <span className="absolute -top-5 left-0 text-[10px] font-mono px-1 rounded shadow-sm" style={{ backgroundColor: lesionColors[detection.type] || "#fff", color: "#000" }}>
                        {detection.type.charAt(0)} {Math.round(detection.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-4 z-30 backdrop-blur-sm">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="font-medium font-mono text-primary uppercase tracking-wider">Syncing AI Results...</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Controls */}
        {imageLoaded && (
          <div className="flex flex-col gap-4">
             <div className="flex gap-2">
                <Button className="flex-1" variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear & Scan New Patient
                </Button>
             </div>
             
             {hasResults && (
                <div className="p-3 bg-secondary/50 rounded-md border border-border">
                   <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted-foreground font-medium">Confidence Filter</span>
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