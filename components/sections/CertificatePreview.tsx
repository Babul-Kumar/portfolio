import Link from 'next/link'
import Image from 'next/image'
import type { Certificate } from '@/types'
import { formatDate } from '@/lib/utils'

export default function CertificatePreviewSection({ certificates }: { certificates: Certificate[] }) {
  if (certificates.length === 0) return null

  return (
    <section style={{ padding: 'var(--section-gap) var(--container-pad)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="text-label" style={{ marginBottom: '12px' }}>04 / Credentials</div>
            <h2 className="text-display-sm">CERTIFICATE<br />ARCHIVE</h2>
          </div>
          <Link
            href="/certificates"
            className="hover-text-accent"
            style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
          >
            Browse all →
          </Link>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {certificates.map((cert) => (
            <CertCard key={cert.id} cert={cert} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CertCard({ cert }: { cert: Certificate }) {
  return (
    <Link href={`/certificates/${cert.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        className="hover-card-lift"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        {/* Thumbnail */}
        <div style={{
          height: '140px',
          background: 'var(--color-surface-2)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid var(--color-border)',
        }}>
          {cert.thumbnail_url ? (
            <Image
              src={cert.thumbnail_url}
              alt={cert.title}
              width={400}
              height={140}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          ) : (
            <div style={{ fontSize: '32px', opacity: 0.2 }}>◇</div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '16px' }}>
          <div style={{
            fontSize: '10px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: '6px',
          }}>
            {cert.category}
          </div>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--color-text)',
            marginBottom: '4px',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}>
            {cert.title}
          </h3>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {cert.issuer} · {formatDate(cert.issue_date)}
          </div>
        </div>
      </article>
    </Link>
  )
}
