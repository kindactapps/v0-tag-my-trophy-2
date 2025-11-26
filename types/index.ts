// ============================================
// MEMORY & STORY TYPES
// ============================================

export interface Memory {
  id: number | string
  type: "photo" | "video" | "story"
  url?: string
  title?: string
  caption?: string
  content?: string
  date: string
  location?: string
  thumbnail?: string
  created_at?: string
  updated_at?: string
}

export interface StoryOwner {
  id?: string
  name: string
  bio: string
  avatar: string
  createdAt?: string
}

export interface CustomField {
  id: number
  field_label: string
  field_value: string
}

export interface Story {
  id: string
  slug?: string
  claimed: boolean
  owner: StoryOwner
  viewCount: number
  memories: Memory[]
  customFields?: CustomField[]
  isPrivate?: boolean
  requirePassword?: boolean
  allowComments?: boolean
  allowSharing?: boolean
}

// ============================================
// USER & AUTH TYPES
// ============================================

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
}

// ============================================
// CHECKOUT & ORDER TYPES
// ============================================

export interface CheckoutShippingAddress {
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface CheckoutFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  customization?: string
  plan: string
  amount: number
  tax: number
  total: number
}

// Re-export from order.ts for convenience
export type { Order, OrderItem, OrderStatus, OrderError, ShippingAddress } from "./order"

// ============================================
// PROFILE CUSTOMIZATION TYPES
// ============================================

export interface ProfileCustomization {
  name: string
  bio: string
  avatar?: string
  theme?: string
  layout?: string
  background?: string
  showViewCount?: boolean
  allowComments?: boolean
  isPrivate?: boolean
}

// ============================================
// PRIVACY SETTINGS TYPES
// ============================================

export interface PrivacySettings {
  isPrivate: boolean
  allowComments: boolean
  allowSharing: boolean
  requirePassword: boolean
  password?: string
  allowedViewers?: string[]
}

// ============================================
// QR CODE TYPES
// ============================================

export interface QRCode {
  id: string
  code: string
  user_id: string | null
  story_id: string | null
  claimed: boolean
  claimed_at: string | null
  created_at: string
}

// ============================================
// MANUFACTURER ORDER TYPES
// ============================================

export type ManufacturerOrderStatus = "pending" | "in_production" | "shipped" | "delivered"

export interface ManufacturerOrder {
  id: string
  order_id: string
  quantity: number
  status: ManufacturerOrderStatus
  qr_codes: string[]
  created_at: string
  updated_at: string
}

// ============================================
// COLLECTION TYPES
// ============================================

export interface Collection {
  id: string
  title: string
  theme: string
  description: string
  coverImage: string
  createdAt: string
  isPrivate: boolean
  viewCount: number
  memoryCount: number
  memories: Memory[]
}
