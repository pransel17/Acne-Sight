"use client"

import { useState } from "react"
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

export function PatientFilters() {
  const [searchQuery, setSearchQuery] = useState("")

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

        <Dialog>
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
            <form className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Jane" className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" className="bg-secondary border-border" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" placeholder="25" className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select>
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
                <Select>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select skin type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="type-1">Type I</SelectItem>
                    <SelectItem value="type-2">Type II</SelectItem>
                    <SelectItem value="type-3">Type III</SelectItem>
                    <SelectItem value="type-4">Type IV</SelectItem>
                    <SelectItem value="type-5">Type V</SelectItem>
                    <SelectItem value="type-6">Type VI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline">Cancel</Button>
                <Button type="submit">Create Patient</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
