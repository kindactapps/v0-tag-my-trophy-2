import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
// import { SecurityUtils } from "./lib/security"

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, number[]>()

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1"

  response.headers.set("X-DNS-Prefetch-Control", "on")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set("Content-Security-Policy", "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:")

  // HSTS header for HTTPS
  if (request.nextUrl.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
  }

  const isAdminRoute =
    request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/api/admin")

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Skip Supabase-dependent features if not configured
  } else {
    try {
      response = await updateSession(request)
    } catch (error) {
      console.error("[v0] Supabase middleware error:", error)
      // Continue with fallback response if Supabase fails
    }
  }

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const rateLimitKey = `rate_limit_${ip}`

    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute
    const maxRequests = request.nextUrl.pathname.includes("/auth/") ? 5 : 100 // Stricter for auth endpoints

    if (!rateLimitMap.has(rateLimitKey)) {
      rateLimitMap.set(rateLimitKey, [])
    }

    const requests = rateLimitMap.get(rateLimitKey)!
    const validRequests = requests.filter((time) => now - time < windowMs)

    if (validRequests.length >= maxRequests) {
      return new NextResponse(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      })
    }

    validRequests.push(now)
    rateLimitMap.set(rateLimitKey, validRequests)

    response.headers.set("X-RateLimit-Limit", maxRequests.toString())
    response.headers.set("X-RateLimit-Remaining", (maxRequests - validRequests.length).toString())
    response.headers.set("X-RateLimit-Reset", (now + windowMs).toString())
  }

  // CSRF protection for POST requests to API routes
  if (request.method === "POST" && request.nextUrl.pathname.startsWith("/api/")) {
    const csrfToken = request.headers.get("X-CSRF-Token")
    const sessionToken = request.cookies.get("csrf_token")?.value

    if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
      return new NextResponse(JSON.stringify({ error: "Invalid CSRF token" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  // GDPR compliance - check for consent
  if (!request.cookies.get("cookie_consent")) {
    response.headers.set("X-Show-Cookie-Banner", "true")
  }

  // Security monitoring for suspicious patterns
  const suspiciousPatterns = [
    /\.\./, // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript protocol
    /data:/i, // Data protocol
  ]

  const url = request.nextUrl.toString()
  const userAgent = request.headers.get("user-agent") || ""

  if (suspiciousPatterns.some((pattern) => pattern.test(url) || pattern.test(userAgent))) {
    console.warn(`[SECURITY] Suspicious request detected: ${ip} - ${url}`)
    // In production, you might want to block these requests or log to a security service
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
