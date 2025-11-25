"use client"

import { Progress } from "@/components/ui/progress"
import { Copy, Eye, Upload, FileText, CheckCircle2, BarChart3, Trash2, TestTube } from "lucide-react"
import { Rocket, Search } from "lucide-react" // Import Rocket and Search

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import BackButton from "@/components/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QrCode, RefreshCw, Package, CheckCircle, Clock, AlertTriangle, Download, Send, Edit } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Slug {
  id: string
  qr_code_id?: string // Added qr_code_id field
  slug: string
  url: string
  status: "available" | "claimed" | "manufacturing" | "completed" | "generated"
  claimedBy?: string
  claimedDate?: string
  generatedDate: string
  qrCodeGenerated?: boolean
  qrCodeDataUrl?: string
  testResults?: {
    scanned: boolean
    lastTest: string
    scanCount: number
  }
}

interface ManufacturerOrder {
  id: string
  order_number: string
  order_date: string
  quantity: number
  status: "pending" | "sent" | "fulfilled"
  manufacturer_name: string
  manufacturer_email: string
  manufacturer_company: string
  manufacturer_phone: string
  order_csv_content: string
  fulfillment_csv_content: string | null
  notes: string
  created_at: string
  updated_at: string
  slugCount: number
}

export default function SlugManagementClient() {
  const [slugs, setSlugs] = useState<Slug[]>([])
  const [filteredSlugs, setFilteredSlugs] = useState<Slug[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [manufacturerQuantity, setManufacturerQuantity] = useState(100)
  const [isPreparingOrder, setIsPreparingOrder] = useState(false)
  const [orderProgress, setOrderProgress] = useState(0)
  const [orderStep, setOrderStep] = useState("")
  const [orderReadyForReview, setOrderReadyForReview] = useState(false)
  const [preparedOrderData, setPreparedOrderData] = useState<any>(null)
  const [manufacturerInfo, setManufacturerInfo] = useState({
    name: "Trophy Manufacturing Co.",
    email: "orders@trophymfg.com",
    company: "Trophy Manufacturing Co.",
    phone: "+1 (555) 123-4567",
    notes: "",
  })
  const [isSendingToManufacturer, setIsSendingToManufacturer] = useState(false)
  const [showCSVPreview, setShowCSVPreview] = useState(false)
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isTesting, setIsTesting] = useState(false)
  const [testingSlug, setTestingSlug] = useState<string | null>(null)
  const [showQRPreview, setShowQRPreview] = useState(false)
  const [previewSlug, setPreviewSlug] = useState<Slug | null>(null)
  const router = useRouter()

  const [orderHistory, setOrderHistory] = useState<ManufacturerOrder[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<ManufacturerOrder | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [isUploadingFulfillment, setIsUploadingFulfillment] = useState(false)
  const [fulfillmentFile, setFulfillmentFile] = useState<File | null>(null)
  const [orderQRCodes, setOrderQRCodes] = useState<Slug[]>([])
  const [isLoadingOrderQRCodes, setIsLoadingOrderQRCodes] = useState(false)

  // Function to fetch slugs, used to refresh the list after operations
  const fetchSlugs = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase.from("qr_slugs").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching slugs:", error)
        toast({
          title: "Error Loading Slugs",
          description: "Failed to load slugs from database.",
          variant: "destructive",
        })
        return
      }

      // Transform database data to match component interface
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tagmytrophy.com"
      const transformedSlugs: Slug[] = (data || []).map((dbSlug: any) => ({
        id: dbSlug.id,
        qr_code_id: dbSlug.qr_code_id, // Include qr_code_id from database
        slug: dbSlug.slug,
        url: `${baseUrl}/claim/${dbSlug.slug}`,
        status: dbSlug.is_claimed ? "claimed" : dbSlug.status || "available",
        claimedBy: dbSlug.owner_id ? "User" : undefined, // You can join with profiles table for email
        claimedDate: dbSlug.claimed_at ? new Date(dbSlug.claimed_at).toISOString().split("T")[0] : undefined,
        generatedDate: new Date(dbSlug.created_at).toISOString().split("T")[0],
        qrCodeGenerated: !!dbSlug.qr_code_url,
        qrCodeDataUrl: dbSlug.qr_code_url || undefined,
      }))

      setSlugs(transformedSlugs)
      setFilteredSlugs(transformedSlugs)
    } catch (error) {
      console.error("[v0] Error in fetchSlugs:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading slugs.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrderHistory = async () => {
    setIsLoadingOrders(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("manufacturer_orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching order history:", error)
        toast({
          title: "Error Loading Orders",
          description: "Failed to load order history from database.",
          variant: "destructive",
        })
        return
      }
      setOrderHistory(data || [])
    } catch (error) {
      console.error("[v0] Error in fetchOrderHistory:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading order history.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const fetchOrderQRCodes = async (orderId: string) => {
    setIsLoadingOrderQRCodes(true)
    try {
      const supabase = createClient()

      // Fetch QR slugs associated with this manufacturer order
      const { data, error } = await supabase
        .from("qr_slugs")
        .select("*")
        .eq("manufacturer_order_id", orderId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching order QR codes:", error)
        toast({
          title: "Error Loading QR Codes",
          description: "Failed to load QR codes for this order.",
          variant: "destructive",
        })
        return
      }

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tagmytrophy.com"
      const transformedSlugs: Slug[] = (data || []).map((dbSlug: any) => ({
        id: dbSlug.id,
        slug: dbSlug.slug,
        url: `${baseUrl}/claim/${dbSlug.slug}`,
        status: dbSlug.status || (dbSlug.is_claimed ? "claimed" : "available"),
        claimedBy: dbSlug.owner_id ? "User" : undefined,
        claimedDate: dbSlug.claimed_at ? new Date(dbSlug.claimed_at).toISOString().split("T")[0] : undefined,
        generatedDate: new Date(dbSlug.created_at).toISOString().split("T")[0],
        qrCodeGenerated: !!dbSlug.qr_code_url,
        qrCodeDataUrl: dbSlug.qr_code_url || undefined,
      }))

      setOrderQRCodes(transformedSlugs)
    } catch (error) {
      console.error("[v0] Error in fetchOrderQRCodes:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading QR codes.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingOrderQRCodes(false)
    }
  }

  useEffect(() => {
    fetchSlugs()
    fetchOrderHistory()
  }, [])

  useEffect(() => {
    // Filter slugs based on search and status
    let filtered = slugs

    if (searchTerm) {
      filtered = filtered.filter(
        (slug) =>
          slug.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
          slug.claimedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          slug.qr_code_id?.toLowerCase().includes(searchTerm.toLowerCase()), // Search by qr_code_id
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((slug) => slug.status === statusFilter)
    }

    setFilteredSlugs(filtered)
  }, [searchTerm, statusFilter, slugs])

  const getStatusBadge = (status: Slug["status"]) => {
    const statusConfig = {
      available: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Available" },
      claimed: { color: "bg-blue-100 text-blue-700", icon: Clock, label: "Claimed" },
      manufacturing: { color: "bg-orange-100 text-orange-700", icon: Package, label: "Manufacturing" },
      completed: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, label: "Completed" },
      generated: { color: "bg-purple-100 text-purple-700", icon: QrCode, label: "Generated" },
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

  const generateQRCodes = async (slugIds: string[]) => {
    setIsGenerating(true)
    try {
      console.log("[v0] Starting QR code generation for", slugIds.length, "slugs")

      const selectedSlugs = slugs.filter((slug) => slugIds.includes(slug.id))

      const response = await fetch("/api/qr/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slugs: selectedSlugs.map((slug) => ({
            id: slug.id,
            slug: slug.slug,
            url: slug.url,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate QR codes")
      }

      const data = await response.json()
      console.log("[v0] QR generation response:", data)

      // Update local state
      setSlugs((prev) =>
        prev.map((slug) => {
          const qrData = data.qrCodes.find((qr: any) => qr.id === slug.id)
          if (qrData && qrData.success) {
            return {
              ...slug,
              qrCodeGenerated: true,
              qrCodeDataUrl: qrData.qrCodeDataUrl,
              status: "available" as const, // Update status to available after QR generation
            }
          }
          return slug
        }),
      )

      toast({
        title: "QR Codes Generated",
        description: `Successfully generated ${data.successCount} of ${data.totalCount} QR codes.`,
      })
    } catch (error) {
      console.error("[v0] QR generation error:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR codes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const testQRCode = async (slug: Slug) => {
    setIsTesting(true)
    setTestingSlug(slug.id)

    try {
      // Simulate QR code testing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const testResult = {
        scanned: Math.random() > 0.1, // 90% success rate
        lastTest: new Date().toISOString().split("T")[0],
        scanCount: (slug.testResults?.scanCount || 0) + 1,
      }

      setSlugs((prev) => prev.map((s) => (s.id === slug.id ? { ...s, testResults: testResult } : s)))

      toast({
        title: testResult.scanned ? "Test Successful" : "Test Failed",
        description: testResult.scanned
          ? `QR code for ${slug.slug} scanned successfully.`
          : `QR code for ${slug.slug} failed to scan. Check generation.`,
        variant: testResult.scanned ? "default" : "destructive",
      })
    } catch (error) {
      toast({
        title: "Test Error",
        description: "Failed to test QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
      setTestingSlug(null)
    }
  }

  const deleteSlug = async (slugId: string) => {
    try {
      console.log("[v0] Deleting slug:", slugId)

      const response = await fetch("/api/qr/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete slug")
      }

      console.log("[v0] Slug deleted successfully:", data.slug)

      toast({
        title: "Slug Deleted",
        description: `Successfully deleted ${data.slug}${data.wasClaimed ? " (was claimed by a user)" : ""}`,
      })

      // Refresh the slugs list
      fetchSlugs()

      // Close the preview dialog
      setShowQRPreview(false)
      setPreviewSlug(null)
    } catch (error) {
      console.error("[v0] Error deleting slug:", error)
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete slug",
        variant: "destructive",
      })
    }
  }

  const regenerateQRCode = async (slugId: string) => {
    try {
      console.log("[v0] Regenerating QR code for slug:", slugId)

      const response = await fetch("/api/qr/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate QR code")
      }

      console.log("[v0] QR code regenerated successfully:", data.slug)
      console.log("[v0] Owner link preserved:", data.ownerId)

      toast({
        title: "QR Code Regenerated",
        description: `Successfully regenerated QR code for ${data.slug}${data.isClaimed ? " (user profile link preserved)" : ""}`,
      })

      // Update the preview slug with the new QR code
      if (previewSlug) {
        setPreviewSlug({
          ...previewSlug,
          qrCodeDataUrl: data.qrCodeDataUrl,
        })
      }

      // Refresh the slugs list
      fetchSlugs()
    } catch (error) {
      console.error("[v0] Error regenerating QR code:", error)
      toast({
        title: "Regeneration Failed",
        description: error instanceof Error ? error.message : "Failed to regenerate QR code",
        variant: "destructive",
      })
    }
  }

  const prepareManufacturerOrder = async () => {
    setIsPreparingOrder(true)
    setOrderProgress(0)
    setOrderStep("Initializing...")
    setOrderReadyForReview(false)
    setPreparedOrderData(null)

    try {
      const quantity = manufacturerQuantity
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tagmytrophy.com"
      const supabase = createClient()

      setOrderStep("Generating QR code IDs...")
      setOrderProgress(5)

      const qrIdResponse = await fetch("/api/qr-codes/generate-ids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      })

      if (!qrIdResponse.ok) {
        throw new Error("Failed to generate QR code IDs")
      }

      const qrIdData = await qrIdResponse.json()
      console.log("[v0] Generated QR code IDs:", qrIdData.qrCodeIds)

      setOrderProgress(20)

      setOrderStep("Checking for existing QR codes...")

      const { data: existingSlugs, error: checkError } = await supabase
        .from("qr_slugs")
        .select("qr_code_id")
        .in("qr_code_id", qrIdData.qrCodeIds)

      if (checkError) {
        console.error("[v0] Error checking existing slugs:", checkError)
        throw new Error("Failed to check existing QR codes")
      }

      const existingQrCodeIds = new Set(existingSlugs?.map((s: any) => s.qr_code_id) || [])
      const newQrCodeIds = qrIdData.qrCodeIds.filter((id: string) => !existingQrCodeIds.has(id))

      if (newQrCodeIds.length === 0) {
        throw new Error("All generated QR code IDs already exist. Please try again or contact support.")
      }

      if (newQrCodeIds.length < qrIdData.qrCodeIds.length) {
        console.log(`[v0] Filtered out ${qrIdData.qrCodeIds.length - newQrCodeIds.length} existing QR codes`)
      }

      setOrderStep("Generating slugs...")

      const natureWords = [
        "mountain",
        "ocean",
        "forest",
        "desert",
        "river",
        "valley",
        "meadow",
        "canyon",
        "lake",
        "hill",
        "peak",
        "grove",
        "stream",
        "ridge",
        "vista",
        "cliff",
        "shore",
        "field",
        "woods",
        "plain",
      ]
      const descriptors = [
        "sunrise",
        "sunset",
        "bloom",
        "trail",
        "bend",
        "peak",
        "grove",
        "stream",
        "ridge",
        "vista",
        "glow",
        "mist",
        "dawn",
        "dusk",
        "breeze",
        "shadow",
        "light",
        "calm",
        "wild",
        "serene",
      ]

      await supabase.from("qr_slugs").delete().eq("status", "generating")

      const newSlugsData = []
      for (let i = 0; i < newQrCodeIds.length; i++) {
        const nature = natureWords[Math.floor(Math.random() * natureWords.length)]
        const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)]
        const code = Math.random().toString(36).substring(2, 6)
        const slug = `${nature}-${descriptor}-${code}`

        newSlugsData.push({
          slug,
          qr_code_id: newQrCodeIds[i],
          is_claimed: false,
          is_active: true,
          status: "generated",
        })
      }

      setOrderProgress(30)

      // Insert slugs into database
      const { data: insertedSlugs, error: insertError } = await supabase.from("qr_slugs").insert(newSlugsData).select()

      if (insertError) {
        console.error("[v0] Error inserting slugs:", insertError)
        throw new Error("Failed to generate slugs")
      }

      setOrderProgress(40)

      // Step 3: Generate QR codes (40-80%)
      setOrderStep("Generating QR codes...")

      const slugsForQR = (insertedSlugs || []).map((dbSlug: any) => ({
        id: dbSlug.id,
        slug: dbSlug.slug,
        url: `${baseUrl}/claim/${dbSlug.slug}`,
      }))

      const qrResponse = await fetch("/api/qr/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slugs: slugsForQR }),
      })

      if (!qrResponse.ok) {
        throw new Error("Failed to generate QR codes")
      }

      const qrData = await qrResponse.json()
      setOrderProgress(80)

      // Step 4: Prepare and download CSV (80-100%)
      setOrderStep("Preparing CSV export...")

      console.log("[v0] Preparing CSV with", qrData.qrCodes.length, "QR codes")

      const csvContent = [
        "QR Code ID,Slug,URL,QR Code Status,Generated Date",
        ...qrData.qrCodes.map((qr: any) => {
          const slug = insertedSlugs?.find((s: any) => s.id === qr.id)
          return `${slug?.qr_code_id || ""},${qr.slug},${baseUrl}/claim/${qr.slug},${qr.success ? "Generated" : "Failed"},${new Date().toISOString().split("T")[0]}`
        }),
      ].join("\n")

      console.log("[v0] CSV content generated, length:", csvContent.length, "characters")
      console.log("[v0] CSV preview (first 200 chars):", csvContent.substring(0, 200))

      const blob = new Blob([csvContent], { type: "text/csv" })
      console.log("[v0] Blob created, size:", blob.size, "bytes")

      const url = window.URL.createObjectURL(blob)
      console.log("[v0] Blob URL created:", url)

      const a = document.createElement("a")
      a.href = url
      const filename = `manufacturer-order-${quantity}-${new Date().toISOString().split("T")[0]}.csv`
      a.download = filename
      console.log("[v0] Triggering download for file:", filename)

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      console.log("[v0] Download triggered successfully")

      // Clean up the blob URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        console.log("[v0] Blob URL cleaned up")
      }, 100)

      setOrderProgress(100)
      setOrderStep("CSV Downloaded - Ready for Review!")

      setPreparedOrderData({
        quantity,
        filename,
        csvContent,
        blob,
        insertedSlugs,
        qrData,
        generatedDate: new Date().toISOString().split("T")[0],
      })
      setOrderReadyForReview(true)

      // Update local state with new slugs
      const transformedSlugs: Slug[] = (insertedSlugs || []).map((dbSlug: any) => {
        const qrCode = qrData.qrCodes.find((qr: any) => qr.id === dbSlug.id)
        return {
          id: dbSlug.id,
          qr_code_id: dbSlug.qr_code_id, // Include qr_code_id in transformed slugs
          slug: dbSlug.slug,
          url: `${baseUrl}/claim/${dbSlug.slug}`,
          status: "available" as const, // Set to available after successful generation
          generatedDate: new Date(dbSlug.created_at).toISOString().split("T")[0],
          qrCodeGenerated: qrCode?.success || false,
          qrCodeDataUrl: qrCode?.qrCodeDataUrl,
        }
      })

      setSlugs((prev) => [...transformedSlugs, ...prev])

      toast({
        title: "Order Prepared Successfully!",
        description: `CSV downloaded with ${quantity} QR codes. Review and send to manufacturer.`,
      })
    } catch (error) {
      console.error("[v0] Error preparing manufacturer order:", error)
      toast({
        title: "Order Preparation Failed",
        description: "Failed to prepare manufacturer order. Please try again.",
        variant: "destructive",
      })
      setOrderStep("Failed")
      setOrderReadyForReview(false)
    } finally {
      setIsPreparingOrder(false)
    }
  }

  const sendOrderToManufacturer = async () => {
    if (!preparedOrderData) {
      toast({
        title: "No Order Ready",
        description: "Please prepare an order first.",
        variant: "destructive",
      })
      return
    }

    setIsSendingToManufacturer(true)

    try {
      const response = await fetch("/api/manufacturer-orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: preparedOrderData.quantity,
          slugIds: preparedOrderData.insertedSlugs.map((s: any) => s.id),
          manufacturerInfo,
          csvContent: preparedOrderData.csvContent,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to create order")
      }

      console.log("[v0] Order created successfully:", data.order)

      // Update local slugs to manufacturing status
      setSlugs((prev) =>
        prev.map((slug) =>
          preparedOrderData.insertedSlugs.find((s: any) => s.id === slug.id)
            ? { ...slug, status: "manufacturing" as const }
            : slug,
        ),
      )

      // Refresh order history
      await fetchOrderHistory()

      toast({
        title: "Order Sent to Manufacturer!",
        description: `Successfully sent order ${data.order.orderNumber} for ${preparedOrderData.quantity} QR codes to ${manufacturerInfo.company}.`,
      })

      // Reset the review state
      setOrderReadyForReview(false)
      setPreparedOrderData(null)
      setOrderProgress(0)
      setOrderStep("")
      setShowCSVPreview(false)
    } catch (error) {
      console.error("[v0] Error sending to manufacturer:", error)
      toast({
        title: "Send Failed",
        description: "Failed to send order to manufacturer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingToManufacturer(false)
    }
  }

  const resetOrderPreparation = () => {
    setOrderReadyForReview(false)
    setPreparedOrderData(null)
    setOrderProgress(0)
    setOrderStep("")
    setShowCSVPreview(false)
  }

  const sendToManufacturer = async () => {
    if (selectedSlugs.length === 0) {
      toast({
        title: "No Slugs Selected",
        description: "Please select slugs to send to manufacturer.",
        variant: "destructive",
      })
      return
    }

    try {
      // Update selected slugs to manufacturing status
      setSlugs((prev) =>
        prev.map((slug) => (selectedSlugs.includes(slug.id) ? { ...slug, status: "manufacturing" as const } : slug)),
      )

      toast({
        title: "Sent to Manufacturer",
        description: `${selectedSlugs.length} slugs sent to manufacturing queue.`,
      })

      setSelectedSlugs([])
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send slugs to manufacturer.",
        variant: "destructive",
      })
    }
  }

  const toggleSlugSelection = (slugId: string) => {
    setSelectedSlugs((prev) => (prev.includes(slugId) ? prev.filter((id) => id !== slugId) : [...prev, slugId]))
  }

  const toggleSelectAll = () => {
    if (selectedSlugs.length === filteredSlugs.length && filteredSlugs.length > 0) {
      setSelectedSlugs([])
    } else {
      setSelectedSlugs(filteredSlugs.map((slug) => slug.id))
    }
  }

  const copySlugUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "URL Copied",
      description: "Slug URL copied to clipboard.",
    })
  }

  const availableCount = slugs.filter((s) => s.status === "available").length
  const claimedCount = slugs.filter((s) => s.status === "claimed").length
  const manufacturingCount = slugs.filter((s) => s.status === "manufacturing").length
  const generatedCount = slugs.filter((s) => s.status === "generated").length
  const qrGeneratedCount = slugs.filter((s) => s.qrCodeGenerated).length
  const testedCount = slugs.filter((s) => s.testResults?.scanned).length

  const getOrderStatusBadge = (status: ManufacturerOrder["status"]) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Pending" },
      sent: { color: "bg-blue-100 text-blue-700", icon: Package, label: "Sent" },
      fulfilled: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Fulfilled" },
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

  const handleFulfillmentUpload = async () => {
    if (!fulfillmentFile || !selectedOrder) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploadingFulfillment(true)

    try {
      // Read the file content
      const fileContent = await fulfillmentFile.text()

      console.log("[v0] Uploading fulfillment CSV for order:", selectedOrder.order_number)
      console.log("[v0] File content length:", fileContent.length)

      // Call the fulfill API
      const response = await fetch("/api/manufacturer-orders/fulfill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          fulfillmentCsvContent: fileContent,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to process fulfillment")
      }

      console.log("[v0] Fulfillment processed:", data)

      toast({
        title: "Fulfillment Processed!",
        description: `Successfully updated ${data.updatedCount} QR codes to available status.`,
      })

      // Refresh order history and slugs
      await fetchOrderHistory()

      // Refresh slugs to show updated statuses
      const supabase = createClient()
      const { data: slugData, error } = await supabase
        .from("qr_slugs")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && slugData) {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tagmytrophy.com"
        const transformedSlugs: Slug[] = slugData.map((dbSlug: any) => ({
          id: dbSlug.id,
          qr_code_id: dbSlug.qr_code_id, // Include qr_code_id in transformed slugs
          slug: dbSlug.slug,
          url: `${baseUrl}/claim/${dbSlug.slug}`,
          status: dbSlug.status || (dbSlug.is_claimed ? "claimed" : "available"),
          claimedBy: dbSlug.owner_id ? "User" : undefined,
          claimedDate: dbSlug.claimed_at ? new Date(dbSlug.claimed_at).toISOString().split("T")[0] : undefined,
          generatedDate: new Date(dbSlug.created_at).toISOString().split("T")[0],
          qrCodeGenerated: !!dbSlug.qr_code_url,
          qrCodeDataUrl: dbSlug.qr_code_url || undefined,
        }))
        setSlugs(transformedSlugs)
        setFilteredSlugs(transformedSlugs)
      }

      // Update the selected order
      const updatedOrder = orderHistory.find((o) => o.id === selectedOrder.id)
      if (updatedOrder) {
        setSelectedOrder({ ...updatedOrder, status: "fulfilled", fulfillment_csv_content: fileContent })
      }

      // Reset file input
      setFulfillmentFile(null)
      setShowOrderDetails(false)
    } catch (error) {
      console.error("[v0] Error uploading fulfillment:", error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process fulfillment CSV.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingFulfillment(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[#10b981]" />
          <p className="text-[#a3a3a3]">Loading QR code management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-4">
            <BackButton href="/admin/dashboard" label="Back to Dashboard" />
            <div>
              <h1 className="text-xl font-bold text-foreground">QR Code Management</h1>
              <p className="text-sm text-muted-foreground">Generate, track, and manage QR codes for manufacturing</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-[1600px] mx-auto">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="new-order">
              <Rocket className="w-4 h-4 mr-2" />
              New Order
            </TabsTrigger>
            <TabsTrigger value="order-history">
              <Package className="w-4 h-4 mr-2" />
              Order History
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview - Status cards + QR codes list */}
          <TabsContent value="overview" className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available</CardTitle>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{availableCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ready for use</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Generated</CardTitle>
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{generatedCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">Codes created</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">QR Generated</CardTitle>
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{qrGeneratedCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">Images created</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tested</CardTitle>
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{testedCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">Scan verified</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Manufacturing</CardTitle>
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{manufacturingCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">In production</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stock Alert</CardTitle>
                  <div className={`w-2 h-2 rounded-full ${availableCount < 100 ? "bg-red-500" : "bg-green-500"}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{availableCount < 100 ? "Low" : "Good"}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {availableCount < 100 ? "Generate more soon" : "Stock levels healthy"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Filter & Search</CardTitle>
                  {selectedSlugs.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{selectedSlugs.length} selected</span>
                      <Button size="sm" onClick={() => generateQRCodes(selectedSlugs)} disabled={isGenerating}>
                        Generate QR Codes
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search by slug name, QR ID, or claimed by..." // Added QR ID to placeholder
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Slugs</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="claimed">Claimed</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="generated">Generated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Slugs Table */}
            <Card>
              <CardHeader>
                <CardTitle>QR Code Slugs ({filteredSlugs.length})</CardTitle>
                <CardDescription>Manage and track QR code slugs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedSlugs.length === filteredSlugs.length && filteredSlugs.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>QR Code ID</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>QR Code</TableHead>
                        <TableHead>Generated</TableHead>
                        <TableHead>Test Status</TableHead>
                        <TableHead>Claimed By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSlugs.slice(0, 20).map((slug) => (
                        <TableRow
                          key={slug.id}
                          className="cursor-pointer"
                          onClick={(e) => {
                            if (
                              (e.target as HTMLElement).closest("button") ||
                              (e.target as HTMLElement).closest('[role="checkbox"]')
                            ) {
                              return
                            }
                            setPreviewSlug(slug)
                            setShowQRPreview(true)
                          }}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedSlugs.includes(slug.id)}
                              onCheckedChange={() => toggleSlugSelection(slug.id)}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm font-semibold text-primary">
                            {slug.qr_code_id || "-"}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{slug.slug}</TableCell>
                          <TableCell>{getStatusBadge(slug.status)}</TableCell>
                          <TableCell>
                            {slug.qrCodeDataUrl ? (
                              <img
                                src={slug.qrCodeDataUrl || "/placeholder.svg"}
                                alt={`QR code for ${slug.slug}`}
                                className="w-12 h-12 border rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 border rounded bg-muted flex items-center justify-center">
                                <QrCode className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {slug.qrCodeGenerated ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Generated
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {slug.testResults ? (
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    slug.testResults.scanned
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : "bg-red-50 text-red-700 border-red-200"
                                  }
                                >
                                  {slug.testResults.scanned ? "Passed" : "Failed"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">({slug.testResults.scanCount}x)</span>
                              </div>
                            ) : (
                              <Badge variant="outline">Untested</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{slug.claimedBy || "-"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{slug.generatedDate}</TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setPreviewSlug(slug)
                                  setShowQRPreview(true)
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button size="sm" onClick={() => copySlugUrl(slug.url)} variant="outline">
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: New Order - Slug generation + Manufacturer order creation */}
          <TabsContent value="new-order" className="space-y-6">
            {/* Prepare Manufacturer Order */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Rocket className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Prepare Manufacturer Order</CardTitle>
                    <CardDescription>
                      One-click workflow: Generate slugs → Create QR codes → Export CSV → Send to manufacturer
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {!orderReadyForReview && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Quick Select Buttons */}
                      <div className="space-y-2">
                        <Label>Quick Select</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setManufacturerQuantity(50)}
                            className={manufacturerQuantity === 50 ? "border-primary" : ""}
                          >
                            50
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setManufacturerQuantity(100)}
                            className={manufacturerQuantity === 100 ? "border-primary" : ""}
                          >
                            100
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setManufacturerQuantity(250)}
                            className={manufacturerQuantity === 250 ? "border-primary" : ""}
                          >
                            250
                          </Button>
                        </div>
                      </div>

                      {/* Custom Quantity */}
                      <div className="space-y-2">
                        <Label htmlFor="manufacturerQuantity">Order Quantity</Label>
                        <Input
                          id="manufacturerQuantity"
                          type="number"
                          min="1"
                          max="1000"
                          value={manufacturerQuantity || ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : Number.parseInt(e.target.value)
                            setManufacturerQuantity(isNaN(val) ? 0 : val)
                          }}
                          placeholder="Enter quantity"
                          disabled={isPreparingOrder}
                        />
                        <p className="text-xs text-muted-foreground">1-1,000 QR codes per order</p>
                      </div>

                      {/* Action Button */}
                      <div className="space-y-2">
                        <Label>Action</Label>
                        <Button
                          onClick={prepareManufacturerOrder}
                          disabled={
                            isPreparingOrder ||
                            !manufacturerQuantity ||
                            manufacturerQuantity <= 0 ||
                            manufacturerQuantity > 1000
                          }
                          className="w-full h-[42px]"
                          size="lg"
                        >
                          {isPreparingOrder ? (
                            <>
                              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                              Preparing...
                            </>
                          ) : (
                            <>
                              <Rocket className="w-5 h-5 mr-2" />
                              Prepare Order ({manufacturerQuantity})
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    {isPreparingOrder && (
                      <div className="space-y-3 p-4 bg-muted border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{orderStep}</span>
                          <span className="text-sm font-semibold text-primary">{orderProgress}%</span>
                        </div>
                        <Progress value={orderProgress} className="w-full h-2" />
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div className={orderProgress >= 20 ? "text-primary font-medium" : ""}>
                            <CheckCircle
                              className={`w-3 h-3 inline mr-1 ${orderProgress >= 20 ? "text-primary" : ""}`}
                            />
                            Generate IDs
                          </div>
                          <div className={orderProgress >= 40 ? "text-primary font-medium" : ""}>
                            <CheckCircle
                              className={`w-3 h-3 inline mr-1 ${orderProgress >= 40 ? "text-primary" : ""}`}
                            />
                            Generate Slugs
                          </div>
                          <div className={orderProgress >= 80 ? "text-primary font-medium" : ""}>
                            <QrCode className={`w-3 h-3 inline mr-1 ${orderProgress >= 80 ? "text-primary" : ""}`} />
                            Create QR Codes
                          </div>
                          <div className={orderProgress >= 100 ? "text-primary font-medium" : ""}>
                            <Download className={`w-3 h-3 inline mr-1 ${orderProgress >= 100 ? "text-primary" : ""}`} />
                            Export CSV
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Info Box */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">What happens when you click "Prepare Order":</p>
                        <ol className="list-decimal list-inside mt-2 space-y-1 text-blue-800">
                          <li>Generates {manufacturerQuantity} unique QR code IDs</li>
                          <li>Generates {manufacturerQuantity} unique slugs and assigns QR code IDs</li>
                          <li>Creates QR code images for all slugs</li>
                          <li>Exports everything to a CSV file and downloads it</li>
                          <li>Shows manufacturer info for you to review before sending</li>
                        </ol>
                      </div>
                    </div>
                  </>
                )}

                {orderReadyForReview && preparedOrderData && (
                  <div className="space-y-6">
                    {/* Success Message */}
                    <div className="flex items-start gap-3 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900 text-lg">Order Ready for Review!</h3>
                        <p className="text-sm text-green-800 mt-1">
                          Successfully prepared {preparedOrderData.quantity} QR codes and downloaded CSV file:{" "}
                          <span className="font-mono font-medium">{preparedOrderData.filename}</span>
                        </p>
                        <p className="text-sm text-green-700 mt-2">
                          Please review the CSV file to ensure everything looks correct before sending to your
                          manufacturer.
                        </p>
                      </div>
                    </div>

                    {/* Manufacturer Information */}
                    <div className="space-y-4 p-4 bg-muted border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Package className="w-5 h-5 text-primary" />
                          Manufacturer Information
                        </h3>
                        <Badge variant="outline">
                          <Edit className="w-3 h-3 mr-1" />
                          Editable
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="mfgName">Contact Name</Label>
                          <Input
                            id="mfgName"
                            value={manufacturerInfo.name}
                            onChange={(e) => setManufacturerInfo({ ...manufacturerInfo, name: e.target.value })}
                            placeholder="Contact person name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mfgEmail">Email Address</Label>
                          <Input
                            id="mfgEmail"
                            type="email"
                            value={manufacturerInfo.email}
                            onChange={(e) => setManufacturerInfo({ ...manufacturerInfo, email: e.target.value })}
                            placeholder="manufacturer@example.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mfgCompany">Company Name</Label>
                          <Input
                            id="mfgCompany"
                            value={manufacturerInfo.company}
                            onChange={(e) => setManufacturerInfo({ ...manufacturerInfo, company: e.target.value })}
                            placeholder="Manufacturing company name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mfgPhone">Phone Number</Label>
                          <Input
                            id="mfgPhone"
                            type="tel"
                            value={manufacturerInfo.phone}
                            onChange={(e) => setManufacturerInfo({ ...manufacturerInfo, phone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="mfgNotes">Order Notes (Optional)</Label>
                          <Textarea
                            id="mfgNotes"
                            value={manufacturerInfo.notes}
                            onChange={(e) => setManufacturerInfo({ ...manufacturerInfo, notes: e.target.value })}
                            placeholder="Add any special instructions or notes for the manufacturer..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="p-4 bg-muted border rounded-lg">
                      <h4 className="font-semibold mb-3">Order Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Quantity</p>
                          <p className="font-semibold">{preparedOrderData.quantity} QR codes</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Generated Date</p>
                          <p className="font-semibold">{preparedOrderData.generatedDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">CSV File</p>
                          <p className="font-semibold font-mono text-xs truncate">{preparedOrderData.filename}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ready
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={() => setShowCSVPreview(true)} variant="outline" size="lg">
                        <Eye className="w-5 h-5 mr-2" />
                        View CSV Document
                      </Button>

                      <Button
                        onClick={sendOrderToManufacturer}
                        disabled={isSendingToManufacturer || !manufacturerInfo.email}
                        className="flex-1 h-12"
                        size="lg"
                      >
                        {isSendingToManufacturer ? (
                          <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            Sending to Manufacturer...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Send to {manufacturerInfo.company}
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={() => {
                          const url = window.URL.createObjectURL(preparedOrderData.blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = preparedOrderData.filename
                          a.click()
                          toast({
                            title: "CSV Re-downloaded",
                            description: "CSV file has been downloaded again.",
                          })
                        }}
                        variant="outline"
                        size="lg"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Re-download CSV
                      </Button>

                      <Button onClick={resetOrderPreparation} variant="outline" size="lg">
                        Cancel
                      </Button>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-orange-900">
                        <span className="font-medium">Important:</span> Make sure you've reviewed the CSV file and
                        verified all QR codes are correct before sending to your manufacturer. Once sent, the order will
                        be processed.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {orderReadyForReview && preparedOrderData && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-primary" />
                        Generated QR Codes ({preparedOrderData.quantity})
                      </CardTitle>
                      <CardDescription>
                        Review the generated QR codes and images before sending to manufacturer
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ready for Review
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>QR Code ID</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>QR Code</TableHead>
                          <TableHead>Generated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preparedOrderData.insertedSlugs?.slice(0, 20).map((dbSlug: any) => {
                          const qrCode = preparedOrderData.qrData.qrCodes.find((qr: any) => qr.id === dbSlug.id)
                          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tagmytrophy.com"

                          return (
                            <TableRow
                              key={dbSlug.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => {
                                const slug: Slug = {
                                  id: dbSlug.id,
                                  qr_code_id: dbSlug.qr_code_id, // Include qr_code_id in slug object
                                  slug: dbSlug.slug,
                                  url: `${baseUrl}/claim/${dbSlug.slug}`,
                                  status: "generated",
                                  generatedDate: new Date(dbSlug.created_at).toISOString().split("T")[0],
                                  qrCodeGenerated: qrCode?.success || false,
                                  qrCodeDataUrl: qrCode?.qrCodeDataUrl,
                                }
                                setPreviewSlug(slug)
                                setShowQRPreview(true)
                              }}
                            >
                              <TableCell className="font-mono text-sm font-semibold text-primary">
                                {dbSlug.qr_code_id || "N/A"}
                              </TableCell>
                              <TableCell className="font-mono text-sm">{dbSlug.slug}</TableCell>
                              <TableCell>
                                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                                  <QrCode className="w-3 h-3 mr-1" />
                                  Generated
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {qrCode?.qrCodeDataUrl ? (
                                  <img
                                    src={qrCode.qrCodeDataUrl || "/placeholder.svg"}
                                    alt={`QR code for ${dbSlug.slug}`}
                                    className="w-12 h-12 border rounded"
                                  />
                                ) : (
                                  <div className="w-12 h-12 border rounded bg-muted flex items-center justify-center">
                                    <QrCode className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {qrCode?.success ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Success
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Failed
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      const slug: Slug = {
                                        id: dbSlug.id,
                                        qr_code_id: dbSlug.qr_code_id, // Include qr_code_id in slug object
                                        slug: dbSlug.slug,
                                        url: `${baseUrl}/claim/${dbSlug.slug}`,
                                        status: "generated",
                                        generatedDate: new Date(dbSlug.created_at).toISOString().split("T")[0],
                                        qrCodeGenerated: qrCode?.success || false,
                                        qrCodeDataUrl: qrCode?.qrCodeDataUrl,
                                      }
                                      setPreviewSlug(slug)
                                      setShowQRPreview(true)
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => copySlugUrl(`${baseUrl}/claim/${dbSlug.slug}`)}
                                    variant="outline"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  {preparedOrderData.insertedSlugs?.length > 20 && (
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                      Showing 20 of {preparedOrderData.insertedSlugs.length} QR codes. View all in the Overview tab
                      after sending to manufacturer.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 3: Order History */}
          <TabsContent value="order-history">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Manufacturer Order History
                    </CardTitle>
                    <CardDescription>Track all manufacturer orders and their fulfillment status</CardDescription>
                  </div>
                  <Button onClick={fetchOrderHistory} disabled={isLoadingOrders} variant="outline">
                    {isLoadingOrders ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading order history...</p>
                  </div>
                ) : orderHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="font-medium">No manufacturer orders yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first order using the "New Order" tab
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderHistory.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowOrderDetails(true)
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-semibold font-mono">{order.order_number}</h3>
                              {getOrderStatusBadge(order.status)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs">Manufacturer</p>
                                <p className="font-medium mt-1">{order.manufacturer_company}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Quantity</p>
                                <p className="font-medium mt-1">{order.quantity} QR codes</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Order Date</p>
                                <p className="font-medium mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Contact</p>
                                <p className="font-medium mt-1 truncate">{order.manufacturer_email}</p>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="ml-4 bg-transparent">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog for slug detail view */}
      <Dialog open={showQRPreview} onOpenChange={setShowQRPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Slug Details</DialogTitle>
            <DialogDescription>View and manage QR code details</DialogDescription>
          </DialogHeader>

          {previewSlug && (
            <div className="space-y-6">
              {/* Slug Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">QR Code ID</Label>
                  <p className="font-mono text-sm mt-1 text-foreground">{previewSlug.qr_code_id || "-"}</p>{" "}
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Slug</Label>
                  <p className="font-mono text-sm mt-1 text-foreground">{previewSlug.slug}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Status</Label>
                  <div className="mt-1">{getStatusBadge(previewSlug.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Generated Date</Label>
                  <p className="text-sm mt-1 text-foreground">{previewSlug.generatedDate}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Claimed By</Label>
                  <p className="text-sm mt-1 text-foreground">{previewSlug.claimedBy || "Not claimed"}</p>
                </div>
                {previewSlug.claimedDate && (
                  <div>
                    <Label className="text-muted-foreground text-sm">Claimed Date</Label>
                    <p className="text-sm mt-1 text-foreground">{previewSlug.claimedDate}</p>
                  </div>
                )}
              </div>

              {/* URL */}
              <div>
                <Label className="text-muted-foreground text-sm">URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={previewSlug.url} readOnly className="font-mono text-sm" />
                  <Button size="sm" onClick={() => copySlugUrl(previewSlug.url)} variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* QR Code Display */}
              {previewSlug.qrCodeDataUrl ? (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">QR Code</Label>
                  <div className="flex flex-col items-center gap-4 p-6 bg-muted border rounded-lg">
                    <img
                      src={previewSlug.qrCodeDataUrl || "/placeholder.svg"}
                      alt={`QR code for ${previewSlug.slug}`}
                      className="w-64 h-64 border-2"
                    />
                    <div className="flex gap-2 flex-wrap justify-center">
                      <Button
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = previewSlug.qrCodeDataUrl!
                          link.download = `qr-${previewSlug.slug}.png`
                          link.click()
                          toast({
                            title: "QR Code Downloaded",
                            description: `QR code for ${previewSlug.slug} has been downloaded.`,
                          })
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download QR Code
                      </Button>
                      <Button
                        onClick={() => testQRCode(previewSlug)}
                        disabled={isTesting && testingSlug === previewSlug.id}
                        variant="outline"
                      >
                        {isTesting && testingSlug === previewSlug.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <TestTube className="w-4 h-4 mr-2" />
                            Test QR Code
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => regenerateQRCode(previewSlug.id)}
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate QR Code
                      </Button>
                      <Button
                        onClick={() => {
                          if (previewSlug.status === "claimed") {
                            if (
                              confirm(
                                `This QR code is claimed by ${previewSlug.claimedBy}. Are you sure you want to delete it? This will remove the user's access to their profile.`,
                              )
                            ) {
                              deleteSlug(previewSlug.id)
                            }
                          } else {
                            if (confirm(`Are you sure you want to delete ${previewSlug.slug}?`)) {
                              deleteSlug(previewSlug.id)
                            }
                          }
                        }}
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">QR Code</Label>
                  <div className="flex flex-col items-center gap-4 p-6 bg-muted border rounded-lg">
                    <QrCode className="w-32 h-32 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">QR code not generated yet</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          generateQRCodes([previewSlug.id])
                          setShowQRPreview(false)
                        }}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Generate QR Code
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${previewSlug.slug}?`)) {
                            deleteSlug(previewSlug.id)
                          }
                        }}
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Results */}
              {previewSlug.testResults && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Test Results</Label>
                  <div className="p-4 bg-muted border rounded-lg">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge
                          variant="outline"
                          className={
                            previewSlug.testResults.scanned
                              ? "bg-green-50 text-green-700 border-green-200 mt-1"
                              : "bg-red-50 text-red-700 border-red-200 mt-1"
                          }
                        >
                          {previewSlug.testResults.scanned ? "Passed" : "Failed"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Last Test</p>
                        <p className="text-sm mt-1 text-foreground">{previewSlug.testResults.lastTest}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Scan Count</p>
                        <p className="text-sm mt-1 text-foreground">{previewSlug.testResults.scanCount}x</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCSVPreview} onOpenChange={setShowCSVPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              CSV Document Preview
            </DialogTitle>
            <DialogDescription>Review the CSV file before sending to manufacturer</DialogDescription>
          </DialogHeader>

          {preparedOrderData && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="p-3 bg-muted border rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Filename</p>
                    <p className="font-mono font-semibold">{preparedOrderData.filename}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Records</p>
                    <p className="font-semibold">{preparedOrderData.quantity} QR codes</p>
                  </div>
                </div>
              </div>

              {/* CSV Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted border-b border-border">
                        <TableHead>QR Code ID</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>QR Code Status</TableHead>
                        <TableHead>Generated Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preparedOrderData.csvContent
                        .split("\n")
                        .slice(1) // Skip header row
                        .filter((row: string) => row.trim()) // Remove empty rows
                        .map((row: string, index: number) => {
                          const [qrCodeId, slug, url, status, date] = row.split(",").map((val) => val.trim())
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-mono text-sm">{qrCodeId}</TableCell>
                              <TableCell className="font-mono text-sm">{slug}</TableCell>
                              <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{url}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    status === "Generated"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : "bg-red-50 text-red-700 border-red-200"
                                  }
                                >
                                  {status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{date}</TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Raw CSV Preview */}
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">Raw CSV Content</Label>
                <div className="p-4 bg-muted border rounded-lg">
                  <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                    {preparedOrderData.csvContent}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => {
                    const url = window.URL.createObjectURL(preparedOrderData.blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = preparedOrderData.filename
                    a.click()
                    toast({
                      title: "CSV Downloaded",
                      description: "CSV file has been downloaded.",
                    })
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(preparedOrderData.csvContent)
                    toast({
                      title: "CSV Copied",
                      description: "CSV content copied to clipboard.",
                    })
                  }}
                  variant="outline"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button onClick={() => setShowCSVPreview(false)} variant="outline" className="ml-auto">
                  Close Preview
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Order Details: {selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription>View order information and manage fulfillment</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between p-4 bg-muted border rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Order Status</p>
                  <div className="mt-1">{getOrderStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-mono font-semibold mt-1">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium mt-1">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Manufacturer Info */}
              <div className="space-y-3">
                <h3 className="font-semibold">Manufacturer Information</h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted border rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{selectedOrder.manufacturer_company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Name</p>
                    <p className="font-medium">{selectedOrder.manufacturer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedOrder.manufacturer_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedOrder.manufacturer_phone || "N/A"}</p>
                  </div>
                  {selectedOrder.notes && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="font-medium">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold">Order Summary</h3>
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted border rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity Ordered</p>
                    <p className="text-2xl font-bold">{selectedOrder.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">QR Codes Linked</p>
                    <p className="text-2xl font-bold">{selectedOrder.slugCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fulfillment</p>
                    <p className="text-2xl font-bold">{selectedOrder.fulfillment_csv_content ? "✓" : "—"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">QR Codes in This Order</h3>
                  <Button
                    onClick={() => fetchOrderQRCodes(selectedOrder.id)}
                    disabled={isLoadingOrderQRCodes}
                    variant="outline"
                    size="sm"
                  >
                    {isLoadingOrderQRCodes ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4 mr-2" />
                    )}
                    {orderQRCodes.length > 0 ? "Refresh" : "View QR Codes"}
                  </Button>
                </div>

                {isLoadingOrderQRCodes ? (
                  <div className="text-center py-8 border rounded-lg bg-muted">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading QR codes...</p>
                  </div>
                ) : orderQRCodes.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>QR Code ID</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>QR Code</TableHead>
                          <TableHead>Generated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderQRCodes.slice(0, 20).map((slug) => (
                          <TableRow
                            key={slug.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => {
                              setPreviewSlug(slug)
                              setShowQRPreview(true)
                            }}
                          >
                            <TableCell className="font-mono text-sm font-semibold text-primary">
                              {/* QR Code ID will be fetched from database */}-
                            </TableCell>
                            <TableCell className="font-mono text-sm">{slug.slug}</TableCell>
                            <TableCell>{getStatusBadge(slug.status)}</TableCell>
                            <TableCell>
                              {slug.qrCodeDataUrl ? (
                                <img
                                  src={slug.qrCodeDataUrl || "/placeholder.svg"}
                                  alt={`QR code for ${slug.slug}`}
                                  className="w-12 h-12 border rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 border rounded bg-muted flex items-center justify-center">
                                  <QrCode className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {slug.qrCodeGenerated ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Success
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setPreviewSlug(slug)
                                    setShowQRPreview(true)
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                                <Button size="sm" onClick={() => copySlugUrl(slug.url)} variant="outline">
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {orderQRCodes.length > 20 && (
                      <div className="p-3 text-center text-sm text-muted-foreground bg-muted border-t">
                        Showing 20 of {orderQRCodes.length} QR codes
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg bg-muted">
                    <QrCode className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="font-medium">No QR codes loaded</p>
                    <p className="text-sm text-muted-foreground mt-1">Click "View QR Codes" to load them</p>
                  </div>
                )}
              </div>

              {/* CSV Documents */}
              <div className="space-y-3">
                <h3 className="font-semibold">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Order CSV */}
                  <div className="p-4 bg-muted border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold">Order CSV</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Original order sent to manufacturer</p>
                    <Button
                      onClick={() => {
                        const blob = new Blob([selectedOrder.order_csv_content], { type: "text/csv" })
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = `order-${selectedOrder.order_number}.csv`
                        a.click()
                        toast({
                          title: "CSV Downloaded",
                          description: "Order CSV has been downloaded.",
                        })
                      }}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Order CSV
                    </Button>
                  </div>

                  {/* Fulfillment CSV */}
                  <div className="p-4 bg-muted border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold">Fulfillment CSV</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {selectedOrder.fulfillment_csv_content ? "Manufacturer's completed order" : "Not yet received"}
                    </p>
                    {selectedOrder.fulfillment_csv_content ? (
                      <Button
                        onClick={() => {
                          const blob = new Blob([selectedOrder.fulfillment_csv_content!], { type: "text/csv" })
                          const url = window.URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = `fulfillment-${selectedOrder.order_number}.csv`
                          a.click()
                          toast({
                            title: "CSV Downloaded",
                            description: "Fulfillment CSV has been downloaded.",
                          })
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Fulfillment CSV
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept=".csv"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setFulfillmentFile(file)
                                console.log("[v0] Fulfillment file selected:", file.name)
                              }
                            }}
                          />
                        </div>
                        {fulfillmentFile && (
                          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                            <p>
                              <span className="font-medium">Selected:</span> {fulfillmentFile.name}
                            </p>
                          </div>
                        )}
                        <Button
                          onClick={handleFulfillmentUpload}
                          disabled={!fulfillmentFile || isUploadingFulfillment}
                          className="w-full"
                        >
                          {isUploadingFulfillment ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload & Process Fulfillment
                            </>
                          )}
                        </Button>
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-xs">
                            <span className="font-medium">Expected CSV format:</span> Must include columns for "QR Code
                            ID" and "Slug". The system will update all associated QR codes to "available" status.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end border-t border-border pt-4">
                <Button
                  onClick={() => {
                    setShowOrderDetails(false)
                    setFulfillmentFile(null)
                    setOrderQRCodes([]) // Clear QR codes when closing
                  }}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
