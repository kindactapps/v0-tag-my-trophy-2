"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Lock,
  Globe,
  Eye,
  EyeOff,
  Users,
  UserCheck,
  Shield,
  Key,
  QrCode,
  Share2,
  Copy,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import type { PrivacySettings as PrivacySettingsType } from "@/types"

interface PrivacySettingsProps {
  collectionId: string
  isPrivate: boolean
  allowComments: boolean
  allowSharing: boolean
  requirePassword: boolean
  onSettingsChange: (settings: PrivacySettingsType) => void
}

interface PrivacySettings {
  isPrivate: boolean
  allowComments: boolean
  allowSharing: boolean
  requirePassword: boolean
  password?: string
  allowedViewers?: string[]
}

export default function PrivacySettings({
  collectionId,
  isPrivate,
  allowComments,
  allowSharing,
  requirePassword,
  onSettingsChange,
}: PrivacySettingsProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    isPrivate,
    allowComments,
    allowSharing,
    requirePassword,
    password: "",
    allowedViewers: [],
  })
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSettingChange = (key: keyof PrivacySettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    onSettingsChange(newSettings)
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/story/${collectionId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Privacy Level */}
      <Card className="border-[#e5d5c8]">
        <CardHeader>
          <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Level
          </CardTitle>
          <CardDescription className="text-[#6b5b47]">Control who can access your memory collection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#f5f0e8] rounded-lg">
            <div className="flex items-center gap-3">
              {settings.isPrivate ? (
                <Lock className="w-5 h-5 text-gray-600" />
              ) : (
                <Globe className="w-5 h-5 text-green-600" />
              )}
              <div>
                <h4 className="font-medium text-[#2c2c2c]">
                  {settings.isPrivate ? "Private Collection" : "Public Collection"}
                </h4>
                <p className="text-sm text-[#6b5b47]">
                  {settings.isPrivate
                    ? "Only people you choose can view this collection"
                    : "Anyone with the QR code or link can view this collection"}
                </p>
              </div>
            </div>
            <Switch
              checked={!settings.isPrivate}
              onCheckedChange={(checked) => handleSettingChange("isPrivate", !checked)}
            />
          </div>

          {/* Password Protection */}
          {settings.isPrivate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900">Password Protection</h4>
                    <p className="text-sm text-blue-700">Require a password to view this collection</p>
                  </div>
                </div>
                <Switch
                  checked={settings.requirePassword}
                  onCheckedChange={(checked) => handleSettingChange("requirePassword", checked)}
                />
              </div>

              {settings.requirePassword && (
                <div className="space-y-2 ml-8">
                  <Label htmlFor="password" className="text-[#2c2c2c]">
                    Collection Password
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter a secure password"
                        value={settings.password}
                        onChange={(e) => handleSettingChange("password", e.target.value)}
                        className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] pr-10"
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
                  <p className="text-xs text-[#6b5b47]">Share this password with people you want to give access to</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interaction Settings */}
      <Card className="border-[#e5d5c8]">
        <CardHeader>
          <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
            <Users className="w-5 h-5" />
            Interaction Settings
          </CardTitle>
          <CardDescription className="text-[#6b5b47]">
            Control how visitors can interact with your collection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comments */}
          <div className="flex items-center justify-between p-4 bg-[#f5f0e8] rounded-lg">
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-[#c44c3a]" />
              <div>
                <h4 className="font-medium text-[#2c2c2c]">Allow Comments</h4>
                <p className="text-sm text-[#6b5b47]">Let visitors leave comments on your memories</p>
              </div>
            </div>
            <Switch
              checked={settings.allowComments}
              onCheckedChange={(checked) => handleSettingChange("allowComments", checked)}
            />
          </div>

          {/* Sharing */}
          <div className="flex items-center justify-between p-4 bg-[#f5f0e8] rounded-lg">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-[#c44c3a]" />
              <div>
                <h4 className="font-medium text-[#2c2c2c]">Allow Sharing</h4>
                <p className="text-sm text-[#6b5b47]">Let visitors share individual memories or the collection</p>
              </div>
            </div>
            <Switch
              checked={settings.allowSharing}
              onCheckedChange={(checked) => handleSettingChange("allowSharing", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sharing Options */}
      <Card className="border-[#e5d5c8]">
        <CardHeader>
          <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Sharing Options
          </CardTitle>
          <CardDescription className="text-[#6b5b47]">Share your collection with others</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Collection Link */}
          <div className="space-y-2">
            <Label className="text-[#2c2c2c]">Collection Link</Label>
            <div className="flex gap-2">
              <Input
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/story/${collectionId}`}
                readOnly
                className="border-[#e5d5c8] bg-[#f5f0e8]"
              />
              <Button variant="outline" onClick={handleCopyLink} className="border-[#e5d5c8] bg-transparent">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            {settings.isPrivate && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                <span>This link will require authentication to view</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="border-[#e5d5c8] bg-transparent justify-start">
              <QrCode className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
            <Button variant="outline" className="border-[#e5d5c8] bg-transparent justify-start">
              <Share2 className="w-4 h-4 mr-2" />
              Share via Social Media
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Summary */}
      <Card className="border-[#e5d5c8] bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Privacy Summary</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <Badge variant={settings.isPrivate ? "destructive" : "default"} className="text-xs">
                    {settings.isPrivate ? "Private" : "Public"}
                  </Badge>
                  <span>
                    {settings.isPrivate ? "Only authorized viewers can access" : "Anyone with the link can view"}
                  </span>
                </div>
                {settings.requirePassword && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-amber-400 text-amber-700">
                      Password Protected
                    </Badge>
                    <span>Requires password to view</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant={settings.allowComments ? "default" : "secondary"} className="text-xs">
                    Comments {settings.allowComments ? "Enabled" : "Disabled"}
                  </Badge>
                  <Badge variant={settings.allowSharing ? "default" : "secondary"} className="text-xs">
                    Sharing {settings.allowSharing ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
