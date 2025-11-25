"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDataProtection } from "@/lib/data-protection"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"

interface SecureContentEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  className?: string
  showSecurityStatus?: boolean
}

export default function SecureContentEditor({
  value,
  onChange,
  placeholder = "Share your story...",
  maxLength = 5000,
  className = "",
  showSecurityStatus = true,
}: SecureContentEditorProps) {
  const { validateContent } = useDataProtection()
  const [validationResult, setValidationResult] = useState<any>(null)
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    if (!value.trim()) {
      setValidationResult(null)
      return
    }

    setIsValidating(true)
    const timeoutId = setTimeout(() => {
      const result = validateContent(value, maxLength)
      setValidationResult(result)
      setIsValidating(false)

      // Update parent with sanitized content if different
      if (result.sanitizedContent !== value) {
        onChange(result.sanitizedContent)
      }
    }, 500) // Debounce validation

    return () => clearTimeout(timeoutId)
  }, [value, maxLength, validateContent, onChange])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const getCharacterCountColor = () => {
    const percentage = (value.length / maxLength) * 100
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 75) return "text-amber-600"
    return "text-[#6b5b47]"
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <Textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`
            min-h-[120px] resize-none border-[#e8ddd0] focus:border-[#c44c3a]
            ${validationResult && !validationResult.isValid ? "border-red-500 focus:border-red-500" : ""}
          `}
          maxLength={maxLength}
        />

        {isValidating && (
          <div className="absolute top-2 right-2">
            <Shield className="h-4 w-4 text-[#c44c3a] animate-pulse" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {showSecurityStatus && validationResult && (
            <div className="flex items-center gap-1">
              {validationResult.isValid ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-red-600" />
              )}
              <span className={validationResult.isValid ? "text-green-600" : "text-red-600"}>
                {validationResult.isValid ? "Content secure" : "Content issues detected"}
              </span>
            </div>
          )}
        </div>

        <span className={getCharacterCountColor()}>
          {value.length} / {maxLength}
        </span>
      </div>

      {validationResult && validationResult.warnings.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="space-y-1">
              <p className="font-medium">Content Security Warnings:</p>
              <ul className="text-sm space-y-1">
                {validationResult.warnings.map((warning: string, index: number) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {showSecurityStatus && (
        <div className="text-xs text-[#6b5b47] bg-[#f5f0e8] p-2 rounded border border-[#e8ddd0]">
          <div className="flex items-center gap-1 mb-1">
            <Shield className="h-3 w-3 text-[#c44c3a]" />
            <span className="font-medium">Security Features Active:</span>
          </div>
          <ul className="space-y-0.5 ml-4">
            <li>• HTML content is automatically sanitized</li>
            <li>• Malicious scripts and links are blocked</li>
            <li>• Content is validated for safety before saving</li>
          </ul>
        </div>
      )}
    </div>
  )
}
