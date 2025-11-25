"use client"

import { useEffect } from "react"

import { useState } from "react"

// Privacy and GDPR compliance utilities for Tag My Trophy

export interface PrivacySettings {
  cookieConsent: boolean
  analyticsConsent: boolean
  marketingConsent: boolean
  functionalConsent: boolean
  consentDate: string
  consentVersion: string
}

export interface GDPRRequest {
  type: "export" | "delete" | "rectify" | "restrict"
  userId: string
  email: string
  reason?: string
  requestDate: string
  status: "pending" | "processing" | "completed" | "rejected"
}

export interface DataExport {
  personalInfo: {
    name: string
    email: string
    username: string
    createdAt: string
    lastLogin: string
  }
  collections: Array<{
    id: string
    title: string
    description: string
    createdAt: string
    isPublic: boolean
  }>
  uploads: Array<{
    filename: string
    uploadDate: string
    fileSize: number
    fileType: string
  }>
  activityLog: Array<{
    action: string
    timestamp: string
    ipAddress?: string
  }>
}

export class PrivacyManager {
  private static readonly CONSENT_VERSION = "1.0"
  private static readonly STORAGE_KEY = "privacy_settings"
  private static readonly CONSENT_EXPIRY = 365 * 24 * 60 * 60 * 1000 // 1 year

  // Get current privacy settings
  static getPrivacySettings(): PrivacySettings | null {
    if (typeof window === "undefined") return null

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      const settings = JSON.parse(stored) as PrivacySettings

      // Check if consent has expired
      const consentDate = new Date(settings.consentDate)
      const now = new Date()
      if (now.getTime() - consentDate.getTime() > this.CONSENT_EXPIRY) {
        this.clearPrivacySettings()
        return null
      }

      return settings
    } catch {
      return null
    }
  }

  // Save privacy settings
  static savePrivacySettings(settings: Partial<PrivacySettings>): void {
    if (typeof window === "undefined") return

    const currentSettings = this.getPrivacySettings()
    const newSettings: PrivacySettings = {
      cookieConsent: settings.cookieConsent ?? false,
      analyticsConsent: settings.analyticsConsent ?? false,
      marketingConsent: settings.marketingConsent ?? false,
      functionalConsent: settings.functionalConsent ?? true, // Always true for basic functionality
      consentDate: new Date().toISOString(),
      consentVersion: this.CONSENT_VERSION,
      ...currentSettings,
      ...settings,
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newSettings))

    // Trigger consent change event
    window.dispatchEvent(
      new CustomEvent("privacySettingsChanged", {
        detail: newSettings,
      }),
    )
  }

  // Clear privacy settings
  static clearPrivacySettings(): void {
    if (typeof window === "undefined") return

    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem("cookie_consent")
    localStorage.removeItem("cookie_consent_date")

    // Clear analytics cookies if they exist
    document.cookie = "_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "_gid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "_gat=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
  }

  // Check if consent is required
  static isConsentRequired(): boolean {
    const settings = this.getPrivacySettings()
    return !settings || !settings.cookieConsent
  }

  // Get cookie categories that user has consented to
  static getConsentedCategories(): string[] {
    const settings = this.getPrivacySettings()
    if (!settings) return ["functional"] // Always allow functional cookies

    const categories: string[] = ["functional"]
    if (settings.analyticsConsent) categories.push("analytics")
    if (settings.marketingConsent) categories.push("marketing")

    return categories
  }

  // Generate data export for GDPR compliance
  static async generateDataExport(userId: string): Promise<DataExport> {
    // In a real app, this would fetch from your database
    // This is a mock implementation
    return {
      personalInfo: {
        name: "User Name",
        email: "user@example.com",
        username: "username",
        createdAt: "2024-01-01T00:00:00Z",
        lastLogin: new Date().toISOString(),
      },
      collections: [
        {
          id: "1",
          title: "My Collection",
          description: "A sample collection",
          createdAt: "2024-01-01T00:00:00Z",
          isPublic: false,
        },
      ],
      uploads: [
        {
          filename: "photo.jpg",
          uploadDate: "2024-01-01T00:00:00Z",
          fileSize: 1024000,
          fileType: "image/jpeg",
        },
      ],
      activityLog: [
        {
          action: "login",
          timestamp: new Date().toISOString(),
        },
      ],
    }
  }

  // Create GDPR request
  static createGDPRRequest(type: GDPRRequest["type"], email: string, reason?: string): GDPRRequest {
    return {
      type,
      userId: "current-user-id", // In real app, get from auth context
      email,
      reason,
      requestDate: new Date().toISOString(),
      status: "pending",
    }
  }

  // Privacy policy content
  static getPrivacyPolicyContent() {
    return {
      lastUpdated: "2024-01-01",
      sections: [
        {
          title: "Information We Collect",
          content: `We collect information you provide directly to us, such as when you create an account, upload content, or contact us for support. This includes your name, email address, username, and any content you choose to share through our service.`,
        },
        {
          title: "How We Use Your Information",
          content: `We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.`,
        },
        {
          title: "Information Sharing",
          content: `We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with service providers who assist us in operating our website and conducting our business.`,
        },
        {
          title: "Data Security",
          content: `We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.`,
        },
        {
          title: "Your Rights",
          content: `You have the right to access, update, or delete your personal information. You may also object to or restrict certain processing of your data. To exercise these rights, please contact us using the information provided below.`,
        },
        {
          title: "Cookies and Tracking",
          content: `We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser or our cookie preference center.`,
        },
      ],
    }
  }
}

// React hook for privacy management
export function usePrivacy() {
  const [settings, setSettings] = useState<PrivacySettings | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const currentSettings = PrivacyManager.getPrivacySettings()
    setSettings(currentSettings)
    setShowBanner(PrivacyManager.isConsentRequired())

    // Listen for privacy settings changes
    const handleSettingsChange = (event: CustomEvent<PrivacySettings>) => {
      setSettings(event.detail)
      setShowBanner(false)
    }

    window.addEventListener("privacySettingsChanged", handleSettingsChange as EventListener)

    return () => {
      window.removeEventListener("privacySettingsChanged", handleSettingsChange as EventListener)
    }
  }, [])

  const updateSettings = (newSettings: Partial<PrivacySettings>) => {
    PrivacyManager.savePrivacySettings(newSettings)
  }

  const acceptAll = () => {
    updateSettings({
      cookieConsent: true,
      analyticsConsent: true,
      marketingConsent: true,
      functionalConsent: true,
    })
  }

  const acceptEssential = () => {
    updateSettings({
      cookieConsent: true,
      analyticsConsent: false,
      marketingConsent: false,
      functionalConsent: true,
    })
  }

  const rejectAll = () => {
    updateSettings({
      cookieConsent: false,
      analyticsConsent: false,
      marketingConsent: false,
      functionalConsent: true,
    })
  }

  return {
    settings,
    showBanner,
    updateSettings,
    acceptAll,
    acceptEssential,
    rejectAll,
    isConsentRequired: PrivacyManager.isConsentRequired(),
    consentedCategories: PrivacyManager.getConsentedCategories(),
  }
}
