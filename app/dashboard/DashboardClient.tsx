"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardSuspense } from "@/components/ui/suspense-wrappers"
import { createClient } from "@/lib/supabase/client"
import {
  Edit3,
  Eye,
  QrCode,
  BarChart3,
  Settings,
  Camera,
  Share2,
  TrendingUp,
  Trophy,
  Fish,
  Plane,
  Palette,
  Lock,
  Globe,
} from "lucide-react"

const themeConfig = {
  hunting: {
    name: "Hunting",
    icon: Trophy,
    colors: "theme-hunting",
    bgGradient: "from-gray-600 to-gray-700",
    accentColor: "bg-orange-500",
  },
  fishing: {
    name: "Fishing",
    icon: Fish,
    colors: "theme-fishing",
    bgGradient: "from-emerald-600 to-emerald-700",
    accentColor: "bg-teal-500",
  },
  sports: {
    name: "Sports",
    icon: Trophy,
    colors: "theme-sports",
    bgGradient: "from-orange-600 to-orange-700",
    accentColor: "bg-yellow-100",
  },
  vacation: {
    name: "Travel",
    icon: Plane,
    colors: "theme-vacation",
    bgGradient: "from-blue-600 to-blue-700",
    accentColor: "bg-blue-500",
  },
  custom: {
    name: "Custom",
    icon: Palette,
    colors: "theme-custom",
    bgGradient: "from-purple-600 to-purple-700",
    accentColor: "bg-purple-500",
  },
}

const CollectionCard = ({ collection }: { collection: any }) => {
  const theme = themeConfig[collection.theme as keyof typeof themeConfig] || themeConfig.custom
  const IconComponent = theme.icon

  return (
    <Card className={`border-[#e5d5c8] overflow-hidden hover:shadow-lg transition-shadow ${theme.colors}`}>
      {/* Collection Header with Theme Colors */}
      <div className={`bg-gradient-to-r ${theme.bgGradient} p-4 text-white relative`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <IconComponent className="w-5 h-5" />
            <Badge className={`${theme.accentColor} text-white border-0`}>{theme.name}</Badge>
          </div>
          <div className="flex items-center gap-1">
            {collection.isPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
          </div>
        </div>
        <h3 className="font-bold text-lg mb-1 text-balance">{collection.title}</h3>
        <p className="text-sm text-white/80 text-pretty">{collection.description || "No description"}</p>
      </div>

      {/* Collection Cover Image */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={collection.coverImage || "/placeholder.svg?height=128&width=400"}
          alt={collection.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Collection Stats */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-sm text-[#6b5b47] mb-3">
          <span>{collection.memoryCount || 0} memories</span>
          <span>{collection.viewCount || 0} views</span>
          <span>{collection.lastUpdated}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-[#c44c3a] hover:bg-[#a63d2e] text-white" asChild>
            <Link href={`/dashboard/collections/${collection.slug}`}>
              <Edit3 className="w-3 h-3 mr-1" />
              Manage
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="border-[#e5d5c8] bg-transparent" asChild>
            <Link href={`/story/${collection.slug}`}>
              <Eye className="w-3 h-3 mr-1" />
              View
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="border-[#e5d5c8] bg-transparent">
            <Share2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const StatsCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => (
  <Card className="border-[#e5d5c8]">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#6b5b47]">{label}</p>
          <p className="text-2xl font-bold text-[#2c2c2c]">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

function DashboardContent() {
  const [activeTab, setActiveTab] = useState("collections")
  const [user, setUser] = useState<any>(null)
  const [collections, setCollections] = useState<any[]>([])
  const [stats, setStats] = useState({ totalCollections: 0, totalMemories: 0, totalViews: 0, qrScans: 0 })
  const supabase = createClient()

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Get current user
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          window.location.href = "/auth/login"
          return
        }

        // Get user profile
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()

        setUser(profile || { email: authUser.email, full_name: "User" })

        // Get user's QR slugs/collections
        const { data: slugs } = await supabase
          .from("qr_slugs")
          .select("*")
          .eq("owner_id", authUser.id)
          .eq("is_active", true)
          .order("updated_at", { ascending: false })

        const collectionsData =
          slugs?.map((slug) => ({
            id: slug.id,
            title: slug.title || slug.slug,
            theme: "custom",
            description: slug.description,
            slug: slug.slug,
            memoryCount: 0,
            viewCount: slug.views_count || 0,
            lastUpdated: new Date(slug.updated_at).toLocaleDateString(),
            isPrivate: !slug.is_claimed,
            coverImage: null,
          })) || []

        setCollections(collectionsData)

        // Calculate stats
        const totalViews = slugs?.reduce((sum, slug) => sum + (slug.views_count || 0), 0) || 0

        setStats({
          totalCollections: slugs?.length || 0,
          totalMemories: 0,
          totalViews,
          qrScans: totalViews,
        })
      } catch (error) {
        console.error("[v0] Error loading dashboard data:", error)
      }
    }

    loadDashboardData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5d5c8] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2c2c2c]">
              Hello {user?.full_name || "there"}, ready to add to your story?
            </h1>
            <p className="text-[#6b5b47] mt-1">Welcome back to your dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-[#e5d5c8] bg-transparent" asChild>
              <Link href="/dashboard/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="border-[#e5d5c8] bg-transparent" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard icon={QrCode} label="Tags" value={stats.totalCollections} color="bg-[#c44c3a]" />
          <StatsCard icon={Camera} label="Total Memories" value={stats.totalMemories} color="bg-[#8b7355]" />
          <StatsCard icon={Eye} label="Total Views" value={stats.totalViews} color="bg-[#6b5b47]" />
          <StatsCard icon={TrendingUp} label="QR Scans" value={stats.qrScans} color="bg-[#2c2c2c]" />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white border border-[#e5d5c8]">
            <TabsTrigger
              value="collections"
              className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white"
            >
              My Tags
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            {collections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            ) : (
              <Card className="border-[#e5d5c8]">
                <CardContent className="p-12 text-center">
                  <QrCode className="w-16 h-16 text-[#c44c3a] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#2c2c2c] mb-2">No Collections Yet</h3>
                  <p className="text-[#6b5b47] mb-6">Start by claiming a QR code or creating your first collection</p>
                  <Button className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white" asChild>
                    <Link href="/claim">Claim a QR Code</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">Analytics</CardTitle>
                <CardDescription className="text-[#6b5b47]">Track your story performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-[#f5f0e8] rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-[#c44c3a] mx-auto mb-2" />
                    <p className="text-[#6b5b47]">Analytics coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">Account Settings</CardTitle>
                <CardDescription className="text-[#6b5b47]">Manage your account and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white" asChild>
                  <Link href="/dashboard/settings">Go to Settings</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function DashboardClient() {
  return (
    <DashboardSuspense>
      <DashboardContent />
    </DashboardSuspense>
  )
}
