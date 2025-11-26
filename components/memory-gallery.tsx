"use client"

import { useState } from "react"
import type { Memory } from "@/types"

interface MemoryGalleryProps {
  memories: Memory[]
}

export default function MemoryGallery({ memories }: MemoryGalleryProps) {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)

  if (!memories || memories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#2c2c2c]/60">No memories yet</p>
      </div>
    )
  }

  return (
    <>
      {/* Masonry Grid Layout */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {memories.map((memory, index) => {
          return (
            <div
              key={memory.id}
              className="break-inside-avoid bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => {
                setSelectedMemory(memory)
              }}
            >
              {memory.type === "photo" && (
                <div>
                  <div className="relative aspect-auto">
                    <img
                      src={memory.url || `/placeholder.svg?height=300&width=400&query=memory photo`}
                      alt={memory.caption || "Memory photo"}
                      className="w-full h-auto object-cover"
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-[#2c2c2c] font-medium mb-2">{memory.caption}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-[#2c2c2c]/60">
                      <span className="bg-[#f5f0e8] px-2 py-1 rounded-full">{memory.date}</span>
                      {memory.location && (
                        <span className="bg-[#f5f0e8] px-2 py-1 rounded-full">{memory.location}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {memory.type === "video" && (
                <div>
                  <div className="relative aspect-video bg-gray-100">
                    <img
                      src={
                        memory.thumbnail || memory.url || `/placeholder.svg?height=225&width=400&query=video thumbnail`
                      }
                      alt={memory.caption || "Video thumbnail"}
                      className="w-full h-full object-cover"
                      loading={index < 2 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-[#c44c3a] ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-[#2c2c2c] font-medium mb-2">{memory.caption}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-[#2c2c2c]/60">
                      <span className="bg-[#f5f0e8] px-2 py-1 rounded-full">{memory.date}</span>
                      {memory.location && (
                        <span className="bg-[#f5f0e8] px-2 py-1 rounded-full">{memory.location}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {memory.type === "story" && (
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#2c2c2c] mb-3">{memory.title}</h3>
                  <p className="text-[#2c2c2c]/80 leading-relaxed mb-4 line-clamp-4">{memory.content}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#2c2c2c]/60 bg-[#f5f0e8] px-2 py-1 rounded-full">{memory.date}</span>
                    <span className="text-[#c44c3a] text-sm font-medium">Read more</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedMemory && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedMemory(null)
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMemory.type === "photo" && (
              <div>
                <div className="relative">
                  <img
                    src={selectedMemory.url || `/placeholder.svg?height=600&width=800&query=memory photo`}
                    alt={selectedMemory.caption || "Memory photo"}
                    className="w-full h-auto max-h-[60vh] object-contain"
                    loading="eager"
                  />
                  <button
                    onClick={() => setSelectedMemory(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div className="p-8">
                  <p className="text-[#2c2c2c] text-lg mb-4">{selectedMemory.caption}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-[#2c2c2c]/60">
                    <span className="bg-[#f5f0e8] px-3 py-1 rounded-full">{selectedMemory.date}</span>
                    {selectedMemory.location && (
                      <span className="bg-[#f5f0e8] px-3 py-1 rounded-full">{selectedMemory.location}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedMemory.type === "story" && (
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-3xl font-bold text-[#2c2c2c]">{selectedMemory.title}</h2>
                  <button
                    onClick={() => setSelectedMemory(null)}
                    className="w-10 h-10 bg-gray-100 text-[#2c2c2c] rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
                <p className="text-[#2c2c2c]/80 text-lg leading-relaxed mb-6">{selectedMemory.content}</p>
                <div className="text-sm text-[#2c2c2c]/60 bg-[#f5f0e8] px-3 py-2 rounded-full inline-block">
                  {selectedMemory.date}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
