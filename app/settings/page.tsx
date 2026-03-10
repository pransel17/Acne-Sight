import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Camera, Bell, Shield, Database } from "lucide-react"

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Settings" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Configure system preferences and detection parameters
          </p>
        </div>

        <Tabs defaultValue="detection" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="detection" className="data-[state=active]:bg-background">
              <Activity className="h-4 w-4 mr-2" />
              Detection
            </TabsTrigger>
            <TabsTrigger value="camera" className="data-[state=active]:bg-background">
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-background">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-background">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detection" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">YOLOv8 Detection Settings</CardTitle>
                <CardDescription>Configure the AI detection algorithm parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Model Variant</Label>
                    <Select defaultValue="yolov8m">
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yolov8n">YOLOv8n (Nano) - Fastest</SelectItem>
                        <SelectItem value="yolov8s">YOLOv8s (Small) - Fast</SelectItem>
                        <SelectItem value="yolov8m">YOLOv8m (Medium) - Balanced</SelectItem>
                        <SelectItem value="yolov8l">YOLOv8l (Large) - Accurate</SelectItem>
                        <SelectItem value="yolov8x">YOLOv8x (Extra Large) - Most Accurate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Default Confidence Threshold</Label>
                      <span className="text-sm font-mono text-primary">75%</span>
                    </div>
                    <Slider defaultValue={[75]} min={50} max={100} step={5} />
                    <p className="text-xs text-muted-foreground">
                      Detections below this threshold will be filtered out
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>NMS IoU Threshold</Label>
                      <span className="text-sm font-mono text-primary">0.45</span>
                    </div>
                    <Slider defaultValue={[45]} min={20} max={80} step={5} />
                    <p className="text-xs text-muted-foreground">
                      Non-Maximum Suppression threshold for overlapping detections
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div>
                      <Label>Enable Segmentation</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use instance segmentation for precise lesion boundaries
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div>
                      <Label>Auto-Analysis on Capture</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatically run detection after image capture
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Severity Scoring</CardTitle>
                <CardDescription>Configure severity calculation parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Scoring System</Label>
                  <Select defaultValue="gass">
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gass">Global Acne Severity Score (GASS)</SelectItem>
                      <SelectItem value="leeds">Leeds Revised Acne Grading</SelectItem>
                      <SelectItem value="iga">Investigator Global Assessment (IGA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <Label>Include PIH in Score</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Factor post-inflammatory hyperpigmentation into severity
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="camera" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Camera Settings</CardTitle>
                <CardDescription>Configure capture device and image quality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Input Resolution</Label>
                  <Select defaultValue="640">
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="480">480x480</SelectItem>
                      <SelectItem value="640">640x640 (Recommended)</SelectItem>
                      <SelectItem value="1280">1280x1280</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Lighting Mode</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="visible">Visible Light Only</SelectItem>
                      <SelectItem value="uv">UV + Visible</SelectItem>
                      <SelectItem value="polarized">Polarized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <Label>Quality Check</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Verify image quality before analysis
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Notification Preferences</CardTitle>
                <CardDescription>Configure alerts and reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <Label>Appointment Reminders</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get notified about upcoming appointments
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <Label>Analysis Complete</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Notification when batch analysis finishes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <Label>Severe Cases Alert</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Alert for patients with severe severity scores
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Security & Privacy</CardTitle>
                <CardDescription>Data protection and compliance settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <Label>HIPAA Audit Logging</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Log all access to patient data
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <Label>Auto De-identification</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Automatically remove PHI from exported data
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto logout after inactivity
                    </p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Reset to Defaults</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
