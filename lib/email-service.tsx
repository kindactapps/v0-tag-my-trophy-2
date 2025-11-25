interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface OrderConfirmationData {
  customerName: string
  customerEmail: string
  orderNumber: string
  plan: string
  planName: string
  total: string
  customization?: string
  shippingAddress: {
    line1: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  qrSlug?: string
}

interface WelcomeEmailData {
  customerName: string
  customerEmail: string
  qrSlug: string
  plan: string
  planName: string
}

export class EmailService {
  private static instance: EmailService
  private apiKey: string
  private fromEmail: string

  private constructor() {
    this.apiKey = process.env.RESEND_API_KEY || ""
    this.fromEmail = process.env.FROM_EMAIL || "orders@tagmytrophy.com"
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  private generateOrderConfirmationTemplate(data: OrderConfirmationData): EmailTemplate {
    const subject = `Order Confirmation - ${data.orderNumber} | Tag My Trophy`

    const htmlParts = [
      "<!DOCTYPE html>",
      "<html>",
      // Use string concatenation to avoid React interpreting as head component
      "<" + "head" + ">",
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      "<title>Order Confirmation</title>",
      "<style>",
      "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2c2c2c; margin: 0; padding: 0; background-color: #f5f0e8; }",
      ".container { max-width: 600px; margin: 0 auto; background: white; }",
      ".header { background: #c44c3a; color: white; padding: 30px; text-align: center; }",
      ".content { padding: 30px; }",
      ".order-details { background: #f5f0e8; padding: 20px; border-radius: 8px; margin: 20px 0; }",
      ".footer { background: #2c2c2c; color: white; padding: 20px; text-align: center; font-size: 14px; }",
      ".button { display: inline-block; background: #c44c3a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }",
      ".shipping-address { background: white; border: 1px solid #e5d5c8; padding: 15px; border-radius: 6px; margin: 10px 0; }",
      "</style>",
      "</" + "head" + ">",
      "<body>",
      '<div class="container">',
      '<div class="header">',
      "<h1>Order Confirmed!</h1>",
      "<p>Thank you for choosing Tag My Trophy</p>",
      "</div>",
      '<div class="content">',
      `<h2>Hi ${data.customerName},</h2>`,
      "<p>We've received your order and are excited to help you create lasting memories! Your QR tag will be manufactured and shipped to you soon.</p>",
      '<div class="order-details">',
      "<h3>Order Details</h3>",
      `<p><strong>Order Number:</strong> ${data.orderNumber}</p>`,
      `<p><strong>Plan:</strong> ${data.planName}</p>`,
      `<p><strong>Total:</strong> $${data.total}</p>`,
      data.customization ? `<p><strong>Customization:</strong> ${data.customization}</p>` : "",
      "</div>",
      '<div class="shipping-address">',
      "<h3>Shipping Address</h3>",
      "<p>",
      `${data.shippingAddress.line1}<br>`,
      `${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postal_code}<br>`,
      `${data.shippingAddress.country}`,
      "</p>",
      "</div>",
      "<h3>What's Next?</h3>",
      "<ol>",
      "<li><strong>QR Generation:</strong> We'll generate your unique QR code within 24 hours</li>",
      "<li><strong>Manufacturing:</strong> Your durable metal tag will be created (2-3 business days)</li>",
      "<li><strong>Shipping:</strong> We'll ship your tag with tracking information</li>",
      "<li><strong>Setup:</strong> Scan your tag to claim it and start adding memories!</li>",
      "</ol>",
      data.qrSlug
        ? `<p><strong>Your QR Experience is Ready!</strong></p><a href="https://tagmytrophy.com/story/${data.qrSlug}" class="button">View Your Memory Page</a>`
        : "",
      "<p>Questions? Reply to this email or contact our support team.</p>",
      "</div>",
      '<div class="footer">',
      "<p>Tag My Trophy - Turn Physical Items Into Digital Memory Collections</p>",
      "<p>© 2025 Tag My Trophy. All rights reserved.</p>",
      "</div>",
      "</div>",
      "</body>",
      "</html>",
    ]

    const html = htmlParts.join("\n")

    const text = `
      Order Confirmed - ${data.orderNumber}
      
      Hi ${data.customerName},
      
      Thank you for your order! We've received your payment and will begin processing your QR tag.
      
      Order Details:
      - Order Number: ${data.orderNumber}
      - Plan: ${data.planName}
      - Total: $${data.total}
      ${data.customization ? `- Customization: ${data.customization}` : ""}
      
      Shipping Address:
      ${data.shippingAddress.line1}
      ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postal_code}
      ${data.shippingAddress.country}
      
      What's Next:
      1. QR Generation (within 24 hours)
      2. Manufacturing (2-3 business days)
      3. Shipping with tracking
      4. Setup your memory page
      
      ${data.qrSlug ? `Your memory page: https://tagmytrophy.com/story/${data.qrSlug}` : ""}
      
      Questions? Reply to this email or contact support.
      
      Tag My Trophy Team
    `

    return { subject, html, text }
  }

  private generateWelcomeTemplate(data: WelcomeEmailData): EmailTemplate {
    const subject = `Welcome to Tag My Trophy! Your ${data.planName} experience is ready`

    const htmlParts = [
      "<!DOCTYPE html>",
      "<html>",
      // Use string concatenation to avoid React interpreting as head component
      "<" + "head" + ">",
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      "<title>Welcome to Tag My Trophy</title>",
      "<style>",
      "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2c2c2c; margin: 0; padding: 0; background-color: #f5f0e8; }",
      ".container { max-width: 600px; margin: 0 auto; background: white; }",
      ".header { background: linear-gradient(135deg, #c44c3a, #a83d2e); color: white; padding: 40px; text-align: center; }",
      ".content { padding: 30px; }",
      ".feature-box { background: #f5f0e8; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #c44c3a; }",
      ".button { display: inline-block; background: #c44c3a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 15px 0; font-weight: bold; }",
      ".footer { background: #2c2c2c; color: white; padding: 20px; text-align: center; font-size: 14px; }",
      ".tips { background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; }",
      "</style>",
      "</" + "head" + ">",
      "<body>",
      '<div class="container">',
      '<div class="header">',
      "<h1>🎉 Welcome to Tag My Trophy!</h1>",
      "<p>Your digital memory experience is ready to go</p>",
      "</div>",
      '<div class="content">',
      `<h2>Hi ${data.customerName},</h2>`,
      "<p>Congratulations! Your QR tag has been generated and your digital memory page is live. While you wait for your physical tag to arrive, you can start setting up your experience.</p>",
      `<a href="https://tagmytrophy.com/story/${data.qrSlug}" class="button">🚀 Set Up Your Memory Page</a>`,
      '<div class="feature-box">',
      `<h3>🏷️ Your ${data.planName} Plan Includes:</h3>`,
      "<ul>",
      "<li>Durable metal QR tag (shipping soon!)</li>",
      "<li>Unlimited photo and video uploads</li>",
      "<li>Easy sharing with family and friends</li>",
      "<li>Weather-resistant design</li>",
      "<li>Professional memory templates</li>",
      "</ul>",
      "</div>",
      '<div class="tips">',
      "<h3>💡 Pro Tips to Get Started:</h3>",
      "<ol>",
      "<li><strong>Claim Your Page:</strong> Visit your memory page and set it up with a title and description</li>",
      "<li><strong>Upload Memories:</strong> Add your favorite photos and videos</li>",
      "<li><strong>Customize:</strong> Choose a theme that matches your story</li>",
      "<li><strong>Share Early:</strong> Send the link to family and friends to start collecting memories</li>",
      "</ol>",
      "</div>",
      "<h3>📦 Physical Tag Status</h3>",
      "<p>Your metal QR tag is being manufactured and will ship within 2-3 business days. You'll receive tracking information once it ships.</p>",
      "<h3>Need Help?</h3>",
      "<p>Our support team is here to help! Reply to this email with any questions or visit our help center.</p>",
      "<p>Happy memory making!</p>",
      "<p><strong>The Tag My Trophy Team</strong></p>",
      "</div>",
      '<div class="footer">',
      "<p>Tag My Trophy - Turn Physical Items Into Digital Memory Collections</p>",
      "<p>© 2025 Tag My Trophy. All rights reserved.</p>",
      "</div>",
      "</div>",
      "</body>",
      "</html>",
    ]

    const html = htmlParts.join("\n")

    const text = `
      Welcome to Tag My Trophy!
      
      Hi ${data.customerName},
      
      Your QR tag has been generated and your memory page is ready!
      
      Set up your page: https://tagmytrophy.com/story/${data.qrSlug}
      
      Your ${data.planName} plan includes:
      - Durable metal QR tag (shipping soon!)
      - Unlimited photo and video uploads
      - Easy sharing capabilities
      - Weather-resistant design
      - Professional templates
      
      Pro Tips:
      1. Claim your page and add a title
      2. Upload your favorite memories
      3. Choose a theme
      4. Share with family and friends
      
      Your physical tag will ship within 2-3 business days with tracking.
      
      Need help? Reply to this email!
      
      The Tag My Trophy Team
    `

    return { subject, html, text }
  }

  async sendOrderConfirmation(data: OrderConfirmationData): Promise<boolean> {
    try {
      const template = this.generateOrderConfirmationTemplate(data)

      if (this.apiKey) {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: this.fromEmail,
            to: data.customerEmail,
            subject: template.subject,
            html: template.html,
            text: template.text,
          }),
        })

        if (!response.ok) {
          console.error("Failed to send email via Resend:", await response.text())
          return false
        }

        console.log("Order confirmation email sent successfully to:", data.customerEmail)
        return true
      } else {
        console.warn("RESEND_API_KEY not configured - email not sent")
        return false
      }
    } catch (error) {
      console.error("Failed to send order confirmation email:", error)
      return false
    }
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      const template = this.generateWelcomeTemplate(data)

      if (this.apiKey) {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: this.fromEmail,
            to: data.customerEmail,
            subject: template.subject,
            html: template.html,
            text: template.text,
          }),
        })

        if (!response.ok) {
          console.error("Failed to send email via Resend:", await response.text())
          return false
        }

        console.log("Welcome email sent successfully to:", data.customerEmail)
        return true
      } else {
        console.warn("RESEND_API_KEY not configured - email not sent")
        return false
      }
    } catch (error) {
      console.error("Failed to send welcome email:", error)
      return false
    }
  }

  async sendShippingNotification(data: {
    customerName: string
    customerEmail: string
    orderNumber: string
    trackingNumber: string
    carrier: string
  }): Promise<boolean> {
    try {
      const subject = `Your Tag My Trophy order is on the way! - ${data.orderNumber}`

      if (this.apiKey) {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Shipping Notification</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #2c2c2c;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    <div style="background: #c44c3a; color: white; padding: 30px; text-align: center;">
      <h1>Your Order is on the Way!</h1>
    </div>
    <div style="padding: 30px;">
      <h2>Hi ${data.customerName},</h2>
      <p>Great news! Your Tag My Trophy order <strong>${data.orderNumber}</strong> has shipped!</p>
      <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
      <p><strong>Carrier:</strong> ${data.carrier}</p>
      <p>Track your package at your carrier's website using the tracking number above.</p>
    </div>
  </div>
</body>
</html>
        `

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: this.fromEmail,
            to: data.customerEmail,
            subject,
            html: htmlContent,
          }),
        })

        if (!response.ok) {
          console.error("Failed to send shipping notification via Resend:", await response.text())
          return false
        }

        console.log("Shipping notification sent successfully to:", data.customerEmail)
        return true
      } else {
        console.warn("RESEND_API_KEY not configured - email not sent")
        return false
      }
    } catch (error) {
      console.error("Failed to send shipping notification:", error)
      return false
    }
  }
}
