"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { PRICING_PLANS, formatPrice } from "@/lib/pricing"

export default function PlanSelector() {
  const plan = PRICING_PLANS.standard

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#2c2c2c] mb-2">Your Memory Package</h2>
        <p className="text-[#6b5b47]">Everything you need to preserve and share your special moments</p>
      </div>

      <div className="max-w-md mx-auto">
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-purple-900">{plan.name}</h3>
              <div className="text-3xl sm:text-4xl font-bold mb-2 text-purple-900">{formatPrice(plan.price)}</div>
              <div className="text-purple-700">Plus {formatPrice(plan.annualHosting)}/year hosting</div>
            </div>

            <div className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="w-4 h-4 flex-shrink-0 text-purple-600" />
                  <span className="text-sm text-purple-900">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full py-4 text-lg rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 min-h-[44px]"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
