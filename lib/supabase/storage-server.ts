import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { normalizeBucketName, extractStoragePath } from '@/lib/supabase/storage'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

/**
 * Upload a file to Supabase Storage (server-side with authenticated session)
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  contentType?: string
): Promise<{ url: string; path: string; error: string | null }> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const targetBucket = normalizeBucketName(bucket)

  let storageClient = supabase
  const hasDistinctServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_publishable_')

  if (hasDistinctServiceKey) {
    try {
      storageClient = createAdminClient() as unknown as typeof supabase
    } catch {
      storageClient = supabase
    }
  } else if (session?.access_token) {
    storageClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
      auth: { persistSession: false },
    }) as unknown as typeof supabase
  }

  const { data, error } = await storageClient.storage
    .from(targetBucket)
    .upload(path, file, {
      contentType,
      upsert: false,
    })

  if (error) {
    return { url: '', path: '', error: error.message }
  }

  const { data: { publicUrl } } = storageClient.storage
    .from(targetBucket)
    .getPublicUrl(data.path)

  return { url: publicUrl, path: data.path, error: null }
}

/**
 * Delete a file from Supabase Storage (server-side with authenticated session)
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const targetBucket = normalizeBucketName(bucket)

  let storageClient = supabase
  const hasDistinctServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_publishable_')

  if (hasDistinctServiceKey) {
    try {
      storageClient = createAdminClient() as unknown as typeof supabase
    } catch {
      storageClient = supabase
    }
  } else if (session?.access_token) {
    storageClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
      auth: { persistSession: false },
    }) as unknown as typeof supabase
  }

  const { error } = await storageClient.storage
    .from(targetBucket)
    .remove([path])

  return { error: error?.message ?? null }
}

/**
 * Safely deletes a file from Supabase Storage given a full URL or storage path.
 * Non-blocking: will never throw and handles missing/invalid files gracefully.
 */
export async function safeDeleteStorageFile(
  bucket: string,
  urlOrPath?: string | null
): Promise<void> {
  if (!urlOrPath) return
  try {
    const cleanPath = extractStoragePath(urlOrPath, bucket)
    if (!cleanPath) return
    const { error } = await deleteFile(bucket, cleanPath)
    if (error) {
      console.warn(`Safe storage cleanup notice: could not remove "${cleanPath}" from "${bucket}": ${error}`)
    }
  } catch (err: unknown) {
    console.warn('Safe storage cleanup skipped with error:', err)
  }
}

