import TrainingForm from '@/components/admin/forms/TrainingForm'
import { createClient } from '@/lib/supabase/server'
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
      .maybeSingle()

    if (data) {
      training = data
    }
  } catch {
    // Database lookup failed
  }

  if (!training) notFound()

  return <TrainingForm training={training} />
}
