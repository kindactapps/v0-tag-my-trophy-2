import { type NextRequest, NextResponse } from "next/server"
import { adminSessions, cleanupExpiredSessions } from "@/lib/admin-sessions"

export async function POST(request: NextRequest) {
  try {
    // Clean up expired sessions periodically
    cleanupExpiredSessions()

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    // Compare with environment variables
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      console.error("[v0] Admin credentials not configured in environment variables")
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 })
    }

    if (email === adminEmail && password === adminPassword) {
      // Generate session token using crypto.randomUUID()
      const token = crypto.randomUUID()

      // Store session in memory Map
      adminSessions.set(token, {
        email,
        timestamp: Date.now(),
      })

      console.log("[v0] Admin login successful for:", email)
      return NextResponse.json({ success: true, token })
    } else {
      console.log("[v0] Invalid admin credentials attempted for:", email)
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    return NextResponse.json({ success: false, error: "Login failed. Please try again." }, { status: 500 })
  }
}
