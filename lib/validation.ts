// Form validation utilities with warm, helpful messaging for Tag My Trophy

export interface ValidationResult {
  isValid: boolean
  message?: string
}

export interface FormErrors {
  [key: string]: string
}

import { SecurityUtils } from "./security"

// Email validation
export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { isValid: false, message: "We'd love to stay connected! Please enter your email address." }
  }

  // Sanitize input first
  const sanitizedEmail = SecurityUtils.sanitizeText(email)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sanitizedEmail)) {
    return { isValid: false, message: "That email doesn't look quite right. Could you double-check it?" }
  }

  // Check for suspicious patterns
  if (sanitizedEmail.includes("javascript:") || sanitizedEmail.includes("<script")) {
    return { isValid: false, message: "Please enter a valid email address." }
  }

  return { isValid: true }
}

// Password validation with strength requirements
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, message: "A strong password helps keep your memories safe. Please create one." }
  }

  const strengthCheck = SecurityUtils.checkPasswordStrength(password)

  if (!strengthCheck.isStrong) {
    return {
      isValid: false,
      message: strengthCheck.feedback.join(". ") + ".",
    }
  }

  return { isValid: true }
}

// Username validation
export function validateUsername(username: string): ValidationResult {
  if (!username.trim()) {
    return { isValid: false, message: "Choose a username that represents you and your stories." }
  }

  // Sanitize input
  const sanitizedUsername = SecurityUtils.sanitizeText(username)

  if (sanitizedUsername.length < 3) {
    return { isValid: false, message: "Your username should be at least 3 characters long." }
  }

  if (sanitizedUsername.length > 20) {
    return { isValid: false, message: "Keep your username under 20 characters so it's easy to remember." }
  }

  const usernameRegex = /^[a-zA-Z0-9_-]+$/
  if (!usernameRegex.test(sanitizedUsername)) {
    return {
      isValid: false,
      message: "Usernames can only contain letters, numbers, hyphens, and underscores.",
    }
  }

  // Check for inappropriate content
  const inappropriateWords = ["admin", "root", "system", "null", "undefined", "script"]
  if (inappropriateWords.some((word) => sanitizedUsername.toLowerCase().includes(word))) {
    return {
      isValid: false,
      message: "Please choose a different username.",
    }
  }

  return { isValid: true }
}

// Required field validation
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value.trim()) {
    return { isValid: false, message: `${fieldName} is required to continue.` }
  }
  return { isValid: true }
}

// File validation for uploads
export interface FileValidationOptions {
  maxSize: number // in MB
  allowedTypes: string[]
  maxFiles?: number
}

export function validateFiles(files: File[], options: FileValidationOptions): ValidationResult {
  if (files.length === 0) {
    return { isValid: false, message: "Please select at least one file to upload." }
  }

  if (options.maxFiles && files.length > options.maxFiles) {
    return {
      isValid: false,
      message: `You can upload up to ${options.maxFiles} files at once. Try selecting fewer files.`,
    }
  }

  for (const file of files) {
    // Use security validation
    const securityCheck = SecurityUtils.validateFileUpload(file)
    if (!securityCheck.isValid) {
      return {
        isValid: false,
        message: securityCheck.errors[0],
      }
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > options.maxSize) {
      return {
        isValid: false,
        message: `"${file.name}" is too large. Please choose files under ${options.maxSize}MB.`,
      }
    }

    // Check file type
    const isValidType = options.allowedTypes.some((type) => {
      if (type.includes("*")) {
        const baseType = type.split("/")[0]
        return file.type.startsWith(baseType)
      }
      return file.type === type
    })

    if (!isValidType) {
      const typesList = options.allowedTypes
        .map((type) => {
          if (type === "image/*") return "images"
          if (type === "video/*") return "videos"
          return type.split("/")[1]?.toUpperCase() || type
        })
        .join(", ")

      return {
        isValid: false,
        message: `"${file.name}" isn't a supported file type. We accept ${typesList}.`,
      }
    }
  }

  return { isValid: true }
}

// Network/connection error messages
export function getNetworkErrorMessage(error: any): string {
  if (!navigator.onLine) {
    return "It looks like you're offline. Please check your internet connection and try again."
  }

  if (error?.code === "NETWORK_ERROR" || error?.message?.includes("fetch")) {
    return "We're having trouble connecting right now. Please try again in a moment."
  }

  if (error?.status === 500) {
    return "Our servers are taking a quick break. Please try again in a few minutes."
  }

  if (error?.status === 404) {
    return "We couldn't find what you're looking for. The page might have moved."
  }

  if (error?.status === 403) {
    return "You don't have permission to access this. Please check your login status."
  }

  return "Something unexpected happened. Please try again, and contact us if the problem continues."
}

// Success messages
export const successMessages = {
  accountCreated: "Welcome to Tag My Trophy! Your account is ready and your story space is waiting.",
  loginSuccess: "Welcome back! Ready to add more memories to your collection?",
  uploadSuccess: "Your memories have been safely uploaded and are ready to share!",
  profileUpdated: "Your profile changes have been saved successfully.",
  passwordChanged: "Your password has been updated. Your account is secure.",
  qrGenerated: "Your QR code is ready! Anyone can scan it to view your story.",
  memoryAdded: "Your new memory has been added to your collection.",
  commentAdded: "Thank you for sharing your thoughts! Your comment has been posted.",
  inviteSent: "Invitation sent! They'll receive an email to join your memory collection.",
}

// Form validation helper
export function validateForm(
  data: Record<string, any>,
  rules: Record<string, (value: any) => ValidationResult>,
): {
  isValid: boolean
  errors: FormErrors
} {
  const errors: FormErrors = {}
  let isValid = true

  for (const [field, validator] of Object.entries(rules)) {
    const result = validator(data[field])
    if (!result.isValid) {
      errors[field] = result.message || "This field is invalid"
      isValid = false
    }
  }

  return { isValid, errors }
}
