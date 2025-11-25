"use client"

import { useMemo } from "react"
import { useEffect } from "react"
import { useState } from "react"

// Comprehensive security utilities for Tag My Trophy
import DOMPurify from "isomorphic-dompurify"

// Input sanitization utilities
export class SecurityUtils {
  // Sanitize HTML content to prevent XSS attacks
  static sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ol", "ul", "li", "a", "h1", "h2", "h3", "h4", "h5", "h6"],
      ALLOWED_ATTR: ["href", "target", "rel"],
      ALLOW_DATA_ATTR: false,
      FORBID_SCRIPT: true,
      FORBID_TAGS: ["script", "object", "embed", "form", "input", "textarea", "select", "button"],
      FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "onchange", "onsubmit"],
    })
  }

  // Sanitize plain text input
  static sanitizeText(text: string): string {
    if (!text) return ""

    return text
      .replace(/[<>]/g, "") // Remove angle brackets
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/data:/gi, "") // Remove data: protocol
      .replace(/vbscript:/gi, "") // Remove vbscript: protocol
      .trim()
  }

  // Sanitize URLs to prevent malicious redirects
  static sanitizeURL(url: string): string {
    if (!url) return ""

    try {
      const urlObj = new URL(url)

      // Only allow http, https, and mailto protocols
      if (!["http:", "https:", "mailto:"].includes(urlObj.protocol)) {
        return ""
      }

      // Block suspicious domains
      const suspiciousDomains = ["javascript", "data", "vbscript", "file"]
      if (suspiciousDomains.some((domain) => urlObj.hostname.includes(domain))) {
        return ""
      }

      return urlObj.toString()
    } catch {
      return ""
    }
  }

  // Generate CSRF token
  static generateCSRFToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  }

  // Validate CSRF token
  static validateCSRFToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken) return false
    return token === sessionToken
  }

  // Rate limiting helper
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>()

    return (identifier: string): boolean => {
      const now = Date.now()
      const windowStart = now - windowMs

      if (!requests.has(identifier)) {
        requests.set(identifier, [])
      }

      const userRequests = requests.get(identifier)!

      // Remove old requests outside the window
      const validRequests = userRequests.filter((time) => time > windowStart)

      if (validRequests.length >= maxRequests) {
        return false // Rate limit exceeded
      }

      validRequests.push(now)
      requests.set(identifier, validRequests)

      return true // Request allowed
    }
  }

  // Secure cookie options
  static getSecureCookieOptions(isProduction: boolean = process.env.NODE_ENV === "production") {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict" as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    }
  }

  // Password strength checker
  static checkPasswordStrength(password: string): {
    score: number
    feedback: string[]
    isStrong: boolean
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score += 1
    else feedback.push("Use at least 8 characters")

    if (password.length >= 12) score += 1
    else if (password.length >= 8) feedback.push("Consider using 12+ characters for better security")

    if (/[a-z]/.test(password)) score += 1
    else feedback.push("Include lowercase letters")

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push("Include uppercase letters")

    if (/\d/.test(password)) score += 1
    else feedback.push("Include numbers")

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
    else feedback.push("Include special characters")

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      score -= 1
      feedback.push("Avoid repeating characters")
    }

    if (/123|abc|qwe|password|admin/i.test(password)) {
      score -= 2
      feedback.push("Avoid common patterns and words")
    }

    return {
      score: Math.max(0, score),
      feedback,
      isStrong: score >= 4,
    }
  }

  // File upload security validation
  static validateFileUpload(file: File): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      errors.push("File size must be less than 10MB")
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/ogg",
    ]

    if (!allowedTypes.includes(file.type)) {
      errors.push("File type not allowed. Please use images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, OGG)")
    }

    // Check filename for suspicious patterns
    const suspiciousPatterns = [
      /\.php$/i,
      /\.asp$/i,
      /\.jsp$/i,
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.com$/i,
      /\.pif$/i,
      /\.vbs$/i,
      /\.js$/i,
      /\.jar$/i,
    ]

    if (suspiciousPatterns.some((pattern) => pattern.test(file.name))) {
      errors.push("Filename contains suspicious patterns")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Session security helpers
  static generateSessionId(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  }

  static isSessionExpired(timestamp: number, maxAge: number = 24 * 60 * 60 * 1000): boolean {
    return Date.now() - timestamp > maxAge
  }

  // Content Security Policy helper
  static getCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob:",
      "connect-src 'self' https://vercel.live https://vitals.vercel-insights.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  }
}

// XSS Protection Hook for React components
export function useXSSProtection() {
  const sanitizeAndRender = (content: string) => {
    return { __html: SecurityUtils.sanitizeHTML(content) }
  }

  const sanitizeText = (text: string) => {
    return SecurityUtils.sanitizeText(text)
  }

  const sanitizeURL = (url: string) => {
    return SecurityUtils.sanitizeURL(url)
  }

  return {
    sanitizeAndRender,
    sanitizeText,
    sanitizeURL,
  }
}

// CSRF Protection Hook
export function useCSRFProtection() {
  const [csrfToken, setCSRFToken] = useState<string>("")

  useEffect(() => {
    // Generate CSRF token on component mount
    const token = SecurityUtils.generateCSRFToken()
    setCSRFToken(token)

    document.cookie = `csrf_token=${token}; path=/; SameSite=Lax`
  }, [])

  const getCSRFHeaders = () => ({
    "X-CSRF-Token": csrfToken,
    "Content-Type": "application/json",
  })

  return {
    csrfToken,
    getCSRFHeaders,
  }
}

// Rate limiting hook for client-side
export function useRateLimit(maxRequests = 10, windowMs = 60000) {
  const rateLimiter = useMemo(() => SecurityUtils.createRateLimiter(maxRequests, windowMs), [maxRequests, windowMs])

  const checkRateLimit = (identifier = "default") => {
    return rateLimiter(identifier)
  }

  return { checkRateLimit }
}
