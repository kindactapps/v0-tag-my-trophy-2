import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import QRCode from "qrcode"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slugId } = body

    if (!slugId) {
      return NextResponse.json({ error: "Slug ID is required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Get the slug details including owner_id to preserve the link
    const { data: slug, error: fetchError } = await supabase
      .from("qr_slugs")
      .select("id, slug, owner_id, is_claimed, claimed_at")
      .eq("id", slugId)
      .single()

    if (fetchError || !slug) {
      console.error("Slug not found:", fetchError)
      return NextResponse.json({ error: "Slug not found" }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!baseUrl) {
      console.error("NEXT_PUBLIC_SITE_URL environment variable is not set")
      return NextResponse.json({ error: "Server configuration error: NEXT_PUBLIC_SITE_URL not set" }, { status: 500 })
    }

    const url = `${baseUrl}/${slug.slug}`

    // Generate new QR code
    const dataUrl = await QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      color: {
        dark: "#2c2c2c",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })

    // Update the QR code in the database while preserving owner_id and claim status
    const { error: updateError } = await supabase
      .from("qr_slugs")
      .update({
        qr_code_url: dataUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", slugId)

    if (updateError) {
      console.error("Failed to update QR code:", updateError)
      return NextResponse.json({ error: "Failed to update QR code" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "QR code regenerated successfully",
      slug: slug.slug,
      qrCodeDataUrl: dataUrl,
      ownerId: slug.owner_id,
      isClaimed: slug.is_claimed,
    })
  } catch (error) {
    console.error("Regenerate API error:", error)
    return NextResponse.json({ error: "Failed to regenerate QR code" }, { status: 500 })
  }
}
