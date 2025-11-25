import { createClient } from "@/lib/supabase/server"
import type { AuthUser } from "./types"

export type UserRole = "user" | "admin" | "super_admin"

export type Permission =
  | "read_own_content"
  | "write_own_content"
  | "delete_own_content"
  | "read_all_content"
  | "write_all_content"
  | "delete_all_content"
  | "manage_users"
  | "manage_system"
  | "view_analytics"
  | "moderate_content"

export interface RolePermissions {
  role: UserRole
  permissions: Permission[]
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: ["read_own_content", "write_own_content", "delete_own_content"],
  admin: [
    "read_own_content",
    "write_own_content",
    "delete_own_content",
    "read_all_content",
    "moderate_content",
    "view_analytics",
  ],
  super_admin: [
    "read_own_content",
    "write_own_content",
    "delete_own_content",
    "read_all_content",
    "write_all_content",
    "delete_all_content",
    "manage_users",
    "manage_system",
    "view_analytics",
    "moderate_content",
  ],
}

export class RBACManager {
  // Check if user has specific permission
  static hasPermission(user: AuthUser, permission: Permission): boolean {
    if (!user?.role) return false
    const userPermissions = ROLE_PERMISSIONS[user.role as UserRole] || []
    return userPermissions.includes(permission)
  }

  // Check if user has any of the specified permissions
  static hasAnyPermission(user: AuthUser, permissions: Permission[]): boolean {
    return permissions.some((permission) => this.hasPermission(user, permission))
  }

  // Check if user has all specified permissions
  static hasAllPermissions(user: AuthUser, permissions: Permission[]): boolean {
    return permissions.every((permission) => this.hasPermission(user, permission))
  }

  // Check if user has specific role
  static hasRole(user: AuthUser, role: UserRole): boolean {
    return user?.role === role
  }

  // Check if user has role with minimum level (user < admin < super_admin)
  static hasMinimumRole(user: AuthUser, minimumRole: UserRole): boolean {
    if (!user?.role) return false

    const roleHierarchy: Record<UserRole, number> = {
      user: 1,
      admin: 2,
      super_admin: 3,
    }

    const userLevel = roleHierarchy[user.role as UserRole] || 0
    const requiredLevel = roleHierarchy[minimumRole] || 0

    return userLevel >= requiredLevel
  }

  // Get user's permissions
  static getUserPermissions(user: AuthUser): Permission[] {
    if (!user?.role) return []
    return ROLE_PERMISSIONS[user.role as UserRole] || []
  }

  // Check if user can access resource
  static canAccessResource(user: AuthUser, resourceOwnerId: string, requiredPermission: Permission): boolean {
    // Users can always access their own resources
    if (user?.id === resourceOwnerId && this.hasPermission(user, "read_own_content")) {
      return true
    }

    // Check if user has permission to access all content
    return this.hasPermission(user, requiredPermission)
  }

  // Check if user can modify resource
  static canModifyResource(user: AuthUser, resourceOwnerId: string): boolean {
    // Users can modify their own resources
    if (user?.id === resourceOwnerId && this.hasPermission(user, "write_own_content")) {
      return true
    }

    // Check if user has permission to modify all content
    return this.hasPermission(user, "write_all_content")
  }

  // Check if user can delete resource
  static canDeleteResource(user: AuthUser, resourceOwnerId: string): boolean {
    // Users can delete their own resources
    if (user?.id === resourceOwnerId && this.hasPermission(user, "delete_own_content")) {
      return true
    }

    // Check if user has permission to delete all content
    return this.hasPermission(user, "delete_all_content")
  }
}

// Server-side role checking
export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const supabase = await createClient()

    // Check if user is super admin (from environment)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user?.email === process.env.ADMIN_EMAIL) {
      return "super_admin"
    }

    // Query user role from profiles table
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()

    return (profile?.role as UserRole) || "user"
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}

// Update user role (super admin only)
export async function updateUserRole(userId: string, newRole: UserRole, adminUser: AuthUser): Promise<boolean> {
  try {
    // Only super admins can change roles
    if (!RBACManager.hasRole(adminUser, "super_admin")) {
      throw new Error("Insufficient permissions to change user roles")
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error updating user role:", error)
    return false
  }
}
