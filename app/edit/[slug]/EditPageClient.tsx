"use client"
import { useState, useEffect } from "react"
import MemoryGallery from "@/components/memory-gallery"
import EditModeOverlay from "@/components/edit-mode-overlay"
import ProfileCustomizer from "@/components/profile-customizer"
import LivePreviewModal from "@/components/live-preview-modal"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EditPageClientProps {
  story: any
  slug: string
}

export default function EditPageClient({ story, slug }: EditPageClientProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [storyData, setStoryData] = useState(story)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(() => {
        // Simulate auto-save
        setHasUnsavedChanges(false)
        setLastSaved(new Date())
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [hasUnsavedChanges])

  const handleStoryUpdate = (updatedStory: any) => {
    setStoryData(updatedStory)
    setHasUnsavedChanges(true)
  }

  const handleProfileUpdate = (profileUpdates: any) => {
    setStoryData({
      ...storyData,
      owner: { ...storyData.owner, ...profileUpdates },
    })
    setHasUnsavedChanges(true)
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Toggle Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/story/${slug}`}
                className="inline-flex items-center gap-2 text-[#2c2c2c] hover:text-[#c44c3a] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Story
              </Link>

              {/* Mode Toggle */}
              <div className="relative bg-gray-100 rounded-full p-1 flex">
                <button
                  onClick={() => setIsEditMode(false)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    !isEditMode ? "bg-white text-[#2c2c2c] shadow-sm" : "text-[#2c2c2c]/60 hover:text-[#2c2c2c]"
                  }`}
                >
                  Public View
                </button>
                <button
                  onClick={() => setIsEditMode(true)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    isEditMode ? "bg-[#c44c3a] text-white shadow-sm" : "text-[#2c2c2c]/60 hover:text-[#2c2c2c]"
                  }`}
                >
                  Edit Mode
                </button>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-3 text-sm">
                {hasUnsavedChanges && (
                  <span className="text-[#c44c3a] flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#c44c3a] rounded-full animate-pulse"></div>
                    Saving...
                  </span>
                )}
                {lastSaved && !hasUnsavedChanges && (
                  <span className="text-green-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowCustomizer(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
                Customize
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Preview
              </Button>
              <Button size="sm" className="bg-[#c44c3a] hover:bg-[#a63d2e]">
                Publish Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Hint */}
      {!isEditMode && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-4 py-2">
            <p className="text-sm text-blue-700 text-center">This is how your story appears to others</p>
          </div>
        </div>
      )}

      {!isEditMode ? (
        // Public View Content
        <div>
          {/* Header Section */}
          <div className="bg-gradient-to-b from-[#2c2c2c] to-[#2c2c2c]/90 text-white">
            <div className="container mx-auto px-4 py-12">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-white/10 flex-shrink-0 relative">
                    <img
                      src={storyData.owner.avatar || "/placeholder.svg"}
                      alt={storyData.owner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">{storyData.owner.name}</h1>
                    <p className="text-xl text-white/80 mb-4 max-w-2xl">{storyData.owner.bio}</p>
                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-white/60">
                      <span>Created {storyData.owner.createdAt}</span>
                      <span className="hidden sm:block">•</span>
                      <span>{storyData.viewCount} people have shared in this story</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Gallery */}
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
              <MemoryGallery memories={storyData.memories} />
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode Content
        <EditModeOverlay story={storyData} onStoryUpdate={handleStoryUpdate} />
      )}

      {/* Floating Switch Button (Public View) */}
      {!isEditMode && (
        <button
          onClick={() => setIsEditMode(true)}
          className="fixed bottom-6 right-6 bg-[#c44c3a] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#a63d2e] transition-colors text-sm font-medium z-40"
        >
          Switch to Edit Mode
        </button>
      )}

      {/* Profile Customizer Modal */}
      <ProfileCustomizer
        profile={storyData.owner}
        onProfileUpdate={handleProfileUpdate}
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
      />

      {/* Live Preview Modal */}
      <LivePreviewModal story={storyData} isOpen={showPreview} onClose={() => setShowPreview(false)} slug={slug} />
    </div>
  )
}
