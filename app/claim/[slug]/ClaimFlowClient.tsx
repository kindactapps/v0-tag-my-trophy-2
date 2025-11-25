"use client"

import { useState } from "react"

import type React from "react"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, QrCode, CheckCircle, Trophy, Fish, Plane, Palette, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"

interface ThemeOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  colors: {
    primary: string
    accent: string
    background: string
  }
}

const themeOptions: ThemeOption[] = [
  {
    id: "hunting",
    name: "Hunting Adventures",
    description: "Track your hunting trips, trophy moments, and outdoor experiences",
    icon: <Trophy className="w-6 h-6" />,
    colors: {
      primary: "bg-[#4b5563]",
      accent: "bg-[#f97316]",
      background: "bg-[#f3f4f6]",
    },
  },
  {
    id: "fishing",
    name: "Fishing Memories",
    description: "Document your catches, fishing spots, and angling adventures",
    icon: <Fish className="w-6 h-6" />,
    colors: {
      primary: "bg-[#059669]",
      accent: "bg-[#10b981]",
      background: "bg-[#ecfdf5]",
    },
  },
  {
    id: "sports",
    name: "Sports Season",
    description: "Capture games, tournaments, and athletic achievements",
    icon: <Trophy className="w-6 h-6" />,
    colors: {
      primary: "bg-[#ea580c]",
      accent: "bg-[#fffbeb]",
      background: "bg-[#fff7ed]",
    },
  },
  {
    id: "vacation",
    name: "Travel & Vacation",
    description: "Share your travel experiences, destinations, and adventures",
    icon: <Plane className="w-6 h-6" />,
    colors: {
      primary: "bg-[#6366f1]",
      accent: "bg-[#6366f1]",
      background: "bg-[#f0f9ff]",
    },
  },
  {
    id: "custom",
    name: "Custom Theme",
    description: "Create your own unique theme for any type of memory collection",
    icon: <Palette className="w-6 h-6" />,
    colors: {
      primary: "bg-[#8b5cf6]",
      accent: "bg-[#a78bfa]",
      background: "bg-[#faf5ff]",
    },
  },
]

type ClaimStep = "verify" | "account" | "theme" | "setup" | "complete"

