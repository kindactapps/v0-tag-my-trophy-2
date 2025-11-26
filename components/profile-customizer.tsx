"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff } from "lucide-react"
import type { ProfileCustomization } from "@/types"

interface ProfileCustomizerProps {
  profile: ProfileCustomization
  onProfileUpdate: (updates: Partial<ProfileCustomization>) => void
  isOpen: boolean
  onClose: () => void
}

const colorThemes = [
  {
    id: "warm-earth",
    name: "Warm Earth",
    colors: {
      primary: "#c44c3a",
      secondary: "#2c2c2c",
      background: "#f5f0e8",
      accent: "#8b4513",
    },
    preview: "bg-gradient-to-r from-[#c44c3a] to-[#8b4513]",
  },
  {
    id: "forest-green",
    name: "Forest Green",
    colors: {
      primary: "#2d5016",
      secondary: "#2c2c2c",
      background: "#f0f4ec",
      accent: "#4a7c59",
    },
    preview: "bg-gradient-to-r from-[#2d5016] to-[#4a7c59]",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    colors: {
      primary: "#1e3a8a",
      secondary: "#2c2c2c",
      background: "#eff6ff",
      accent: "#3b82f6",
    },
    preview: "bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6]",
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    colors: {
      primary: "#ea580c",
      secondary: "#2c2c2c",
      background: "#fff7ed",
      accent: "#f97316",
    },
    preview: "bg-gradient-to-r from-[#ea580c] to-[#f97316]",
  },
]

const layoutOptions = [
  {
    id: "masonry",
    name: "Masonry Grid",
    description: "Dynamic grid that adapts to content",
    icon: "grid",
  },
  {
    id: "timeline",
    name: "Timeline View",
    description: "Chronological story flow",
    icon: "timeline",
  },
  {
    id: "magazine",
    name: "Magazine Style",
    description: "Featured content with sidebar",
    icon: "magazine",
  },
]

const backgroundTextures = [
  {
    id: "none",
    name: "Clean",
    preview: "bg-white",
  },
  {
    id: "paper",
    name: "Paper",
    preview: "bg-gradient-to-br from-white to-gray-50",
  },
  {
    id: "linen",
    name: "Linen",
    preview: "bg-gradient-to-br from-amber-50 to-orange-50",
  },
  {
    id: "wood",
    name: "Wood Grain",
    preview: "bg-gradient-to-br from-amber-100 to-orange-100",
  },
]

