"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Download,
  RefreshCw,
  HardDrive,
  Star,
  MapPin,
  Calendar,
  Target,
  Zap,
} from "lucide-react"
import BackButton from "@/components/back-button"
import { toast } from "@/hooks/use-toast"

export default function AnalyticsClient() {
  const [timeRange, setTimeRange] = useState("30d")
  const [refreshing, setRefreshing] = useState(false)

  const businessMetrics = {
    totalRevenue: 5000,
    revenueChange: 12.5,
    totalOrders: 150,
    ordersChange: 8.3,
    activeUsers: 450,
    usersChange: -2.1,
    conversionRate: 3.2,
    conversionChange: 0.8,
    avgOrderValue: 36.32,
    avgOrderChange: 4.2,
    customerLifetimeValue: 127.45,
    churnRate: 2.8,
  }

  const revenueByTier = [
    { tier: "Basic", revenue: 1500, customers: 50, avgSpend: 30.0 },
    { tier: "Premium", revenue: 2000, customers: 40, avgSpend: 50.0 },
    { tier: "Pro", revenue: 1500, customers: 20, avgSpend: 75.0 },
  ]

  const acquisitionData = [
    { month: "Jan", organic: 15, paid: 8, referral: 4, social: 3 },
    { month: "Feb", organic: 18, paid: 10, referral: 5, social: 4 },
    { month: "Mar", organic: 20, paid: 12, referral: 6, social: 5 },
  ]

  const storageMetrics = {
    totalUsed: 0.5, // TB
    totalCapacity: 5.0, // TB
    usageByType: [
      { type: "Images", usage: 0.25, percentage: 50 },
      { type: "Videos", usage: 0.15, percentage: 30 },
      { type: "Documents", usage: 0.08, percentage: 16 },
      { type: "Other", usage: 0.02, percentage: 4 },
    ],
    monthlyGrowth: 0.05, // TB per month
  }

  const geographicData = [
    { region: "North America", customers: 200, revenue: 2500, percentage: 50 },
    { region: "Europe", customers: 150, revenue: 1500, percentage: 30 },
    { region: "Asia Pacific", customers: 100, revenue: 1000, percentage: 20 },
  ]

  const useCaseData = [
    { category: "Sports Achievements", count: 50, growth: 15.2, engagement: 89 },
    { category: "Family Milestones", count: 40, growth: 22.1, engagement: 94 },
    { category: "Travel Memories", count: 30, growth: 8.7, engagement: 76 },
  ]

  const revenueData = [
    { month: "Jan", revenue: 1500, orders: 40, basic: 400, premium: 600, pro: 500 },
    { month: "Feb", revenue: 1700, orders: 45, basic: 450, premium: 700, pro: 550 },
    { month: "Mar", revenue: 1800, orders: 50, basic: 500, premium: 750, pro: 550 },
  ]

  const userActivityData = [
    { day: "Mon", visits: 80, signups: 4, conversions: 2 },
    { day: "Tue", visits: 90, signups: 5, conversions: 2 },
    { day: "Wed", visits: 95, signups: 6, conversions: 3 },
    { day: "Thu", visits: 85, signups: 5, conversions: 2 },
    { day: "Fri", visits: 100, signups: 7, conversions: 3 },
  ]

  const contentPerformanceData = [
    { category: "Sports", views: 150, engagement: 78, shares: 20 },
    { category: "Family", views: 120, engagement: 85, shares: 25 },
    { category: "Travel", views: 100, engagement: 72, shares: 15 },
  ]

  const deviceData = [
    { name: "Mobile", value: 65, color: "#8B4513" },
    { name: "Desktop", value: 28, color: "#D2691E" },
    { name: "Tablet", value: 7, color: "#F4A460" },
  ]

  const topStories = [
    { id: 1, title: "Championship Victory", views: 250, engagement: 89, author: "John Smith", category: "Sports" },
    { id: 2, title: "Family Reunion 2024", views: 200, engagement: 92, author: "Sarah Johnson", category: "Family" },
    { id: 3, title: "Mountain Adventure", views: 180, engagement: 76, author: "Mike Wilson", category: "Travel" },
  ]

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Data Refreshed",
        description: "Analytics data has been updated with the latest information.",
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh analytics data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const exportReport = async (type: string) => {
    try {
      // Simulate export functionality
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Export Started",
        description: `${type} report is being generated and will be downloaded shortly.`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <BackButton href="/admin/dashboard" label="Back to Dashboard" />
            <h1 className="text-3xl font-bold text-amber-900">Analytics & Business Intelligence</h1>
            <p className="text-amber-700 mt-1">Comprehensive insights, metrics, and performance tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleRefresh} disabled={refreshing} className="bg-amber-600 hover:bg-amber-700">
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          <Card className="border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">${businessMetrics.totalRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-amber-600 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />+{businessMetrics.revenueChange}% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Active Users</CardTitle>
              <Users className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{businessMetrics.activeUsers.toLocaleString()}</div>
              <div className="flex items-center text-xs text-red-600 mt-1">
                <TrendingDown className="w-3 h-3 mr-1" />
                {businessMetrics.usersChange}% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Avg Order Value</CardTitle>
              <Target className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">${businessMetrics.avgOrderValue}</div>
              <div className="flex items-center text-xs text-amber-600 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />+{businessMetrics.avgOrderChange}% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Conversion Rate</CardTitle>
              <Zap className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{businessMetrics.conversionRate}%</div>
              <div className="flex items-center text-xs text-amber-600 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />+{businessMetrics.conversionChange}% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Customer LTV</CardTitle>
              <Star className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">${businessMetrics.customerLifetimeValue}</div>
              <div className="flex items-center text-xs text-amber-600 mt-1">
                <span>Lifetime value</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Storage Used</CardTitle>
              <HardDrive className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{storageMetrics.totalUsed}TB</div>
              <div className="flex items-center text-xs text-amber-600 mt-1">
                <span>
                  {((storageMetrics.totalUsed / storageMetrics.totalCapacity) * 100).toFixed(1)}% of{" "}
                  {storageMetrics.totalCapacity}TB
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-amber-100">
            <TabsTrigger value="revenue" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Revenue
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Customers
            </TabsTrigger>
            <TabsTrigger value="usage" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Usage
            </TabsTrigger>
            <TabsTrigger value="geography" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Geography
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Content
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Revenue by Tier</CardTitle>
                  <CardDescription>Performance breakdown by subscription tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueByTier.map((tier) => (
                      <div key={tier.tier} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-amber-900">{tier.tier}</span>
                          <span className="text-sm text-amber-600">${tier.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-amber-600">
                          <span>{tier.customers} customers</span>
                          <span>Avg: ${tier.avgSpend}</span>
                        </div>
                        <Progress
                          value={(tier.revenue / revenueByTier.reduce((sum, t) => sum + t.revenue, 0)) * 100}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Revenue Trend by Tier</CardTitle>
                  <CardDescription>Monthly revenue breakdown by subscription level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F4A460" />
                      <XAxis dataKey="month" stroke="#8B4513" />
                      <YAxis stroke="#8B4513" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFF8DC",
                          border: "1px solid #D2691E",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="basic" stackId="1" stroke="#F4A460" fill="#F4A460" name="Basic" />
                      <Area
                        type="monotone"
                        dataKey="premium"
                        stackId="1"
                        stroke="#D2691E"
                        fill="#D2691E"
                        name="Premium"
                      />
                      <Area type="monotone" dataKey="pro" stackId="1" stroke="#8B4513" fill="#8B4513" name="Pro" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Customer Acquisition</CardTitle>
                  <CardDescription>New customer sources and channels</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={acquisitionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F4A460" />
                      <XAxis dataKey="month" stroke="#8B4513" />
                      <YAxis stroke="#8B4513" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFF8DC",
                          border: "1px solid #D2691E",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="organic" fill="#8B4513" name="Organic" />
                      <Bar dataKey="paid" fill="#D2691E" name="Paid Ads" />
                      <Bar dataKey="referral" fill="#F4A460" name="Referrals" />
                      <Bar dataKey="social" fill="#DEB887" name="Social" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">User Activity & Conversions</CardTitle>
                  <CardDescription>Daily engagement and conversion tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F4A460" />
                      <XAxis dataKey="day" stroke="#8B4513" />
                      <YAxis stroke="#8B4513" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFF8DC",
                          border: "1px solid #D2691E",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="visits" stroke="#D2691E" strokeWidth={2} name="Visits" />
                      <Line type="monotone" dataKey="signups" stroke="#8B4513" strokeWidth={2} name="Signups" />
                      <Line type="monotone" dataKey="conversions" stroke="#F4A460" strokeWidth={2} name="Conversions" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Storage Usage Breakdown</CardTitle>
                  <CardDescription>Storage consumption by content type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-amber-600">Total Usage</span>
                      <span className="font-medium text-amber-900">
                        {storageMetrics.totalUsed}TB / {storageMetrics.totalCapacity}TB
                      </span>
                    </div>
                    <Progress
                      value={(storageMetrics.totalUsed / storageMetrics.totalCapacity) * 100}
                      className="h-3 mb-6"
                    />
                    {storageMetrics.usageByType.map((type) => (
                      <div key={type.type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-amber-900">{type.type}</span>
                          <span className="text-sm text-amber-600">
                            {type.usage}TB ({type.percentage}%)
                          </span>
                        </div>
                        <Progress value={type.percentage} className="h-2" />
                      </div>
                    ))}
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                      <p className="text-sm text-amber-700">
                        <strong>Growth Rate:</strong> +{storageMetrics.monthlyGrowth}TB per month
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Popular Use Cases</CardTitle>
                  <CardDescription>Most common story categories and engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {useCaseData.map((useCase, index) => (
                      <div
                        key={useCase.category}
                        className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="bg-amber-200 text-amber-800">
                            #{index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium text-amber-900">{useCase.category}</p>
                            <p className="text-sm text-amber-600">{useCase.count} stories</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            <span className="text-sm font-medium text-green-600">+{useCase.growth}%</span>
                          </div>
                          <p className="text-xs text-amber-600">{useCase.engagement}% engagement</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geography" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Geographic Distribution</CardTitle>
                  <CardDescription>Customer base by region</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={geographicData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ region, percentage }) => `${region} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                      >
                        {geographicData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${30 + index * 40}, 60%, ${60 - index * 5}%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Regional Performance</CardTitle>
                  <CardDescription>Revenue and customer metrics by region</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {geographicData.map((region) => (
                      <div key={region.region} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-amber-600" />
                            <span className="font-medium text-amber-900">{region.region}</span>
                          </div>
                          <span className="text-sm text-amber-600">${region.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-amber-600">
                          <span>{region.customers} customers</span>
                          <span>{region.percentage}% of total</span>
                        </div>
                        <Progress value={region.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Content Performance</CardTitle>
                  <CardDescription>Views, engagement, and sharing by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={contentPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F4A460" />
                      <XAxis dataKey="category" stroke="#8B4513" />
                      <YAxis stroke="#8B4513" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFF8DC",
                          border: "1px solid #D2691E",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="views" fill="#D2691E" name="Views" />
                      <Bar dataKey="engagement" fill="#8B4513" name="Engagement %" />
                      <Bar dataKey="shares" fill="#F4A460" name="Shares" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Top Performing Stories</CardTitle>
                  <CardDescription>Most viewed and engaging content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topStories.map((story, index) => (
                      <div key={story.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="bg-amber-200 text-amber-800">
                            #{index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium text-amber-900">{story.title}</p>
                            <div className="flex items-center gap-2 text-sm text-amber-600">
                              <span>by {story.author}</span>
                              <Badge variant="outline" className="text-xs">
                                {story.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-amber-900">{story.views} views</p>
                          <p className="text-xs text-amber-600">{story.engagement}% engagement</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900">Device Usage</CardTitle>
                <CardDescription>User device preferences and behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900">Export Business Reports</CardTitle>
                <CardDescription>Generate comprehensive analytics and insights reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    onClick={() => exportReport("revenue-by-tier")}
                    className="bg-amber-600 hover:bg-amber-700 h-auto p-4 flex flex-col items-start gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span className="font-medium">Revenue by Tier</span>
                    </div>
                    <span className="text-xs opacity-90">Subscription performance and tier analysis</span>
                  </Button>

                  <Button
                    onClick={() => exportReport("customer-acquisition")}
                    className="bg-amber-600 hover:bg-amber-700 h-auto p-4 flex flex-col items-start gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span className="font-medium">Customer Acquisition</span>
                    </div>
                    <span className="text-xs opacity-90">Acquisition channels and conversion metrics</span>
                  </Button>

                  <Button
                    onClick={() => exportReport("storage-analytics")}
                    className="bg-amber-600 hover:bg-amber-700 h-auto p-4 flex flex-col items-start gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span className="font-medium">Storage Analytics</span>
                    </div>
                    <span className="text-xs opacity-90">Usage patterns and capacity planning</span>
                  </Button>

                  <Button
                    onClick={() => exportReport("geographic-analysis")}
                    className="bg-amber-600 hover:bg-amber-700 h-auto p-4 flex flex-col items-start gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span className="font-medium">Geographic Analysis</span>
                    </div>
                    <span className="text-xs opacity-90">Regional performance and expansion insights</span>
                  </Button>

                  <Button
                    onClick={() => exportReport("use-case-trends")}
                    className="bg-amber-600 hover:bg-amber-700 h-auto p-4 flex flex-col items-start gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span className="font-medium">Use Case Trends</span>
                    </div>
                    <span className="text-xs opacity-90">Popular categories and engagement patterns</span>
                  </Button>

                  <Button
                    onClick={() => exportReport("comprehensive-dashboard")}
                    className="bg-amber-600 hover:bg-amber-700 h-auto p-4 flex flex-col items-start gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span className="font-medium">Executive Dashboard</span>
                    </div>
                    <span className="text-xs opacity-90">Complete business intelligence report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900">Scheduled Reports</CardTitle>
                <CardDescription>Automated report delivery and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-900">Weekly Business Summary</p>
                        <p className="text-sm text-amber-600">Every Monday at 9:00 AM</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-900">Monthly Revenue by Tier</p>
                        <p className="text-sm text-amber-600">First day of each month</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-900">Quarterly Geographic Analysis</p>
                        <p className="text-sm text-amber-600">End of each quarter</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-900">Storage Capacity Planning</p>
                        <p className="text-sm text-amber-600">Monthly capacity alerts</p>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Paused</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
