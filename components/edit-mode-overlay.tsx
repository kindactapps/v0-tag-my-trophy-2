"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import RichTextEditor from "./rich-text-editor"
import DragDropUpload from "./drag-drop-upload"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { Story, Memory } from "@/types"

interface EditModeOverlayProps {
  story: Story
  onStoryUpdate: (updatedStory: Story) => void
}

export default function EditModeOverlay({ story, onStoryUpdate }: EditModeOverlayProps) {
  const [editingMemory, setEditingMemory] = useState<number | null>(null)
  const [showAddMemory, setShowAddMemory] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [memoryToDelete, setMemoryToDelete] = useState<number | null>(null)

  const handleMemoryUpdate = (memoryId: number, updates: Partial<Memory>) => {
    const updatedMemories = story.memories.map((memory) =>
      memory.id === memoryId ? { ...memory, ...updates } : memory,
    )
    onStoryUpdate({ ...story, memories: updatedMemories })
    setEditingMemory(null)
  }

  const handleAddMemory = (newMemory: Omit<Memory, "id">) => {
    const newId = Math.max(...story.memories.map((m) => (typeof m.id === "number" ? m.id : 0))) + 1
    const updatedMemories = [...story.memories, { ...newMemory, id: newId }]
    onStoryUpdate({ ...story, memories: updatedMemories })
    setShowAddMemory(false)
  }

  const handleDeleteMemory = (memoryId: number) => {
    setMemoryToDelete(memoryId)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteMemory = () => {
    if (memoryToDelete !== null) {
      const updatedMemories = story.memories.filter((memory) => memory.id !== memoryToDelete)
      onStoryUpdate({ ...story, memories: updatedMemories })
    }
    setDeleteConfirmOpen(false)
    setMemoryToDelete(null)
  }

  return (
    <div className="min-h-screen">
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Memory"
        description="Are you sure you want to delete this memory? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDeleteMemory}
      />

      {/* Profile Edit Section */}
      <div className="bg-gradient-to-b from-[#2c2c2c] to-[#2c2c2c]/90 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-white/10 flex-shrink-0 relative group">
                <img
                  src={story.owner.avatar || "/placeholder.svg"}
                  alt={story.owner.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="text-center">
                    <svg
                      className="w-8 h-8 text-white mx-auto mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-white text-xs font-medium">Change Photo</span>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="group relative">
                  <h1 className="text-4xl md:text-5xl font-bold mb-3 cursor-pointer hover:bg-white/10 rounded px-2 py-1 transition-colors">
                    {story.owner.name}
                  </h1>
                  <div className="absolute -right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="group relative">
                  <p className="text-xl text-white/80 mb-4 max-w-2xl cursor-pointer hover:bg-white/10 rounded px-2 py-1 transition-colors">
                    {story.owner.bio}
                  </p>
                  <div className="absolute -right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-white/60">
                  <span>Created {story.owner.createdAt}</span>
                  <span className="hidden sm:block">•</span>
                  <span>{story.viewCount} people have shared in this story</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Edit Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Add Memory Button */}
          <div className="mb-8 text-center">
            <Button
              onClick={() => setShowAddMemory(true)}
              className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white px-8 py-3 rounded-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Memory
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {story.memories.map((memory) => (
              <div key={memory.id} className="relative group">
                <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow h-full">
                  {memory.type === "photo" ? (
                    <div className="aspect-square relative">
                      <img
                        src={memory.url || "/placeholder.svg"}
                        alt={memory.caption}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setEditingMemory(memory.id)}
                            className="bg-white/20 hover:bg-white/30 text-white"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteMemory(memory.id)}
                            className="bg-red-500/80 hover:bg-red-500"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 h-full flex flex-col">
                      <h3 className="text-xl font-semibold text-[#2c2c2c] mb-3">{memory.title}</h3>
                      <p className="text-[#2c2c2c]/70 leading-relaxed flex-1 line-clamp-4">{memory.content}</p>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => setEditingMemory(memory.id)}
                            className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white h-8 w-8 p-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteMemory(memory.id)}
                            className="h-8 w-8 p-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {memory.type === "photo" && (
                    <div className="p-4">
                      <p className="text-sm text-[#2c2c2c]/70 mb-2">{memory.caption}</p>
                      <div className="flex justify-between text-xs text-[#2c2c2c]/50">
                        <span>{memory.date}</span>
                        {memory.location && <span>{memory.location}</span>}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>

          {/* Edit Memory Modal */}
          {editingMemory && (
            <EditMemoryModal
              memory={story.memories.find((m) => m.id === editingMemory)}
              onSave={(updates) => handleMemoryUpdate(editingMemory, updates)}
              onCancel={() => setEditingMemory(null)}
            />
          )}

          {/* Add Memory Modal */}
          {showAddMemory && <AddMemoryModal onSave={handleAddMemory} onCancel={() => setShowAddMemory(false)} />}
        </div>
      </div>
    </div>
  )
}

function EditMemoryModal({ memory, onSave, onCancel }: any) {
  const [formData, setFormData] = useState(memory)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Edit Memory</h3>

          {memory.type === "photo" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Caption</label>
                <Textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <Input value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Story</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full h-32"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => onSave(formData)} className="bg-[#c44c3a] hover:bg-[#a63d2e]">
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function AddMemoryModal({ onSave, onCancel }: any) {
  const [memoryType, setMemoryType] = useState<"photo" | "story">("photo")
  const [formData, setFormData] = useState({
    type: "photo",
    title: "",
    content: "",
    caption: "",
    date: new Date().toLocaleDateString(),
    location: "",
    url: "/placeholder.svg?key=dj6ms",
  })

  const handleSave = () => {
    onSave({ ...formData, type: memoryType })
  }

  const handleFileUpload = (files: File[]) => {
    // In a real app, you'd upload to a server here
    console.log("Files uploaded:", files)
    // For demo, we'll just use a placeholder
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Add New Memory</h3>

          {/* Memory Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Memory Type</label>
            <div className="flex gap-4">
              <button
                onClick={() => setMemoryType("photo")}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  memoryType === "photo"
                    ? "border-[#c44c3a] bg-[#c44c3a] text-white"
                    : "border-gray-300 hover:border-[#c44c3a]"
                }`}
              >
                Photo Memory
              </button>
              <button
                onClick={() => setMemoryType("story")}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  memoryType === "story"
                    ? "border-[#c44c3a] bg-[#c44c3a] text-white"
                    : "border-gray-300 hover:border-[#c44c3a]"
                }`}
              >
                Story Memory
              </button>
            </div>
          </div>

          {memoryType === "photo" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Photo</label>
                <DragDropUpload onUpload={handleFileUpload} accept="image/*" maxSize={10} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Caption</label>
                <RichTextEditor
                  value={formData.caption}
                  onChange={(value) => setFormData({ ...formData, caption: value })}
                  placeholder="Describe this special moment..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <Input value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Where was this taken?"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Story Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Give your story a memorable title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Your Story</label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Tell the story behind this memory..."
                  templates={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-[#c44c3a] hover:bg-[#a63d2e]">
              Add Memory
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
