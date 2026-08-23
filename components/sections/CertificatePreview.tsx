'use client'

import Link from 'next/link'
import type { Certificate } from '@/types'
import { formatDate } from '@/lib/utils'
import { ShieldCheck, ExternalLink, ArrowRight } from 'lucide-react'

export default function CertificatePreviewSection({
  certificates,
}: {
  certificates: Certificate[]
}) {
  if (certificates.length === 0) return null

  return (
    <section id="certificates" className="section">
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '56px',
            flexWrap: 'wrap',
            gap: '20px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '24px',
          }}
        >
          <div>
            <div className="text-label" style={{ marginBottom: '12px' }}>
              02 / Verified Credentials
            </div>
            <h2 className="text-display-sm">
              CERTIFICATES
            </h2>
          </div>

          <Link
            href="/certificates"
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-accent-bg)',
              border: '1px solid var(--color-accent-border)',
              transition: 'all 0.2s ease',
              fontWeight: 500,
            }}
          >
            <span>View All Credentials</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Certificates Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
          className="certificates-grid"
        >
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} cert={cert} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .certificates-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}

function CertificateCard({ cert }: { cert: Certificate }) {
  return (
    <article
      className="glass-card card-3d-tilt"
      style={{
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '280px',
      }}
    >
      <div>
        {/* Category & Badge Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                background: 'var(--color-accent-bg)',
                border: '1px solid var(--color-accent-border)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
              }}
            >
              {cert.category}
            </span>
            <span
              style={{
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-success)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <ShieldCheck size={11} /> VERIFIED
            </span>
          </div>

          <span
            style={{
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {formatDate(cert.issue_date, 'MMM yyyy')}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--color-text)',
            marginBottom: '8px',
            lineHeight: 1.3,
          }}
        >
          <Link
            href={`/certificates/${cert.slug}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {cert.title}
          </Link>
        </h3>

        {/* Issuer */}
        <div
          style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            marginBottom: '12px',
          }}
        >
          Issued by <strong style={{ color: 'var(--color-text)' }}>{cert.issuer}</strong>
        </div>

        {/* Credential ID */}
        {cert.credential_id && (
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
              marginBottom: '14px',
            }}
          >
            ID: {cert.credential_id}
          </div>
        )}

        {/* Skills Preview */}
        {cert.skills && cert.skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {cert.skills.slice(0, 3).map((s) => (
              <span
                key={s}
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-muted)',
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {s}
              </span>
            ))}
            {cert.skills.length > 3 && (
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                +{cert.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {cert.verification_url ? (
          <a
            href={cert.verification_url}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-accent)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500,
            }}
          >
            <span>Verify</span>
            <ExternalLink size={12} />
          </a>
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Verified Document</span>
        )}

        <Link
          href={`/certificates/${cert.slug}`}
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 500,
          }}
          className="hover-accent-text"
        >
          <span>Details</span>
          <span>→</span>
        </Link>
      </div>
    </article>
  )
}
