"use client"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

// Gallery skeleton screen
export function GallerySkeleton({ itemCount = 12 }: { itemCount?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square rounded-lg bg-[#e5d5c8]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4 bg-[#e5d5c8]" />
            <Skeleton className="h-3 w-1/2 bg-[#e5d5c8]" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Profile skeleton screen
export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-6">
        <Skeleton className="w-24 h-24 rounded-full bg-[#e5d5c8]" />
        <div className="space-y-3 flex-1">
          <Skeleton className="h-8 w-1/3 bg-[#e5d5c8]" />
          <Skeleton className="h-4 w-2/3 bg-[#e5d5c8]" />
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-16 bg-[#e5d5c8]" />
            <Skeleton className="h-6 w-20 bg-[#e5d5c8]" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-8 w-16 mx-auto bg-[#e5d5c8]" />
            <Skeleton className="h-4 w-20 mx-auto bg-[#e5d5c8]" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4 bg-[#e5d5c8]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg bg-[#e5d5c8]" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Dashboard skeleton screen
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-[#e5d5c8]" />
            <Skeleton className="h-4 w-96 bg-[#e5d5c8]" />
          </div>
          <Skeleton className="h-10 w-32 bg-[#e5d5c8]" />
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-[#e5d5c8] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24 bg-[#e5d5c8]" />
                <Skeleton className="h-5 w-5 bg-[#e5d5c8]" />
              </div>
              <Skeleton className="h-8 w-16 bg-[#e5d5c8]" />
              <Skeleton className="h-3 w-32 bg-[#e5d5c8]" />
            </div>
          ))}
        </div>

        {/* Recent memories */}
        <div className="bg-white rounded-lg border border-[#e5d5c8] p-6 space-y-6">
          <Skeleton className="h-6 w-48 bg-[#e5d5c8]" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video rounded-lg bg-[#e5d5c8]" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-[#e5d5c8]" />
                  <Skeleton className="h-4 w-1/2 bg-[#e5d5c8]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Form skeleton screen
export function FormSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3 bg-[#e5d5c8]" />
        <Skeleton className="h-4 w-2/3 bg-[#e5d5c8]" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24 bg-[#e5d5c8]" />
            <Skeleton className="h-10 w-full bg-[#e5d5c8]" />
          </div>
        ))}
      </div>

      <div className="flex space-x-4">
        <Skeleton className="h-10 w-24 bg-[#e5d5c8]" />
        <Skeleton className="h-10 w-32 bg-[#e5d5c8]" />
      </div>
    </div>
  )
}

// Shimmer effect for progressive loading
export function ShimmerCard({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-[#f5f0e8] rounded-lg", className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <div className="h-full w-full bg-[#e5d5c8]" />
    </div>
  )
}
