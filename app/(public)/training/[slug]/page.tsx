import { getTrainingBySlug, getAllTrainingSlugs, getTrainings } from '@/lib/data'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Download,
  ArrowLeft,
  Sparkles,
  FileText,
} from 'lucide-react'
import { getTrainingPublicAssetUrl } from '@/lib/supabase/storage'
import CertificateDocViewer from '@/components/certificates/CertificateDocViewer'

export const revalidate = 60 // 1-minute ISR / on-demand revalidation

export async function generateStaticParams() {
  const slugs = await getAllTrainingSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const training = await getTrainingBySlug(slug)
  if (!training) return { title: 'Training Program Not Found' }
  return {
    title: `${training.title} — Training & Specialization`,
    description: `${training.title} — technical training completed at ${
      training.organization || training.provider || 'Technical Institute'
    }.`,
  }
}

export default async function TrainingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const training = await getTrainingBySlug(slug)
  if (!training) notFound()

  const allTrainings = await getTrainings()
  const otherTrainings = allTrainings.filter((t) => t.slug !== slug).slice(0, 3)
  const docUrl = getTrainingPublicAssetUrl(training.certificate_url || training.image_url)

  const orgName = training.organization || training.provider || 'Technical Institute'
  const modeColor =
    training.mode === 'Online'
      ? '#3B82F6'
      : training.mode === 'Hybrid'
      ? '#10B981'
      : 'var(--color-accent)'

  return (
    <article style={{ padding: '48px var(--container-pad) 96px', minHeight: '85vh' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* Back Link */}
        <Link
          href="/training"
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
          <ArrowLeft size={14} /> Back to All Training Programs
        </Link>

        {/* Training Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                border: '1px solid var(--color-accent-border)',
                background: 'var(--color-accent-bg)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
              }}
            >
              {training.category}
            </span>

            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: modeColor,
                fontWeight: 600,
              }}
            >
              {training.mode}
            </span>

            {training.featured && (
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 138, 61, 0.15)',
                  border: '1px solid rgba(255, 138, 61, 0.3)',
                  color: 'var(--color-accent)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600,
                }}
              >
                <Sparkles size={10} /> FEATURED
              </span>
            )}
          </div>

          <h1
            style={{
              fontSize: 'clamp(26px, 3.8vw, 40px)',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              lineHeight: 1.25,
              margin: '0 0 16px',
              letterSpacing: '-0.02em',
            }}
          >
            {training.title}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{orgName}</span>
            {training.duration && (
              <>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} style={{ color: 'var(--color-accent-teal)' }} /> {training.duration}
                </span>
              </>
            )}
            {training.start_date && (
              <>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} /> {formatDate(training.start_date)}{' '}
                  {training.end_date ? `— ${formatDate(training.end_date)}` : ''}
                </span>
              </>
            )}
            {training.location && (
              <>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} /> {training.location}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Main Grid: Description / Skills & Document Viewer */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '36px',
            marginBottom: '64px',
          }}
        >
          {/* Detailed Training Overview Section */}
          <div
            style={{
              background: 'var(--color-card-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(24px, 4vw, 36px)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h2
              style={{
                fontSize: '14px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: '16px',
                fontWeight: 700,
              }}
            >
              Training Overview & Scope
            </h2>

            {training.description && (
              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.75,
                  margin: '0 0 28px',
                }}
              >
                {training.description}
              </p>
            )}

            {/* Skills & Technologies Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {training.skills?.length > 0 && (
                <div>
                  <h3
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '10px',
                    }}
                  >
                    Skills & Core Competencies
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {training.skills.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '12px',
                          fontFamily: 'var(--font-mono)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {training.technologies?.length > 0 && (
                <div>
                  <h3
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '10px',
                    }}
                  >
                    Technologies & Frameworks
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {training.technologies.map((t, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '12px',
                          fontFamily: 'var(--font-mono)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-2)',
                          border: '1px solid var(--color-border-subtle)',
                          color: 'var(--color-accent-teal)',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Credential Verification Bar */}
            {(training.credential_id || training.credential_url) && (
              <div
                style={{
                  marginTop: '28px',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                {training.credential_id && (
                  <span
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Credential Reference: <strong style={{ color: 'var(--color-text-primary)' }}>{training.credential_id}</strong>
                  </span>
                )}

                {training.credential_url && (
                  <a
                    href={training.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-accent)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 600,
                    }}
                  >
                    <span>Verify Live Credential</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Certificate Document Preview Plaque (If Uploaded) */}
          {docUrl && (
            <div
              style={{
                background: 'var(--color-card-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(20px, 3.5vw, 32px)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} style={{ color: 'var(--color-accent)' }} />
                  <h3
                    style={{
                      fontSize: '14px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Certificate / Completion Document
                  </h3>
                </div>

                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-accent)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-accent-bg)',
                    border: '1px solid var(--color-accent-border)',
                  }}
                >
                  <Download size={13} />
                  <span>Download Document</span>
                </a>
              </div>

              <div style={{ maxWidth: '920px', margin: '0 auto' }}>
                <CertificateDocViewer
                  publicFileUrl={docUrl}
                  title={training.title}
                  issuer={orgName}
                  category={training.category}
                  credentialId={training.credential_id}
                />
              </div>
            </div>
          )}
        </div>

        {/* Other Training Programs */}
        {otherTrainings.length > 0 && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '48px' }}>
            <h3
              style={{
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginBottom: '24px',
              }}
            >
              More Training Programs
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {otherTrainings.map((ot) => (
                <Link
                  key={ot.id}
                  href={`/training/${ot.slug}`}
                  style={{
                    display: 'block',
                    padding: '20px',
                    background: 'var(--color-card-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                  className="training-card"
                >
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {ot.category} · {ot.mode}
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
                    {ot.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {ot.organization || ot.provider} {ot.duration ? `· ${ot.duration}` : ''}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .hover-accent-text:hover {
          color: var(--color-accent) !important;
        }
      `}</style>
    </article>
  )
}
