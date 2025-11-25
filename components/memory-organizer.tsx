"use client"
import { useState } from "react"
import type React from "react"
import { Card } from "@/components/ui/card"

interface Memory {
  id: number
  type: "photo" | "story"
  title?: string
  caption?: string
  date: string
  featured?: boolean
  category?: string
}

interface MemoryOrganizerProps {
  memories: Memory[]
  onReorder: (memories: Memory[]) => void
  onCategorize: (memoryId: number, category: string) => void
  onFeature: (memoryId: number, featured: boolean) => void
}

const categories = [
  { id: "family", name: "Family Adventures", color: "bg-blue-100 text-blue-800" },
  { id: "solo", name: "Solo Journeys", color: "bg-green-100 text-green-800" },
  { id: "seasonal", name: "Seasonal Memories", color: "bg-orange-100 text-orange-800" },
  { id: "special", name: "Special Moments", color: "bg-purple-100 text-purple-800" },
  { id: "learning", name: "Learning Experiences", color: "bg-yellow-100 text-yellow-800" },
]

export default function MemoryOrganizer({ memories, onReorder, onCategorize, onFeature }: MemoryOrganizerProps) {
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)

  const filteredMemories = selectedCategory ? memories.filter((m) => m.category === selectedCategory) : memories

  const handleDragStart = (e: React.DragEvent, memoryId: number) => {
    setDraggedItem(memoryId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault()

    if (draggedItem === null || draggedItem === targetId) return

    const newMemories = [...memories]
    const draggedIndex = newMemories.findIndex((m) => m.id === draggedItem)
    const targetIndex = newMemories.findIndex((m) => m.id === targetId)

    const [draggedMemory] = newMemories.splice(draggedIndex, 1)
    newMemories.splice(targetIndex, 0, draggedMemory)

    onReorder(newMemories)
    setDraggedItem(null)
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
                viewMode === "grid" ? "bg-white text-[#2c2c2c] shadow-sm" : "text-gray-600 hover:text-[#2c2c2c]"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
                viewMode === "timeline" ? "bg-white text-[#2c2c2c] shadow-sm" : "text-gray-600 hover:text-[#2c2c2c]"
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <span className="text-sm text-gray-600 font-medium">Filter by:</span>
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px] bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Tags */}
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {categories.map((category) => (
          <span key={category.id} className={`px-3 py-1 rounded-full text-xs font-medium ${category.color}`}>
            {category.name}
          </span>
        ))}
      </div>

      {/* Memory List */}
      <div
        className={`
        ${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" : "space-y-4"}
      `}
      >
        {filteredMemories.map((memory) => (
          <Card
            key={memory.id}
            draggable
            onDragStart={(e) => handleDragStart(e, memory.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, memory.id)}
            className={`
              p-4 sm:p-6 cursor-move hover:shadow-lg transition-shadow relative
              ${memory.featured ? "ring-2 ring-[#c44c3a]" : ""}
              ${draggedItem === memory.id ? "opacity-50" : ""}
            `}
          >
            {/* Featured Badge */}
            {memory.featured && (
              <div className="absolute -top-2 -right-2 bg-[#c44c3a] text-white text-xs px-2 py-1 rounded-full">
                Featured
              </div>
            )}

            {/* Memory Content */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[#2c2c2c] truncate">
                    {memory.type === "photo" ? memory.caption : memory.title}
                  </h4>
                  <p className="text-sm text-gray-500">{memory.date}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onFeature(memory.id, !memory.featured)}
                    className={`p-2 rounded min-h-[44px] min-w-[44px] flex items-center justify-center ${
                      memory.featured ? "text-[#c44c3a]" : "text-gray-400 hover:text-[#c44c3a]"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Category Selection */}
              <select
                value={memory.category || ""}
                onChange={(e) => onCategorize(memory.id, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded min-h-[44px] bg-white"
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Drag Handle */}
              <div className="flex justify-center pt-2">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredMemories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No memories found in this category.</p>
        </div>
      )}
    </div>
  )
}
