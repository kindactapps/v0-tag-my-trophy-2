"use client"

import { useState, useEffect } from "react"

interface AdminAuthState {
  isAuthenticated: boolean
  loading: boolean
}

export function useNewAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    isAuthenticated: false,
    loading: true,
  })

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient) {
      checkAuthStatus()
    }
  }, [isClient])

  const checkAuthStatus = async () => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        setState({ isAuthenticated: false, loading: false })
        return
      }

      const token = localStorage.getItem("admin_token")
      console.log("[v0] Checking auth status, token exists:", !!token)

      if (!token) {
        setState({ isAuthenticated: false, loading: false })
        return
      }

      // Verify token with server
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const result = await response.json()
      console.log("[v0] Token verification result:", result)

      if (result.valid) {
        setState({ isAuthenticated: true, loading: false })
      } else {
        // Token is invalid, remove it
        localStorage.removeItem("admin_token")
        setState({ isAuthenticated: false, loading: false })
      }
    } catch (error) {
      console.error("[v0] Auth check error:", error)
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem("admin_token")
      }
      setState({ isAuthenticated: false, loading: false })
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log("[v0] Attempting admin login for:", email)

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (result.success && result.token) {
        console.log("[v0] Login successful, storing token")
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem("admin_token", result.token)
        }
        setState({ isAuthenticated: true, loading: false })
        return { success: true }
      } else {
        console.log("[v0] Login failed:", result.error)
        return { success: false, error: result.error || "Login failed" }
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      return { success: false, error: "Login failed. Please try again." }
    }
  }

  const logout = async () => {
    try {
      let token = null
      if (typeof window !== "undefined" && window.localStorage) {
        token = localStorage.getItem("admin_token")
      }

      if (token) {
        // Call logout API to clear server session
        await fetch("/api/admin/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })
      }

      // Clear local storage
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem("admin_token")
      }
      setState({ isAuthenticated: false, loading: false })
      console.log("[v0] Admin logged out")
    } catch (error) {
      console.error("[v0] Logout error:", error)
      // Still clear local storage even if API call fails
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem("admin_token")
      }
      setState({ isAuthenticated: false, loading: false })
    }
  }

  return {
    ...state,
    login,
    logout,
    checkAuthStatus,
  }
}
