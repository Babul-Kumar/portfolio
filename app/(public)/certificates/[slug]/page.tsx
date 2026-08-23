import { getCertificateBySlug, getAllCertificateSlugs } from '@/lib/data'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { formatFullDate } from '@/lib/utils'
import { ShieldCheck, ExternalLink, Download, ArrowLeft } from 'lucide-react'

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getAllCertificateSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const cert = await getCertificateBySlug(slug)
  if (!cert) return { title: 'Certificate Not Found' }
  return {
    title: `${cert.title} — Digital Archive`,
    description: `${cert.title} — verified credential issued by ${cert.issuer}${
      cert.issue_date ? ` on ${formatFullDate(cert.issue_date)}` : ''
    }.`,
  }
}

export default async function CertificateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cert = await getCertificateBySlug(slug)
  if (!cert) notFound()

  const isPDF = cert.file_url?.toLowerCase().endsWith('.pdf')

  return (
    <article style={{ padding: '48px var(--container-pad) 96px', minHeight: '85vh' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        {/* Back Link */}
        <Link
          href="/certificates"
          className="hover-text-accent"
          style={{
            fontSize: '12px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '40px',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={14} /> Back to Certificate Archive
        </Link>

        {/* Archival Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-accent)',
              padding: '3px 8px',
              borderRadius: '3px',
              fontWeight: 600,
            }}
          >
            {cert.category}
          </span>
          <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
            ARCHIVE / RECORD
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-border)' }}>·</span>
          <span style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
            OFFICIAL VERIFICATION
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 'clamp(28px, 4.5vw, 56px)',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            color: 'var(--color-text)',
            marginBottom: '40px',
            maxWidth: '820px',
          }}
        >
          {cert.title}
        </h1>

        {/* Main Grid: Info + Physical Document Sheet Viewer */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.1fr',
            gap: '56px',
            alignItems: 'start',
          }}
          className="cert-detail-grid"
        >
          {/* Left Column: Metadata & Detailed Breakdown */}
          <div>
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '28px',
                marginBottom: '32px',
              }}
            >
              <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                Credential Details
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <MetaRow label="Issuing Organization" value={cert.issuer} />
                {cert.issue_date && <MetaRow label="Date of Issue" value={formatFullDate(cert.issue_date)} />}
                {cert.expiry_date && <MetaRow label="Valid Through" value={formatFullDate(cert.expiry_date)} />}
                {cert.credential_id && <MetaRow label="Credential ID" value={cert.credential_id} mono />}
              </div>
            </div>

            {cert.description && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                  Curriculum & Scope
                </div>
                <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.75 }}>
                  {cert.description}
                </p>
              </div>
            )}

            {cert.skills && cert.skills.length > 0 && (
              <div style={{ marginBottom: '36px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                  Validated Competencies
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {cert.skills.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        fontSize: '12px',
                        padding: '4px 10px',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '3px',
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
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '16px' }}>
              {cert.verification_url && (
                <a
                  href={cert.verification_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--color-accent)',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    letterSpacing: '0.04em',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Verify on Issuer Platform <ExternalLink size={13} />
                </a>
              )}
              {cert.file_url && (
                <a
                  href={cert.file_url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="hover-border-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                    padding: '12px 20px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    textDecoration: 'none',
                  }}
                >
                  <Download size={14} /> {isPDF ? 'Download PDF' : 'Original Document'}
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Physical Document Preview */}
          <div style={{ position: 'sticky', top: '88px' }}>
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div
                style={{
                  background: 'var(--color-surface-2)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  minHeight: '380px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--color-border)',
                }}
              >
                {cert.thumbnail_url ? (
                  <Image
                    src={cert.thumbnail_url}
                    alt={cert.title}
                    width={560}
                    height={420}
                    style={{ objectFit: 'contain', width: '100%', height: 'auto', display: 'block' }}
                  />
                ) : isPDF && cert.file_url ? (
                  <iframe
                    src={`${cert.file_url}#view=Fit`}
                    style={{ width: '100%', height: '480px', border: 'none' }}
                    title={cert.title}
                  />
                ) : cert.file_url ? (
                  <Image
                    src={cert.file_url}
                    alt={cert.title}
                    width={560}
                    height={420}
                    style={{ objectFit: 'contain', width: '100%', height: 'auto', display: 'block' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px' }}>
                    <ShieldCheck size={44} style={{ color: 'var(--color-accent)', margin: '0 auto 12px' }} />
                    <div style={{ fontSize: '13px', color: 'var(--color-text)' }}>Official Certified Record</div>
                  </div>
                )}
              </div>

              {/* Bottom archival badge */}
              <div
                style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  background: 'var(--color-surface-2)',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span>Babul Kumar Archive</span>
                <span>Verified Status: Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .cert-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </article>
  )
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{label}</span>
      <span
        style={{
          fontSize: '13px',
          color: 'var(--color-text)',
          fontWeight: 500,
          fontFamily: mono ? 'var(--font-mono, monospace)' : 'inherit',
        }}
      >
        {value}
      </span>
    </div>
  )
}
