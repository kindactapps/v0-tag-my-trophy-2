import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Verify admin authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to check admin role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { qr_code_ids, store_id } = body

    if (!qr_code_ids || !Array.isArray(qr_code_ids) || qr_code_ids.length === 0) {
      return NextResponse.json({ error: "QR code IDs are required" }, { status: 400 })
    }

    // If store_id is null, we're unassigning
    const updateData: any = {
      assigned_store_id: store_id || null,
      status: store_id ? "in_store" : "available",
      assigned_at: store_id ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    // If assigning to a store, get the store name for location field
    if (store_id) {
      const { data: store } = await supabase.from("stores").select("name").eq("id", store_id).single()

      if (store) {
        updateData.location = store.name
      }
    } else {
      updateData.location = null
    }

    // Update QR codes
    const { data: updatedQRCodes, error } = await supabase
      .from("qr_codes")
      .update(updateData)
      .in("id", qr_code_ids)
      .select()

    if (error) {
      console.error("Error assigning QR codes to store:", error)
      return NextResponse.json({ error: "Failed to assign QR codes" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      updated_count: updatedQRCodes?.length || 0,
      qr_codes: updatedQRCodes,
    })
  } catch (error) {
    console.error("Error in assign-store POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
