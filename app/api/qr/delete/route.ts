import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slugId } = body

    if (!slugId) {
      return NextResponse.json({ error: "Slug ID is required" }, { status: 400 })
    }

    console.log("[v0] Deleting QR code/slug:", slugId)

    const supabase = await createServerClient()

    // Check if slug exists and get its details
    const { data: slug, error: fetchError } = await supabase
      .from("qr_slugs")
      .select("slug, owner_id, is_claimed")
      .eq("id", slugId)
      .single()

    if (fetchError || !slug) {
      console.error("[v0] Slug not found:", fetchError)
      return NextResponse.json({ error: "Slug not found" }, { status: 404 })
    }

    // Delete the slug
    const { error: deleteError } = await supabase.from("qr_slugs").delete().eq("id", slugId)

    if (deleteError) {
      console.error("[v0] Failed to delete slug:", deleteError)
      return NextResponse.json({ error: "Failed to delete slug" }, { status: 500 })
    }

    console.log("[v0] Successfully deleted slug:", slug.slug)

    return NextResponse.json({
      success: true,
      message: "Slug deleted successfully",
      slug: slug.slug,
      wasClaimed: slug.is_claimed,
    })
  } catch (error) {
    console.error("[v0] Delete API error:", error)
    return NextResponse.json({ error: "Failed to delete slug" }, { status: 500 })
  }
}