export default function ClaimFlowClient({ slug }: { slug: string }) {
  const [currentStep, setCurrentStep] = useState<ClaimStep>("verify")
  const [selectedTheme, setSelectedTheme] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    collectionTitle: "",
    collectionBio: "",
  })
  const [customFields, setCustomFields] = useState<any[]>([])
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({})
  const [selectedCustomFields, setSelectedCustomFields] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (selectedTheme) {
      fetchCustomFields()
    }
  }, [selectedTheme])

  const fetchCustomFields = async () => {
    if (!selectedTheme) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("theme_custom_fields")
        .select("*")
        .eq("theme_id", selectedTheme)
        .order("display_order", { ascending: true })

      if (error) {
        console.error("[v0] Error fetching custom fields:", error)
        return
      }

      setCustomFields(data || [])
      const requiredFields = new Set(data?.filter((f) => f.is_required).map((f) => f.id) || [])
      setSelectedCustomFields(requiredFields)
    } catch (error) {
      console.error("[v0] Error fetching custom fields:", error)
    }
  }

  const toggleCustomField = (fieldId: string, isRequired: boolean) => {
    if (isRequired) return

    const newSelected = new Set(selectedCustomFields)
    if (newSelected.has(fieldId)) {
      newSelected.delete(fieldId)
      const newValues = { ...customFieldValues }
      delete newValues[fieldId]
      setCustomFieldValues(newValues)
    } else {
      newSelected.add(fieldId)
    }
    setSelectedCustomFields(newSelected)
  }

  const handleNext = () => {
    const steps: ClaimStep[] = ["verify", "account", "theme", "setup", "complete"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const steps: ClaimStep[] = ["verify", "account", "theme", "setup", "complete"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const renderStepIndicator = () => {
    const steps = [
      { id: "verify", label: "Verify" },
      { id: "account", label: "Account" },
      { id: "theme", label: "Theme" },
      { id: "setup", label: "Setup" },
      { id: "complete", label: "Complete" },
    ]

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step.id
                  ? "bg-[#c44c3a] text-white"
                  : steps.findIndex((s) => s.id === currentStep) > index
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {steps.findIndex((s) => s.id === currentStep) > index ? <CheckCircle className="w-4 h-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  steps.findIndex((s) => s.id === currentStep) > index ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="container mx-auto px-4 pt-6">
        <Link
          href={`/story/${slug}`}
          className="inline-flex items-center gap-2 text-[#2c2c2c] hover:text-[#c44c3a] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Story
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {renderStepIndicator()}

          {/* Step 1: Verify QR Code */}
          {currentStep === "verify" && (
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-[#c44c3a] rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#2c2c2c] mb-2">Claim Your Story Tag</CardTitle>
                <CardDescription className="text-[#6b5b47]">
                  You're about to claim this unique memory collection space
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* QR Code Verification */}
                <div className="bg-[#f5f0e8] p-4 rounded-lg border border-[#e5d5c8]">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-[#2c2c2c]">QR Code Verified</p>
                      <p className="text-sm text-[#6b5b47]">story/{slug}</p>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-[#6b5b47]">
                    This QR code is ready to become your personal memory collection. Once claimed, you'll be able to add
                    photos, videos, and stories that can be accessed by scanning this code.
                  </p>

                  <Button onClick={handleNext} className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                    Continue to Setup
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Create Account */}
          {currentStep === "account" && (
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-[#2c2c2c] mb-2">Create Your Account</CardTitle>
                <CardDescription className="text-[#6b5b47]">
                  Set up your account to manage your memory collections
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#2c2c2c]">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#2c2c2c]">
                    Create Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Choose a strong password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-[#2c2c2c]">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="How others will see your name"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleBack} variant="outline" className="flex-1 border-[#e5d5c8] bg-transparent">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
                    disabled={!formData.email || !formData.password}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Choose Theme */}
          {currentStep === "theme" && (
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-[#2c2c2c] mb-2">Choose Your Theme</CardTitle>
                <CardDescription className="text-[#6b5b47]">
                  Select a theme that matches your memory collection style
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {themeOptions.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTheme === theme.id
                          ? "border-[#c44c3a] bg-[#c44c3a]/5"
                          : "border-[#e5d5c8] hover:border-[#c44c3a]/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg text-white ${theme.colors.primary}`}>{theme.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#2c2c2c]">{theme.name}</h3>
                            {selectedTheme === theme.id && <CheckCircle className="w-4 h-4 text-[#c44c3a]" />}
                          </div>
                          <p className="text-sm text-[#6b5b47] mb-2">{theme.description}</p>
                          <div className="flex gap-2">
                            <div className={`w-4 h-4 rounded-full ${theme.colors.primary}`} />
                            <div className={`w-4 h-4 rounded-full ${theme.colors.accent}`} />
                            <div className={`w-4 h-4 rounded-full ${theme.colors.background} border border-gray-200`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleBack} variant="outline" className="flex-1 border-[#e5d5c8] bg-transparent">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
                    disabled={!selectedTheme}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Collection Setup */}
          {currentStep === "setup" && (
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-[#2c2c2c] mb-2">Set Up Your Collection</CardTitle>
                <CardDescription className="text-[#6b5b47]">
                  Give your memory collection a title and customize your profile fields
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {selectedTheme && (
                  <div className="bg-[#f5f0e8] p-4 rounded-lg border border-[#e5d5c8] mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg text-white ${themeOptions.find((t) => t.id === selectedTheme)?.colors.primary}`}
                      >
                        {themeOptions.find((t) => t.id === selectedTheme)?.icon}
                      </div>
                      <div>
                        <p className="font-medium text-[#2c2c2c]">Selected Theme</p>
                        <p className="text-sm text-[#6b5b47]">
                          {themeOptions.find((t) => t.id === selectedTheme)?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="collectionTitle" className="text-[#2c2c2c]">
                    Collection Title
                  </Label>
                  <Input
                    id="collectionTitle"
                    type="text"
                    placeholder="e.g., Jake's Fishing Adventures, Emma's Soccer Season 2024"
                    value={formData.collectionTitle}
                    onChange={(e) => setFormData({ ...formData, collectionTitle: e.target.value })}
                    className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collectionBio" className="text-[#2c2c2c]">
                    Collection Description
                  </Label>
                  <textarea
                    id="collectionBio"
                    placeholder="Describe what this collection is about..."
                    value={formData.collectionBio}
                    onChange={(e) => setFormData({ ...formData, collectionBio: e.target.value })}
                    className="w-full p-3 border border-[#e5d5c8] rounded-lg resize-none h-24 focus:border-[#c44c3a] focus:ring-[#c44c3a] focus:ring-1"
                  />
                </div>

                {customFields.length > 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <h3 className="font-semibold text-[#2c2c2c] mb-2">Profile Details</h3>
                      <p className="text-sm text-[#6b5b47] mb-4">
                        Select which details you'd like to include in your profile. You can always add more later.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {customFields.map((field) => {
                        const isSelected = selectedCustomFields.has(field.id)
                        const isRequired = field.is_required

                        return (
                          <div key={field.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`field-${field.id}`}
                                checked={isSelected}
                                onChange={() => toggleCustomField(field.id, isRequired)}
                                disabled={isRequired}
                                className="w-4 h-4 text-[#c44c3a] border-gray-300 rounded focus:ring-[#c44c3a]"
                              />
                              <Label htmlFor={`field-${field.id}`} className="cursor-pointer flex items-center gap-2">
                                {field.field_label}
                                {isRequired && (
                                  <Badge variant="secondary" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                              </Label>
                            </div>

                            {isSelected && (
                              <div className="ml-6">
                                {field.field_type === "textarea" ? (
                                  <textarea
                                    value={customFieldValues[field.id] || ""}
                                    onChange={(e) =>
                                      setCustomFieldValues({
                                        ...customFieldValues,
                                        [field.id]: e.target.value,
                                      })
                                    }
                                    placeholder={field.placeholder || `Enter ${field.field_label.toLowerCase()}`}
                                    className="w-full p-2 border border-[#e5d5c8] rounded-lg resize-none h-20 text-sm focus:border-[#c44c3a] focus:ring-[#c44c3a] focus:ring-1"
                                    required={isRequired}
                                  />
                                ) : field.field_type === "select" ? (
                                  <select
                                    value={customFieldValues[field.id] || ""}
                                    onChange={(e) =>
                                      setCustomFieldValues({
                                        ...customFieldValues,
                                        [field.id]: e.target.value,
                                      })
                                    }
                                    className="w-full p-2 border border-[#e5d5c8] rounded-lg text-sm focus:border-[#c44c3a] focus:ring-[#c44c3a] focus:ring-1"
                                    required={isRequired}
                                  >
                                    <option value="">Select {field.field_label}</option>
                                    {field.field_options?.map((option: string) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <Input
                                    type={field.field_type}
                                    value={customFieldValues[field.id] || ""}
                                    onChange={(e) =>
                                      setCustomFieldValues({
                                        ...customFieldValues,
                                        [field.id]: e.target.value,
                                      })
                                    }
                                    placeholder={field.placeholder || `Enter ${field.field_label.toLowerCase()}`}
                                    className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] text-sm"
                                    required={isRequired}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleBack} variant="outline" className="flex-1 border-[#e5d5c8] bg-transparent">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
                    disabled={!formData.collectionTitle}
                  >
                    Create Collection
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Complete */}
          {currentStep === "complete" && (
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#2c2c2c] mb-2">Collection Created!</CardTitle>
                <CardDescription className="text-[#6b5b47]">
                  Your memory collection is ready. Start adding your first memories!
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-[#f5f0e8] p-4 rounded-lg border border-[#e5d5c8]">
                  <h3 className="font-semibold text-[#2c2c2c] mb-2">Your Collection Details:</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Title:</span> {formData.collectionTitle}
                    </p>
                    <p>
                      <span className="font-medium">Theme:</span>{" "}
                      {themeOptions.find((t) => t.id === selectedTheme)?.name}
                    </p>
                    <p>
                      <span className="font-medium">QR Code:</span> {slug}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button asChild className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                    <Link href={`/dashboard/collections/${slug}`}>Start Adding Memories</Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full border-[#e5d5c8] bg-transparent">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Add your first photo or video memory</li>
                    <li>• Write a story about your experience</li>
                    <li>• Share your QR code with family and friends</li>
                    <li>• Customize your collection settings</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
