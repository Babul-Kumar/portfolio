import AdminProjectForm from '@/components/admin/forms/ProjectForm'
import { createClient } from '@/lib/supabase/server'
import { FALLBACK_PROJECTS } from '@/lib/data'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let project = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      project = data
    }
  } catch {
    // Database lookup failed, fall through to fallback check
  }

  // If not found in DB by UUID, check fallback dataset by ID or slug
  if (!project) {
    project = FALLBACK_PROJECTS.find((p) => p.id === id || p.slug === id) || null
  }

  if (!project) notFound()

  return <AdminProjectForm project={project} />
}
