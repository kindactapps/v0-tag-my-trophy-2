export const PRICING_PLANS = {
  standard: {
    id: "standard",
    name: "Complete Memory Package",
    price: 29.99,
    annualHosting: 9.99,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID || "price_standard",
    features: [
      "Durable metal QR tag",
      "Strong adhesive backing",
      "200 photos per experience",
      "1 hour of video per experience",
      "Easy sharing with anyone",
      "Weather-resistant design",
      "Priority customer support",
      "Advanced customization options",
    ],
    limits: {
      photos: 200,
      videoMinutes: 60,
    },
    color: "bg-purple-500",
    popular: true,
  },
} as const

export type PricingPlan = keyof typeof PRICING_PLANS
export type PlanDetails = (typeof PRICING_PLANS)[PricingPlan]

export const calculateTax = (amount: number, taxRate = 0.08): number => {
  return Math.round(amount * taxRate * 100) / 100
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

export const getAnnualHostingFee = (): number => {
  return PRICING_PLANS.standard.annualHosting
}
