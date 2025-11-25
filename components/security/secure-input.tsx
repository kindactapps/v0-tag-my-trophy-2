"use client"

import { useState, type ChangeEvent, type FocusEvent } from "react"
import { Input } from "@/components/ui/input"
import { useXSSProtection } from "@/lib/security"

interface SecureInputProps {
  type?: "text" | "email" | "password" | "url"
  name: string
  placeholder?: string
  required?: boolean
  className?: string
  maxLength?: number
  pattern?: string
  autoComplete?: string
  onValidation?: (isValid: boolean, message?: string) => void
}

export default function SecureInput({
  type = "text",
  name,
  placeholder,
  required = false,
  className = "",
  maxLength,
  pattern,
  autoComplete,
  onValidation,
}: SecureInputProps) {
  const { sanitizeText, sanitizeURL } = useXSSProtection()
  const [value, setValue] = useState("")
  const [error, setError] = useState<string>("")

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let sanitizedValue = e.target.value

    // Apply appropriate sanitization based on input type
    if (type === "url") {
      sanitizedValue = sanitizeURL(sanitizedValue)
    } else {
      sanitizedValue = sanitizeText(sanitizedValue)
    }

    setValue(sanitizedValue)

    // Clear error when user starts typing
    if (error) {
      setError("")
      onValidation?.(true)
    }
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Basic validation
    if (required && !value.trim()) {
      const errorMsg = `${name} is required`
      setError(errorMsg)
      onValidation?.(false, errorMsg)
      return
    }

    // Email validation
    if (type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        const errorMsg = "Please enter a valid email address"
        setError(errorMsg)
        onValidation?.(false, errorMsg)
        return
      }
    }

    // URL validation
    if (type === "url" && value) {
      try {
        new URL(value)
      } catch {
        const errorMsg = "Please enter a valid URL"
        setError(errorMsg)
        onValidation?.(false, errorMsg)
        return
      }
    }

    onValidation?.(true)
  }

  return (
    <div className="space-y-1">
      <Input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        className={`${className} ${error ? "border-red-500 focus:border-red-500" : ""}`}
        maxLength={maxLength}
        pattern={pattern}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
