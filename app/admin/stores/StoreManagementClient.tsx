"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Store, Plus, Edit, Trash2, MapPin, Phone, Mail, Package, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import BackButton from "@/components/back-button"

interface StoreData {
  id: string
  name: string
  location: string
  contact_person?: string
  phone?: string
  email?: string
  address?: any
  current_inventory: number
  max_capacity?: number
  store_type: "retail" | "warehouse" | "distribution"
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function StoreManagementClient() {
  const [stores, setStores] = useState<StoreData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<StoreData | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    contact_person: "",
    phone: "",
    email: "",
    max_capacity: "",
    store_type: "retail" as "retail" | "warehouse" | "distribution",
  })

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/stores")
      const data = await response.json()

      if (response.ok) {
        setStores(data.stores || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to load stores",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching stores:", error)
      toast({
        title: "Error",
        description: "Failed to load stores",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (store?: StoreData) => {
    if (store) {
      setEditingStore(store)
      setFormData({
        name: store.name,
        location: store.location,
        contact_person: store.contact_person || "",
        phone: store.phone || "",
        email: store.email || "",
        max_capacity: store.max_capacity?.toString() || "",
        store_type: store.store_type,
      })
    } else {
      setEditingStore(null)
      setFormData({
        name: "",
        location: "",
        contact_person: "",
        phone: "",
        email: "",
        max_capacity: "",
        store_type: "retail",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSaveStore = async () => {
    if (!formData.name || !formData.location) {
      toast({
        title: "Validation Error",
        description: "Store name and location are required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const url = editingStore ? `/api/admin/stores/${editingStore.id}` : "/api/admin/stores"
      const method = editingStore ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          max_capacity: formData.max_capacity ? Number.parseInt(formData.max_capacity) : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Store ${editingStore ? "updated" : "created"} successfully`,
        })
        setIsDialogOpen(false)
        fetchStores()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save store",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving store:", error)
      toast({
        title: "Error",
        description: "Failed to save store",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteStore = async (storeId: string) => {
    if (!confirm("Are you sure you want to delete this store? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/stores/${storeId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Store deleted successfully",
        })
        fetchStores()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete store",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting store:", error)
      toast({
        title: "Error",
        description: "Failed to delete store",
        variant: "destructive",
      })
    }
  }

  const getStoreTypeBadge = (type: string) => {
    const config = {
      retail: { color: "bg-blue-100 text-blue-700", label: "Retail" },
      warehouse: { color: "bg-purple-100 text-purple-700", label: "Warehouse" },
      distribution: { color: "bg-orange-100 text-orange-700", label: "Distribution" },
    }
    const c = config[type as keyof typeof config] || config.retail
    return <Badge className={c.color}>{c.label}</Badge>
  }

  const stats = {
    total: stores.length,
    active: stores.filter((s) => s.is_active).length,
    totalInventory: stores.reduce((sum, s) => sum + s.current_inventory, 0),
    totalCapacity: stores.reduce((sum, s) => sum + (s.max_capacity || 0), 0),
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5d5c8] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href="/admin/dashboard" label="Back to Dashboard" />
            <div>
              <h1 className="text-xl font-bold text-[#2c2c2c]">Store Management</h1>
              <p className="text-sm text-[#6b5b47]">Manage retail locations and inventory distribution</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Store
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingStore ? "Edit Store" : "Add New Store"}</DialogTitle>
                <DialogDescription>
                  {editingStore ? "Update store information" : "Create a new store location"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Store Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Downtown Sports"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="123 Main St, City, State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="store@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_type">Store Type</Label>
                  <Select
                    value={formData.store_type}
                    onValueChange={(value: any) => setFormData({ ...formData, store_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="distribution">Distribution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="max_capacity">Maximum Capacity (QR Codes)</Label>
                  <Input
                    id="max_capacity"
                    type="number"
                    value={formData.max_capacity}
                    onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                    placeholder="500"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveStore} disabled={isSaving} className="bg-[#c44c3a] hover:bg-[#a63d2e]">
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{editingStore ? "Update" : "Create"} Store</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">Total Stores</CardTitle>
              <Store className="h-4 w-4 text-[#c44c3a]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c2c2c]">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">Active Stores</CardTitle>
              <Store className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">Total Inventory</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalInventory}</div>
            </CardContent>
          </Card>

          <Card className="border-[#e5d5c8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#6b5b47]">Total Capacity</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalCapacity}</div>
            </CardContent>
          </Card>
        </div>

        {/* Stores Table */}
        <Card className="border-[#e5d5c8]">
          <CardHeader>
            <CardTitle className="text-[#2c2c2c]">All Stores</CardTitle>
            <CardDescription className="text-[#6b5b47]">Manage your retail locations and warehouses</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-[#c44c3a]" />
              </div>
            ) : stores.length === 0 ? (
              <div className="text-center py-8 text-[#6b5b47]">
                <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No stores yet. Add your first store to get started.</p>
              </div>
            ) : (
              <div className="border border-[#e5d5c8] rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Inventory</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stores.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell className="font-medium">{store.name}</TableCell>
                        <TableCell>{getStoreTypeBadge(store.store_type)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-3 h-3 text-[#6b5b47]" />
                            {store.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {store.contact_person && <div>{store.contact_person}</div>}
                            {store.phone && (
                              <div className="flex items-center gap-1 text-[#6b5b47]">
                                <Phone className="w-3 h-3" />
                                {store.phone}
                              </div>
                            )}
                            {store.email && (
                              <div className="flex items-center gap-1 text-[#6b5b47]">
                                <Mail className="w-3 h-3" />
                                {store.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{store.current_inventory}</span>
                        </TableCell>
                        <TableCell>
                          {store.max_capacity ? (
                            <div className="space-y-1">
                              <div className="text-sm">{store.max_capacity}</div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-[#c44c3a] h-1.5 rounded-full"
                                  style={{
                                    width: `${Math.min((store.current_inventory / store.max_capacity) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={store.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                          >
                            {store.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(store)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStore(store.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
