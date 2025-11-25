"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NewAdminGuard } from "@/components/admin/new-admin-guard"
import { createClient } from "@/lib/supabase/client"
import { Plus, Edit, Copy, Trash2, Eye, EyeOff, RefreshCw, Palette, ArrowLeft, Settings } from "lucide-react"
import Link from "next/link"

interface Theme {
  id: string
  name: string
  description: string | null
  preview_image_url: string | null
  hero_background_url: string | null
  primary_color: string
  secondary_color: string
  text_color: string
  is_active: boolean
  display_order: number
  usage_count: number
  created_at: string
  updated_at: string
}

interface ThemeFormData {
  name: string
  description: string
  preview_image_url: string
  hero_background_url: string
  primary_color: string
  secondary_color: string
  text_color: string
  is_active: boolean
  display_order: number
}

interface CustomField {
  id: string
  theme_id: string
  field_name: string
  field_label: string
  field_type: "text" | "number" | "date" | "select" | "textarea"
  field_options?: string[]
  is_required: boolean
  display_order: number
  placeholder?: string
  created_at: string
  updated_at: string
}

const emptyFormData: ThemeFormData = {
  name: "",
  description: "",
  preview_image_url: "",
  hero_background_url: "",
  primary_color: "#4b5563",
  secondary_color: "#f97316",
  text_color: "#ffffff",
  is_active: true,
  display_order: 0,
}

