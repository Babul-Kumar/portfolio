import { getCertificateBySlug, getAllCertificateSlugs } from '@/lib/data'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate, formatFullDate } from '@/lib/utils'
import { ShieldCheck, ExternalLink, Download, ArrowLeft, Award } from 'lucide-react'

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getAllCertificateSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const cert = await getCertificateBySlug(slug)
  if (!cert) return { title: 'Certificate Not Found' }
  return {
    title: `${cert.title} — Verified Credential`,
    description: `${cert.title} — verified credential issued by ${cert.issuer}${
      cert.issue_date ? ` on ${formatFullDate(cert.issue_date)}` : ''
    }.`,
  }
}

export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cert = await getCertificateBySlug(slug)
  if (!cert) notFound()

  return (
    <article style={{ padding: '48px var(--container-pad) 96px', minHeight: '85vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Back Link */}
        <Link
          href="/certificates"
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '36px',
            fontWeight: 500,
            transition: 'color 0.2s',
          }}
          className="hover-accent-text"
        >
          <ArrowLeft size={14} /> Back to Certificates
        </Link>

        {/* 2-Column Responsive Layout: Left Preview / Right Metadata */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 1fr',
            gap: '56px',
            alignItems: 'start',
          }}
          className="cert-detail-grid"
        >
          {/* Left Column: Visual Certificate Document with CSS 3D Tilt */}
          <div
            className="glass-card card-3d-tilt"
            style={{
              padding: 'clamp(28px, 4vw, 44px)',
              background: 'radial-gradient(circle at 50% 0%, rgba(228, 93, 44, 0.08) 0%, var(--color-surface) 75%)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '440px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Background Guilloche / Security Pattern */}
            <div
              style={{
                position: 'absolute',
                inset: '12px',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                pointerEvents: 'none',
              }}
            />

            {/* Document Header */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '28px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-accent-bg)',
                    border: '1px solid var(--color-accent-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-accent)',
                  }}
                >
                  <Award size={26} />
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-success)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <ShieldCheck size={13} /> VERIFIED AUTHENTIC
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-mono)',
                      marginTop: '2px',
                    }}
                  >
                    {cert.category}
                  </div>
                </div>
              </div>

              {/* Document Text */}
              <div
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--color-text-muted)',
                  marginBottom: '8px',
                }}
              >
                Specialization Credential
              </div>

              <h2
                style={{
                  fontSize: 'clamp(22px, 2.5vw, 32px)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  marginBottom: '16px',
                }}
              >
                {cert.title}
              </h2>

              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '28px',
                }}
              >
                Issued to <strong style={{ color: 'var(--color-text)' }}>Babul Kumar</strong> by{' '}
                <strong style={{ color: 'var(--color-text)' }}>{cert.issuer}</strong>
              </div>

              {/* Optional Certificate Image Preview */}
              {(cert.thumbnail_url || cert.file_url) && (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '200px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    marginBottom: '20px',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <Image
                    src={(cert.thumbnail_url || cert.file_url)!}
                    alt={cert.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            {/* Document Security Footer */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                paddingTop: '20px',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
              }}
            >
              <span>ID: {cert.credential_id ?? 'VERIFIED'}</span>
              <span>{formatDate(cert.issue_date, 'MMM yyyy')}</span>
            </div>
          </div>

          {/* Right Column: Editorial Metadata & Verification Actions */}
          <div>
            {/* Badges */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-accent-border)',
                  background: 'var(--color-accent-bg)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                }}
              >
                {cert.category}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                }}
              >
                VERIFIED CREDENTIAL
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: 'clamp(26px, 3.2vw, 42px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.12,
                color: 'var(--color-text)',
                marginBottom: '28px',
              }}
            >
              {cert.title}
            </h1>

            {/* Metadata Table Card */}
            <div
              className="glass-card"
              style={{
                padding: '24px',
                marginBottom: '28px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  marginBottom: '18px',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: '8px',
                  fontWeight: 600,
                }}
              >
                Verification Specifications
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <MetaRow label="Issuing Body" value={cert.issuer} />
                {cert.issue_date && <MetaRow label="Date of Issue" value={formatFullDate(cert.issue_date)} />}
                {cert.expiry_date && <MetaRow label="Valid Through" value={formatFullDate(cert.expiry_date)} />}
                {cert.credential_id && <MetaRow label="Credential ID" value={cert.credential_id} mono />}
              </div>
            </div>

            {/* Description / Scope */}
            {cert.description && (
              <div style={{ marginBottom: '28px' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    marginBottom: '10px',
                    fontWeight: 500,
                  }}
                >
                  Curriculum & Specialization Scope
                </div>
                <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.75 }}>
                  {cert.description}
                </p>
              </div>
            )}

            {/* Demonstrated Competencies */}
            {cert.skills && cert.skills.length > 0 && (
              <div style={{ marginBottom: '36px' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    marginBottom: '12px',
                    fontWeight: 500,
                  }}
                >
                  Demonstrated Competencies
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {cert.skills.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        padding: '4px 10px',
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text)',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              {cert.verification_url && (
                <a
                  href={cert.verification_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  <span>Verify at {cert.issuer}</span>
                  <ExternalLink size={13} />
                </a>
              )}
              {cert.file_url && (
                <a
                  href={cert.file_url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="btn-secondary"
                >
                  <span>Download Certificate</span>
                  <Download size={13} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .cert-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
        }
      `}</style>
    </article>
  )
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: '16px',
        fontSize: '13px',
      }}
    >
      <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{label}</span>
      <span
        style={{
          color: 'var(--color-text)',
          fontWeight: 500,
          fontFamily: mono ? 'var(--font-mono)' : 'inherit',
          textAlign: 'right',
        }}
      >
        {value}
      </span>
    </div>
  )
}
