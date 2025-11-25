"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import CheckoutForm, { type CheckoutFormData } from "@/components/checkout/checkout-form"
import type { PricingPlan } from "@/lib/pricing"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"
import { PRICING_PLANS, formatPrice } from "@/lib/pricing"

export default function CheckoutPage() {
  const [selectedPlan] = useState<PricingPlan>("standard")
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleCheckoutSubmit = async (formData: CheckoutFormData) => {
    setIsProcessing(true)

    try {
      // This will be implemented in the next task with Stripe integration
      console.log("Processing order:", formData)

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to success page
      router.push("/checkout/success")
    } catch (error) {
      console.error("Payment failed:", error)
      // Handle error - show error message
    } finally {
      setIsProcessing(false)
    }
  }

  const plan = PRICING_PLANS.standard

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5d5c8] px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#2c2c2c] hover:text-[#c44c3a] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#2c2c2c]">Complete Your Order</h1>
              <p className="text-[#6b5b47]">Review your order and complete your purchase</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-white border-[#e8ddd0] shadow-lg sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#2c2c2c] mb-4">Your Plan</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xl font-bold text-[#2c2c2c]">{plan.name}</div>
                    <div className="text-3xl font-bold text-[#c44c3a] mt-2">{formatPrice(plan.price)}</div>
                    <div className="text-sm text-[#666] mt-1">+ {formatPrice(plan.annualHosting)}/year hosting</div>
                  </div>
                  <div className="border-t border-[#e8ddd0] pt-4 space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-[#c44c3a] flex-shrink-0" />
                        <span className="text-sm text-[#2c2c2c]">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <CheckoutForm selectedPlan={selectedPlan} onSubmit={handleCheckoutSubmit} isProcessing={isProcessing} />
          </div>
        </div>
      </div>
    </div>
  )
}
