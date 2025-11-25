import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify admin status
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { subscriptionId, action } = await request.json()

    if (!subscriptionId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let result

    switch (action) {
      case "cancel":
        // Cancel subscription at period end
        result = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        })

        // Update database
        await supabase
          .from("subscriptions")
          .update({
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId)

        // Log event
        await supabase.from("subscription_events").insert({
          subscription_id: subscriptionId,
          event_type: "subscription.canceled_by_admin",
          event_data: { canceled_by: user.id },
        })

        break

      case "pause":
        // Pause subscription
        result = await stripe.subscriptions.update(subscriptionId, {
          pause_collection: {
            behavior: "mark_uncollectible",
          },
        })

        await supabase
          .from("subscriptions")
          .update({
            status: "paused",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId)

        break

      case "resume":
        // Resume subscription
        result = await stripe.subscriptions.update(subscriptionId, {
          pause_collection: null,
        })

        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId)

        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, subscription: result })
  } catch (error) {
    console.error("Error managing subscription:", error)
    return NextResponse.json({ error: "Failed to manage subscription" }, { status: 500 })
  }
}
