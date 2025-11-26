import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { OrderService } from "@/lib/order-service"
import { NotificationService } from "@/lib/notification-service"

async function verifyAdmin(supabase: any) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { authorized: false, status: 401, error: "Unauthorized" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    return { authorized: false, status: 403, error: "Admin access required" }
  }

  return { authorized: true, user, profile }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const authResult = await verifyAdmin(supabase)
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

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
    const supabase = await createClient()

    const authResult = await verifyAdmin(supabase)
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const body = await request.json()
    const { orderId, status, trackingNumber, carrier } = body

    const orderService = OrderService.getInstance()
    const notificationService = NotificationService.getInstance()

    // Update order status
    const metadata = trackingNumber ? { trackingNumber, carrier } : undefined
    await orderService.updateOrderStatus(orderId, status, metadata)

    // Send appropriate notifications
    if (status === "shipped" && trackingNumber) {
      await notificationService.sendOrderNotification("customer@example.com", "shipped", {
        orderNumber: "TMT-123456",
        message: `Your order has shipped! Track it with: ${trackingNumber}`,
        metadata: { trackingNumber, carrier },
      })
    }

    return NextResponse.json({ success: true, message: "Order status updated" })
  } catch (error) {
    console.error("Failed to update order status:", error)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}
