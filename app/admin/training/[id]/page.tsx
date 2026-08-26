import TrainingForm from '@/components/admin/forms/TrainingForm'
import { createClient } from '@/lib/supabase/server'
import { FALLBACK_TRAININGS } from '@/lib/data'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditTrainingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let training = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('training')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      training = data
    }
  } catch {
    // Database lookup failed, fall through to fallback check
  }

  // If not found in DB by UUID, check fallback dataset by ID or slug
  if (!training) {
    training = FALLBACK_TRAININGS.find((t) => t.id === id || t.slug === id) || null
  }

  if (!training) notFound()

  return <TrainingForm training={training} />
}
