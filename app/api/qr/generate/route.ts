import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import QRCode from "qrcode"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", message: "Please log in to continue" }, { status: 401 })
    }

    const body = await request.json()
    const { slugs } = body

    if (!slugs || !Array.isArray(slugs)) {
      return NextResponse.json({ error: "Invalid request. Expected array of slugs." }, { status: 400 })
    }

    console.log("[v0] Generating QR codes for", slugs.length, "slugs")

    // Generate QR codes for each slug
    const qrCodes = await Promise.all(
      slugs.map(async (slug: { id: string; slug: string; url: string }) => {
        try {
          // Generate QR code as data URL
          const dataUrl = await QRCode.toDataURL(slug.url, {
            width: 512,
            margin: 2,
            color: {
              dark: "#2c2c2c",
              light: "#ffffff",
            },
            errorCorrectionLevel: "M",
          })

          console.log("[v0] Generated QR code for slug:", slug.slug)

          const { error: updateError } = await supabase
            .from("qr_slugs")
            .update({
              qr_code_url: dataUrl,
              status: "available",
              updated_at: new Date().toISOString(),
            })
            .eq("id", slug.id)

          if (updateError) {
            console.error("[v0] Failed to save QR code to database:", updateError)
            return {
              id: slug.id,
              slug: slug.slug,
              qrCodeDataUrl: dataUrl,
              success: false,
              error: "Failed to save QR code to database",
            }
          }

          return {
            id: slug.id,
            slug: slug.slug,
            qrCodeDataUrl: dataUrl,
            success: true,
          }
        } catch (error) {
          console.error("[v0] Failed to generate QR code for slug:", slug.slug, error)
          return {
            id: slug.id,
            slug: slug.slug,
            qrCodeDataUrl: null,
            success: false,
            error: "Failed to generate QR code",
          }
        }
      }),
    )

    const successCount = qrCodes.filter((qr) => qr.success).length
    console.log("[v0] Successfully generated and saved", successCount, "of", slugs.length, "QR codes")

    return NextResponse.json({
      success: true,
      qrCodes,
      successCount,
      totalCount: slugs.length,
    })
  } catch (error) {
    console.error("[v0] QR generation API error:", error)
    return NextResponse.json({ error: "Failed to generate QR codes" }, { status: 500 })
  }
}
