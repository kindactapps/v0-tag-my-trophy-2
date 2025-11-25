import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
// import { verifyAdminToken } from "@/lib/admin-auth-helper"

export async function POST(request: Request) {
  try {
    const { orderId, status, trackingNumber, carrier, notes } = await request.json()

    // if (!verifyAdminToken(token)) {
    //   console.log("[v0] Unauthorized access attempt to update order")
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient()

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (trackingNumber) updateData.shipping_tracking = trackingNumber
    if (carrier) updateData.carrier = carrier
    if (notes) updateData.notes = notes

    const { error } = await adminClient.from("orders").update(updateData).eq("id", orderId)

    if (error) {
      console.error("[v0] Error updating order:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Successfully updated order:", orderId, "to status:", status)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in update order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
