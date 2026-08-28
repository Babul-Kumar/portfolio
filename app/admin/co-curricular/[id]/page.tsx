import CoCurricularForm from '@/components/admin/forms/CoCurricularForm'
import { createClient } from '@/lib/supabase/server'
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
      .maybeSingle()

    if (data) {
      activity = data
    }
  } catch {
    // Database lookup failed
  }

  if (!activity) notFound()

  return <CoCurricularForm activity={activity} />
}
