"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NewAdminGuard } from "@/components/admin/new-admin-guard"
import { useNewAdminAuth } from "@/lib/new-admin-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { RefreshCw, Menu, X } from "lucide-react"

export default function AdminDashboardClient() {
  const { logout } = useNewAdminAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    revenue: 0,
    qrScans: 0,
    activeBatches: 0,
    totalQRCodes: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()

        // Fetch QR slugs count
        const { count: totalQRCodes, error: slugsError } = await supabase
          .from("qr_slugs")
          .select("*", { count: "exact", head: true })

        if (slugsError) {
          console.error("[v0] Error fetching QR slugs count:", slugsError)
        }

        // Fetch claimed slugs count (as a proxy for orders/scans)
        const { count: claimedCount, error: claimedError } = await supabase
          .from("qr_slugs")
          .select("*", { count: "exact", head: true })
          .eq("is_claimed", true)

        if (claimedError) {
          console.error("[v0] Error fetching claimed count:", claimedError)
        }

        setMetrics({
          totalOrders: claimedCount || 0,
          revenue: 0, // Will need orders table for real revenue
          qrScans: claimedCount || 0, // Using claimed count as proxy
          activeBatches: 0, // Will need batches table
          totalQRCodes: totalQRCodes || 0,
        })
      } catch (error) {
        console.error("[v0] Error fetching metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = "/auth/admin"
    } catch (error) {
      console.error("Logout error:", error)
      window.location.href = "/auth/admin"
    }
  }

  return (
    <NewAdminGuard>
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border px-4 md:px-6 py-3 md:py-4 shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground text-lg md:text-xl font-bold">T</span>
              </div>
              <div>
                <h1 className="text-base md:text-xl font-semibold text-foreground">Tag My Trophy Admin</h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Dashboard Overview</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Badge
                variant="outline"
                className="border-green-200 text-green-700 bg-green-50 text-xs md:text-sm hidden sm:flex"
              >
                System Online
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground bg-transparent text-xs md:text-sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <div className="flex relative">
          {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
          )}

          <aside
            className={`
              fixed md:static inset-y-0 left-0 z-50
              w-64 bg-card border-r border-border
              transform transition-transform duration-300 ease-in-out
              ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
              overflow-y-auto
            `}
            style={{ top: "57px" }} // Account for header height on mobile
          >
            <div className="md:hidden flex justify-end p-4">
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="p-4 space-y-1">
              <div className="mb-6">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Overview</h2>
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary text-primary-foreground font-medium justify-start"
                >
                  <span className="w-5 h-5 flex items-center justify-center">📊</span>
                  Dashboard
                </Link>
              </div>

              <div className="mb-6">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Operations
                </h2>
                <div className="space-y-1">
                  <Link
                    href="/admin/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors justify-start"
                  >
                    <span className="w-5 h-5 flex items-center justify-center">🛒</span>
                    Orders
                  </Link>
                  <Link
                    href="/admin/inventory/packages"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors justify-start"
                  >
                    <span className="w-5 h-5 flex items-center justify-center">📦</span>
                    Inventory
                  </Link>
                  <Link
                    href="/admin/slugs"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors justify-start"
                  >
                    <span className="w-5 h-5 flex items-center justify-center">📱</span>
                    QR Codes
                  </Link>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Management
                </h2>
                <div className="space-y-1">
                  <Link
                    href="/admin/themes"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors justify-start"
                  >
                    <span className="w-5 h-5 flex items-center justify-center">🎨</span>
                    Theme Management
                  </Link>
                  <Link
                    href="/admin/stores"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors justify-start"
                  >
                    <span className="w-5 h-5 flex items-center justify-center">🏪</span>
                    Store Management
                  </Link>
                  <Link
                    href="/admin/trophies"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors justify-start"
                  >
                    <span className="w-5 h-5 flex items-center justify-center">🏆</span>
                    Trophies
                  </Link>
                  <Link
                    href="/admin/users"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors justify-start"
                  >
                    <span className="w-5 h-5 flex items-center justify-center">👥</span>
                    Users
                  </Link>
                  <Link
                    href="/admin/analytics"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors justify-start"
                  >
                    <span className="w-5 h-5 flex items-center justify-center">📈</span>
                    Analytics
                  </Link>
                  <Link
                    href="/admin/inventory/import"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors justify-start"
                  >
                    <span className="w-5 h-5 flex items-center justify-center">📥</span>
                    Import QR IDs
                  </Link>
                </div>
              </div>
            </nav>
          </aside>

          <main className="flex-1 p-4 md:p-6 bg-muted/30 min-h-[calc(100vh-57px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading dashboard metrics...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                  {/* Orders Metric */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Claimed Tags</CardTitle>
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-lg">🛒</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{metrics.totalOrders}</div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted-foreground">Total tags claimed</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Revenue Metric */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total QR Codes</CardTitle>
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 text-lg">📱</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{metrics.totalQRCodes}</div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted-foreground">QR codes in system</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* QR Codes Metric */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Available Tags</CardTitle>
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 text-lg">✅</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {metrics.totalQRCodes - metrics.totalOrders}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted-foreground">Ready to claim</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Inventory Metric */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Claim Rate</CardTitle>
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-orange-600 text-lg">📊</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {metrics.totalQRCodes > 0 ? Math.round((metrics.totalOrders / metrics.totalQRCodes) * 100) : 0}%
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted-foreground">Tags claimed</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* System Status */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg font-semibold">System Status</CardTitle>
                  <CardDescription className="text-sm">Current operational status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-800 text-sm md:text-base">Authentication System</span>
                    </div>
                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 text-xs">
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-800 text-sm md:text-base">Database Connection</span>
                    </div>
                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 text-xs">
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-blue-800 text-sm md:text-base">QR Code Processing</span>
                    </div>
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-xs">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg font-semibold">Quick Actions</CardTitle>
                  <CardDescription className="text-sm">Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="h-auto p-3 md:p-4 flex-col gap-2 text-xs md:text-sm" asChild>
                      <Link href="/admin/slugs?tab=new-order">
                        <span className="text-lg">🏭</span>
                        <span className="font-medium">Prepare Manufacturer Order</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-3 md:p-4 flex-col gap-2 bg-transparent text-xs md:text-sm"
                      asChild
                    >
                      <Link href="/admin/orders?tab=ready_to_ship">
                        <span className="text-lg">📦</span>
                        <span className="font-medium">Package & Process Ready Orders</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-3 md:p-4 flex-col gap-2 bg-transparent text-xs md:text-sm"
                      asChild
                    >
                      <Link href="/admin/inventory/qr-codes">
                        <span className="text-lg">🏪</span>
                        <span className="font-medium">Prepare for Store Shipment</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-3 md:p-4 flex-col gap-2 bg-transparent text-xs md:text-sm"
                      asChild
                    >
                      <Link href="/admin/analytics">
                        <span className="text-lg">📈</span>
                        <span className="font-medium">View Analytics</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base md:text-lg font-semibold">Recent Activity</CardTitle>
                <CardDescription className="text-sm">Latest system events and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Real-time activity tracking coming soon</p>
                  <p className="text-xs mt-2">Check the QR Codes page for detailed slug information</p>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </NewAdminGuard>
  )
}
