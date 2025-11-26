"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  User,
  Shield,
  Download,
  Trash2,
  AlertTriangle,
  Save,
  Loader2,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react"

export default function SettingsClient() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [cancelingSubscription, setCancelingSubscription] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true)

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          window.location.href = "/auth/login"
          return
        }

        setUser(authUser)

        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()

        setProfile(
          profileData || {
            email: authUser.email,
            full_name: "",
            bio: "",
            avatar_url: null,
          },
        )

        const { data: subscriptionData } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        setSubscription(subscriptionData)
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleProfileChange = (field: string, value: string) => {
    setProfile((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: profile.email,
          full_name: profile.full_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    try {
      setCancelingSubscription(true)

      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: subscription.stripe_subscription_id,
        }),
      })

      if (!response.ok) throw new Error("Failed to cancel subscription")

      const { data: updatedSubscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", subscription.id)
        .single()

      setSubscription(updatedSubscription)
      toast({
        title: "Subscription Canceled",
        description: "Subscription will be canceled at the end of the current billing period.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCancelingSubscription(false)
    }
  }

  const handleManageBilling = async () => {
    if (!subscription) return

    try {
      const response = await fetch("/api/subscriptions/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: subscription.stripe_customer_id,
        }),
      })

      if (!response.ok) throw new Error("Failed to create portal session")

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      })
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
            <Calendar className="w-3 h-3 mr-1" />
            Trial
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
            <XCircle className="w-3 h-3 mr-1" />
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
          <p className="text-[#6b5b47]">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5d5c8] px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-[#2c2c2c] hover:text-[#c44c3a] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[#2c2c2c]">Account Settings</h1>
          <p className="text-[#6b5b47]">Manage your profile and preferences</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-[#e5d5c8]">
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">Profile Information</CardTitle>
                <CardDescription className="text-[#6b5b47]">Update your public profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-[#2c2c2c]">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={profile?.full_name || ""}
                    onChange={(e) => handleProfileChange("full_name", e.target.value)}
                    className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a]"
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#2c2c2c]">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="border-[#e5d5c8] bg-gray-50"
                  />
                  <p className="text-xs text-[#6b5b47]">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-[#2c2c2c]">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={profile?.bio || ""}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                    placeholder="Tell visitors about yourself..."
                    className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] min-h-[100px]"
                  />
                  <p className="text-xs text-[#6b5b47]">{(profile?.bio || "").length}/500 characters</p>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">Subscription Details</CardTitle>
                <CardDescription className="text-[#6b5b47]">Manage your annual hosting subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {subscription ? (
                  <>
                    <div className="flex items-center justify-between p-4 bg-white border border-[#e5d5c8] rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-[#2c2c2c]">Annual Hosting</h4>
                          {getStatusBadge(subscription.status)}
                        </div>
                        <p className="text-sm text-[#6b5b47]">$9.99/year</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#6b5b47]">Next billing date</p>
                        <p className="font-medium text-[#2c2c2c]">{formatDate(subscription.current_period_end)}</p>
                      </div>
                    </div>

                    {subscription.trial_end && new Date(subscription.trial_end) > new Date() && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900">Free Trial Active</h4>
                            <p className="text-sm text-blue-800">
                              Your first year is included with your QR tag purchase. Billing starts on{" "}
                              {formatDate(subscription.trial_end)}.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {subscription.cancel_at_period_end && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-yellow-900">Subscription Ending</h4>
                            <p className="text-sm text-yellow-800">
                              Your subscription will end on {formatDate(subscription.current_period_end)}. You'll still
                              have access until then.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={handleManageBilling}
                        variant="outline"
                        className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Manage Billing
                      </Button>
                      {!subscription.cancel_at_period_end && subscription.status === "active" && (
                        <Button
                          onClick={handleCancelSubscription}
                          disabled={cancelingSubscription}
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                        >
                          {cancelingSubscription ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Canceling...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel Subscription
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-[#6b5b47] mx-auto mb-4" />
                    <h4 className="font-medium text-[#2c2c2c] mb-2">No Active Subscription</h4>
                    <p className="text-sm text-[#6b5b47] mb-4">
                      You don't have an active subscription yet. Purchase a QR tag to get started.
                    </p>
                    <Button asChild className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                      <Link href="/checkout">Get Started</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">Account Management</CardTitle>
                <CardDescription className="text-[#6b5b47]">Manage your account data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-blue-900">Export Your Data</h4>
                    <p className="text-sm text-blue-800">Download all your memories and stories</p>
                  </div>
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-800">Permanently delete your account and all data</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>

                {showDeleteConfirm && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900">Are you sure?</h4>
                        <p className="text-sm text-red-800 mb-3">
                          This action cannot be undone. All your memories, stories, and account data will be permanently
                          deleted.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="border-red-300 text-red-700"
                          >
                            Cancel
                          </Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                            Yes, Delete My Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
