'use client'

import { createClient } from '@/lib/supabase/client'
import { generateFilePath, normalizeBucketName } from '@/lib/supabase/storage'

/**
 * Upload a file directly from the authenticated browser session to Supabase Storage.
 * Uses the user's active Supabase Auth JWT token so RLS evaluates auth.role() = 'authenticated'.
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

    console.log('Initiating authenticated storage upload:', {
      userId: user.id,
      email: user.email,
      bucket: targetBucket,
      path: filePath,
      fileType: file.type,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
    })

    // 3. Upload directly to Supabase Storage with authenticated JWT
    const { data, error: uploadError } = await supabase.storage
      .from(targetBucket)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Certificate storage upload failed:', uploadError)
      return {
        url: '',
        path: '',
        error: uploadError.message,
      }
    }

    // 4. Retrieve public URL
    const { data: { publicUrl } } = supabase.storage
      .from(targetBucket)
      .getPublicUrl(data.path)

    return {
      url: publicUrl,
      path: data.path,
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
