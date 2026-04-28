"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// FIX IS HERE: Added { token }: { token: string }
export function PatientFilters({ token }: { token: string }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    skin_type: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (!token) {
        setError("Please log in to create a patient")
        return
      }

      const response = await fetch("http://localhost:8000/api/patients/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender || null,
          skin_type: formData.skin_type || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || "Failed to create patient")
      }

      const patient = await response.json()
      
      // Close dialog and reset form
      setIsDialogOpen(false)
      setFormData({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        skin_type: "",
      })
      
      // Refresh the page to show the new patient
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create patient")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      first_name: "",
      last_name: "",
      date_of_birth: "",
      gender: "",
      skin_type: "",
    })
    setError("")
    setIsDialogOpen(false)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-secondary border-border"
        />
      </div>
      <div className="flex gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px] bg-secondary border-border">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="clear">Clear</SelectItem>
            <SelectItem value="mild">Mild</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="moderately-severe">Moderately Severe</SelectItem>
            <SelectItem value="severe">Severe</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Enter patient information to create a new record.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Jane" 
                    className="bg-secondary border-border" 
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Doe" 
                    className="bg-secondary border-border" 
                    value={formData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input 
                    id="dateOfBirth" 
                    type="date" 
                    className="bg-secondary border-border" 
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => handleInputChange("gender", value)}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skinType">Skin Type (Fitzpatrick)</Label>
                <Select 
                  value={formData.skin_type} 
                  onValueChange={(value) => handleInputChange("skin_type", value)}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select skin type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="type-1">Type I - Very fair</SelectItem>
                    <SelectItem value="type-2">Type II - Fair</SelectItem>
                    <SelectItem value="type-3">Type III - Medium</SelectItem>
                    <SelectItem value="type-4">Type IV - Olive</SelectItem>
                    <SelectItem value="type-5">Type V - Brown</SelectItem>
                    <SelectItem value="type-6">Type VI - Dark brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Patient"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}