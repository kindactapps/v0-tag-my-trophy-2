"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface AccessibilityContextType {
  highContrast: boolean
  reducedMotion: boolean
  fontSize: "small" | "medium" | "large"
  toggleHighContrast: () => void
  toggleReducedMotion: () => void
  setFontSize: (size: "small" | "medium" | "large") => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [fontSize, setFontSizeState] = useState<"small" | "medium" | "large">("medium")

  useEffect(() => {
    // Check for user preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const prefersHighContrast = window.matchMedia("(prefers-contrast: high)").matches

    setReducedMotion(prefersReducedMotion)
    setHighContrast(prefersHighContrast)

    // Load saved preferences
    const savedHighContrast = localStorage.getItem("accessibility_high_contrast") === "true"
    const savedReducedMotion = localStorage.getItem("accessibility_reduced_motion") === "true"
    const savedFontSize = (localStorage.getItem("accessibility_font_size") as "small" | "medium" | "large") || "medium"

    setHighContrast(savedHighContrast)
    setReducedMotion(savedReducedMotion)
    setFontSizeState(savedFontSize)
  }, [])

  useEffect(() => {
    // Apply accessibility classes to document
    const root = document.documentElement

    if (highContrast) {
      root.classList.add("high-contrast")
    } else {
      root.classList.remove("high-contrast")
    }

    if (reducedMotion) {
      root.classList.add("reduce-motion")
    } else {
      root.classList.remove("reduce-motion")
    }

    root.classList.remove("font-small", "font-medium", "font-large")
    root.classList.add(`font-${fontSize}`)
  }, [highContrast, reducedMotion, fontSize])

  const toggleHighContrast = () => {
    const newValue = !highContrast
    setHighContrast(newValue)
    localStorage.setItem("accessibility_high_contrast", newValue.toString())
  }

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion
    setReducedMotion(newValue)
    localStorage.setItem("accessibility_reduced_motion", newValue.toString())
  }

  const setFontSize = (size: "small" | "medium" | "large") => {
    setFontSizeState(size)
    localStorage.setItem("accessibility_font_size", size)
  }

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        reducedMotion,
        fontSize,
        toggleHighContrast,
        toggleReducedMotion,
        setFontSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}
