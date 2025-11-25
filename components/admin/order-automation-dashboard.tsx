"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Package, Mail, Truck, CheckCircle, AlertTriangle, Clock, RefreshCw, TrendingUp } from "lucide-react"

interface AutomationMetrics {
  ordersProcessed: number
  emailsSent: number
  qrCodesGenerated: number
  manufacturingQueue: number
  shippedToday: number
  supportTickets: number
}

interface RecentActivity {
  id: string
  type: "order_created" | "email_sent" | "qr_generated" | "shipped" | "support"
  message: string
  timestamp: Date
  status: "success" | "warning" | "error"
}

export default function OrderAutomationDashboard() {
  const [metrics, setMetrics] = useState<AutomationMetrics>({
    ordersProcessed: 0,
    emailsSent: 0,
    qrCodesGenerated: 0,
    manufacturingQueue: 0,
    shippedToday: 0,
    supportTickets: 0,
  })

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isProcessingQueue, setIsProcessingQueue] = useState(false)

  useEffect(() => {
    // Load demo data
    setMetrics({
      ordersProcessed: 47,
      emailsSent: 94,
      qrCodesGenerated: 47,
      manufacturingQueue: 12,
      shippedToday: 8,
      supportTickets: 2,
    })

    setRecentActivity([
      {
        id: "1",
        type: "order_created",
        message: "Order TMT-789123 created for sarah.johnson@email.com",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: "success",
      },
      {
        id: "2",
        type: "email_sent",
        message: "Welcome email sent to mike.chen@email.com",
        timestamp: new Date(Date.now() - 12 * 60 * 1000),
        status: "success",
      },
      {
        id: "3",
        type: "qr_generated",
        message: "QR code generated for order TMT-789122",
        timestamp: new Date(Date.now() - 18 * 60 * 1000),
        status: "success",
      },
      {
        id: "4",
        type: "shipped",
        message: "Order TMT-789121 shipped with tracking 1Z999AA1234567890",
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        status: "success",
      },
      {
        id: "5",
        type: "support",
        message: "Support ticket created for payment issue",
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
        status: "warning",
      },
    ])
  }, [])

  const processManufacturingQueue = async () => {
    setIsProcessingQueue(true)
    try {
      const response = await fetch("/api/orders/manufacturing", {
        method: "POST",
      })

      if (response.ok) {
        // Refresh metrics
        setMetrics((prev) => ({
          ...prev,
          manufacturingQueue: Math.max(0, prev.manufacturingQueue - 5),
        }))
      }
    } catch (error) {
      console.error("Failed to process manufacturing queue:", error)
    } finally {
      setIsProcessingQueue(false)
    }
  }

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "order_created":
        return <Package className="w-4 h-4" />
      case "email_sent":
        return <Mail className="w-4 h-4" />
      case "qr_generated":
        return <CheckCircle className="w-4 h-4" />
      case "shipped":
        return <Truck className="w-4 h-4" />
      case "support":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: RecentActivity["status"]) => {
    switch (status) {
      case "success":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2c2c2c]">Order Automation Dashboard</h1>
          <p className="text-[#6b5b47]">Monitor post-purchase automation and order processing</p>
        </div>
        <Button
          onClick={processManufacturingQueue}
          disabled={isProcessingQueue}
          className="bg-[#c44c3a] hover:bg-[#a83d2e] text-white"
        >
          {isProcessingQueue ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Package className="w-4 h-4 mr-2" />
          )}
          Process Manufacturing Queue
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-[#e5d5c8]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#6b5b47]">Orders Processed Today</CardTitle>
            <Package className="h-4 w-4 text-[#c44c3a]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2c2c2c]">{metrics.ordersProcessed}</div>
            <p className="text-xs text-[#6b5b47] flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#e5d5c8]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#6b5b47]">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-[#c44c3a]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2c2c2c]">{metrics.emailsSent}</div>
            <p className="text-xs text-[#6b5b47]">Confirmations & welcome emails</p>
          </CardContent>
        </Card>

        <Card className="border-[#e5d5c8]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#6b5b47]">QR Codes Generated</CardTitle>
            <CheckCircle className="h-4 w-4 text-[#c44c3a]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2c2c2c]">{metrics.qrCodesGenerated}</div>
            <p className="text-xs text-[#6b5b47]">Ready for customer setup</p>
          </CardContent>
        </Card>

        <Card className="border-[#e5d5c8]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#6b5b47]">Manufacturing Queue</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2c2c2c]">{metrics.manufacturingQueue}</div>
            <p className="text-xs text-[#6b5b47]">Orders awaiting production</p>
          </CardContent>
        </Card>

        <Card className="border-[#e5d5c8]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#6b5b47]">Shipped Today</CardTitle>
            <Truck className="h-4 w-4 text-[#c44c3a]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2c2c2c]">{metrics.shippedToday}</div>
            <p className="text-xs text-[#6b5b47]">With tracking notifications</p>
          </CardContent>
        </Card>

        <Card className="border-[#e5d5c8]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#6b5b47]">Support Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2c2c2c]">{metrics.supportTickets}</div>
            <p className="text-xs text-[#6b5b47]">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="border-[#e5d5c8]">
        <CardHeader>
          <CardTitle className="text-[#2c2c2c]">Recent Activity</CardTitle>
          <CardDescription className="text-[#6b5b47]">Real-time automation events and order processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-[#f5f0e8] rounded-lg">
                <div className={`mt-0.5 ${getStatusColor(activity.status)}`}>{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#2c2c2c]">{activity.message}</p>
                  <p className="text-xs text-[#6b5b47] mt-1">
                    {activity.timestamp.toLocaleTimeString()} - {activity.timestamp.toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    activity.status === "success"
                      ? "border-green-200 text-green-700"
                      : activity.status === "warning"
                        ? "border-yellow-200 text-yellow-700"
                        : "border-red-200 text-red-700"
                  }`}
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
