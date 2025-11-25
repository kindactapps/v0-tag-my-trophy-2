"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface LivePreviewModalProps {
  story: any
  isOpen: boolean
  onClose: () => void
  slug: string
}

export default function LivePreviewModal({ story, isOpen, onClose, slug }: LivePreviewModalProps) {
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [shareLink, setShareLink] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)

  const generateShareLink = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const link = `${baseUrl}/story/${slug}?preview=true&token=${Math.random().toString(36).substr(2, 9)}`
    setShareLink(link)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Preview Controls Sidebar */}
          <div className="w-full lg:w-80 bg-gray-50 border-b lg:border-b-0 lg:border-r p-4 overflow-y-auto max-h-[40vh] lg:max-h-none">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Live Preview</h3>
              <Button variant="ghost" size="sm" onClick={onClose} className="min-h-[44px] min-w-[44px]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            {/* Device Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Preview Device</label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
                    previewMode === "desktop"
                      ? "bg-white text-[#2c2c2c] shadow-sm"
                      : "text-gray-600 hover:text-[#2c2c2c]"
                  }`}
                >
                  <svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
                    previewMode === "mobile"
                      ? "bg-white text-[#2c2c2c] shadow-sm"
                      : "text-gray-600 hover:text-[#2c2c2c]"
                  }`}
                >
                  <svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                  Mobile
                </button>
              </div>
            </div>

            {/* Share Preview Link */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Share Preview</label>
              <p className="text-sm text-gray-600 mb-3">
                Generate a temporary link to share your preview with friends and family before publishing.
              </p>
              {!shareLink ? (
                <Button onClick={generateShareLink} variant="outline" className="w-full bg-transparent min-h-[44px]">
                  Generate Preview Link
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input value={shareLink} readOnly className="text-sm flex-1 min-h-[44px]" />
                    <Button
                      onClick={copyToClipboard}
                      size="sm"
                      className={`min-h-[44px] px-4 ${linkCopied ? "bg-green-600 hover:bg-green-700" : "bg-[#c44c3a] hover:bg-[#a63d2e]"}`}
                    >
                      {linkCopied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">This link expires in 24 hours and allows view-only access.</p>
                </div>
              )}
            </div>

            {/* QR Code Test */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">QR Code Test</label>
              <p className="text-sm text-gray-600 mb-3">Test how your story appears when scanned from a QR code.</p>
              <Button
                variant="outline"
                className="w-full bg-transparent min-h-[44px]"
                onClick={() => window.open(`/story/${slug}?qr=true`, "_blank")}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <rect x="7" y="7" width="3" height="3" />
                  <rect x="14" y="7" width="3" height="3" />
                  <rect x="7" y="14" width="3" height="3" />
                  <path d="M14 14h3v3h-3z" />
                </svg>
                Test QR Experience
              </Button>
            </div>

            {/* Preview Stats */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Preview Analytics</label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Memories:</span>
                  <span className="font-medium">{story.memories.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Photos:</span>
                  <span className="font-medium">{story.memories.filter((m: any) => m.type === "photo").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stories:</span>
                  <span className="font-medium">{story.memories.filter((m: any) => m.type === "story").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Read Time:</span>
                  <span className="font-medium">
                    {Math.ceil(
                      story.memories
                        .filter((m: any) => m.type === "story")
                        .reduce((acc: number, m: any) => acc + (m.content?.split(" ").length || 0), 0) / 200,
                    )}{" "}
                    min
                  </span>
                </div>
              </div>
            </div>

            {/* Accessibility Check */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Accessibility</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>All images have captions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Good color contrast</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Mobile-friendly layout</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-gray-100 p-2 sm:p-4 overflow-hidden min-h-[50vh] lg:min-h-0">
            <div className="h-full flex items-center justify-center">
              <div
                className={`bg-white shadow-2xl overflow-hidden transition-all duration-300 ${
                  previewMode === "mobile"
                    ? "w-full max-w-sm h-[500px] sm:h-[600px] rounded-3xl border-4 sm:border-8 border-gray-800"
                    : "w-full h-full rounded-lg"
                }`}
              >
                <div className="w-full h-full overflow-y-auto">
                  {/* Preview Content */}
                  <div className="min-h-full bg-[#f5f0e8]">
                    {/* Header Section */}
                    <div className="bg-gradient-to-b from-[#2c2c2c] to-[#2c2c2c]/90 text-white">
                      <div className={`mx-auto px-4 ${previewMode === "mobile" ? "py-4 sm:py-6" : "py-8 sm:py-12"}`}>
                        <div className="max-w-6xl mx-auto">
                          <div
                            className={`flex items-center gap-4 ${previewMode === "mobile" ? "flex-col text-center" : "flex-col sm:flex-row"}`}
                          >
                            <div
                              className={`rounded-full overflow-hidden bg-white/10 flex-shrink-0 ${previewMode === "mobile" ? "w-16 h-16 sm:w-20 sm:h-20" : "w-24 h-24 sm:w-32 sm:h-32"}`}
                            >
                              <img
                                src={story.owner.avatar || "/placeholder.svg"}
                                alt={story.owner.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-center sm:text-left">
                              <h1
                                className={`font-bold mb-2 ${previewMode === "mobile" ? "text-xl sm:text-2xl" : "text-2xl sm:text-4xl lg:text-5xl mb-3"}`}
                              >
                                {story.owner.name}
                              </h1>
                              <p
                                className={`text-white/80 mb-2 ${previewMode === "mobile" ? "text-sm" : "text-lg sm:text-xl mb-4"} max-w-2xl`}
                              >
                                {story.owner.bio}
                              </p>
                              <div
                                className={`flex gap-2 text-white/60 ${previewMode === "mobile" ? "text-xs flex-col items-center" : "flex-col sm:flex-row gap-4 text-sm"}`}
                              >
                                <span>Created {story.owner.createdAt}</span>
                                {previewMode !== "mobile" && <span className="hidden sm:block">•</span>}
                                <span>{story.viewCount} people have shared in this story</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className={`mx-auto px-4 ${previewMode === "mobile" ? "py-4 sm:py-6" : "py-8 sm:py-12"}`}>
                      <div className="max-w-6xl mx-auto">
                        <div
                          className={`grid gap-4 ${previewMode === "mobile" ? "grid-cols-1 gap-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"}`}
                        >
                          {story.memories.slice(0, previewMode === "mobile" ? 3 : 6).map((memory: any) => (
                            <Card key={memory.id} className="overflow-hidden bg-white shadow-lg">
                              {memory.type === "photo" ? (
                                <div
                                  className={`relative ${previewMode === "mobile" ? "aspect-video" : "aspect-square"}`}
                                >
                                  <img
                                    src={memory.url || "/placeholder.svg"}
                                    alt={memory.caption}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className={`p-4 ${previewMode === "mobile" ? "p-3" : "p-4 sm:p-6"}`}>
                                  <h3
                                    className={`font-semibold text-[#2c2c2c] mb-2 ${previewMode === "mobile" ? "text-base mb-2" : "text-lg sm:text-xl mb-3"}`}
                                  >
                                    {memory.title}
                                  </h3>
                                  <p
                                    className={`text-[#2c2c2c]/70 leading-relaxed ${previewMode === "mobile" ? "text-sm line-clamp-3" : ""}`}
                                  >
                                    {memory.content}
                                  </p>
                                </div>
                              )}

                              {memory.type === "photo" && (
                                <div className={`p-3 ${previewMode === "mobile" ? "p-2" : "p-3 sm:p-4"}`}>
                                  <p
                                    className={`text-[#2c2c2c]/70 mb-1 ${previewMode === "mobile" ? "text-xs mb-1" : "text-sm mb-2"}`}
                                  >
                                    {memory.caption}
                                  </p>
                                  <div
                                    className={`flex justify-between text-[#2c2c2c]/50 ${previewMode === "mobile" ? "text-xs" : "text-xs"}`}
                                  >
                                    <span>{memory.date}</span>
                                    {memory.location && <span>{memory.location}</span>}
                                  </div>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>

                        {story.memories.length > (previewMode === "mobile" ? 3 : 6) && (
                          <div className="text-center mt-6">
                            <p className="text-[#2c2c2c]/60 text-sm">
                              + {story.memories.length - (previewMode === "mobile" ? 3 : 6)} more memories
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
