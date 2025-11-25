"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import BackButton from "@/components/back-button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  QrCodeIcon as QRCodeIcon,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Store,
  ExternalLink,
  Copy,
  Download,
  MoreHorizontal,
  Package,
  Users,
  ShoppingCart,
  MapPin,
  RefreshCw,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface QRCodeInventoryItem {
  id: string
  qr_code_id: string
  slug: string
  status: "available" | "in_store" | "claimed" | "sold" | "shipped" | "delivered"
  product_type: "essential" | "premium"
  package_name: string
  package_id: string
  batch_number?: string
  assigned_store_id?: string
  assigned_store_name?: string
  assigned_order_id?: string
  order_number?: string
  claimed_by?: string
  claimed_by_name?: string
  claimed_at?: string
  sold_at?: string
  shipped_at?: string
  delivered_at?: string
  last_scanned_at?: string
  scan_count: number
  price?: number
  location_data?: {
    city?: string
    state?: string
    country?: string
  }
  created_at: string
  updated_at: string
}

interface FilterState {
  search: string
  status: string
  productType: string
  store: string
  package: string
  dateRange: string
  sortBy: string
  sortOrder: "asc" | "desc"
}

export default function QRInventoryClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [qrCodes, setQRCodes] = useState<QRCodeInventoryItem[]>([])
  const [filteredQRCodes, setFilteredQRCodes] = useState<QRCodeInventoryItem[]>([])
  const [selectedQRCodes, setSelectedQRCodes] = useState<string[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [storeSearchTerm, setStoreSearchTerm] = useState("")
  const [isAssigningStore, setIsAssigningStore] = useState(false)
  const [showStoreDialog, setShowStoreDialog] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    productType: "all",
    store: "all",
    package: "all",
    dateRange: "all",
    sortBy: "created_at",
    sortOrder: "asc",
  })

  // Demo data - in real app, this would come from API
  useEffect(() => {
    setIsAuthenticated(true)
    setIsLoading(true)

    const demoQRCodes: QRCodeInventoryItem[] = Array.from({ length: 10 }, (_, i) => {
      const statuses: QRCodeInventoryItem["status"][] = [
        "available",
        "in_store",
        "claimed",
        "sold",
        "shipped",
        "delivered",
      ]
      const stores = ["Best Buy", "Target", "Walmart"]
      const packages = ["Holiday Bundle 2024", "Spring Collection"]

      const status = statuses[i % statuses.length]
      const hasStore = status !== "available"
      const hasClaim = ["claimed", "sold", "shipped", "delivered"].includes(status)
      const hasSale = ["sold", "shipped", "delivered"].includes(status)

      const baseDate = new Date("2024-01-01")
      const createdAt = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000)
      const claimedAt = hasClaim ? new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000) : undefined
      const soldAt = hasSale ? new Date((claimedAt || createdAt).getTime() + 2 * 24 * 60 * 60 * 1000) : undefined

      return {
        id: `qr-${i + 1}`,
        qr_code_id: `QR${String(i + 1).padStart(6, "0")}`,
        slug: `demo-${Math.random().toString(36).substring(2, 6)}`,
        status,
        product_type: i % 2 === 0 ? "essential" : "premium",
        package_name: packages[i % packages.length],
        package_id: `pkg-${(i % 2) + 1}`,
        batch_number: `B001`,
        assigned_store_id: hasStore ? `store-${(i % 3) + 1}` : undefined,
        assigned_store_name: hasStore ? stores[i % stores.length] : undefined,
        assigned_order_id: hasSale ? `order-${i + 1}` : undefined,
        order_number: hasSale ? `ORD-${String(i + 1).padStart(6, "0")}` : undefined,
        claimed_by: hasClaim ? `user${i + 1}@example.com` : undefined,
        claimed_by_name: hasClaim ? `Customer ${i + 1}` : undefined,
        claimed_at: claimedAt?.toISOString(),
        sold_at: soldAt?.toISOString(),
        shipped_at:
          status === "shipped" || status === "delivered"
            ? new Date(soldAt!.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
        delivered_at:
          status === "delivered" ? new Date(soldAt!.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        last_scanned_at:
          i % 3 === 0 ? new Date(createdAt.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        scan_count: i * 2,
        price: i % 2 === 0 ? 29.99 : 49.99,
        location_data:
          i % 2 === 0
            ? {
                city: "New York",
                state: "NY",
                country: "US",
              }
            : undefined,
        created_at: createdAt.toISOString(),
        updated_at: new Date(createdAt.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      }
    })

    setQRCodes(demoQRCodes)
    setFilteredQRCodes(demoQRCodes)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/admin/stores")
      const data = await response.json()
      if (response.ok) {
        setStores(data.stores || [])
      }
    } catch (error) {
      console.error("Error fetching stores:", error)
    }
  }

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...qrCodes]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (qr) =>
          qr.qr_code_id.toLowerCase().includes(searchLower) ||
          qr.slug.toLowerCase().includes(searchLower) ||
          qr.package_name.toLowerCase().includes(searchLower) ||
          qr.assigned_store_name?.toLowerCase().includes(searchLower) ||
          qr.order_number?.toLowerCase().includes(searchLower) ||
          qr.claimed_by_name?.toLowerCase().includes(searchLower),
      )
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((qr) => qr.status === filters.status)
    }

    // Product type filter
    if (filters.productType !== "all") {
      filtered = filtered.filter((qr) => qr.product_type === filters.productType)
    }

    // Store filter
    if (filters.store !== "all") {
      filtered = filtered.filter((qr) => qr.assigned_store_name === filters.store)
    }

    // Package filter
    if (filters.package !== "all") {
      filtered = filtered.filter((qr) => qr.package_name === filters.package)
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date()
      const cutoffDate = new Date()

      switch (filters.dateRange) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case "week":
          cutoffDate.setDate(now.getDate() - 7)
          break
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case "quarter":
          cutoffDate.setMonth(now.getMonth() - 3)
          break
      }

      filtered = filtered.filter((qr) => new Date(qr.created_at) >= cutoffDate)
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (filters.sortBy) {
        case "qr_code_id":
          aValue = a.qr_code_id
          bValue = b.qr_code_id
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "claimed_at":
          aValue = a.claimed_at || "0"
          bValue = b.claimed_at || "0"
          break
        case "sold_at":
          aValue = a.sold_at || "0"
          bValue = b.sold_at || "0"
          break
        case "scan_count":
          aValue = a.scan_count
          bValue = b.scan_count
          break
        case "package_name":
          aValue = a.package_name
          bValue = b.package_name
          break
        default:
          aValue = a.created_at
          bValue = b.created_at
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return filters.sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return filters.sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

    setFilteredQRCodes(filtered)
  }, [qrCodes, filters])

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const getStatusBadge = (status: QRCodeInventoryItem["status"]) => {
    const statusConfig = {
      available: { color: "bg-green-100 text-green-700", label: "Available" },
      in_store: { color: "bg-blue-100 text-blue-700", label: "In Store" },
      claimed: { color: "bg-yellow-100 text-yellow-700", label: "Claimed" },
      sold: { color: "bg-purple-100 text-purple-700", label: "Sold" },
      shipped: { color: "bg-orange-100 text-orange-700", label: "Shipped" },
      delivered: { color: "bg-emerald-100 text-emerald-700", label: "Delivered" },
    }

    const config = statusConfig[status]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getProductTypeBadge = (type: QRCodeInventoryItem["product_type"]) => {
    return (
      <Badge className={type === "premium" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}>
        {type === "premium" ? "Premium" : "Essential"}
      </Badge>
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQRCodes(filteredQRCodes.map((qr) => qr.id))
    } else {
      setSelectedQRCodes([])
    }
  }

  const handleSelectQR = (qrId: string, checked: boolean) => {
    if (checked) {
      setSelectedQRCodes((prev) => [...prev, qrId])
    } else {
      setSelectedQRCodes((prev) => prev.filter((id) => id !== qrId))
    }
  }

  const exportToCSV = () => {
    const csvData = filteredQRCodes.map((qr) => ({
      "QR Code ID": qr.qr_code_id,
      Slug: qr.slug,
      Status: qr.status,
      "Product Type": qr.product_type,
      Package: qr.package_name,
      Batch: qr.batch_number || "",
      Store: qr.assigned_store_name || "",
      "Order Number": qr.order_number || "",
      "Claimed By": qr.claimed_by_name || "",
      "Claimed Date": qr.claimed_at ? new Date(qr.claimed_at).toLocaleDateString() : "",
      "Sold Date": qr.sold_at ? new Date(qr.sold_at).toLocaleDateString() : "",
      "Scan Count": qr.scan_count,
      Price: qr.price || "",
      Location: qr.location_data ? `${qr.location_data.city}, ${qr.location_data.state}` : "",
      Created: new Date(qr.created_at).toLocaleDateString(),
      URL: `https://tagmytrophy.com/story/${qr.slug}`,
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `qr-inventory-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: `Exported ${filteredQRCodes.length} QR codes to CSV.`,
    })
  }

  // Assign selected QR codes to a store
  const handleAssignToStore = async () => {
    if (selectedQRCodes.length === 0) {
      toast({
        title: "No QR Codes Selected",
        description: "Please select QR codes to assign to a store",
        variant: "destructive",
      })
      return
    }

    if (!selectedStoreId) {
      toast({
        title: "No Store Selected",
        description: "Please select a store",
        variant: "destructive",
      })
      return
    }

    setIsAssigningStore(true)
    try {
      const response = await fetch("/api/admin/qr-codes/assign-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_code_ids: selectedQRCodes,
          store_id: selectedStoreId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Assigned ${data.updated_count} QR codes to store`,
        })
        setShowStoreDialog(false)
        setSelectedQRCodes([])
        setSelectedStoreId("")
        // Refresh QR codes list
        // In production, you'd fetch from API
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to assign QR codes",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error assigning to store:", error)
      toast({
        title: "Error",
        description: "Failed to assign QR codes to store",
        variant: "destructive",
      })
    } finally {
      setIsAssigningStore(false)
    }
  }

  // Get unique values for filter dropdowns
  const uniqueStores = [...new Set(qrCodes.map((qr) => qr.assigned_store_name).filter(Boolean))]
  const uniquePackages = [...new Set(qrCodes.map((qr) => qr.package_name))]

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(storeSearchTerm.toLowerCase()) ||
      store.location.toLowerCase().includes(storeSearchTerm.toLowerCase()),
  )

  // Calculate stats
  const stats = {
    total: qrCodes.length,
    available: qrCodes.filter((qr) => qr.status === "available").length,
    inStore: qrCodes.filter((qr) => qr.status === "in_store").length,
    claimed: qrCodes.filter((qr) => qr.status === "claimed").length,
    sold: qrCodes.filter((qr) => qr.status === "sold").length,
    shipped: qrCodes.filter((qr) => qr.status === "shipped").length,
    delivered: qrCodes.filter((qr) => qr.status === "delivered").length,
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c2c2c] mx-auto mb-4"></div>
          <p className="text-[#6b5b47]">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5d5c8] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href="/admin/dashboard" label="Back to Dashboard" />
            <div>
              <h1 className="text-xl font-bold text-[#2c2c2c]">QR Code Inventory</h1>
              <p className="text-sm text-[#6b5b47]">Comprehensive QR code tracking and management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={() => router.push("/admin/inventory/import")}
              className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
            >
              <QRCodeIcon className="w-4 h-4 mr-2" />
              Import QR Codes
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">Total</CardTitle>
              <QRCodeIcon className="h-4 w-4 text-[#c44c3a]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c2c2c]">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">Available</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            </CardContent>
          </Card>

          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">In Store</CardTitle>
              <Store className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inStore}</div>
            </CardContent>
          </Card>

          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">Claimed</CardTitle>
              <Users className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.claimed}</div>
            </CardContent>
          </Card>

          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">Sold</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.sold}</div>
            </CardContent>
          </Card>

          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">Shipped</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.shipped}</div>
            </CardContent>
          </Card>

          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">Delivered</CardTitle>
              <MapPin className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.delivered}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-[#e5d5c8] mb-6">
          <CardHeader>
            <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Inventory Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6b5b47] w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="QR ID, slug, store..."
                    value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                    className="pl-10 border-[#e5d5c8] focus:border-[#2c2c2c] focus:ring-[#2c2c2c]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                  <SelectTrigger className="border-[#e5d5c8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_store">In Store</SelectItem>
                    <SelectItem value="claimed">Claimed</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Product Type</Label>
                <Select value={filters.productType} onValueChange={(value) => updateFilter("productType", value)}>
                  <SelectTrigger className="border-[#e5d5c8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="essential">Essential</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Store</Label>
                <Select value={filters.store} onValueChange={(value) => updateFilter("store", value)}>
                  <SelectTrigger className="border-[#e5d5c8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stores</SelectItem>
                    {uniqueStores.map((store) => (
                      <SelectItem key={store} value={store}>
                        {store}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Package</Label>
                <Select value={filters.package} onValueChange={(value) => updateFilter("package", value)}>
                  <SelectTrigger className="border-[#e5d5c8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Packages</SelectItem>
                    {uniquePackages.map((pkg) => (
                      <SelectItem key={pkg} value={pkg}>
                        {pkg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={filters.dateRange} onValueChange={(value) => updateFilter("dateRange", value)}>
                  <SelectTrigger className="border-[#e5d5c8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>Sort by:</Label>
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                    <SelectTrigger className="w-40 border-[#e5d5c8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Created Date</SelectItem>
                      <SelectItem value="qr_code_id">QR Code ID</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="claimed_at">Claimed Date</SelectItem>
                      <SelectItem value="sold_at">Sold Date</SelectItem>
                      <SelectItem value="scan_count">Scan Count</SelectItem>
                      <SelectItem value="package_name">Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilter("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
                  className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8]"
                >
                  {filters.sortOrder === "asc" ? "↑" : "↓"}
                </Button>
              </div>

              <div className="text-sm text-[#6b5b47]">
                Showing {filteredQRCodes.length} of {qrCodes.length} QR codes
                {selectedQRCodes.length > 0 && ` (${selectedQRCodes.length} selected)`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Section */}
        {selectedQRCodes.length > 0 && (
          <Card className="border-[#e5d5c8] mb-6 bg-blue-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#2c2c2c] text-lg">Bulk Actions</CardTitle>
                  <CardDescription className="text-[#6b5b47]">
                    {selectedQRCodes.length} QR code{selectedQRCodes.length !== 1 ? "s" : ""} selected
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQRCodes([])}
                  className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-white"
                >
                  Clear Selection
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <Dialog open={showStoreDialog} onOpenChange={setShowStoreDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                      <Store className="w-4 h-4 mr-2" />
                      Assign to Store
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Assign to Store</DialogTitle>
                      <DialogDescription>
                        Select a store to assign {selectedQRCodes.length} QR code
                        {selectedQRCodes.length !== 1 ? "s" : ""}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Search Stores</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6b5b47] w-4 h-4" />
                          <Input
                            placeholder="Search by name or location..."
                            value={storeSearchTerm}
                            onChange={(e) => setStoreSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filteredStores.length === 0 ? (
                          <div className="text-center py-4 text-[#6b5b47]">
                            <Store className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No stores found</p>
                            <Button
                              variant="link"
                              onClick={() => router.push("/admin/stores")}
                              className="text-[#c44c3a] mt-2"
                            >
                              Add a store
                            </Button>
                          </div>
                        ) : (
                          filteredStores.map((store) => (
                            <div
                              key={store.id}
                              onClick={() => setSelectedStoreId(store.id)}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedStoreId === store.id
                                  ? "border-[#c44c3a] bg-[#c44c3a]/5"
                                  : "border-[#e5d5c8] hover:border-[#c44c3a]/50"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-[#2c2c2c]">{store.name}</div>
                                  <div className="text-sm text-[#6b5b47] flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    {store.location}
                                  </div>
                                  <div className="text-xs text-[#6b5b47] mt-1">
                                    Inventory: {store.current_inventory}
                                    {store.max_capacity && ` / ${store.max_capacity}`}
                                  </div>
                                </div>
                                {selectedStoreId === store.id && (
                                  <CheckCircle className="w-5 h-5 text-[#c44c3a] flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowStoreDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAssignToStore}
                        disabled={!selectedStoreId || isAssigningStore}
                        className="bg-[#c44c3a] hover:bg-[#a63d2e]"
                      >
                        {isAssigningStore ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Assigning...
                          </>
                        ) : (
                          <>Assign to Store</>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  onClick={exportToCSV}
                  className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-white bg-transparent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected
                </Button>

                <Select value="" onValueChange={(value) => console.log("Bulk status update:", value)}>
                  <SelectTrigger className="w-48 border-[#e5d5c8]">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Set Available</SelectItem>
                    <SelectItem value="in_store">Set In Store</SelectItem>
                    <SelectItem value="claimed">Set Claimed</SelectItem>
                    <SelectItem value="sold">Set Sold</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/stores")}
                  className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-white"
                >
                  <Store className="w-4 h-4 mr-2" />
                  Manage Stores
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Codes Table */}
        <Card className="border-[#e5d5c8]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#2c2c2c]">QR Code Inventory</CardTitle>
              {selectedQRCodes.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-white bg-transparent"
                  >
                    Bulk Update Status
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-[#e5d5c8] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedQRCodes.length === filteredQRCodes.length && filteredQRCodes.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>QR Code ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Claimed By</TableHead>
                    <TableHead>Scans</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Loading QR codes...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredQRCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8">
                        <div className="text-[#6b5b47]">No QR codes found matching your filters.</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQRCodes.slice(0, 50).map((qr) => (
                      <TableRow key={qr.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedQRCodes.includes(qr.id)}
                            onCheckedChange={(checked) => handleSelectQR(qr.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{qr.qr_code_id}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="p-0 h-auto">
                                {getStatusBadge(qr.status)}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => console.log("Update to available")}>
                                Set Available
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => console.log("Update to in_store")}>
                                Set In Store
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => console.log("Update to claimed")}>
                                Set Claimed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => console.log("Update to sold")}>
                                Set Sold
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => console.log("Update to shipped")}>
                                Set Shipped
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => console.log("Update to delivered")}>
                                Set Delivered
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell>{getProductTypeBadge(qr.product_type)}</TableCell>
                        <TableCell className="text-sm">{qr.package_name}</TableCell>
                        <TableCell className="text-sm">{qr.assigned_store_name || "—"}</TableCell>
                        <TableCell className="text-sm font-mono">{qr.order_number || "—"}</TableCell>
                        <TableCell className="text-sm">{qr.claimed_by_name || "—"}</TableCell>
                        <TableCell className="text-sm">{qr.scan_count}</TableCell>
                        <TableCell className="text-sm">
                          {qr.location_data ? `${qr.location_data.city}, ${qr.location_data.state}` : "—"}
                        </TableCell>
                        <TableCell className="text-sm">{new Date(qr.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  navigator.clipboard.writeText(`https://tagmytrophy.com/story/${qr.slug}`)
                                }
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy URL
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => window.open(`https://tagmytrophy.com/story/${qr.slug}`, "_blank")}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Story
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {filteredQRCodes.length > 50 && (
                <div className="p-4 text-center text-sm text-[#6b5b47] bg-[#f5f0e8] border-t border-[#e5d5c8]">
                  Showing first 50 of {filteredQRCodes.length} QR codes. Use filters to narrow results.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
