"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface AdminUser {
  id: string
  email: string
  isAuthenticated: boolean
  isAdmin: boolean
}

interface AdminAuthState {
  user: AdminUser | null
  loading: boolean
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    loading: true,
  })

  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        await checkAuthStatus()
      } catch (error) {
        console.error("[v0] Error initializing auth:", error)
        if (mounted) {
          setState({ user: null, loading: false })
        }
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state changed:", event, session?.user?.email)
      if (mounted) {
        await checkAuthStatus()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const checkAuthStatus = async () => {
    try {
      console.log("[v0] Checking admin auth status...")

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.log("[v0] No authenticated user found")
        setState({
          user: null,
          loading: false,
        })
        return
      }

      console.log("[v0] User found:", user.email)

      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("id", user.id)
        .single()

      if (adminError || !adminData) {
        console.log("[v0] User not found in admins table:", adminError?.message)
        setState({
          user: {
            id: user.id,
            email: user.email!,
            isAuthenticated: true,
            isAdmin: false,
          },
          loading: false,
        })
        return
      }

      console.log("[v0] Admin verified:", user.email)
      setState({
        user: {
          id: user.id,
          email: user.email!,
          isAuthenticated: true,
          isAdmin: true,
        },
        loading: false,
      })
    } catch (error) {
      console.error("[v0] Error checking admin auth:", error)
      setState({
        user: null,
        loading: false,
      })
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log("[v0] Admin login attempt for:", email)

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.log("[v0] Supabase auth error:", authError.message)
        return { success: false, error: authError.message }
      }

      if (data.user) {
        console.log("[v0] User authenticated, checking admin status")

        const { data: adminData, error: adminError } = await supabase
          .from("admins")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (adminError || !adminData) {
          console.log("[v0] User not found in admins table:", adminError?.message)

          await supabase.auth.signOut()
          return { success: false, error: "Unauthorized - Admin access required" }
        }

        console.log("[v0] Admin login successful")

        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Force refresh the auth state
        await checkAuthStatus()
        return { success: true }
      }

      return { success: false, error: "Login failed" }
    } catch (error) {
      console.error("[v0] Login error:", error)
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const logout = async () => {
    try {
      console.log("[v0] Admin logout")

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("[v0] Logout error:", error)
      }
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }

    setState({
      user: null,
      loading: false,
    })
  }

  return {
    ...state,
    login,
    logout,
    checkAuthStatus,
    isAuthenticated: !!state.user?.isAuthenticated,
    isAdmin: !!state.user?.isAdmin,
  }
}

export async function verifyAdminServer(userId: string) {
  const { createServerClient } = await import("@supabase/ssr")
  const { cookies } = await import("next/headers")

  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const { data: adminData, error } = await supabase.from("admins").select("*").eq("id", userId).single()

  return { isAdmin: !error && !!adminData, adminData, error }
}
