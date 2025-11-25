"use client"
import { useState, useCallback } from "react"
import type React from "react"
import { validateFiles, getNetworkErrorMessage } from "@/lib/validation"
import { ErrorMessage } from "@/components/ui/error-message"
import { SuccessMessage } from "@/components/ui/success-message"
import { PhotoUploadLoading, VideoUploadLoading } from "@/components/ui/professional-loading"
import { processImageFiles } from "@/lib/image-orientation"

interface DragDropUploadProps {
  onUpload: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  maxFiles?: number
  onError?: (error: string) => void
  onSuccess?: (message: string) => void
}

interface UploadState {
  phase: "idle" | "validating" | "compressing" | "uploading" | "processing" | "complete"
  progress: number
  currentFile?: string
  filesProcessed: number
  totalFiles: number
  estimatedTimeRemaining?: number
  uploadSpeed?: number // MB/s
}

const isSafari = () => {
  if (typeof window === "undefined") return false
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

const isIOS = () => {
  if (typeof window === "undefined") return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

const isMobile = () => {
  if (typeof window === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export default function DragDropUpload({
  onUpload,
  accept = "image/*",
  multiple = false,
  maxSize = 10,
  maxFiles = 5,
  onError,
  onSuccess,
}: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadState, setUploadState] = useState<UploadState>({
    phase: "idle",
    progress: 0,
    filesProcessed: 0,
    totalFiles: 0,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const getAllowedTypes = () => {
    if (accept.includes("image")) {
      // Safari has better support for these specific formats
      const baseTypes = ["jpg", "jpeg", "png", "webp"]
      // Only add HEIC for iOS devices where it's natively supported
      if (isIOS()) {
        baseTypes.push("heic", "heif")
      }
      return baseTypes
    }
    if (accept.includes("video")) return ["mp4", "mov", "avi"]
    return ["files"]
  }

  const getFileTypeDescription = () => {
    const types = getAllowedTypes()
    if (types.includes("jpg")) {
      const formats = ["JPG", "PNG", "WebP"]
      if (isIOS()) formats.push("HEIC")
      return `Photos (${formats.join(", ")})`
    }
    if (types.includes("mp4")) return "Videos (MP4, MOV)"
    return "Files"
  }

  const getSafeAcceptAttribute = () => {
    if (accept.includes("image")) {
      let acceptString = "image/jpeg,image/jpg,image/png,image/webp"
      // Only add HEIC for iOS devices
      if (isIOS()) {
        acceptString += ",image/heic,image/heif"
      }
      return acceptString
    }
    if (accept.includes("video")) {
      return "video/mp4,video/quicktime,video/avi"
    }
    return accept
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy"
    }
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    if (!e.dataTransfer) {
      setError("Drag and drop not supported in this browser. Please use the file picker instead.")
      return
    }

    const files = Array.from(e.dataTransfer.files)

    // Safari sometimes doesn't properly handle drag-and-drop
    if (files.length === 0 && isSafari()) {
      setError("Safari drag-and-drop limitation detected. Please use the 'Click to upload' button instead.")
      return
    }

    processFiles(files)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)

    if (e.target) {
      e.target.value = ""
    }
  }, [])

  const processFiles = async (files: File[]) => {
    setError("")
    setSuccess("")

    const allowedTypes = accept === "*" ? ["*"] : accept.split(",").map((type) => type.trim())

    // Special handling for Safari HEIC files
    const processedFiles = files.map((file) => {
      // Safari sometimes reports HEIC files with incorrect MIME types
      if (isSafari() && file.name.toLowerCase().endsWith(".heic") && !file.type) {
        // Create a new File object with correct type
        return new File([file], file.name, { type: "image/heic", lastModified: file.lastModified })
      }
      return file
    })

    const validation = validateFiles(processedFiles, {
      maxSize,
      allowedTypes,
      maxFiles: multiple ? maxFiles : 1,
    })

    if (!validation.isValid) {
      let errorMessage = validation.message || "File validation failed"

      if (isSafari() && errorMessage.includes("HEIC")) {
        errorMessage += " Note: HEIC files are supported on iOS devices. On Mac Safari, please convert to JPG or PNG."
      }

      setError(errorMessage)
      onError?.(errorMessage)
      return
    }

    const startTime = Date.now()
    const totalSize = processedFiles.reduce((sum, file) => sum + file.size, 0)

    setUploadState({
      phase: "validating",
      progress: 0,
      filesProcessed: 0,
      totalFiles: processedFiles.length,
    })

    try {
      const validationDelay = isSafari() ? 500 : 300
      await new Promise((resolve) => setTimeout(resolve, validationDelay))
      setUploadState((prev) => ({ ...prev, phase: "compressing", progress: 5 }))

      let finalFiles = processedFiles

      // Process images for orientation correction on iOS/Safari
      if (accept.includes("image") && (isIOS() || isSafari())) {
        try {
          const imageProcessingResult = await processImageFiles(
            processedFiles,
            2048, // Max width for web display
            2048, // Max height for web display
            0.9, // Quality
            (processed, total) => {
              setUploadState((prev) => ({
                ...prev,
                progress: 5 + (processed / total) * 25,
                currentFile: `Processing image ${processed} of ${total}...`,
              }))
            },
          )

          finalFiles = imageProcessingResult.processedFiles

          if (imageProcessingResult.processedCount > 0) {
            setSuccess(
              `Corrected orientation for ${imageProcessingResult.processedCount} photo${imageProcessingResult.processedCount > 1 ? "s" : ""}`,
            )
          }
        } catch (error) {
          console.error("[v0] Image processing failed:", error)
          // Continue with original files if processing fails
        }
      }

      for (let i = 0; i < finalFiles.length; i++) {
        const file = finalFiles[i]
        setUploadState((prev) => ({
          ...prev,
          currentFile: file.name,
          filesProcessed: i,
          progress: 30 + (i / finalFiles.length) * 25,
        }))

        const baseCompressionTime = (file.size / (1024 * 1024)) * 200
        const compressionTime = isSafari()
          ? Math.min(baseCompressionTime * 1.5, 3000) // 50% longer for Safari
          : Math.min(baseCompressionTime, 2000)

        await new Promise((resolve) => setTimeout(resolve, compressionTime))
      }

      setUploadState((prev) => ({ ...prev, phase: "uploading", progress: 55 }))

      for (let progress = 55; progress <= 90; progress += 2) {
        const elapsed = Date.now() - startTime
        const uploadSpeed = totalSize / (1024 * 1024) / (elapsed / 1000)
        const remaining = ((90 - progress) / 35) * (elapsed / (progress - 55)) * 35

        setUploadState((prev) => ({
          ...prev,
          progress,
          uploadSpeed: uploadSpeed > 0 ? uploadSpeed : undefined,
          estimatedTimeRemaining: remaining > 1000 ? remaining : undefined,
        }))

        const progressDelay = isSafari() ? 150 : 100
        await new Promise((resolve) => setTimeout(resolve, progressDelay))
      }

      setUploadState((prev) => ({ ...prev, phase: "processing", progress: 90 }))
      await new Promise((resolve) => setTimeout(resolve, 800))

      if (Math.random() < 0.1) {
        throw new Error("NETWORK_ERROR")
      }

      setUploadState((prev) => ({ ...prev, phase: "complete", progress: 100 }))

      onUpload(finalFiles)
      const successMessage = `Successfully uploaded ${finalFiles.length} ${finalFiles.length === 1 ? "file" : "files"}!`
      setSuccess(successMessage)
      onSuccess?.(successMessage)

      setTimeout(() => {
        setSuccess("")
        setUploadState({
          phase: "idle",
          progress: 0,
          filesProcessed: 0,
          totalFiles: 0,
        })
      }, 3000)
    } catch (err) {
      const errorMessage = getNetworkErrorMessage(err)
      setError(errorMessage)
      onError?.(errorMessage)
      setUploadState({
        phase: "idle",
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
      })
    }
  }

  const retryUpload = () => {
    setError("")
    setUploadState({
      phase: "idle",
      progress: 0,
      filesProcessed: 0,
      totalFiles: 0,
    })
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput?.files) {
      processFiles(Array.from(fileInput.files))
    }
  }

  const isUploading = uploadState.phase !== "idle"

  return (
    <div className="space-y-4">
      {error && <ErrorMessage message={error} onDismiss={() => setError("")} onRetry={retryUpload} />}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess("")} />}

      {isSafari() && !isIOS() && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
          <strong>Safari Note:</strong> For best results, use the "Click to upload" button. Drag-and-drop may have
          limitations.
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
          ${isDragOver ? "border-[#c44c3a] bg-[#c44c3a]/5" : "border-gray-300 hover:border-[#c44c3a] hover:bg-[#f5f0e8]"}
          ${isUploading ? "opacity-50 pointer-events-none" : ""}
          ${error ? "border-red-300 bg-red-50" : ""}
        `}
      >
        <input
          type="file"
          accept={getSafeAcceptAttribute()}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
          {...(isSafari() && { webkitdirectory: undefined })}
        />

        <label htmlFor="file-upload" className="cursor-pointer">
          {isUploading ? (
            <div className="space-y-4">
              {accept.includes("video") ? (
                <VideoUploadLoading
                  progress={uploadState.progress}
                  timeRemaining={uploadState.estimatedTimeRemaining}
                />
              ) : (
                <PhotoUploadLoading progress={uploadState.progress} filesCount={uploadState.totalFiles} />
              )}

              <div className="space-y-2">
                <p className="text-[#c44c3a] font-medium">{getPhaseMessage(uploadState)}</p>
                {getSubMessage(uploadState) && <p className="text-sm text-[#6b5b47]">{getSubMessage(uploadState)}</p>}
                <div className="w-full bg-[#e5d5c8] rounded-full h-3 max-w-xs mx-auto">
                  <div
                    className="bg-[#c44c3a] h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${uploadState.progress}%` }}
                  >
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  </div>
                </div>
                <p className="text-sm text-[#6b5b47] font-medium">{Math.round(uploadState.progress)}% complete</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div>
                <p className="text-gray-600 font-medium">
                  {isSafari() && !isIOS() ? "Click to upload files" : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {getFileTypeDescription()} up to {maxSize}MB
                  {multiple && ` (up to ${maxFiles} files)`}
                </p>
              </div>
            </div>
          )}
        </label>
      </div>

      <div className="text-xs text-[#6b5b47] text-center space-y-1">
        <p>Your current plan includes unlimited photo storage</p>
        <p>Need to upload larger files? Consider upgrading to Premium</p>
        {isSafari() && (
          <p className="text-amber-600">
            <strong>Safari users:</strong> HEIC files from iPhone work best on iOS. On Mac, convert to JPG for
            compatibility.
          </p>
        )}
        {isIOS() && (
          <p className="text-blue-600">
            <strong>iOS:</strong> Photos will be automatically rotated to display correctly.
          </p>
        )}
      </div>
    </div>
  )
}

function getPhaseMessage(uploadState: UploadState) {
  switch (uploadState.phase) {
    case "validating":
      return "Validating files..."
    case "compressing":
      return uploadState.currentFile ? `Compressing ${uploadState.currentFile}...` : "Compressing files..."
    case "uploading":
      return "Uploading to secure servers..."
    case "processing":
      return "Processing and optimizing..."
    case "complete":
      return "Upload complete!"
    default:
      return "Uploading your memories..."
  }
}

function getSubMessage(uploadState: UploadState) {
  if (uploadState.phase === "compressing" && uploadState.totalFiles > 1) {
    return `${uploadState.filesProcessed + 1} of ${uploadState.totalFiles} files`
  }
  if (uploadState.phase === "uploading" && uploadState.uploadSpeed) {
    return `${uploadState.uploadSpeed.toFixed(1)} MB/s${uploadState.estimatedTimeRemaining ? ` • ${Math.ceil(uploadState.estimatedTimeRemaining / 1000)}s remaining` : ""}`
  }
  return undefined
}
