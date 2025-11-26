import { type NextRequest, NextResponse } from "next/server"
import { validateAdminToken, refreshAdminToken } from "@/lib/admin-sessions"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ valid: false })
    }

    const session = validateAdminToken(token)

    if (!session) {
      return NextResponse.json({ valid: false })
    }

    const newToken = refreshAdminToken(token)

    return NextResponse.json({
      valid: true,
      // Return new token if client wants to extend session
      token: newToken || token,
    })
  } catch (error) {
    console.error("[v0] Admin verify error:", error)
    return NextResponse.json({ valid: false })
  }
}
