"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Crown, Zap } from "lucide-react"

// Mock user data
const mockUserData = {
  tier: "basic" as "basic" | "premium",
  usage: {
    videoMinutes: 45,
    photoCount: 78,
  },
  joinDate: "2024-01-15",
}

const TIER_LIMITS = {
  basic: {
    name: "Complete Package",
    price: 29.99,
    videoMinutes: 60,
    photoCount: 200,
    color: "bg-purple-500",
    features: [
      "Durable metal QR tag",
      "Strong adhesive backing",
      "200 photos per experience",
      "1 hour of video per experience",
      "Easy sharing with anyone",
      "Weather-resistant design",
      "Priority customer support",
      "Advanced customization options",
    ],
  },
}

export default function UpgradeClient() {
  const [userData, setUserData] = useState(mockUserData)

  const currentTier = TIER_LIMITS.basic

  const videoUsagePercent = (userData.usage.videoMinutes / currentTier.videoMinutes) * 100
  const photoUsagePercent = (userData.usage.photoCount / currentTier.photoCount) * 100

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <header className="bg-white border-b border-[#e5d5c8] px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 text-[#2c2c2c] hover:text-[#c44c3a] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Settings
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[#2c2c2c]">Your Plan</h1>
          <p className="text-[#6b5b47]">Manage your subscription and storage</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-purple-900 mb-2">Complete Memory Package</h2>
            <p className="text-purple-700 mb-6">
              You have access to all features with 200 photos and 1 hour of video per experience
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-white/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-900">200</div>
                <div className="text-sm text-purple-700">Photos per experience</div>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-900">1 hr</div>
                <div className="text-sm text-purple-700">Video per experience</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Usage */}
        <Card className="border-[#e5d5c8] mt-6">
          <CardHeader>
            <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#c44c3a]" />
              Your Current Usage
            </CardTitle>
            <CardDescription className="text-[#6b5b47]">Track your storage usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#2c2c2c] font-medium">Photos Used</span>
                  <span className="text-sm text-[#6b5b47]">
                    {userData.usage.photoCount} / {currentTier.photoCount}
                  </span>
                </div>
                <Progress value={photoUsagePercent} className="h-2" />
                {photoUsagePercent >= 80 && <p className="text-sm text-orange-600">Running low on photo storage</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#2c2c2c] font-medium">Video Used</span>
                  <span className="text-sm text-[#6b5b47]">
                    {userData.usage.videoMinutes} / {currentTier.videoMinutes} min
                  </span>
                </div>
                <Progress value={videoUsagePercent} className="h-2" />
                {videoUsagePercent >= 80 && <p className="text-sm text-orange-600">Running low on video storage</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
