import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // requests
const RATE_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests", message: "Rate limit exceeded. Try again later." },
        { status: 429 },
      )
    }

    const errorData = await request.json()

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[Error Log]", errorData)
    }

    // In production, you would send this to your monitoring service
    if (process.env.NODE_ENV === "production") {
      console.error("[Production Error]", JSON.stringify(errorData, null, 2))
    }

    // Store critical errors in database for admin review
    if (errorData.error?.severity === "critical" || errorData.error?.type === "payment") {
      // TODO: Store in database for admin dashboard
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Error Logging Failed]", error)
    return NextResponse.json({ success: false, error: "Failed to log error" }, { status: 500 })
  }
}
