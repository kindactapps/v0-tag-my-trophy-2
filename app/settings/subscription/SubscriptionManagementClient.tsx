"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, CreditCard, Calendar, CheckCircle, XCircle, AlertTriangle, Loader2, Clock } from "lucide-react"

interface SubscriptionData {
  status: string
  current_period_end: string
  cancel_at_period_end: boolean
  trial_end: string | null
  payment_method?: {
    brand: string
    last4: string
  }
}

export default function SubscriptionManagementClient() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = "/auth/login"
        return
      }

      const response = await fetch("/api/subscription/status")

      if (!response.ok) {
        throw new Error("Failed to load subscription")
      }

      const data = await response.json()
      setSubscription(data.subscription)
    } catch (err) {
      console.error("[v0] Error loading subscription:", err)
      setError("Failed to load subscription information. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    try {
      setCanceling(true)
      setError(null)

      const { data: dbSubscription } = await supabase
        .from("subscriptions")
        .select("stripe_subscription_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (!dbSubscription) {
        throw new Error("Subscription not found")
      }

      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: dbSubscription.stripe_subscription_id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to cancel subscription")
      }

      await loadSubscription()
      setShowCancelDialog(false)
    } catch (err) {
      console.error("[v0] Error canceling subscription:", err)
      setError("Failed to cancel subscription. Please try again.")
    } finally {
      setCanceling(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case "trialing":
        return (
          <Badge className="bg-blue-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Free Trial
          </Badge>
        )
      case "canceled":
        return (
          <Badge className="bg-gray-500 text-white">
            <XCircle className="w-3 h-3 mr-1" />
            Canceled
          </Badge>
        )
      case "past_due":
        return (
          <Badge className="bg-red-500 text-white">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Past Due
          </Badge>
        )
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#c44c3a] animate-spin mx-auto mb-4" />
          <p className="text-[#6b5b47]">Loading subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5d5c8] px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 text-[#2c2c2c] hover:text-[#c44c3a] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Settings
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[#2c2c2c]">Subscription Management</h1>
          <p className="text-[#6b5b47]">Manage your annual hosting subscription</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {subscription ? (
          <>
            {/* Subscription Status Card */}
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#2c2c2c]">Annual Hosting Subscription</CardTitle>
                    <CardDescription className="text-[#6b5b47]">$9.99/year</CardDescription>
                  </div>
                  {getStatusBadge(subscription.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Trial Information */}
                {subscription.trial_end && new Date(subscription.trial_end) > new Date() && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">
                          Your free trial ends on {formatDate(subscription.trial_end)}
                        </h4>
                        <p className="text-sm text-blue-800">
                          Your first year is included with your QR tag purchase. After the trial ends, you'll be charged
                          $9.99/year to keep your profile active.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Subscription */}
                {subscription.status === "active" && !subscription.trial_end && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-green-900 mb-1">
                          Your subscription renews on {formatDate(subscription.current_period_end)} for $9.99
                        </h4>
                        <p className="text-sm text-green-800">
                          Your payment method will be automatically charged to keep your profile active.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Canceled Subscription */}
                {subscription.cancel_at_period_end && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-1">
                          Your subscription ends on {formatDate(subscription.current_period_end)}
                        </h4>
                        <p className="text-sm text-yellow-800">
                          Your profile will become inactive when your current period ends. You can reactivate anytime
                          before then.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Past Due */}
                {subscription.status === "past_due" && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-900 mb-1">Payment Failed</h4>
                        <p className="text-sm text-red-800">
                          We couldn't process your payment. Please update your payment method to keep your profile
                          active.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                {subscription.payment_method && (
                  <div className="flex items-center justify-between p-4 bg-white border border-[#e5d5c8] rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-[#6b5b47]" />
                      <div>
                        <p className="text-sm text-[#6b5b47]">Payment Method</p>
                        <p className="font-medium text-[#2c2c2c]">
                          {subscription.payment_method.brand.toUpperCase()} •••• {subscription.payment_method.last4}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing Date */}
                <div className="flex items-center justify-between p-4 bg-white border border-[#e5d5c8] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#6b5b47]" />
                    <div>
                      <p className="text-sm text-[#6b5b47]">
                        {subscription.cancel_at_period_end ? "Subscription Ends" : "Next Billing Date"}
                      </p>
                      <p className="font-medium text-[#2c2c2c]">{formatDate(subscription.current_period_end)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">Manage Subscription</CardTitle>
                <CardDescription className="text-[#6b5b47]">
                  Update your payment method or cancel your subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent justify-start"
                  disabled
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment Method
                  <Badge className="ml-auto bg-gray-200 text-gray-600">Coming Soon</Badge>
                </Button>

                {!subscription.cancel_at_period_end && subscription.status !== "canceled" && (
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50 bg-transparent justify-start"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Subscription
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-[#e5d5c8]">
            <CardContent className="text-center py-12">
              <CreditCard className="w-12 h-12 text-[#6b5b47] mx-auto mb-4" />
              <h3 className="font-medium text-[#2c2c2c] mb-2">No Active Subscription</h3>
              <p className="text-sm text-[#6b5b47] mb-4">
                You don't have an active subscription yet. Purchase a QR tag to get started.
              </p>
              <Button asChild className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                <Link href="/checkout">Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#2c2c2c] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Cancel Subscription?
            </DialogTitle>
            <DialogDescription className="text-[#6b5b47]">
              Are you sure you want to cancel your subscription? Your profile will become inactive when your current
              period ends on {subscription && formatDate(subscription.current_period_end)}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={canceling}
              className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent"
            >
              Keep Subscription
            </Button>
            <Button
              onClick={handleCancelSubscription}
              disabled={canceling}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {canceling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                "Yes, Cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
