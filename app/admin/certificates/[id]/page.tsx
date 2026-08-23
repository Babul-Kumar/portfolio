import CertificateForm from '@/components/admin/forms/CertificateForm'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditCertPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('certificates').select('*').eq('id', id).single()
  if (!data) notFound()
  return <CertificateForm certificate={data} />
}
