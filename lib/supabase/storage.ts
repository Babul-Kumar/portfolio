import { createClient } from '@/lib/supabase/server'

// Storage bucket names
export const BUCKETS = {
  CERTIFICATES: 'certificates',
  PROJECTS: 'projects',
  ACHIEVEMENTS: 'achievements',
  PROFILE: 'profile',
  RESUME: 'resume',
} as const

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS]

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
export function getPublicUrl(bucket: BucketName, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

/**
 * Upload a file to Supabase Storage (server-side)
 */
export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File | Blob,
  contentType?: string
): Promise<{ url: string; path: string; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    })

  if (error) {
    return { url: '', path: '', error: error.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return { url: publicUrl, path: data.path, error: null }
}

/**
 * Delete a file from Supabase Storage (server-side)
 */
export async function deleteFile(
  bucket: BucketName,
  path: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase.storage
    .from(bucket)
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
