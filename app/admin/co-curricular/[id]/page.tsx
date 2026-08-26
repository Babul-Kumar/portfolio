import CoCurricularForm from '@/components/admin/forms/CoCurricularForm'
import { createClient } from '@/lib/supabase/server'
import { FALLBACK_CO_CURRICULAR } from '@/lib/data'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditCoCurricularPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let activity = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('co_curricular_activities')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      activity = data
    }
  } catch {
    // Database lookup failed, fall through to fallback check
  }

  // If not found in DB by UUID, check fallback dataset by ID or slug
  if (!activity) {
    activity = FALLBACK_CO_CURRICULAR.find((a) => a.id === id || a.slug === id) || null
  }

  if (!activity) notFound()

  return <CoCurricularForm activity={activity} />
}
