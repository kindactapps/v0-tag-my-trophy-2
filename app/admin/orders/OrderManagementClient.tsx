"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import BackButton from "@/components/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { ProgressIndicator } from "@/components/ui/progress-indicator"
import { SelectionCounter } from "@/components/ui/selection-counter"
import QRScanner from "@/components/qr-scanner"
import {
  Search,
  Download,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Bell,
  BellRing,
  Printer,
  Users,
  RefreshCw,
  ExternalLink,
  MapPin,
  DollarSign,
  FileText,
  Scan,
  X,
  Check,
  AlertCircle,
  Camera,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Order {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone: string
  }
  items: {
    type: string
    quantity: number
    customization?: string
  }[]
  amount: number
  status: "new" | "processing" | "packaged" | "ready_to_ship" | "shipped" | "completed"
  orderDate: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zip: string
  }
  trackingNumber?: string
  carrier?: string
  notes?: string
  assignedQrCodes?: string[]
}

interface ScannedQRCode {
  id: string
  qrCodeId: string
  status: string
}

export default function OrderManagementClient() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isProcessingBulk, setIsProcessingBulk] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [trackingDialog, setTrackingDialog] = useState(false)
  const [newTrackingNumber, setNewTrackingNumber] = useState("")
  const [newCarrier, setNewCarrier] = useState("USPS")
  const [shippingNotes, setShippingNotes] = useState("")
  const [bulkStatusDialog, setBulkStatusDialog] = useState(false)
  const [bulkStatusValue, setBulkStatusValue] = useState<Order["status"]>("processing")
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    action: () => void
    variant?: "default" | "destructive" | "warning" | "success"
  }>({
    open: false,
    title: "",
    description: "",
    action: () => {},
  })

  const [packScanDialog, setPackScanDialog] = useState(false)
  const [packingOrder, setPackingOrder] = useState<Order | null>(null)
  const [scannedCodes, setScannedCodes] = useState<ScannedQRCode[]>([])
  const [scanInput, setScanInput] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [showCameraScanner, setShowCameraScanner] = useState(false)

  const router = useRouter()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      console.log("[v0] Fetching orders...")
      // const token = localStorage.getItem("admin_token")

      // if (!token) {
      //   console.error("[v0] No admin token found")
      //   toast({
      //     title: "Authentication Error",
      //     description: "Please log in again",
      //     variant: "destructive",
      //   })
      //   router.push("/auth/admin")
      //   return
      // }

      console.log("[v0] Making API request...")
      const response = await fetch("/api/admin/orders/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        // if (response.status === 401) {
        //   toast({
        //     title: "Session Expired",
        //     description: "Please log in again",
        //     variant: "destructive",
        //   })
        //   router.push("/auth/admin")
        //   return
        // }
        const errorText = await response.text()
        console.error("[v0] API error response:", errorText)
        throw new Error("Failed to fetch orders")
      }

      const { orders: data } = await response.json()
      console.log("[v0] Received orders:", data?.length || 0)

      // Transform database data to match Order interface
      const transformedOrders: Order[] = (data || []).map((order: any) => ({
        id: order.id,
        orderNumber: order.order_number,
        customer: {
          name: order.customer_name || order.shipping_name || "",
          email: order.customer_email || order.shipping_email || "",
          phone: order.customer_phone || order.shipping_phone || "",
        },
        items: [{ type: "QR Tag", quantity: 1 }], // Simplified
        amount: Number(order.total_amount) || 0,
        status: order.status || "new",
        orderDate: order.created_at,
        shippingAddress: {
          street: order.shipping_address?.line1 || "",
          city: order.shipping_city || "",
          state: order.shipping_state || "",
          zip: order.shipping_zip || "",
        },
        trackingNumber: order.shipping_tracking,
        carrier: order.carrier,
        notes: order.notes,
        assignedQrCodes: order.assigned_qr_codes || [],
      }))

      setOrders(transformedOrders)
      setFilteredOrders(transformedOrders)
      console.log("[v0] Orders loaded successfully")
    } catch (error) {
      console.error("[v0] Error fetching orders:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load orders",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (activeTab !== "all") {
      filtered = filtered.filter((order) => order.status === activeTab)
    }

    setFilteredOrders(filtered)
  }, [searchTerm, activeTab, orders])

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      new: { color: "bg-blue-100 text-blue-700", icon: Clock, label: "New Order" },
      processing: { color: "bg-orange-100 text-orange-700", icon: Package, label: "Processing" },
      packaged: { color: "bg-indigo-100 text-indigo-700", icon: Package, label: "Packaged" },
      ready_to_ship: { color: "bg-purple-100 text-purple-700", icon: Package, label: "Ready to Ship" },
      shipped: { color: "bg-green-100 text-green-700", icon: Truck, label: "Shipped" },
      completed: { color: "bg-gray-100 text-gray-700", icon: CheckCircle, label: "Completed" },
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

  const getOrderProgressSteps = (currentStatus: Order["status"]) => {
    const allSteps = [
      { id: "new", label: "New Order", icon: Clock },
      { id: "processing", label: "Processing", icon: Package },
      { id: "ready_to_ship", label: "Ready to Ship", icon: Package },
      { id: "packaged", label: "Packaged", icon: Package },
      { id: "shipped", label: "Shipped", icon: Truck },
      { id: "completed", label: "Completed", icon: CheckCircle },
    ]

    const statusOrder = ["new", "processing", "ready_to_ship", "packaged", "shipped", "completed"]
    const currentIndex = statusOrder.indexOf(currentStatus)

    return allSteps.map((step, index) => ({
      ...step,
      status: index < currentIndex ? "completed" : index === currentIndex ? "current" : "pending",
    }))
  }

  const updateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"],
    trackingNumber?: string,
    carrier?: string,
    notes?: string,
  ) => {
    try {
      // const token = localStorage.getItem("admin_token")

      // if (!token) {
      //   toast({
      //     title: "Authentication Error",
      //     description: "Please log in again",
      //     variant: "destructive",
      //   })
      //   router.push("/admin/login")
      //   return
      // }

      const response = await fetch("/api/admin/orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          trackingNumber,
          carrier,
          notes,
        }),
      })

      if (!response.ok) {
        // if (response.status === 401) {
        //   toast({
        //     title: "Session Expired",
        //     description: "Please log in again",
        //     variant: "destructive",
        //   })
        //   router.push("/admin/login")
        //   return
        // }
        throw new Error("Failed to update order")
      }

      await fetchOrders()

      const order = orders.find((o) => o.id === orderId)
      if (order) {
        const notification = {
          id: Date.now().toString(),
          type: "status_update",
          title: `Order ${order.orderNumber} Updated`,
          message: `Status changed to ${newStatus}`,
          timestamp: new Date().toISOString(),
          orderId,
        }
        setNotifications((prev) => [notification, ...prev.slice(0, 9)])

        toast({
          title: "Order Updated",
          description: `${order.orderNumber} status changed to ${newStatus}`,
        })
      }
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openPackScanDialog = (order: Order) => {
    setPackingOrder(order)
    setScannedCodes([])
    setScanInput("")
    setPackScanDialog(true)
  }

  const handleScanQRCode = async () => {
    if (!scanInput.trim() || !packingOrder) return

    setIsScanning(true)
    try {
      // const token = localStorage.getItem("admin_token")

      // if (!token) {
      //   toast({
      //     title: "Authentication Error",
      //     description: "Please log in again",
      //     variant: "destructive",
      //   })
      //   router.push("/admin/login")
      //   setIsScanning(false)
      //   return
      // }

      // Check if QR code exists and is available
      const response = await fetch("/api/admin/orders/scan-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeId: scanInput.trim() }),
      })

      if (!response.ok) {
        // if (response.status === 401) {
        //   toast({
        //     title: "Session Expired",
        //     description: "Please log in again",
        //     variant: "destructive",
        //   })
        //   router.push("/admin/login")
        //   setIsScanning(false)
        //   return
        // }

        const { error } = await response.json()
        toast({
          title: "Invalid QR Code",
          description: error || `QR code "${scanInput}" not found or unavailable`,
          variant: "destructive",
        })
        setScanInput("")
        setIsScanning(false)
        return
      }

      const { qrCode } = await response.json()

      // Check if already scanned in this session
      if (scannedCodes.some((code) => code.qrCodeId === qrCode.qr_code_id)) {
        toast({
          title: "Already Scanned",
          description: `QR code "${scanInput}" has already been scanned for this order`,
          variant: "destructive",
        })
        setScanInput("")
        setIsScanning(false)
        return
      }

      // Add to scanned codes
      setScannedCodes((prev) => [
        ...prev,
        {
          id: qrCode.id,
          qrCodeId: qrCode.qr_code_id,
          status: qrCode.status,
        },
      ])

      toast({
        title: "QR Code Scanned",
        description: `Successfully scanned ${qrCode.qr_code_id}`,
      })

      setScanInput("")
    } catch (error) {
      console.error("Error scanning QR code:", error)
      toast({
        title: "Scan Error",
        description: "Failed to scan QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const handleCameraScanSuccess = async (scannedData: string) => {
    console.log("[v0] Camera scanned data:", scannedData)

    setShowCameraScanner(false)

    // Extract QR code ID from the scanned data
    // The scanned data could be a full URL like "https://example.com/story/QR-12345"
    // or just the QR code ID like "QR-12345"
    let qrCodeId = scannedData

    // If it's a URL, try to extract the QR code ID
    try {
      if (scannedData.includes("http") || scannedData.includes("/")) {
        const url = new URL(scannedData)
        // Try to get from path segments
        const pathSegments = url.pathname.split("/").filter(Boolean)
        // Look for a segment that looks like a QR code ID (contains "QR" or matches pattern)
        const qrSegment = pathSegments.find((seg) => seg.toUpperCase().includes("QR") || /^[A-Z0-9-]+$/i.test(seg))
        if (qrSegment) {
          qrCodeId = qrSegment
        }
      }
    } catch (e) {
      // If URL parsing fails, use the original data
      console.log("[v0] Not a URL, using raw data as QR code ID")
    }

    console.log("[v0] Extracted QR code ID:", qrCodeId)

    setScanInput(qrCodeId)

    // Automatically process the scanned code
    if (!packingOrder) return

    setIsScanning(true)
    try {
      const response = await fetch("/api/admin/orders/scan-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeId: qrCodeId.trim() }),
      })

      if (!response.ok) {
        const { error } = await response.json()
        toast({
          title: "Invalid QR Code",
          description: error || `QR code "${qrCodeId}" not found or unavailable`,
          variant: "destructive",
        })
        setScanInput("")
        setIsScanning(false)
        return
      }

      const { qrCode } = await response.json()

      // Check if already scanned in this session
      if (scannedCodes.some((code) => code.qrCodeId === qrCode.qr_code_id)) {
        toast({
          title: "Already Scanned",
          description: `QR code "${qrCodeId}" has already been scanned for this order`,
          variant: "destructive",
        })
        setScanInput("")
        setIsScanning(false)
        return
      }

      // Add to scanned codes
      setScannedCodes((prev) => [
        ...prev,
        {
          id: qrCode.id,
          qrCodeId: qrCode.qr_code_id,
          status: qrCode.status,
        },
      ])

      toast({
        title: "QR Code Scanned",
        description: `Successfully scanned ${qrCode.qr_code_id}`,
      })

      setScanInput("")
    } catch (error) {
      console.error("Error scanning QR code:", error)
      toast({
        title: "Scan Error",
        description: "Failed to scan QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const removeScannedCode = (qrCodeId: string) => {
    setScannedCodes((prev) => prev.filter((code) => code.qrCodeId !== qrCodeId))
    toast({
      title: "Code Removed",
      description: `Removed ${qrCodeId} from scanned list`,
    })
  }

  const completePacking = async () => {
    if (!packingOrder || scannedCodes.length === 0) return

    const requiredQuantity = packingOrder.items.reduce((sum, item) => sum + item.quantity, 0)

    if (scannedCodes.length !== requiredQuantity) {
      toast({
        title: "Incorrect Quantity",
        description: `Please scan exactly ${requiredQuantity} QR codes (currently scanned: ${scannedCodes.length})`,
        variant: "destructive",
      })
      return
    }

    setIsScanning(true)
    try {
      // const token = localStorage.getItem("admin_token")

      // if (!token) {
      //   toast({
      //     title: "Authentication Error",
      //     description: "Please log in again",
      //     variant: "destructive",
      //   })
      //   router.push("/admin/login")
      //   setIsScanning(false)
      //   return
      // }

      const response = await fetch("/api/admin/orders/pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: packingOrder.id,
          scannedCodes,
          orderNumber: packingOrder.orderNumber,
        }),
      })

      if (!response.ok) {
        // if (response.status === 401) {
        //   toast({
        //     title: "Session Expired",
        //     description: "Please log in again",
        //     variant: "destructive",
        //   })
        //   router.push("/admin/login")
        //   setIsScanning(false)
        //   return
        // }
        throw new Error("Failed to complete packing")
      }

      toast({
        title: "Packing Complete",
        description: `Successfully packed ${scannedCodes.length} QR codes for order ${packingOrder.orderNumber}`,
      })

      setPackScanDialog(false)
      setPackingOrder(null)
      setScannedCodes([])
      await fetchOrders()
    } catch (error) {
      console.error("Error completing packing:", error)
      toast({
        title: "Packing Failed",
        description: "Failed to complete packing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const processBulkAction = async (action: string) => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select orders to perform bulk actions.",
        variant: "destructive",
      })
      return
    }

    setIsProcessingBulk(true)
    try {
      switch (action) {
        case "export_csv":
          await exportSelectedToCSV()
          break
        case "export_shipping_labels":
          await exportShippingLabelsCSV()
          break
        case "bulk_status_update":
          break
      }

      if (action !== "export_csv" && action !== "export_shipping_labels" && action !== "bulk_status_update") {
        toast({
          title: "Bulk Action Complete",
          description: `Processed ${selectedOrders.length} orders successfully.`,
        })
        setSelectedOrders([])
      }
    } catch (error) {
      toast({
        title: "Bulk Action Failed",
        description: "Some operations may have failed. Please check individual orders.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingBulk(false)
    }
  }

  const exportShippingLabelsCSV = async () => {
    try {
      const selectedOrdersData = orders.filter((order) => selectedOrders.includes(order.id))

      const headers = [
        "Order Number",
        "Customer Name",
        "Phone",
        "Address Line 1",
        "City",
        "State",
        "ZIP Code",
        "Carrier",
        "Tracking Number",
        "Weight (lbs)",
      ]

      const rows = selectedOrdersData.map((order) => [
        order.orderNumber,
        order.customer.name,
        order.customer.phone,
        order.shippingAddress.street,
        order.shippingAddress.city,
        order.shippingAddress.state,
        order.shippingAddress.zip,
        order.carrier || "",
        order.trackingNumber || "",
        "0.5",
      ])

      const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `shipping_labels_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Shipping Labels Exported",
        description: `Exported ${selectedOrdersData.length} shipping labels to CSV file.`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export shipping labels. Please try again.",
        variant: "destructive",
      })
    }
  }

  const exportSelectedToCSV = async () => {
    try {
      const selectedOrdersData = orders.filter((order) => selectedOrders.includes(order.id))

      const headers = [
        "Order Number",
        "Customer Name",
        "Email",
        "Phone",
        "Street Address",
        "City",
        "State",
        "ZIP Code",
        "Order Amount",
        "Status",
        "Order Date",
        "Tracking Number",
        "Carrier",
        "Items",
        "Customization",
      ]

      const rows = selectedOrdersData.map((order) => [
        order.orderNumber,
        order.customer.name,
        order.customer.email,
        order.customer.phone,
        order.shippingAddress.street,
        order.shippingAddress.city,
        order.shippingAddress.state,
        order.shippingAddress.zip,
        order.amount.toFixed(2),
        order.status,
        order.orderDate,
        order.trackingNumber || "",
        order.carrier || "",
        order.items.map((item) => `${item.quantity}x ${item.type}`).join("; "),
        order.items
          .map((item) => item.customization || "")
          .filter(Boolean)
          .join("; "),
      ])

      const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `orders_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Complete",
        description: `Exported ${selectedOrdersData.length} orders to CSV file.`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export orders. Please try again.",
        variant: "destructive",
      })
    }
  }

  const processBulkStatusUpdate = async () => {
    if (selectedOrders.length === 0) return

    setIsProcessingBulk(true)
    try {
      for (const orderId of selectedOrders) {
        await updateOrderStatus(orderId, bulkStatusValue)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      toast({
        title: "Bulk Status Update Complete",
        description: `Updated ${selectedOrders.length} orders to ${bulkStatusValue}.`,
      })
      setSelectedOrders([])
      setBulkStatusDialog(false)
    } catch (error) {
      toast({
        title: "Bulk Update Failed",
        description: "Some status updates may have failed. Please check individual orders.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingBulk(false)
    }
  }

  const generateShippingLabel = async (order: Order) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Shipping Label Generated",
        description: `Label created for ${order.orderNumber}`,
      })

      const link = document.createElement("a")
      link.href = `/api/orders/${order.id}/shipping-label.pdf`
      link.download = `shipping-label-${order.orderNumber}.pdf`
      link.click()
    } catch (error) {
      toast({
        title: "Label Generation Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    }
  }

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map((order) => order.id))
    }
  }

  const showConfirmDialog = (
    title: string,
    description: string,
    action: () => void,
    variant?: "default" | "destructive" | "warning" | "success",
  ) => {
    setConfirmDialog({
      open: true,
      title,
      description,
      action,
      variant,
    })
  }

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    await updateOrderStatus(orderId, newStatus)
  }

  const getStatusCount = (status: string) => {
    if (status === "all") return orders.length
    return orders.filter((order) => order.status === status).length
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5d5c8] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href="/admin/dashboard" label="Back to Dashboard" />
            <div>
              <h1 className="text-xl font-bold text-[#2c2c2c]">Order Management</h1>
              <p className="text-sm text-[#6b5b47]">Manage customer orders and fulfillment</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              {notifications.length > 0 ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {showNotifications && (
          <div className="absolute right-6 top-16 w-80 bg-white border border-[#e5d5c8] rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-[#e5d5c8]">
              <h3 className="font-medium text-[#2c2c2c]">Recent Notifications</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-[#6b5b47]">No new notifications</div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="p-3 border-b border-[#e5d5c8] hover:bg-[#f5f0e8]">
                    <div className="font-medium text-sm text-[#2c2c2c]">{notification.title}</div>
                    <div className="text-xs text-[#6b5b47]">{notification.message}</div>
                    <div className="text-xs text-[#6b5b47] mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </header>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-[#e5d5c8]">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#f5f0e8]">
              All Orders ({getStatusCount("all")})
            </TabsTrigger>
            <TabsTrigger value="new" className="data-[state=active]:bg-blue-50">
              New Orders ({getStatusCount("new")})
            </TabsTrigger>
            <TabsTrigger value="processing" className="data-[state=active]:bg-orange-50">
              Processing ({getStatusCount("processing")})
            </TabsTrigger>
            <TabsTrigger value="ready_to_ship" className="data-[state=active]:bg-purple-50">
              Ready to Ship ({getStatusCount("ready_to_ship")})
            </TabsTrigger>
            <TabsTrigger value="packaged" className="data-[state=active]:bg-indigo-50">
              Packaged ({getStatusCount("packaged")})
            </TabsTrigger>
            <TabsTrigger value="shipped" className="data-[state=active]:bg-green-50">
              Shipped ({getStatusCount("shipped")})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-gray-50">
              Completed ({getStatusCount("completed")})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#2c2c2c]">Search & Filter</CardTitle>
                  <SelectionCounter
                    count={selectedOrders.length}
                    total={filteredOrders.length}
                    onClear={() => setSelectedOrders([])}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6b5b47] w-4 h-4" />
                    <Input
                      placeholder="Search by order number, customer name, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#e5d5c8] focus:border-[#2c2c2c] focus:ring-[#2c2c2c]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-[#e5d5c8]">
                    <span className="text-sm font-medium text-[#2c2c2c] mr-2">
                      Quick Bulk Actions ({selectedOrders.length} selected):
                    </span>
                    <Button
                      size="sm"
                      onClick={() =>
                        showConfirmDialog(
                          "Export Order Data",
                          `Export ${selectedOrders.length} selected orders to CSV file?`,
                          () => processBulkAction("export_csv"),
                        )
                      }
                      disabled={isProcessingBulk || selectedOrders.length === 0}
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessingBulk ? (
                        <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <Download className="w-3 h-3 mr-1" />
                      )}
                      Export Orders
                    </Button>

                    <Button
                      size="sm"
                      onClick={() =>
                        showConfirmDialog(
                          "Export Shipping Labels",
                          `Export ${selectedOrders.length} shipping labels for label printing?`,
                          () => processBulkAction("export_shipping_labels"),
                        )
                      }
                      disabled={isProcessingBulk || selectedOrders.length === 0}
                      className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessingBulk ? (
                        <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <FileText className="w-3 h-3 mr-1" />
                      )}
                      Export Shipping Labels
                    </Button>

                    <Dialog open={bulkStatusDialog} onOpenChange={setBulkStatusDialog}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          disabled={isProcessingBulk || selectedOrders.length === 0}
                          className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Update Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Bulk Status Update</DialogTitle>
                          <DialogDescription>
                            Update the status of {selectedOrders.length} selected orders
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">New Status</label>
                            <Select
                              value={bulkStatusValue}
                              onValueChange={(value: Order["status"]) => setBulkStatusValue(value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New Order</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="ready_to_ship">Ready to Ship</SelectItem>
                                <SelectItem value="packaged">Packaged</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setBulkStatusDialog(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={() =>
                                showConfirmDialog(
                                  "Confirm Bulk Status Update",
                                  `Update ${selectedOrders.length} orders to "${bulkStatusValue}" status?`,
                                  processBulkStatusUpdate,
                                  "warning",
                                )
                              }
                              disabled={isProcessingBulk}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              {isProcessingBulk ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : null}
                              Update {selectedOrders.length} Orders
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">Orders ({filteredOrders.length})</CardTitle>
                <CardDescription className="text-[#6b5b47]">
                  {activeTab === "new" && "New orders that need to be processed"}
                  {activeTab === "processing" && "Orders currently being processed"}
                  {activeTab === "ready_to_ship" && "Orders ready for shipping"}
                  {activeTab === "packaged" && "Orders that have been packed with QR codes"}
                  {activeTab === "shipped" && "Orders that have been shipped"}
                  {activeTab === "completed" && "Completed orders"}
                  {activeTab === "all" && "All orders in the system"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={() => toggleOrderSelection(order.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-[#2c2c2c]">{order.customer.name}</p>
                            <p className="text-sm text-[#6b5b47]">{order.customer.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.items.map((item, index) => (
                            <div key={index} className="text-sm">
                              {item.quantity}x {item.type}
                            </div>
                          ))}
                        </TableCell>
                        <TableCell className="font-medium">${order.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value: Order["status"]) => handleStatusChange(order.id, value)}
                          >
                            <SelectTrigger className="w-[160px] h-8 border-none bg-transparent p-0 hover:bg-[#f5f0e8] focus:ring-0">
                              <SelectValue asChild>{getStatusBadge(order.status)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3 text-blue-600" />
                                  <span>New Order</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="processing">
                                <div className="flex items-center gap-2">
                                  <Package className="w-3 h-3 text-orange-600" />
                                  <span>Processing</span>
                                </div>
                              </SelectItem>
                              {/* Moved "ready_to_ship" option before "packaged" */}
                              <SelectItem value="ready_to_ship">
                                <div className="flex items-center gap-2">
                                  <Package className="w-3 h-3 text-purple-600" />
                                  <span>Ready to Ship</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="packaged">
                                <div className="flex items-center gap-2">
                                  <Package className="w-3 h-3 text-indigo-600" />
                                  <span>Packaged</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="shipped">
                                <div className="flex items-center gap-2">
                                  <Truck className="w-3 h-3 text-green-600" />
                                  <span>Shipped</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="completed">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-gray-600" />
                                  <span>Completed</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {(order.status === "processing" || order.status === "new") && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 bg-transparent mr-1"
                                onClick={() => openPackScanDialog(order)}
                              >
                                <Scan className="w-4 h-4" />
                              </Button>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
                                  <DialogDescription>
                                    Complete order information and management options
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedOrder && (
                                  <div className="space-y-6">
                                    <Card className="border-[#e5d5c8]">
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Order Progress</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <ProgressIndicator steps={getOrderProgressSteps(selectedOrder.status)} />
                                      </CardContent>
                                    </Card>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <Card className="border-[#e5d5c8]">
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-sm flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Customer Information
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-[#6b5b47]" />
                                            <span className="text-sm">{selectedOrder.customer.email}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-[#6b5b47]" />
                                            <span className="text-sm">{selectedOrder.customer.phone}</span>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card className="border-[#e5d5c8]">
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-sm flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            Order Summary
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          <div className="flex justify-between">
                                            <span className="text-sm text-[#6b5b47]">Order Date:</span>
                                            <span className="text-sm">
                                              {new Date(selectedOrder.orderDate).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-sm text-[#6b5b47]">Total Amount:</span>
                                            <span className="text-sm font-medium">
                                              ${selectedOrder.amount.toFixed(2)}
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-sm text-[#6b5b47]">Status:</span>
                                            {getStatusBadge(selectedOrder.status)}
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card className="border-[#e5d5c8]">
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-sm flex items-center gap-2">
                                            <Truck className="w-4 h-4" />
                                            Shipping Info
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          {selectedOrder.trackingNumber && (
                                            <>
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm text-[#6b5b47]">Carrier:</span>
                                                <span className="text-sm font-medium">{selectedOrder.carrier}</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm text-[#6b5b47]">Tracking:</span>
                                                <span className="text-sm font-mono">
                                                  {selectedOrder.trackingNumber}
                                                </span>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="h-6 w-6 p-0"
                                                  onClick={() =>
                                                    window.open(
                                                      `https://www.ups.com/track?tracknum=${selectedOrder.trackingNumber}`,
                                                      "_blank",
                                                    )
                                                  }
                                                >
                                                  <ExternalLink className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            </>
                                          )}
                                          <Button
                                            size="sm"
                                            onClick={() => generateShippingLabel(selectedOrder)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                          >
                                            <Printer className="w-3 h-3 mr-1" />
                                            Generate Label
                                          </Button>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    <Card className="border-[#e5d5c8]">
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                          <MapPin className="w-4 h-4" />
                                          Shipping Address
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="flex justify-between items-start">
                                          <p className="text-sm">
                                            {selectedOrder.shippingAddress.street}
                                            <br />
                                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                                            {selectedOrder.shippingAddress.zip}
                                          </p>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              const address = `${selectedOrder.shippingAddress.street}, ${selectedOrder.shippingAddress.city}, ${selectedOrder.shippingAddress.state} ${selectedOrder.shippingAddress.zip}`
                                              window.open(
                                                `https://maps.google.com/maps?q=${encodeURIComponent(address)}`,
                                                "_blank",
                                              )
                                            }}
                                          >
                                            <MapPin className="w-3 h-3 mr-1" />
                                            View Map
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    <Card className="border-[#e5d5c8]">
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Order Items</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        {selectedOrder.items.map((item, index) => (
                                          <div
                                            key={index}
                                            className="flex justify-between items-center py-2 border-b border-[#e5d5c8] last:border-b-0"
                                          >
                                            <div>
                                              <p className="font-medium text-[#2c2c2c]">{item.type}</p>
                                              {item.customization && (
                                                <p className="text-sm text-[#6b5b47]">Custom: {item.customization}</p>
                                              )}
                                            </div>
                                            <div className="text-right">
                                              <p className="font-medium">Qty: {item.quantity}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </CardContent>
                                    </Card>

                                    <div className="space-y-4">
                                      <h4 className="font-medium text-[#2c2c2c]">Quick Actions</h4>
                                      <div className="flex flex-wrap gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
                                          onClick={() => updateOrderStatus(selectedOrder.id, "processing")}
                                        >
                                          <Package className="w-3 h-3 mr-1" />
                                          Start Processing
                                        </Button>

                                        {(selectedOrder.status === "processing" || selectedOrder.status === "new") && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 bg-transparent"
                                            onClick={() => {
                                              openPackScanDialog(selectedOrder)
                                            }}
                                          >
                                            <Scan className="w-3 h-3 mr-1" />
                                            Pack Order
                                          </Button>
                                        )}

                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent"
                                          onClick={() => updateOrderStatus(selectedOrder.id, "ready_to_ship")}
                                        >
                                          <Package className="w-3 h-3 mr-1" />
                                          Ready to Ship
                                        </Button>

                                        <Dialog open={trackingDialog} onOpenChange={setTrackingDialog}>
                                          <DialogTrigger asChild>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
                                            >
                                              <Truck className="w-3 h-3 mr-1" />
                                              Mark Shipped
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Mark Order as Shipped</DialogTitle>
                                              <DialogDescription>
                                                Add tracking information for {selectedOrder.orderNumber}
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              <div>
                                                <label className="text-sm font-medium">Carrier</label>
                                                <Select value={newCarrier} onValueChange={setNewCarrier}>
                                                  <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="USPS">USPS</SelectItem>
                                                    <SelectItem value="UPS">UPS</SelectItem>
                                                    <SelectItem value="FedEx">FedEx</SelectItem>
                                                    <SelectItem value="DHL">DHL</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div>
                                                <label className="text-sm font-medium">Tracking Number</label>
                                                <Input
                                                  value={newTrackingNumber}
                                                  onChange={(e) => setNewTrackingNumber(e.target.value)}
                                                  placeholder="Enter tracking number..."
                                                  className="mt-1"
                                                />
                                              </div>
                                              <div>
                                                <label className="text-sm font-medium">Shipping Notes (Optional)</label>
                                                <Textarea
                                                  value={shippingNotes}
                                                  onChange={(e) => setShippingNotes(e.target.value)}
                                                  placeholder="Add any shipping notes..."
                                                  className="mt-1"
                                                  rows={3}
                                                />
                                              </div>
                                              <div className="flex justify-end gap-2">
                                                <Button
                                                  variant="outline"
                                                  onClick={() => {
                                                    setTrackingDialog(false)
                                                    setNewTrackingNumber("")
                                                    setNewCarrier("USPS")
                                                    setShippingNotes("")
                                                  }}
                                                >
                                                  Cancel
                                                </Button>
                                                <Button
                                                  onClick={() => {
                                                    updateOrderStatus(
                                                      selectedOrder.id,
                                                      "shipped",
                                                      newTrackingNumber,
                                                      newCarrier,
                                                      shippingNotes,
                                                    )
                                                    setTrackingDialog(false)
                                                    setNewTrackingNumber("")
                                                    setNewCarrier("USPS")
                                                    setShippingNotes("")
                                                  }}
                                                  className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                  Mark as Shipped
                                                </Button>
                                              </div>
                                            </div>
                                          </DialogContent>
                                        </Dialog>

                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent"
                                          onClick={() => updateOrderStatus(selectedOrder.id, "completed")}
                                        >
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Mark Completed
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={packScanDialog} onOpenChange={setPackScanDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pack Order - {packingOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Scan QR codes with camera or enter manually to link them to this order
            </DialogDescription>
          </DialogHeader>

          {packingOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <Card className="border-[#e5d5c8] bg-[#f5f0e8]">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#6b5b47]">Customer:</span>
                      <p className="font-medium text-[#2c2c2c]">{packingOrder.customer.name}</p>
                    </div>
                    <div>
                      <span className="text-[#6b5b47]">Quantity Needed:</span>
                      <p className="font-medium text-[#2c2c2c]">
                        {packingOrder.items.reduce((sum, item) => sum + item.quantity, 0)} QR codes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2c2c2c]">Scan QR Code</label>

                {/* Camera Scanner Button */}
                <Button
                  onClick={() => setShowCameraScanner(true)}
                  disabled={isScanning}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Open Camera Scanner
                </Button>

                {/* Manual Entry Option */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#e5d5c8]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-[#6b5b47]">Or enter manually</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleScanQRCode()
                      }
                    }}
                    placeholder="Type QR code ID..."
                    className="flex-1 border-[#e5d5c8] focus:border-indigo-500 focus:ring-indigo-500"
                    disabled={isScanning}
                  />
                  <Button
                    onClick={handleScanQRCode}
                    disabled={!scanInput.trim() || isScanning}
                    variant="outline"
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 bg-transparent"
                  >
                    {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center justify-between p-4 bg-[#f5f0e8] rounded-lg border border-[#e5d5c8]">
                <span className="text-sm font-medium text-[#2c2c2c]">Scanned Progress:</span>
                <span className="text-lg font-bold text-indigo-600">
                  {scannedCodes.length} / {packingOrder.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>

              {/* Scanned Codes List */}
              {scannedCodes.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2c2c2c]">Scanned QR Codes</label>
                  <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-white border border-[#e5d5c8] rounded-lg">
                    {scannedCodes.map((code) => (
                      <div
                        key={code.qrCodeId}
                        className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="font-mono text-sm font-medium">{code.qrCodeId}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeScannedCode(code.qrCodeId)}
                          className="h-6 w-6 p-0 hover:bg-red-100"
                        >
                          <X className="w-3 h-3 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning if quantity mismatch */}
              {scannedCodes.length > 0 &&
                scannedCodes.length !== packingOrder.items.reduce((sum, item) => sum + item.quantity, 0) && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Please scan exactly {packingOrder.items.reduce((sum, item) => sum + item.quantity, 0)} QR codes to
                      complete packing
                    </span>
                  </div>
                )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-[#e5d5c8]">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPackScanDialog(false)
                    setPackingOrder(null)
                    setScannedCodes([])
                    setScanInput("")
                  }}
                  disabled={isScanning}
                >
                  Cancel
                </Button>
                <Button
                  onClick={completePacking}
                  disabled={
                    scannedCodes.length === 0 ||
                    scannedCodes.length !== packingOrder.items.reduce((sum, item) => sum + item.quantity, 0) ||
                    isScanning
                  }
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Complete Packing
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <QRScanner
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        onScanSuccess={handleCameraScanSuccess}
      />

      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={() => {
          confirmDialog.action()
          setConfirmDialog((prev) => ({ ...prev, open: false }))
        }}
        variant={confirmDialog.variant}
        isLoading={isProcessingBulk}
      />
    </div>
  )
}
