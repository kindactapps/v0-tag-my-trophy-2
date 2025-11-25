"use client"

import { useState } from "react"
import { AlertCircle, RefreshCw, X, CreditCard, Wifi, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { PaymentError } from "@/lib/error-handling"

interface PaymentErrorDisplayProps {
  error: PaymentError
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function PaymentErrorDisplay({ error, onRetry, onDismiss, className }: PaymentErrorDisplayProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    if (!onRetry) return

    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  const getErrorIcon = () => {
    switch (error.type) {
      case "payment":
        return <CreditCard className="w-5 h-5 text-red-600" />
      case "network":
        return <Wifi className="w-5 h-5 text-red-600" />
      case "validation":
        return <Shield className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />
    }
  }

  const getErrorTitle = () => {
    switch (error.type) {
      case "payment":
        return "Payment Issue"
      case "network":
        return "Connection Problem"
      case "validation":
        return "Information Required"
      default:
        return "Something Went Wrong"
    }
  }

  return (
    <Card className={`border-red-200 bg-red-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getErrorIcon()}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-red-900 mb-1">{getErrorTitle()}</h3>
            <p className="text-sm text-red-800 mb-3">{error.userMessage}</p>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {error.retryable && onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Try Again
                    </>
                  )}
                </Button>
              )}

              {error.type === "payment" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
                  onClick={() => window.open("mailto:support@tagmytrophy.com", "_blank")}
                >
                  Contact Support
                </Button>
              )}
            </div>
          </div>

          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
