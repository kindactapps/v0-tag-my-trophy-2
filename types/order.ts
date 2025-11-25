// Re-export OrderError from error-handling to satisfy the import in enhanced-order-management.tsx
export type { OrderError } from "@/lib/error-handling"

export interface Order {
  id: string
  orderNumber: string
  status: "pending" | "confirmed" | "generated" | "manufacturing" | "shipped" | "delivered" | "cancelled"
  customerEmail: string
  customerName: string
  shippingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  items: OrderItem[]
  total: number
  subtotal: number
  tax: number
  shipping: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  qrCodeId?: string
}
