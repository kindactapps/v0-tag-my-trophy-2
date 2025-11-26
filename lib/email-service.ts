// Email service stub for Tag My Trophy
// TODO: Integrate with Resend or SendGrid for production

export interface OrderDetails {
  orderId: string
  customerName: string
  customerEmail: string
  plan: string
  total: number
  shippingAddress?: {
    address: string
    city: string
    state: string
    zipCode: string
  }
}

export interface TrackingInfo {
  orderId: string
  trackingNumber: string
  carrier: string
  estimatedDelivery?: string
}

export class EmailService {
  private static instance: EmailService

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendOrderConfirmation(email: string, orderDetails: OrderDetails): Promise<void> {
    console.log("[EmailService] Sending order confirmation to:", email, orderDetails)
    // TODO: Implement with Resend
    // await resend.emails.send({
    //   from: 'Tag My Trophy <orders@tagmytrophy.com>',
    //   to: email,
    //   subject: `Order Confirmed - ${orderDetails.orderId}`,
    //   html: orderConfirmationTemplate(orderDetails)
    // })
  }

  async sendShippingNotification(email: string, trackingInfo: TrackingInfo): Promise<void> {
    console.log("[EmailService] Sending shipping notification to:", email, trackingInfo)
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    console.log("[EmailService] Sending welcome email to:", email, userName)
  }

  async sendPasswordReset(email: string, resetLink: string): Promise<void> {
    console.log("[EmailService] Sending password reset to:", email)
  }

  async sendQRCodeReady(email: string, qrCodeUrl: string, storyUrl: string): Promise<void> {
    console.log("[EmailService] Sending QR code ready notification to:", email)
  }
}

export default EmailService
