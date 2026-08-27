'use client'

import { createClient } from '@/lib/supabase/client'
import { generateFilePath, normalizeBucketName } from '@/lib/supabase/storage'

/**
 * Upload a file directly from the authenticated browser session to Supabase Storage.
 * Uses the user's active Supabase Auth JWT token so RLS evaluates auth.role() = 'authenticated'.
 * Automatically falls back to /api/admin/upload if direct browser upload encounters RLS restrictions.
 */
export async function uploadFileFromBrowser(
  bucket: string,
  file: File,
  prefix?: string
): Promise<{ url: string; path: string; error: string | null }> {
  try {
    const supabase = createClient()
    const targetBucket = normalizeBucketName(bucket)

    // 1. Verify current authenticated admin session
    const { data: { session } } = await supabase.auth.getSession()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.warn('Upload aborted: No active authenticated Supabase session found.')
      return {
        url: '',
        path: '',
        error: 'Your admin session has expired. Please log in again.',
      }
    }

    // 2. Generate clean storage path
    const filePath = generateFilePath(file.name, prefix)

    // 3. Try direct upload to Supabase Storage with authenticated JWT
    const { data, error: uploadError } = await supabase.storage
      .from(targetBucket)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (!uploadError && data?.path) {
      const { data: { publicUrl } } = supabase.storage
        .from(targetBucket)
        .getPublicUrl(data.path)

      return {
        url: publicUrl,
        path: data.path,
        error: null,
      }
    }

    // If direct upload returned an RLS error or failed, fallback to server upload route
    console.warn(`Direct client storage upload notice (${uploadError?.message}), delegating to /api/admin/upload route...`)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', targetBucket)
    if (prefix) formData.append('prefix', prefix)

    const headers: Record<string, string> = {}
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
      headers,
    })

    const result = await res.json()
    if (!res.ok || result.error) {
      const errMsg = result.error || uploadError?.message || 'Upload failed'
      console.error('Storage upload failed:', errMsg)
      return {
        url: '',
        path: '',
        error: errMsg,
      }
    }

    return {
      url: result.url,
      path: result.path,
      error: null,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected upload error'
    console.error('Upload exception:', err)
    return {
      url: '',
      path: '',
      error: msg,
    }
  }
}

