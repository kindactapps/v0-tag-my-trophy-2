"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Mail, MessageSquare, Printer, X, CheckCircle, Heart, Star, Download } from "lucide-react"

interface EnhancedShareModalProps {
  isOpen: boolean
  onClose: () => void
  storyTitle: string
  storyUrl: string
  storyId: string
  ownerName: string
}

export default function EnhancedShareModal({
  isOpen,
  onClose,
  storyTitle,
  storyUrl,
  storyId,
  ownerName,
}: EnhancedShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [smsNumber, setSmsNumber] = useState("")
  const [customMessage, setCustomMessage] = useState("")

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storyUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const shareOptions = [
    {
      name: "Facebook",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyUrl)}&quote=${encodeURIComponent(`Check out this amazing memory story: ${storyTitle}`)}`,
      color: "bg-[#c44c3a] hover:bg-[#a63d2e]",
    },
    {
      name: "Twitter",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`✨ ${storyTitle} - A beautiful memory story on @TagMyTrophy`)}&url=${encodeURIComponent(storyUrl)}&hashtags=memories,stories,TagMyTrophy`,
      color: "bg-[#c44c3a] hover:bg-[#a63d2e]",
    },
    {
      name: "WhatsApp",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164a4.923 4.923 0 00-2.228-.616v.06a4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      url: `https://wa.me/?text=${encodeURIComponent(`🌟 Check out this beautiful memory story: ${storyTitle}\n\n${storyUrl}\n\nShared via Tag My Trophy`)}`,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      name: "LinkedIn",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(storyUrl)}`,
      color: "bg-[#c44c3a] hover:bg-[#a63d2e]",
    },
  ]

  const handleEmailShare = () => {
    const subject = `Check out this memory story: ${storyTitle}`
    const body = `Hi there!\n\nI wanted to share this beautiful memory story with you: ${storyTitle}\n\n${emailMessage || "I thought you might enjoy reading about these special moments."}\n\nView the story here: ${storyUrl}\n\nShared via Tag My Trophy - where memories live forever.`

    const recipients = emailRecipients
      .split(",")
      .map((email) => email.trim())
      .join(",")
    const mailtoUrl = `mailto:${recipients}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoUrl
  }

  const handleSMSShare = () => {
    const message = `${customMessage || `Check out this amazing memory story: ${storyTitle}`}\n\n${storyUrl}\n\nShared via Tag My Trophy`
    const smsUrl = `sms:${smsNumber}?body=${encodeURIComponent(message)}`
    window.location.href = smsUrl
  }

  const handlePrintFriendly = () => {
    const printUrl = `${storyUrl}?print=true`
    window.open(printUrl, "_blank")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-[#e5d5c8]">
          <h3 className="text-2xl font-bold text-[#2c2c2c]">Share This Story</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs defaultValue="social" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-[#f5f0e8] border border-[#e5d5c8]">
              <TabsTrigger value="social" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
                Social Media
              </TabsTrigger>
              <TabsTrigger value="direct" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
                Direct Share
              </TabsTrigger>
              <TabsTrigger value="print" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
                Print & Save
              </TabsTrigger>
              <TabsTrigger value="embed" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
                Embed
              </TabsTrigger>
            </TabsList>

            {/* Social Media Tab */}
            <TabsContent value="social" className="space-y-6">
              {/* Copy Link */}
              <Card className="border-[#e5d5c8]">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c] text-lg">Share Link</CardTitle>
                  <CardDescription className="text-[#6b5b47]">Copy and paste anywhere</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input value={storyUrl} readOnly className="flex-1 border-[#e5d5c8] bg-[#f5f0e8]" />
                    <Button
                      onClick={handleCopyLink}
                      className={`${copied ? "bg-green-600 hover:bg-green-700" : "bg-[#c44c3a] hover:bg-[#a63d2e]"} text-white`}
                    >
                      {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Social Platforms */}
              <Card className="border-[#e5d5c8]">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c] text-lg">Share on Social Media</CardTitle>
                  <CardDescription className="text-[#6b5b47]">Share with your network</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {shareOptions.map((option) => (
                      <a
                        key={option.name}
                        href={option.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${option.color} text-white p-4 rounded-lg flex items-center gap-3 transition-colors`}
                      >
                        {option.icon}
                        <span className="font-medium">Share on {option.name}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Direct Share Tab */}
            <TabsContent value="direct" className="space-y-6">
              {/* Email Share */}
              <Card className="border-[#e5d5c8]">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c] text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Share
                  </CardTitle>
                  <CardDescription className="text-[#6b5b47]">Send directly to email addresses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2c2c2c] mb-2">
                      Email Recipients (comma-separated)
                    </label>
                    <Input
                      value={emailRecipients}
                      onChange={(e) => setEmailRecipients(e.target.value)}
                      placeholder="friend@example.com, family@example.com"
                      className="border-[#e5d5c8]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2c2c2c] mb-2">Personal Message (Optional)</label>
                    <Textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      placeholder="Add a personal note about why you're sharing this story..."
                      className="border-[#e5d5c8] h-24"
                    />
                  </div>
                  <Button
                    onClick={handleEmailShare}
                    disabled={!emailRecipients.trim()}
                    className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </CardContent>
              </Card>

              {/* SMS Share */}
              <Card className="border-[#e5d5c8]">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c] text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    SMS Share
                  </CardTitle>
                  <CardDescription className="text-[#6b5b47]">Send via text message</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2c2c2c] mb-2">Phone Number</label>
                    <Input
                      value={smsNumber}
                      onChange={(e) => setSmsNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="border-[#e5d5c8]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2c2c2c] mb-2">Custom Message (Optional)</label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Add a personal message..."
                      className="border-[#e5d5c8] h-20"
                    />
                  </div>
                  <Button
                    onClick={handleSMSShare}
                    disabled={!smsNumber.trim()}
                    className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send SMS
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Print & Save Tab */}
            <TabsContent value="print" className="space-y-6">
              <Card className="border-[#e5d5c8]">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c] text-lg">Print & Save Options</CardTitle>
                  <CardDescription className="text-[#6b5b47]">
                    Create physical copies or save for offline
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handlePrintFriendly}
                    variant="outline"
                    className="w-full border-[#e5d5c8] bg-transparent"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print-Friendly Version
                  </Button>

                  <Button
                    onClick={() => window.open(`${storyUrl}?download=pdf`, "_blank")}
                    variant="outline"
                    className="w-full border-[#e5d5c8] bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download as PDF
                  </Button>

                  <div className="bg-[#f5f0e8] rounded-lg p-4">
                    <h4 className="font-medium text-[#2c2c2c] mb-2">Print Tips:</h4>
                    <ul className="text-sm text-[#6b5b47] space-y-1">
                      <li>• Use landscape orientation for best results</li>
                      <li>• High-quality photos print better on photo paper</li>
                      <li>• Consider creating a memory book</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Embed Tab */}
            <TabsContent value="embed" className="space-y-6">
              <Card className="border-[#e5d5c8]">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c] text-lg">Embed Story</CardTitle>
                  <CardDescription className="text-[#6b5b47]">Add this story to your website or blog</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2c2c2c] mb-2">Embed Code</label>
                    <Textarea
                      value={`<iframe src="${storyUrl}?embed=true" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`}
                      readOnly
                      className="border-[#e5d5c8] bg-[#f5f0e8] font-mono text-sm h-24"
                    />
                  </div>

                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `<iframe src="${storyUrl}?embed=true" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`,
                      )
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Embed Code
                  </Button>

                  <div className="bg-[#f5f0e8] rounded-lg p-4">
                    <h4 className="font-medium text-[#2c2c2c] mb-2">Embed Features:</h4>
                    <ul className="text-sm text-[#6b5b47] space-y-1">
                      <li>• Responsive design adapts to any screen</li>
                      <li>• Maintains Tag My Trophy branding</li>
                      <li>• Links back to full story page</li>
                      <li>• Updates automatically when story changes</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Story Preview */}
          <Card className="border-[#e5d5c8] mt-6">
            <CardHeader>
              <CardTitle className="text-[#2c2c2c] text-lg">Story Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#f5f0e8] rounded-lg p-4 border border-[#e5d5c8]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#c44c3a] rounded-full flex items-center justify-center text-white font-medium">
                    {ownerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-[#2c2c2c]">{storyTitle}</h4>
                    <p className="text-sm text-[#6b5b47]">by {ownerName}</p>
                  </div>
                </div>
                <p className="text-sm text-[#6b5b47]">
                  A beautiful collection of memories and moments, shared through Tag My Trophy.
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-[#6b5b47]">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Memory Story
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Tag My Trophy
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
