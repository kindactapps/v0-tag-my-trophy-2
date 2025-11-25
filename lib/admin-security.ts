export interface AdminUser {
  id: string
  email: string
  name: string
  role: AdminRole
  permissions: Permission[]
  lastLogin: Date
  loginAttempts: number
  isLocked: boolean
  mfaEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SecurityEvent {
  id: string
  type: SecurityEventType
  severity: "low" | "medium" | "high" | "critical"
  userId?: string
  adminId?: string
  ipAddress: string
  userAgent: string
  details: Record<string, any>
  timestamp: Date
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: Date
}

export interface AuditLog {
  id: string
  adminId: string
  action: string
  resource: string
  resourceId?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: Date
  success: boolean
  errorMessage?: string
}

export type AdminRole = "super_admin" | "admin" | "moderator" | "support"

export type Permission =
  | "user_management"
  | "content_moderation"
  | "security_monitoring"
  | "system_settings"
  | "audit_logs"
  | "backup_restore"
  | "analytics_access"
  | "support_tickets"

export type SecurityEventType =
  | "failed_login"
  | "suspicious_activity"
  | "data_breach_attempt"
  | "unauthorized_access"
  | "malware_detected"
  | "ddos_attempt"
  | "privilege_escalation"
  | "data_export"
  | "account_takeover"
  | "content_violation"

export class AdminSecurityManager {
  private static readonly MAX_LOGIN_ATTEMPTS = 5
  private static readonly LOCKOUT_DURATION = 30 * 60 * 1000 // 30 minutes
  private static readonly SESSION_TIMEOUT = 4 * 60 * 60 * 1000 // 4 hours

  // Role-based permissions mapping
  private static readonly ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
    super_admin: [
      "user_management",
      "content_moderation",
      "security_monitoring",
      "system_settings",
      "audit_logs",
      "backup_restore",
      "analytics_access",
      "support_tickets",
    ],
    admin: [
      "user_management",
      "content_moderation",
      "security_monitoring",
      "audit_logs",
      "analytics_access",
      "support_tickets",
    ],
    moderator: ["content_moderation", "support_tickets"],
    support: ["support_tickets", "analytics_access"],
  }

  // Check if admin has required permission
  static hasPermission(admin: AdminUser, permission: Permission): boolean {
    return admin.permissions.includes(permission)
  }

  // Validate admin session
  static validateSession(sessionData: any): {
    isValid: boolean
    admin?: AdminUser
    errors: string[]
  } {
    const errors: string[] = []

    if (!sessionData) {
      errors.push("No session data found")
      return { isValid: false, errors }
    }

    // Check session expiry
    const sessionAge = Date.now() - new Date(sessionData.createdAt).getTime()
    if (sessionAge > this.SESSION_TIMEOUT) {
      errors.push("Session expired")
      return { isValid: false, errors }
    }

    // Check if admin is locked
    if (sessionData.admin?.isLocked) {
      errors.push("Admin account is locked")
      return { isValid: false, errors }
    }

    if (!sessionData.token || typeof sessionData.token !== "string" || sessionData.token.length < 10) {
      errors.push("Invalid session token")
      return { isValid: false, errors }
    }

    return {
      isValid: true,
      admin: sessionData.admin,
      errors: [],
    }
  }

  // Log security event
  static async logSecurityEvent(event: Omit<SecurityEvent, "id" | "timestamp" | "resolved">): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      resolved: false,
    }

    // Store in security log (would be database in real app)
    console.log("[AdminSecurity] Security event logged:", securityEvent)

    // Trigger alerts for high/critical severity events
    if (event.severity === "high" || event.severity === "critical") {
      await this.triggerSecurityAlert(securityEvent)
    }
  }

  // Log admin action for audit trail
  static async logAdminAction(log: Omit<AuditLog, "id" | "timestamp">): Promise<void> {
    const auditLog: AuditLog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    }

    // Store in audit log (would be database in real app)
    console.log("[AdminSecurity] Admin action logged:", auditLog)
  }

  // Detect suspicious activity patterns
  static detectSuspiciousActivity(events: SecurityEvent[]): {
    threats: Array<{
      type: string
      severity: "medium" | "high" | "critical"
      description: string
      events: SecurityEvent[]
    }>
  } {
    const threats = []

    // Multiple failed logins from same IP
    const failedLogins = events.filter((e) => e.type === "failed_login")
    const ipGroups = this.groupBy(failedLogins, "ipAddress")

    for (const [ip, ipEvents] of Object.entries(ipGroups)) {
      if (ipEvents.length >= 10) {
        threats.push({
          type: "brute_force_attack",
          severity: "high" as const,
          description: `Multiple failed login attempts from IP ${ip}`,
          events: ipEvents,
        })
      }
    }

    // Rapid privilege escalation attempts
    const privilegeEvents = events.filter((e) => e.type === "privilege_escalation")
    if (privilegeEvents.length >= 3) {
      threats.push({
        type: "privilege_escalation",
        severity: "critical" as const,
        description: "Multiple privilege escalation attempts detected",
        events: privilegeEvents,
      })
    }

    // Unusual data export activity
    const exportEvents = events.filter((e) => e.type === "data_export")
    if (exportEvents.length >= 5) {
      threats.push({
        type: "data_exfiltration",
        severity: "high" as const,
        description: "Unusual data export activity detected",
        events: exportEvents,
      })
    }

    return { threats }
  }

  // Generate security report
  static generateSecurityReport(
    events: SecurityEvent[],
    auditLogs: AuditLog[],
    timeRange: { start: Date; end: Date },
  ): {
    summary: {
      totalEvents: number
      criticalEvents: number
      resolvedEvents: number
      activeThreats: number
    }
    topThreats: Array<{
      type: SecurityEventType
      count: number
      severity: string
    }>
    adminActivity: Array<{
      adminId: string
      actions: number
      lastActive: Date
    }>
    recommendations: string[]
  } {
    const filteredEvents = events.filter((e) => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end)

    const summary = {
      totalEvents: filteredEvents.length,
      criticalEvents: filteredEvents.filter((e) => e.severity === "critical").length,
      resolvedEvents: filteredEvents.filter((e) => e.resolved).length,
      activeThreats: filteredEvents.filter((e) => !e.resolved && e.severity !== "low").length,
    }

    // Top threats by frequency
    const threatCounts = this.groupBy(filteredEvents, "type")
    const topThreats = Object.entries(threatCounts)
      .map(([type, events]) => ({
        type: type as SecurityEventType,
        count: events.length,
        severity: this.getMostSevereThreat(events),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Admin activity summary
    const adminLogs = auditLogs.filter((log) => log.timestamp >= timeRange.start && log.timestamp <= timeRange.end)
    const adminActivity = Object.entries(this.groupBy(adminLogs, "adminId"))
      .map(([adminId, logs]) => ({
        adminId,
        actions: logs.length,
        lastActive: new Date(Math.max(...logs.map((log) => log.timestamp.getTime()))),
      }))
      .sort((a, b) => b.actions - a.actions)

    // Security recommendations
    const recommendations = this.generateRecommendations(filteredEvents, summary)

    return {
      summary,
      topThreats,
      adminActivity,
      recommendations,
    }
  }

  // Trigger security alert
  private static async triggerSecurityAlert(event: SecurityEvent): Promise<void> {
    // In a real app, this would send notifications to security team
    console.warn("[AdminSecurity] SECURITY ALERT:", {
      type: event.type,
      severity: event.severity,
      details: event.details,
      timestamp: event.timestamp,
    })

    // Could integrate with services like:
    // - Email notifications
    // - Slack/Teams alerts
    // - SMS alerts for critical events
    // - Security incident management systems
  }

  // Helper method to group array by property
  private static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce(
      (groups, item) => {
        const group = String(item[key])
        groups[group] = groups[group] || []
        groups[group].push(item)
        return groups
      },
      {} as Record<string, T[]>,
    )
  }

  // Get most severe threat level from events
  private static getMostSevereThreat(events: SecurityEvent[]): string {
    const severityOrder = ["low", "medium", "high", "critical"]
    return events.reduce((maxSeverity, event) => {
      return severityOrder.indexOf(event.severity) > severityOrder.indexOf(maxSeverity) ? event.severity : maxSeverity
    }, "low")
  }

  // Generate security recommendations
  private static generateRecommendations(events: SecurityEvent[], summary: any): string[] {
    const recommendations = []

    if (summary.criticalEvents > 0) {
      recommendations.push("Immediate attention required for critical security events")
    }

    const failedLogins = events.filter((e) => e.type === "failed_login").length
    if (failedLogins > 50) {
      recommendations.push("Consider implementing additional rate limiting for login attempts")
    }

    const unresolvedEvents = events.filter((e) => !e.resolved).length
    if (unresolvedEvents > 10) {
      recommendations.push("Review and resolve pending security events")
    }

    if (events.some((e) => e.type === "privilege_escalation")) {
      recommendations.push("Review admin permissions and implement principle of least privilege")
    }

    if (events.some((e) => e.type === "data_export")) {
      recommendations.push("Monitor data export activities and implement additional controls")
    }

    return recommendations
  }

  // Validate admin credentials with enhanced security
  static async validateAdminCredentials(
    email: string,
    password: string,
    mfaCode?: string,
  ): Promise<{
    isValid: boolean
    admin?: AdminUser
    requiresMFA: boolean
    errors: string[]
  }> {
    const errors: string[] = []

    // Basic validation
    if (!email || !password) {
      errors.push("Email and password are required")
      return { isValid: false, requiresMFA: false, errors }
    }

    // In a real app, this would query the database
    // For demo purposes, we'll simulate admin lookup
    const admin = await this.findAdminByEmail(email)

    if (!admin) {
      errors.push("Invalid credentials")
      await this.logSecurityEvent({
        type: "failed_login",
        severity: "medium",
        ipAddress: "127.0.0.1", // Would get real IP
        userAgent: navigator.userAgent,
        details: { email, reason: "admin_not_found" },
      })
      return { isValid: false, requiresMFA: false, errors }
    }

    // Check if account is locked
    if (admin.isLocked) {
      errors.push("Account is locked due to security reasons")
      return { isValid: false, requiresMFA: false, errors }
    }

    // Validate password (would use proper hashing in real app)
    const isPasswordValid = await this.validatePassword(password, admin)
    if (!isPasswordValid) {
      admin.loginAttempts++
      if (admin.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        admin.isLocked = true
        await this.logSecurityEvent({
          type: "failed_login",
          severity: "high",
          adminId: admin.id,
          ipAddress: "127.0.0.1",
          userAgent: navigator.userAgent,
          details: { email, reason: "account_locked" },
        })
      }
      errors.push("Invalid credentials")
      return { isValid: false, requiresMFA: false, errors }
    }

    // Check MFA if enabled
    if (admin.mfaEnabled) {
      if (!mfaCode) {
        return { isValid: false, requiresMFA: true, errors: [] }
      }

      const isMFAValid = await this.validateMFA(admin.id, mfaCode)
      if (!isMFAValid) {
        errors.push("Invalid MFA code")
        return { isValid: false, requiresMFA: true, errors }
      }
    }

    // Reset login attempts on successful login
    admin.loginAttempts = 0
    admin.lastLogin = new Date()

    await this.logAdminAction({
      adminId: admin.id,
      action: "login",
      resource: "admin_session",
      ipAddress: "127.0.0.1",
      userAgent: navigator.userAgent,
      success: true,
    })

    return { isValid: true, admin, requiresMFA: false, errors: [] }
  }

  // Simulate admin lookup (would be database query in real app)
  private static async findAdminByEmail(email: string): Promise<AdminUser | null> {
    // Demo admin user
    if (email === "admin@tagmytrophy.com") {
      return {
        id: "admin-1",
        email,
        name: "System Administrator",
        role: "super_admin",
        permissions: this.ROLE_PERMISSIONS.super_admin,
        lastLogin: new Date(),
        loginAttempts: 0,
        isLocked: false,
        mfaEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
    return null
  }

  // Simulate password validation (would use bcrypt in real app)
  private static async validatePassword(password: string, admin: AdminUser): Promise<boolean> {
    // Demo: accept "admin123" for demo admin
    return password === "admin123"
  }

  // Simulate MFA validation (would integrate with TOTP library in real app)
  private static async validateMFA(adminId: string, code: string): Promise<boolean> {
    // Demo: accept "123456" as valid MFA code
    return code === "123456"
  }
}

// React hook for admin security features
export function useAdminSecurity() {
  const validateSession = (sessionData: any) => {
    return AdminSecurityManager.validateSession(sessionData)
  }

  const hasPermission = (admin: AdminUser, permission: Permission) => {
    return AdminSecurityManager.hasPermission(admin, permission)
  }

  const logSecurityEvent = async (event: Omit<SecurityEvent, "id" | "timestamp" | "resolved">) => {
    return await AdminSecurityManager.logSecurityEvent(event)
  }

  const logAdminAction = async (log: Omit<AuditLog, "id" | "timestamp">) => {
    return await AdminSecurityManager.logAdminAction(log)
  }

  const detectThreats = (events: SecurityEvent[]) => {
    return AdminSecurityManager.detectSuspiciousActivity(events)
  }

  const generateReport = (events: SecurityEvent[], auditLogs: AuditLog[], timeRange: { start: Date; end: Date }) => {
    return AdminSecurityManager.generateSecurityReport(events, auditLogs, timeRange)
  }

  return {
    validateSession,
    hasPermission,
    logSecurityEvent,
    logAdminAction,
    detectThreats,
    generateReport,
  }
}
