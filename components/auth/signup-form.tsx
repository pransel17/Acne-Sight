"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "dermatologist",
    licenseNumber: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Please enter your name")
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          licenseNumber: formData.licenseNumber,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Signup failed")
        return
      }

      // Signup successful - redirect to dashboard
      router.push("/")
      router.refresh()
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("[v0] Signup error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border bg-card p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-foreground">
              First Name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-foreground">
              Last Name
            </Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Smith"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="dr.smith@hospital.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-foreground">
            Professional Role
          </Label>
          <Select value={formData.role} onValueChange={handleRoleChange} disabled={loading}>
            <SelectTrigger className="bg-secondary border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="dermatologist">Dermatologist</SelectItem>
              <SelectItem value="nurse">Nurse</SelectItem>
              <SelectItem value="receptionist">Receptionist</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseNumber" className="text-foreground">
            License Number (Optional)
          </Label>
          <Input
            id="licenseNumber"
            name="licenseNumber"
            placeholder="MD123456"
            value={formData.licenseNumber}
            onChange={handleChange}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-foreground">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Card>
  )
}
