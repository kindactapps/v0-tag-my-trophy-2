// Comprehensive error handling utilities for Tag My Trophy payment system

export interface PaymentError {
  code: string
  message: string
  type: "payment" | "network" | "validation" | "system"
  retryable: boolean
  userMessage: string
}

export interface OrderError {
  orderId?: string
  code: string
  message: string
  type: "order_creation" | "fulfillment" | "shipping" | "customer_service"
  severity: "low" | "medium" | "high" | "critical"
  userMessage: string
}

// Payment-specific error handling
export class PaymentErrorHandler {
  static handleStripeError(error: any): PaymentError {
    const baseError = {
      type: "payment" as const,
      retryable: false,
    }

    switch (error.code) {
      case "card_declined":
        return {
          ...baseError,
          code: "CARD_DECLINED",
          message: error.message,
          userMessage: "Your card was declined. Please try a different payment method or contact your bank.",
          retryable: true,
        }

      case "insufficient_funds":
        return {
          ...baseError,
          code: "INSUFFICIENT_FUNDS",
          message: error.message,
          userMessage: "Your card has insufficient funds. Please try a different payment method.",
          retryable: true,
        }

      case "expired_card":
        return {
          ...baseError,
          code: "EXPIRED_CARD",
          message: error.message,
          userMessage: "Your card has expired. Please update your payment information.",
          retryable: true,
        }

      case "incorrect_cvc":
        return {
          ...baseError,
          code: "INCORRECT_CVC",
          message: error.message,
          userMessage: "The security code (CVC) is incorrect. Please check and try again.",
          retryable: true,
        }

      case "processing_error":
        return {
          ...baseError,
          code: "PROCESSING_ERROR",
          message: error.message,
          userMessage: "There was a temporary issue processing your payment. Please try again.",
          retryable: true,
        }

      case "rate_limit":
        return {
          ...baseError,
          code: "RATE_LIMIT",
          message: error.message,
          userMessage: "Too many payment attempts. Please wait a moment and try again.",
          retryable: true,
        }

      default:
        return {
          ...baseError,
          code: "UNKNOWN_PAYMENT_ERROR",
          message: error.message || "Unknown payment error",
          userMessage: "We encountered an issue processing your payment. Please try again or contact support.",
          retryable: true,
        }
    }
  }

  static handleNetworkError(error: any): PaymentError {
    return {
      code: "NETWORK_ERROR",
      message: error.message || "Network connection failed",
      type: "network",
      retryable: true,
      userMessage: "Connection issue detected. Please check your internet and try again.",
    }
  }

  static handleValidationError(field: string, message: string): PaymentError {
    return {
      code: "VALIDATION_ERROR",
      message: `Validation failed for ${field}: ${message}`,
      type: "validation",
      retryable: false,
      userMessage: message,
    }
  }
}

// Order management error handling
export class OrderErrorHandler {
  static handleOrderCreationError(error: any, orderData?: any): OrderError {
    return {
      orderId: orderData?.id,
      code: "ORDER_CREATION_FAILED",
      message: error.message || "Failed to create order",
      type: "order_creation",
      severity: "high",
      userMessage: "We couldn't create your order. Please try again or contact support if the issue persists.",
    }
  }

  static handleFulfillmentError(orderId: string, error: any): OrderError {
    return {
      orderId,
      code: "FULFILLMENT_ERROR",
      message: error.message || "Order fulfillment failed",
      type: "fulfillment",
      severity: "medium",
      userMessage:
        "There's an issue with your order fulfillment. Our team has been notified and will contact you soon.",
    }
  }

  static handleShippingError(orderId: string, error: any): OrderError {
    return {
      orderId,
      code: "SHIPPING_ERROR",
      message: error.message || "Shipping process failed",
      type: "shipping",
      severity: "medium",
      userMessage: "There's an issue with shipping your order. We'll update you once it's resolved.",
    }
  }

  static handleQRGenerationError(orderId: string, error: any): OrderError {
    return {
      orderId,
      code: "QR_GENERATION_FAILED",
      message: error.message || "QR code generation failed",
      type: "fulfillment",
      severity: "high",
      userMessage: "We couldn't generate your QR code. Our team will resolve this and send it to you shortly.",
    }
  }
}

// Error logging and monitoring
export class ErrorLogger {
  static async logPaymentError(error: PaymentError, context?: any) {
    const logData = {
      timestamp: new Date().toISOString(),
      type: "payment_error",
      error,
      context,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "server",
    }

    console.error("[Payment Error]", logData)

    // In production, send to monitoring service
    if (process.env.NODE_ENV === "production") {
      try {
        await fetch("/api/errors/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(logData),
        })
      } catch (loggingError) {
        console.error("[Error Logging Failed]", loggingError)
      }
    }
  }

  static async logOrderError(error: OrderError, context?: any) {
    const logData = {
      timestamp: new Date().toISOString(),
      type: "order_error",
      error,
      context,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "server",
    }

    console.error("[Order Error]", logData)

    // In production, send to monitoring service
    if (process.env.NODE_ENV === "production") {
      try {
        await fetch("/api/errors/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(logData),
        })
      } catch (loggingError) {
        console.error("[Error Logging Failed]", loggingError)
      }
    }
  }
}

// Retry logic for recoverable errors
export class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
  ): Promise<T> {
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error

        if (attempt === maxRetries) {
          throw error
        }

        // Check if error is retryable
        const isRetryable = this.isRetryableError(error)
        if (!isRetryable) {
          throw error
        }

        // Wait before retry with exponential backoff
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  private static isRetryableError(error: any): boolean {
    // Network errors are retryable
    if (error.code === "NETWORK_ERROR" || error.name === "NetworkError") {
      return true
    }

    // Temporary server errors are retryable
    if (error.status >= 500 && error.status < 600) {
      return true
    }

    // Rate limiting is retryable
    if (error.status === 429 || error.code === "rate_limit") {
      return true
    }

    // Stripe-specific retryable errors
    const retryableStripeCodes = ["processing_error", "rate_limit", "api_connection_error", "api_error"]

    if (retryableStripeCodes.includes(error.code)) {
      return true
    }

    return false
  }
}
