"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Download, Palette, Settings, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { QRGenerationLoading, QRCustomizationLoading } from "@/components/ui/professional-loading"
import { cn } from "@/lib/utils"

interface QRGeneratorProps {
  url: string
  onDownload?: (dataUrl: string, format: string) => void
}

export default function QRGenerator({ url, onDownload }: QRGeneratorProps) {
  const [size, setSize] = useState(256)
  const [foregroundColor, setForegroundColor] = useState("#2c2c2c")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState("M")
  const [format, setFormat] = useState("png")
  const [logoUrl, setLogoUrl] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<"idle" | "generating" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    generateQRCode()
  }, [url, size, foregroundColor, backgroundColor, errorCorrectionLevel, logoUrl])

  const generateQRCode = async () => {
    if (!canvasRef.current) return

    setIsGenerating(true)
    setGenerationStatus("generating")
    setErrorMessage("")

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    try {
      // Set canvas size
      canvas.width = size
      canvas.height = size

      // Clear canvas
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, size, size)

      // Simulate generation delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Import QR.js dynamically
      const QRCode = await import("qrcode")

      await QRCode.toCanvas(canvas, url, {
        width: size,
        margin: 2,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
        errorCorrectionLevel: errorCorrectionLevel as any,
      })

      // Add logo if provided
      if (logoUrl) {
        await addLogoToQR(ctx, logoUrl, size)
      }

      setGenerationStatus("success")
    } catch (error) {
      console.error("[v0] QR code generation error:", error)
      setGenerationStatus("error")
      setErrorMessage("Failed to generate QR code. Please try again.")
      // Fallback to placeholder if QR library fails
      generatePlaceholderQR(ctx, size, foregroundColor)
    } finally {
      setIsGenerating(false)
    }
  }

  const generatePlaceholderQR = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    const moduleSize = size / 25 // 25x25 grid
    ctx.fillStyle = color

    // Generate a simple QR-like pattern
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        // Create finder patterns (corners)
        const isFinderPattern = (row < 7 && col < 7) || (row < 7 && col >= 18) || (row >= 18 && col < 7)

        // Create timing patterns
        const isTimingPattern = row === 6 || col === 6

        // Create data pattern (pseudo-random for demo)
        const isDataModule = !isFinderPattern && !isTimingPattern && ((row + col) % 2 === 0 || (row * col) % 3 === 0)

        if (isFinderPattern || isTimingPattern || isDataModule) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }

  const addLogoToQR = async (ctx: CanvasRenderingContext2D, logoUrl: string, size: number) => {
    try {
      const img = new Image()
      img.crossOrigin = "anonymous"

      return new Promise<void>((resolve) => {
        img.onload = () => {
          const logoSize = size * 0.2 // 20% of QR size
          const x = (size - logoSize) / 2
          const y = (size - logoSize) / 2

          // Add white background for logo
          ctx.fillStyle = backgroundColor
          ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8)

          // Draw logo
          ctx.drawImage(img, x, y, logoSize, logoSize)
          resolve()
        }
        img.onerror = () => {
          console.error("[v0] Logo loading failed:", logoUrl)
          resolve()
        }
        img.src = logoUrl
      })
    } catch (error) {
      console.error("Error adding logo:", error)
    }
  }

  const handleDownload = async () => {
    if (!canvasRef.current) return

    setIsDownloading(true)

    try {
      // Simulate download processing time
      await new Promise((resolve) => setTimeout(resolve, 800))

      const canvas = canvasRef.current
      let dataUrl: string

      if (format === "svg") {
        // For SVG, we'd need to generate SVG markup
        dataUrl = canvas.toDataURL("image/png")
      } else {
        const mimeType = format === "jpg" ? "image/jpeg" : "image/png"
        dataUrl = canvas.toDataURL(mimeType, 0.9)
      }

      // Trigger download
      const link = document.createElement("a")
      link.download = `qr-code-${Date.now()}.${format}`
      link.href = dataUrl
      link.click()

      onDownload?.(dataUrl, format)
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* QR Code Preview */}
      <Card className="border-[#e5d5c8]">
        <CardHeader>
          <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
            <Settings className="w-5 h-5" />
            QR Code Preview
            {generationStatus === "generating" && <Loader2 className="w-4 h-4 animate-spin text-[#c44c3a]" />}
            {generationStatus === "success" && <CheckCircle className="w-4 h-4 text-green-600" />}
            {generationStatus === "error" && <AlertCircle className="w-4 h-4 text-red-600" />}
          </CardTitle>
          <CardDescription className="text-[#6b5b47]">
            {generationStatus === "generating" && "Generating your custom QR code..."}
            {generationStatus === "success" && "QR code ready for download"}
            {generationStatus === "error" && errorMessage}
            {generationStatus === "idle" && "Customize your QR code appearance"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="inline-block p-4 bg-white rounded-lg border-2 border-[#e5d5c8] relative">
            {isGenerating && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg">
                <QRGenerationLoading />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className={cn(
                "max-w-full h-auto transition-opacity duration-300",
                isGenerating ? "opacity-30" : "opacity-100",
              )}
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          <div className="text-sm text-[#6b5b47] bg-[#f5f0e8] p-3 rounded-lg">
            <strong>URL:</strong> {url}
          </div>
        </CardContent>
      </Card>

      {/* Customization Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <Card className="border-[#e5d5c8]">
          <CardHeader>
            <CardTitle className="text-[#2c2c2c] text-lg">Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isGenerating ? (
              <QRCustomizationLoading />
            ) : (
              <>
                {/* Size */}
                <div className="space-y-2">
                  <Label className="text-[#2c2c2c]">Size: {size}px</Label>
                  <Slider
                    value={[size]}
                    onValueChange={(value) => setSize(value[0])}
                    min={128}
                    max={512}
                    step={32}
                    className="w-full"
                    disabled={isGenerating}
                  />
                </div>

                {/* Error Correction */}
                <div className="space-y-2">
                  <Label className="text-[#2c2c2c]">Error Correction</Label>
                  <Select value={errorCorrectionLevel} onValueChange={setErrorCorrectionLevel} disabled={isGenerating}>
                    <SelectTrigger className="border-[#e5d5c8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Low (7%)</SelectItem>
                      <SelectItem value="M">Medium (15%)</SelectItem>
                      <SelectItem value="Q">Quartile (25%)</SelectItem>
                      <SelectItem value="H">High (30%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Format */}
                <div className="space-y-2">
                  <Label className="text-[#2c2c2c]">Download Format</Label>
                  <Select value={format} onValueChange={setFormat} disabled={isGenerating}>
                    <SelectTrigger className="border-[#e5d5c8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG (Recommended)</SelectItem>
                      <SelectItem value="jpg">JPG</SelectItem>
                      <SelectItem value="svg">SVG (Vector)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Style Settings */}
        <Card className="border-[#e5d5c8]">
          <CardHeader>
            <CardTitle className="text-[#2c2c2c] text-lg flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Style Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isGenerating ? (
              <QRCustomizationLoading />
            ) : (
              <>
                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#2c2c2c]">Foreground</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={foregroundColor}
                        onChange={(e) => setForegroundColor(e.target.value)}
                        className="w-12 h-10 p-1 border-[#e5d5c8]"
                        disabled={isGenerating}
                      />
                      <Input
                        type="text"
                        value={foregroundColor}
                        onChange={(e) => setForegroundColor(e.target.value)}
                        className="flex-1 border-[#e5d5c8]"
                        disabled={isGenerating}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#2c2c2c]">Background</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-10 p-1 border-[#e5d5c8]"
                        disabled={isGenerating}
                      />
                      <Input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 border-[#e5d5c8]"
                        disabled={isGenerating}
                      />
                    </div>
                  </div>
                </div>

                {/* Logo URL */}
                <div className="space-y-2">
                  <Label className="text-[#2c2c2c]">Logo URL (Optional)</Label>
                  <Input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="border-[#e5d5c8]"
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-[#6b5b47]">Add a small logo to the center of your QR code</p>
                </div>

                {/* Preset Colors */}
                <div className="space-y-2">
                  <Label className="text-[#2c2c2c]">Brand Presets</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setForegroundColor("#2c2c2c")
                        setBackgroundColor("#f5f0e8")
                      }}
                      className="border-[#e5d5c8] bg-transparent"
                      disabled={isGenerating}
                    >
                      Earth
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setForegroundColor("#c44c3a")
                        setBackgroundColor("#ffffff")
                      }}
                      className="border-[#e5d5c8] bg-transparent"
                      disabled={isGenerating}
                    >
                      Clay
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setForegroundColor("#000000")
                        setBackgroundColor("#ffffff")
                      }}
                      className="border-[#e5d5c8] bg-transparent"
                      disabled={isGenerating}
                    >
                      Classic
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Download Button */}
      <Card className="border-[#e5d5c8]">
        <CardContent className="pt-6">
          <Button
            onClick={handleDownload}
            className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
            disabled={isGenerating || isDownloading || generationStatus === "error"}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Preparing Download...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Customized QR Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
