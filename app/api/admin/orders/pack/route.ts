import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
// import { verifyAdminToken } from "@/lib/admin-auth-helper"

export async function POST(request: Request) {
  try {
    const { orderId, scannedCodes, orderNumber } = await request.json()

    // if (!verifyAdminToken(token)) {
    //   console.log("[v0] Unauthorized access attempt to pack order")
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient()

    // Link QR codes to order in junction table
    const junctionRecords = scannedCodes.map((code: any) => ({
      order_id: orderId,
      qr_code_id: code.id,
    }))

    const { error: junctionError } = await adminClient.from("order_qr_codes").insert(junctionRecords)

    if (junctionError) {
      console.error("[v0] Error creating junction records:", junctionError)
      return NextResponse.json({ error: junctionError.message }, { status: 500 })
    }

    // Update QR codes status to Packaged and link to order
    const { error: qrError } = await adminClient
      .from("qr_codes")
      .update({
        status: "Packaged",
        assigned_order_id: orderId,
        updated_at: new Date().toISOString(),
      })
      .in(
        "id",
        scannedCodes.map((code: any) => code.id),
      )

    if (qrError) {
      console.error("[v0] Error updating QR codes:", qrError)
      return NextResponse.json({ error: qrError.message }, { status: 500 })
    }

    // Update order status to Packaged
    const { error: orderError } = await adminClient
      .from("orders")
      .update({
        status: "packaged",
        packed_at: new Date().toISOString(),
        assigned_qr_codes: scannedCodes.map((code: any) => code.qrCodeId),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (orderError) {
      console.error("[v0] Error updating order:", orderError)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Log audit trail
    const auditRecords = scannedCodes.map((code: any) => ({
      order_id: orderId,
      qr_code_id: code.qrCodeId,
      action: "completed",
      metadata: { order_number: orderNumber },
    }))

    await adminClient.from("pack_scan_audit_log").insert(auditRecords)

    console.log("[v0] Successfully packed order:", orderNumber, "with", scannedCodes.length, "QR codes")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in pack order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
