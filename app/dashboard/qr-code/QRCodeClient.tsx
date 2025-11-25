"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import {
  ArrowLeft,
  Download,
  Share2,
  Copy,
  CheckCircle,
  Printer,
  Smartphone,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  Camera,
} from "lucide-react"
import QRScanner from "@/components/qr-scanner"
import QRGenerator from "@/components/qr-generator"

// Mock QR code data
const mockQRCodes = [
  {
    id: 1,
    slug: "mountain-sunrise-7x9k",
    url: "tagmytrophy.com/story/mountain-sunrise-7x9k",
    status: "active",
    scans: 42,
    lastScan: "2 hours ago",
    created: "2024-01-15",
  },
]

const mockQRStats = {
  totalScans: 42,
  uniqueVisitors: 28,
  topLocation: "Denver, CO",
  peakTime: "2:00 PM",
}

export default function QRCodeClient() {
  const [selectedSize, setSelectedSize] = useState("medium")
  const [selectedFormat, setSelectedFormat] = useState("png")
  const [copied, setCopied] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(`https://${url}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadQR = async (format: string, size: string) => {
    setIsDownloading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log(`Downloading QR code: ${format} - ${size}`)

      const successMessage = `QR code downloaded successfully as ${format.toUpperCase()}`
      console.log(successMessage)
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleScanSuccess = (result: string) => {
    console.log("[v0] QR scan successful:", result)
    setScanResult(result)
    setShowScanner(false)

    const urlMatch = result.match(/\/story\/([^/?]+)/)
    if (urlMatch) {
      const slug = urlMatch[1]
      window.open(`/story/${slug}`, "_blank")
    }
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
          <h1 className="text-2xl font-bold text-[#2c2c2c]">QR Code Manager</h1>
          <p className="text-[#6b5b47]">Download, share, and track your story QR codes</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-[#e5d5c8]">
            <TabsTrigger value="current" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
              Current QR Code
            </TabsTrigger>
            <TabsTrigger value="scanner" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
              QR Scanner
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
              Scan Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
              QR Settings
            </TabsTrigger>
          </TabsList>

          {/* Current QR Code Tab */}
          <TabsContent value="current" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* QR Code Display with Generator */}
              <Card className="border-[#e5d5c8]">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c]">Your Story QR Code</CardTitle>
                  <CardDescription className="text-[#6b5b47]">Customize and download your QR code</CardDescription>
                </CardHeader>
                <CardContent>
                  <QRGenerator
                    url={`https://${mockQRCodes[0].url}`}
                    onDownload={(dataUrl, format) => {
                      console.log("[v0] QR code downloaded:", format)
                    }}
                  />
                </CardContent>
              </Card>

              {/* Download Options */}
              <Card className="border-[#e5d5c8]">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c]">Download Options</CardTitle>
                  <CardDescription className="text-[#6b5b47]">Choose format and size for your QR code</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Size Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#2c2c2c]">Size</label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger className="border-[#e5d5c8]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (1" x 1")</SelectItem>
                        <SelectItem value="medium">Medium (1.5" x 1.5")</SelectItem>
                        <SelectItem value="large">Large (2" x 2")</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Format Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#2c2c2c]">Format</label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger className="border-[#e5d5c8]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG (High Resolution)</SelectItem>
                        <SelectItem value="svg">SVG (Scalable)</SelectItem>
                        <SelectItem value="pdf">PDF (Print Ready)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Download Buttons */}
                  <div className="space-y-3 pt-4">
                    <Button
                      className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
                      onClick={() => handleDownloadQR(selectedFormat, selectedSize)}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Preparing Download...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download QR Code
                        </>
                      )}
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="border-[#e5d5c8] bg-transparent">
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                      <Button variant="outline" className="border-[#e5d5c8] bg-transparent">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Usage Tips */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <h4 className="font-medium text-blue-900 mb-2">Usage Tips:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Use PNG for digital displays</li>
                      <li>• Use SVG for scalable graphics</li>
                      <li>• Use PDF for professional printing</li>
                      <li>• Test scan before final use</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-[#e5d5c8]">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#c44c3a]">{mockQRStats.totalScans}</div>
                  <div className="text-sm text-[#6b5b47]">Total Scans</div>
                </CardContent>
              </Card>
              <Card className="border-[#e5d5c8]">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#c44c3a]">{mockQRStats.uniqueVisitors}</div>
                  <div className="text-sm text-[#6b5b47]">Unique Visitors</div>
                </CardContent>
              </Card>
              <Card className="border-[#e5d5c8]">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#c44c3a]">{mockQRStats.topLocation}</div>
                  <div className="text-sm text-[#6b5b47]">Top Location</div>
                </CardContent>
              </Card>
              <Card className="border-[#e5d5c8]">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#c44c3a]">{mockQRStats.peakTime}</div>
                  <div className="text-sm text-[#6b5b47]">Peak Time</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* QR Scanner Tab */}
          <TabsContent value="scanner" className="space-y-6">
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">QR Code Scanner</CardTitle>
                <CardDescription className="text-[#6b5b47]">
                  Scan Tag My Trophy QR codes to view stories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setShowScanner(true)}
                  className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera Scanner
                </Button>

                {scanResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">Scan Successful!</span>
                    </div>
                    <p className="text-sm text-green-800">
                      Found: <code className="bg-green-100 px-2 py-1 rounded">{scanResult}</code>
                    </p>
                  </div>
                )}

                <div className="bg-[#f5f0e8] rounded-lg p-4">
                  <h4 className="font-medium text-[#2c2c2c] mb-2">Scanner Features:</h4>
                  <ul className="text-sm text-[#6b5b47] space-y-1">
                    <li>• Automatic QR code detection</li>
                    <li>• Works with damaged or partially visible codes</li>
                    <li>• Instant story page access</li>
                    <li>• Manual URL entry option</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-[#e5d5c8]">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c]">Scan Activity</CardTitle>
                  <CardDescription className="text-[#6b5b47]">Track when your QR code is being scanned</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-[#f5f0e8] rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-[#c44c3a] mx-auto mb-2" />
                      <p className="text-[#6b5b47]">Scan activity chart would appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#e5d5c8]">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c]">Geographic Data</CardTitle>
                  <CardDescription className="text-[#6b5b47]">Where your QR codes are being scanned</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-[#f5f0e8] rounded-lg">
                      <span className="text-[#2c2c2c]">Denver, CO</span>
                      <Badge className="bg-[#c44c3a] text-white">18 scans</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#f5f0e8] rounded-lg">
                      <span className="text-[#2c2c2c]">Boulder, CO</span>
                      <Badge className="bg-[#8b7355] text-white">12 scans</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#f5f0e8] rounded-lg">
                      <span className="text-[#2c2c2c]">Fort Collins, CO</span>
                      <Badge className="bg-[#6b5b47] text-white">8 scans</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#f5f0e8] rounded-lg">
                      <span className="text-[#2c2c2c]">Colorado Springs, CO</span>
                      <Badge className="bg-[#2c2c2c] text-white">4 scans</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Scans */}
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">Recent Scans</CardTitle>
                <CardDescription className="text-[#6b5b47]">Latest QR code scan activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: "2 hours ago", location: "Denver, CO", device: "iPhone" },
                    { time: "5 hours ago", location: "Boulder, CO", device: "Android" },
                    { time: "1 day ago", location: "Fort Collins, CO", device: "iPhone" },
                    { time: "2 days ago", location: "Denver, CO", device: "Android" },
                  ].map((scan, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-[#f5f0e8] rounded-lg">
                      <div className="w-10 h-10 bg-[#c44c3a] rounded-full flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[#2c2c2c]">Scanned from {scan.location}</p>
                        <p className="text-sm text-[#6b5b47]">
                          {scan.time} • {scan.device}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-[#e5d5c8]">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c]">QR Code Settings</CardTitle>
                  <CardDescription className="text-[#6b5b47]">Manage your QR code configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#2c2c2c]">Current Slug</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-[#2c2c2c] bg-[#f5f0e8] px-3 py-2 rounded border">
                        mountain-sunrise-7x9k
                      </code>
                      <Button variant="outline" size="sm" className="border-[#e5d5c8] bg-transparent">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-900">Important Note</h4>
                        <p className="text-sm text-amber-800 mt-1">
                          Your QR code slug cannot be changed once created. This ensures all printed QR codes remain
                          functional.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate QR Code
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-[#e5d5c8]">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c]">Physical Tag Support</CardTitle>
                  <CardDescription className="text-[#6b5b47]">Manage your physical QR code tags</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full border-[#e5d5c8] justify-start bg-transparent">
                      <Printer className="w-4 h-4 mr-2" />
                      Order Replacement Tags
                    </Button>

                    <Button variant="outline" className="w-full border-[#e5d5c8] justify-start bg-transparent">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Report Damaged Tag
                    </Button>

                    <Button variant="outline" className="w-full border-[#e5d5c8] justify-start bg-transparent">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Transfer to New Tag
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Tag Care Tips:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Keep tags clean and dry</li>
                      <li>• Avoid scratching the QR code</li>
                      <li>• Test scan regularly</li>
                      <li>• Replace if damaged</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <QRScanner isOpen={showScanner} onClose={() => setShowScanner(false)} onScanSuccess={handleScanSuccess} />
    </div>
  )
}
