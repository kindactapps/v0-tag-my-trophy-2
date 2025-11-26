import { validateAdminToken } from "@/lib/admin-sessions"

export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token) {
    return false
  }

  const session = validateAdminToken(token)
  return session !== null
}
