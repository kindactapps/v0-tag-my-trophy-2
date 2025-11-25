"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Mail, Package, Truck, Home, Calendar, MapPin } from "lucide-react"

// Mock order data - in real implementation, this would come from URL params or API
const mockOrderData = {
  orderNumber: "TMT-2024-001",
  plan: "Premium",
  amount: 49.99,
  tax: 4.0,
  total: 53.99,
  customer: {
    name: "John Doe",
    email: "john@example.com",
  },
  shipping: {
    address: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
  },
  estimatedDelivery: "3-5 business days",
  qrSlug: "family-vacation-2024",
}

export default function CheckoutSuccessPage() {
  const [emailSent, setEmailSent] = useState(false)
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null)

  useEffect(() => {
    // Simulate email confirmation
    const timer = setTimeout(() => {
      setEmailSent(true)
    }, 2000)

    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
    setTrialEndDate(
      oneYearFromNow.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    )

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5d5c8] px-6 py-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#2c2c2c] mb-2">Order Confirmed!</h1>
          <p className="text-[#6b5b47] text-lg">
            Thank you for your purchase. Your QR tag experience is being prepared.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Your First Year is FREE!
            </CardTitle>
            <CardDescription className="text-blue-700">Enjoy complimentary hosting for your first year</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900 mb-2">
                <strong>Your subscription will automatically renew on {trialEndDate} for $9.99/year</strong>
              </p>
              <p className="text-sm text-blue-800">
                You can cancel anytime before then. No charges until your free year ends.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
            >
              <Link href="/settings/subscription">Manage Subscription</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="border-[#e5d5c8]">
          <CardHeader>
            <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#c44c3a]" />
              Order Details
            </CardTitle>
            <CardDescription>Order #{mockOrderData.orderNumber}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-500 text-white">{mockOrderData.plan}</Badge>
                <span className="font-medium text-[#2c2c2c]">QR Tag Experience</span>
              </div>
              <span className="font-bold text-[#2c2c2c]">${mockOrderData.amount}</span>
            </div>

            <div className="bg-[#faf8f4] border border-[#e8ddd0] rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#6b5b47] mb-1">Customer:</p>
                  <p className="font-medium text-[#2c2c2c]">{mockOrderData.customer.name}</p>
                  <p className="text-[#6b5b47]">{mockOrderData.customer.email}</p>
                </div>
                <div>
                  <p className="text-[#6b5b47] mb-1">Shipping Address:</p>
                  <p className="font-medium text-[#2c2c2c]">{mockOrderData.shipping.address}</p>
                  <p className="text-[#6b5b47]">
                    {mockOrderData.shipping.city}, {mockOrderData.shipping.state} {mockOrderData.shipping.zipCode}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#e5d5c8]">
              <span className="font-bold text-[#2c2c2c]">Total Paid:</span>
              <span className="font-bold text-[#2c2c2c] text-xl">${mockOrderData.total}</span>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Confirmation */}
          <Card className="border-[#e5d5c8]">
            <CardHeader>
              <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Email Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {emailSent ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Confirmation email sent!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[#6b5b47]">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#c44c3a]"></div>
                  <span className="text-sm">Sending confirmation email...</span>
                </div>
              )}
              <p className="text-sm text-[#6b5b47] mt-2">
                Check your email for order details and tracking information.
              </p>
            </CardContent>
          </Card>

          {/* Shipping Timeline */}
          <Card className="border-[#e5d5c8]">
            <CardHeader>
              <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-600" />
                Shipping & Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[#6b5b47]" />
                <span className="text-sm font-medium text-[#2c2c2c]">
                  Estimated Delivery: {mockOrderData.estimatedDelivery}
                </span>
              </div>
              <p className="text-sm text-[#6b5b47]">
                Your QR tag will be manufactured and shipped within 1-2 business days.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* QR Experience Ready */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Your QR Experience is Ready!
            </CardTitle>
            <CardDescription className="text-green-700">
              Start adding memories to your QR code experience right away
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Your QR Experience URL:</p>
                  <p className="text-sm text-green-700 font-mono">tagmytrophy.com/{mockOrderData.qrSlug}</p>
                </div>
              </div>
              <p className="text-sm text-green-700">
                You can start uploading photos, videos, and stories immediately. When your physical QR tag arrives, it
                will link directly to this experience.
              </p>
            </div>

            <div className="flex gap-3">
              <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
                <Link href={`/dashboard/collections/${mockOrderData.qrSlug}`}>Start Adding Memories</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
              >
                <Link href="/dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="text-center pt-6">
          <Button
            asChild
            variant="outline"
            className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
