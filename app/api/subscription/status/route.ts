import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get subscription from database
    const { data: dbSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!dbSubscription || !dbSubscription.stripe_subscription_id) {
      return NextResponse.json({ subscription: null })
    }

    // Fetch latest subscription data from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(dbSubscription.stripe_subscription_id, {
      expand: ["default_payment_method"],
    })

    // Extract payment method details
    let paymentMethod = null
    if (stripeSubscription.default_payment_method && typeof stripeSubscription.default_payment_method === "object") {
      const pm = stripeSubscription.default_payment_method as Stripe.PaymentMethod
      if (pm.card) {
        paymentMethod = {
          brand: pm.card.brand,
          last4: pm.card.last4,
        }
      }
    }

    const subscriptionData = {
      status: stripeSubscription.status,
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
      payment_method: paymentMethod,
    }

    return NextResponse.json({ subscription: subscriptionData })
  } catch (error) {
    console.error("[v0] Error fetching subscription status:", error)
    return NextResponse.json({ error: "Failed to fetch subscription status" }, { status: 500 })
  }
}
