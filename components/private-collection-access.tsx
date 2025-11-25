"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Key, Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react"

interface PrivateCollectionAccessProps {
  collectionTitle: string
  requiresPassword: boolean
  onAccessGranted: () => void
}

export default function PrivateCollectionAccess({
  collectionTitle,
  requiresPassword,
  onAccessGranted,
}: PrivateCollectionAccessProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setError("")

    // Simulate password verification
    setTimeout(() => {
      if (password === "demo123") {
        onAccessGranted()
      } else {
        setError("Incorrect password. Please try again.")
      }
      setIsVerifying(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-[#c44c3a] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#2c2c2c] mb-2">Private Collection</CardTitle>
          <CardDescription className="text-[#6b5b47]">
            This collection is private and requires authentication to view
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Collection Info */}
          <div className="bg-[#f5f0e8] p-4 rounded-lg border border-[#e5d5c8]">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-[#2c2c2c]">Collection Found</p>
                <p className="text-sm text-[#6b5b47]">{collectionTitle}</p>
              </div>
            </div>
          </div>

          {requiresPassword ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#2c2c2c] flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Enter Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Collection password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
                disabled={isVerifying || !password}
              >
                {isVerifying ? "Verifying..." : "Access Collection"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  This collection is private. You need permission from the owner to view it.
                </AlertDescription>
              </Alert>

              <Button onClick={onAccessGranted} className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                Request Access
              </Button>
            </div>
          )}

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Contact the collection owner for access</li>
              <li>• Make sure you have the correct password</li>
              <li>• Check if you're using the right QR code</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
