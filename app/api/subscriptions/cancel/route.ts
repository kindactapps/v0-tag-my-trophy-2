import { type NextRequest, NextResponse } from "next/server"
import { cancelSubscription } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("stripe_subscription_id", subscriptionId)
      .eq("user_id", user.id)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    const canceledSubscription = await cancelSubscription(subscriptionId, true)

    await supabase
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId)

    return NextResponse.json({ success: true, subscription: canceledSubscription })
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
  }
}
