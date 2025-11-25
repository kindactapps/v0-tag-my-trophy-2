"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Upload,
  Camera,
  Video,
  FileText,
  Plus,
  X,
  Calendar,
  MapPin,
  Tag,
  Save,
  Crown,
  Zap,
  AlertTriangle,
} from "lucide-react"

const TIER_LIMITS = {
  basic: {
    name: "Basic",
    price: 29.99,
    videoMinutes: 60, // 1 hour
    photoCount: 200,
    color: "bg-purple-500",
  },
}

// Mock user subscription and usage data
const mockUserData = {
  tier: "basic" as keyof typeof TIER_LIMITS,
  usage: {
    videoMinutes: 0, // Reset to 0 for fresh start
    photoCount: 0, // Reset to 0 for fresh start
  },
}

export default function UploadClient() {
  const [uploadType, setUploadType] = useState("photo")
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [userData, setUserData] = useState(mockUserData)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  const currentTier = TIER_LIMITS[userData.tier]

  const videoUsagePercent = (userData.usage.videoMinutes / currentTier.videoMinutes) * 100
  const photoUsagePercent = (userData.usage.photoCount / currentTier.photoCount) * 100
  const remainingVideoMinutes = currentTier.videoMinutes - userData.usage.videoMinutes
  const remainingPhotos = currentTier.photoCount - userData.usage.photoCount

  const isVideoLimitReached = remainingVideoMinutes <= 0
  const isPhotoLimitReached = remainingPhotos <= 0
  const isVideoLimitNear = videoUsagePercent >= 80
  const isPhotoLimitNear = photoUsagePercent >= 80

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      if (uploadType === "photo" && isPhotoLimitReached) {
        setShowUpgradePrompt(true)
        return
      }
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      if (uploadType === "photo" && isPhotoLimitReached) {
        setShowUpgradePrompt(true)
        return
      }
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpgrade = () => {
    // This would integrate with payment processing
    console.log("Upgrading to premium tier...")
    // For demo, just update the tier
    setUserData((prev) => ({ ...prev, tier: "premium" }))
    setShowUpgradePrompt(false)
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5d5c8] px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-[#2c2c2c] hover:text-[#c44c3a] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#2c2c2c]">Add New Memory</h1>
              <p className="text-[#6b5b47]">Upload photos, videos, or write a story to add to your collection</p>
            </div>
            <div className="text-right">
              <Badge className={`${currentTier.color} text-white mb-2`}>
                {userData.tier === "premium" ? <Crown className="w-3 h-3 mr-1" /> : null}
                {currentTier.name} Plan
              </Badge>
              <div className="text-sm text-[#6b5b47]">
                <div>
                  Photos: {userData.usage.photoCount}/{currentTier.photoCount}
                </div>
                <div>
                  Video: {userData.usage.videoMinutes}/{currentTier.videoMinutes} min
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-[#e5d5c8] mb-6">
          <CardHeader>
            <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#c44c3a]" />
              Storage Usage
            </CardTitle>
            <CardDescription className="text-[#6b5b47]">
              Track your photo and video usage for this QR code experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[#2c2c2c]">Photos Used</Label>
                  <span className={`text-sm font-medium ${isPhotoLimitNear ? "text-orange-600" : "text-[#6b5b47]"}`}>
                    {userData.usage.photoCount} / {currentTier.photoCount}
                  </span>
                </div>
                <Progress
                  value={photoUsagePercent}
                  className={`h-2 ${isPhotoLimitNear ? "bg-orange-100" : "bg-gray-100"}`}
                />
                {isPhotoLimitReached && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Photo limit reached
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[#2c2c2c]">Video Used</Label>
                  <span className={`text-sm font-medium ${isVideoLimitNear ? "text-orange-600" : "text-[#6b5b47]"}`}>
                    {userData.usage.videoMinutes} / {currentTier.videoMinutes} min
                  </span>
                </div>
                <Progress
                  value={videoUsagePercent}
                  className={`h-2 ${isVideoLimitNear ? "bg-orange-100" : "bg-gray-100"}`}
                />
                {isVideoLimitReached && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Video limit reached
                  </p>
                )}
              </div>
            </div>

            {(isPhotoLimitNear || isVideoLimitNear) && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-purple-900">Approaching your storage limit?</h4>
                    <p className="text-sm text-purple-700">
                      You have {remainingPhotos} photos and {remainingVideoMinutes} minutes of video remaining
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {showUpgradePrompt && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  Upgrade Required
                </CardTitle>
                <CardDescription>You've reached your {uploadType} limit for this experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Premium Plan Benefits</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• 2 hours of video per experience</li>
                    <li>• 200 photos per experience</li>
                    <li>• Priority support</li>
                    <li>• Advanced customization</li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowUpgradePrompt(false)}
                    className="flex-1 border-[#e5d5c8]"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpgrade} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                    Upgrade for $15
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={uploadType} onValueChange={setUploadType} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-[#e5d5c8]">
            <TabsTrigger
              value="photo"
              className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white"
              disabled={isPhotoLimitReached}
            >
              <Camera className="w-4 h-4 mr-2" />
              Photos {isPhotoLimitReached && "(Limit Reached)"}
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white"
              disabled={isVideoLimitReached}
            >
              <Video className="w-4 h-4 mr-2" />
              Videos {isVideoLimitReached && "(Limit Reached)"}
            </TabsTrigger>
            <TabsTrigger value="story" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Story
            </TabsTrigger>
          </TabsList>

          {/* Photo Upload */}
          <TabsContent value="photo" className="space-y-6">
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">Upload Photos</CardTitle>
                <CardDescription className="text-[#6b5b47]">
                  Add photos to your memory collection ({remainingPhotos} of 200 photos remaining)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isPhotoLimitReached
                      ? "border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed"
                      : dragActive
                        ? "border-[#c44c3a] bg-[#c44c3a]/5"
                        : "border-[#e5d5c8] hover:border-[#c44c3a] hover:bg-[#f5f0e8]"
                  }`}
                  onDragEnter={!isPhotoLimitReached ? handleDrag : undefined}
                  onDragLeave={!isPhotoLimitReached ? handleDrag : undefined}
                  onDragOver={!isPhotoLimitReached ? handleDrag : undefined}
                  onDrop={!isPhotoLimitReached ? handleDrop : undefined}
                >
                  <Upload
                    className={`w-12 h-12 mx-auto mb-4 ${isPhotoLimitReached ? "text-gray-400" : "text-[#c44c3a]"}`}
                  />
                  <h3
                    className={`text-lg font-medium mb-2 ${isPhotoLimitReached ? "text-gray-500" : "text-[#2c2c2c]"}`}
                  >
                    {isPhotoLimitReached ? "Photo limit reached" : "Drag & drop photos here"}
                  </h3>
                  <p className={`mb-4 ${isPhotoLimitReached ? "text-gray-400" : "text-[#6b5b47]"}`}>
                    {isPhotoLimitReached ? "Upgrade to Premium to add more photos" : "or click to browse your files"}
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                    disabled={isPhotoLimitReached}
                  />
                  <Button
                    variant="outline"
                    className="border-[#e5d5c8] bg-transparent"
                    onClick={() => !isPhotoLimitReached && document.getElementById("photo-upload")?.click()}
                    disabled={isPhotoLimitReached}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isPhotoLimitReached ? "Limit Reached" : "Choose Photos"}
                  </Button>
                </div>

                {/* File Preview */}
                {files.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-[#2c2c2c]">Selected Files ({files.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {files.map((file, index) => (
                        <div key={index} className="relative bg-white border border-[#e5d5c8] rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <Camera className="w-8 h-8 text-[#c44c3a]" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#2c2c2c] truncate">{file.name}</p>
                              <p className="text-xs text-[#6b5b47]">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-100 hover:bg-red-200 text-red-600"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Memory Details Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-[#2c2c2c]">
                      Memory Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Family Fishing Trip"
                      className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-[#2c2c2c]">
                      Category
                    </Label>
                    <Select>
                      <SelectTrigger className="border-[#e5d5c8]">
                        <SelectValue placeholder="Choose category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fishing">Fishing</SelectItem>
                        <SelectItem value="hunting">Hunting</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="graduation">Graduation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-[#2c2c2c]">
                      Date
                    </Label>
                    <div className="relative">
                      <Input
                        id="date"
                        type="date"
                        className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a]"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b5b47] pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-[#2c2c2c]">
                      Location
                    </Label>
                    <div className="relative">
                      <Input
                        id="location"
                        placeholder="e.g., Lake Tahoe, CA"
                        className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] pl-10"
                      />
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b5b47]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#2c2c2c]">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Tell the story behind these photos..."
                    className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-[#2c2c2c]">
                    Tags
                  </Label>
                  <div className="relative">
                    <Input
                      id="tags"
                      placeholder="e.g., bass, lake, family, weekend"
                      className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] pl-10"
                    />
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b5b47]" />
                  </div>
                  <p className="text-xs text-[#6b5b47]">Separate tags with commas</p>
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1 bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Memory
                  </Button>
                  <Button variant="outline" className="border-[#e5d5c8] bg-transparent">
                    Save as Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Upload */}
          <TabsContent value="video" className="space-y-6">
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">Upload Videos</CardTitle>
                <CardDescription className="text-[#6b5b47]">
                  Add videos to capture your memories in motion ({remainingVideoMinutes} of 60 minutes remaining)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isVideoLimitReached
                      ? "border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed"
                      : "border-[#e5d5c8] hover:border-[#c44c3a] hover:bg-[#f5f0e8]"
                  }`}
                >
                  <Video
                    className={`w-12 h-12 mx-auto mb-4 ${isVideoLimitReached ? "text-gray-400" : "text-[#c44c3a]"}`}
                  />
                  <h3
                    className={`text-lg font-medium mb-2 ${isVideoLimitReached ? "text-gray-500" : "text-[#2c2c2c]"}`}
                  >
                    {isVideoLimitReached ? "Video limit reached" : "Upload Video Files"}
                  </h3>
                  <p className={`mb-4 ${isVideoLimitReached ? "text-gray-400" : "text-[#6b5b47]"}`}>
                    {isVideoLimitReached ? "Upgrade to Premium to add more videos" : "MP4, MOV, AVI files supported"}
                  </p>
                  <Button variant="outline" className="border-[#e5d5c8] bg-transparent" disabled={isVideoLimitReached}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isVideoLimitReached ? "Limit Reached" : "Choose Videos"}
                  </Button>
                </div>

                {/* Video-specific form fields would go here */}
                <div className="text-center text-[#6b5b47]">
                  <p>Video upload interface similar to photos...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Story Writing */}
          <TabsContent value="story" className="space-y-6">
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">Write a Story</CardTitle>
                <CardDescription className="text-[#6b5b47]">Share the story behind your memories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="story-title" className="text-[#2c2c2c]">
                    Story Title
                  </Label>
                  <Input
                    id="story-title"
                    placeholder="e.g., The Day I Caught My First Bass"
                    className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story-content" className="text-[#2c2c2c]">
                    Your Story
                  </Label>
                  <Textarea
                    id="story-content"
                    placeholder="Tell your story... What happened? Who was there? What made it special?"
                    className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] min-h-[300px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="story-date" className="text-[#2c2c2c]">
                      Date
                    </Label>
                    <Input
                      id="story-date"
                      type="date"
                      className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="story-location" className="text-[#2c2c2c]">
                      Location
                    </Label>
                    <Input
                      id="story-location"
                      placeholder="Where did this happen?"
                      className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a]"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1 bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Publish Story
                  </Button>
                  <Button variant="outline" className="border-[#e5d5c8] bg-transparent">
                    Save as Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
