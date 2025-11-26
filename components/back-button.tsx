"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export default function BackButton({ href, label = "Back", className = "" }: BackButtonProps) {
  const router = useRouter()
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    // Check if the user came from within our app by looking at the referrer
    const referrer = document.referrer
    const currentOrigin = window.location.origin
    const hasInternalReferrer = referrer && referrer.startsWith(currentOrigin)
    setCanGoBack(hasInternalReferrer && window.history.length > 1)
  }, [])

  const handleBack = () => {
    if (href) {
      router.push(href)
    } else if (canGoBack) {
      router.back()
    } else {
      router.push("/")
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className={`flex items-center gap-2 text-[#2c2c2c] hover:text-[#c44c3a] hover:bg-[#e8ddd0] mb-4 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  )
}
