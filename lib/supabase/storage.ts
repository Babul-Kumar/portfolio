// Storage bucket names aligned with Supabase Storage
export const BUCKETS = {
  CERTIFICATES: 'certificate',
  PROFILE: 'certificate',
  PROJECTS: 'certificate',
  ACHIEVEMENTS: 'certificate',
  RESUME: 'certificate',
} as const

export type BucketName =
  | (typeof BUCKETS)[keyof typeof BUCKETS]
  | 'certificates'
  | 'profile'
  | 'certificate'
  | 'profile picture'
  | 'profile_picture'
  | 'projects'
  | 'achievements'
  | 'resume'
  | 'training'
  | 'co-curricular'

/**
 * Normalizes bucket name aliases to the actual valid Supabase Storage bucket:
 * - 'certificate' (for certificates, profile avatar, projects, training, co-curricular, achievements, resume)
 */
export function normalizeBucketName(bucket: string): string {
  const map: Record<string, string> = {
    certificates: 'certificate',
    certificate: 'certificate',
    profile: 'certificate',
    'profile picture': 'certificate',
    profile_picture: 'certificate',
    projects: 'certificate',
    achievements: 'certificate',
    resume: 'certificate',
    training: 'certificate',
    'co-curricular': 'certificate',
  }
  const key = (bucket || '').toLowerCase().trim()
  return map[key] || 'certificate'
}

// Max file sizes
export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024,      // 5 MB
  PDF: 20 * 1024 * 1024,       // 20 MB
  RESUME: 10 * 1024 * 1024,    // 10 MB
}

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export const ALLOWED_CERT_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf']

/**
 * Get the public URL for a file in Supabase Storage
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const normalized = normalizeBucketName(bucket)
  const encodedBucket = encodeURIComponent(normalized)
  const cleanPath = path.replace(/^\/+/, '')
  return `${supabaseUrl}/storage/v1/object/public/${encodedBucket}/${cleanPath}`
}

/**
 * Normalizes any certificate path, relative storage path, or absolute URL
 * into a fully-qualified public URL from the public 'certificate' bucket.
 */
export function getCertificatePublicUrl(pathOrUrl?: string | null): string | null {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return null
  const trimmed = pathOrUrl.trim()
  if (!trimmed) return null

  // If already a full HTTP(S) URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If URL points to legacy bucket names, normalize to 'certificate'
    if (trimmed.includes('/storage/v1/object/public/certificates/')) {
      return trimmed.replace('/storage/v1/object/public/certificates/', '/storage/v1/object/public/certificate/')
    }
    if (trimmed.includes('/storage/v1/object/public/profile%20picture/')) {
      return trimmed.replace('/storage/v1/object/public/profile%20picture/', '/storage/v1/object/public/certificate/')
    }
    if (trimmed.includes('/storage/v1/object/public/profile picture/')) {
      return trimmed.replace('/storage/v1/object/public/profile picture/', '/storage/v1/object/public/certificate/')
    }
    if (trimmed.includes('/storage/v1/object/public/profile/')) {
      return trimmed.replace('/storage/v1/object/public/profile/', '/storage/v1/object/public/certificate/')
    }
    if (trimmed.includes('/storage/v1/object/public/projects/')) {
      return trimmed.replace('/storage/v1/object/public/projects/', '/storage/v1/object/public/certificate/')
    }
    if (trimmed.includes('/storage/v1/object/public/achievements/')) {
      return trimmed.replace('/storage/v1/object/public/achievements/', '/storage/v1/object/public/certificate/')
    }
    if (trimmed.includes('/storage/v1/object/public/resume/')) {
      return trimmed.replace('/storage/v1/object/public/resume/', '/storage/v1/object/public/certificate/')
    }
    return trimmed
  }

  // If local blob/data URL (e.g. during client upload preview)
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed
  }

  // Strip leading slashes and duplicate bucket prefixes
  let cleanPath = trimmed.replace(/^\/?(certificates|certificate|profile|profile picture|profile_picture|projects|achievements|resume|training|co-curricular)\//i, '')
  cleanPath = cleanPath.replace(/^\/+/, '')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  return `${supabaseUrl}/storage/v1/object/public/certificate/${cleanPath}`
}

/**
 * Normalizes any training image or certificate path/URL into a valid public URL.
 * Handles full Supabase URLs, external URLs, client preview blob URLs, and relative storage paths.
 */
export function getTrainingPublicAssetUrl(pathOrUrl?: string | null): string | null {
  return getCertificatePublicUrl(pathOrUrl)
}

