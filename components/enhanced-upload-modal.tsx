"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { ErrorMessage } from "@/components/ui/error-message"
import { SuccessMessage } from "@/components/ui/success-message"
import { DatabaseLoading } from "@/components/ui/professional-loading"
import DragDropUpload from "./drag-drop-upload"
import { validateRequired, getNetworkErrorMessage, successMessages } from "@/lib/validation"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: (data: any) => void
  uploadType: "photo" | "video" | "story"
}

export default function EnhancedUploadModal({ isOpen, onClose, onUploadComplete, uploadType }: UploadModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  if (!isOpen) return null

  const getUploadConfig = () => {
    switch (uploadType) {
      case "photo":
        return {
          accept: "image/*",
          maxSize: 10,
          maxFiles: 10,
          title: "Add Photos to Your Story",
          description: "Share your favorite moments with beautiful photos",
        }
      case "video":
        return {
          accept: "video/*",
          maxSize: 100,
          maxFiles: 3,
          title: "Add Videos to Your Story",
          description: "Bring your memories to life with videos",
        }
      case "story":
        return {
          accept: "image/*,video/*",
          maxSize: 50,
          maxFiles: 15,
          title: "Create Your Story",
          description: "Combine photos and videos to tell your complete story",
        }
    }
  }

  const config = getUploadConfig()

  const validateField = (name: string, value: string) => {
    let validation
    switch (name) {
      case "title":
        validation = validateRequired(value, "Title")
        break
      default:
        validation = { isValid: true }
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: validation.isValid ? "" : validation.message || "",
    }))
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      validateField(name, value)
    }
    if (error) setError("")
  }

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files)
    setError("")
  }

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const handleSubmit = async () => {
    setError("")
    setSuccess("")

    // Validate required fields
    const titleValidation = validateRequired(formData.title, "Title")
    if (!titleValidation.isValid) {
      setFormErrors({ title: titleValidation.message || "" })
      return
    }

    // Check if files are uploaded
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one file to continue.")
      return
    }

    setIsSubmitting(true)
    setSubmitProgress(0)

    try {
      const steps = [
        { message: "Saving memory details", duration: 500 },
        { message: "Processing metadata", duration: 800 },
        { message: "Generating thumbnails", duration: 1200 },
        { message: "Creating QR experience", duration: 600 },
        { message: "Finalizing upload", duration: 400 },
      ]

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        setSubmitProgress((i / steps.length) * 100)

        // Show step-specific loading message
        const loadingElement = document.querySelector("[data-loading-message]")
        if (loadingElement) {
          loadingElement.textContent = step.message
        }

        await new Promise((resolve) => setTimeout(resolve, step.duration))
      }

      setSubmitProgress(100)

      // Simulate potential failures
      if (Math.random() < 0.05) {
        throw new Error("DATABASE_ERROR")
      }

      const uploadData = {
        ...formData,
        files: uploadedFiles,
        type: uploadType,
        uploadedAt: new Date().toISOString(),
      }

      setSuccess(successMessages.memoryAdded)
      setTimeout(() => {
        onUploadComplete(uploadData)
        onClose()
      }, 1500)
    } catch (err) {
      setError(getNetworkErrorMessage(err))
    } finally {
      setIsSubmitting(false)
      setSubmitProgress(0)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-[#2c2c2c]">{config.title}</CardTitle>
              <CardDescription className="text-[#6b5b47]">{config.description}</CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-[#6b5b47] hover:text-[#2c2c2c]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {success && <SuccessMessage message={success} />}
          {error && <ErrorMessage message={error} onDismiss={() => setError("")} />}

          {isSubmitting && (
            <div className="bg-[#f5f0e8] border border-[#e5d5c8] rounded-lg p-4">
              <DatabaseLoading operation="Saving your memory" />
              <div className="mt-4">
                <div className="w-full bg-[#e5d5c8] rounded-full h-2">
                  <div
                    className="bg-[#c44c3a] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${submitProgress}%` }}
                  />
                </div>
                <p className="text-sm text-[#6b5b47] mt-2 text-center" data-loading-message>
                  Saving memory details...
                </p>
              </div>
            </div>
          )}

          {/* File Upload Section */}
          <div>
            <h3 className="font-semibold text-[#2c2c2c] mb-3">Upload Your Files</h3>
            <DragDropUpload
              accept={config.accept}
              multiple={true}
              maxSize={config.maxSize}
              maxFiles={config.maxFiles}
              onUpload={handleFileUpload}
              onError={handleUploadError}
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <FormField
              label="Memory Title"
              name="title"
              placeholder="Give your memory a meaningful title"
              value={formData.title}
              onChange={(value) => handleInputChange("title", value)}
              error={formErrors.title}
              required
              disabled={isSubmitting}
            />

            <FormField
              label="Description"
              name="description"
              type="textarea"
              placeholder="Tell the story behind this memory..."
              value={formData.description}
              onChange={(value) => handleInputChange("description", value)}
              disabled={isSubmitting}
              description="Share the details that make this memory special"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Location"
                name="location"
                placeholder="Where was this taken?"
                value={formData.location}
                onChange={(value) => handleInputChange("location", value)}
                disabled={isSubmitting}
              />

              <FormField
                label="Date"
                name="date"
                type="text"
                placeholder="When did this happen?"
                value={formData.date}
                onChange={(value) => handleInputChange("date", value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || uploadedFiles.length === 0}
              className="flex-1 bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                "Add to Story"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
