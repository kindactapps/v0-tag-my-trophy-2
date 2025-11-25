// Order-related type definitions

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "generated"
  | "processing"
  | "manufacturing"
  | "packaged"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "support"

export interface OrderError {
  orderId?: string
  code: string
  message: string
  type: "order_creation" | "fulfillment" | "shipping" | "customer_service"
  severity: "low" | "medium" | "high" | "critical"
  userMessage: string
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  customerName?: string
  customerEmail?: string
  items?: OrderItem[]
  totalAmount?: number
  createdAt: string | Date
  updatedAt: string | Date
  notes?: string
  shippingAddress?: ShippingAddress
  trackingNumber?: string
  paymentIntentId?: string
  plan?: string
  planName?: string
  amount?: number
  tax?: number
  total?: number
  customization?: string
  qrSlug?: string
  metadata?: Record<string, any>
  customer?: {
    name: string
    email: string
    phone?: string
  }
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  qrCodeId?: string
}

export interface ShippingAddress {
  street?: string
  line1?: string
  city: string
  state: string
  postalCode?: string
  postal_code?: string
  country: string
}
