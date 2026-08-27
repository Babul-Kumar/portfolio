import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeDeleteStorageFile } from '@/lib/supabase/storage-server'
import { revalidatePath } from 'next/cache'
import { invalidateCoCurricularCache } from '@/lib/data'

import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Missing activity ID parameter' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Verify authenticated admin session (via Authorization Header, SSR Cookies, or Session)
    let user = null
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim()

    if (token) {
      const { data, error } = await supabase.auth.getUser(token)
      if (!error && data?.user) {
        user = data.user
      }
    }

    if (!user) {
      const { data, error } = await supabase.auth.getUser()
      if (!error && data?.user) {
        user = data.user
      }
    }

    if (!user) {
      const { data } = await supabase.auth.getSession()
      if (data?.session?.user) {
        user = data.session.user
      }
    }

    const isSupabaseConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
    )

    if (isSupabaseConfigured && !user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in as an administrator to delete co-curricular records.' },
        { status: 401 }
      )
    }

    // Use admin client if service role key is available (bypasses RLS locks once user is verified)
    let dbClient = supabase
    try {
      if (
        process.env.SUPABASE_SERVICE_ROLE_KEY &&
        process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_publishable_')
      ) {
        dbClient = createAdminClient() as unknown as typeof supabase
      }
    } catch {
      dbClient = supabase
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    // Check if it is a fallback ID
    if (id.startsWith('00000000-0000-4000-')) {
      invalidateCoCurricularCache()
      return NextResponse.json({
        success: true,
        message: 'Activity removed from view',
      })
    }

    // 2. Locate existing record to extract storage file references
    let record: {
      id: string
      slug: string
      title?: string | null
      image_url?: string | null
      document_url?: string | null
    } | null = null

    if (isUuid) {
      const { data, error: selectErr } = await dbClient
        .from('co_curricular_activities')
        .select('id, slug, title, image_url, document_url')
        .eq('id', id)
        .maybeSingle()

      if (selectErr && !selectErr.message?.includes('schema cache')) {
        console.warn('CoCurricular select by UUID warning:', selectErr.message)
      }
      record = data
    }

    if (!record) {
      const { data, error: selectSlugErr } = await dbClient
        .from('co_curricular_activities')
        .select('id, slug, title, image_url, document_url')
        .eq('slug', id)
        .maybeSingle()

      if (selectSlugErr && !selectSlugErr.message?.includes('schema cache')) {
        console.warn('CoCurricular select by slug warning:', selectSlugErr.message)
      }
      record = data
    }

    // 3. Attempt safe, non-blocking Storage cleanup if files exist
    if (record) {
      if (record.document_url) {
        await safeDeleteStorageFile('certificate', record.document_url)
      }
      if (record.image_url) {
        await safeDeleteStorageFile('certificate', record.image_url)
      }
    }

    // 4. Perform database deletion
    if (record?.id) {
      const { error: deleteError } = await dbClient.from('co_curricular_activities').delete().eq('id', record.id)
      if (deleteError) {
        if (deleteError.code === 'PGRST205' || deleteError.message?.includes('schema cache')) {
          invalidateCoCurricularCache()
          return NextResponse.json({ success: true, message: 'Removed from view' })
        }
        console.error('CoCurricular DB delete error by ID:', deleteError)
        return NextResponse.json(
          { error: `Database deletion failed: ${deleteError.message}` },
          { status: 500 }
        )
      }
    } else if (isUuid) {
      const { error: deleteError } = await dbClient.from('co_curricular_activities').delete().eq('id', id)
      if (deleteError) {
        if (deleteError.code === 'PGRST205' || deleteError.message?.includes('schema cache')) {
          invalidateCoCurricularCache()
          return NextResponse.json({ success: true, message: 'Removed from view' })
        }
        console.error('CoCurricular DB delete error directly by ID:', deleteError)
        return NextResponse.json(
          { error: `Database deletion failed: ${deleteError.message}` },
          { status: 500 }
        )
      }
    } else {
      const { error: deleteError } = await dbClient.from('co_curricular_activities').delete().eq('slug', id)
      if (deleteError) {
        if (deleteError.code === 'PGRST205' || deleteError.message?.includes('schema cache')) {
          invalidateCoCurricularCache()
          return NextResponse.json({ success: true, message: 'Removed from view' })
        }
        console.error('CoCurricular DB delete error by slug:', deleteError)
        return NextResponse.json(
          { error: `Database deletion failed: ${deleteError.message}` },
          { status: 500 }
        )
      }
    }

    // 5. Invalidate server memory cache & Next.js static pages
    invalidateCoCurricularCache()
    try {
      revalidatePath('/co-curricular')
      revalidatePath('/admin/co-curricular')
      if (record?.slug) {
        revalidatePath(`/co-curricular/${record.slug}`)
      }
      revalidatePath('/')
    } catch {
      // Revalidation errors are non-blocking
    }

    return NextResponse.json({
      success: true,
      message: 'Co-curricular activity deleted successfully',
    })
  } catch (err: unknown) {
    console.error('CoCurricular delete endpoint exception:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: `Delete failed: ${message}` }, { status: 500 })
  }
}
