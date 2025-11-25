// User data protection utilities for Tag My Trophy
import { SecurityUtils } from "./security"

export interface FileMetadata {
  filename: string
  originalSize: number
  processedSize: number
  mimeType: string
  uploadDate: string
  hasMetadata: boolean
  metadataRemoved: boolean
}

export interface EXIFData {
  make?: string
  model?: string
  dateTime?: string
  gpsLatitude?: number
  gpsLongitude?: number
  orientation?: number
  software?: string
  [key: string]: any
}

export class DataProtectionManager {
  // Remove EXIF data from images to protect user privacy
  static async removeImageMetadata(file: File): Promise<{
    cleanFile: File
    hadMetadata: boolean
    removedData: string[]
  }> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      if (!ctx) {
        reject(new Error("Canvas context not available"))
        return
      }

      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width
        canvas.height = img.height

        // Draw image to canvas (this strips EXIF data)
        ctx.drawImage(img, 0, 0)

        // Convert back to blob without metadata
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create clean image"))
              return
            }

            const cleanFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })

            resolve({
              cleanFile,
              hadMetadata: true, // Assume JPEG files have metadata
              removedData: ["EXIF", "GPS", "Camera Info", "Software Info"],
            })
          },
          file.type,
          0.95,
        ) // High quality to preserve image
      }

      img.onerror = () => {
        reject(new Error("Failed to load image for metadata removal"))
      }

      // Create object URL for the image
      const objectUrl = URL.createObjectURL(file)
      img.src = objectUrl

      // Clean up object URL after processing
      img.onload = () => {
        URL.revokeObjectURL(objectUrl)

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create clean image"))
              return
            }

            const cleanFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })

            resolve({
              cleanFile,
              hadMetadata: true,
              removedData: ["EXIF", "GPS", "Camera Info", "Software Info"],
            })
          },
          file.type,
          0.95,
        )
      }
    })
  }

  // Remove metadata from video files
  static async removeVideoMetadata(file: File): Promise<{
    cleanFile: File
    hadMetadata: boolean
    removedData: string[]
  }> {
    // For client-side video metadata removal, we'd need a library like ffmpeg.wasm
    // For now, we'll return the original file with a warning
    console.warn("[DataProtection] Video metadata removal requires server-side processing")

    return {
      cleanFile: file,
      hadMetadata: true,
      removedData: ["Location Data", "Device Info", "Creation Time"],
    }
  }

  // Process uploaded files for security and privacy
  static async processUploadedFiles(files: File[]): Promise<{
    processedFiles: File[]
    securityReport: {
      filesProcessed: number
      metadataRemoved: number
      securityIssues: string[]
      privacyProtections: string[]
    }
  }> {
    const processedFiles: File[] = []
    const securityIssues: string[] = []
    const privacyProtections: string[] = []
    let metadataRemoved = 0

    for (const file of files) {
      try {
        // Security validation
        const securityCheck = SecurityUtils.validateFileUpload(file)
        if (!securityCheck.isValid) {
          securityIssues.push(`${file.name}: ${securityCheck.errors.join(", ")}`)
          continue
        }

        let processedFile = file

        // Remove metadata based on file type
        if (file.type.startsWith("image/")) {
          try {
            const result = await this.removeImageMetadata(file)
            processedFile = result.cleanFile
            if (result.hadMetadata) {
              metadataRemoved++
              privacyProtections.push(`${file.name}: Removed ${result.removedData.join(", ")}`)
            }
          } catch (error) {
            console.warn(`[DataProtection] Failed to remove metadata from ${file.name}:`, error)
            securityIssues.push(`${file.name}: Metadata removal failed`)
          }
        } else if (file.type.startsWith("video/")) {
          const result = await this.removeVideoMetadata(file)
          processedFile = result.cleanFile
          if (result.hadMetadata) {
            privacyProtections.push(`${file.name}: Video metadata noted for server-side removal`)
          }
        }

        processedFiles.push(processedFile)
      } catch (error) {
        securityIssues.push(`${file.name}: Processing failed`)
        console.error(`[DataProtection] File processing error:`, error)
      }
    }

    return {
      processedFiles,
      securityReport: {
        filesProcessed: processedFiles.length,
        metadataRemoved,
        securityIssues,
        privacyProtections,
      },
    }
  }

  // Secure HTML content rendering
  static renderSafeHTML(content: string): string {
    return SecurityUtils.sanitizeHTML(content)
  }

  // Generate file integrity hash
  static async generateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  // Secure session cleanup
  static performSecureLogout(): void {
    // Clear all localStorage data
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) keysToRemove.push(key)
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))

    // Clear sessionStorage
    sessionStorage.clear()

    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=")
      const name = eqPos > -1 ? c.substr(0, eqPos) : c
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`
    })

    // Clear any cached data
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name)
        })
      })
    }

    // Clear IndexedDB data if any
    if ("indexedDB" in window) {
      try {
        indexedDB.databases?.().then((databases) => {
          databases.forEach((db) => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name)
            }
          })
        })
      } catch (error) {
        console.warn("[DataProtection] IndexedDB cleanup failed:", error)
      }
    }

    console.log("[DataProtection] Secure logout completed - all user data cleared")
  }

  // Data anonymization for analytics
  static anonymizeUserData(data: any): any {
    const anonymized = { ...data }

    // Remove or hash personally identifiable information
    if (anonymized.email) {
      anonymized.email = this.hashString(anonymized.email)
    }
    if (anonymized.name) {
      delete anonymized.name
    }
    if (anonymized.phone) {
      delete anonymized.phone
    }
    if (anonymized.address) {
      delete anonymized.address
    }
    if (anonymized.ipAddress) {
      // Keep only first 3 octets for general location
      const parts = anonymized.ipAddress.split(".")
      if (parts.length === 4) {
        anonymized.ipAddress = `${parts[0]}.${parts[1]}.${parts[2]}.0`
      }
    }

    return anonymized
  }

  // Simple string hashing for anonymization
  private static hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  // Validate user-generated content
  static validateUserContent(
    content: string,
    maxLength = 5000,
  ): {
    isValid: boolean
    sanitizedContent: string
    warnings: string[]
  } {
    const warnings: string[] = []

    // Check length
    if (content.length > maxLength) {
      return {
        isValid: false,
        sanitizedContent: "",
        warnings: [`Content exceeds maximum length of ${maxLength} characters`],
      }
    }

    // Sanitize content
    const sanitizedContent = SecurityUtils.sanitizeHTML(content)

    // Check for potential issues
    if (content !== sanitizedContent) {
      warnings.push("Some HTML content was removed for security")
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [/javascript:/gi, /data:/gi, /vbscript:/gi, /<script/gi, /on\w+\s*=/gi]

    if (suspiciousPatterns.some((pattern) => pattern.test(content))) {
      warnings.push("Potentially unsafe content detected and removed")
    }

    return {
      isValid: true,
      sanitizedContent,
      warnings,
    }
  }

  // Generate privacy report for user
  static generatePrivacyReport(userId: string): {
    dataTypes: string[]
    retentionPeriods: Record<string, string>
    sharingPractices: string[]
    userRights: string[]
  } {
    return {
      dataTypes: [
        "Account information (name, email, username)",
        "Uploaded content (photos, videos, stories)",
        "Usage analytics (page views, feature usage)",
        "Device information (browser, OS, screen size)",
        "IP address (for security and analytics)",
      ],
      retentionPeriods: {
        "Account Data": "Until account deletion",
        "Uploaded Content": "Until manually deleted by user",
        "Analytics Data": "24 months",
        "Security Logs": "12 months",
        "Support Communications": "3 years",
      },
      sharingPractices: [
        "We do not sell your personal data",
        "Content is only shared as per your privacy settings",
        "Analytics data is anonymized before processing",
        "We may share data with service providers under strict agreements",
        "Legal compliance may require data disclosure",
      ],
      userRights: [
        "Access your personal data",
        "Correct inaccurate information",
        "Delete your account and data",
        "Export your data",
        "Restrict data processing",
        "Object to data processing",
      ],
    }
  }
}

// React hook for data protection features
export function useDataProtection() {
  const processFiles = async (files: File[]) => {
    return await DataProtectionManager.processUploadedFiles(files)
  }

  const secureLogout = () => {
    DataProtectionManager.performSecureLogout()
  }

  const validateContent = (content: string, maxLength?: number) => {
    return DataProtectionManager.validateUserContent(content, maxLength)
  }

  const renderSafeHTML = (content: string) => {
    return DataProtectionManager.renderSafeHTML(content)
  }

  return {
    processFiles,
    secureLogout,
    validateContent,
    renderSafeHTML,
  }
}
