import CertificateForm from '@/components/admin/forms/CertificateForm'
import { createClient } from '@/lib/supabase/server'
import { FALLBACK_CERTIFICATES } from '@/lib/data'
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
      .single()

    if (data) {
      cert = data
    }
  } catch {
    // Database lookup failed, fall through to fallback check
  }

  // If not found in DB by UUID, check fallback dataset by ID or slug
  if (!cert) {
    cert = FALLBACK_CERTIFICATES.find((c) => c.id === id || c.slug === id) || null
  }

  if (!cert) notFound()

  return <CertificateForm certificate={cert} />
}
