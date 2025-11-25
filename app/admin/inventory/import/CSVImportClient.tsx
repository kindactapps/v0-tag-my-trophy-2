"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import BackButton from "@/components/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Package,
  Database,
  Eye,
  X,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CSVRow {
  qr_code_id: string
  slug: string
  package_name: string
  product_type: "essential" | "premium"
}

interface ValidationError {
  row: number
  field: string
  message: string
  value: string
}

interface ImportPreview {
  totalRows: number
  validRows: number
  invalidRows: number
  packages: {
    [packageName: string]: {
      product_type: "essential" | "premium"
      count: number
      rows: CSVRow[]
    }
  }
  errors: ValidationError[]
  sampleData: CSVRow[]
}

export default function CSVImportClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [importResults, setImportResults] = useState<{
    success: boolean
    packagesCreated: number
    qrCodesImported: number
    errors: ValidationError[]
  } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Skip auth check for demo
    setIsAuthenticated(true)
  }, [])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file.",
        variant: "destructive",
      })
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    parseCSV(selectedFile)
  }

  const parseCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        toast({
          title: "Invalid CSV",
          description: "CSV file must contain headers and at least one data row.",
          variant: "destructive",
        })
        return
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
      const requiredHeaders = ["qr_code_id", "slug", "package_name", "product_type"]

      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))
      if (missingHeaders.length > 0) {
        toast({
          title: "Invalid CSV Format",
          description: `Missing required columns: ${missingHeaders.join(", ")}`,
          variant: "destructive",
        })
        return
      }

      const data: CSVRow[] = []
      const errors: ValidationError[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim())
        const row: any = {}

        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })

        // Validate row data
        if (!row.qr_code_id) {
          errors.push({
            row: i + 1,
            field: "qr_code_id",
            message: "QR Code ID is required",
            value: row.qr_code_id,
          })
        }

        if (!row.slug) {
          errors.push({
            row: i + 1,
            field: "slug",
            message: "Slug is required",
            value: row.slug,
          })
        }

        if (!row.package_name) {
          errors.push({
            row: i + 1,
            field: "package_name",
            message: "Package name is required",
            value: row.package_name,
          })
        }

        if (!["essential", "premium"].includes(row.product_type)) {
          errors.push({
            row: i + 1,
            field: "product_type",
            message: 'Product type must be "essential" or "premium"',
            value: row.product_type,
          })
        }

        data.push({
          qr_code_id: row.qr_code_id,
          slug: row.slug,
          package_name: row.package_name,
          product_type: row.product_type as "essential" | "premium",
        })
      }

      setCsvData(data)
      generatePreview(data, errors)
    }

    reader.readAsText(file)
  }

  const generatePreview = (data: CSVRow[], errors: ValidationError[]) => {
    const packages: ImportPreview["packages"] = {}

    data.forEach((row) => {
      if (!packages[row.package_name]) {
        packages[row.package_name] = {
          product_type: row.product_type,
          count: 0,
          rows: [],
        }
      }
      packages[row.package_name].count++
      packages[row.package_name].rows.push(row)
    })

    const validRows = data.length - errors.length

    setPreview({
      totalRows: data.length,
      validRows,
      invalidRows: errors.length,
      packages,
      errors,
      sampleData: data.slice(0, 10),
    })
  }

  const processImport = async () => {
    if (!preview || preview.invalidRows > 0) {
      toast({
        title: "Cannot Import",
        description: "Please fix validation errors before importing.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      // Simulate import processing with progress
      const totalSteps = Object.keys(preview.packages).length + preview.validRows
      let currentStep = 0

      const interval = setInterval(() => {
        currentStep++
        const progress = Math.min((currentStep / totalSteps) * 100, 95)
        setProcessingProgress(progress)

        if (currentStep >= totalSteps) {
          clearInterval(interval)
          setProcessingProgress(100)

          // Simulate final processing
          setTimeout(() => {
            setImportResults({
              success: true,
              packagesCreated: Object.keys(preview.packages).length,
              qrCodesImported: preview.validRows,
              errors: [],
            })
            setIsProcessing(false)

            toast({
              title: "Import Successful",
              description: `Created ${Object.keys(preview.packages).length} packages with ${preview.validRows} QR codes.`,
            })
          }, 1000)
        }
      }, 100)
    } catch (error) {
      setIsProcessing(false)
      toast({
        title: "Import Failed",
        description: "An error occurred during import. Please try again.",
        variant: "destructive",
      })
    }
  }

  const downloadSampleCSV = () => {
    const sampleData = [
      "qr_code_id,slug,package_name,product_type",
      "QR000001,mountain-sunrise-7x9k,Holiday Bundle 2024,premium",
      "QR000002,ocean-waves-3m2p,Holiday Bundle 2024,premium",
      "QR000003,forest-trail-8k5n,Spring Collection,essential",
      "QR000004,desert-bloom-9w7q,Spring Collection,essential",
    ].join("\n")

    const blob = new Blob([sampleData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample-qr-import.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const resetImport = () => {
    setFile(null)
    setCsvData([])
    setPreview(null)
    setImportResults(null)
    setProcessingProgress(0)
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
              <h1 className="text-xl font-bold text-[#2c2c2c]">CSV Import</h1>
              <p className="text-sm text-[#6b5b47]">Import manufacturer QR codes and create packages</p>
            </div>
          </div>
          {importResults && (
            <Button
              onClick={resetImport}
              variant="outline"
              className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Import
            </Button>
          )}
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Import Instructions */}
        <Card className="border-[#e5d5c8] mb-6">
          <CardHeader>
            <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
              <FileText className="w-5 h-5" />
              CSV Format Requirements
            </CardTitle>
            <CardDescription className="text-[#6b5b47]">
              Your CSV file must include these exact column headers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-[#f5f0e8] p-4 rounded-lg">
                  <h4 className="font-medium text-[#2c2c2c] mb-2">Required Columns:</h4>
                  <ul className="space-y-1 text-sm text-[#6b5b47]">
                    <li>
                      <code className="bg-white px-2 py-1 rounded">qr_code_id</code> - Unique manufacturer ID
                    </li>
                    <li>
                      <code className="bg-white px-2 py-1 rounded">slug</code> - URL slug
                      (nature-word-emotion-word-code)
                    </li>
                    <li>
                      <code className="bg-white px-2 py-1 rounded">package_name</code> - Package identifier
                    </li>
                    <li>
                      <code className="bg-white px-2 py-1 rounded">product_type</code> - "essential" or "premium"
                    </li>
                  </ul>
                </div>
                <Button
                  onClick={downloadSampleCSV}
                  variant="outline"
                  className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Sample CSV
                </Button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-[#2c2c2c] mb-2">Example Data:</h4>
                <pre className="text-xs text-[#6b5b47] overflow-x-auto">
                  {`qr_code_id,slug,package_name,product_type
QR000001,mountain-sunrise-7x9k,Holiday Bundle 2024,premium
QR000002,ocean-waves-3m2p,Holiday Bundle 2024,premium
QR000003,forest-trail-8k5n,Spring Collection,essential`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {!file && !importResults && (
          /* File Upload Area */
          <Card className="border-[#e5d5c8]">
            <CardContent className="p-8">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-[#c44c3a] bg-red-50" : "border-[#e5d5c8] hover:border-[#c44c3a] hover:bg-red-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-[#6b5b47] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#2c2c2c] mb-2">Drop your CSV file here, or click to browse</h3>
                <p className="text-[#6b5b47] mb-4">Supports CSV files up to 10MB with manufacturer QR code data</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload">
                  <Button className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white cursor-pointer">Select CSV File</Button>
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {preview && !importResults && (
          /* Import Preview */
          <div className="space-y-6">
            {/* Validation Summary */}
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Import Preview - {file?.name}
                </CardTitle>
                <CardDescription className="text-[#6b5b47]">Review your data before importing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{preview.totalRows}</div>
                    <div className="text-sm text-blue-600">Total Rows</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">{preview.validRows}</div>
                    <div className="text-sm text-green-600">Valid Rows</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-700">{preview.invalidRows}</div>
                    <div className="text-sm text-red-600">Invalid Rows</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">{Object.keys(preview.packages).length}</div>
                    <div className="text-sm text-purple-600">Packages</div>
                  </div>
                </div>

                {preview.errors.length > 0 && (
                  <Alert className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Found {preview.errors.length} validation errors. Please fix these issues before importing.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Package Summary */}
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">Package Summary</CardTitle>
                <CardDescription className="text-[#6b5b47]">
                  Packages that will be created from your CSV data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(preview.packages).map(([packageName, packageData]) => (
                    <div key={packageName} className="bg-[#f5f0e8] p-4 rounded-lg">
                      <h4 className="font-medium text-[#2c2c2c] mb-2">{packageName}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#6b5b47]">Type:</span>
                          <Badge
                            className={
                              packageData.product_type === "premium"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }
                          >
                            {packageData.product_type}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6b5b47]">QR Codes:</span>
                          <span className="font-medium text-[#2c2c2c]">{packageData.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sample Data Preview */}
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">Sample Data (First 10 Rows)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>QR Code ID</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Package Name</TableHead>
                      <TableHead>Product Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.sampleData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{row.qr_code_id}</TableCell>
                        <TableCell className="font-mono text-sm">{row.slug}</TableCell>
                        <TableCell>{row.package_name}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              row.product_type === "premium"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }
                          >
                            {row.product_type}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Validation Errors */}
            {preview.errors.length > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Validation Errors ({preview.errors.length})
                  </CardTitle>
                  <CardDescription className="text-red-600">Fix these errors before importing</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Field</TableHead>
                        <TableHead>Error</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.errors.slice(0, 20).map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.row}</TableCell>
                          <TableCell className="font-mono text-sm">{error.field}</TableCell>
                          <TableCell className="text-red-600">{error.message}</TableCell>
                          <TableCell className="font-mono text-sm">{error.value || "(empty)"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {preview.errors.length > 20 && (
                    <p className="text-sm text-[#6b5b47] mt-4">
                      Showing first 20 errors. Total: {preview.errors.length}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Import Actions */}
            <Card className="border-[#e5d5c8]">
              <CardContent className="p-6">
                {isProcessing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-[#c44c3a]" />
                      <span className="font-medium text-[#2c2c2c]">Processing Import...</span>
                    </div>
                    <Progress value={processingProgress} className="w-full" />
                    <p className="text-sm text-[#6b5b47]">
                      Creating packages and importing QR codes... {Math.round(processingProgress)}%
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[#2c2c2c]">Ready to Import</h4>
                      <p className="text-sm text-[#6b5b47]">
                        {preview.validRows} QR codes will be imported into {Object.keys(preview.packages).length}{" "}
                        packages
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={resetImport}
                        variant="outline"
                        className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={processImport}
                        disabled={preview.invalidRows > 0}
                        className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Import {preview.validRows} QR Codes
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {importResults && (
          /* Import Results */
          <Card className="border-[#e5d5c8]">
            <CardHeader>
              <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Import Complete
              </CardTitle>
              <CardDescription className="text-[#6b5b47]">Your CSV data has been successfully imported</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{importResults.packagesCreated}</div>
                  <div className="text-sm text-green-600">Packages Created</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{importResults.qrCodesImported}</div>
                  <div className="text-sm text-blue-600">QR Codes Imported</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => router.push("/admin/inventory/packages")}
                  className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
                >
                  <Package className="w-4 h-4 mr-2" />
                  View Packages
                </Button>
                <Button
                  onClick={resetImport}
                  variant="outline"
                  className="border-[#e5d5c8] text-[#2c2c2c] hover:bg-[#f5f0e8] bg-transparent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Import Another File
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
