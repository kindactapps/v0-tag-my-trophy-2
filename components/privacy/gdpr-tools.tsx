"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PrivacyManager, type GDPRRequest } from "@/lib/privacy"
import { Download, Trash2, Edit, Shield, CheckCircle } from "lucide-react"

export default function GDPRTools() {
  const [activeRequest, setActiveRequest] = useState<string>("")
  const [email, setEmail] = useState("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string>("")
  const [error, setError] = useState<string>("")

  const handleRequest = async (type: GDPRRequest["type"]) => {
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const request = PrivacyManager.createGDPRRequest(type, email, reason)

      // In a real app, you would send this to your API
      console.log("GDPR Request:", request)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      let successMessage = ""
      switch (type) {
        case "export":
          successMessage =
            "Your data export request has been submitted. You will receive an email with your data within 30 days."
          break
        case "delete":
          successMessage =
            "Your account deletion request has been submitted. We will process this within 30 days and send you a confirmation."
          break
        case "rectify":
          successMessage =
            "Your data correction request has been submitted. We will review and update your information within 30 days."
          break
        case "restrict":
          successMessage =
            "Your data processing restriction request has been submitted. We will limit processing of your data as requested."
          break
      }

      setSuccess(successMessage)
      setActiveRequest("")
      setEmail("")
      setReason("")
    } catch (err) {
      setError("Failed to submit request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDataExport = async () => {
    setIsSubmitting(true)
    try {
      const data = await PrivacyManager.generateDataExport("current-user")

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `tag-my-trophy-data-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccess("Your data has been exported and downloaded successfully.")
    } catch (err) {
      setError("Failed to export data. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#e8ddd0]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2c2c2c]">
            <Shield className="h-5 w-5 text-[#c44c3a]" />
            Your Data Rights (GDPR)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data Export */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="h-4 w-4 text-blue-600" />
                  <h3 className="font-medium text-blue-900">Export Your Data</h3>
                </div>
                <p className="text-sm text-blue-800 mb-3">Download a copy of all your personal data we have stored.</p>
                <Button
                  onClick={handleDataExport}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? "Exporting..." : "Export Data"}
                </Button>
              </CardContent>
            </Card>

            {/* Data Correction */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Edit className="h-4 w-4 text-yellow-600" />
                  <h3 className="font-medium text-yellow-900">Correct Your Data</h3>
                </div>
                <p className="text-sm text-yellow-800 mb-3">Request corrections to inaccurate personal information.</p>
                <Button
                  onClick={() => setActiveRequest("rectify")}
                  variant="outline"
                  className="w-full border-yellow-600 text-yellow-700 hover:bg-yellow-600 hover:text-white"
                >
                  Request Correction
                </Button>
              </CardContent>
            </Card>

            {/* Data Restriction */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <h3 className="font-medium text-orange-900">Restrict Processing</h3>
                </div>
                <p className="text-sm text-orange-800 mb-3">Limit how we process your personal data.</p>
                <Button
                  onClick={() => setActiveRequest("restrict")}
                  variant="outline"
                  className="w-full border-orange-600 text-orange-700 hover:bg-orange-600 hover:text-white"
                >
                  Request Restriction
                </Button>
              </CardContent>
            </Card>

            {/* Account Deletion */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trash2 className="h-4 w-4 text-red-600" />
                  <h3 className="font-medium text-red-900">Delete Account</h3>
                </div>
                <p className="text-sm text-red-800 mb-3">Permanently delete your account and all associated data.</p>
                <Button
                  onClick={() => setActiveRequest("delete")}
                  variant="outline"
                  className="w-full border-red-600 text-red-700 hover:bg-red-600 hover:text-white"
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Request Form */}
          {activeRequest && (
            <Card className="border-[#c44c3a] bg-[#faf8f4]">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium text-[#2c2c2c]">
                  {activeRequest === "delete" && "Account Deletion Request"}
                  {activeRequest === "rectify" && "Data Correction Request"}
                  {activeRequest === "restrict" && "Processing Restriction Request"}
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#2c2c2c] mb-1">Email Address</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="border-[#e8ddd0] focus:border-[#c44c3a]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2c2c2c] mb-1">Reason (Optional)</label>
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please explain your request..."
                      className="border-[#e8ddd0] focus:border-[#c44c3a] min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setActiveRequest("")} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleRequest(activeRequest as GDPRRequest["type"])}
                    disabled={isSubmitting}
                    className="flex-1 bg-[#c44c3a] hover:bg-[#a83d2e] text-white"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-xs text-[#6b5b47] space-y-1">
            <p>• All requests will be processed within 30 days as required by GDPR.</p>
            <p>• You will receive email confirmation for all submitted requests.</p>
            <p>• For urgent matters, please contact our support team directly.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
