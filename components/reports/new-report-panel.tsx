"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText } from "lucide-react"
import { useRouter } from "next/navigation"

export function NewReportDialog({ patients }: { patients: any[] }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const patient_id = formData.get("patient_id")
    const report_type = formData.get("report_type")
    const title = formData.get("title")

    // Close the dialog
    setOpen(false)
    
    // Send the user to the Template Page with their choices in the URL
    router.push(`/reports/create?patient_id=${patient_id}&report_type=${report_type}&title=${title}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Setup New Report</DialogTitle>
            <DialogDescription>
              Select the patient and report type to open the clinical template.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Report Title</Label>
              <Input id="title" name="title" placeholder="e.g., Monthly Evaluation" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patient_id">Select Patient</Label>
              <Select name="patient_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.first_name} {p.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="report_type">Report Type</Label>
              <Select name="report_type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Initial Assessment">Initial Assessment</SelectItem>
                  <SelectItem value="Progress Report">Progress Report</SelectItem>
                  <SelectItem value="Treatment Summary">Treatment Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              Proceed to Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}