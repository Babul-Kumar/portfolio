import { getCertificates } from '@/lib/data'
import type { Metadata } from 'next'
import CertificatesClientView from '@/components/certificates/CertificatesClientView'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'
import PageHeader from '@/components/layout/PageHeader'

export const revalidate = 60 // 1-minute ISR / on-demand revalidation

export const metadata: Metadata = {
  title: 'Certificates & Specializations — Babul Kumar',
  description:
    'Verified credentials and technical specializations across Artificial Intelligence, Machine Learning, Deep Learning, and Full-Stack Systems.',
}

export default async function CertificatesPage() {
  const certificates = await getCertificates()

  return (
    <div style={{ position: 'relative', overflow: 'hidden', padding: 'var(--section-gap) var(--container-pad)', minHeight: '85vh' }}>
      <AmbientSectionEnvironment variant="verification" intensity={0.45} accentMode="cyan" />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Futuristic Module Page Header */}
        <PageHeader
          moduleTag="// CERTIFICATION_DATABASE"
          title={
            <>
              VERIFIED CREDENTIALS &amp;<br />
              TECHNICAL CERTIFICATIONS
            </>
          }
          quote="Proof of continuous learning."
          description="Verified credentials and technical specializations across Artificial Intelligence, Machine Learning, Systems Engineering, and Modern Full-Stack Development."
          statusBadge="AUTHENTICITY_VERIFIED"
        />

        {/* Dynamic Database-Driven Certificates View */}
        <CertificatesClientView initialCertificates={certificates} />
      </div>
    </div>
  )
}
