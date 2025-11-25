"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  templates?: boolean
}

const storyTemplates = [
  {
    name: "The Day We...",
    template:
      "The day we [activity] was [feeling/weather]. I remember [specific detail] and how [emotion/reaction]. Looking back, [reflection/meaning].",
  },
  {
    name: "I'll Never Forget...",
    template:
      "I'll never forget [specific moment] because [reason]. It was [time/place] when [what happened]. The [detail] made it [feeling/significance].",
  },
  {
    name: "This Photo Shows...",
    template:
      "This photo shows [what's visible], but what you can't see is [hidden story]. We were [context/situation] and [what happened]. [Personal meaning/memory].",
  },
  {
    name: "The Story Behind...",
    template:
      "The story behind [object/moment] starts with [beginning]. [Middle events]. Now, every time I [see/think about it], I remember [lasting impact].",
  },
]

export default function RichTextEditor({ value, onChange, placeholder, templates = false }: RichTextEditorProps) {
  const [showTemplates, setShowTemplates] = useState(false)
  const [wordCount, setWordCount] = useState(value.split(" ").filter((word) => word.length > 0).length)

  const handleChange = (newValue: string) => {
    onChange(newValue)
    setWordCount(newValue.split(" ").filter((word) => word.length > 0).length)
  }

  const insertTemplate = (template: string) => {
    onChange(template)
    setWordCount(template.split(" ").filter((word) => word.length > 0).length)
    setShowTemplates(false)
  }

  return (
    <div className="space-y-3">
      {templates && (
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-[#c44c3a] border-[#c44c3a] hover:bg-[#c44c3a] hover:text-white"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Story Templates
          </Button>
          <span className="text-sm text-gray-500">{wordCount} words</span>
        </div>
      )}

      {showTemplates && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-[#f5f0e8] rounded-lg border">
          {storyTemplates.map((template, index) => (
            <button
              key={index}
              onClick={() => insertTemplate(template.template)}
              className="text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border"
            >
              <h4 className="font-medium text-[#2c2c2c] mb-1">{template.name}</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{template.template}</p>
            </button>
          ))}
        </div>
      )}

      <Textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-32 resize-none"
      />

      {!templates && (
        <div className="text-right">
          <span className="text-sm text-gray-500">{wordCount} words</span>
        </div>
      )}
    </div>
  )
}
