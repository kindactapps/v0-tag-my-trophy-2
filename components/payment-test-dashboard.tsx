"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  Monitor,
  Smartphone,
  CreditCard,
  Shield,
  Clock,
} from "lucide-react"
import {
  runPaymentTestSuite,
  testBrowserCompatibility,
  checkPaymentMethodSupport,
  getBrowserInfo,
  runEnhancedPaymentTests,
  type PaymentTestSuite,
  type PaymentMethod,
} from "@/lib/payment-testing"

export default function PaymentTestDashboard() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTest, setCurrentTest] = useState("")
  const [testResults, setTestResults] = useState<PaymentTestSuite | null>(null)
  const [enhancedResults, setEnhancedResults] = useState<any>(null)
  const [browserInfo, setBrowserInfo] = useState<any>(null)
  const [compatibilityInfo, setCompatibilityInfo] = useState<any>(null)
  const [supportedMethods, setSupportedMethods] = useState<PaymentMethod[]>([])

  useEffect(() => {
    // Initialize browser info and compatibility check
    const initializeInfo = async () => {
      const browser = getBrowserInfo()
      setBrowserInfo(browser)

      const compatibility = await testBrowserCompatibility()
      setCompatibilityInfo(compatibility)

      const methods = await checkPaymentMethodSupport()
      setSupportedMethods(methods)
    }

    initializeInfo()
  }, [])

  const runTests = async () => {
    setIsRunning(true)
    setProgress(0)
    setCurrentTest("")
    setTestResults(null)

    try {
      const results = await runPaymentTestSuite((progress, testName) => {
        setProgress(progress)
        setCurrentTest(testName)
      })

      setTestResults(results)
    } catch (error) {
      console.error("[v0] Payment test suite failed:", error)
    } finally {
      setIsRunning(false)
      setProgress(100)
      setCurrentTest("")
    }
  }

  const runEnhancedTests = async () => {
    setIsRunning(true)
    setProgress(0)
    setCurrentTest("Running enhanced cross-browser tests...")
    setEnhancedResults(null)

    try {
      const enhanced = await runEnhancedPaymentTests()
      setEnhancedResults(enhanced)

      // Also run the standard test suite
      const results = await runPaymentTestSuite((progress, testName) => {
        setProgress(progress)
        setCurrentTest(testName)
      })

      setTestResults(results)
    } catch (error) {
      console.error("[v0] Enhanced payment tests failed:", error)
    } finally {
      setIsRunning(false)
      setProgress(100)
      setCurrentTest("")
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />
  }

  const getStatusColor = (success: boolean) => {
    return success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2c2c2c]">Payment Testing Dashboard</h1>
          <p className="text-[#6b5b47]">Test payment processing across different browsers and scenarios</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runTests}
            disabled={isRunning}
            variant="outline"
            className="border-[#c44c3a] text-[#c44c3a] hover:bg-[#c44c3a] hover:text-white bg-transparent"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Standard Tests
              </>
            )}
          </Button>
          <Button
            onClick={runEnhancedTests}
            disabled={isRunning}
            className="bg-[#c44c3a] hover:bg-[#a63c2a] text-white"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running Enhanced...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Enhanced Cross-Browser Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Browser Information */}
      {browserInfo && (
        <Card className="border-[#e5d5c8]">
          <CardHeader>
            <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
              {browserInfo.mobile ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              Browser Environment
            </CardTitle>
            <CardDescription className="text-[#6b5b47]">Current testing environment details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-[#6b5b47]">Browser</div>
                <div className="font-medium text-[#2c2c2c]">
                  {browserInfo.browser} {browserInfo.version}
                </div>
              </div>
              <div>
                <div className="text-sm text-[#6b5b47]">Device</div>
                <div className="font-medium text-[#2c2c2c]">{browserInfo.device}</div>
              </div>
              <div>
                <div className="text-sm text-[#6b5b47]">OS</div>
                <div className="font-medium text-[#2c2c2c]">{browserInfo.os}</div>
              </div>
              <div>
                <div className="text-sm text-[#6b5b47]">Mobile</div>
                <div className="font-medium text-[#2c2c2c]">{browserInfo.mobile ? "Yes" : "No"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method Support */}
      {supportedMethods.length > 0 && (
        <Card className="border-[#e5d5c8]">
          <CardHeader>
            <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Method Support
            </CardTitle>
            <CardDescription className="text-[#6b5b47]">Available payment methods in this browser</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportedMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#f5f0e8] rounded-lg">
                  <span className="font-medium text-[#2c2c2c]">{method.name}</span>
                  <Badge className={method.supported ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {method.supported ? "Supported" : "Not Available"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compatibility Issues */}
      {compatibilityInfo && (compatibilityInfo.issues.length > 0 || compatibilityInfo.recommendations.length > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Browser Compatibility Notes
            </CardTitle>
            <CardDescription className="text-amber-700">
              Potential issues and recommendations for {compatibilityInfo.browser}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {compatibilityInfo.issues.length > 0 && (
              <div>
                <h4 className="font-medium text-amber-900 mb-2">Potential Issues:</h4>
                <ul className="space-y-1">
                  {compatibilityInfo.issues.map((issue: string, index: number) => (
                    <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {compatibilityInfo.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-amber-900 mb-2">Recommendations:</h4>
                <ul className="space-y-1">
                  {compatibilityInfo.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Progress */}
      {isRunning && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-900">Running Tests...</span>
                <span className="text-sm text-blue-700">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              {currentTest && <p className="text-sm text-blue-800">Current: {currentTest}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {enhancedResults && (
        <div className="space-y-6">
          {/* Browser-Specific Issues */}
          {Object.keys(enhancedResults.browserSpecificIssues).length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Browser-Specific Issues Detected
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Issues found during enhanced cross-browser testing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(enhancedResults.browserSpecificIssues).map(([browser, issues]: [string, any]) => (
                  <div key={browser}>
                    <h4 className="font-medium text-amber-900 mb-2">{browser}:</h4>
                    <ul className="space-y-1">
                      {issues.map((issue: string, index: number) => (
                        <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                          <span className="text-amber-600 mt-1">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Fixes Applied */}
          {enhancedResults.fixesApplied.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Cross-Browser Fixes Applied
                </CardTitle>
                <CardDescription className="text-green-700">
                  Compatibility fixes that are working correctly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {enhancedResults.fixesApplied.map((fix: string, index: number) => (
                    <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      {fix}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="border-[#e5d5c8]">
            <CardHeader>
              <CardTitle className="text-[#2c2c2c]">Enhanced Cross-Browser Test Results</CardTitle>
              <CardDescription className="text-[#6b5b47]">
                Detailed browser-specific payment testing results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {enhancedResults.results.map((result: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#f5f0e8] rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.success)}
                      <div>
                        <div className="font-medium text-[#2c2c2c]">{result.testName}</div>
                        <div className="text-sm text-[#6b5b47]">
                          {result.browser} • {result.device}
                        </div>
                        {result.error && <div className="text-sm text-red-600 mt-1">{result.error}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm text-[#6b5b47]">
                        <Clock className="w-3 h-3" />
                        {result.duration}ms
                      </div>
                      <Badge className={getStatusColor(result.success)}>{result.success ? "Pass" : "Fail"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Results */}
      {testResults && (
        <div className="space-y-6">
          {/* Summary */}
          <Card className="border-[#e5d5c8]">
            <CardHeader>
              <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Test Results Summary
              </CardTitle>
              <CardDescription className="text-[#6b5b47]">Overall payment processing test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2c2c2c]">{testResults.summary.total}</div>
                  <div className="text-sm text-[#6b5b47]">Total Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{testResults.summary.passed}</div>
                  <div className="text-sm text-[#6b5b47]">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{testResults.summary.failed}</div>
                  <div className="text-sm text-[#6b5b47]">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#c44c3a]">{testResults.summary.successRate.toFixed(1)}%</div>
                  <div className="text-sm text-[#6b5b47]">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card className="border-[#e5d5c8]">
            <CardHeader>
              <CardTitle className="text-[#2c2c2c]">Detailed Test Results</CardTitle>
              <CardDescription className="text-[#6b5b47]">Individual test outcomes and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#f5f0e8] rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.success)}
                      <div>
                        <div className="font-medium text-[#2c2c2c]">{result.testName}</div>
                        <div className="text-sm text-[#6b5b47]">
                          {result.browser} • {result.device}
                        </div>
                        {result.error && <div className="text-sm text-red-600 mt-1">{result.error}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm text-[#6b5b47]">
                        <Clock className="w-3 h-3" />
                        {result.duration}ms
                      </div>
                      <Badge className={getStatusColor(result.success)}>{result.success ? "Pass" : "Fail"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
