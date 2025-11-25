import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { name, location, contact_person, phone, email, address, max_capacity, store_type, is_active } = body

    // Update store
    const { data: store, error } = await supabase
      .from("stores")
      .update({
        name,
        location,
        contact_person,
        phone,
        email,
        address,
        max_capacity,
        store_type,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating store:", error)
      return NextResponse.json({ error: "Failed to update store" }, { status: 500 })
    }

    return NextResponse.json({ store })
  } catch (error) {
    console.error("Error in store PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if store has assigned QR codes
    const { data: qrCodes } = await supabase.from("qr_codes").select("id").eq("assigned_store_id", params.id).limit(1)

    if (qrCodes && qrCodes.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete store with assigned QR codes. Please reassign them first." },
        { status: 400 },
      )
    }

    // Delete store
    const { error } = await supabase.from("stores").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting store:", error)
      return NextResponse.json({ error: "Failed to delete store" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in store DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
