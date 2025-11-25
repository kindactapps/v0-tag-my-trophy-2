"use client"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ShimmerCard } from "./skeleton-screens"

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  aspectRatio?: "square" | "video" | "portrait" | "landscape" | "auto"
  sizes?: string
}

export function LazyImage({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  priority = false,
  quality = 75,
  placeholder = "empty",
  blurDataURL,
  onLoad,
  onError,
  aspectRatio = "auto",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: "50px", // Start loading 50px before the image comes into view
        threshold: 0.1,
      },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square"
      case "video":
        return "aspect-video"
      case "portrait":
        return "aspect-[3/4]"
      case "landscape":
        return "aspect-[4/3]"
      default:
        return ""
    }
  }

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden bg-[#f5f0e8]", getAspectRatioClass(), className)}>
      {/* Loading shimmer */}
      {isLoading && <ShimmerCard className="absolute inset-0" />}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f5f0e8] text-[#6b5b47]">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      {isInView && !hasError && (
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          sizes={sizes}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            aspectRatio === "auto" ? "w-full h-auto object-cover" : "w-full h-full object-cover",
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
}

// Progressive loading image with multiple quality levels
export function ProgressiveImage({
  src,
  alt,
  lowQualitySrc,
  className,
  ...props
}: LazyImageProps & { lowQualitySrc?: string }) {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src)
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false)

  useEffect(() => {
    if (lowQualitySrc && src !== lowQualitySrc) {
      // Preload high quality image
      const img = new window.Image()
      img.onload = () => {
        setCurrentSrc(src)
        setIsHighQualityLoaded(true)
      }
      img.src = src
    }
  }, [src, lowQualitySrc])

  return (
    <LazyImage
      {...props}
      src={currentSrc}
      alt={alt}
      className={cn(
        "transition-all duration-500",
        !isHighQualityLoaded && lowQualitySrc ? "filter blur-sm" : "",
        className,
      )}
    />
  )
}
