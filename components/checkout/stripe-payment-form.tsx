"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, CreditCard, AlertCircle, CheckCircle } from "lucide-react"
import { STRIPE_CONFIG } from "@/lib/stripe"
import { formatPrice } from "@/lib/pricing"

const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey)

interface StripePaymentFormProps {
  clientSecret: string
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
}

function PaymentForm({ clientSecret, amount, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      })

      if (error) {
        setErrorMessage(error.message || "An error occurred during payment")
        onError(error.message || "Payment failed")
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess()
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred"
      setErrorMessage(errorMsg)
      onError(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-[#e5d5c8]">
        <CardHeader>
          <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-600" />
            Payment Information
          </CardTitle>
          <CardDescription>Your payment information is encrypted and secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Accepted Payment Methods</span>
            </div>
            <p className="text-sm text-blue-700">
              We accept all major credit cards, Apple Pay, Google Pay, and other digital wallets.
            </p>
          </div>

          <div className="border border-[#e5d5c8] rounded-lg p-4">
            <PaymentElement
              options={{
                layout: "tabs",
                paymentMethodOrder: ["card", "apple_pay", "google_pay"],
              }}
            />
          </div>

          {errorMessage && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Secure Payment Guarantee</span>
            </div>
            <p className="text-sm text-green-700">
              Your payment is protected by 256-bit SSL encryption and processed securely by Stripe.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          type="submit"
          size="lg"
          disabled={!stripe || !elements || isProcessing}
          className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white px-8 py-4 text-lg min-w-[200px]"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              Complete Payment {formatPrice(amount)}
              <Lock className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs text-[#6b5b47]">
          By completing your payment, you agree to our Terms of Service and Privacy Policy.
          <br />
          Your order will be processed immediately and your QR tag will ship within 1-2 business days.
        </p>
      </div>
    </form>
  )
}

export default function StripePaymentForm({ clientSecret, amount, onSuccess, onError }: StripePaymentFormProps) {
  const [stripeLoaded, setStripeLoaded] = useState(false)

  useEffect(() => {
    stripePromise.then(() => setStripeLoaded(true))
  }, [])

  if (!stripeLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c44c3a] mr-3"></div>
        <span className="text-[#6b5b47]">Loading secure payment form...</span>
      </div>
    )
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#c44c3a",
        colorBackground: "#ffffff",
        colorText: "#2c2c2c",
        colorDanger: "#df1b41",
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm clientSecret={clientSecret} amount={amount} onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}
