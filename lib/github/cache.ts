import type { GitHubProjectAnalysis } from '@/types'

interface CacheEntry {
  data: GitHubProjectAnalysis
  timestamp: number
}

const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

// In-memory store
const analysisCache = new Map<string, CacheEntry>()

export function getCachedAnalysis(cacheKey: string): GitHubProjectAnalysis | null {
  const entry = analysisCache.get(cacheKey.toLowerCase())
  if (!entry) return null

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    analysisCache.delete(cacheKey.toLowerCase())
    return null
  }

  return entry.data
}

export function setCachedAnalysis(cacheKey: string, data: GitHubProjectAnalysis): void {
  // Simple eviction if map gets too large
  if (analysisCache.size > 100) {
    const oldestKey = analysisCache.keys().next().value
    if (oldestKey) analysisCache.delete(oldestKey)
  }

  analysisCache.set(cacheKey.toLowerCase(), {
    data,
    timestamp: Date.now(),
  })
}

export function clearCachedAnalysis(cacheKey?: string): void {
  if (cacheKey) {
    analysisCache.delete(cacheKey.toLowerCase())
  } else {
    analysisCache.clear()
  }
}
