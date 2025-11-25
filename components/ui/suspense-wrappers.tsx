"use client"
import { Suspense, type ReactNode } from "react"
import { ProfessionalLoading, DatabaseLoading } from "./professional-loading"
import { GallerySkeleton, ShimmerCard } from "./skeleton-screens"

interface SuspenseWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  name?: string
}

// Generic suspense wrapper with professional loading
export function AppSuspense({ children, fallback, name = "content" }: SuspenseWrapperProps) {
  return <Suspense fallback={fallback || <ProfessionalLoading message={`Loading ${name}...`} />}>{children}</Suspense>
}

// Gallery-specific suspense wrapper
export function GallerySuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<GallerySkeleton itemCount={12} />}>{children}</Suspense>
}

// Dashboard components suspense wrapper
export function DashboardSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f0e8] p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <ShimmerCard className="h-16 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <ShimmerCard key={i} className="h-24" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ShimmerCard key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

// QR Code generation suspense wrapper
export function QRSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <ShimmerCard className="h-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ShimmerCard className="h-48" />
            <ShimmerCard className="h-48" />
          </div>
          <ShimmerCard className="h-16" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

// Data fetching suspense wrapper
export function DataSuspense({ children, operation = "Loading data" }: { children: ReactNode; operation?: string }) {
  return <Suspense fallback={<DatabaseLoading operation={operation} />}>{children}</Suspense>
}

// Settings page suspense wrapper
export function SettingsSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f0e8] p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <ShimmerCard className="h-16 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ShimmerCard className="h-96" />
              <ShimmerCard className="h-96" />
            </div>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
