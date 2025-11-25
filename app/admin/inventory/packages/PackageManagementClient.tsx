"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import BackButton from "@/components/back-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  QrCodeIcon as QRCodeIcon,
  Search,
  Filter,
  CheckCircle,
  StoreIcon,
  Download,
  MoreHorizontal,
  Calendar,
  AlertTriangle,
  Clock,
  Target,
  Eye,
  EyeOff,
  Upload,
  Settings,
  Flag,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface QRCode {
  id: string
  qr_code_id: string
  status: "available" | "online" | "in_store" | "claimed" | "active"
  location?: string // Store name for in_store status
  product_type: "essential" | "premium"
  issue_flag?: "none" | "damaged" | "lost" | "defective" | "customer_return"
  issue_notes?: string
  issue_flagged_by?: string
  issue_flagged_at?: string
  date_added: string
  assigned_at?: string
  claimed_at?: string
  last_scan?: string
  scan_count: number
  customer_id?: string
}

interface Store {
  id: string
  name: string
  location: string
  contact: string
  phone: string
  current_inventory: number
}

interface RangeSelection {
  start: string
  end: string
  preview: {
    total: number
    available: number
    alreadyAssigned: number
  }
}

export default function PackageManagementClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [filteredQRCodes, setFilteredQRCodes] = useState<QRCode[]>([])
  const [selectedQRCodes, setSelectedQRCodes] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [typeFilters, setTypeFilters] = useState<string[]>([])
  const [storeFilter, setStoreFilter] = useState("all")
  const [issueFilter, setIssueFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date_added")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"individual" | "grouped">("individual")

  const [rangeDialog, setRangeDialog] = useState(false)
  const [rangeSelection, setRangeSelection] = useState<RangeSelection>({
    start: "",
    end: "",
    preview: { total: 0, available: 0, alreadyAssigned: 0 },
  })
  const [bulkActionDialog, setBulkActionDialog] = useState(false)
  const [bulkAction, setBulkAction] = useState<"status" | "store" | "flag">("status")
  const [bulkValue, setBulkValue] = useState("")
  const [flagDialog, setFlagDialog] = useState(false)
  const [flagNotes, setFlagNotes] = useState("")

  const router = useRouter()

  const [stores, setStores] = useState<Store[]>([
    {
      id: "1",
      name: "Downtown Sports",
      location: "Main Street",
      contact: "John Smith",
      phone: "(555) 123-4567",
      current_inventory: 47,
    },
    {
      id: "2",
      name: "Athletic Zone",
      location: "Mall Plaza",
      contact: "Sarah Johnson",
      phone: "(555) 234-5678",
      current_inventory: 65,
    },
    {
      id: "3",
      name: "Trophy Central",
      location: "Sports Complex",
      contact: "Mike Wilson",
      phone: "(555) 345-6789",
      current_inventory: 0,
    },
    {
      id: "4",
      name: "Victory Shop",
      location: "Stadium District",
      contact: "Lisa Brown",
      phone: "(555) 456-7890",
      current_inventory: 200,
    },
  ])

  useEffect(() => {
    setIsAuthenticated(true)

    const demoQRCodes: QRCode[] = []

    for (let i = 1; i <= 20; i++) {
      const qrId = `QR${i.toString().padStart(6, "0")}`
      const randomStatus = Math.random()
      let status: QRCode["status"] = "available"
      let location: string | undefined
      let issue_flag: QRCode["issue_flag"] = "none"

      if (randomStatus < 0.3) {
        status = "in_store"
        location = stores[i % stores.length].name
      } else if (randomStatus < 0.4) {
        status = "online"
      } else if (randomStatus < 0.5) {
        status = "claimed"
      } else if (randomStatus < 0.6) {
        status = "active"
      }

      // Add one issue flag for testing
      if (i === 1) {
        issue_flag = "damaged"
      }

      demoQRCodes.push({
        id: `qr-${i}`,
        qr_code_id: qrId,
        status,
        location,
        product_type: i % 2 === 0 ? "essential" : "premium",
        issue_flag,
        issue_notes: issue_flag !== "none" ? "Demo issue note" : undefined,
        issue_flagged_by: issue_flag !== "none" ? "Admin" : undefined,
        issue_flagged_at: issue_flag !== "none" ? new Date().toISOString() : undefined,
        date_added: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        assigned_at: status !== "available" ? new Date().toISOString() : undefined,
        claimed_at: status === "claimed" || status === "active" ? new Date().toISOString() : undefined,
        last_scan: i % 5 === 0 ? new Date().toISOString() : undefined,
        scan_count: i * 2,
        customer_id: status === "claimed" || status === "active" ? `CUST${i}` : undefined,
      })
    }

    setQrCodes(demoQRCodes)
    setFilteredQRCodes(demoQRCodes)
  }, [])

  useEffect(() => {
    let filtered = qrCodes

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (qr) =>
          qr.qr_code_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          qr.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          qr.customer_id?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filters
    if (statusFilters.length > 0) {
      filtered = filtered.filter((qr) => statusFilters.includes(qr.status))
    }

    // Apply type filters
    if (typeFilters.length > 0) {
      filtered = filtered.filter((qr) => typeFilters.includes(qr.product_type))
    }

    // Apply store filter
    if (storeFilter !== "all") {
      if (storeFilter === "unassigned") {
        filtered = filtered.filter((qr) => qr.status === "available")
      } else {
        filtered = filtered.filter((qr) => qr.location === storeFilter)
      }
    }

    // Apply issue filter
    if (issueFilter !== "all") {
      if (issueFilter === "flagged") {
        filtered = filtered.filter((qr) => qr.issue_flag !== "none")
      } else if (issueFilter === "none") {
        filtered = filtered.filter((qr) => qr.issue_flag === "none")
      } else {
        filtered = filtered.filter((qr) => qr.issue_flag === issueFilter)
      }
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter((qr) => new Date(qr.date_added) >= filterDate)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "date_added":
          aValue = new Date(a.date_added).getTime()
          bValue = new Date(b.date_added).getTime()
          break
        case "qr_code_id":
          aValue = a.qr_code_id
          bValue = b.qr_code_id
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "location":
          aValue = a.location || ""
          bValue = b.location || ""
          break
        case "scan_count":
          aValue = a.scan_count
          bValue = b.scan_count
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredQRCodes(filtered)
  }, [searchTerm, statusFilters, typeFilters, storeFilter, issueFilter, dateFilter, sortBy, sortOrder, qrCodes])

  useEffect(() => {
    if (rangeSelection.start && rangeSelection.end) {
      const startNum = Number.parseInt(rangeSelection.start.replace(/\D/g, ""))
      const endNum = Number.parseInt(rangeSelection.end.replace(/\D/g, ""))

      if (startNum && endNum && startNum <= endNum) {
        const rangeQRs = qrCodes.filter((qr) => {
          const qrNum = Number.parseInt(qr.qr_code_id.replace(/\D/g, ""))
          return qrNum >= startNum && qrNum <= endNum
        })

        setRangeSelection((prev) => ({
          ...prev,
          preview: {
            total: rangeQRs.length,
            available: rangeQRs.filter((qr) => qr.status === "available").length,
            alreadyAssigned: rangeQRs.filter((qr) => qr.status !== "available").length,
          },
        }))
      }
    }
  }, [rangeSelection.start, rangeSelection.end, qrCodes])

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const toggleTypeFilter = (type: string) => {
    setTypeFilters((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setStatusFilters([])
    setTypeFilters([])
    setStoreFilter("all")
    setIssueFilter("all")
    setDateFilter("all")
  }

  const getStatusBadge = (status: QRCode["status"]) => {
    const statusConfig = {
      available: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Available" },
      online: { color: "bg-blue-100 text-blue-700", icon: Target, label: "Online" },
      in_store: { color: "bg-purple-100 text-purple-700", icon: StoreIcon, label: "In Store" },
      claimed: { color: "bg-orange-100 text-orange-700", icon: Clock, label: "Claimed" },
      active: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, label: "Active" },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={`${config.color} hover:${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getIssueBadge = (issue: QRCode["issue_flag"]) => {
    if (!issue || issue === "none") return null

    const issueConfig = {
      damaged: { color: "bg-red-100 text-red-700", label: "Damaged" },
      lost: { color: "bg-gray-100 text-gray-700", label: "Lost" },
      defective: { color: "bg-yellow-100 text-yellow-700", label: "Defective" },
      customer_return: { color: "bg-blue-100 text-blue-700", label: "Returned" },
    }

    const config = issueConfig[issue]
    return (
      <Badge className={`${config.color} hover:${config.color}`}>
        <Flag className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getProductTypeBadge = (type: QRCode["product_type"]) => {
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

  const handleSelectQRCode = (qrId: string, checked: boolean) => {
    if (checked) {
      setSelectedQRCodes((prev) => [...prev, qrId])
    } else {
      setSelectedQRCodes((prev) => prev.filter((id) => id !== qrId))
    }
  }

  const selectQRRange = () => {
    if (!rangeSelection.start || !rangeSelection.end) {
      toast({
        title: "Invalid Range",
        description: "Please enter both start and end QR IDs.",
        variant: "destructive",
      })
      return
    }

    const startNum = Number.parseInt(rangeSelection.start.replace(/\D/g, ""))
    const endNum = Number.parseInt(rangeSelection.end.replace(/\D/g, ""))

    if (startNum >= endNum) {
      toast({
        title: "Invalid Range",
        description: "End ID must be greater than start ID.",
        variant: "destructive",
      })
      return
    }

    const rangeQRs = qrCodes.filter((qr) => {
      const qrNum = Number.parseInt(qr.qr_code_id.replace(/\D/g, ""))
      return qrNum >= startNum && qrNum <= endNum
    })

    setSelectedQRCodes(rangeQRs.map((qr) => qr.id))
    setRangeDialog(false)

    toast({
      title: "Range Selected",
      description: `Selected ${rangeQRs.length} QR codes from ${rangeSelection.start} to ${rangeSelection.end}`,
    })
  }

  const processBulkAction = async () => {
    if (selectedQRCodes.length === 0) return

    try {
      setQrCodes((prev) =>
        prev.map((qr) => {
          if (!selectedQRCodes.includes(qr.id)) return qr

          switch (bulkAction) {
            case "status":
              return {
                ...qr,
                status: bulkValue as QRCode["status"],
                location:
                  bulkValue === "in_store" ? stores[0].name : bulkValue === "available" ? undefined : qr.location,
                assigned_at: bulkValue !== "available" ? new Date().toISOString() : qr.assigned_at,
              }
            case "store":
              return {
                ...qr,
                status: "in_store",
                location: bulkValue,
                assigned_at: new Date().toISOString(),
              }
            case "flag":
              return {
                ...qr,
                issue_flag: bulkValue as QRCode["issue_flag"],
                issue_flagged_by: "Admin",
                issue_flagged_at: new Date().toISOString(),
                issue_notes: flagNotes,
              }
            default:
              return qr
          }
        }),
      )

      toast({
        title: "Bulk Action Complete",
        description: `Updated ${selectedQRCodes.length} QR codes.`,
      })

      setSelectedQRCodes([])
      setBulkActionDialog(false)
      setFlagDialog(false)
      setFlagNotes("")
    } catch (error) {
      toast({
        title: "Bulk Action Failed",
        description: "Some updates may have failed. Please try again.",
        variant: "destructive",
      })
    }
  }

  const exportSelectedQRCodes = () => {
    const selectedData = qrCodes.filter((qr) => selectedQRCodes.includes(qr.id))
    const csvContent = [
      "QR Code ID,Status,Location,Product Type,Issue Flag,Issue Notes,Date Added,Assigned Date,Claimed Date,Last Scan,Scan Count,Customer ID",
      ...selectedData.map(
        (qr) =>
          `${qr.qr_code_id},${qr.status},${qr.location || ""},${qr.product_type},${qr.issue_flag || "none"},${qr.issue_notes || ""},${new Date(qr.date_added).toLocaleDateString()},${qr.assigned_at ? new Date(qr.assigned_at).toLocaleDateString() : ""},${qr.claimed_at ? new Date(qr.claimed_at).toLocaleDateString() : ""},${qr.last_scan ? new Date(qr.last_scan).toLocaleDateString() : ""},${qr.scan_count},${qr.customer_id || ""}`,
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
      description: `${selectedData.length} QR codes exported to CSV`,
    })
  }

  const totalQRCodes = qrCodes.length
  const availableQRCodes = qrCodes.filter((qr) => qr.status === "available").length
  const onlineQRCodes = qrCodes.filter((qr) => qr.status === "online").length
  const inStoreQRCodes = qrCodes.filter((qr) => qr.status === "in_store").length
  const claimedQRCodes = qrCodes.filter((qr) => qr.status === "claimed").length
  const activeQRCodes = qrCodes.filter((qr) => qr.status === "active").length
  const flaggedQRCodes = qrCodes.filter((qr) => qr.issue_flag !== "none").length

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
              <h1 className="text-xl font-bold text-[#2c2c2c]">QR Code Inventory Management</h1>
              <p className="text-sm text-[#6b5b47]">Comprehensive QR code tracking and management system</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">Total QR Codes</CardTitle>
              <QRCodeIcon className="h-4 w-4 text-[#c44c3a]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c2c2c]">{totalQRCodes}</div>
              <p className="text-xs text-[#6b5b47]">In system</p>
            </CardContent>
          </Card>

          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">Available</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c2c2c]">{availableQRCodes}</div>
              <p className="text-xs text-[#6b5b47]">Warehouse</p>
            </CardContent>
          </Card>

          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">Online</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c2c2c]">{onlineQRCodes}</div>
              <p className="text-xs text-[#6b5b47]">Sales pool</p>
            </CardContent>
          </Card>

          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">In Store</CardTitle>
              <StoreIcon className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c2c2c]">{inStoreQRCodes}</div>
              <p className="text-xs text-[#6b5b47]">At locations</p>
            </CardContent>
          </Card>

          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">Claimed</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c2c2c]">{claimedQRCodes}</div>
              <p className="text-xs text-[#6b5b47]">By customers</p>
            </CardContent>
          </Card>

          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c2c2c]">{activeQRCodes}</div>
              <p className="text-xs text-[#6b5b47]">In use</p>
            </CardContent>
          </Card>

          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">Flagged</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c2c2c]">{flaggedQRCodes}</div>
              <p className="text-xs text-[#6b5b47]">Issues</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[#e5d5c8] mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters, Search & Actions
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === "individual" ? "grouped" : "individual")}
                  className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent"
                >
                  {viewMode === "individual" ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                  {viewMode === "individual" ? "Individual" : "Grouped"}
                </Button>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search and Sort Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-[#2c2c2c]">
                  Search QR Codes
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6b5b47] w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by QR ID, store, customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[#e5d5c8] focus:border-[#2c2c2c] focus:ring-[#2c2c2c] h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort-by" className="text-sm font-medium text-[#2c2c2c]">
                  Sort By
                </Label>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="border-[#e5d5c8] h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date_added">Date Added</SelectItem>
                      <SelectItem value="qr_code_id">QR Code ID</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="scan_count">Scan Count</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent px-3 h-10"
                  >
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#e5d5c8]" />

            {/* Filter Dropdowns Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-filter" className="text-sm font-medium text-[#2c2c2c]">
                  Store Location
                </Label>
                <Select value={storeFilter} onValueChange={setStoreFilter}>
                  <SelectTrigger className="border-[#e5d5c8] h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.name}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue-filter" className="text-sm font-medium text-[#2c2c2c]">
                  Issue Status
                </Label>
                <Select value={issueFilter} onValueChange={setIssueFilter}>
                  <SelectTrigger className="border-[#e5d5c8] h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Issues</SelectItem>
                    <SelectItem value="none">No Issues</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="defective">Defective</SelectItem>
                    <SelectItem value="customer_return">Returns</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-filter" className="text-sm font-medium text-[#2c2c2c]">
                  Date Range
                </Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="border-[#e5d5c8] h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status Filters */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#2c2c2c]">Filter by Status</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "available", label: "Available", color: "bg-green-100 text-green-700" },
                  { value: "online", label: "Online", color: "bg-blue-100 text-blue-700" },
                  { value: "in_store", label: "In Store", color: "bg-purple-100 text-purple-700" },
                  { value: "claimed", label: "Claimed", color: "bg-orange-100 text-orange-700" },
                  { value: "active", label: "Active", color: "bg-emerald-100 text-emerald-700" },
                ].map((status) => (
                  <Button
                    key={status.value}
                    variant={statusFilters.includes(status.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleStatusFilter(status.value)}
                    className={
                      statusFilters.includes(status.value)
                        ? `${status.color} hover:${status.color} border-0`
                        : "border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent"
                    }
                  >
                    {status.label}
                    {statusFilters.includes(status.value) && <span className="ml-2 text-xs">✓</span>}
                  </Button>
                ))}
              </div>
            </div>

            {/* Product Type Filters */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#2c2c2c]">Filter by Product Type</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "essential", label: "Essential", color: "bg-blue-100 text-blue-700" },
                  { value: "premium", label: "Premium", color: "bg-purple-100 text-purple-700" },
                ].map((type) => (
                  <Button
                    key={type.value}
                    variant={typeFilters.includes(type.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTypeFilter(type.value)}
                    className={
                      typeFilters.includes(type.value)
                        ? `${type.color} hover:${type.color} border-0`
                        : "border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent"
                    }
                  >
                    {type.label}
                    {typeFilters.includes(type.value) && <span className="ml-2 text-xs">✓</span>}
                  </Button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#e5d5c8]" />

            <div className="space-y-3">
              <Label className="text-sm font-medium text-[#2c2c2c]">Quick Actions</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={exportSelectedQRCodes}
                  disabled={selectedQRCodes.length === 0}
                  variant="outline"
                  className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-white disabled:opacity-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected {selectedQRCodes.length > 0 && `(${selectedQRCodes.length})`}
                </Button>

                <Dialog open={bulkActionDialog} onOpenChange={setBulkActionDialog}>
                  <DialogTrigger asChild>
                    <Button
                      disabled={selectedQRCodes.length === 0}
                      className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Bulk Actions
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bulk Actions</DialogTitle>
                      <DialogDescription>Apply actions to {selectedQRCodes.length} selected QR codes</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Action Type</Label>
                        <Select
                          value={bulkAction}
                          onValueChange={(value: "status" | "store" | "flag") => setBulkAction(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="status">Change Status</SelectItem>
                            <SelectItem value="store">Assign to Store</SelectItem>
                            <SelectItem value="flag">Add Issue Flag</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {bulkAction === "status" && (
                        <div>
                          <Label>New Status</Label>
                          <Select value={bulkValue} onValueChange={setBulkValue}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="online">Online</SelectItem>
                              <SelectItem value="in_store">In Store</SelectItem>
                              <SelectItem value="claimed">Claimed</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {bulkAction === "store" && (
                        <div>
                          <Label>Store</Label>
                          <Select value={bulkValue} onValueChange={setBulkValue}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {stores.map((store) => (
                                <SelectItem key={store.id} value={store.name}>
                                  {store.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {bulkAction === "flag" && (
                        <>
                          <div>
                            <Label>Issue Flag</Label>
                            <Select value={bulkValue} onValueChange={setBulkValue}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="damaged">Damaged</SelectItem>
                                <SelectItem value="lost">Lost</SelectItem>
                                <SelectItem value="defective">Defective</SelectItem>
                                <SelectItem value="customer_return">Customer Return</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Notes</Label>
                            <Textarea
                              value={flagNotes}
                              onChange={(e) => setFlagNotes(e.target.value)}
                              placeholder="Add notes about the issue..."
                            />
                          </div>
                        </>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setBulkActionDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={processBulkAction} className="bg-purple-600 hover:bg-purple-700 text-white">
                          Apply to {selectedQRCodes.length} QR Codes
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={rangeDialog} onOpenChange={setRangeDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-white">
                      <Target className="w-4 h-4 mr-2" />
                      Select Range
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Smart Range Selection</DialogTitle>
                      <DialogDescription>Select QR codes by range for bulk operations</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Start QR ID</Label>
                          <Input
                            value={rangeSelection.start}
                            onChange={(e) => setRangeSelection((prev) => ({ ...prev, start: e.target.value }))}
                            placeholder="QR000001"
                          />
                        </div>
                        <div>
                          <Label>End QR ID</Label>
                          <Input
                            value={rangeSelection.end}
                            onChange={(e) => setRangeSelection((prev) => ({ ...prev, end: e.target.value }))}
                            placeholder="QR000100"
                          />
                        </div>
                      </div>

                      {rangeSelection.preview.total > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-2">Range Preview</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-blue-700">Total:</span>
                              <span className="font-medium ml-2">{rangeSelection.preview.total}</span>
                            </div>
                            <div>
                              <span className="text-green-700">Available:</span>
                              <span className="font-medium ml-2">{rangeSelection.preview.available}</span>
                            </div>
                            <div>
                              <span className="text-orange-700">Assigned:</span>
                              <span className="font-medium ml-2">{rangeSelection.preview.alreadyAssigned}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setRangeDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={selectQRRange} className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                          Select Range
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={() => router.push("/admin/inventory/import")}
                  className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>

                {selectedQRCodes.length > 0 && (
                  <div className="ml-auto text-sm text-[#6b5b47]">
                    {selectedQRCodes.length} of {filteredQRCodes.length} selected
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e5d5c8]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#2c2c2c]">
                QR Code Inventory ({filteredQRCodes.length} of {totalQRCodes})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedQRCodes.length === filteredQRCodes.length && filteredQRCodes.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label className="text-sm text-[#6b5b47]">Select All</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-[#e5d5c8] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <span className="sr-only">Select</span>
                    </TableHead>
                    <TableHead>QR Code ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead>Scans</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQRCodes.slice(0, 50).map((qr) => (
                    <TableRow key={qr.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedQRCodes.includes(qr.id)}
                          onCheckedChange={(checked) => handleSelectQRCode(qr.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-mono font-medium text-[#2c2c2c]">{qr.qr_code_id}</div>
                        {qr.customer_id && <div className="text-xs text-[#6b5b47]">Customer: {qr.customer_id}</div>}
                      </TableCell>
                      <TableCell>{getStatusBadge(qr.status)}</TableCell>
                      <TableCell>
                        {qr.location ? (
                          <div className="flex items-center gap-2">
                            <StoreIcon className="w-4 h-4 text-purple-600" />
                            <span className="text-[#2c2c2c]">{qr.location}</span>
                          </div>
                        ) : (
                          <span className="text-[#6b5b47] italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>{getProductTypeBadge(qr.product_type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getIssueBadge(qr.issue_flag)}
                          {qr.issue_notes && (
                            <div className="text-xs text-[#6b5b47] max-w-32 truncate" title={qr.issue_notes}>
                              {qr.issue_notes}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-mono">{qr.scan_count}</div>
                          {qr.last_scan && (
                            <div className="text-xs text-[#6b5b47]">{new Date(qr.last_scan).toLocaleDateString()}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-[#6b5b47]">
                          <Calendar className="w-4 h-4" />
                          {new Date(qr.date_added).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {qr.status === "available" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setQrCodes((prev) =>
                                      prev.map((q) =>
                                        q.id === qr.id
                                          ? { ...q, status: "online", assigned_at: new Date().toISOString() }
                                          : q,
                                      ),
                                    )
                                    toast({ title: "Status Updated", description: "QR code moved to online pool" })
                                  }}
                                >
                                  <Target className="w-4 h-4 mr-2" />
                                  Move to Online
                                </DropdownMenuItem>
                                {stores.map((store) => (
                                  <DropdownMenuItem
                                    key={store.id}
                                    onClick={() => {
                                      setQrCodes((prev) =>
                                        prev.map((q) =>
                                          q.id === qr.id
                                            ? {
                                                ...q,
                                                status: "in_store",
                                                location: store.name,
                                                assigned_at: new Date().toISOString(),
                                              }
                                            : q,
                                        ),
                                      )
                                      toast({ title: "QR Code Assigned", description: `Assigned to ${store.name}` })
                                    }}
                                  >
                                    <StoreIcon className="w-4 h-4 mr-2" />
                                    Assign to {store.name}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                const csvContent = [
                                  "QR Code ID,Status,Location,Product Type,Issue Flag,Date Added,Scan Count",
                                  `${qr.qr_code_id},${qr.status},${qr.location || ""},${qr.product_type},${qr.issue_flag || "none"},${new Date(qr.date_added).toLocaleDateString()},${qr.scan_count}`,
                                ].join("\n")

                                const blob = new Blob([csvContent], { type: "text/csv" })
                                const url = window.URL.createObjectURL(blob)
                                const a = document.createElement("a")
                                a.href = url
                                a.download = `qr-${qr.qr_code_id}.csv`
                                a.click()
                                window.URL.revokeObjectURL(url)

                                toast({
                                  title: "Export Complete",
                                  description: `QR code ${qr.qr_code_id} exported to CSV`,
                                })
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export QR Code
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredQRCodes.length > 50 && (
              <div className="mt-4 text-center text-sm text-[#6b5b47]">
                Showing first 50 of {filteredQRCodes.length} results. Use filters to narrow down results.
              </div>
            )}

            {filteredQRCodes.length === 0 && (
              <div className="p-8 text-center">
                <QRCodeIcon className="w-12 h-12 text-[#6b5b47] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#2c2c2c] mb-2">No QR codes found</h3>
                <p className="text-[#6b5b47] mb-4">
                  {searchTerm || statusFilters.length > 0 || typeFilters.length > 0 || storeFilter !== "all"
                    ? "Try adjusting your filters or search terms."
                    : "Import your first CSV file to add QR codes to inventory."}
                </p>
                <Button
                  onClick={() => router.push("/admin/inventory/import")}
                  className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import QR Codes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
