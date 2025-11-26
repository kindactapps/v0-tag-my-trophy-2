"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Shield, Eye, Download, Trash2, Lock, Globe, Users, Camera, MapPin, Calendar } from "lucide-react"

interface PrivacySettings {
  profileVisibility: "public" | "private" | "friends"
  allowComments: boolean
  allowSharing: boolean
  showLocation: boolean
  showTimestamps: boolean
  allowAnalytics: boolean
  allowCookies: boolean
  dataRetention: "1year" | "2years" | "forever"
}

export default function PrivacyControls() {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: "public",
    allowComments: true,
    allowSharing: true,
    showLocation: true,
    showTimestamps: true,
    allowAnalytics: true,
    allowCookies: true,
    dataRetention: "2years",
  })

  const [showCookieBanner, setShowCookieBanner] = useState(false)
  const [dataExportLoading, setDataExportLoading] = useState(false)
  const [accountDeletionLoading, setAccountDeletionLoading] = useState(false)
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false)

  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookie_consent")
    if (!cookieConsent) {
      setShowCookieBanner(true)
    }

    const savedSettings = localStorage.getItem("privacy_settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const updateSetting = <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem("privacy_settings", JSON.stringify(newSettings))
  }

  const handleCookieConsent = (accepted: boolean) => {
    localStorage.setItem("cookie_consent", accepted ? "accepted" : "declined")
    localStorage.setItem("cookie_consent_date", new Date().toISOString())
    setShowCookieBanner(false)

    if (!accepted) {
      updateSetting("allowAnalytics", false)
      updateSetting("allowCookies", false)
    }
  }

  const handleDataExport = async () => {
    setDataExportLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const dataExport = {
      profile: { name: "User", email: "user@example.com" },
      memories: [],
      settings: settings,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(dataExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "tagmytrophy-data-export.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setDataExportLoading(false)
  }

  const handleAccountDeletion = async () => {
    setAccountDeletionLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Request Submitted",
      description: "Account deletion request submitted. You will receive a confirmation email.",
    })

    setAccountDeletionLoading(false)
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={deleteAccountDialogOpen}
        onOpenChange={setDeleteAccountDialogOpen}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action cannot be undone."
        confirmLabel="Delete Account"
        variant="destructive"
        onConfirm={handleAccountDeletion}
      />

      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#2c2c2c] text-white p-4 z-50 border-t-4 border-[#c44c3a]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Cookie Consent</h3>
              <p className="text-sm text-gray-300">
                We use cookies to enhance your experience and analyze site usage. You can manage your preferences below.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCookieConsent(false)}
                className="border-white text-white hover:bg-white hover:text-[#2c2c2c]"
              >
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => handleCookieConsent(true)}
                className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card className="border-[#e5d5c8]">
        <CardHeader>
          <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#c44c3a]" />
            Privacy & Visibility Settings
          </CardTitle>
          <CardDescription className="text-[#6b5b47]">
            Control who can see your content and how your data is used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-medium text-[#2c2c2c] flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Profile Visibility
            </h4>
            <div className="flex gap-2">
              {(["public", "private", "friends"] as const).map((option) => (
                <Badge
                  key={option}
                  variant={settings.profileVisibility === option ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    settings.profileVisibility === option
                      ? "bg-[#c44c3a] text-white"
                      : "border-[#e5d5c8] text-[#6b5b47] hover:border-[#c44c3a]"
                  }`}
                  onClick={() => updateSetting("profileVisibility", option)}
                >
                  {option === "public" && <Globe className="w-3 h-3 mr-1" />}
                  {option === "private" && <Lock className="w-3 h-3 mr-1" />}
                  {option === "friends" && <Users className="w-3 h-3 mr-1" />}
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-[#2c2c2c]">Content Permissions</h4>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#6b5b47]" />
                  <span className="text-sm text-[#2c2c2c]">Allow Comments</span>
                </div>
                <Switch
                  checked={settings.allowComments}
                  onCheckedChange={(checked) => updateSetting("allowComments", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#6b5b47]" />
                  <span className="text-sm text-[#2c2c2c]">Allow Sharing</span>
                </div>
                <Switch
                  checked={settings.allowSharing}
                  onCheckedChange={(checked) => updateSetting("allowSharing", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#6b5b47]" />
                  <span className="text-sm text-[#2c2c2c]">Show Location Data</span>
                </div>
                <Switch
                  checked={settings.showLocation}
                  onCheckedChange={(checked) => updateSetting("showLocation", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#6b5b47]" />
                  <span className="text-sm text-[#2c2c2c]">Show Timestamps</span>
                </div>
                <Switch
                  checked={settings.showTimestamps}
                  onCheckedChange={(checked) => updateSetting("showTimestamps", checked)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-[#2c2c2c]">Data & Analytics</h4>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#6b5b47]" />
                  <span className="text-sm text-[#2c2c2c]">Allow Analytics</span>
                </div>
                <Switch
                  checked={settings.allowAnalytics}
                  onCheckedChange={(checked) => updateSetting("allowAnalytics", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#6b5b47]" />
                  <span className="text-sm text-[#2c2c2c]">Allow Cookies</span>
                </div>
                <Switch
                  checked={settings.allowCookies}
                  onCheckedChange={(checked) => updateSetting("allowCookies", checked)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#2c2c2c]">Data Retention</label>
                <select
                  value={settings.dataRetention}
                  onChange={(e) => updateSetting("dataRetention", e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#e5d5c8] rounded-md bg-white text-sm"
                >
                  <option value="1year">1 Year</option>
                  <option value="2years">2 Years</option>
                  <option value="forever">Forever</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#e5d5c8]">
        <CardHeader>
          <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
            <Download className="w-5 h-5 text-[#c44c3a]" />
            Data Management
          </CardTitle>
          <CardDescription className="text-[#6b5b47]">
            Export or delete your personal data in compliance with GDPR
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-[#2c2c2c]">Export Your Data</h4>
              <p className="text-sm text-[#6b5b47]">
                Download a copy of all your data including profile, memories, and settings.
              </p>
              <Button
                onClick={handleDataExport}
                disabled={dataExportLoading}
                className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                {dataExportLoading ? "Preparing Export..." : "Export My Data"}
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-[#2c2c2c]">Delete Account</h4>
              <p className="text-sm text-[#6b5b47]">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
              <Button
                onClick={() => setDeleteAccountDialogOpen(true)}
                disabled={accountDeletionLoading}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {accountDeletionLoading ? "Processing..." : "Delete Account"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
