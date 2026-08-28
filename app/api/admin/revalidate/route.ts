import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  invalidateCertificateCache,
  invalidateProjectCache,
  invalidateTrainingCache,
  invalidateCoCurricularCache,
  invalidateProfileCache,
  invalidateExperienceCache,
  invalidateEducationCache,
  invalidateAchievementCache,
  invalidateSkillCache,
} from '@/lib/data'

export async function POST(request: NextRequest) {
  // Check admin authorization via session or service role key
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const authHeader = request.headers.get('authorization')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const isServiceAuth = Boolean(serviceKey && authHeader === `Bearer ${serviceKey}`)

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !user && !isServiceAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { type, slug } = body

    // 1. Flush in-memory cache and revalidate pages
    if (type === 'certificates' || !type) {
      invalidateCertificateCache()
      revalidatePath('/certificates')
      revalidatePath('/')
      if (slug) {
        revalidatePath(`/certificates/${slug}`)
      }
    }

    if (type === 'projects' || !type) {
      invalidateProjectCache()
      revalidatePath('/projects')
      revalidatePath('/')
      if (slug) {
        revalidatePath(`/projects/${slug}`)
      }
    }

    if (type === 'training' || !type) {
      invalidateTrainingCache()
      revalidatePath('/training')
      revalidatePath('/')
      if (slug) {
        revalidatePath(`/training/${slug}`)
      }
    }

    if (type === 'co-curricular' || !type) {
      invalidateCoCurricularCache()
      revalidatePath('/co-curricular')
      revalidatePath('/')
      if (slug) {
        revalidatePath(`/co-curricular/${slug}`)
      }
    }

    if (type === 'experience' || !type) {
      invalidateExperienceCache()
      revalidatePath('/experience')
      revalidatePath('/')
      revalidatePath('/about')
      revalidatePath('/resume')
    }

    if (type === 'education' || !type) {
      invalidateEducationCache()
      revalidatePath('/education')
      revalidatePath('/')
      revalidatePath('/about')
      revalidatePath('/resume')
    }

    if (type === 'achievements' || !type) {
      invalidateAchievementCache()
      revalidatePath('/achievements')
      revalidatePath('/')
    }

    if (type === 'skills' || !type) {
      invalidateSkillCache()
      revalidatePath('/resume')
      revalidatePath('/')
      revalidatePath('/about')
    }

    if (type === 'profile' || !type) {
      invalidateProfileCache()
      revalidatePath('/', 'layout')
      revalidatePath('/')
      revalidatePath('/about')
      revalidatePath('/contact')
    }

    return NextResponse.json({
      success: true,
      message: `Revalidated paths for ${type || 'all'} successfully`,
      timestamp: new Date().toISOString(),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Revalidation failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
