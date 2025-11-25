"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Eye, EyeOff, Mail } from "lucide-react"
import { useAuth } from "@/lib/auth/hooks"
import BackButton from "@/components/back-button"

export default function LoginPageClient() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    console.log("[v0] Member login attempt for email:", email)

    try {
      const { data, error: authError } = await signIn(email, password)

      if (authError) {
        console.log("[v0] Member login error:", authError.message)
        setError(authError.message)
      } else if (data?.user) {
        console.log("[v0] Member login successful")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("[v0] Member login unexpected error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setIsLoading(true)

    try {
      const { error: authError } = await signInWithGoogle()

      if (authError) {
        console.log("[v0] Google sign-in error:", authError.message)
        setError(authError.message)
      }
      // Note: Google sign-in will redirect, so no need to handle success here
    } catch (error) {
      console.error("[v0] Google sign-in unexpected error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <BackButton />

        <Card className="w-full shadow-lg border-0 bg-white">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#c44c3a]/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-[#c44c3a]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#2c2c2c] mb-2">Member Login</CardTitle>
            <p className="text-[#6b5b47]">Sign in to access your memory collections</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#2c2c2c]">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a]"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#2c2c2c]">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] pr-10"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#e5d5c8]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[#6b5b47]">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-[#e5d5c8] hover:bg-[#f5f0e8] bg-transparent"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Mail className="w-4 h-4 mr-2" />
              Sign in with Google
            </Button>

            <div className="text-center space-y-2">
              <Link href="/auth/forgot-password" className="text-sm text-[#c44c3a] hover:underline">
                Forgot your password?
              </Link>
              <p className="text-sm text-[#6b5b47]">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-[#c44c3a] hover:underline">
                  Sign up
                </Link>
              </p>
              <div className="pt-4 border-t border-[#e5d5c8] mt-6">
                <Link
                  href="/auth/admin"
                  className="inline-flex items-center justify-center px-3 py-2 text-xs text-[#666] hover:text-[#c44c3a] hover:bg-[#f5f0e8] rounded-md transition-colors border border-[#e5d5c8] hover:border-[#c44c3a]"
                >
                  Admin Access
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
