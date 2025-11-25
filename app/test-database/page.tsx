"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TestResult {
  table: string
  status: "success" | "error" | "pending"
  message: string
  count?: number
}

export default function DatabaseTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const tables = [
    "profiles",
    "qr_slugs",
    "stories",
    "memories",
    "orders",
    "order_items",
    "packages",
    "qr_inventory",
    "csv_import_logs",
    "stores",
    "comments",
    "privacy_settings",
    "analytics_events",
  ]

  const testDatabase = async () => {
    console.log("[v0] Starting database connection test")
    setIsRunning(true)
    setTestResults([])

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.log("[v0] Supabase environment variables not found")
      setTestResults([
        {
          table: "Configuration",
          status: "error",
          message:
            "Supabase environment variables not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your project.",
        },
      ])
      setIsRunning(false)
      return
    }

    console.log("[v0] Environment variables found, testing tables...")

    // Test each table
    for (const table of tables) {
      console.log(`[v0] Testing table: ${table}`)

      try {
        // This would normally use Supabase client
        // For now, we'll simulate the test
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call

        // Since we don't have Supabase connected, we'll show what the test would do
        setTestResults((prev) => [
          ...prev,
          {
            table,
            status: "error",
            message: "Supabase client not initialized. Connect Supabase integration to test this table.",
            count: 0,
          },
        ])
      } catch (error) {
        console.log(`[v0] Error testing table ${table}:`, error)
        setTestResults((prev) => [
          ...prev,
          {
            table,
            status: "error",
            message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            count: 0,
          },
        ])
      }
    }

    console.log("[v0] Database test completed")
    setIsRunning(false)
  }

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2c2c2c] mb-4">Database Connection Test</h1>
          <p className="text-[#666] mb-6">
            Test your database tables to ensure they're properly created and accessible.
          </p>

          <Card className="bg-yellow-50 border-yellow-200 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <span className="text-yellow-600 text-xl">⚠️</span>
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Setup Required</h3>
                  <p className="text-yellow-700 text-sm mb-3">To run this test, you need to:</p>
                  <ol className="text-yellow-700 text-sm space-y-1 list-decimal list-inside">
                    <li>Connect your Supabase integration in Project Settings</li>
                    <li>Ensure your database schema has been uploaded</li>
                    <li>Verify your environment variables are set</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={testDatabase} disabled={isRunning} className="bg-[#c44c3a] hover:bg-[#a83d2e] text-white">
            {isRunning ? "Testing..." : "Test Database Connection"}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-[#2c2c2c] mb-4">Test Results</h2>

            <div className="grid gap-4">
              {testResults.map((result, index) => (
                <Card key={index} className="bg-white border-[#e8ddd0]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-medium text-[#2c2c2c]">{result.table}</CardTitle>
                      <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#666] text-sm mb-2">{result.message}</p>
                    {result.count !== undefined && <p className="text-[#888] text-xs">Records found: {result.count}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-blue-50 border-blue-200 mt-6">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 text-xl">💡</span>
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Next Steps</h3>
                    <p className="text-blue-700 text-sm mb-3">Once you connect Supabase, this test will:</p>
                    <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
                      <li>Verify each table exists and is accessible</li>
                      <li>Count records in each table</li>
                      <li>Test basic read permissions</li>
                      <li>Identify any missing tables or connection issues</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
