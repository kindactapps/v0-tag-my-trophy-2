"use client"
import MemoryGallery from "@/components/memory-gallery"
import Link from "next/link"
import Navigation from "@/components/navigation"

import EnhancedShareModal from "@/components/enhanced-share-modal"
import GuestComments from "@/components/guest-comments"
import { useState } from "react"
import BackButton from "@/components/back-button"
import { Button } from "@/components/ui/button"
import type { Story } from "@/types"

interface StoryPageClientProps {
  story: Story | { claimed: false; id: string }
  slug: string
}

export default function StoryPageClient({ story, slug }: StoryPageClientProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false)

  if (!story.claimed) {
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="w-24 h-24 bg-[#c44c3a] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-[#2c2c2c]">This Memory Collection is Waiting to be Claimed</h1>
              <p className="text-[#6b5b47] text-lg">
                Someone purchased this QR tag but hasn't set it up yet. Once claimed, their story will appear here.
              </p>
            </div>

            <div className="bg-white border border-[#e5d5c8] rounded-lg p-6 text-left">
              <h2 className="font-semibold text-[#2c2c2c] mb-3">Is this your QR tag?</h2>
              <p className="text-[#6b5b47] mb-4">
                Click below to claim this tag and start creating your memory collection. You'll be able to upload
                photos, add stories, and share your moments with anyone who scans this code.
              </p>
              <Button asChild className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                <Link href={`/claim/${slug}`}>Claim This Tag</Link>
              </Button>
            </div>

            <div className="text-sm text-[#6b5b47]">
              Don't have a tag yet?{" "}
              <Link href="/checkout" className="text-[#c44c3a] hover:underline font-medium">
                Get your own QR memory tag
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const storyData = story as Story

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navigation />

      <div className="container mx-auto px-4 pt-6">
        <BackButton href="/" text="Back to Home" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Owner Profile Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-[#e5d5c8] p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <img
                src={storyData.owner.avatar || "/placeholder.svg"}
                alt={storyData.owner.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#c44c3a]"
              />
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-[#2c2c2c] mb-2">{storyData.owner.name}</h1>
                <p className="text-[#6b5b47] mb-3">{storyData.owner.bio}</p>
                <div className="flex flex-wrap gap-4 text-sm text-[#6b5b47]">
                  <span>{storyData.owner.createdAt}</span>
                  <span>•</span>
                  <span>{storyData.viewCount} views</span>
                  {storyData.memories && <span>• {storyData.memories.length} memories</span>}
                </div>
              </div>
              <Button onClick={() => setShareModalOpen(true)} className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                Share Story
              </Button>
            </div>

            {/* Custom Fields */}
            {storyData.customFields && storyData.customFields.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[#e5d5c8]">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {storyData.customFields.map((field) => (
                    <div key={field.id}>
                      <p className="text-xs text-[#6b5b47] mb-1">{field.field_label}</p>
                      <p className="font-medium text-[#2c2c2c]">{field.field_value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Memory Gallery */}
        {storyData.memories && storyData.memories.length > 0 ? (
          <MemoryGallery memories={storyData.memories} />
        ) : (
          <div className="max-w-4xl mx-auto text-center py-16">
            <p className="text-[#6b5b47] text-lg">No memories added yet. Check back soon!</p>
          </div>
        )}

        {/* Guest Comments */}
        {storyData.allowComments && (
          <div className="max-w-4xl mx-auto mt-12">
            <GuestComments storyId={storyData.id} />
          </div>
        )}
      </div>

      <EnhancedShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        storyUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/story/${slug}`}
        storyTitle={storyData.owner.name}
      />
    </div>
  )
}
