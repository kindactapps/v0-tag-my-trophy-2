import { NextResponse } from "next/server"

export async function GET() {
  try {
    const token = crypto.randomUUID()
    console.log("[v0] Generated crypto token:", token)

    return NextResponse.json({
      token,
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.log("[v0] Crypto error:", error)

    return NextResponse.json(
      {
        error: "Failed to generate token",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
