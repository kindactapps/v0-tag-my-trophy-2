import { type NextRequest, NextResponse } from "next/server"
import { adminSessions } from "@/lib/admin-sessions"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    // Client should delete the token from localStorage
    if (token) {
      adminSessions.delete(token)
      console.log("[v0] Admin session logged out (client should delete token)")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Admin logout error:", error)
    return NextResponse.json({ success: true }) // Always return success for logout
  }
}
