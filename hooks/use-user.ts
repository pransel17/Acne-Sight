"use client"

import { useEffect, useState } from "react"
import { useApi } from "./use-api"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "admin" | "dermatologist" | "nurse" | "receptionist"
  avatarUrl?: string
  phone?: string
  licenseNumber?: string
  specialization?: string
}

/**
 * Hook to fetch and cache the current user
 */
export function useUser() {
  const { get } = useApi()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchUser = async () => {
      try {
        const response = await get<{ user: User }>("/api/auth/me")

        if (isMounted) {
          if (response.error) {
            setError(response.error)
            setUser(null)
          } else if (response.data?.user) {
            setUser(response.data.user)
            setError(null)
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to fetch user")
          console.error("[v0] Fetch user error:", err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchUser()

    return () => {
      isMounted = false
    }
  }, [get])

  return { user, loading, error }
}
