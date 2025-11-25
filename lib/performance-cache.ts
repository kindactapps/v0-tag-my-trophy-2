"use client"

// Simple in-memory cache with TTL support
class PerformanceCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache stats
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Global cache instance
export const performanceCache = new PerformanceCache()

// Cache keys for different data types
export const CACHE_KEYS = {
  USER_COLLECTIONS: "user_collections",
  COLLECTION_DETAILS: (slug: string) => `collection_${slug}`,
  QR_GENERATION: (url: string, options: string) => `qr_${btoa(url + options)}`,
  USER_STATS: "user_stats",
  RECENT_ACTIVITY: "recent_activity",
  GALLERY_IMAGES: (collectionId: string) => `gallery_${collectionId}`,
  USER_SETTINGS: "user_settings",
} as const

// Hook for cached data fetching
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T> | T,
  ttl?: number,
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      try {
        // Check cache first
        const cached = performanceCache.get(key)
        if (cached && mounted) {
          setData(cached)
          setLoading(false)
          return
        }

        // Fetch fresh data
        const result = await fetcher()
        if (mounted) {
          setData(result)
          performanceCache.set(key, result, ttl)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"))
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [key, ttl])

  return { data, loading, error }
}

// Preload data into cache
export async function preloadData<T>(key: string, fetcher: () => Promise<T> | T, ttl?: number): Promise<void> {
  try {
    if (!performanceCache.has(key)) {
      const data = await fetcher()
      performanceCache.set(key, data, ttl)
    }
  } catch (error) {
    console.warn(`Failed to preload data for key: ${key}`, error)
  }
}

// Batch preload multiple data sources
export async function batchPreload(
  preloadTasks: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>,
): Promise<void> {
  const promises = preloadTasks.map(({ key, fetcher, ttl }) => preloadData(key, fetcher, ttl))

  await Promise.allSettled(promises)
}

// Auto cleanup expired cache entries
if (typeof window !== "undefined") {
  setInterval(() => {
    performanceCache.cleanup()
  }, 60000) // Cleanup every minute
}

import { useState, useEffect } from "react"
