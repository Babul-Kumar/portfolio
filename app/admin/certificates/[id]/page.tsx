import CertificateForm from '@/components/admin/forms/CertificateForm'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let cert = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (data) {
      cert = data
    }
  } catch {
    // Database lookup failed
  }

  if (!cert) notFound()

  return <CertificateForm certificate={cert} />
}
