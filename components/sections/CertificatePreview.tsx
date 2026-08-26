'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import type { Certificate } from '@/types'
import { formatDate } from '@/lib/utils'
import { ShieldCheck, ExternalLink, ArrowRight, Award } from 'lucide-react'
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

  const totalCount = certificates.length
  if (totalCount === 0) return null

  const hasMore = totalCount > 6
  const previewCertificates = hasMore ? sortedCertificates.slice(0, 6) : sortedCertificates

  return (
    <section id="certificates" className="section" aria-labelledby="certificates-heading">
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '20px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '20px',
          }}
        >
          <div>
            <div className="text-label" style={{ marginBottom: '8px' }}>
              04 / Verified Credentials
            </div>
            <h2 id="certificates-heading" className="text-display-sm">
              VERIFIED<br />
              <span style={{ color: 'var(--color-accent)' }}>CREDENTIALS</span> & SPECIALIZATIONS.
            </h2>
          </div>

          {/* Primary Top CTA */}
          <Link
            href="/certificates"
            className="certificate-header-cta"
            aria-label={hasMore ? `View all ${totalCount} certificates` : 'View all credentials'}
          >
            <span>{hasMore ? `VIEW ALL ${totalCount} CERTIFICATES` : 'VIEW ALL CREDENTIALS'}</span>
            <ArrowRight size={14} className="cta-icon" />
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
          {previewCertificates.map((cert) => (
            <CertificateCard key={cert.id} cert={cert} />
          ))}
        </div>

        {/* Bottom CTA Strip (When total published > 6) */}
        {hasMore && (
          <div className="preview-discoverability-bar">
            <div className="preview-discoverability-info">
              <span className="preview-tag">
                <Award size={13} />
                <span>COMPLETE CREDENTIAL REGISTRY</span>
              </span>
              <p className="preview-description">
                Showing <strong>6 of {totalCount}</strong> verified credentials. Explore all specialized AI/ML, data architecture, and software engineering certifications.
              </p>
            </div>

            <Link
              href="/certificates"
              className="preview-bottom-cta-btn"
              aria-label={`View all ${totalCount} verified certificates`}
            >
              <span>VIEW ALL {totalCount} CERTIFICATES</span>
              <ArrowRight size={15} className="cta-icon" />
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .certificate-header-cta {
          font-size: 12px;
          font-family: var(--font-mono);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #FFFFFF !important;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: var(--radius-sm);
          background: linear-gradient(135deg, var(--color-accent) 0%, #FF8A3D 100%);
          border: 1px solid var(--color-accent);
          box-shadow: 0 4px 16px rgba(228, 93, 44, 0.25);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          font-weight: 600;
        }

        .certificate-header-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 22px rgba(228, 93, 44, 0.4);
        }

        .certificate-header-cta:hover .cta-icon {
          transform: translateX(4px);
        }

        .certificate-header-cta .cta-icon {
          transition: transform 0.2s ease;
        }

        .preview-discoverability-bar {
          margin-top: 36px;
          padding: 24px 28px;
          border-radius: var(--radius-md);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          box-shadow: var(--shadow-sm);
          position: relative;
          overflow: hidden;
        }

        .preview-discoverability-bar::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--color-accent);
        }

        .preview-discoverability-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .preview-tag {
          font-size: 10px;
          font-family: var(--font-mono);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-accent);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }

        .preview-description {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        .preview-description strong {
          color: var(--color-text);
        }

        .preview-bottom-cta-btn {
          font-size: 13px;
          font-family: var(--font-mono);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #FFFFFF !important;
          background: linear-gradient(135deg, var(--color-accent) 0%, #FF8A3D 100%);
          border: 1px solid var(--color-accent);
          padding: 12px 24px;
          border-radius: var(--radius-sm);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(228, 93, 44, 0.25);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .preview-bottom-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(228, 93, 44, 0.4);
        }

        .preview-bottom-cta-btn:hover .cta-icon {
          transform: translateX(4px);
        }

        .preview-bottom-cta-btn .cta-icon {
          transition: transform 0.2s ease;
        }

        @media (max-width: 900px) {
          .certificates-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 640px) {
          .certificates-grid {
            grid-template-columns: 1fr !important;
          }
          .preview-discoverability-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .preview-bottom-cta-btn {
            justify-content: center;
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
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '380px',
      }}
    >
      <div>
        {/* Certificate Media Preview */}
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
            interactive
          />
        </Link>

        {/* Category & Badge Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
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
