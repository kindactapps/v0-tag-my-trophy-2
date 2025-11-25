// In-memory session storage for admin authentication
// In production, this should be replaced with Redis or similar persistent storage
export interface AdminSession {
  email: string
  timestamp: number
}

export const adminSessions = new Map<string, AdminSession>()

// Session timeout: 24 hours
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000

// Clean up expired sessions
export function cleanupExpiredSessions() {
  const now = Date.now()
  for (const [token, session] of adminSessions.entries()) {
    if (now - session.timestamp > SESSION_TIMEOUT) {
      adminSessions.delete(token)
    }
  }
}
