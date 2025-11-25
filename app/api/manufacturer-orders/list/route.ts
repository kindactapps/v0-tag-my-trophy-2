import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all manufacturer orders
    const { data: orders, error } = await supabase
      .from("manufacturer_orders")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching manufacturer orders:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
    }

    // For each order, count the slugs
    const ordersWithCounts = await Promise.all(
      (orders || []).map(async (order) => {
        const { count } = await supabase
          .from("qr_slugs")
          .select("*", { count: "exact", head: true })
          .eq("manufacturer_order_id", order.id)

        return {
          ...order,
          slugCount: count || 0,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      orders: ordersWithCounts,
    })
  } catch (error) {
    console.error("[v0] Error in list manufacturer orders:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
