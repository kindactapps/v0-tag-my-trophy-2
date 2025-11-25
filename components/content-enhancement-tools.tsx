"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  Wand2,
  Camera,
  MapPin,
  Tag,
  Type,
  ImageIcon,
  Video,
  FileText,
  Zap,
  Brain,
  Filter,
  Grid,
  List,
  Heart,
  Star,
  TrendingUp,
} from "lucide-react"

interface Memory {
  id: number
  type: "photo" | "video" | "story"
  url?: string
  title?: string
  caption?: string
  content?: string
  date: string
  location?: string
  tags?: string[]
  aiGenerated?: boolean
  mood?: string
  weather?: string
  people?: string[]
}

interface ContentEnhancementToolsProps {
  memories: Memory[]
  onMemoryUpdate: (memory: Memory) => void
  onMemoryEnhance: (memoryId: number, enhancement: any) => void
}

export default function ContentEnhancementTools({
  memories,
  onMemoryUpdate,
  onMemoryEnhance,
}: ContentEnhancementToolsProps) {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [enhancementType, setEnhancementType] = useState<string>("ai-caption")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("date")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // AI Enhancement Functions
  const handleAICaption = async (memory: Memory) => {
    setIsProcessing(true)
    setProcessingProgress(0)

    // Simulate AI processing
    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const aiCaption = generateAICaption(memory)
    setProcessingProgress(100)

    setTimeout(() => {
      onMemoryEnhance(memory.id, {
        aiCaption,
        originalCaption: memory.caption,
      })
      setIsProcessing(false)
      setProcessingProgress(0)
    }, 500)
  }

  const handleAIStoryExpansion = async (memory: Memory) => {
    setIsProcessing(true)
    setProcessingProgress(0)

    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 15
      })
    }, 300)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const expandedStory = generateExpandedStory(memory)
    setProcessingProgress(100)

    setTimeout(() => {
      onMemoryEnhance(memory.id, {
        expandedStory,
        originalContent: memory.content,
      })
      setIsProcessing(false)
      setProcessingProgress(0)
    }, 500)
  }

  const handleAutoTagging = async (memory: Memory) => {
    setIsProcessing(true)
    setProcessingProgress(0)

    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 20
      })
    }, 150)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const aiTags = generateAITags(memory)
    setProcessingProgress(100)

    setTimeout(() => {
      onMemoryEnhance(memory.id, {
        aiTags,
        originalTags: memory.tags || [],
      })
      setIsProcessing(false)
      setProcessingProgress(0)
    }, 500)
  }

  const handleMediaOptimization = async (memory: Memory) => {
    setIsProcessing(true)
    setProcessingProgress(0)

    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 12
      })
    }, 250)

    await new Promise((resolve) => setTimeout(resolve, 2500))

    const optimizationResults = {
      originalSize: "2.4 MB",
      optimizedSize: "847 KB",
      compressionRatio: "65%",
      qualityScore: "95%",
      thumbnailGenerated: true,
      duplicatesFound: 0,
    }

    setProcessingProgress(100)

    setTimeout(() => {
      onMemoryEnhance(memory.id, {
        mediaOptimization: optimizationResults,
      })
      setIsProcessing(false)
      setProcessingProgress(0)
    }, 500)
  }

  const handleDuplicateDetection = async () => {
    setIsProcessing(true)
    setProcessingProgress(0)

    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 8
      })
    }, 300)

    await new Promise((resolve) => setTimeout(resolve, 3500))

    const duplicates = [
      { id: 1, title: "Beach Sunset", similarity: "98%", action: "merge" },
      { id: 2, title: "Family Dinner", similarity: "85%", action: "keep_both" },
    ]

    setProcessingProgress(100)

    setTimeout(() => {
      onMemoryEnhance(0, {
        duplicateDetection: duplicates,
      })
      setIsProcessing(false)
      setProcessingProgress(0)
    }, 500)
  }

  // AI Generation Helper Functions
  const generateAICaption = (memory: Memory): string => {
    const captions = [
      "A beautiful moment captured in time, filled with joy and wonder.",
      "This precious memory showcases the beauty of life's simple pleasures.",
      "An unforgettable experience that will be treasured for years to come.",
      "A perfect blend of emotion and artistry in this stunning capture.",
      "This moment tells a story of connection, love, and shared experiences.",
    ]
    return captions[Math.floor(Math.random() * captions.length)]
  }

  const generateExpandedStory = (memory: Memory): string => {
    const expansions = [
      "The details of this moment are etched in memory - the gentle breeze, the warm sunlight, and the feeling of pure contentment. Every element came together to create something truly magical, a snapshot of life at its most beautiful.",
      "Looking back at this experience, it's amazing how all the small details contributed to making it so special. The sounds, the smells, the emotions - everything combined to create a memory that will last a lifetime.",
      "This wasn't just a moment in time, but a turning point that would be remembered forever. The significance of what happened here would only become clear later, but even then, there was a sense that something important was taking place.",
    ]
    return expansions[Math.floor(Math.random() * expansions.length)]
  }

  const generateAITags = (memory: Memory): string[] => {
    const tagSets = [
      ["adventure", "outdoors", "nature", "peaceful", "scenic"],
      ["family", "celebration", "joy", "togetherness", "love"],
      ["achievement", "milestone", "proud", "success", "memorable"],
      ["friendship", "fun", "laughter", "bonding", "special"],
      ["travel", "exploration", "discovery", "beautiful", "inspiring"],
    ]
    return tagSets[Math.floor(Math.random() * tagSets.length)]
  }

  // Content Organization Functions
  const filteredAndSortedMemories = memories
    .filter((memory) => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch =
          memory.title?.toLowerCase().includes(searchLower) ||
          memory.caption?.toLowerCase().includes(searchLower) ||
          memory.content?.toLowerCase().includes(searchLower) ||
          memory.location?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (filterTags.length > 0) {
        const memoryTags = memory.tags || []
        const hasMatchingTag = filterTags.some((tag) => memoryTags.includes(tag))
        if (!hasMatchingTag) return false
      }

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "title":
          return (a.title || a.caption || "").localeCompare(b.title || b.caption || "")
        case "type":
          return a.type.localeCompare(b.type)
        default:
          return 0
      }
    })

  const allTags = Array.from(new Set(memories.flatMap((m) => m.tags || [])))

  return (
    <div className="space-y-8">
      {/* Enhancement Tools Header */}
      <Card className="border-[#e5d5c8] bg-gradient-to-r from-[#f5f0e8] to-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[#2c2c2c] flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-[#c44c3a]" />
            Content Enhancement Tools
          </CardTitle>
          <CardDescription className="text-[#6b5b47] max-w-2xl mx-auto">
            Use AI-powered tools to enhance your memories with better captions, expanded stories, automatic tagging, and
            smart organization.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="ai-enhance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-[#e5d5c8]">
          <TabsTrigger value="ai-enhance" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
            AI Enhancement
          </TabsTrigger>
          <TabsTrigger value="organize" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
            Smart Organization
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
            Story Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#c44c3a] data-[state=active]:text-white">
            Memory Analytics
          </TabsTrigger>
        </TabsList>

        {/* AI Enhancement Tab */}
        <TabsContent value="ai-enhance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Memory Selection */}
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Select Memory to Enhance
                </CardTitle>
                <CardDescription className="text-[#6b5b47]">Choose a memory to apply AI enhancements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {memories.slice(0, 5).map((memory) => (
                    <div
                      key={memory.id}
                      onClick={() => setSelectedMemory(memory)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedMemory?.id === memory.id
                          ? "border-[#c44c3a] bg-[#c44c3a]/5"
                          : "border-[#e5d5c8] hover:border-[#c44c3a]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#f5f0e8] rounded-lg flex items-center justify-center">
                          {memory.type === "photo" && <ImageIcon className="w-5 h-5 text-[#c44c3a]" />}
                          {memory.type === "video" && <Video className="w-5 h-5 text-[#c44c3a]" />}
                          {memory.type === "story" && <FileText className="w-5 h-5 text-[#c44c3a]" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-[#2c2c2c] text-sm">
                            {memory.title || memory.caption || `${memory.type} memory`}
                          </h4>
                          <p className="text-xs text-[#6b5b47]">{memory.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhancement Options */}
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  AI Enhancement Options
                </CardTitle>
                <CardDescription className="text-[#6b5b47]">Choose how to enhance your selected memory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedMemory ? (
                  <>
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleAICaption(selectedMemory)}
                        disabled={isProcessing}
                        className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white justify-start"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Generate AI Caption
                      </Button>

                      <Button
                        onClick={() => handleAIStoryExpansion(selectedMemory)}
                        disabled={isProcessing}
                        className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white justify-start"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Expand Story with AI
                      </Button>

                      <Button
                        onClick={() => handleAutoTagging(selectedMemory)}
                        disabled={isProcessing}
                        className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white justify-start"
                      >
                        <Tag className="w-4 h-4 mr-2" />
                        Auto-Generate Tags
                      </Button>

                      <Button
                        onClick={() => handleMediaOptimization(selectedMemory)}
                        disabled={isProcessing}
                        className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white justify-start"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Optimize Media Quality
                      </Button>

                      <Button
                        onClick={() => handleDuplicateDetection()}
                        disabled={isProcessing}
                        variant="outline"
                        className="w-full border-[#e5d5c8] bg-transparent justify-start"
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Detect Duplicates
                      </Button>
                    </div>

                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#6b5b47]">Processing...</span>
                          <span className="text-[#6b5b47]">{processingProgress}%</span>
                        </div>
                        <Progress value={processingProgress} className="h-2" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-[#6b5b47] mx-auto mb-3" />
                    <p className="text-[#6b5b47]">Select a memory to begin enhancement</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhancement Preview */}
          {selectedMemory && (
            <Card className="border-[#e5d5c8]">
              <CardHeader>
                <CardTitle className="text-[#2c2c2c]">Memory Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#f5f0e8] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                      {selectedMemory.type === "photo" && <ImageIcon className="w-6 h-6 text-[#c44c3a]" />}
                      {selectedMemory.type === "video" && <Video className="w-6 h-6 text-[#c44c3a]" />}
                      {selectedMemory.type === "story" && <FileText className="w-6 h-6 text-[#c44c3a]" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-[#2c2c2c]">
                        {selectedMemory.title || selectedMemory.caption || "Untitled Memory"}
                      </h4>
                      <p className="text-sm text-[#6b5b47]">{selectedMemory.date}</p>
                      {selectedMemory.location && (
                        <p className="text-xs text-[#6b5b47] flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {selectedMemory.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedMemory.content && (
                    <p className="text-[#2c2c2c] text-sm leading-relaxed mb-3">{selectedMemory.content}</p>
                  )}

                  {selectedMemory.tags && selectedMemory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedMemory.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="border-[#e5d5c8] text-[#6b5b47] text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Smart Organization Tab */}
        <TabsContent value="organize" className="space-y-6">
          <Card className="border-[#e5d5c8]">
            <CardHeader>
              <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Smart Memory Organization
              </CardTitle>
              <CardDescription className="text-[#6b5b47]">
                Search, filter, and organize your memories intelligently
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Search memories by title, caption, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-[#e5d5c8]"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-3 py-2 border border-[#e5d5c8] rounded-md bg-white"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="title">Sort by Title</option>
                    <option value="type">Sort by Type</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                    className="border-[#e5d5c8] bg-transparent"
                  >
                    {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Tag Filters */}
              <div>
                <h4 className="font-medium text-[#2c2c2c] mb-3">Filter by Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 10).map((tag) => (
                    <Badge
                      key={tag}
                      variant={filterTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        filterTags.includes(tag)
                          ? "bg-[#c44c3a] text-white"
                          : "border-[#e5d5c8] text-[#6b5b47] hover:border-[#c44c3a]"
                      }`}
                      onClick={() => {
                        setFilterTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Memory Grid/List */}
              <div
                className={`${
                  viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"
                }`}
              >
                {filteredAndSortedMemories.slice(0, 6).map((memory) => (
                  <Card key={memory.id} className="border-[#e5d5c8] hover:shadow-md transition-shadow">
                    <CardContent className={`${viewMode === "grid" ? "p-4" : "p-3"}`}>
                      <div className={`flex ${viewMode === "grid" ? "flex-col" : "flex-row"} gap-3`}>
                        <div
                          className={`${
                            viewMode === "grid" ? "w-full h-32" : "w-16 h-16"
                          } bg-[#f5f0e8] rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          {memory.type === "photo" && <ImageIcon className="w-6 h-6 text-[#c44c3a]" />}
                          {memory.type === "video" && <Video className="w-6 h-6 text-[#c44c3a]" />}
                          {memory.type === "story" && <FileText className="w-6 h-6 text-[#c44c3a]" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-[#2c2c2c] mb-1">
                            {memory.title || memory.caption || "Untitled Memory"}
                          </h4>
                          <p className="text-xs text-[#6b5b47] mb-2">{memory.date}</p>
                          {memory.location && (
                            <p className="text-xs text-[#6b5b47] flex items-center gap-1 mb-2">
                              <MapPin className="w-3 h-3" />
                              {memory.location}
                            </p>
                          )}
                          {memory.tags && memory.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {memory.tags.slice(0, 3).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="border-[#e5d5c8] text-[#6b5b47] text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <p className="text-[#6b5b47] text-sm">
                  Showing {filteredAndSortedMemories.length} of {memories.length} memories
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Story Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card className="border-[#e5d5c8]">
            <CardHeader>
              <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
                <Type className="w-5 h-5" />
                Story Templates & Prompts
              </CardTitle>
              <CardDescription className="text-[#6b5b47]">
                Use pre-built templates to create compelling stories from your memories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Adventure Story",
                    description: "Perfect for outdoor adventures and travel memories",
                    template: "The journey began when... What started as a simple plan turned into...",
                    icon: <Camera className="w-5 h-5" />,
                    color: "bg-blue-500",
                  },
                  {
                    title: "Family Moment",
                    description: "Capture precious family memories and traditions",
                    template: "This moment with my family... What made this day special was...",
                    icon: <Heart className="w-5 h-5" />,
                    color: "bg-pink-500",
                  },
                  {
                    title: "Achievement Story",
                    description: "Document milestones and personal victories",
                    template: "After working towards this goal... The moment I achieved...",
                    icon: <Star className="w-5 h-5" />,
                    color: "bg-yellow-500",
                  },
                  {
                    title: "Reflection Piece",
                    description: "Deep thoughts and meaningful reflections",
                    template: "Looking back on this experience... What I learned was...",
                    icon: <Brain className="w-5 h-5" />,
                    color: "bg-purple-500",
                  },
                ].map((template, index) => (
                  <Card key={index} className="border-[#e5d5c8] hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-10 h-10 ${template.color} rounded-lg flex items-center justify-center text-white`}
                        >
                          {template.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#2c2c2c]">{template.title}</h4>
                          <p className="text-sm text-[#6b5b47]">{template.description}</p>
                        </div>
                      </div>
                      <div className="bg-[#f5f0e8] rounded-lg p-3 mb-4">
                        <p className="text-sm text-[#2c2c2c] italic">"{template.template}"</p>
                      </div>
                      <Button size="sm" className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white">
                        Use This Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Memory Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-[#e5d5c8]">
            <CardHeader>
              <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Memory Analytics & Insights
              </CardTitle>
              <CardDescription className="text-[#6b5b47]">
                Discover patterns and insights about your memory collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#f5f0e8] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#c44c3a] mb-1">{memories.length}</div>
                  <div className="text-sm text-[#6b5b47]">Total Memories</div>
                </div>
                <div className="bg-[#f5f0e8] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#c44c3a] mb-1">
                    {memories.filter((m) => m.type === "photo").length}
                  </div>
                  <div className="text-sm text-[#6b5b47]">Photos</div>
                </div>
                <div className="bg-[#f5f0e8] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#c44c3a] mb-1">
                    {memories.filter((m) => m.type === "story").length}
                  </div>
                  <div className="text-sm text-[#6b5b47]">Stories</div>
                </div>
                <div className="bg-[#f5f0e8] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#c44c3a] mb-1">{allTags.length}</div>
                  <div className="text-sm text-[#6b5b47]">Unique Tags</div>
                </div>
              </div>

              {/* Memory Timeline */}
              <div>
                <h4 className="font-medium text-[#2c2c2c] mb-3">Memory Timeline</h4>
                <div className="bg-[#f5f0e8] rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm text-[#6b5b47] mb-2">
                    <span>2024</span>
                    <span>{memories.length} memories</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div className="bg-[#c44c3a] h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
              </div>

              {/* Popular Tags */}
              <div>
                <h4 className="font-medium text-[#2c2c2c] mb-3">Most Used Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 8).map((tag, index) => (
                    <Badge key={tag} variant="outline" className="border-[#e5d5c8] text-[#6b5b47]">
                      {tag} ({Math.floor(Math.random() * 5) + 1})
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-medium text-[#2c2c2c] mb-3">Recommendations</h4>
                <div className="space-y-3">
                  <div className="bg-[#f5f0e8] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-[#c44c3a]" />
                      <span className="font-medium text-[#2c2c2c]">Add More Stories</span>
                    </div>
                    <p className="text-sm text-[#6b5b47]">
                      You have great photos! Consider adding more written stories to provide context and emotion.
                    </p>
                  </div>
                  <div className="bg-[#f5f0e8] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-[#c44c3a]" />
                      <span className="font-medium text-[#2c2c2c]">Improve Tagging</span>
                    </div>
                    <p className="text-sm text-[#6b5b47]">
                      Adding more descriptive tags will help you find and organize your memories better.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
