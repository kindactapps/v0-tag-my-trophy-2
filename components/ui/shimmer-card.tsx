"use client"
import { cn } from "@/lib/utils"

interface ShimmerCardProps {
  className?: string
}

// Shimmer effect for progressive loading
export default function ShimmerCard({ className }: ShimmerCardProps) {
  return (
    <div className={cn("relative overflow-hidden bg-[#f5f0e8] rounded-lg", className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <div className="h-full w-full bg-[#e5d5c8]" />
    </div>
  )
}

// Named export for compatibility
export { ShimmerCard }
