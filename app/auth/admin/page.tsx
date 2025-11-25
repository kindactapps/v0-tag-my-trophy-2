"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useNewAdminAuth } from "@/lib/new-admin-auth"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const { isAuthenticated, login } = useNewAdminAuth()

  console.log("[v0] AdminLoginPage - isAuthenticated:", isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      console.log("[v0] Already authenticated, redirecting to dashboard")
      window.location.href = "/admin/dashboard"
    }
  }, [isAuthenticated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("[v0] Form submitted with email:", email)

    try {
      const result = await login(email, password)

      if (result.success) {
        console.log("[v0] Login successful, redirecting to dashboard")
        // Use window.location.href for full page navigation as specified
        window.location.href = "/admin/dashboard"
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c44c3a] mx-auto mb-4"></div>
          <p className="text-[#6b5b47]">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg border-0 bg-white">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#c44c3a]/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-[#c44c3a]" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#2c2c2c] mb-2">Admin Login</CardTitle>
          <CardDescription className="text-[#6b5b47]">
            Sign in to access the Tag My Trophy admin dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#2c2c2c] font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tagmytrophy.com"
                required
                disabled={loading}
                className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#2c2c2c] font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#e5d5c8]">
            <Button asChild variant="outline" className="w-full border-[#e5d5c8] hover:bg-[#f5f0e8] bg-transparent">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Home
              </Link>
            </Button>
          </div>

          <div className="mt-4 p-3 bg-[#f5f0e8] rounded-lg">
            <p className="text-xs text-[#6b5b47] text-center">Use your admin credentials to access the dashboard</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
