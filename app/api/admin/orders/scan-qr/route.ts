import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
// import { verifyAdminToken } from "@/lib/admin-auth-helper"

export async function POST(request: Request) {
  try {
    const { qrCodeId } = await request.json()

    // if (!verifyAdminToken(token)) {
    //   console.log("[v0] Unauthorized access attempt to scan QR code")
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient()

    const { data: qrCode, error } = await adminClient.from("qr_codes").select("*").eq("qr_code_id", qrCodeId).single()

    if (error || !qrCode) {
      console.log("[v0] QR code not found:", qrCodeId)
      return NextResponse.json({ error: "QR code not found" }, { status: 404 })
    }

    // Check if QR code is available
    if (qrCode.status !== "Available" && qrCode.status !== "In Stock") {
      console.log("[v0] QR code unavailable:", qrCodeId, "status:", qrCode.status)
      return NextResponse.json(
        { error: `QR code is currently ${qrCode.status}`, status: qrCode.status },
        { status: 400 },
      )
    }

    console.log("[v0] Successfully scanned QR code:", qrCodeId)
    return NextResponse.json({ qrCode })
  } catch (error) {
    console.error("[v0] Error scanning QR code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
