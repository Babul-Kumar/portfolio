import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  FALLBACK_PROFILE,
  FALLBACK_PROJECTS,
  FALLBACK_CERTIFICATES,
  FALLBACK_ACHIEVEMENTS,
  FALLBACK_EDUCATION,
  FALLBACK_EXPERIENCE,
  FALLBACK_SKILLS,
  FALLBACK_TRAININGS,
  FALLBACK_CO_CURRICULAR,
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

    const report: Record<string, { inserted: number; updated: number; skipped: number; errors: string[] }> = {
      profile: { inserted: 0, updated: 0, skipped: 0, errors: [] },
      projects: { inserted: 0, updated: 0, skipped: 0, errors: [] },
      certificates: { inserted: 0, updated: 0, skipped: 0, errors: [] },
      training: { inserted: 0, updated: 0, skipped: 0, errors: [] },
      co_curricular: { inserted: 0, updated: 0, skipped: 0, errors: [] },
      achievements: { inserted: 0, updated: 0, skipped: 0, errors: [] },
      education: { inserted: 0, updated: 0, skipped: 0, errors: [] },
      experience: { inserted: 0, updated: 0, skipped: 0, errors: [] },
      skills: { inserted: 0, updated: 0, skipped: 0, errors: [] },
    }

    // Helper to strip local ID & timestamp fields for Supabase insertion
    function stripMeta<T extends Record<string, unknown>>(item: T) {
      const copy = { ...item }
      delete copy.id
      delete copy.created_at
      delete copy.updated_at
      return copy
    }

    // 1. Sync Profile
    const { data: existingProfile } = await supabase.from('profiles').select('id').limit(1).single()
    if (!existingProfile) {
      const { error } = await supabase.from('profiles').insert(stripMeta(FALLBACK_PROFILE as unknown as Record<string, unknown>))
      if (error) report.profile.errors.push(error.message)
      else report.profile.inserted++
    } else {
      report.profile.skipped++
    }

    // 2. Sync Projects
    for (const project of FALLBACK_PROJECTS) {
      const { data: existing } = await supabase.from('projects').select('id').eq('slug', project.slug).single()
      if (!existing) {
        const { error } = await supabase.from('projects').insert(stripMeta(project as unknown as Record<string, unknown>))
        if (error) report.projects.errors.push(`${project.title}: ${error.message}`)
        else report.projects.inserted++
      } else {
        report.projects.skipped++
      }
    }

    // 3. Sync Certificates
    for (const cert of FALLBACK_CERTIFICATES) {
      const { data: existing } = await supabase.from('certificates').select('id').eq('slug', cert.slug).single()
      if (!existing) {
        const { error } = await supabase.from('certificates').insert(stripMeta(cert as unknown as Record<string, unknown>))
        if (error) report.certificates.errors.push(`${cert.title}: ${error.message}`)
        else report.certificates.inserted++
      } else {
        report.certificates.skipped++
      }
    }

    // 4. Sync Training
    for (const trn of FALLBACK_TRAININGS) {
      const { data: existing } = await supabase.from('training').select('id').eq('slug', trn.slug).single()
      if (!existing) {
        const { error } = await supabase.from('training').insert(stripMeta(trn as unknown as Record<string, unknown>))
        if (error) report.training.errors.push(`${trn.title}: ${error.message}`)
        else report.training.inserted++
      } else {
        report.training.skipped++
      }
    }

    // 5. Sync Co-Curricular Activities
    for (const act of FALLBACK_CO_CURRICULAR) {
      const { data: existing } = await supabase.from('co_curricular_activities').select('id').eq('slug', act.slug).single()
      if (!existing) {
        const { error } = await supabase.from('co_curricular_activities').insert(stripMeta(act as unknown as Record<string, unknown>))
        if (error) report.co_curricular.errors.push(`${act.title}: ${error.message}`)
        else report.co_curricular.inserted++
      } else {
        report.co_curricular.skipped++
      }
    }

    // 6. Sync Achievements
    for (const ach of FALLBACK_ACHIEVEMENTS) {
      const { data: existing } = await supabase.from('achievements').select('id').eq('slug', ach.slug).single()
      if (!existing) {
        const { error } = await supabase.from('achievements').insert(stripMeta(ach as unknown as Record<string, unknown>))
        if (error) report.achievements.errors.push(`${ach.title}: ${error.message}`)
        else report.achievements.inserted++
      } else {
        report.achievements.skipped++
      }
    }

    // 7. Sync Education
    for (const edu of FALLBACK_EDUCATION) {
      const { data: existing } = await supabase
        .from('education')
        .select('id')
        .eq('institution', edu.institution)
        .eq('degree', edu.degree)
        .single()
      if (!existing) {
        const { error } = await supabase.from('education').insert(stripMeta(edu as unknown as Record<string, unknown>))
        if (error) report.education.errors.push(`${edu.institution}: ${error.message}`)
        else report.education.inserted++
      } else {
        report.education.skipped++
      }
    }

    // 8. Sync Experience
    for (const exp of FALLBACK_EXPERIENCE) {
      const { data: existing } = await supabase
        .from('experience')
        .select('id')
        .eq('company', exp.company)
        .eq('role', exp.role)
        .single()
      if (!existing) {
        const { error } = await supabase.from('experience').insert(stripMeta(exp as unknown as Record<string, unknown>))
        if (error) report.experience.errors.push(`${exp.company}: ${error.message}`)
        else report.experience.inserted++
      } else {
        report.experience.skipped++
      }
    }

    // 9. Sync Skills
    for (const skill of FALLBACK_SKILLS) {
      const { data: existing } = await supabase
        .from('skills')
        .select('id')
        .eq('name', skill.name)
        .eq('category', skill.category)
        .single()
      if (!existing) {
        const { error } = await supabase.from('skills').insert(stripMeta(skill as unknown as Record<string, unknown>))
        if (error) report.skills.errors.push(`${skill.name}: ${error.message}`)
        else report.skills.inserted++
      } else {
        report.skills.skipped++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Idempotent content synchronization completed successfully',
      report,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown sync error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
