import { getCertificateBySlug, getAllCertificateSlugs, getCertificates } from '@/lib/data'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDate, formatFullDate } from '@/lib/utils'
import { ShieldCheck, ExternalLink, Download, ArrowLeft, ArrowRight } from 'lucide-react'
import { getCertificatePublicUrl } from '@/lib/supabase/storage'
import CertificateDocViewer from '@/components/certificates/CertificateDocViewer'
import CertificateMedia from '@/components/certificates/CertificateMedia'

export const revalidate = 60 // Revalidate every 60 seconds or on-demand

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

  const allCerts = await getCertificates()
  const otherCerts = allCerts.filter((c) => c.slug !== slug).slice(0, 3)

  const publicFileUrl = getCertificatePublicUrl(cert.file_url || cert.thumbnail_url)

  return (
    <article style={{ padding: '48px var(--container-pad) 96px', minHeight: '85vh' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
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
            marginBottom: '32px',
            fontWeight: 500,
            transition: 'color 0.2s',
          }}
          className="hover-accent-text"
        >
          <ArrowLeft size={14} /> Back to All Certificates
        </Link>

        {/* Certificate Header Information */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
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
                padding: '4px 10px',
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
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-success)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={13} /> VERIFIED CREDENTIAL
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(26px, 3.5vw, 42px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              color: 'var(--color-text)',
              marginBottom: '12px',
              maxWidth: '800px',
              marginInline: 'auto',
            }}
          >
            {cert.title}
          </h1>

          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Issued by <strong style={{ color: 'var(--color-text)' }}>{cert.issuer}</strong>
            {cert.issue_date && (
              <span> · {formatDate(cert.issue_date, 'MMMM yyyy')}</span>
            )}
          </p>
        </div>

        {/* 1. Contained Professional Document Preview (Bounded width & height) */}
        <div style={{ marginBottom: '48px' }}>
          <CertificateDocViewer
            publicFileUrl={publicFileUrl}
            title={cert.title}
            issuer={cert.issuer}
            category={cert.category}
            credentialId={cert.credential_id}
          />
        </div>

        {/* 2. Structured Verification Details & Metadata */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {/* Metadata Card */}
          <div
            className="glass-card"
            style={{
              padding: '24px',
              background: '#101318',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                paddingBottom: '8px',
                fontWeight: 600,
              }}
            >
              Credential Specifications
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <MetaRow label="Issuing Organization" value={cert.issuer} />
              <MetaRow label="Domain Category" value={cert.category} />
              {cert.issue_date && <MetaRow label="Date of Issue" value={formatFullDate(cert.issue_date)} />}
              {cert.expiry_date && <MetaRow label="Valid Through" value={formatFullDate(cert.expiry_date)} />}
              {cert.credential_id && <MetaRow label="Credential ID" value={cert.credential_id} mono />}
            </div>
          </div>

          {/* Actions & Verification Card */}
          <div
            className="glass-card"
            style={{
              padding: '24px',
              background: '#101318',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#10B981',
                  marginBottom: '16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingBottom: '8px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ShieldCheck size={14} /> Official Verification
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>
                This record verifies technical mastery and examination completion. You can verify
                the credential authenticity directly with the issuing body or download the original file.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {cert.verification_url && (
                <a
                  href={cert.verification_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'linear-gradient(135deg, #E45D2C 0%, #FF8A3D 100%)',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(228, 93, 44, 0.25)',
                  }}
                >
                  <span>Verify at {cert.issuer}</span>
                  <ExternalLink size={13} />
                </a>
              )}

              {publicFileUrl && (
                <a
                  href={publicFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F5F5F5',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  <Download size={13} />
                  <span>Download Document</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 3. Description & Curriculum */}
        {cert.description && (
          <div
            style={{
              marginBottom: '36px',
              background: '#101318',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginBottom: '12px',
                fontWeight: 600,
              }}
            >
              Curriculum & Specialization Scope
            </div>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {cert.description}
            </p>
          </div>
        )}

        {/* 4. Demonstrated Competencies */}
        {cert.skills && cert.skills.length > 0 && (
          <div
            style={{
              marginBottom: '56px',
              background: '#101318',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginBottom: '14px',
                fontWeight: 600,
              }}
            >
              Demonstrated Competencies
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {cert.skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    padding: '5px 12px',
                    background: '#151922',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    color: '#E5E7EB',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 5. Related Certificates Section */}
        {otherCerts.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '40px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#F5F5F5', margin: 0 }}>
                Other Specializations & Credentials
              </h2>
              <Link
                href="/certificates"
                style={{
                  fontSize: '12px',
                  color: 'var(--color-accent)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>View All ({allCerts.length})</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {otherCerts.map((c) => (
                <Link
                  key={c.id}
                  href={`/certificates/${c.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      background: '#101318',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '16px',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <CertificateMedia
                      fileUrl={c.file_url}
                      thumbnailUrl={c.thumbnail_url}
                      title={c.title}
                      issuer={c.issuer}
                      category={c.category}
                      aspectRatio="16/10"
                    />
                    <h3
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#F5F5F5',
                        margin: '12px 0 4px',
                      }}
                    >
                      {c.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                      {c.issuer} · {formatDate(c.issue_date, 'MMM yyyy')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
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
