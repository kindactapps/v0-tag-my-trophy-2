import jwt from "jsonwebtoken"

// Use environment variable with fallback for development
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production"

// Session timeout: 24 hours (matching original SESSION_TIMEOUT)
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000

export interface AdminSession {
  email: string
  timestamp: number
  exp?: number
}

/**
 * Creates a JWT token for admin session
 */
export function createAdminToken(email: string): string {
  const payload: AdminSession = {
    email,
    timestamp: Date.now(),
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

/**
 * Validates and decodes an admin JWT token
 */
export function validateAdminToken(token: string): AdminSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminSession
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Refreshes an admin token (creates new token with updated timestamp)
 */
export function refreshAdminToken(token: string): string | null {
  const session = validateAdminToken(token)
  if (!session) return null
  return createAdminToken(session.email)
}

// Legacy Map-like interface for backward compatibility
// This allows existing code to work without major changes
export const adminSessions = {
  get: (token: string): AdminSession | undefined => {
    const session = validateAdminToken(token)
    return session || undefined
  },
  set: (token: string, session: AdminSession): void => {
    // No-op for JWT - token is self-contained
    console.log("[AdminSession] JWT tokens are self-contained, set() is a no-op")
  },
  has: (token: string): boolean => {
    return validateAdminToken(token) !== null
  },
  delete: (token: string): boolean => {
    // No-op for JWT - tokens expire naturally
    // In production, implement a blocklist if immediate revocation is needed
    console.log("[AdminSession] JWT logout - token will expire naturally")
    return true
  },
}

/**
 * No-op for JWT-based sessions (tokens expire naturally)
 */
export function cleanupExpiredSessions(): void {
  // JWT tokens are self-expiring, no cleanup needed
}
