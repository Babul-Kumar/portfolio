import { getPublicSupabase } from '@/lib/supabase/public'
import type {
  Profile, Project, Certificate, Achievement,
  Education, Experience, Skill, SocialLink,
  PortfolioStats, SkillsByCategory, AchievementsByYear
} from '@/types'
import { groupBy, getYear } from '@/lib/utils'

// ============================================================
// Profile
// ============================================================
export async function getProfile(): Promise<Profile | null> {
  const supabase = getPublicSupabase()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .single()
  return data
}

// ============================================================
// Projects
// ============================================================
export async function getProjects(options?: {
  category?: string
  featured?: boolean
  limit?: number
}): Promise<Project[]> {
  const supabase = getPublicSupabase()
  let query = supabase
    .from('projects')
    .select('*, project_images(*)')
    .eq('published', true)
    .order('sort_order', { ascending: true })

  if (options?.category && options.category !== 'All') {
    query = query.eq('category', options.category)
  }
  if (options?.featured !== undefined) {
    query = query.eq('featured', options.featured)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data } = await query
  return data ?? []
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = getPublicSupabase()
  const { data } = await supabase
    .from('projects')
    .select('*, project_images(*)')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return data
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const supabase = getPublicSupabase()
  const { data } = await supabase
    .from('projects')
    .select('slug')
    .eq('published', true)
  return data?.map((p) => p.slug) ?? []
}

// ============================================================
// Certificates
// ============================================================
export async function getCertificates(options?: {
  category?: string
  issuer?: string
  search?: string
  limit?: number
  featured?: boolean
}): Promise<Certificate[]> {
  const supabase = getPublicSupabase()
  let query = supabase
    .from('certificates')
    .select('*')
    .eq('published', true)
    .order('issue_date', { ascending: false })

  if (options?.category && options.category !== 'All') {
    query = query.eq('category', options.category)
  }
  if (options?.issuer) {
    query = query.ilike('issuer', `%${options.issuer}%`)
  }
  if (options?.search) {
    query = query.or(
      `title.ilike.%${options.search}%,issuer.ilike.%${options.search}%`
    )
  }
  if (options?.featured !== undefined) {
    query = query.eq('featured', options.featured)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data } = await query
  return data ?? []
}

export async function getCertificateBySlug(slug: string): Promise<Certificate | null> {
  const supabase = getPublicSupabase()
  const { data } = await supabase
    .from('certificates')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return data
}

export async function getAllCertificateSlugs(): Promise<string[]> {
  const supabase = getPublicSupabase()
  const { data } = await supabase
    .from('certificates')
    .select('slug')
    .eq('published', true)
  return data?.map((c) => c.slug) ?? []
}

export async function getCertificateIssuers(): Promise<string[]> {
  const supabase = getPublicSupabase()
  const { data } = await supabase
    .from('certificates')
    .select('issuer')
    .eq('published', true)
  const issuers = [...new Set(data?.map((c) => c.issuer) ?? [])]
  return issuers.sort()
}

// ============================================================
// Achievements
// ============================================================
export async function getAchievements(options?: {
  category?: string
  limit?: number
  featured?: boolean
}): Promise<Achievement[]> {
  const supabase = getPublicSupabase()
  let query = supabase
    .from('achievements')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false })

  if (options?.category && options.category !== 'All') {
    query = query.eq('category', options.category)
  }
  if (options?.featured !== undefined) {
    query = query.eq('featured', options.featured)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data } = await query
  return data ?? []
}

export async function getAchievementsByYear(): Promise<AchievementsByYear> {
  const achievements = await getAchievements()
  return groupBy(achievements, (a) => getYear(a.date))
}

// ============================================================
// Education
// ============================================================
export async function getEducation(): Promise<Education[]> {
  const supabase = getPublicSupabase()
  const { data } = await supabase
    .from('education')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
  return data ?? []
}

// ============================================================
// Experience
// ============================================================
export async function getExperience(): Promise<Experience[]> {
  const supabase = getPublicSupabase()
  const { data } = await supabase
    .from('experience')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
  return data ?? []
}

// ============================================================
// Skills
// ============================================================
export async function getSkills(options?: {
  featured?: boolean
}): Promise<Skill[]> {
  const supabase = getPublicSupabase()
  let query = supabase
    .from('skills')
    .select('*')
    .eq('published', true)
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })

  if (options?.featured !== undefined) {
    query = query.eq('featured', options.featured)
  }

  const { data } = await query
  return data ?? []
}

export async function getSkillsByCategory(): Promise<SkillsByCategory> {
  const skills = await getSkills()
  return groupBy(skills, (s) => s.category)
}

// ============================================================
// Social Links
// ============================================================
export async function getSocialLinks(): Promise<SocialLink[]> {
  const supabase = getPublicSupabase()
  const { data } = await supabase
    .from('social_links')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
  return data ?? []
}

// ============================================================
// Portfolio Stats (computed)
// ============================================================
export async function getPortfolioStats(): Promise<PortfolioStats> {
  const supabase = getPublicSupabase()

  const [
    { count: projects },
    { count: certificates },
    { count: achievements },
    { count: hackathons },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('achievements').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('achievements').select('*', { count: 'exact', head: true }).eq('published', true).eq('category', 'Hackathon'),
  ])

  return {
    projects: projects ?? 0,
    certificates: certificates ?? 0,
    achievements: achievements ?? 0,
    hackathons: hackathons ?? 0,
  }
}

// ============================================================
// Site Setting
// ============================================================
export async function getSiteSetting(key: string): Promise<string | null> {
  const supabase = getPublicSupabase()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single()
  return data?.value ?? null
}
