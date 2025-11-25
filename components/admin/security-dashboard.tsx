"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdminSecurity, type SecurityEvent, type AuditLog } from "@/lib/admin-security"
import {
  Shield,
  AlertTriangle,
  Activity,
  Users,
  Lock,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react"

interface SecurityDashboardProps {
  className?: string
}

export default function SecurityDashboard({ className = "" }: SecurityDashboardProps) {
  const { detectThreats, generateReport } = useAdminSecurity()
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Mock data for demonstration
  useEffect(() => {
    const loadSecurityData = async () => {
      setIsLoading(true)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock security events
      const mockEvents: SecurityEvent[] = [
        {
          id: "1",
          type: "failed_login",
          severity: "medium",
          userId: "user-123",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0...",
          details: { attempts: 3, email: "user@example.com" },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          resolved: false,
        },
        {
          id: "2",
          type: "suspicious_activity",
          severity: "high",
          userId: "user-456",
          ipAddress: "10.0.0.50",
          userAgent: "Mozilla/5.0...",
          details: { action: "bulk_download", files: 50 },
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          resolved: true,
          resolvedBy: "admin-1",
          resolvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
        {
          id: "3",
          type: "malware_detected",
          severity: "critical",
          ipAddress: "203.0.113.1",
          userAgent: "curl/7.68.0",
          details: { filename: "suspicious.exe", hash: "abc123..." },
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          resolved: false,
        },
      ]

      // Mock audit logs
      const mockAuditLogs: AuditLog[] = [
        {
          id: "1",
          adminId: "admin-1",
          action: "user_suspend",
          resource: "user",
          resourceId: "user-789",
          oldValues: { status: "active" },
          newValues: { status: "suspended" },
          ipAddress: "192.168.1.10",
          userAgent: "Mozilla/5.0...",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          success: true,
        },
        {
          id: "2",
          adminId: "admin-2",
          action: "content_moderate",
          resource: "post",
          resourceId: "post-456",
          oldValues: { status: "published" },
          newValues: { status: "hidden" },
          ipAddress: "192.168.1.11",
          userAgent: "Mozilla/5.0...",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          success: true,
        },
      ]

      setSecurityEvents(mockEvents)
      setAuditLogs(mockAuditLogs)
      setLastRefresh(new Date())
      setIsLoading(false)
    }

    loadSecurityData()
  }, [])

  const refreshData = () => {
    setIsLoading(true)
    // Simulate refresh
    setTimeout(() => {
      setLastRefresh(new Date())
      setIsLoading(false)
    }, 1000)
  }

  const threats = detectThreats(securityEvents)
  const report = generateReport(securityEvents, auditLogs, {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000),
    end: new Date(),
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center p-12">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 text-[#c44c3a] animate-spin mx-auto" />
            <p className="text-[#6b5b47]">Loading security dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2c2c2c]">Security Dashboard</h1>
          <p className="text-[#6b5b47] mt-1">Monitor and manage system security</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-[#6b5b47]">Last updated: {lastRefresh.toLocaleTimeString()}</div>
          <Button onClick={refreshData} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#e8ddd0]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6b5b47]">Total Events</p>
                <p className="text-2xl font-bold text-[#2c2c2c]">{report.summary.totalEvents}</p>
              </div>
              <Activity className="h-8 w-8 text-[#c44c3a]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e8ddd0]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6b5b47]">Critical Events</p>
                <p className="text-2xl font-bold text-red-600">{report.summary.criticalEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e8ddd0]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6b5b47]">Active Threats</p>
                <p className="text-2xl font-bold text-orange-600">{report.summary.activeThreats}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e8ddd0]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6b5b47]">Resolution Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((report.summary.resolvedEvents / report.summary.totalEvents) * 100)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="threats">Threat Analysis</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card className="border-[#e8ddd0]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#c44c3a]" />
                Recent Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border border-[#e8ddd0] rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(event.severity)}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#2c2c2c]">{event.type.replace("_", " ")}</span>
                          <Badge variant={getSeverityBadgeVariant(event.severity)}>{event.severity}</Badge>
                        </div>
                        <p className="text-sm text-[#6b5b47] mt-1">
                          {event.ipAddress} • {event.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.resolved ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card className="border-[#e8ddd0]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#c44c3a]" />
                Threat Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {threats.threats.length > 0 ? (
                <div className="space-y-4">
                  {threats.threats.map((threat, index) => (
                    <div key={index} className="border border-[#e8ddd0] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityBadgeVariant(threat.severity)}>{threat.severity}</Badge>
                          <span className="font-medium text-[#2c2c2c]">{threat.type.replace("_", " ")}</span>
                        </div>
                        <span className="text-sm text-[#6b5b47]">{threat.events.length} events</span>
                      </div>
                      <p className="text-[#6b5b47] mb-3">{threat.description}</p>
                      <Button variant="outline" size="sm">
                        Investigate
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-[#6b5b47]">No active threats detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card className="border-[#e8ddd0]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#c44c3a]" />
                Admin Activity Audit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 border border-[#e8ddd0] rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#2c2c2c]">{log.action.replace("_", " ")}</span>
                        {log.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-sm text-[#6b5b47] mt-1">
                        Admin: {log.adminId} • {log.resource} • {log.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-[#e8ddd0]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#c44c3a]" />
                  Top Threats (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.topThreats.map((threat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-[#2c2c2c]">{threat.type.replace("_", " ")}</span>
                        <Badge variant="outline" className="ml-2">
                          {threat.severity}
                        </Badge>
                      </div>
                      <span className="text-[#6b5b47]">{threat.count} events</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e8ddd0]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#c44c3a]" />
                  Admin Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.adminActivity.map((admin, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-[#2c2c2c]">{admin.adminId}</span>
                        <p className="text-sm text-[#6b5b47]">Last active: {admin.lastActive.toLocaleString()}</p>
                      </div>
                      <span className="text-[#6b5b47]">{admin.actions} actions</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {report.recommendations.length > 0 && (
            <Card className="border-[#e8ddd0]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#c44c3a]" />
                  Security Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-[#6b5b47]">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
