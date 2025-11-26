import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden", message: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()

    const { quantity, slugIds, manufacturerInfo, csvContent } = body

    // Generate order number
    const orderNumber = `MFG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Create manufacturer order
    const { data: order, error: orderError } = await supabase
      .from("manufacturer_orders")
      .insert({
        order_number: orderNumber,
        quantity,
        status: "pending",
        manufacturer_name: manufacturerInfo.name,
        manufacturer_email: manufacturerInfo.email,
        manufacturer_company: manufacturerInfo.company,
        manufacturer_phone: manufacturerInfo.phone,
        notes: manufacturerInfo.notes,
        order_csv_content: csvContent,
      })
      .select()
      .single()

    if (orderError) {
      console.error("[v0] Error creating manufacturer order:", orderError)
      return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
    }

    // Update slugs with manufacturer_order_id and status
    const { error: updateError } = await supabase
      .from("qr_slugs")
      .update({
        manufacturer_order_id: order.id,
        status: "manufacturing",
      })
      .in("id", slugIds)

    if (updateError) {
      console.error("[v0] Error updating slugs:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update slugs" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        quantity: order.quantity,
        status: order.status,
        createdAt: order.created_at,
      },
    })
  } catch (error) {
    console.error("[v0] Error in create manufacturer order:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
