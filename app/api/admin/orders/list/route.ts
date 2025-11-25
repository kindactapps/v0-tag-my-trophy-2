import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
// import { verifyAdminToken } from "@/lib/admin-auth-helper"

export async function POST(request: Request) {
  try {
    // const body = await request.json()
    // const { token } = body

    // if (!verifyAdminToken(token)) {
    //   console.log("[v0] Unauthorized access attempt to list orders")
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // Use admin client for database operations (bypasses RLS)
    const adminClient = createAdminClient()

    const { data: orders, error } = await adminClient
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching orders:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Successfully fetched", orders?.length || 0, "orders")
    return NextResponse.json({ orders })
  } catch (error) {
    console.error("[v0] Error in list orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
