import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { generateFilePath, normalizeBucketName, BUCKETS } from '@/lib/supabase/storage'

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/avif',
  'application/pdf',
]
const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export async function POST(request: NextRequest) {
  // 1. Verify authenticated admin session (via cookies or Authorization header)
  const supabase = await createClient()
  let { data: { user }, error: userError } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()

  const authHeader = request.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  let activeToken = session?.access_token || bearerToken

  if ((userError || !user) && bearerToken) {
    const { data: tokenUser, error: tokenError } = await supabase.auth.getUser(bearerToken)
    if (!tokenError && tokenUser.user) {
      user = tokenUser.user
      userError = null
      activeToken = bearerToken
    }
  }

  if (userError || !user) {
    return NextResponse.json(
      { error: 'Your admin session has expired. Please log in again.' },
      { status: 401 }
    )
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

    // Build authenticated storage client
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
    } else if (activeToken) {
      // Forward the active user's JWT access token to Supabase Storage
      storageClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        },
        auth: { persistSession: false },
      }) as unknown as typeof supabase
    }

    console.log('Server Storage Upload Request:', {
      userId: user.id,
      email: user.email,
      bucket,
      filePath,
      fileType: file.type,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      authMethod: hasDistinctServiceKey ? 'service_role' : session?.access_token ? 'user_jwt' : 'ssr_client',
    })

    const { data, error } = await storageClient.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error(`Upload error to bucket "${bucket}":`, error)
      return NextResponse.json({ error: error.message }, { status: 400 })
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
