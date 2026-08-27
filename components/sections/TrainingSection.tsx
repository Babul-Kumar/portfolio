'use client'

import Link from 'next/link'
import type { Training } from '@/types'
import { formatDate } from '@/lib/utils'
import { ShieldCheck, ExternalLink, Clock } from 'lucide-react'
import CertificateMedia from '@/components/certificates/CertificateMedia'

export default function TrainingSection({
  trainings,
}: {
  trainings: Training[]
}) {
  if (trainings.length === 0) return null

  return (
    <section id="training" className="section" aria-labelledby="training-heading">
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
            03 / Training & Industrial Programs
          </div>
          <h2 id="training-heading" className="text-display-sm">
            TRAINING THAT<br />
            <span style={{ color: 'var(--color-accent)' }}>BUILT MY</span> FOUNDATION.
          </h2>
        </div>

        {/* Training Responsive Grid - Unified with Certificate visual system */}
        <div className="training-grid">
          {trainings.map((training) => (
            <TrainingCard key={training.id} training={training} />
          ))}
        </div>
      </div>

      <style>{`
        .training-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
          gap: 24px;
        }

        .training-card-wrapper {
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

        .training-card-wrapper:hover {
          border-color: var(--color-border-hover);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        @media (max-width: 900px) {
          .training-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
          }
        }

        @media (max-width: 640px) {
          .training-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </section>
  )
}

function TrainingCard({ training }: { training: Training }) {
  const issuer = training.organization || training.provider || 'Technical Institute'
  const modeColor =
    training.mode === 'Online'
      ? '#3B82F6'
      : training.mode === 'Hybrid'
      ? '#10B981'
      : 'var(--color-accent)'

  return (
    <article className="training-card-wrapper">
      <div>
        {/* Certificate Media Preview - Same 16/10 uncropped contained preview */}
        <Link
          href={`/training/${training.slug}`}
          style={{ display: 'block', textDecoration: 'none', marginBottom: '18px' }}
          aria-label={`View training program ${training.title}`}
        >
          <CertificateMedia
            fileUrl={training.certificate_url}
            thumbnailUrl={training.image_url}
            title={training.title}
            issuer={issuer}
            category={training.category}
            aspectRatio="16/10"
            interactive={false}
          />
        </Link>

        {/* Category, Mode & Date Strip */}
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
              {training.category}
            </span>
            <span
              style={{
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: modeColor,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {training.mode}
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

          {training.start_date && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
              }}
            >
              {formatDate(training.start_date, 'MMM yyyy')}
            </span>
          )}
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
            href={`/training/${training.slug}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {training.title}
          </Link>
        </h3>

        {/* Issuer / Organization */}
        <div
          style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            marginBottom: '8px',
          }}
        >
          Issued by <strong style={{ color: 'var(--color-text)' }}>{issuer}</strong>
        </div>

        {/* Duration & Credential ID Strip */}
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          {training.duration && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={11} /> {training.duration}
            </span>
          )}
          {training.credential_id && (
            <span>ID: {training.credential_id}</span>
          )}
        </div>

        {/* Skills Preview */}
        {training.skills && training.skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {training.skills.slice(0, 3).map((s) => (
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
            {training.skills.length > 3 && (
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                +{training.skills.length - 3}
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
        {training.credential_url ? (
          <a
            href={training.credential_url}
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
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Verified Program</span>
        )}

        <Link
          href={`/training/${training.slug}`}
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
