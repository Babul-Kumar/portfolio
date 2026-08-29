import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  FALLBACK_PROFILE,
  FAKE_PROJECT_SLUGS,
  FAKE_TRAINING_SLUGS,
  FAKE_CO_CURRICULAR_SLUGS,
  FAKE_ACHIEVEMENT_SLUGS,
  flushAllCache,
} from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createClient()

    // 1. Verify authenticated admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized — administrator login required' }, { status: 401 })
    }

    const report = {
      purgedFakeProjects: 0,
      purgedFakeTrainings: 0,
      purgedFakeCoCurricular: 0,
      purgedFakeAchievements: 0,
      profileSynced: false,
      revalidated: true,
    }

    // 2. Permanently delete all fake/duplicate seed slugs from database
    const [projDel, trainDel, coDel, achDel] = await Promise.allSettled([
      supabase.from('projects').delete().in('slug', FAKE_PROJECT_SLUGS).select('id'),
      supabase.from('training').delete().in('slug', FAKE_TRAINING_SLUGS).select('id'),
      supabase.from('co_curricular_activities').delete().in('slug', FAKE_CO_CURRICULAR_SLUGS).select('id'),
      supabase.from('achievements').delete().in('slug', FAKE_ACHIEVEMENT_SLUGS).select('id'),
    ])

    if (projDel.status === 'fulfilled' && projDel.value.data) {
      report.purgedFakeProjects = projDel.value.data.length
    }
    if (trainDel.status === 'fulfilled' && trainDel.value.data) {
      report.purgedFakeTrainings = trainDel.value.data.length
    }
    if (coDel.status === 'fulfilled' && coDel.value.data) {
      report.purgedFakeCoCurricular = coDel.value.data.length
    }
    if (achDel.status === 'fulfilled' && achDel.value.data) {
      report.purgedFakeAchievements = achDel.value.data.length
    }

    // 3. Ensure profile exists (only if completely empty)
    const { data: existingProfile } = await supabase.from('profiles').select('id').limit(1).single()
    if (!existingProfile) {
      const copy = { ...FALLBACK_PROFILE } as Record<string, unknown>
      delete copy.id
      delete copy.created_at
      delete copy.updated_at
      await supabase.from('profiles').insert(copy)
      report.profileSynced = true
    }

    // 4. Invalidate memory cache and revalidate all routes
    flushAllCache()
    revalidatePath('/')
    revalidatePath('/projects')
    revalidatePath('/certificates')
    revalidatePath('/training')
    revalidatePath('/co-curricular')
    revalidatePath('/achievements')
    revalidatePath('/admin')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/projects')
    revalidatePath('/admin/certificates')
    revalidatePath('/admin/training')
    revalidatePath('/admin/co-curricular')
    revalidatePath('/admin/achievements')

    return NextResponse.json({
      success: true,
      message: 'Database purified of fake seed data and synchronized with CMS.',
      report,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database sync error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
