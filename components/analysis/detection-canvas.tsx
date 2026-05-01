"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Upload, RotateCcw, Zap, Eye, EyeOff, Wifi, Image as ImageIcon, Camera } from "lucide-react"

interface Detection {
  id?: string;      
  class: string;   
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DetectionCanvasProps {
  isAnalyzing: boolean;
  hasResults: boolean;
  selectedPatientId: string;
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

export function DetectionCanvas({ isAnalyzing, hasResults, onAnalyze, onReset, selectedPatientId }: DetectionCanvasProps) {
  const [showDetections, setShowDetections] = useState(true)
  const [confidenceThreshold, setConfidenceThreshold] = useState([50])
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const [imgSize, setImgSize] = useState({ width: 640, height: 640 })
  
  const [isWaitingForPi, setIsWaitingForPi] = useState(false)
  const [piScanImageUrl, setPiScanImageUrl] = useState<string | null>(null)
  const [piDetections, setPiDetections] = useState<Detection[]>([])

  const RASPBERRY_PI_IP = "192.168.1.62";
  
  const startListeningToPi = () => setIsWaitingForPi(true)
  const cancelListening = () => setIsWaitingForPi(false)

  const triggerCapture = async () => {
    if (!selectedPatientId) {
      alert("Please select a patient first!");
      return;
    }

    setIsWaitingForPi(false); 
    onAnalyze(); 

    try {
      const response = await fetch(`http://${RASPBERRY_PI_IP}:5000/capture`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: selectedPatientId })
      });

      const data = await response.json();

      if (data.status === "success") {
        setPiScanImageUrl(`${data.image_url}?t=${Date.now()}`);
        setPiDetections(data.predictions);
        setImageLoaded(true);
      } 
    } catch (error) {
      console.error("Failed to reach the Raspberry Pi.", error);
    }
  };

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
          
          {isWaitingForPi ? (
            <div className="absolute inset-0 bg-black flex flex-col">
              <img 
                src={`http://${RASPBERRY_PI_IP}:5000/video_feed`}
                alt="Live Pi Feed" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-4 z-20">
                <Button size="sm" onClick={triggerCapture} className="rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white">
                  <Camera className="h-5 w-5 mr-2" />
                  Capture & Analyze
                </Button>
                <Button size="sm" variant="destructive" onClick={cancelListening} className="rounded-full shadow-xl">
                  Cancel
                </Button>
              </div>
            </div>
          ) : !imageLoaded ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <ImageIcon className="h-12 w-12 text-primary" />
              </div>
              <Button variant="default" onClick={startListeningToPi} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                <Wifi className="h-4 w-4 mr-2" />
                Connect to Pi Scanner
              </Button>
            </div>
          ) : (
            <>

              <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
                <div className="relative flex max-w-full max-h-full">
                  
                  {piScanImageUrl && (
                    <img 
                      src={piScanImageUrl} 
                      alt="Clinical Scan from Pi" 
                      className="max-w-full max-h-full object-contain block"

                      onLoad={(e) => {
                        setImgSize({
                          width: e.currentTarget.naturalWidth || 640,
                          height: e.currentTarget.naturalHeight || 640
                        });
                      }}
                    />
                  )}

                  {hasResults && showDetections && (
                    <div className="absolute inset-0 pointer-events-none">
                      {filteredDetections.map((detection) => {
                        
                        const boxLeftPercent = ((detection.x - (detection.width / 2)) / imgSize.width) * 100;
                        const boxTopPercent = ((detection.y - (detection.height / 2)) / imgSize.height) * 100;
                        const boxWidthPercent = (detection.width / imgSize.width) * 100;
                        const boxHeightPercent = (detection.height / imgSize.height) * 100;

                        return (
                          <div
                            key={detection.id || Math.random().toString()}
                            className="absolute border-2 rounded-sm transition-all duration-200"
                            style={{
                              left: `${boxLeftPercent}%`,
                              top: `${boxTopPercent}%`,
                              width: `${boxWidthPercent}%`,
                              height: `${boxHeightPercent}%`,
                              borderColor: lesionColors[detection.class] || "#ef4444",
                              backgroundColor: `${lesionColors[detection.class] || "#ef4444"}30`, // Medyo mas kita ang kulay
                            }}
                          >
                            <span 
                              className="absolute -top-6 left-0 text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap" 
                              style={{ backgroundColor: lesionColors[detection.class] || "#ef4444", color: "#fff" }}
                            >
                              {detection.class} {Math.round(detection.confidence * 100)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              </div>

              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-4 z-30 backdrop-blur-sm">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="font-medium font-mono text-primary uppercase tracking-wider">Syncing AI Results...</p>
                </div>
              )}
            </>
          )}
        </div>

        {imageLoaded && (
          <div className="flex flex-col gap-4">
             <Button className="w-full" variant="outline" onClick={handleReset}>
               <RotateCcw className="h-4 w-4 mr-2" />
               Clear & Scan New Patient
             </Button>
             
             {hasResults && (
                <div className="p-3 bg-secondary/50 rounded-md border border-border">
                   <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted-foreground font-medium">Confidence Filter</span>
                      <span className="text-primary font-mono">{confidenceThreshold[0]}%</span>
                   </div>
                   <Slider value={confidenceThreshold} onValueChange={setConfidenceThreshold} min={10} max={100} step={5} />
                </div>
             )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}