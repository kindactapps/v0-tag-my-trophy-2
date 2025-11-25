import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
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

    // Get all stores
    const { data: stores, error } = await supabase.from("stores").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error fetching stores:", error)
      return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 })
    }

    return NextResponse.json({ stores })
  } catch (error) {
    console.error("Error in stores GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    const { name, location, contact_person, phone, email, address, max_capacity, store_type } = body

    // Validate required fields
    if (!name || !location) {
      return NextResponse.json({ error: "Name and location are required" }, { status: 400 })
    }

    // Create store
    const { data: store, error } = await supabase
      .from("stores")
      .insert({
        name,
        location,
        contact_person,
        phone,
        email,
        address,
        max_capacity,
        store_type: store_type || "retail",
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating store:", error)
      return NextResponse.json({ error: "Failed to create store" }, { status: 500 })
    }

    return NextResponse.json({ store }, { status: 201 })
  } catch (error) {
    console.error("Error in stores POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