export default function ProfileCustomizer({ profile, onProfileUpdate, isOpen, onClose }: ProfileCustomizerProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: profile.name || "",
    bio: profile.bio || "",
    theme: profile.theme || "warm-earth",
    layout: profile.layout || "masonry",
    background: profile.background || "none",
    showViewCount: profile.showViewCount !== false,
    allowComments: profile.allowComments !== false,
    isPrivate: profile.isPrivate || false,
  })

  const handleSave = () => {
    onProfileUpdate(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r p-4">
            <h3 className="text-lg font-semibold mb-4">Customize Profile</h3>
            <nav className="space-y-2">
              {[
                { id: "basic", name: "Basic Info", icon: "user" },
                { id: "theme", name: "Color Theme", icon: "palette" },
                { id: "layout", name: "Layout Style", icon: "layout" },
                { id: "privacy", name: "Privacy Settings", icon: "shield" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors min-h-[48px] touch-manipulation ${
                    activeTab === tab.id ? "bg-[#c44c3a] text-white" : "hover:bg-gray-200"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-semibold mb-4">Basic Information</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Display Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your story title..."
                        className="min-h-[48px]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Bio</label>
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell visitors about your story..."
                        className="min-h-[120px]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Profile Photo</label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                          <img
                            src={profile.avatar || "/placeholder.svg"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button variant="outline" size="sm" className="min-h-[44px] touch-manipulation bg-transparent">
                          Change Photo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "theme" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-semibold mb-4">Color Theme</h4>
                  <p className="text-gray-600 mb-6">Choose a color palette that reflects your story's mood</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {colorThemes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setFormData({ ...formData, theme: theme.id })}
                        className={`p-6 rounded-lg border-2 transition-all min-h-[120px] touch-manipulation ${
                          formData.theme === theme.id
                            ? "border-[#c44c3a] ring-2 ring-[#c44c3a]/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-full h-12 rounded-lg mb-3 ${theme.preview}`}></div>
                        <h5 className="font-medium">{theme.name}</h5>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Background Texture</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {backgroundTextures.map((texture) => (
                      <button
                        key={texture.id}
                        onClick={() => setFormData({ ...formData, background: texture.id })}
                        className={`p-4 rounded-lg border-2 transition-all min-h-[80px] touch-manipulation ${
                          formData.background === texture.id
                            ? "border-[#c44c3a]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-full h-8 rounded ${texture.preview} mb-2`}></div>
                        <span className="text-sm">{texture.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "layout" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-semibold mb-4">Layout Style</h4>
                  <p className="text-gray-600 mb-6">Choose how your memories are displayed</p>

                  <div className="space-y-4">
                    {layoutOptions.map((layout) => (
                      <button
                        key={layout.id}
                        onClick={() => setFormData({ ...formData, layout: layout.id })}
                        className={`w-full p-6 rounded-lg border-2 text-left transition-all min-h-[80px] touch-manipulation ${
                          formData.layout === layout.id
                            ? "border-[#c44c3a] bg-[#c44c3a]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 10h16M4 14h16M4 18h16"
                              />
                            </svg>
                          </div>
                          <div>
                            <h5 className="font-medium">{layout.name}</h5>
                            <p className="text-sm text-gray-600">{layout.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Display Options</h4>
                  <div className="space-y-4">
                    <label className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer min-h-[48px] touch-manipulation">
                      <input
                        type="checkbox"
                        checked={formData.showViewCount}
                        onChange={(e) => setFormData({ ...formData, showViewCount: e.target.checked })}
                        className="rounded border-gray-300 w-5 h-5"
                      />
                      <span>Show view count to visitors</span>
                    </label>
                    <label className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer min-h-[48px] touch-manipulation">
                      <input
                        type="checkbox"
                        checked={formData.allowComments}
                        onChange={(e) => setFormData({ ...formData, allowComments: e.target.checked })}
                        className="rounded border-gray-300 w-5 h-5"
                      />
                      <span>Allow visitors to leave messages</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-semibold mb-4">Privacy Settings</h4>

                  <div className="space-y-6">
                    <div className="p-6 border rounded-lg">
                      <label className="flex items-start gap-4 cursor-pointer min-h-[48px] touch-manipulation">
                        <input
                          type="checkbox"
                          checked={formData.isPrivate}
                          onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                          className="rounded border-gray-300 mt-1 w-5 h-5"
                        />
                        <div>
                          <span className="font-medium">Private Story</span>
                          <p className="text-sm text-gray-600 mt-1">
                            Only people with the direct link can view your story. It won't appear in search results.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="p-6 border rounded-lg">
                      <h5 className="font-medium mb-2">Password Protection</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Add an extra layer of security by requiring a password to view your story.
                      </p>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Input
                            placeholder="Enter password (optional)"
                            type={showPassword ? "text" : "password"}
                            className="min-h-[48px] pr-10"
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
                        <Button variant="outline" className="min-h-[48px] touch-manipulation bg-transparent">
                          Set Password
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 border rounded-lg">
                      <h5 className="font-medium mb-2">Family-Only Mode</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Restrict viewing to family members only. You can invite specific people via email.
                      </p>
                      <Button variant="outline" className="min-h-[48px] touch-manipulation bg-transparent">
                        Manage Family List
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                className="min-h-[48px] px-8 touch-manipulation bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-[#c44c3a] hover:bg-[#a63d2e] min-h-[48px] px-8 touch-manipulation"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
