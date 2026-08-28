import AdminProjectForm from '@/components/admin/forms/ProjectForm'
import { createClient } from '@/lib/supabase/server'
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
      .maybeSingle()

    if (data) {
      project = data
    }
  } catch {
    // Database lookup failed
  }

  if (!project) notFound()

  return <AdminProjectForm project={project} />
}
