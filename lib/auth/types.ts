export type UserRole = "user" | "admin" | "super_admin"

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  profile: UserProfile | null
  name?: string
  avatar_url?: string
  role?: string
  created_at?: string
  updated_at?: string
}
