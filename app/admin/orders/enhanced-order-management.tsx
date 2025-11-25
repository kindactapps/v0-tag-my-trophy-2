"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderErrorHandler, ErrorLogger } from "@/lib/error-handling"
import { AlertTriangle, CheckCircle, Package, Truck, RefreshCw } from "lucide-react"
import type { Order, OrderError } from "@/types/order" // Import Order and OrderError

interface OrderWithErrors extends Order {
  errors?: OrderError[]
  lastErrorAt?: string
  errorCount?: number
}

export function EnhancedOrderManagement() {
  const [orders, setOrders] = useState<OrderWithErrors[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderWithErrors | null>(null)
  const [isProcessingAction, setIsProcessingAction] = useState(false)
  const [actionError, setActionError] = useState<OrderError | null>(null)

  // Enhanced order status update with error handling
  const updateOrderStatus = async (orderId: string, newStatus: Order["status"], notes?: string) => {
    setIsProcessingAction(true)
    setActionError(null)

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Status update failed")
      }

      // Update local state
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus, notes } : order)))

      // Trigger any necessary post-status-change actions
      await handlePostStatusChangeActions(orderId, newStatus)
    } catch (error: any) {
      const orderError = OrderErrorHandler.handleFulfillmentError(orderId, error)
      setActionError(orderError)
      await ErrorLogger.logOrderError(orderError, {
        orderId,
        attemptedStatus: newStatus,
        currentStatus: orders.find((o) => o.id === orderId)?.status,
      })
    } finally {
      setIsProcessingAction(false)
    }
  }

  // Handle post-status-change automation
  const handlePostStatusChangeActions = async (orderId: string, newStatus: Order["status"]) => {
    try {
      switch (newStatus) {
        case "confirmed":
          await triggerQRGeneration(orderId)
          break
        case "manufacturing":
          await notifyManufacturingTeam(orderId)
          break
        case "shipped":
          await sendShippingNotification(orderId)
          break
        case "delivered":
          await sendDeliveryConfirmation(orderId)
          break
      }
    } catch (error: any) {
      const orderError = OrderErrorHandler.handleFulfillmentError(orderId, error)
      await ErrorLogger.logOrderError(orderError, {
        orderId,
        automationStep: newStatus,
      })
    }
  }

  // QR generation with error handling
  const triggerQRGeneration = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/generate-qr`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("QR generation failed")
      }

      // Update order status to 'generated'
      await updateOrderStatus(orderId, "generated")
    } catch (error: any) {
      const orderError = OrderErrorHandler.handleQRGenerationError(orderId, error)
      await ErrorLogger.logOrderError(orderError)
      throw error
    }
  }

  // Manufacturing notification
  const notifyManufacturingTeam = async (orderId: string) => {
    try {
      await fetch("/api/notifications/manufacturing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
    } catch (error: any) {
      console.error("Manufacturing notification failed:", error)
    }
  }

  // Shipping notification
  const sendShippingNotification = async (orderId: string) => {
    try {
      await fetch("/api/notifications/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
    } catch (error: any) {
      console.error("Shipping notification failed:", error)
    }
  }

  // Delivery confirmation
  const sendDeliveryConfirmation = async (orderId: string) => {
    try {
      await fetch("/api/notifications/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
    } catch (error: any) {
      console.error("Delivery confirmation failed:", error)
    }
  }

  // Bulk error resolution
  const resolveOrderErrors = async (orderId: string) => {
    setIsProcessingAction(true)

    try {
      const response = await fetch(`/api/orders/${orderId}/resolve-errors`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Error resolution failed")
      }

      // Clear errors from local state
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, errors: [], errorCount: 0 } : order)))
    } catch (error: any) {
      const orderError = OrderErrorHandler.handleFulfillmentError(orderId, error)
      setActionError(orderError)
    } finally {
      setIsProcessingAction(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Summary Dashboard */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <AlertTriangle className="w-5 h-5" />
            Order Issues Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {orders.filter((o) => o.errors?.some((e) => e.severity === "critical")).length}
              </div>
              <div className="text-sm text-red-800">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {orders.filter((o) => o.errors?.some((e) => e.severity === "high")).length}
              </div>
              <div className="text-sm text-orange-800">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter((o) => o.errors?.some((e) => e.severity === "medium")).length}
              </div>
              <div className="text-sm text-yellow-800">Medium Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {orders.filter((o) => !o.errors || o.errors.length === 0).length}
              </div>
              <div className="text-sm text-green-800">No Issues</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Error Display */}
      {actionError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-800 mb-4">
          <p className="font-medium">Error</p>
          <p className="text-sm">{typeof actionError === "string" ? actionError : actionError.userMessage}</p>
          {actionError.code && <p className="text-xs mt-1 text-red-600">Error code: {actionError.code}</p>}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActionError(null)}
            className="mt-2 text-red-800 border-red-300 hover:bg-red-100"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Enhanced Order Actions */}
      {selectedOrder && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Order Actions - {selectedOrder.orderNumber}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Status Updates */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => updateOrderStatus(selectedOrder.id, "confirmed")}
                disabled={isProcessingAction}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isProcessingAction ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="w-3 h-3 mr-1" />
                )}
                Confirm Payment
              </Button>

              <Button
                size="sm"
                onClick={() => updateOrderStatus(selectedOrder.id, "manufacturing")}
                disabled={isProcessingAction}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Package className="w-3 h-3 mr-1" />
                Send to Manufacturing
              </Button>

              <Button
                size="sm"
                onClick={() => updateOrderStatus(selectedOrder.id, "shipped")}
                disabled={isProcessingAction}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Truck className="w-3 h-3 mr-1" />
                Mark as Shipped
              </Button>
            </div>

            {/* Error Resolution */}
            {selectedOrder.errors && selectedOrder.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-900">Active Issues ({selectedOrder.errors.length})</h4>
                {selectedOrder.errors.map((error, index) => (
                  <div key={index} className="rounded-md bg-red-50 border border-red-200 p-4 text-red-800 mb-2">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{typeof error === "string" ? error : error.userMessage}</p>
                    {error.code && <p className="text-xs mt-1 text-red-600">Error code: {error.code}</p>}
                  </div>
                ))}
                <Button
                  size="sm"
                  onClick={() => resolveOrderErrors(selectedOrder.id)}
                  disabled={isProcessingAction}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Resolve All Issues
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
