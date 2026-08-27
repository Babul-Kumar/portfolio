'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import type { Certificate } from '@/types'
import { formatDate } from '@/lib/utils'
import { ShieldCheck, ExternalLink } from 'lucide-react'
import CertificateMedia from '@/components/certificates/CertificateMedia'

export default function CertificatePreviewSection({
  certificates,
}: {
  certificates: Certificate[]
}) {
  // Deterministic ordering: featured first, then newest (issue_date descending)
  const sortedCertificates = useMemo(() => {
    return [...certificates].sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      const dateA = a.issue_date ? new Date(a.issue_date).getTime() : 0
      const dateB = b.issue_date ? new Date(b.issue_date).getTime() : 0
      return dateB - dateA
    })
  }, [certificates])

  if (certificates.length === 0) return null

  return (
    <section id="certificates" className="section" aria-labelledby="certificates-heading">
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            marginBottom: '40px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '20px',
          }}
        >
          <div className="text-label" style={{ marginBottom: '8px' }}>
            04 / Verified Credentials
          </div>
          <h2 id="certificates-heading" className="text-display-sm">
            VERIFIED<br />
            <span style={{ color: 'var(--color-accent)' }}>CREDENTIALS</span> & SPECIALIZATIONS.
          </h2>
        </div>

        {/* Certificates Responsive Grid - Automatically renders all published records */}
        <div className="certificates-grid">
          {sortedCertificates.map((cert) => (
            <CertificateCard key={cert.id} cert={cert} />
          ))}
        </div>
      </div>

      <style>{`
        .certificates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .cert-card-wrapper {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 420px;
          border-radius: var(--radius-md);
          background: var(--color-card-bg);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-card);
          transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
        }

        .cert-card-wrapper:hover {
          border-color: var(--color-border-hover);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        @media (max-width: 900px) {
          .certificates-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
          }
        }

        @media (max-width: 640px) {
          .certificates-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </section>
  )
}

function CertificateCard({ cert }: { cert: Certificate }) {
  return (
    <article className="cert-card-wrapper">
      <div>
        {/* Certificate Media Preview - uncropped 16/10 contained preview */}
        <Link
          href={`/certificates/${cert.slug}`}
          style={{ display: 'block', textDecoration: 'none', marginBottom: '18px' }}
          aria-label={`View certificate ${cert.title}`}
        >
          <CertificateMedia
            fileUrl={cert.file_url}
            thumbnailUrl={cert.thumbnail_url}
            title={cert.title}
            issuer={cert.issuer}
            category={cert.category}
            aspectRatio="16/10"
            interactive={false}
          />
        </Link>

        {/* Category & Badge Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
              whiteSpace: 'nowrap',
            }}
          >
            {formatDate(cert.issue_date, 'MMM yyyy')}
          </span>
        </div>

        {/* Title (Clamped to 2 lines for uniform card alignment) */}
        <h3
          style={{
            fontSize: '17px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--color-text)',
            marginBottom: '8px',
            lineHeight: 1.35,
            minHeight: '46px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
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
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
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
