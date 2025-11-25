"use client"
import { cn } from "@/lib/utils"
import { Loader2, Download } from "lucide-react"
import ShimmerCard from "./shimmer-card"

interface ProfessionalLoadingProps {
  message?: string
  submessage?: string
  progress?: number
  size?: "sm" | "md" | "lg"
  variant?: "spinner" | "dots" | "pulse" | "shimmer"
  className?: string
}

export function ProfessionalLoading({
  message = "Loading...",
  submessage,
  progress,
  size = "md",
  variant = "spinner",
  className,
}: ProfessionalLoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  const renderSpinner = () => (
    <div className={cn("border-4 border-[#e5d5c8] border-t-[#c44c3a] rounded-full animate-spin", sizeClasses[size])} />
  )

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-[#c44c3a] rounded-full animate-pulse",
            size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4",
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1.4s",
          }}
        />
      ))}
    </div>
  )

  const renderPulse = () => <div className={cn("bg-[#c44c3a] rounded-full animate-pulse", sizeClasses[size])} />

  const renderShimmer = () => (
    <div className="relative overflow-hidden bg-[#f5f0e8] rounded-lg">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <div className={cn("bg-[#e5d5c8]", sizeClasses[size])} />
    </div>
  )

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return renderDots()
      case "pulse":
        return renderPulse()
      case "shimmer":
        return renderShimmer()
      default:
        return renderSpinner()
    }
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-6 text-center", className)}>
      {renderLoader()}

      <div className="mt-4 space-y-1">
        <p className="text-[#2c2c2c] font-medium">{message}</p>
        {submessage && <p className="text-sm text-[#6b5b47]">{submessage}</p>}
      </div>

      {progress !== undefined && (
        <div className="w-full max-w-xs mt-4">
          <div className="flex justify-between text-xs text-[#6b5b47] mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-[#e5d5c8] rounded-full h-2">
            <div
              className="bg-[#c44c3a] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Specific loading components for different contexts
export function PhotoUploadLoading({ progress, filesCount }: { progress: number; filesCount: number }) {
  return (
    <ProfessionalLoading
      message="Compressing your photos..."
      submessage={`Processing ${filesCount} ${filesCount === 1 ? "photo" : "photos"}`}
      progress={progress}
      variant="spinner"
      size="lg"
    />
  )
}

export function VideoUploadLoading({ progress, timeRemaining }: { progress: number; timeRemaining?: number }) {
  return (
    <ProfessionalLoading
      message="Processing video..."
      submessage={
        timeRemaining ? `Estimated ${Math.ceil(timeRemaining / 60)} minutes remaining` : "Optimizing for web playback"
      }
      progress={progress}
      variant="spinner"
      size="lg"
    />
  )
}

export function QRGenerationLoading() {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative">
        {/* QR Code skeleton */}
        <div className="w-16 h-16 border-2 border-[#e5d5c8] rounded-lg bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
          {/* QR pattern simulation */}
          <div className="absolute top-1 left-1 w-2 h-2 bg-[#c44c3a] rounded-sm" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-[#c44c3a] rounded-sm" />
          <div className="absolute bottom-1 left-1 w-2 h-2 bg-[#c44c3a] rounded-sm" />
          <div className="absolute top-3 left-3 w-1 h-1 bg-[#6b5b47]" />
          <div className="absolute top-5 left-5 w-1 h-1 bg-[#6b5b47]" />
          <div className="absolute bottom-3 right-3 w-1 h-1 bg-[#6b5b47]" />
        </div>
        <Loader2 className="w-4 h-4 animate-spin text-[#c44c3a] absolute -top-2 -right-2" />
      </div>
      <p className="text-sm text-[#6b5b47] mt-3 font-medium">Generating QR Code...</p>
      <p className="text-xs text-[#6b5b47]/70 mt-1">This may take a moment</p>
    </div>
  )
}

export function QRCustomizationLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <ShimmerCard className="h-4 w-20" />
          <ShimmerCard className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}

export function QRDownloadLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="relative mb-4">
          <div className="w-12 h-12 border-4 border-[#e5d5c8] border-t-[#c44c3a] rounded-full animate-spin" />
          <Download className="w-5 h-5 text-[#c44c3a] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-sm font-medium text-[#2c2c2c] mb-1">Preparing Your Download</p>
        <p className="text-xs text-[#6b5b47]">Optimizing QR code for best quality...</p>
      </div>
    </div>
  )
}

export function GalleryLoading() {
  return (
    <ProfessionalLoading
      message="Loading your memories..."
      submessage="Preparing your photo gallery"
      variant="pulse"
      size="md"
    />
  )
}

export function DatabaseLoading({ operation }: { operation: string }) {
  return (
    <ProfessionalLoading
      message={`${operation}...`}
      submessage="Connecting to secure servers"
      variant="dots"
      size="sm"
    />
  )
}
