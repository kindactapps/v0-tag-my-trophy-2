"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Mail, Phone, MapPin, User, Shield, AlertCircle, CheckCircle, Info } from "lucide-react"
import { PRICING_PLANS, type PricingPlan, formatPrice, calculateTax } from "@/lib/pricing"
import { PaymentErrorHandler, ErrorLogger, RetryHandler } from "@/lib/error-handling"
import { PaymentErrorDisplay } from "@/components/ui/payment-error-display"
import type { PaymentError } from "@/lib/error-handling"
import StripePaymentForm from "./stripe-payment-form"

interface CheckoutFormProps {
  selectedPlan: PricingPlan
  onSubmit: (formData: CheckoutFormData) => Promise<void>
  isProcessing?: boolean
}

export interface CheckoutFormData {
  // Customer Information
  firstName: string
  lastName: string
  email: string
  phone: string

  // Shipping Address
  address: string
  city: string
  state: string
  zipCode: string
  country: string

  // QR Tag Customization
  customization?: string

  // Payment Information (handled by Stripe)
  plan: PricingPlan
  amount: number
  tax: number
  total: number
}

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
]

export default function CheckoutForm({ selectedPlan, onSubmit, isProcessing = false }: CheckoutFormProps) {
  const [formData, setFormData] = useState<Partial<CheckoutFormData>>({
    plan: selectedPlan,
    country: "US",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<PaymentError | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const plan = PRICING_PLANS[selectedPlan]
  const subtotal = plan.price
  const tax = calculateTax(subtotal)
  const total = subtotal + tax

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.firstName?.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName?.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email?.trim()) newErrors.email = "Email is required"
    if (!formData.phone?.trim()) newErrors.phone = "Phone number is required"
    if (!formData.address?.trim()) newErrors.address = "Address is required"
    if (!formData.city?.trim()) newErrors.city = "City is required"
    if (!formData.state?.trim()) newErrors.state = "State is required"
    if (!formData.zipCode?.trim()) newErrors.zipCode = "ZIP code is required"

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation - accepts (123) 456-7890, 123-456-7890, 123.456.7890, etc.
    if (formData.phone && !/^$$?([0-9]{3})$$?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    // ZIP code validation
    if (formData.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = "Please enter a valid ZIP code"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleContinueToPayment = async () => {
    if (!validateForm()) return

    const createPaymentIntent = async () => {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: selectedPlan,
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          shippingAddress: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country || "US",
          },
          customization: formData.customization,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create payment intent")
      }

      return response.json()
    }

    try {
      setPaymentError(null)

      const result = await RetryHandler.withRetry(createPaymentIntent, 3, 1000)

      setClientSecret(result.clientSecret)
      setShowPaymentForm(true)
    } catch (error: any) {
      console.error("Error creating payment intent:", error)

      const paymentError = PaymentErrorHandler.handleNetworkError(error)
      setPaymentError(paymentError)

      await ErrorLogger.logPaymentError(paymentError, {
        step: "payment_intent_creation",
        formData: {
          email: formData.email,
          plan: selectedPlan,
        },
      })
    }
  }

  const handlePaymentSuccess = async () => {
    const completeFormData: CheckoutFormData = {
      ...(formData as CheckoutFormData),
      plan: selectedPlan,
      amount: subtotal,
      tax,
      total,
    }

    await onSubmit(completeFormData)
  }

  const handlePaymentError = (error: string) => {
    const paymentError = PaymentErrorHandler.handleStripeError({ message: error })
    setPaymentError(paymentError)

    ErrorLogger.logPaymentError(paymentError, {
      step: "stripe_payment_processing",
      clientSecret: clientSecret ? "present" : "missing",
    })
  }

  const handleRetryPayment = async () => {
    setIsRetrying(true)
    try {
      await handleContinueToPayment()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-[#e5d5c8] bg-gradient-to-br from-white to-[#faf8f5]">
        <CardHeader>
          <CardTitle className="text-[#2c2c2c] flex items-center gap-2 text-2xl">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pricing Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#2c2c2c]">Initial Setup Fee</span>
                <Badge className="bg-[#c44c3a] text-white text-xs">One-time</Badge>
              </div>
              <span className="font-bold text-[#2c2c2c] text-lg">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#2c2c2c]">First Year Subscription</span>
                <Badge className="bg-green-600 text-white text-xs">FREE</Badge>
              </div>
              <span className="font-bold text-green-600 text-lg line-through decoration-2">$9.99</span>
            </div>

            <Separator className="my-3" />

            <div className="flex items-center justify-between py-3 bg-[#f5f1ed] rounded-lg px-4">
              <span className="font-bold text-[#2c2c2c] text-xl">Due Today</span>
              <span className="font-bold text-[#c44c3a] text-2xl">{formatPrice(subtotal)}</span>
            </div>
          </div>

          {/* Benefits Info Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm text-blue-900">
                <p className="font-semibold">What's included:</p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Immediate access to your profile</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>First year completely free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>After 1 year: $9.99/year automatically</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Cancel anytime from settings</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Shipping Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-900 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Your QR tag will be shipped within 3-5 business days after order confirmation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card className="border-[#e5d5c8]">
        <CardHeader>
          <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
            <User className="w-5 h-5 text-[#c44c3a]" />
            Customer Information
          </CardTitle>
          <CardDescription>We'll use this information for your order and shipping</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName || ""}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={`border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] ${
                  errors.firstName ? "border-red-500" : ""
                }`}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName || ""}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={`border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] ${
                  errors.lastName ? "border-red-500" : ""
                }`}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b5b47]" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-10 border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b5b47]" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`pl-10 border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] ${
                    errors.phone ? "border-red-500" : ""
                  }`}
                  placeholder="(555) 123-4567"
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card className="border-[#e5d5c8]">
        <CardHeader>
          <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#c44c3a]" />
            Shipping Address
          </CardTitle>
          <CardDescription>Where should we send your QR tag?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={`border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] ${
                errors.address ? "border-red-500" : ""
              }`}
              placeholder="123 Main Street"
            />
            {errors.address && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.address}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className={`border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] ${
                  errors.city ? "border-red-500" : ""
                }`}
                placeholder="San Francisco"
              />
              {errors.city && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.city}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select value={formData.state || ""} onValueChange={(value) => handleInputChange("state", value)}>
                <SelectTrigger className={`border-[#e5d5c8] ${errors.state ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.state}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={formData.zipCode || ""}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                className={`border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] ${
                  errors.zipCode ? "border-red-500" : ""
                }`}
                placeholder="94102"
              />
              {errors.zipCode && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.zipCode}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Tag Customization */}
      <Card className="border-[#e5d5c8]">
        <CardHeader>
          <CardTitle className="text-[#2c2c2c]">QR Tag Customization</CardTitle>
          <CardDescription>Add a personal touch to your QR tag (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="customization">Custom Text or Message</Label>
            <Textarea
              id="customization"
              value={formData.customization || ""}
              onChange={(e) => handleInputChange("customization", e.target.value)}
              className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a]"
              placeholder="e.g., 'Family Vacation 2024' or 'Wedding Memories'"
              maxLength={50}
            />
            <p className="text-xs text-[#6b5b47]">Maximum 50 characters. This will be engraved on your QR tag.</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Section */}
      {paymentError && (
        <PaymentErrorDisplay
          error={paymentError}
          onRetry={paymentError.retryable ? handleRetryPayment : undefined}
          onDismiss={() => setPaymentError(null)}
          className="mb-4"
        />
      )}

      {!showPaymentForm ? (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleContinueToPayment}
            disabled={isRetrying}
            className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white px-8 py-4 text-lg"
          >
            {isRetrying ? "Preparing..." : "Continue to Payment"}
            <CreditCard className="w-5 h-5 ml-2" />
          </Button>
        </div>
      ) : clientSecret ? (
        <StripePaymentForm
          clientSecret={clientSecret}
          amount={total}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      ) : (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c44c3a] mr-3"></div>
          <span className="text-[#6b5b47]">Preparing payment form...</span>
        </div>
      )}
    </div>
  )
}
