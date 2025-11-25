"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Sparkles,
  MessageSquare,
  Lightbulb,
  Wand2,
  Camera,
  MapPin,
  Calendar,
  Users,
  Heart,
  Star,
  Zap,
} from "lucide-react"

interface AIContentAssistantProps {
  onSuggestionApply: (suggestion: any) => void
}

export default function AIContentAssistant({ onSuggestionApply }: AIContentAssistantProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [selectedContext, setSelectedContext] = useState<string[]>([])

  const contextOptions = [
    { id: "family", label: "Family", icon: <Users className="w-4 h-4" /> },
    { id: "adventure", label: "Adventure", icon: <Camera className="w-4 h-4" /> },
    { id: "celebration", label: "Celebration", icon: <Star className="w-4 h-4" /> },
    { id: "travel", label: "Travel", icon: <MapPin className="w-4 h-4" /> },
    { id: "milestone", label: "Milestone", icon: <Calendar className="w-4 h-4" /> },
    { id: "emotional", label: "Emotional", icon: <Heart className="w-4 h-4" /> },
  ]

  const handleGenerateSuggestions = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGenerationProgress(0)

    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 15
      })
    }, 200)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockSuggestions = [
      {
        type: "caption",
        title: "Enhanced Caption",
        content: "A moment of pure joy captured in time, where laughter echoes and memories are born.",
        confidence: 95,
        tags: ["joy", "laughter", "memories", "special"],
      },
      {
        type: "story",
        title: "Story Expansion",
        content:
          "This wasn't just another day - it was the kind of day that reminds you why these moments matter. The sun was setting just right, casting that golden glow that photographers dream of, but more importantly, everyone was together. You could feel the happiness in the air, the kind that makes you want to freeze time and live in that moment forever.",
        confidence: 88,
        tags: ["sunset", "togetherness", "happiness", "golden hour"],
      },
      {
        type: "prompt",
        title: "Writing Prompt",
        content:
          "What was the most unexpected thing that happened during this moment? How did it change the entire experience?",
        confidence: 92,
        tags: ["reflection", "storytelling", "unexpected"],
      },
    ]

    setGenerationProgress(100)

    setTimeout(() => {
      setSuggestions(mockSuggestions)
      setIsGenerating(false)
      setGenerationProgress(0)
    }, 500)
  }

  const toggleContext = (contextId: string) => {
    setSelectedContext((prev) =>
      prev.includes(contextId) ? prev.filter((id) => id !== contextId) : [...prev, contextId],
    )
  }

  return (
    <Card className="border-[#e5d5c8]">
      <CardHeader>
        <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#c44c3a]" />
          AI Content Assistant
        </CardTitle>
        <CardDescription className="text-[#6b5b47]">
          Get AI-powered suggestions for captions, stories, and writing prompts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Context Selection */}
        <div>
          <h4 className="font-medium text-[#2c2c2c] mb-3">Content Context</h4>
          <div className="flex flex-wrap gap-2">
            {contextOptions.map((option) => (
              <Badge
                key={option.id}
                variant={selectedContext.includes(option.id) ? "default" : "outline"}
                className={`cursor-pointer transition-colors flex items-center gap-1 ${
                  selectedContext.includes(option.id)
                    ? "bg-[#c44c3a] text-white"
                    : "border-[#e5d5c8] text-[#6b5b47] hover:border-[#c44c3a]"
                }`}
                onClick={() => toggleContext(option.id)}
              >
                {option.icon}
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-3">
          <h4 className="font-medium text-[#2c2c2c]">Describe your memory or what you need help with</h4>
          <Textarea
            placeholder="e.g., 'A family photo at the beach during sunset' or 'Help me write about our camping trip'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="border-[#e5d5c8] min-h-20"
          />
          <Button
            onClick={handleGenerateSuggestions}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate AI Suggestions
          </Button>
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6b5b47]">Generating suggestions...</span>
              <span className="text-[#6b5b47]">{generationProgress}%</span>
            </div>
            <Progress value={generationProgress} className="h-2" />
          </div>
        )}

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-[#2c2c2c] flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#c44c3a]" />
              AI Suggestions
            </h4>
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="border-[#e5d5c8] bg-[#f5f0e8]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {suggestion.type === "caption" && <MessageSquare className="w-4 h-4 text-[#c44c3a]" />}
                      {suggestion.type === "story" && <Wand2 className="w-4 h-4 text-[#c44c3a]" />}
                      {suggestion.type === "prompt" && <Lightbulb className="w-4 h-4 text-[#c44c3a]" />}
                      <h5 className="font-medium text-[#2c2c2c]">{suggestion.title}</h5>
                    </div>
                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                      {suggestion.confidence}% match
                    </Badge>
                  </div>
                  <p className="text-[#2c2c2c] text-sm leading-relaxed mb-3">{suggestion.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {suggestion.tags.map((tag: string, tagIndex: number) => (
                        <Badge key={tagIndex} variant="outline" className="border-[#e5d5c8] text-[#6b5b47] text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onSuggestionApply(suggestion)}
                      className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Prompts */}
        <div>
          <h4 className="font-medium text-[#2c2c2c] mb-3">Quick Prompts</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "Write a caption for this photo",
              "Expand this into a full story",
              "Create writing prompts",
              "Suggest relevant tags",
              "Improve this description",
              "Add emotional context",
            ].map((quickPrompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setPrompt(quickPrompt)}
                className="border-[#e5d5c8] text-[#6b5b47] hover:border-[#c44c3a] hover:text-[#c44c3a] bg-transparent text-left justify-start"
              >
                {quickPrompt}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
