import { type NextRequest, NextResponse } from "next/server"
import { adminSessions } from "@/lib/admin-sessions"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (token && adminSessions.has(token)) {
      adminSessions.delete(token)
      console.log("[v0] Admin session logged out")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Admin logout error:", error)
    return NextResponse.json({ success: true }) // Always return success for logout
  }
}
