"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  MoreHorizontal,
  Shield,
  MessageSquare,
  Activity,
  Clock,
  AlertTriangle,
  Download,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Headphones,
  Send,
} from "lucide-react"
import BackButton from "@/components/back-button"
import { toast } from "@/hooks/use-toast"

interface User {
  id: number
  name: string
  email: string
  phone: string
  status: "active" | "inactive" | "suspended" | "pending"
  joinDate: string
  lastActive: string
  storiesCount: number
  location: string
  subscription: "Basic" | "Premium" | "Pro"
  permissions: string[]
  supportTickets: number
  totalSpent: number
  lastLogin: string
  deviceInfo: string
  ipAddress: string
  notes: string
}

interface SupportTicket {
  id: number
  userId: number
  userName: string
  subject: string
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  category: string
  createdDate: string
  lastUpdate: string
  assignedTo?: string
  description: string
}

export default function UsersClient() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [subscriptionFilter, setSubscriptionFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showSupportDialog, setShowSupportDialog] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [ticketResponse, setTicketResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const users: User[] = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      status: "active",
      joinDate: "2024-01-15",
      lastActive: "2024-03-15",
      storiesCount: 12,
      location: "New York, NY",
      subscription: "Premium",
      permissions: ["create_stories", "manage_profile", "premium_features"],
      supportTickets: 2,
      totalSpent: 156.99,
      lastLogin: "2024-03-15 14:30",
      deviceInfo: "iPhone 15 Pro, iOS 17.3",
      ipAddress: "192.168.1.100",
      notes: "VIP customer, very engaged with platform",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1 (555) 234-5678",
      status: "active",
      joinDate: "2024-02-03",
      lastActive: "2024-03-14",
      storiesCount: 8,
      location: "Los Angeles, CA",
      subscription: "Basic",
      permissions: ["create_stories", "manage_profile"],
      supportTickets: 0,
      totalSpent: 29.99,
      lastLogin: "2024-03-14 09:15",
      deviceInfo: "Samsung Galaxy S24, Android 14",
      ipAddress: "192.168.1.101",
      notes: "New user, exploring features",
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "mike.wilson@email.com",
      phone: "+1 (555) 345-6789",
      status: "suspended",
      joinDate: "2024-01-28",
      lastActive: "2024-03-10",
      storiesCount: 15,
      location: "Chicago, IL",
      subscription: "Premium",
      permissions: [],
      supportTickets: 5,
      totalSpent: 89.97,
      lastLogin: "2024-03-10 16:45",
      deviceInfo: "MacBook Pro, macOS 14.3",
      ipAddress: "192.168.1.102",
      notes: "Suspended due to policy violation - inappropriate content",
    },
  ]

  const supportTickets: SupportTicket[] = [
    {
      id: 1,
      userId: 1,
      userName: "John Smith",
      subject: "Unable to upload video",
      status: "open",
      priority: "medium",
      category: "Technical",
      createdDate: "2024-03-14",
      lastUpdate: "2024-03-14",
      description: "Getting error when trying to upload video files larger than 50MB",
    },
    {
      id: 2,
      userId: 3,
      userName: "Mike Wilson",
      subject: "Account suspension appeal",
      status: "in-progress",
      priority: "high",
      category: "Account",
      createdDate: "2024-03-12",
      lastUpdate: "2024-03-13",
      assignedTo: "Support Team Lead",
      description: "Requesting review of account suspension, claims content was appropriate",
    },
  ]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesSubscription = subscriptionFilter === "all" || user.subscription === subscriptionFilter
    return matchesSearch && matchesStatus && matchesSubscription
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      inactive: { color: "bg-gray-100 text-gray-800", icon: Clock },
      suspended: { color: "bg-red-100 text-red-800", icon: Ban },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon

    return (
      <Badge className={`${config.color} hover:${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const getTicketStatusBadge = (status: string) => {
    const statusConfig = {
      open: "bg-red-100 text-red-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    }

    return (
      <Badge className={statusConfig[status as keyof typeof statusConfig] || statusConfig.open}>
        {status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </Badge>
    )
  }

  const handleUserAction = async (action: string, userId: number | number[]) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const userIds = Array.isArray(userId) ? userId : [userId]
      const actionText = Array.isArray(userId) ? `${userIds.length} users` : "user"

      toast({
        title: "Action Completed",
        description: `Successfully ${action}ed ${actionText}.`,
      })

      if (Array.isArray(userId)) {
        setSelectedUsers([])
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to complete action. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTicketResponse = async () => {
    if (!selectedTicket || !ticketResponse.trim()) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Response Sent",
        description: "Your response has been sent to the customer.",
      })

      setTicketResponse("")
      setShowSupportDialog(false)
      setSelectedTicket(null)
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    }
  }

  const exportUsers = async () => {
    setIsLoading(true)
    try {
      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Export Complete",
        description: "User data has been exported successfully.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export user data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const activeUsers = users.filter((u) => u.status === "active").length
  const suspendedUsers = users.filter((u) => u.status === "suspended").length
  const openTickets = supportTickets.filter((t) => t.status === "open").length
  const urgentTickets = supportTickets.filter((t) => t.priority === "urgent").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <BackButton href="/admin/dashboard" label="Back to Dashboard" />
            <h1 className="text-3xl font-bold text-amber-900">User Management & Support</h1>
            <p className="text-amber-700 mt-1">Comprehensive user administration and customer support tools</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedUsers.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-amber-200 bg-transparent">
                    Bulk Actions ({selectedUsers.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleUserAction("activate", selectedUsers)}>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate Users
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUserAction("suspend", selectedUsers)}>
                    <UserX className="w-4 h-4 mr-2" />
                    Suspend Users
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUserAction("export", selectedUsers)}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              onClick={exportUsers}
              disabled={isLoading}
              variant="outline"
              className="border-amber-200 bg-transparent"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Export All
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Active Users</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{activeUsers}</div>
              <p className="text-xs text-amber-600">Currently active accounts</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Suspended</CardTitle>
              <Shield className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{suspendedUsers}</div>
              <p className="text-xs text-amber-600">Accounts under review</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Open Tickets</CardTitle>
              <Headphones className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{openTickets}</div>
              <p className="text-xs text-amber-600">Pending support requests</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Urgent Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{urgentTickets}</div>
              <p className="text-xs text-amber-600">High priority tickets</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-amber-100">
            <TabsTrigger value="users" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              User Management
            </TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Support Tickets
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Activity Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Filters */}
            <Card className="border-amber-200">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />
                      <Input
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-amber-200 focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 border-amber-200">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                    <SelectTrigger className="w-48 border-amber-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subscriptions</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900">Users ({filteredUsers.length})</CardTitle>
                <CardDescription>Comprehensive user account management and monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="text-amber-800">User</TableHead>
                      <TableHead className="text-amber-800">Contact</TableHead>
                      <TableHead className="text-amber-800">Status</TableHead>
                      <TableHead className="text-amber-800">Subscription</TableHead>
                      <TableHead className="text-amber-800">Activity</TableHead>
                      <TableHead className="text-amber-800">Support</TableHead>
                      <TableHead className="text-amber-800">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-amber-900">{user.name}</p>
                            <p className="text-sm text-amber-600 flex items-center mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {user.location}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm flex items-center text-amber-700">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </p>
                            <p className="text-sm flex items-center text-amber-700">
                              <Phone className="w-3 h-3 mr-1" />
                              {user.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={user.subscription === "Pro" ? "default" : "secondary"}>
                              {user.subscription}
                            </Badge>
                            <p className="text-xs text-amber-600">${user.totalSpent} spent</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm text-amber-700 flex items-center">
                              <Activity className="w-3 h-3 mr-1" />
                              {user.storiesCount} stories
                            </p>
                            <p className="text-xs text-amber-600 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {user.lastActive}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={user.supportTickets > 0 ? "destructive" : "secondary"}>
                              {user.supportTickets} tickets
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedUser(user)}
                                  className="border-amber-200 hover:bg-amber-50"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-amber-900">
                                    User Profile - {selectedUser?.name}
                                  </DialogTitle>
                                  <DialogDescription>Complete user information and account details</DialogDescription>
                                </DialogHeader>
                                {selectedUser && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <div>
                                          <label className="text-sm font-medium text-amber-800">
                                            Personal Information
                                          </label>
                                          <div className="mt-2 space-y-2">
                                            <p className="text-amber-900">
                                              <strong>Name:</strong> {selectedUser.name}
                                            </p>
                                            <p className="text-amber-900">
                                              <strong>Email:</strong> {selectedUser.email}
                                            </p>
                                            <p className="text-amber-900">
                                              <strong>Phone:</strong> {selectedUser.phone}
                                            </p>
                                            <p className="text-amber-900">
                                              <strong>Location:</strong> {selectedUser.location}
                                            </p>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-amber-800">Account Status</label>
                                          <div className="mt-2 space-y-2">
                                            <div>{getStatusBadge(selectedUser.status)}</div>
                                            <p className="text-amber-900">
                                              <strong>Join Date:</strong> {selectedUser.joinDate}
                                            </p>
                                            <p className="text-amber-900">
                                              <strong>Last Login:</strong> {selectedUser.lastLogin}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-4">
                                        <div>
                                          <label className="text-sm font-medium text-amber-800">
                                            Subscription & Usage
                                          </label>
                                          <div className="mt-2 space-y-2">
                                            <p className="text-amber-900">
                                              <strong>Plan:</strong> {selectedUser.subscription}
                                            </p>
                                            <p className="text-amber-900">
                                              <strong>Stories Created:</strong> {selectedUser.storiesCount}
                                            </p>
                                            <p className="text-amber-900">
                                              <strong>Total Spent:</strong> ${selectedUser.totalSpent}
                                            </p>
                                            <p className="text-amber-900">
                                              <strong>Support Tickets:</strong> {selectedUser.supportTickets}
                                            </p>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-amber-800">Technical Info</label>
                                          <div className="mt-2 space-y-2">
                                            <p className="text-amber-900">
                                              <strong>Device:</strong> {selectedUser.deviceInfo}
                                            </p>
                                            <p className="text-amber-900">
                                              <strong>IP Address:</strong> {selectedUser.ipAddress}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-amber-800">Permissions</label>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {selectedUser.permissions.map((permission) => (
                                          <Badge key={permission} variant="outline">
                                            {permission.replace("_", " ")}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-amber-800">Admin Notes</label>
                                      <div className="mt-2">
                                        <Textarea
                                          value={selectedUser.notes}
                                          readOnly
                                          className="border-amber-200 bg-amber-50"
                                          rows={3}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-amber-200 hover:bg-amber-50 bg-transparent"
                                >
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleUserAction("edit", user.id)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUserAction("message", user.id)}>
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.status === "active" ? (
                                  <DropdownMenuItem
                                    onClick={() => handleUserAction("suspend", user.id)}
                                    className="text-red-600"
                                  >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Suspend Account
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleUserAction("activate", user.id)}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Activate Account
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900">Support Tickets ({supportTickets.length})</CardTitle>
                <CardDescription>Customer support requests and issue tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-amber-800">Ticket</TableHead>
                      <TableHead className="text-amber-800">Customer</TableHead>
                      <TableHead className="text-amber-800">Status</TableHead>
                      <TableHead className="text-amber-800">Priority</TableHead>
                      <TableHead className="text-amber-800">Category</TableHead>
                      <TableHead className="text-amber-800">Created</TableHead>
                      <TableHead className="text-amber-800">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supportTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-amber-900">#{ticket.id}</p>
                            <p className="text-sm text-amber-600">{ticket.subject}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-amber-900">{ticket.userName}</p>
                        </TableCell>
                        <TableCell>{getTicketStatusBadge(ticket.status)}</TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-amber-700 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {ticket.createdDate}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedTicket(ticket)}
                                className="border-amber-200 hover:bg-amber-50"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-amber-900">
                                  Support Ticket #{selectedTicket?.id}
                                </DialogTitle>
                                <DialogDescription>Customer support request details and response</DialogDescription>
                              </DialogHeader>
                              {selectedTicket && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-amber-800">Customer</label>
                                      <p className="text-amber-900">{selectedTicket.userName}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-amber-800">Status</label>
                                      <div className="mt-1">{getTicketStatusBadge(selectedTicket.status)}</div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-amber-800">Priority</label>
                                      <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-amber-800">Category</label>
                                      <p className="text-amber-900">{selectedTicket.category}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-amber-800">Subject</label>
                                    <p className="text-amber-900">{selectedTicket.subject}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-amber-800">Description</label>
                                    <p className="text-amber-900 bg-amber-50 p-3 rounded-lg">
                                      {selectedTicket.description}
                                    </p>
                                  </div>
                                  <div>
                                    <Label htmlFor="response">Your Response</Label>
                                    <Textarea
                                      id="response"
                                      value={ticketResponse}
                                      onChange={(e) => setTicketResponse(e.target.value)}
                                      placeholder="Type your response to the customer..."
                                      className="border-amber-200 mt-2"
                                      rows={4}
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setShowSupportDialog(false)
                                        setSelectedTicket(null)
                                        setTicketResponse("")
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={handleTicketResponse}
                                      disabled={!ticketResponse.trim() || isLoading}
                                      className="bg-amber-600 hover:bg-amber-700"
                                    >
                                      {isLoading ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                      ) : (
                                        <Send className="w-4 h-4 mr-2" />
                                      )}
                                      Send Response
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Recent User Activity</CardTitle>
                  <CardDescription>Latest user actions and system events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        user: "John Smith",
                        action: "Created new story",
                        time: "2 minutes ago",
                        type: "create",
                      },
                      {
                        user: "Sarah Johnson",
                        action: "Updated profile",
                        time: "15 minutes ago",
                        type: "update",
                      },
                      {
                        user: "Mike Wilson",
                        action: "Account suspended",
                        time: "2 hours ago",
                        type: "admin",
                      },
                      {
                        user: "Emily Davis",
                        action: "Last login",
                        time: "1 day ago",
                        type: "login",
                      },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              activity.type === "create"
                                ? "bg-green-500"
                                : activity.type === "update"
                                  ? "bg-blue-500"
                                  : activity.type === "upgrade"
                                    ? "bg-purple-500"
                                    : activity.type === "admin"
                                      ? "bg-red-500"
                                      : "bg-gray-500"
                            }`}
                          />
                          <div>
                            <p className="font-medium text-amber-900">{activity.user}</p>
                            <p className="text-sm text-amber-600">{activity.action}</p>
                          </div>
                        </div>
                        <span className="text-xs text-amber-600">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">System Alerts</CardTitle>
                  <CardDescription>Important notifications and warnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        type: "warning",
                        message: "High support ticket volume detected",
                        time: "5 minutes ago",
                      },
                      {
                        type: "info",
                        message: "Weekly user report generated",
                        time: "1 hour ago",
                      },
                      {
                        type: "success",
                        message: "System backup completed successfully",
                        time: "3 hours ago",
                      },
                      {
                        type: "error",
                        message: "Failed login attempts from suspicious IP",
                        time: "6 hours ago",
                      },
                    ].map((alert, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            alert.type === "warning"
                              ? "bg-yellow-500"
                              : alert.type === "info"
                                ? "bg-blue-500"
                                : alert.type === "success"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-amber-900">{alert.message}</p>
                          <span className="text-xs text-amber-600">{alert.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