/**
 * Normalizes any project image URL or storage path into a fully-qualified public URL.
 * Handles full Supabase URLs (including legacy bucket normalization), external URLs,
 * client preview blob URLs, and relative storage paths.
 */
export function getProjectPublicAssetUrl(pathOrUrl?: string | null): string | null {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return null
  const trimmed = pathOrUrl.trim()
  if (!trimmed) return null

  // 1. Client preview blob / data URLs
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'

  // 2. Full HTTP(S) URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // Legacy /projects/ bucket URLs: normalize to /certificate/projects/
    if (trimmed.includes('/storage/v1/object/public/projects/')) {
      return trimmed.replace('/storage/v1/object/public/projects/', '/storage/v1/object/public/certificate/projects/')
    }
    return trimmed
  }

  // 3. Relative storage paths
  let cleanPath = trimmed.replace(/^\/+/, '')
  // If it starts with 'certificate/', strip the bucket name
  if (cleanPath.toLowerCase().startsWith('certificate/')) {
    cleanPath = cleanPath.slice('certificate/'.length)
  }
  // Ensure the projects/ folder prefix is preserved
  if (!cleanPath.toLowerCase().startsWith('projects/')) {
    cleanPath = `projects/${cleanPath}`
  }

  return `${supabaseUrl}/storage/v1/object/public/certificate/${cleanPath}`
}

/**
 * Single source of truth for resolving any project asset URL.
 */
export function resolveProjectUrl(pathOrUrl?: string | null): string | null {
  return getProjectPublicAssetUrl(pathOrUrl)
}

/**
 * Single source of truth for resolving any certificate or training asset URL.
 * Handles full public URLs, Supabase storage paths across buckets ('certificate', 'projects'),
 * local blob/data URLs, and legacy paths.
 */
export function resolveCertificateUrl(pathOrUrl?: string | null): string | null {
  return getCertificatePublicUrl(pathOrUrl)
}

/**
 * Checks if a given URL or storage path points to a PDF document.
 */
export function isPdfDocument(urlOrPath?: string | null): boolean {
  if (!urlOrPath || typeof urlOrPath !== 'string') return false
  const clean = urlOrPath.split('?')[0].toLowerCase().trim()
  return clean.endsWith('.pdf')
}

/**
 * Generate a unique file path with timestamp (sanitized against path traversal)
 */
export function generateFilePath(originalName: string, prefix?: string): string {
  const rawExt = originalName.split('.').pop()?.toLowerCase() ?? 'bin'
  const ext = rawExt.replace(/[^a-z0-9]/g, '') || 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const cleanPrefix = prefix
    ? prefix
        .replace(/\.\./g, '') // remove directory traversal
        .replace(/[^a-zA-Z0-9_\-\/]/g, '') // strip special characters
        .replace(/^\/+|\/+$/g, '') // trim slashes
    : ''
  const base = cleanPrefix ? `${cleanPrefix}/` : ''
  return `${base}${timestamp}-${random}.${ext}`
}

/**
 * Extracts the relative storage path inside a bucket from a full Supabase URL or relative path.
 * Returns null if the URL is external, blob, data URL, or null/empty.
 */
export function extractStoragePath(
  urlOrPath?: string | null,
  expectedBucket?: string
): string | null {
  if (!urlOrPath || typeof urlOrPath !== 'string') return null
  const trimmed = urlOrPath.trim()
  if (!trimmed) return null

  // Ignore client-side temporary blob & data URLs
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return null

  // If full HTTP(S) URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // Check if it matches Supabase Storage URL pattern: /storage/v1/object/public/<bucket>/<path>
    const storagePattern = /\/storage\/v1\/object\/(?:public|authenticated)\/([^/?#]+)\/(.+?)(?:\?.*)?$/i
    const match = trimmed.match(storagePattern)
    if (match) {
      const decodedBucket = decodeURIComponent(match[1])
      const extractedPath = match[2]
      if (expectedBucket && normalizeBucketName(decodedBucket) !== normalizeBucketName(expectedBucket)) {
        return null
      }
      return extractedPath.replace(/^\/+/, '')
    }

    // If it's another external host (e.g. Unsplash, GitHub), we shouldn't attempt Supabase storage deletion
    return null
  }

  // If it's a relative path: strip leading slashes and optional bucket name prefix
  let clean = trimmed.split('?')[0].replace(/^\/+/, '')
  if (expectedBucket) {
    const norm = normalizeBucketName(expectedBucket)
    const bucketPrefixPattern = new RegExp(`^(?:${norm}|${expectedBucket})\\/`, 'i')
    clean = clean.replace(bucketPrefixPattern, '')
  }
  return clean.replace(/^\/+/, '') || null
}


