import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { orderId, fulfillmentCsvContent } = body

    console.log("[v0] Processing fulfillment for order:", orderId)

    // Parse the fulfillment CSV
    // Expected format: Slug,URL,QR Code ID,Status,Date
    const lines = fulfillmentCsvContent.split("\n").filter((line: string) => line.trim())
    const headers = lines[0].split(",")

    console.log("[v0] CSV headers:", headers)

    // Find the indices for slug and qr_code_id
    const slugIndex = headers.findIndex((h: string) => h.toLowerCase().includes("slug"))
    const qrCodeIdIndex = headers.findIndex(
      (h: string) => h.toLowerCase().includes("qr code id") || h.toLowerCase().includes("qrcodeid"),
    )

    if (slugIndex === -1) {
      return NextResponse.json({ success: false, error: "CSV must contain a 'Slug' column" }, { status: 400 })
    }

    const updates = []
    const errors = []

    // Process each row (skip header)
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",")
      const slug = row[slugIndex]?.trim()
      const qrCodeId = qrCodeIdIndex !== -1 ? row[qrCodeIdIndex]?.trim() : null

      if (!slug) continue

      console.log("[v0] Processing slug:", slug, "with QR code ID:", qrCodeId)

      // Update the slug in database
      const updateData: any = {
        status: "available",
      }

      if (qrCodeId) {
        updateData.qr_code_id = qrCodeId
      }

      const { error } = await supabase
        .from("qr_slugs")
        .update(updateData)
        .eq("slug", slug)
        .eq("manufacturer_order_id", orderId)

      if (error) {
        console.error("[v0] Error updating slug:", slug, error)
        errors.push({ slug, error: error.message })
      } else {
        updates.push(slug)
      }
    }

    console.log("[v0] Updated", updates.length, "slugs, errors:", errors.length)

    // Update the manufacturer order
    const { error: orderError } = await supabase
      .from("manufacturer_orders")
      .update({
        status: "fulfilled",
        fulfillment_csv_content: fulfillmentCsvContent,
      })
      .eq("id", orderId)

    if (orderError) {
      console.error("[v0] Error updating order:", orderError)
      return NextResponse.json({ success: false, error: "Failed to update order status" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      updatedCount: updates.length,
      errorCount: errors.length,
      errors,
    })
  } catch (error) {
    console.error("[v0] Error in fulfill manufacturer order:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
