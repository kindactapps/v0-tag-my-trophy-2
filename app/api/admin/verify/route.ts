import { type NextRequest, NextResponse } from "next/server"
import { adminSessions, cleanupExpiredSessions, SESSION_TIMEOUT } from "@/lib/admin-sessions"

export async function POST(request: NextRequest) {
  try {
    // Clean up expired sessions periodically
    cleanupExpiredSessions()

    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ valid: false })
    }

    const session = adminSessions.get(token)

    if (!session) {
      return NextResponse.json({ valid: false })
    }

    // Check if session has expired
    const now = Date.now()
    if (now - session.timestamp > SESSION_TIMEOUT) {
      adminSessions.delete(token)
      return NextResponse.json({ valid: false })
    }

    // Update timestamp to extend session
    session.timestamp = now
    adminSessions.set(token, session)

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("[v0] Admin verify error:", error)
    return NextResponse.json({ valid: false })
  }
}
