import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateFilePath, normalizeBucketName, BUCKETS } from '@/lib/supabase/storage'

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/avif',
  'application/pdf',
]
const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

export async function POST(request: NextRequest) {
  // Verify auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const rawBucket = (formData.get('bucket') as string | null)?.trim()
    const prefix = formData.get('prefix') as string | null

    if (!file || !rawBucket) {
      return NextResponse.json({ error: 'Missing file or bucket' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `File type not allowed: ${file.type}` }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `File too large. Max size is 20MB` }, { status: 400 })
    }

    const bucket = normalizeBucketName(rawBucket)
    const validBuckets: string[] = [
      ...Object.values(BUCKETS),
      'certificates',
      'certificate',
      'profile',
      'profile picture',
      'projects',
      'achievements',
      'resume',
    ]
    if (!validBuckets.includes(bucket) && !validBuckets.includes(rawBucket)) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
    }

    const filePath = generateFilePath(file.name, prefix ?? undefined)
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Prefer service role client if configured, otherwise use user client
    let storageClient = supabase
    try {
      if (
        process.env.SUPABASE_SERVICE_ROLE_KEY &&
        process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        storageClient = createAdminClient() as unknown as typeof supabase
      }
    } catch {
      storageClient = supabase
    }

    const { data, error } = await storageClient.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      })

    if (error) {
      console.error(`Upload error to bucket "${bucket}":`, error)
      const errorMsg = error.message.includes('row-level security')
        ? `Storage RLS Policy Violation: Please run the storage policies SQL in Supabase SQL Editor for bucket "${bucket}", or set the bucket to Public in Supabase Dashboard.`
        : error.message
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const { data: { publicUrl } } = storageClient.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return NextResponse.json({ url: publicUrl, path: data.path })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    console.error('Upload error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
