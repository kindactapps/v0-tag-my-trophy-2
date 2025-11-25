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
import { UserPlus, Eye, EyeOff, Mail } from "lucide-react"
import { useAuth } from "@/lib/auth/hooks"
import BackButton from "@/components/back-button"

export default function SignupPageClient() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { signUp, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    console.log("[v0] Member signup attempt for email:", email)

    try {
      const { data, error: authError } = await signUp(email, password, fullName)

      if (authError) {
        console.log("[v0] Member signup error:", authError.message)
        setError(authError.message)
      } else if (data?.user) {
        console.log("[v0] Member signup successful")
        setSuccess("Account created! Please check your email to verify your account.")
        // Don't redirect immediately - let user verify email first
      }
    } catch (error) {
      console.error("[v0] Member signup unexpected error:", error)
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
        console.log("[v0] Google sign-up error:", authError.message)
        setError(authError.message)
      }
      // Note: Google sign-in will redirect, so no need to handle success here
    } catch (error) {
      console.error("[v0] Google sign-up unexpected error:", error)
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
              <UserPlus className="w-8 h-8 text-[#c44c3a]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#2c2c2c] mb-2">Create Account</CardTitle>
            <p className="text-[#6b5b47]">Join Tag My Trophy to start your memory collection</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[#2c2c2c]">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a]"
                  required
                  disabled={isLoading}
                />
              </div>

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
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] pr-10"
                    required
                    minLength={6}
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
                <p className="text-xs text-[#6b5b47]">Password must be at least 6 characters long</p>
              </div>

              <Button type="submit" className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
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
              Sign up with Google
            </Button>

            <div className="text-center">
              <p className="text-sm text-[#6b5b47]">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-[#c44c3a] hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
