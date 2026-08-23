import { createClient } from '@/lib/supabase/server'

// Storage bucket names aligned with Supabase Storage
export const BUCKETS = {
  CERTIFICATES: 'certificate',
  PROFILE: 'profile picture',
  PROJECTS: 'projects',
  ACHIEVEMENTS: 'achievements',
  RESUME: 'resume',
} as const

export type BucketName =
  | (typeof BUCKETS)[keyof typeof BUCKETS]
  | 'certificates'
  | 'profile'
  | 'certificate'
  | 'profile picture'

/**
 * Normalizes bucket name aliases (e.g. 'certificates' -> 'certificate', 'profile' -> 'profile picture')
 */
export function normalizeBucketName(bucket: string): string {
  const map: Record<string, string> = {
    certificates: 'certificate',
    certificate: 'certificate',
    profile: 'profile picture',
    'profile picture': 'profile picture',
    projects: 'projects',
    achievements: 'achievements',
    resume: 'resume',
  }
  return map[bucket.toLowerCase().trim()] || bucket
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const normalized = normalizeBucketName(bucket)
  const encodedBucket = encodeURIComponent(normalized)
  return `${supabaseUrl}/storage/v1/object/public/${encodedBucket}/${path}`
}

/**
 * Upload a file to Supabase Storage (server-side)
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  contentType?: string
): Promise<{ url: string; path: string; error: string | null }> {
  const supabase = await createClient()
  const targetBucket = normalizeBucketName(bucket)

  const { data, error } = await supabase.storage
    .from(targetBucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    })

  if (error) {
    return { url: '', path: '', error: error.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(targetBucket)
    .getPublicUrl(data.path)

  return { url: publicUrl, path: data.path, error: null }
}

/**
 * Delete a file from Supabase Storage (server-side)
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const targetBucket = normalizeBucketName(bucket)

  const { error } = await supabase.storage
    .from(targetBucket)
    .remove([path])

  return { error: error?.message ?? null }
}

/**
 * Generate a unique file path with timestamp
 */
export function generateFilePath(originalName: string, prefix?: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() ?? 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const base = prefix ? `${prefix}/` : ''
  return `${base}${timestamp}-${random}.${ext}`
}
