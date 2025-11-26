"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import PrivacySettings from "@/components/privacy-settings"
import BackButton from "@/components/back-button"
import {
  Plus,
  Edit3,
  Eye,
  Share2,
  Camera,
  Video,
  FileText,
  Trash2,
  QrCode,
  BarChart3,
  MapPin,
  Clock,
  Trophy,
  Fish,
  Plane,
  Palette,
  Lock,
  Globe,
  Save,
} from "lucide-react"
import type { Collection as CollectionType, PrivacySettings as PrivacySettingsType } from "@/types"

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

export default function CollectionClient({ collection }: { collection: CollectionType }) {
  const [activeTab, setActiveTab] = useState("memories")
  const [isEditing, setIsEditing] = useState(false)
  const [editedCollection, setEditedCollection] = useState(collection)

  const theme = themeConfig[collection.theme as keyof typeof themeConfig]
  const IconComponent = theme.icon

  const handleSave = () => {
    // In a real app, this would save to the database
    console.log("Saving collection:", editedCollection)
    setIsEditing(false)
  }

  const handleDeleteMemory = (memoryId: number) => {
    // In a real app, this would delete from the database
    console.log("Deleting memory:", memoryId)
  }

  const handlePrivacySettingsChange = (settings: PrivacySettingsType) => {
    // In a real app, this would update the database
    console.log("Privacy settings changed:", settings)
  }

  return (
    <div className={`min-h-screen bg-[#f5f0e8] ${theme.colors}`}>
      {/* Header */}
      <header className="bg-white border-b border-[#e5d5c8] px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <BackButton href="/dashboard" label="Back to Dashboard" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg text-white ${theme.bgGradient.replace("from-", "bg-").split(" ")[0]}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <Badge className={`${theme.accentColor} text-white border-0`}>{theme.name} Collection</Badge>
                {collection.isPrivate ? (
                  <Badge variant="outline" className="border-gray-400 text-gray-600">
                    <Lock className="w-3 h-3 mr-1" />
                    Private
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-green-400 text-green-600">
                    <Globe className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-[#2c2c2c]">{collection.title}</h1>
              <p className="text-[#6b5b47]">{collection.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-[#e5d5c8] bg-transparent" asChild>
                <Link href={`/story/${collection.slug}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="border-[#e5d5c8] bg-transparent">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="border-[#e5d5c8] bg-transparent" asChild>
                <Link href="/dashboard/qr-code">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Collection Cover */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={collection.coverImage || "/placeholder.svg?height=192&width=1200"}
          alt={collection.title}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${theme.bgGradient} opacity-80`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-2">{collection.memories.length} Memories</h2>
            <p className="text-white/80">Capturing life's special moments</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Actions */}
        <Card className="mb-8 border-[#e5d5c8]">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <Button className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white" asChild>
                <Link href="/dashboard/upload">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Memory
                </Link>
              </Button>
              <Button variant="outline" className="border-[#e5d5c8] bg-transparent">
                <Camera className="w-4 h-4 mr-2" />
                Add Photos
              </Button>
              <Button variant="outline" className="border-[#e5d5c8] bg-transparent">
                <Video className="w-4 h-4 mr-2" />
                Add Video
              </Button>
              <Button variant="outline" className="border-[#e5d5c8] bg-transparent">
                <FileText className="w-4 h-4 mr-2" />
                Write Story
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white border border-[#e5d5c8]">
            <TabsTrigger value="memories" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
              Memories ({collection.memories.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
              Collection Settings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
              Privacy & Sharing
            </TabsTrigger>
          </TabsList>

          {/* Memories Tab */}
          <TabsContent value="memories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collection.memories.map((memory) => (
                <Card key={memory.id} className="border-[#e5d5c8] overflow-hidden">
                  {memory.type === "photo" && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={memory.url || "/placeholder.svg?height=192&width=300"}
                        alt={memory.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-[#c44c3a] text-white">
                        <Camera className="w-3 h-3 mr-1" />
                        Photo
                      </Badge>
                    </div>
                  )}

                  {memory.type === "video" && (
                    <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                      <Video className="w-12 h-12 text-gray-400" />
                      <Badge className="absolute top-2 right-2 bg-[#c44c3a] text-white">
                        <Video className="w-3 h-3 mr-1" />
                        Video
                      </Badge>
                    </div>
                  )}

                  {memory.type === "story" && (
                    <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 line-clamp-3">{memory.content?.substring(0, 100)}...</p>
                      </div>
                      <Badge className="absolute top-2 right-2 bg-[#c44c3a] text-white">
                        <FileText className="w-3 h-3 mr-1" />
                        Story
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-[#2c2c2c] mb-2 text-balance">{memory.title}</h3>
                    {memory.caption && <p className="text-sm text-[#6b5b47] mb-2 text-pretty">{memory.caption}</p>}
                    <div className="flex items-center gap-2 text-xs text-[#6b5b47] mb-3">
                      <Clock className="w-3 h-3" />
                      <span>{memory.date}</span>
                      {memory.location && (
                        <>
                          <span>•</span>
                          <MapPin className="w-3 h-3" />
                          <span>{memory.location}</span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 border-[#e5d5c8] bg-transparent">
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                        onClick={() => handleDeleteMemory(memory.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Memory Card */}
              <Card className="border-2 border-dashed border-[#e5d5c8] hover:border-[#c44c3a] transition-colors">
                <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                  <div className="w-16 h-16 bg-[#c44c3a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-[#c44c3a]" />
                  </div>
                  <h3 className="font-semibold text-[#2c2c2c] mb-2">Add New Memory</h3>
                  <p className="text-sm text-[#6b5b47] mb-4">Upload photos, videos, or write a story</p>
                  <Button className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white" asChild>
                    <Link href="/dashboard/upload">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">Collection Settings</CardTitle>
                <CardDescription className="text-[#6b5b47]">
                  Manage your collection details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-[#2c2c2c]">
                      Collection Title
                    </Label>
                    <Input
                      id="title"
                      value={isEditing ? editedCollection.title : collection.title}
                      onChange={(e) => setEditedCollection({ ...editedCollection, title: e.target.value })}
                      disabled={!isEditing}
                      className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-[#2c2c2c]">
                      Theme
                    </Label>
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg text-white ${theme.bgGradient.replace("from-", "bg-").split(" ")[0]}`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-[#2c2c2c]">{theme.name}</span>
                      <Badge className={`${theme.accentColor} text-white border-0 ml-auto`}>Current Theme</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#2c2c2c]">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={isEditing ? editedCollection.description : collection.description}
                    onChange={(e) => setEditedCollection({ ...editedCollection, description: e.target.value })}
                    disabled={!isEditing}
                    className="border-[#e5d5c8] focus:border-[#c44c3a] focus:ring-[#c44c3a] min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#2c2c2c]">QR Code Slug</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-[#2c2c2c] bg-[#f5f0e8] px-3 py-2 rounded border">
                      {collection.slug}
                    </code>
                    <Button variant="outline" size="sm" className="border-[#e5d5c8] bg-transparent">
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-[#6b5b47]">This cannot be changed once created</p>
                </div>

                <div className="flex gap-3 pt-4">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Collection
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleSave} className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setEditedCollection(collection)
                        }}
                        className="border-[#e5d5c8] bg-transparent"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="border-[#e5d5c8]">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#c44c3a]">127</div>
                  <div className="text-sm text-[#6b5b47]">Total Views</div>
                </CardContent>
              </Card>
              <Card className="border-[#e5d5c8]">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#c44c3a]">42</div>
                  <div className="text-sm text-[#6b5b47]">QR Scans</div>
                </CardContent>
              </Card>
              <Card className="border-[#e5d5c8]">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-[#c44c3a]">89%</div>
                  <div className="text-sm text-[#6b5b47]">Engagement</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">Collection Analytics</CardTitle>
                <CardDescription className="text-[#6b5b47]">Track how your collection is performing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-[#f5f0e8] rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-[#c44c3a] mx-auto mb-2" />
                    <p className="text-[#6b5b47]">Analytics chart would appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Sharing Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <PrivacySettings
              collectionId={collection.slug}
              isPrivate={collection.isPrivate}
              allowComments={true}
              allowSharing={true}
              requirePassword={false}
              onSettingsChange={handlePrivacySettingsChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
