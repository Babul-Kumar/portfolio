import { getCertificates } from '@/lib/data'
import type { Metadata } from 'next'
import CertificatesClientView from '@/components/certificates/CertificatesClientView'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'

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
        {/* Page Header */}
        <div
          style={{
            marginBottom: '48px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '28px',
          }}
        >
          <div className="text-label" style={{ marginBottom: '12px' }}>
            Verified Specializations
          </div>
          <h1 className="text-display" style={{ maxWidth: '700px', marginBottom: '18px' }}>
            ALL<br />CERTIFICATES
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
              maxWidth: '560px',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Verified credentials and technical specializations across Artificial Intelligence,
            Machine Learning, Systems Engineering, and Modern Full-Stack Development.
          </p>
        </div>

        {/* Dynamic Database-Driven Certificates View */}
        <CertificatesClientView initialCertificates={certificates} />
      </div>
    </div>
  )
}
