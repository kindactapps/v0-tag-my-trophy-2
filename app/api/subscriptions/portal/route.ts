import { type NextRequest, NextResponse } from "next/server"
import { createBillingPortalSession } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json()

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
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
      .eq("stripe_customer_id", customerId)
      .eq("user_id", user.id)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl) {
      return NextResponse.json({ error: "Server configuration error: NEXT_PUBLIC_SITE_URL not set" }, { status: 500 })
    }

    const returnUrl = `${siteUrl}/dashboard/settings`
    const session = await createBillingPortalSession(customerId, returnUrl)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating billing portal session:", error)
    return NextResponse.json({ error: "Failed to create billing portal session" }, { status: 500 })
  }
}
