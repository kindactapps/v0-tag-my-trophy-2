import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

function parseQrCodeId(id: string): { prefix: string; number: number } {
  // Format: qr00001 or qrA00001
  const match = id.match(/^qr([A-Z]?)(\d+)$/)
  if (!match) {
    throw new Error(`Invalid QR code ID format: ${id}`)
  }
  return {
    prefix: match[1] || "",
    number: Number.parseInt(match[2], 10),
  }
}

function formatQrCodeId(prefix: string, number: number): string {
  // Format number with leading zeros (5 digits)
  const paddedNumber = number.toString().padStart(5, "0")
  return `qr${prefix}${paddedNumber}`
}

function incrementQrCodeId(id: string): string {
  const { prefix, number } = parseQrCodeId(id)

  // If we reach 99999, switch to next prefix
  if (number >= 99999) {
    const nextPrefix = prefix ? String.fromCharCode(prefix.charCodeAt(0) + 1) : "A"
    return formatQrCodeId(nextPrefix, 1)
  }

  return formatQrCodeId(prefix, number + 1)
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { quantity } = body

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ success: false, error: "Invalid quantity" }, { status: 400 })
    }

    console.log("[v0] Generating", quantity, "sequential QR code IDs")

    const { data: startId, error } = await supabase.rpc("generate_qr_code_id")

    if (error) {
      console.error("[v0] Error generating starting QR code ID:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!startId) {
      return NextResponse.json({ success: false, error: "Failed to generate starting ID" }, { status: 500 })
    }

    // Generate sequential IDs by incrementing in JavaScript
    const qrCodeIds: string[] = []
    let currentId = startId

    for (let i = 0; i < quantity; i++) {
      qrCodeIds.push(currentId)
      if (i < quantity - 1) {
        currentId = incrementQrCodeId(currentId)
      }
    }

    console.log("[v0] Generated QR code IDs:", qrCodeIds)

    return NextResponse.json({
      success: true,
      qrCodeIds: qrCodeIds,
      count: qrCodeIds.length,
    })
  } catch (error) {
    console.error("[v0] Error in generate QR code IDs:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
