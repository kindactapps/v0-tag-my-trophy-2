import { type NextRequest, NextResponse } from "next/server"
import { OrderService } from "@/lib/order-service"
import { NotificationService } from "@/lib/notification-service"

export async function POST(request: NextRequest) {
  try {
    const orderService = OrderService.getInstance()
    const notificationService = NotificationService.getInstance()

    // Process manufacturing queue
    await orderService.processManufacturingQueue()

    return NextResponse.json({ success: true, message: "Manufacturing queue processed" })
  } catch (error) {
    console.error("Failed to process manufacturing queue:", error)
    return NextResponse.json({ error: "Failed to process manufacturing queue" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status, trackingNumber, carrier } = body

    const orderService = OrderService.getInstance()
    const notificationService = NotificationService.getInstance()

    // Update order status
    const metadata = trackingNumber ? { trackingNumber, carrier } : undefined
    await orderService.updateOrderStatus(orderId, status, metadata)

    // Send appropriate notifications
    if (status === "shipped" && trackingNumber) {
      // In a real implementation, get order details from database
      await notificationService.sendOrderNotification(
        "customer@example.com", // Would get from order
        "shipped",
        {
          orderNumber: "TMT-123456", // Would get from order
          message: `Your order has shipped! Track it with: ${trackingNumber}`,
          metadata: { trackingNumber, carrier },
        },
      )
    }

    return NextResponse.json({ success: true, message: "Order status updated" })
  } catch (error) {
    console.error("Failed to update order status:", error)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}
