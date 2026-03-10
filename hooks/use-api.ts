import { useCallback } from "react"
import { useRouter } from "next/navigation"

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

/**
 * Hook for making API calls with automatic error handling and authentication
 */
export function useApi() {
  const router = useRouter()

  const call = useCallback(
    async <T = unknown>(
      endpoint: string,
      options: ApiOptions = {}
    ): Promise<ApiResponse<T>> => {
      try {
        let url = endpoint
        const { params, ...fetchOptions } = options

        // Add query parameters
        if (params) {
          const queryString = new URLSearchParams(
            Object.entries(params).reduce(
              (acc, [key, value]) => {
                acc[key] = String(value)
                return acc
              },
              {} as Record<string, string>
            )
          ).toString()
          url = `${endpoint}?${queryString}`
        }

        const response = await fetch(url, {
          ...fetchOptions,
          headers: {
            "Content-Type": "application/json",
            ...fetchOptions.headers,
          },
        })

        const data = await response.json()

        // Handle unauthorized - redirect to login
        if (response.status === 401) {
          router.push("/auth/login")
          router.refresh()
          return { error: "Unauthorized", status: 401 }
        }

        if (!response.ok) {
          return {
            error: data.error || "An error occurred",
            status: response.status,
          }
        }

        return { data: data as T, status: response.status }
      } catch (error) {
        console.error("[v0] API call error:", error)
        return {
          error: "Network error",
          status: 0,
        }
      }
    },
    [router]
  )

  const get = useCallback(
    <T = unknown>(endpoint: string, options?: ApiOptions) =>
      call<T>(endpoint, { ...options, method: "GET" }),
    [call]
  )

  const post = useCallback(
    <T = unknown>(endpoint: string, body?: unknown, options?: ApiOptions) =>
      call<T>(endpoint, {
        ...options,
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      }),
    [call]
  )

  const put = useCallback(
    <T = unknown>(endpoint: string, body?: unknown, options?: ApiOptions) =>
      call<T>(endpoint, {
        ...options,
        method: "PUT",
        body: body ? JSON.stringify(body) : undefined,
      }),
    [call]
  )

  const patch = useCallback(
    <T = unknown>(endpoint: string, body?: unknown, options?: ApiOptions) =>
      call<T>(endpoint, {
        ...options,
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined,
      }),
    [call]
  )

  const del = useCallback(
    <T = unknown>(endpoint: string, options?: ApiOptions) =>
      call<T>(endpoint, { ...options, method: "DELETE" }),
    [call]
  )

  return { call, get, post, put, patch, delete: del }
}
