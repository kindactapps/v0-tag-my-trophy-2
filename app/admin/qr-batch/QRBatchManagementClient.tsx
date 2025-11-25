"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Package, QrCode, Download, RefreshCw, AlertCircle, CheckCircle, Clock, Truck } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import BackButton from "@/components/back-button"

interface QRCode {
  id: string
  qrId: string
  status: "available" | "assigned" | "shipped" | "delivered" | "damaged"
  assignedTo?: string
  orderId?: string
  packageNumber: number
  batchId: string
  createdAt: string
  assignedAt?: string
  shippedAt?: string
}

interface QRBatch {
  id: string
  name: string
  startId: string
  endId: string
  totalCodes: number
  availableCodes: number
  assignedCodes: number
  shippedCodes: number
  createdAt: string
}

export default function QRBatchManagementClient() {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [batches, setBatches] = useState<QRBatch[]>([])
  const [filteredQRCodes, setFilteredQRCodes] = useState<QRCode[]>([])
  const [selectedQRCodes, setSelectedQRCodes] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [batchFilter, setBatchFilter] = useState("all")
  const [isProcessingBulk, setIsProcessingBulk] = useState(false)
  const [rangeDialog, setRangeDialog] = useState(false)
  const [rangeStart, setRangeStart] = useState("")
  const [rangeEnd, setRangeEnd] = useState("")
  const [bulkStatusDialog, setBulkStatusDialog] = useState(false)
  const [bulkStatusValue, setBulkStatusValue] = useState<QRCode["status"]>("assigned")

  useEffect(() => {
    // Generate demo QR codes and batches
    const demoBatches: QRBatch[] = [
      {
        id: "batch-1",
        name: "Package 1: qr0001-qr0010",
        startId: "qr0001",
        endId: "qr0010",
        totalCodes: 10,
        availableCodes: 7,
        assignedCodes: 2,
        shippedCodes: 1,
        createdAt: "2024-01-15",
      },
    ]

    const demoQRCodes: QRCode[] = []

    // Generate QR codes for the demo batch
    demoBatches.forEach((batch, batchIndex) => {
      const startNum = Number.parseInt(batch.startId.replace(/\D/g, ""))
      const endNum = Number.parseInt(batch.endId.replace(/\D/g, ""))
      const prefix = batch.startId.replace(/\d/g, "")

      for (let i = startNum; i <= endNum; i++) {
        const qrId = `${prefix}${i.toString().padStart(4, "0")}`
        const packageNumber = 1

        // Assign some statuses for testing
        let status: QRCode["status"] = "available"
        let assignedTo: string | undefined
        let orderId: string | undefined

        if (i === 1) {
          status = "assigned"
          assignedTo = "Store 1"
          orderId = "TMT-1200"
        } else if (i === 2) {
          status = "shipped"
          assignedTo = "Store 1"
          orderId = "TMT-1201"
        }

        demoQRCodes.push({
          id: `qr-${i}`,
          qrId,
          status,
          assignedTo,
          orderId,
          packageNumber,
          batchId: batch.id,
          createdAt: batch.createdAt,
          assignedAt: status !== "available" ? "2024-01-18" : undefined,
          shippedAt: status === "shipped" ? "2024-01-19" : undefined,
        })
      }
    })

    setBatches(demoBatches)
    setQrCodes(demoQRCodes)
    setFilteredQRCodes(demoQRCodes)
  }, [])

  useEffect(() => {
    // Filter QR codes based on search, status, and batch
    let filtered = qrCodes

    if (searchTerm) {
      filtered = filtered.filter(
        (qr) =>
          qr.qrId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          qr.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          qr.orderId?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((qr) => qr.status === statusFilter)
    }

    if (batchFilter !== "all") {
      filtered = filtered.filter((qr) => qr.batchId === batchFilter)
    }

    setFilteredQRCodes(filtered)
  }, [searchTerm, statusFilter, batchFilter, qrCodes])

  const getStatusBadge = (status: QRCode["status"]) => {
    const statusConfig = {
      available: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Available" },
      assigned: { color: "bg-blue-100 text-blue-700", icon: Clock, label: "Assigned" },
      shipped: { color: "bg-purple-100 text-purple-700", icon: Truck, label: "Shipped" },
      delivered: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, label: "Delivered" },
      damaged: { color: "bg-red-100 text-red-700", icon: AlertCircle, label: "Damaged" },
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

  const generateQRId = (num: number): string => {
    if (num <= 9999) {
      return `qr${num.toString().padStart(4, "0")}`
    } else {
      // After qr9999, use letter prefix
      const letterIndex = Math.floor((num - 10000) / 10000)
      const letter = String.fromCharCode(65 + letterIndex) // A, B, C, etc.
      const numberPart = ((num - 10000) % 10000) + 1
      return `qr${letter}${numberPart.toString().padStart(4, "0")}`
    }
  }

  const parseQRId = (qrId: string): number => {
    const match = qrId.match(/^qr([A-Z]?)(\d{4})$/)
    if (!match) return 0

    const [, letter, numStr] = match
    const num = Number.parseInt(numStr)

    if (!letter) {
      return num
    } else {
      const letterIndex = letter.charCodeAt(0) - 65
      return 10000 + letterIndex * 10000 + (num - 1)
    }
  }

  const selectQRRange = () => {
    if (!rangeStart || !rangeEnd) {
      toast({
        title: "Invalid Range",
        description: "Please enter both start and end QR IDs.",
        variant: "destructive",
      })
      return
    }

    const startNum = parseQRId(rangeStart)
    const endNum = parseQRId(rangeEnd)

    if (startNum >= endNum) {
      toast({
        title: "Invalid Range",
        description: "End ID must be greater than start ID.",
        variant: "destructive",
      })
      return
    }

    const rangeQRCodes = qrCodes.filter((qr) => {
      const qrNum = parseQRId(qr.qrId)
      return qrNum >= startNum && qrNum <= endNum
    })

    setSelectedQRCodes(rangeQRCodes.map((qr) => qr.id))
    setRangeDialog(false)

    toast({
      title: "Range Selected",
      description: `Selected ${rangeQRCodes.length} QR codes from ${rangeStart} to ${rangeEnd}`,
    })
  }

  const processBulkStatusUpdate = async () => {
    if (selectedQRCodes.length === 0) return

    setIsProcessingBulk(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setQrCodes((prev) =>
        prev.map((qr) =>
          selectedQRCodes.includes(qr.id)
            ? {
                ...qr,
                status: bulkStatusValue,
                assignedAt: bulkStatusValue === "assigned" ? new Date().toISOString() : qr.assignedAt,
                shippedAt: bulkStatusValue === "shipped" ? new Date().toISOString() : qr.shippedAt,
              }
            : qr,
        ),
      )

      // Update batch statistics
      setBatches((prev) =>
        prev.map((batch) => {
          const batchQRCodes = qrCodes.filter((qr) => qr.batchId === batch.id)
          const updatedQRCodes = batchQRCodes.map((qr) =>
            selectedQRCodes.includes(qr.id) ? { ...qr, status: bulkStatusValue } : qr,
          )

          return {
            ...batch,
            availableCodes: updatedQRCodes.filter((qr) => qr.status === "available").length,
            assignedCodes: updatedQRCodes.filter((qr) => qr.status === "assigned").length,
            shippedCodes: updatedQRCodes.filter((qr) => qr.status === "shipped").length,
          }
        }),
      )

      toast({
        title: "Bulk Update Complete",
        description: `Updated ${selectedQRCodes.length} QR codes to ${bulkStatusValue}.`,
      })

      setSelectedQRCodes([])
      setBulkStatusDialog(false)
    } catch (error) {
      toast({
        title: "Bulk Update Failed",
        description: "Some updates may have failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingBulk(false)
    }
  }

  const exportSelectedToCSV = async () => {
    if (selectedQRCodes.length === 0) {
      toast({
        title: "No QR Codes Selected",
        description: "Please select QR codes to export.",
        variant: "destructive",
      })
      return
    }

    try {
      const selectedQRData = qrCodes.filter((qr) => selectedQRCodes.includes(qr.id))

      const headers = [
        "QR ID",
        "Status",
        "Package Number",
        "Batch",
        "Assigned To",
        "Order ID",
        "Created Date",
        "Assigned Date",
        "Shipped Date",
      ]

      const rows = selectedQRData.map((qr) => [
        qr.qrId,
        qr.status,
        qr.packageNumber.toString(),
        batches.find((b) => b.id === qr.batchId)?.name || "",
        qr.assignedTo || "",
        qr.orderId || "",
        qr.createdAt,
        qr.assignedAt || "",
        qr.shippedAt || "",
      ])

      const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `qr_codes_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Complete",
        description: `Exported ${selectedQRData.length} QR codes to CSV file.`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export QR codes. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleQRSelection = (qrId: string) => {
    setSelectedQRCodes((prev) => (prev.includes(qrId) ? prev.filter((id) => id !== qrId) : [...prev, qrId]))
  }

  const toggleSelectAll = () => {
    if (selectedQRCodes.length === filteredQRCodes.length && filteredQRCodes.length > 0) {
      setSelectedQRCodes([])
    } else {
      setSelectedQRCodes(filteredQRCodes.map((qr) => qr.id))
    }
  }

  const selectBatch = (batchId: string) => {
    const batchQRCodes = qrCodes.filter((qr) => qr.batchId === batchId)
    setSelectedQRCodes(batchQRCodes.map((qr) => qr.id))

    const batch = batches.find((b) => b.id === batchId)
    toast({
      title: "Batch Selected",
      description: `Selected all ${batchQRCodes.length} QR codes from ${batch?.name}`,
    })
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5d5c8] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href="/admin/dashboard" label="Back to Dashboard" />
            <div>
              <h1 className="text-xl font-bold text-[#2c2c2c]">QR Code Batch Management</h1>
              <p className="text-sm text-[#6b5b47]">Manage QR codes in batches of 30 or 50</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Batch Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {batches.map((batch) => (
            <Card key={batch.id} className="border-[#e5d5c8]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {batch.name}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => selectBatch(batch.id)}
                    className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent"
                  >
                    Select All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b5b47]">Total:</span>
                  <span className="font-medium">{batch.totalCodes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Available:</span>
                  <span className="font-medium text-green-700">{batch.availableCodes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Assigned:</span>
                  <span className="font-medium text-blue-700">{batch.assignedCodes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-700">Shipped:</span>
                  <span className="font-medium text-purple-700">{batch.shippedCodes}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-[#c44c3a] h-2 rounded-full"
                    style={{ width: `${((batch.assignedCodes + batch.shippedCodes) / batch.totalCodes) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Bulk Actions */}
        <Card className="border-[#e5d5c8] mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#2c2c2c]">QR Code Management</CardTitle>
              {selectedQRCodes.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#6b5b47]">{selectedQRCodes.length} selected</span>

                  <Dialog open={rangeDialog} onOpenChange={setRangeDialog}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent"
                      >
                        <QrCode className="w-3 h-3 mr-1" />
                        Select Range
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Select QR Code Range</DialogTitle>
                        <DialogDescription>Select a range of QR codes by entering start and end IDs</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Start QR ID</label>
                          <Input
                            value={rangeStart}
                            onChange={(e) => setRangeStart(e.target.value)}
                            placeholder="e.g., qr0001"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">End QR ID</label>
                          <Input
                            value={rangeEnd}
                            onChange={(e) => setRangeEnd(e.target.value)}
                            placeholder="e.g., qr0010"
                            className="mt-1"
                          />
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className="font-medium text-blue-900 mb-2">QR ID Format:</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• qr0001 through qr9999 (4 digits)</li>
                            <li>• qrA0001, qrA0002, etc. (after qr9999)</li>
                            <li>• Example ranges: qr0001-qr0010, qr0051-qr0100</li>
                          </ul>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setRangeDialog(false)
                              setRangeStart("")
                              setRangeEnd("")
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={selectQRRange} className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                            Select Range
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button size="sm" onClick={exportSelectedToCSV} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Download className="w-3 h-3 mr-1" />
                    Export CSV
                  </Button>

                  <Dialog open={bulkStatusDialog} onOpenChange={setBulkStatusDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                        Bulk Update Status
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Bulk Status Update</DialogTitle>
                        <DialogDescription>
                          Update the status of {selectedQRCodes.length} selected QR codes
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">New Status</label>
                          <Select
                            value={bulkStatusValue}
                            onValueChange={(value: QRCode["status"]) => setBulkStatusValue(value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="assigned">Assigned</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="damaged">Damaged</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setBulkStatusDialog(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={processBulkStatusUpdate}
                            disabled={isProcessingBulk}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            {isProcessingBulk ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : null}
                            Update {selectedQRCodes.length} QR Codes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6b5b47] w-4 h-4" />
                  <Input
                    placeholder="Search by QR ID, assigned store, or order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[#e5d5c8] focus:border-[#2c2c2c] focus:ring-[#2c2c2c]"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 border-[#e5d5c8]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger className="w-full md:w-48 border-[#e5d5c8]">
                  <SelectValue placeholder="Filter by batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* QR Codes Table */}
        <Card className="border-[#e5d5c8]">
          <CardHeader>
            <CardTitle className="text-[#2c2c2c]">QR Codes ({filteredQRCodes.length})</CardTitle>
            <CardDescription className="text-[#6b5b47]">
              Manage individual QR codes and track their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedQRCodes.length === filteredQRCodes.length && filteredQRCodes.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>QR ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Package #</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQRCodes.map((qr) => (
                  <TableRow key={qr.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedQRCodes.includes(qr.id)}
                        onCheckedChange={() => toggleQRSelection(qr.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono font-medium">{qr.qrId}</TableCell>
                    <TableCell>{getStatusBadge(qr.status)}</TableCell>
                    <TableCell>{qr.packageNumber}</TableCell>
                    <TableCell className="text-sm">
                      {batches.find((b) => b.id === qr.batchId)?.name.split(": ")[1] || ""}
                    </TableCell>
                    <TableCell>{qr.assignedTo || "-"}</TableCell>
                    <TableCell>{qr.orderId || "-"}</TableCell>
                    <TableCell>{new Date(qr.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
