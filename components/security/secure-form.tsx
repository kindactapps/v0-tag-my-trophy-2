"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import { useCSRFProtection, useRateLimit } from "@/lib/security"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SecureFormProps {
  onSubmit: (data: FormData, csrfToken: string) => Promise<void>
  children: ReactNode
  className?: string
  submitText?: string
  maxSubmissions?: number
  cooldownMs?: number
}

export default function SecureForm({
  onSubmit,
  children,
  className = "",
  submitText = "Submit",
  maxSubmissions = 5,
  cooldownMs = 60000,
}: SecureFormProps) {
  const { csrfToken, getCSRFHeaders } = useCSRFProtection()
  const { checkRateLimit } = useRateLimit(maxSubmissions, cooldownMs)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>("")
  const [rateLimited, setRateLimited] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    // Check rate limit
    if (!checkRateLimit("form_submission")) {
      setRateLimited(true)
      setError("Too many submissions. Please wait a moment before trying again.")
      return
    }

    setRateLimited(false)
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      await onSubmit(formData, csrfToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* CSRF Token */}
      <input type="hidden" name="csrf_token" value={csrfToken} />

      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {children}

      <Button type="submit" disabled={isSubmitting || rateLimited || !csrfToken} className="w-full">
        {isSubmitting ? "Submitting..." : submitText}
      </Button>

      {rateLimited && (
        <p className="text-sm text-amber-600 mt-2">Rate limit active. Please wait before submitting again.</p>
      )}
    </form>
  )
}
