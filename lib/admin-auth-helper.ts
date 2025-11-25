import { adminSessions, cleanupExpiredSessions, SESSION_TIMEOUT } from "@/lib/admin-sessions"

export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token) {
    return false
  }

  cleanupExpiredSessions()

  const session = adminSessions.get(token)

  if (!session) {
    return false
  }

  // Check if session has expired
  const now = Date.now()
  if (now - session.timestamp > SESSION_TIMEOUT) {
    adminSessions.delete(token)
    return false
  }

  // Update timestamp to extend session
  session.timestamp = now
  adminSessions.set(token, session)

  return true
}
