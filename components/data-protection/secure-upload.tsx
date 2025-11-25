"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useDataProtection } from "@/lib/data-protection"
import { Shield, Upload, CheckCircle, AlertTriangle, Info } from "lucide-react"

interface SecureUploadProps {
  onUpload: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  className?: string
}

export default function SecureUpload({
  onUpload,
  accept = "image/*,video/*",
  multiple = true,
  maxFiles = 10,
  className = "",
}: SecureUploadProps) {
  const { processFiles } = useDataProtection()
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [securityReport, setSecurityReport] = useState<any>(null)
  const [showReport, setShowReport] = useState(false)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setIsProcessing(true)
    setProgress(0)
    setSecurityReport(null)

    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const result = await processFiles(files)

      clearInterval(progressInterval)
      setProgress(100)
      setSecurityReport(result.securityReport)

      if (result.processedFiles.length > 0) {
        onUpload(result.processedFiles)
      }

      setTimeout(() => {
        setIsProcessing(false)
        setProgress(0)
      }, 1000)
    } catch (error) {
      console.error("[SecureUpload] Processing failed:", error)
      setIsProcessing(false)
      setProgress(0)
    }

    // Clear the input
    event.target.value = ""
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="border-[#e8ddd0]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2c2c2c]">
            <Shield className="h-5 w-5 text-[#c44c3a]" />
            Secure File Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Privacy Protection Active</p>
                <ul className="text-xs space-y-1">
                  <li>• EXIF data and location information will be removed from photos</li>
                  <li>• Video metadata will be scrubbed for privacy</li>
                  <li>• Files are scanned for security threats</li>
                  <li>• All uploads are encrypted in transit and at rest</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="relative">
            <input
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
              disabled={isProcessing}
              className="hidden"
              id="secure-file-upload"
            />
            <label
              htmlFor="secure-file-upload"
              className={`
                flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all
                ${
                  isProcessing
                    ? "border-[#c44c3a] bg-[#c44c3a]/5 cursor-not-allowed"
                    : "border-gray-300 hover:border-[#c44c3a] hover:bg-[#f5f0e8]"
                }
              `}
            >
              {isProcessing ? (
                <div className="text-center space-y-3">
                  <Shield className="h-8 w-8 text-[#c44c3a] mx-auto animate-pulse" />
                  <div className="space-y-2">
                    <p className="text-[#c44c3a] font-medium">Processing files securely...</p>
                    <Progress value={progress} className="w-48 mx-auto" />
                    <p className="text-sm text-[#6b5b47]">{progress}% complete</p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-600 font-medium">Click to upload files</p>
                    <p className="text-sm text-gray-400 mt-1">Photos and videos up to {maxFiles} files</p>
                  </div>
                </div>
              )}
            </label>
          </div>

          {securityReport && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-[#2c2c2c]">Security Report</h4>
                <Button variant="outline" size="sm" onClick={() => setShowReport(!showReport)} className="text-xs">
                  {showReport ? "Hide Details" : "Show Details"}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {securityReport.filesProcessed} Files Processed
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {securityReport.metadataRemoved} Privacy Protected
                    </span>
                  </div>
                </div>

                {securityReport.securityIssues.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">
                        {securityReport.securityIssues.length} Issues Found
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {showReport && (
                <div className="space-y-3 pt-3 border-t border-[#e8ddd0]">
                  {securityReport.privacyProtections.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-green-800 mb-2">Privacy Protections Applied:</h5>
                      <ul className="text-xs text-green-700 space-y-1">
                        {securityReport.privacyProtections.map((protection: string, index: number) => (
                          <li key={index}>• {protection}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {securityReport.securityIssues.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-amber-800 mb-2">Security Issues:</h5>
                      <ul className="text-xs text-amber-700 space-y-1">
                        {securityReport.securityIssues.map((issue: string, index: number) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
