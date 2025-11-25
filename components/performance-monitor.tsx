"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap, Wifi, Battery, Smartphone, Monitor, Gauge } from "lucide-react"

interface PerformanceMetrics {
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  fcp: number // First Contentful Paint
  ttfb: number // Time to First Byte
  connectionType: string
  deviceMemory: number
  hardwareConcurrency: number
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Get battery information if available
    if ("getBattery" in navigator) {
      ;(navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100))

        battery.addEventListener("levelchange", () => {
          setBatteryLevel(Math.round(battery.level * 100))
        })
      })
    }

    // Collect performance metrics
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      const connection =
        (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      const performanceMetrics: PerformanceMetrics = {
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: navigation.responseStart - navigation.fetchStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        connectionType: connection?.effectiveType || "unknown",
        deviceMemory: (navigator as any).deviceMemory || 0,
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
      }

      // Use Web Vitals API if available
      if ("PerformanceObserver" in window) {
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          performanceMetrics.lcp = lastEntry.startTime
          setMetrics({ ...performanceMetrics })
        }).observe({ entryTypes: ["largest-contentful-paint"] })

        // First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            performanceMetrics.fid = entry.processingStart - entry.startTime
            setMetrics({ ...performanceMetrics })
          })
        }).observe({ entryTypes: ["first-input"] })

        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
          let clsValue = 0
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          performanceMetrics.cls = clsValue
          setMetrics({ ...performanceMetrics })
        }).observe({ entryTypes: ["layout-shift"] })
      }

      setMetrics(performanceMetrics)
    }

    // Collect metrics after page load
    if (document.readyState === "complete") {
      collectMetrics()
    } else {
      window.addEventListener("load", collectMetrics)
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("load", collectMetrics)
    }
  }, [])

  const getScoreColor = (score: number, thresholds: { good: number; needs: number }) => {
    if (score <= thresholds.good) return "text-green-600"
    if (score <= thresholds.needs) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number, thresholds: { good: number; needs: number }) => {
    if (score <= thresholds.good) return { label: "Good", color: "bg-green-100 text-green-700" }
    if (score <= thresholds.needs) return { label: "Needs Improvement", color: "bg-yellow-100 text-yellow-700" }
    return { label: "Poor", color: "bg-red-100 text-red-700" }
  }

  if (!metrics) {
    return (
      <Card className="border-[#e5d5c8]">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#c44c3a]"></div>
            <span className="ml-2 text-[#6b5b47]">Collecting performance metrics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#e5d5c8]">
      <CardHeader>
        <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
          <Gauge className="w-5 h-5 text-[#c44c3a]" />
          Performance Monitor
        </CardTitle>
        <CardDescription className="text-[#6b5b47]">
          Real-time performance metrics and system information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-[#f5f0e8] rounded-lg">
          <div className="flex items-center gap-2">
            <Wifi className={`w-4 h-4 ${isOnline ? "text-green-600" : "text-red-600"}`} />
            <span className="text-sm text-[#2c2c2c]">Connection Status</span>
          </div>
          <Badge className={isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* System Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-[#f5f0e8] rounded-lg">
            <Monitor className="w-6 h-6 text-[#c44c3a] mx-auto mb-2" />
            <div className="text-sm text-[#6b5b47]">Connection</div>
            <div className="font-semibold text-[#2c2c2c]">{metrics.connectionType}</div>
          </div>

          <div className="text-center p-3 bg-[#f5f0e8] rounded-lg">
            <Smartphone className="w-6 h-6 text-[#c44c3a] mx-auto mb-2" />
            <div className="text-sm text-[#6b5b47]">CPU Cores</div>
            <div className="font-semibold text-[#2c2c2c]">{metrics.hardwareConcurrency}</div>
          </div>

          {batteryLevel !== null && (
            <div className="text-center p-3 bg-[#f5f0e8] rounded-lg">
              <Battery className="w-6 h-6 text-[#c44c3a] mx-auto mb-2" />
              <div className="text-sm text-[#6b5b47]">Battery</div>
              <div className="font-semibold text-[#2c2c2c]">{batteryLevel}%</div>
            </div>
          )}
        </div>

        {/* Core Web Vitals */}
        <div className="space-y-4">
          <h4 className="font-medium text-[#2c2c2c] flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Core Web Vitals
          </h4>

          {/* Largest Contentful Paint */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#2c2c2c]">Largest Contentful Paint (LCP)</span>
              <Badge className={getScoreBadge(metrics.lcp, { good: 2500, needs: 4000 }).color}>
                {getScoreBadge(metrics.lcp, { good: 2500, needs: 4000 }).label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={Math.min((metrics.lcp / 4000) * 100, 100)} className="flex-1 h-2" />
              <span className={`text-sm font-medium ${getScoreColor(metrics.lcp, { good: 2500, needs: 4000 })}`}>
                {Math.round(metrics.lcp)}ms
              </span>
            </div>
          </div>

          {/* First Input Delay */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#2c2c2c]">First Input Delay (FID)</span>
              <Badge className={getScoreBadge(metrics.fid, { good: 100, needs: 300 }).color}>
                {getScoreBadge(metrics.fid, { good: 100, needs: 300 }).label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={Math.min((metrics.fid / 300) * 100, 100)} className="flex-1 h-2" />
              <span className={`text-sm font-medium ${getScoreColor(metrics.fid, { good: 100, needs: 300 })}`}>
                {Math.round(metrics.fid)}ms
              </span>
            </div>
          </div>

          {/* Cumulative Layout Shift */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#2c2c2c]">Cumulative Layout Shift (CLS)</span>
              <Badge className={getScoreBadge(metrics.cls, { good: 0.1, needs: 0.25 }).color}>
                {getScoreBadge(metrics.cls, { good: 0.1, needs: 0.25 }).label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={Math.min((metrics.cls / 0.25) * 100, 100)} className="flex-1 h-2" />
              <span className={`text-sm font-medium ${getScoreColor(metrics.cls, { good: 0.1, needs: 0.25 })}`}>
                {metrics.cls.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Time to First Byte */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#2c2c2c]">Time to First Byte (TTFB)</span>
              <Badge className={getScoreBadge(metrics.ttfb, { good: 800, needs: 1800 }).color}>
                {getScoreBadge(metrics.ttfb, { good: 800, needs: 1800 }).label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={Math.min((metrics.ttfb / 1800) * 100, 100)} className="flex-1 h-2" />
              <span className={`text-sm font-medium ${getScoreColor(metrics.ttfb, { good: 800, needs: 1800 })}`}>
                {Math.round(metrics.ttfb)}ms
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
