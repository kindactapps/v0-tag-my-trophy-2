import { type NextRequest, NextResponse } from "next/server"
import { createPaymentIntent } from "@/lib/stripe"
import { PRICING_PLANS, calculateTax } from "@/lib/pricing"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      plan,
      customerEmail,
      customerName,
      shippingAddress,
      customization,
    }: {
      plan: keyof typeof PRICING_PLANS
      customerEmail: string
      customerName: string
      shippingAddress: {
        address: string
        city: string
        state: string
        zipCode: string
        country: string
      }
      customization?: string
    } = body

    // Validate plan
    if (!PRICING_PLANS[plan]) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 })
    }

    const planDetails = PRICING_PLANS[plan]
    const subtotal = planDetails.price
    const tax = calculateTax(subtotal)
    const total = subtotal + tax

    const paymentIntent = await createPaymentIntent({
      amount: total,
      customerEmail,
      customerName,
      shippingAddress: {
        line1: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.zipCode,
        country: shippingAddress.country,
      },
      metadata: {
        plan,
        planName: planDetails.name,
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        total: total.toString(),
        customization: customization || "",
        customerEmail,
        customerName,
        type: "initial_purchase",
        createSubscription: "true",
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: paymentIntent.customer,
      amount: total,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
