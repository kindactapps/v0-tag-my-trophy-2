"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, X, AlertCircle, Loader2, RotateCcw, Flashlight, FlashlightOff } from "lucide-react"

interface QRScannerProps {
  onScanSuccess: (result: string) => void
  onClose: () => void
  isOpen: boolean
}

export default function QRScanner({ onScanSuccess, onClose, isOpen }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isFlashlightOn, setIsFlashlightOn] = useState(false)
  const [hasFlashlight, setHasFlashlight] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment")
  const [isInitializing, setIsInitializing] = useState(false)
  const [detectionCount, setDetectionCount] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef<boolean>(false)
  const animationFrameRef = useRef<number | null>(null)

  // Mobile device detection
  const isMobile = () => {
    if (typeof window === "undefined") return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  const isIOS = () => {
    if (typeof window === "undefined") return false
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }

  const isSafari = () => {
    if (typeof window === "undefined") return false
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  }

  useEffect(() => {
    if (isOpen && !scanningRef.current) {
      console.log("[v0] QRScanner opened, starting camera")
      startCamera()
    } else if (!isOpen && scanningRef.current) {
      console.log("[v0] QRScanner closed, stopping camera")
      stopCamera()
    }

    // Cleanup only on unmount
    return () => {
      if (scanningRef.current) {
        console.log("[v0] QRScanner unmounting, cleanup")
        stopCamera()
      }
    }
  }, [isOpen])

  const getOptimalCameraConstraints = () => {
    const baseConstraints = {
      facingMode: cameraFacing,
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
    }

    // iOS Safari specific constraints
    if (isIOS() && isSafari()) {
      return {
        ...baseConstraints,
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        frameRate: { ideal: 15, max: 30 }, // Lower frame rate for better performance
      }
    }

    // Android Chrome constraints
    if (isMobile() && !isIOS()) {
      return {
        ...baseConstraints,
        width: { ideal: 1024, max: 1280 },
        height: { ideal: 768, max: 720 },
        frameRate: { ideal: 20, max: 30 },
      }
    }

    return baseConstraints
  }

  const startCamera = async () => {
    try {
      console.log("[v0] startCamera called")
      setError(null)
      setIsInitializing(true)
      scanningRef.current = true

      // Stop any existing stream first
      if (streamRef.current) {
        console.log("[v0] Stopping existing stream")
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      const constraints = {
        video: getOptimalCameraConstraints(),
        audio: false,
      }

      console.log("[v0] Requesting camera with constraints:", constraints)

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (!scanningRef.current) {
        console.log("[v0] Scanning cancelled, stopping stream")
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      streamRef.current = stream
      setHasPermission(true)
      setIsScanning(true)

      // Check for flashlight capability
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities?.()
        setHasFlashlight(!!capabilities?.torch)
        console.log("[v0] Camera capabilities:", capabilities)
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute("playsinline", "true")
        videoRef.current.setAttribute("webkit-playsinline", "true")
        videoRef.current.muted = true

        await videoRef.current.play()
        console.log("[v0] Video playing successfully")
        setIsInitializing(false)

        // Start QR detection after a short delay
        setTimeout(() => {
          if (scanningRef.current) {
            startQRDetection()
          }
        }, 500)
      }
    } catch (err) {
      console.error("[v0] Camera access error:", err)
      let errorMessage = "Unable to access camera. "

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorMessage += "Please allow camera permissions and try again."
        } else if (err.name === "NotFoundError") {
          errorMessage += "No camera found on this device."
        } else if (err.name === "NotSupportedError") {
          errorMessage += "Camera not supported in this browser."
        } else {
          errorMessage += err.message
        }
      }

      setError(errorMessage)
      setHasPermission(false)
      setIsScanning(false)
      setIsInitializing(false)
      scanningRef.current = false
    }
  }

  const stopCamera = () => {
    console.log("[v0] Stopping camera")
    scanningRef.current = false

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
        console.log("[v0] Stopped track:", track.kind)
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsScanning(false)
    setIsInitializing(false)
    setIsFlashlightOn(false)
    setDetectionCount(0)
  }

  const toggleFlashlight = async () => {
    if (!streamRef.current || !hasFlashlight) return

    const videoTrack = streamRef.current.getVideoTracks()[0]
    if (!videoTrack) return

    try {
      await videoTrack.applyConstraints({
        // @ts-ignore - torch is not in TypeScript types yet
        advanced: [{ torch: !isFlashlightOn }],
      })
      setIsFlashlightOn(!isFlashlightOn)
      console.log("[v0] Flashlight toggled:", !isFlashlightOn)
    } catch (error) {
      console.error("[v0] Flashlight toggle error:", error)
    }
  }

  const switchCamera = () => {
    const newFacing = cameraFacing === "environment" ? "user" : "environment"
    console.log("[v0] Switching camera to:", newFacing)
    setCameraFacing(newFacing)
    // Restart camera with new facing mode
    stopCamera()
    setTimeout(() => {
      if (isOpen) {
        startCamera()
      }
    }, 100)
  }

  const startQRDetection = async () => {
    try {
      console.log("[v0] Starting QR detection")
      const jsQR = await import("jsqr")

      const detectQR = () => {
        if (!videoRef.current || !canvasRef.current || !scanningRef.current) {
          console.log("[v0] Detection stopped - refs not available or scanning cancelled")
          return
        }

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")

        if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
          animationFrameRef.current = requestAnimationFrame(detectQR)
          return
        }

        // Set canvas size to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw current video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Get image data for QR detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const code = jsQR.default(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        })

        setDetectionCount((prev) => prev + 1)

        if (code && code.data) {
          console.log("[v0] QR code detected:", code.data)
          handleQRDetected(code.data)
        } else {
          // Continue scanning
          animationFrameRef.current = requestAnimationFrame(detectQR)
        }
      }

      // Start detection loop
      animationFrameRef.current = requestAnimationFrame(detectQR)
    } catch (error) {
      console.error("[v0] Failed to load QR detection library:", error)
      setError("QR detection library failed to load. Please refresh and try again.")
    }
  }

  const handleQRDetected = (result: string) => {
    console.log("[v0] QR Code detected, stopping camera:", result)
    stopCamera()
    onScanSuccess(result)
  }

  const handleRetry = () => {
    setError(null)
    setHasPermission(null)
    setDetectionCount(0)
    startCamera()
  }

  const handleClose = () => {
    console.log("[v0] User closed scanner")
    stopCamera()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
      <Card className="w-full max-w-md border-[#e5d5c8] max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-[#2c2c2c]">Scan QR Code</CardTitle>
            <CardDescription className="text-[#6b5b47]">Point your camera at a QR code</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Camera View */}
          <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
            {hasPermission === false ? (
              <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
                <div>
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />
                  <p className="text-sm font-medium">Camera Access Required</p>
                  <p className="text-xs text-gray-400 mt-1 mb-3">{error}</p>
                  <Button onClick={handleRetry} size="sm" className="bg-[#c44c3a] hover:bg-[#a63c2a] text-white">
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Try Again
                  </Button>
                </div>
              </div>
            ) : isInitializing ? (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p className="text-sm">Initializing camera...</p>
                </div>
              </div>
            ) : isScanning ? (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
                <canvas ref={canvasRef} className="hidden" />

                {/* Scanning Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                    {/* Animated corner indicators */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#c44c3a] animate-pulse"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#c44c3a] animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#c44c3a] animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#c44c3a] animate-pulse"></div>

                    {/* Scanning line animation */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="w-full h-0.5 bg-[#c44c3a] animate-pulse absolute top-1/2 transform -translate-y-1/2"></div>
                    </div>
                  </div>
                </div>

                {/* Camera Controls */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {hasFlashlight && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={toggleFlashlight}
                      className="bg-black bg-opacity-50 text-white border-white hover:bg-opacity-70"
                    >
                      {isFlashlightOn ? <FlashlightOff className="w-4 h-4" /> : <Flashlight className="w-4 h-4" />}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={switchCamera}
                    className="bg-black bg-opacity-50 text-white border-white hover:bg-opacity-70"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Status */}
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="w-full justify-center bg-black bg-opacity-50 text-white border-white">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Scanning for QR code...
                  </Badge>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Starting camera...</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-[#f5f0e8] rounded-lg p-3">
            <h4 className="font-medium text-[#2c2c2c] mb-2">Scanning Tips:</h4>
            <ul className="text-sm text-[#6b5b47] space-y-1">
              <li>• Hold steady and ensure good lighting</li>
              <li>• Keep QR code within the frame</li>
              <li>• Try different angles if not detecting</li>
              <li>• Use flashlight in low light conditions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
