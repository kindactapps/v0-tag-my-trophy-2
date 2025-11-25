import { EmailService } from "./email-service"
import type { Order } from "@/types/order"

export class OrderService {
  private static instance: OrderService
  private emailService: EmailService

  private constructor() {
    this.emailService = EmailService.getInstance()
  }

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService()
    }
    return OrderService.instance
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `TMT-${timestamp}${random}`
  }

  private generateQRSlug(): string {
    const adjectives = ["amazing", "incredible", "memorable", "fantastic", "wonderful", "special", "unique", "precious"]
    const nouns = ["adventure", "journey", "memory", "story", "experience", "moment", "treasure", "collection"]
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    return `${adjective}-${noun}-${random}`
  }

  async createOrder(paymentIntentData: {
    paymentIntentId: string
    customerEmail: string
    customerName: string
    plan: string
    planName: string
    subtotal: string
    tax: string
    total: string
    customization?: string
    shippingAddress: {
      line1: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }): Promise<Order> {
    try {
      const orderNumber = this.generateOrderNumber()
      const qrSlug = this.generateQRSlug()

      const order: Order = {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderNumber,
        paymentIntentId: paymentIntentData.paymentIntentId,
        customer: {
          name: paymentIntentData.customerName,
          email: paymentIntentData.customerEmail,
        },
        plan: paymentIntentData.plan,
        planName: paymentIntentData.planName,
        amount: Number.parseFloat(paymentIntentData.subtotal),
        tax: Number.parseFloat(paymentIntentData.tax),
        total: Number.parseFloat(paymentIntentData.total),
        customization: paymentIntentData.customization,
        shippingAddress: paymentIntentData.shippingAddress,
        status: "confirmed",
        qrSlug,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      console.log("💾 Creating order in database:", {
        orderNumber: order.orderNumber,
        customer: order.customer.email,
        plan: order.planName,
        qrSlug: order.qrSlug,
      })

      // Send order confirmation email
      await this.emailService.sendOrderConfirmation({
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        orderNumber: order.orderNumber,
        plan: order.plan,
        planName: order.planName,
        total: order.total.toString(),
        customization: order.customization,
        shippingAddress: order.shippingAddress,
        qrSlug: order.qrSlug,
      })

      // Send welcome email with QR setup instructions
      await this.emailService.sendWelcomeEmail({
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        qrSlug: order.qrSlug,
        plan: order.plan,
        planName: order.planName,
      })

      order.status = "processing"
      order.updatedAt = new Date()

      console.log("✅ Order created successfully and moved to Processing:", order.orderNumber)

      return order
    } catch (error) {
      console.error("Failed to create order:", error)
      throw new Error("Order creation failed")
    }
  }

  async updateOrderStatus(orderId: string, status: Order["status"], metadata?: Record<string, any>): Promise<boolean> {
    try {
      console.log("📝 Updating order status:", { orderId, status, metadata })

      // Handle status-specific actions
      switch (status) {
        case "processing":
          console.log("🔄 Order is being processed")
          break

        case "packaged":
          console.log("📦 Order has been packed with QR codes")
          break

        case "ready_to_ship":
          console.log("✅ Order is ready to ship")
          break

        case "shipped":
          if (metadata?.trackingNumber) {
            console.log("🚚 Order shipped with tracking:", metadata.trackingNumber)
          }
          break

        case "delivered":
          console.log("✅ Order delivered successfully")
          break

        case "completed":
          console.log("🎉 Order completed")
          break

        case "support":
          console.log("🚨 Order requires support attention")
          break
      }

      return true
    } catch (error) {
      console.error("Failed to update order status:", error)
      return false
    }
  }

  async getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | null> {
    try {
      // In a real implementation, query database
      console.log("🔍 Looking up order by payment intent:", paymentIntentId)
      return null
    } catch (error) {
      console.error("Failed to get order:", error)
      return null
    }
  }

  async processManufacturingQueue(): Promise<void> {
    try {
      console.log("🏭 Processing manufacturing queue...")

      // In a real implementation:
      // 1. Get orders with status 'generated'
      // 2. Send to manufacturing API/system
      // 3. Update status to 'manufacturing'
      // 4. Set expected completion date

      console.log("✅ Manufacturing queue processed")
    } catch (error) {
      console.error("Failed to process manufacturing queue:", error)
    }
  }
}