export default function ThemeManagementClient() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null)
  const [deletingTheme, setDeletingTheme] = useState<Theme | null>(null)
  const [formData, setFormData] = useState<ThemeFormData>(emptyFormData)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterActive, setFilterActive] = useState<boolean | null>(null)
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [isFieldsDialogOpen, setIsFieldsDialogOpen] = useState(false)
  const [selectedThemeForFields, setSelectedThemeForFields] = useState<Theme | null>(null)
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [fieldFormData, setFieldFormData] = useState({
    field_name: "",
    field_label: "",
    field_type: "text" as const,
    field_options: [] as string[],
    is_required: false,
    display_order: 0,
    placeholder: "",
  })

  const supabase = createClient()

  useEffect(() => {
    fetchThemes()
  }, [])

  const fetchThemes = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("themes").select("*").order("display_order", { ascending: true })

      if (error) {
        console.error("[v0] Error fetching themes:", error)
        return
      }

      setThemes(data || [])
    } catch (error) {
      console.error("[v0] Error fetching themes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomFields = async (themeId: string) => {
    try {
      const { data, error } = await supabase
        .from("theme_custom_fields")
        .select("*")
        .eq("theme_id", themeId)
        .order("display_order", { ascending: true })

      if (error) {
        console.error("[v0] Error fetching custom fields:", error)
        return
      }

      setCustomFields(data || [])
    } catch (error) {
      console.error("[v0] Error fetching custom fields:", error)
    }
  }

  const handleCreate = () => {
    setEditingTheme(null)
    setFormData(emptyFormData)
    setIsDialogOpen(true)
  }

  const handleEdit = (theme: Theme) => {
    setEditingTheme(theme)
    setFormData({
      name: theme.name,
      description: theme.description || "",
      preview_image_url: theme.preview_image_url || "",
      hero_background_url: theme.hero_background_url || "",
      primary_color: theme.primary_color,
      secondary_color: theme.secondary_color,
      text_color: theme.text_color,
      is_active: theme.is_active,
      display_order: theme.display_order,
    })
    setIsDialogOpen(true)
  }

  const handleDuplicate = async (theme: Theme) => {
    try {
      const { error } = await supabase.from("themes").insert({
        name: `${theme.name} (Copy)`,
        description: theme.description,
        preview_image_url: theme.preview_image_url,
        hero_background_url: theme.hero_background_url,
        primary_color: theme.primary_color,
        secondary_color: theme.secondary_color,
        text_color: theme.text_color,
        is_active: false,
        display_order: theme.display_order + 1,
      })

      if (error) {
        console.error("[v0] Error duplicating theme:", error)
        alert("Failed to duplicate theme")
        return
      }

      await fetchThemes()
    } catch (error) {
      console.error("[v0] Error duplicating theme:", error)
      alert("Failed to duplicate theme")
    }
  }

  const handleDelete = (theme: Theme) => {
    setDeletingTheme(theme)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingTheme) return

    try {
      const { error } = await supabase.from("themes").delete().eq("id", deletingTheme.id)

      if (error) {
        console.error("[v0] Error deleting theme:", error)
        alert("Failed to delete theme")
        return
      }

      await fetchThemes()
      setIsDeleteDialogOpen(false)
      setDeletingTheme(null)
    } catch (error) {
      console.error("[v0] Error deleting theme:", error)
      alert("Failed to delete theme")
    }
  }

  const handleToggleActive = async (theme: Theme) => {
    try {
      const { error } = await supabase.from("themes").update({ is_active: !theme.is_active }).eq("id", theme.id)

      if (error) {
        console.error("[v0] Error toggling theme active status:", error)
        return
      }

      await fetchThemes()
    } catch (error) {
      console.error("[v0] Error toggling theme active status:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingTheme) {
        // Update existing theme
        const { error } = await supabase
          .from("themes")
          .update({
            name: formData.name,
            description: formData.description || null,
            preview_image_url: formData.preview_image_url || null,
            hero_background_url: formData.hero_background_url || null,
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color,
            text_color: formData.text_color,
            is_active: formData.is_active,
            display_order: formData.display_order,
          })
          .eq("id", editingTheme.id)

        if (error) {
          console.error("[v0] Error updating theme:", error)
          alert("Failed to update theme")
          return
        }
      } else {
        // Create new theme
        const { error } = await supabase.from("themes").insert({
          name: formData.name,
          description: formData.description || null,
          preview_image_url: formData.preview_image_url || null,
          hero_background_url: formData.hero_background_url || null,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          text_color: formData.text_color,
          is_active: formData.is_active,
          display_order: formData.display_order,
        })

        if (error) {
          console.error("[v0] Error creating theme:", error)
          alert("Failed to create theme")
          return
        }
      }

      await fetchThemes()
      setIsDialogOpen(false)
      setFormData(emptyFormData)
      setEditingTheme(null)
    } catch (error) {
      console.error("[v0] Error saving theme:", error)
      alert("Failed to save theme")
    }
  }

  const handleManageFields = async (theme: Theme) => {
    setSelectedThemeForFields(theme)
    await fetchCustomFields(theme.id)
    setIsFieldsDialogOpen(true)
  }

  const handleAddField = () => {
    setEditingField(null)
    setFieldFormData({
      field_name: "",
      field_label: "",
      field_type: "text",
      field_options: [],
      is_required: false,
      display_order: customFields.length,
      placeholder: "",
    })
    setIsAddFieldDialogOpen(true)
  }

  const handleEditField = (field: CustomField) => {
    setEditingField(field)
    setFieldFormData({
      field_name: field.field_name,
      field_label: field.field_label,
      field_type: field.field_type,
      field_options: field.field_options || [],
      is_required: field.is_required,
      display_order: field.display_order,
      placeholder: field.placeholder || "",
    })
    setIsAddFieldDialogOpen(true)
  }

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm("Are you sure you want to delete this field?")) return

    try {
      const { error } = await supabase.from("theme_custom_fields").delete().eq("id", fieldId)

      if (error) {
        console.error("[v0] Error deleting field:", error)
        alert("Failed to delete field")
        return
      }

      if (selectedThemeForFields) {
        await fetchCustomFields(selectedThemeForFields.id)
      }
    } catch (error) {
      console.error("[v0] Error deleting field:", error)
      alert("Failed to delete field")
    }
  }

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedThemeForFields) return

    try {
      const fieldData = {
        theme_id: selectedThemeForFields.id,
        field_name: fieldFormData.field_name,
        field_label: fieldFormData.field_label,
        field_type: fieldFormData.field_type,
        field_options: fieldFormData.field_type === "select" ? fieldFormData.field_options : null,
        is_required: fieldFormData.is_required,
        display_order: fieldFormData.display_order,
        placeholder: fieldFormData.placeholder || null,
      }

      if (editingField) {
        // Update existing field
        const { error } = await supabase.from("theme_custom_fields").update(fieldData).eq("id", editingField.id)

        if (error) {
          console.error("[v0] Error updating field:", error)
          alert("Failed to update field")
          return
        }
      } else {
        // Create new field
        const { error } = await supabase.from("theme_custom_fields").insert(fieldData)

        if (error) {
          console.error("[v0] Error creating field:", error)
          alert("Failed to create field")
          return
        }
      }

      await fetchCustomFields(selectedThemeForFields.id)
      setIsAddFieldDialogOpen(false)
      setFieldFormData({
        field_name: "",
        field_label: "",
        field_type: "text",
        field_options: [],
        is_required: false,
        display_order: 0,
        placeholder: "",
      })
      setEditingField(null)
    } catch (error) {
      console.error("[v0] Error saving field:", error)
      alert("Failed to save field")
    }
  }

  const filteredThemes = themes.filter((theme) => {
    const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterActive === null || theme.is_active === filterActive
    return matchesSearch && matchesFilter
  })

  return (
    <NewAdminGuard>
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Palette className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Theme Management</h1>
                  <p className="text-sm text-muted-foreground">Manage theme options for user profiles</p>
                </div>
              </div>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Theme
            </Button>
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search themes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterActive === null ? "default" : "outline"}
                    onClick={() => setFilterActive(null)}
                    size="sm"
                    className={filterActive === null ? "" : "bg-transparent"}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterActive === true ? "default" : "outline"}
                    onClick={() => setFilterActive(true)}
                    size="sm"
                    className={filterActive === true ? "" : "bg-transparent"}
                  >
                    Active
                  </Button>
                  <Button
                    variant={filterActive === false ? "default" : "outline"}
                    onClick={() => setFilterActive(false)}
                    size="sm"
                    className={filterActive === false ? "" : "bg-transparent"}
                  >
                    Inactive
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchThemes} className="bg-transparent">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Themes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Themes ({filteredThemes.length})</CardTitle>
              <CardDescription>Manage theme options that users can select for their profiles</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredThemes.length === 0 ? (
                <div className="text-center py-12">
                  <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No themes found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Preview</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Colors</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredThemes.map((theme) => (
                        <TableRow key={theme.id}>
                          <TableCell>
                            <div
                              className="w-16 h-10 rounded border"
                              style={{
                                background: `linear-gradient(to right, ${theme.primary_color}, ${theme.secondary_color})`,
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{theme.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{theme.description || "—"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <div
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: theme.primary_color }}
                                title={`Primary: ${theme.primary_color}`}
                              />
                              <div
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: theme.secondary_color }}
                                title={`Secondary: ${theme.secondary_color}`}
                              />
                              <div
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: theme.text_color }}
                                title={`Text: ${theme.text_color}`}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(theme)}
                              className="p-0 h-auto"
                            >
                              {theme.is_active ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-gray-300 text-gray-600">
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Inactive
                                </Badge>
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>{theme.usage_count} users</TableCell>
                          <TableCell>{theme.display_order}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleManageFields(theme)}
                                title="Manage Custom Fields"
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(theme)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDuplicate(theme)}>
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(theme)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
        </main>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTheme ? "Edit Theme" : "Create New Theme"}</DialogTitle>
              <DialogDescription>
                {editingTheme ? "Update theme details and colors" : "Add a new theme option for users"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Theme Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Hunting Adventures"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) =>
                        setFormData({ ...formData, display_order: Number.parseInt(e.target.value) || 0 })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this theme..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primary Color *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        className="w-16 h-10 p-1"
                        required
                      />
                      <Input
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        placeholder="#4b5563"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Secondary Color *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        className="w-16 h-10 p-1"
                        required
                      />
                      <Input
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        placeholder="#f97316"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="text_color">Text Color *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="text_color"
                        type="color"
                        value={formData.text_color}
                        onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                        className="w-16 h-10 p-1"
                        required
                      />
                      <Input
                        value={formData.text_color}
                        onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color Preview</Label>
                  <div
                    className="w-full h-24 rounded-lg border flex items-center justify-center"
                    style={{
                      background: `linear-gradient(to right, ${formData.primary_color}, ${formData.secondary_color})`,
                      color: formData.text_color,
                    }}
                  >
                    <span className="text-lg font-semibold">Sample Text</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preview_image_url">Preview Image URL</Label>
                  <Input
                    id="preview_image_url"
                    value={formData.preview_image_url}
                    onChange={(e) => setFormData({ ...formData, preview_image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero_background_url">Hero Background URL</Label>
                  <Input
                    id="hero_background_url"
                    value={formData.hero_background_url}
                    onChange={(e) => setFormData({ ...formData, hero_background_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active (visible to users)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-transparent"
                >
                  Cancel
                </Button>
                <Button type="submit">{editingTheme ? "Update Theme" : "Create Theme"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Theme</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deletingTheme?.name}"?
                {deletingTheme && deletingTheme.usage_count > 0 && (
                  <span className="block mt-2 text-orange-600 font-medium">
                    Warning: This theme is currently used by {deletingTheme.usage_count} user(s).
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="bg-transparent">
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete Theme
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isFieldsDialogOpen} onOpenChange={setIsFieldsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Custom Fields - {selectedThemeForFields?.name}</DialogTitle>
              <DialogDescription>
                Add, edit, or remove custom fields that users can fill out when creating their profile
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Custom Fields ({customFields.length})</h3>
                <Button onClick={handleAddField} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Field
                </Button>
              </div>

              {customFields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No custom fields yet. Add fields relevant to this theme.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {customFields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{field.field_label}</span>
                          <Badge variant="outline" className="text-xs">
                            {field.field_type}
                          </Badge>
                          {field.is_required && (
                            <Badge variant="secondary" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {field.placeholder || `Field name: ${field.field_name}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditField(field)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteField(field.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFieldsDialogOpen(false)} className="bg-transparent">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddFieldDialogOpen} onOpenChange={setIsAddFieldDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingField ? "Edit Field" : "Add Custom Field"}</DialogTitle>
              <DialogDescription>
                Define a custom field for users to fill out when creating their profile
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveField}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="field_label">Field Label *</Label>
                    <Input
                      id="field_label"
                      value={fieldFormData.field_label}
                      onChange={(e) => setFieldFormData({ ...fieldFormData, field_label: e.target.value })}
                      placeholder="e.g., Animal Type"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="field_name">Field Name (internal) *</Label>
                    <Input
                      id="field_name"
                      value={fieldFormData.field_name}
                      onChange={(e) =>
                        setFieldFormData({
                          ...fieldFormData,
                          field_name: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                        })
                      }
                      placeholder="e.g., animal_type"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="field_type">Field Type *</Label>
                    <Select
                      value={fieldFormData.field_type}
                      onValueChange={(value: any) => setFieldFormData({ ...fieldFormData, field_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="textarea">Text Area</SelectItem>
                        <SelectItem value="select">Select Dropdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={fieldFormData.display_order}
                      onChange={(e) =>
                        setFieldFormData({ ...fieldFormData, display_order: Number.parseInt(e.target.value) || 0 })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="placeholder">Placeholder Text</Label>
                  <Input
                    id="placeholder"
                    value={fieldFormData.placeholder}
                    onChange={(e) => setFieldFormData({ ...fieldFormData, placeholder: e.target.value })}
                    placeholder="e.g., Enter the animal type"
                  />
                </div>

                {fieldFormData.field_type === "select" && (
                  <div className="space-y-2">
                    <Label>Options (comma-separated)</Label>
                    <Input
                      value={fieldFormData.field_options.join(", ")}
                      onChange={(e) =>
                        setFieldFormData({
                          ...fieldFormData,
                          field_options: e.target.value
                            .split(",")
                            .map((opt) => opt.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="e.g., Deer, Elk, Turkey, Bear"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_required"
                    checked={fieldFormData.is_required}
                    onCheckedChange={(checked) => setFieldFormData({ ...fieldFormData, is_required: checked })}
                  />
                  <Label htmlFor="is_required" className="cursor-pointer">
                    Required field
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddFieldDialogOpen(false)}
                  className="bg-transparent"
                >
                  Cancel
                </Button>
                <Button type="submit">{editingField ? "Update Field" : "Add Field"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </NewAdminGuard>
  )
}
