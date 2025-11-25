"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useDataProtection } from "@/lib/data-protection"
import { LogOut, Shield, Trash2 } from "lucide-react"

interface SecureLogoutButtonProps {
  onLogout?: () => void
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  className?: string
  showSecurityInfo?: boolean
}

export default function SecureLogoutButton({
  onLogout,
  variant = "outline",
  size = "default",
  className = "",
  showSecurityInfo = true,
}: SecureLogoutButtonProps) {
  const { secureLogout } = useDataProtection()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSecureLogout = async () => {
    setIsLoggingOut(true)

    try {
      // Perform secure cleanup
      secureLogout()

      // Call custom logout handler if provided
      if (onLogout) {
        await onLogout()
      } else {
        // Default redirect to login
        window.location.href = "/auth/login"
      }
    } catch (error) {
      console.error("[SecureLogout] Logout failed:", error)
      // Still redirect even if cleanup fails
      window.location.href = "/auth/login"
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={isLoggingOut}>
          <LogOut className="h-4 w-4 mr-2" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#c44c3a]" />
            Secure Logout
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>Are you sure you want to log out? This will securely clear all your session data.</p>

            {showSecurityInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Trash2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Security cleanup will:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Clear all stored session data</li>
                      <li>• Remove authentication cookies</li>
                      <li>• Clear browser cache and temporary files</li>
                      <li>• Delete any locally stored preferences</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSecureLogout}
            disabled={isLoggingOut}
            className="bg-[#c44c3a] hover:bg-[#a83d2e] text-white"
          >
            {isLoggingOut ? "Logging out..." : "Secure Logout"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
