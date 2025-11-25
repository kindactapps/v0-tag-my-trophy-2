"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface SelectionCounterProps {
  count: number
  total: number
  onClear: () => void
  className?: string
}

export function SelectionCounter({ count, total, onClear, className }: SelectionCounterProps) {
  if (count === 0) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        {count} of {total} selected
      </Badge>
      <Button variant="ghost" size="sm" onClick={onClear} className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-700">
        <X className="w-3 h-3" />
      </Button>
    </div>
  )
}
