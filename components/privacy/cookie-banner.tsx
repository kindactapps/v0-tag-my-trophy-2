"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { usePrivacy } from "@/lib/privacy"
import { X, Settings, Shield, BarChart3, Mail } from "lucide-react"

export default function CookieBanner() {
  const { showBanner, acceptAll, acceptEssential, rejectAll, updateSettings } = usePrivacy()
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState({
    functional: true, // Always required
    analytics: false,
    marketing: false,
  })

  if (!showBanner) return null

  const handleCustomAccept = () => {
    updateSettings({
      cookieConsent: true,
      functionalConsent: true,
      analyticsConsent: preferences.analytics,
      marketingConsent: preferences.marketing,
    })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-4xl mx-auto bg-white border-[#e8ddd0] shadow-2xl">
        <CardContent className="p-6">
          {!showDetails ? (
            // Simple banner view
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-[#c44c3a]" />
                  <h3 className="font-semibold text-[#2c2c2c]">Your Privacy Matters</h3>
                </div>
                <p className="text-sm text-[#6b5b47] leading-relaxed">
                  We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts.
                  You can customize your preferences or accept our recommended settings.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(true)}
                  className="border-[#c44c3a] text-[#c44c3a] hover:bg-[#c44c3a] hover:text-white"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Customize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={acceptEssential}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
                >
                  Essential Only
                </Button>
                <Button size="sm" onClick={acceptAll} className="bg-[#c44c3a] hover:bg-[#a83d2e] text-white">
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            // Detailed preferences view
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#c44c3a]" />
                  <h3 className="font-semibold text-[#2c2c2c]">Cookie Preferences</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Functional Cookies */}
                <div className="flex items-start justify-between p-4 bg-[#f5f0e8] rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Settings className="h-4 w-4 text-[#c44c3a]" />
                      <h4 className="font-medium text-[#2c2c2c]">Essential Cookies</h4>
                      <span className="text-xs bg-[#c44c3a] text-white px-2 py-1 rounded">Required</span>
                    </div>
                    <p className="text-sm text-[#6b5b47]">
                      Necessary for the website to function properly. These cannot be disabled.
                    </p>
                  </div>
                  <Switch checked={true} disabled className="ml-4" />
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-[#2c2c2c]">Analytics Cookies</h4>
                    </div>
                    <p className="text-sm text-[#6b5b47]">
                      Help us understand how visitors interact with our website to improve user experience.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, analytics: checked }))}
                    className="ml-4"
                  />
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-4 w-4 text-green-600" />
                      <h4 className="font-medium text-[#2c2c2c]">Marketing Cookies</h4>
                    </div>
                    <p className="text-sm text-[#6b5b47]">
                      Used to deliver personalized advertisements and measure campaign effectiveness.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, marketing: checked }))}
                    className="ml-4"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-[#e8ddd0]">
                <Button
                  variant="outline"
                  onClick={rejectAll}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
                >
                  Reject All
                </Button>
                <Button
                  variant="outline"
                  onClick={acceptEssential}
                  className="flex-1 border-[#c44c3a] text-[#c44c3a] hover:bg-[#c44c3a] hover:text-white bg-transparent"
                >
                  Essential Only
                </Button>
                <Button onClick={handleCustomAccept} className="flex-1 bg-[#c44c3a] hover:bg-[#a83d2e] text-white">
                  Save Preferences
                </Button>
              </div>

              <p className="text-xs text-[#6b5b47] text-center">
                You can change these settings anytime in your privacy preferences.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
