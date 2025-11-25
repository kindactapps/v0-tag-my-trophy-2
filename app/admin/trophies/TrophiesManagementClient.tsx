"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { NewAdminGuard } from "@/components/admin/new-admin-guard"
import { useNewAdminAuth } from "@/lib/new-admin-auth"
import { createClient } from "@/lib/supabase/client"
import { RefreshCw, Search, Eye, Trash2, ArrowLeft, Trophy, Fish, Target, Mountain, Edit2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface TrophyTag {
  id: string
  qr_slug_id: string
  tagged_by: string
  trophy_type: string
  trophy_details: {
    species?: string
    weight?: string
    location?: string
    date?: string
    notes?: string
    [key: string]: any
  }
  location_data: {
    latitude?: number
    longitude?: number
    address?: string
    [key: string]: any
  }
  tagged_at: string
  created_at: string
  slug?: string
  user_email?: string
}

const TROPHY_TYPES = [
  { value: "hunting", label: "Hunting", icon: Target },
  { value: "fishing", label: "Fishing", icon: Fish },
  { value: "sports", label: "Sports", icon: Trophy },
  { value: "hiking", label: "Hiking", icon: Mountain },
  { value: "other", label: "Other", icon: Trophy },
]

export default function TrophiesManagementClient() {
  const { logout } = useNewAdminAuth()
  const router = useRouter()

  const [trophies, setTrophies] = useState<TrophyTag[]>([])
  const [filteredTrophies, setFilteredTrophies] = useState<TrophyTag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [selectedTrophy, setSelectedTrophy] = useState<TrophyTag | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    trophy_type: "",
    species: "",
    weight: "",
    location: "",
    date: "",
    notes: "",
  })

  useEffect(() => {
    fetchTrophies()
  }, [])

  useEffect(() => {
    filterTrophies()
  }, [searchTerm, filterType, trophies])

  const fetchTrophies = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()

      const { data: trophyData, error: trophyError } = await supabase
        .from("trophy_tags")
        .select(`
          *,
          qr_slugs!inner(slug),
          profiles!trophy_tags_tagged_by_fkey(email)
        `)
        .order("created_at", { ascending: false })

      if (trophyError) {
        console.error("[v0] Error fetching trophies:", trophyError)
        return
      }

      const transformedTrophies: TrophyTag[] = (trophyData || []).map((trophy: any) => ({
        id: trophy.id,
        qr_slug_id: trophy.qr_slug_id,
        tagged_by: trophy.tagged_by,
        trophy_type: trophy.trophy_type || "other",
        trophy_details: trophy.trophy_details || {},
        location_data: trophy.location_data || {},
        tagged_at: trophy.tagged_at,
        created_at: trophy.created_at,
        slug: trophy.qr_slugs?.slug,
        user_email: trophy.profiles?.email,
      }))

      setTrophies(transformedTrophies)

      const newStats = {
        total: transformedTrophies.length,
        hunting: transformedTrophies.filter((t) => t.trophy_type === "hunting").length,
        fishing: transformedTrophies.filter((t) => t.trophy_type === "fishing").length,
        sports: transformedTrophies.filter((t) => t.trophy_type === "sports").length,
        hiking: transformedTrophies.filter((t) => t.trophy_type === "hiking").length,
        other: transformedTrophies.filter((t) => t.trophy_type === "other").length,
      }
      setStats(newStats)
    } catch (error) {
      console.error("[v0] Error fetching trophies:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTrophies = () => {
    let filtered = [...trophies]

    if (filterType !== "all") {
      filtered = filtered.filter((trophy) => trophy.trophy_type === filterType)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (trophy) =>
          trophy.slug?.toLowerCase().includes(term) ||
          trophy.user_email?.toLowerCase().includes(term) ||
          trophy.trophy_type.toLowerCase().includes(term) ||
          trophy.trophy_details.species?.toLowerCase().includes(term) ||
          trophy.trophy_details.location?.toLowerCase().includes(term),
      )
    }

    setFilteredTrophies(filtered)
  }

  const handleViewTrophy = (trophy: TrophyTag) => {
    setSelectedTrophy(trophy)
    setIsViewDialogOpen(true)
  }

  const handleDeleteClick = (trophy: TrophyTag) => {
    setSelectedTrophy(trophy)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedTrophy) return

    try {
      setIsDeleting(true)
      const supabase = createClient()

      const { error } = await supabase.from("trophy_tags").delete().eq("id", selectedTrophy.id)

      if (error) {
        console.error("[v0] Error deleting trophy:", error)
        alert("Failed to delete trophy. Please try again.")
        return
      }

      await fetchTrophies()
      setIsDeleteDialogOpen(false)
      setSelectedTrophy(null)
    } catch (error) {
      console.error("[v0] Error deleting trophy:", error)
      alert("Failed to delete trophy. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditClick = (trophy: TrophyTag) => {
    setSelectedTrophy(trophy)
    setEditForm({
      trophy_type: trophy.trophy_type || "",
      species: trophy.trophy_details.species || "",
      weight: trophy.trophy_details.weight || "",
      location: trophy.trophy_details.location || trophy.location_data.address || "",
      date: trophy.trophy_details.date || "",
      notes: trophy.trophy_details.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!selectedTrophy) return

    try {
      setIsEditing(true)
      const supabase = createClient()

      const updatedTrophyDetails = {
        ...selectedTrophy.trophy_details,
        species: editForm.species || undefined,
        weight: editForm.weight || undefined,
        location: editForm.location || undefined,
        date: editForm.date || undefined,
        notes: editForm.notes || undefined,
      }

      Object.keys(updatedTrophyDetails).forEach(
        (key) => updatedTrophyDetails[key] === undefined && delete updatedTrophyDetails[key],
      )

      const { error } = await supabase
        .from("trophy_tags")
        .update({
          trophy_type: editForm.trophy_type,
          trophy_details: updatedTrophyDetails,
        })
        .eq("id", selectedTrophy.id)

      if (error) {
        console.error("[v0] Error updating trophy:", error)
        alert("Failed to update trophy. Please try again.")
        return
      }

      await fetchTrophies()
      setIsEditDialogOpen(false)
      setSelectedTrophy(null)
    } catch (error) {
      console.error("[v0] Error updating trophy:", error)
      alert("Failed to update trophy. Please try again.")
    } finally {
      setIsEditing(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = "/auth/admin"
    } catch (error) {
      console.error("Logout error:", error)
      window.location.href = "/auth/admin"
    }
  }

  const getTrophyIcon = (type: string) => {
    const trophyType = TROPHY_TYPES.find((t) => t.value === type)
    return trophyType ? trophyType.icon : Trophy
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const [stats, setStats] = useState({
    total: 0,
    hunting: 0,
    fishing: 0,
    sports: 0,
    hiking: 0,
    other: 0,
  })

  return (
    <NewAdminGuard>
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="bg-transparent">
                <Link href="/admin/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Manage Trophies</h1>
                <p className="text-sm text-muted-foreground">View and manage trophy tags</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                {stats.total} Total Trophies
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground bg-transparent"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Trophies</CardTitle>
                <Trophy className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Hunting</CardTitle>
                <Target className="w-4 h-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.hunting}</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Fishing</CardTitle>
                <Fish className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.fishing}</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sports</CardTitle>
                <Trophy className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.sports}</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Hiking</CardTitle>
                <Mountain className="w-4 h-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.hiking}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Trophy Tags</CardTitle>
              <CardDescription>Search and filter trophy tags in the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="sr-only">
                    Search trophies
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by slug, email, species, location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Label htmlFor="filter-type" className="sr-only">
                    Filter by type
                  </Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger id="filter-type">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="hunting">Hunting</SelectItem>
                      <SelectItem value="fishing">Fishing</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="hiking">Hiking</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={fetchTrophies} variant="outline" className="bg-transparent">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading trophies...</p>
                  </div>
                </div>
              ) : filteredTrophies.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No trophies found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {searchTerm || filterType !== "all"
                      ? "Try adjusting your search or filters"
                      : "Trophy tags will appear here once users start tagging"}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>QR Slug</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Tagged At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrophies.map((trophy) => {
                        const Icon = getTrophyIcon(trophy.trophy_type)
                        return (
                          <TableRow key={trophy.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                <Badge variant="outline" className="capitalize">
                                  {trophy.trophy_type}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">{trophy.slug || "N/A"}</code>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{trophy.user_email || "Unknown"}</span>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {trophy.trophy_details.species && (
                                  <div>
                                    <span className="font-medium">Species:</span> {trophy.trophy_details.species}
                                  </div>
                                )}
                                {trophy.trophy_details.weight && (
                                  <div>
                                    <span className="font-medium">Weight:</span> {trophy.trophy_details.weight}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {trophy.trophy_details.location || trophy.location_data.address || "N/A"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(trophy.tagged_at || trophy.created_at)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewTrophy(trophy)}
                                  className="bg-transparent"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(trophy)}
                                  className="bg-transparent"
                                  title="Edit trophy"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(trophy)}
                                  className="text-destructive hover:text-destructive bg-transparent"
                                  title="Delete trophy"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Trophy Details</DialogTitle>
              <DialogDescription>View detailed information about this trophy tag</DialogDescription>
            </DialogHeader>
            {selectedTrophy && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Trophy Type</Label>
                    <p className="text-sm font-medium capitalize mt-1">{selectedTrophy.trophy_type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">QR Slug</Label>
                    <p className="text-sm font-mono mt-1">{selectedTrophy.slug || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">User Email</Label>
                    <p className="text-sm mt-1">{selectedTrophy.user_email || "Unknown"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tagged At</Label>
                    <p className="text-sm mt-1">{formatDate(selectedTrophy.tagged_at || selectedTrophy.created_at)}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Trophy Details</Label>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    {Object.entries(selectedTrophy.trophy_details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                        <span className="text-sm">{String(value)}</span>
                      </div>
                    ))}
                    {Object.keys(selectedTrophy.trophy_details).length === 0 && (
                      <p className="text-sm text-muted-foreground">No additional details</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Location Data</Label>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    {Object.entries(selectedTrophy.location_data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                        <span className="text-sm">{String(value)}</span>
                      </div>
                    ))}
                    {Object.keys(selectedTrophy.location_data).length === 0 && (
                      <p className="text-sm text-muted-foreground">No location data</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="bg-transparent">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Trophy</DialogTitle>
              <DialogDescription>Update trophy information and details</DialogDescription>
            </DialogHeader>
            {selectedTrophy && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="edit-trophy-type">Trophy Type</Label>
                    <Select
                      value={editForm.trophy_type}
                      onValueChange={(value) => setEditForm({ ...editForm, trophy_type: value })}
                    >
                      <SelectTrigger id="edit-trophy-type">
                        <SelectValue placeholder="Select trophy type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TROPHY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-species">Species / Name</Label>
                    <Input
                      id="edit-species"
                      value={editForm.species}
                      onChange={(e) => setEditForm({ ...editForm, species: e.target.value })}
                      placeholder="e.g., White-tailed Deer, Bass"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-weight">Weight / Score</Label>
                    <Input
                      id="edit-weight"
                      value={editForm.weight}
                      onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                      placeholder="e.g., 180 lbs, 5.2 kg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="e.g., Colorado Rockies"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-date">Date</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="edit-notes">Notes</Label>
                    <Textarea
                      id="edit-notes"
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Additional notes about this trophy..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> Changes will be reflected immediately. The QR slug and user cannot be
                    changed.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isEditing}
                className="bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={handleEditSubmit} disabled={isEditing}>
                {isEditing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Trophy Tag</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this trophy tag? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedTrophy && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Type:</span> {selectedTrophy.trophy_type}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Slug:</span> {selectedTrophy.slug || "N/A"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">User:</span> {selectedTrophy.user_email || "Unknown"}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
                className="bg-transparent"
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Trophy"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </NewAdminGuard>
  )
}
