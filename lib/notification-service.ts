export interface Notification {
  id: string
  type: "order_confirmed" | "qr_generated" | "manufacturing" | "shipped" | "delivered" | "support"
  title: string
  message: string
  data?: Record<string, any>
  createdAt: Date
  read: boolean
}

type AlertType =
  | "new_order"
  | "payment_failed"
  | "dispute_created"
  | "support_request"
  | "subscription_created"
  | "subscription_updated"
  | "subscription_canceled"
  | "subscription_trial_ending"
  | "invoice_paid"
  | "invoice_payment_failed"
  | "customer_created"
  | "payment_intent_succeeded"
  | "payment_intent_failed"
  | "qr_claimed"

export class NotificationService {
  private static instance: NotificationService

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async sendOrderNotification(
    customerEmail: string,
    type: Notification["type"],
    data: {
      orderNumber: string
      message: string
      metadata?: Record<string, any>
    },
  ): Promise<boolean> {
    try {
      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        title: this.getNotificationTitle(type),
        message: data.message,
        data: {
          orderNumber: data.orderNumber,
          ...data.metadata,
        },
        createdAt: new Date(),
        read: false,
      }

      // Production logging - only essential info
      if (process.env.NODE_ENV === "development") {
        console.log("🔔 Sending notification:", {
          to: customerEmail,
          type: notification.type,
          title: notification.title,
          orderNumber: data.orderNumber,
        })
      }

      // In a real implementation:
      // 1. Save notification to database
      // 2. Send push notification if user has app
      // 3. Send SMS if enabled
      // 4. Update user's notification feed

      return true
    } catch (error) {
      console.error("Failed to send notification:", error)
      return false
    }
  }

  private getNotificationTitle(type: Notification["type"]): string {
    const titles = {
      order_confirmed: "Order Confirmed",
      qr_generated: "QR Code Ready",
      manufacturing: "In Production",
      shipped: "Order Shipped",
      delivered: "Order Delivered",
      support: "Support Needed",
    }
    return titles[type] || "Order Update"
  }

  async sendAdminAlert(type: AlertType, data: Record<string, any>): Promise<boolean> {
    try {
      // Production logging - only in development
      if (process.env.NODE_ENV === "development") {
        console.log("🚨 Admin alert:", { type, data })
      }

      // In a real implementation:
      // 1. Send to admin dashboard
      // 2. Send email to admin team
      // 3. Send Slack notification
      // 4. Log to monitoring system

      return true
    } catch (error) {
      console.error("Failed to send admin alert:", error)
      return false
    }
  }
}
