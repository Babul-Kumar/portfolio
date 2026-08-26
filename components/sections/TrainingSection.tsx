'use client'

import Link from 'next/link'
import type { Training } from '@/types'
import { formatDate } from '@/lib/utils'
import { Clock, ArrowRight, Sparkles, Calendar } from 'lucide-react'
import TrainingMedia from '@/components/training/TrainingMedia'

export default function TrainingSection({
  trainings,
}: {
  trainings: Training[]
}) {
  if (trainings.length === 0) return null

  const [featuredTraining, ...remainingTrainings] = trainings

  return (
    <section id="training" className="section" style={{ position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '36px',
            flexWrap: 'wrap',
            gap: '20px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '20px',
          }}
        >
          <div>
            <div className="text-label" style={{ marginBottom: '8px' }}>
              03 / TRAINING
            </div>
            <h2 className="text-display-sm">
              TRAINING THAT<br />
              <span style={{ color: 'var(--color-accent)' }}>BUILT MY</span> FOUNDATION.
            </h2>
          </div>

          <Link
            href="/training"
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
              fontWeight: 600,
            }}
          >
            <span>VIEW ALL TRAINING ({trainings.length})</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* 1. Flagship Featured Training Card (Balanced 2-Column Desktop Layout) */}
        {featuredTraining && (
          <div style={{ marginBottom: remainingTrainings.length > 0 ? '24px' : '0' }}>
            <FeaturedTrainingHeroCard training={featuredTraining} />
          </div>
        )}

        {/* 2. Compact Grid for Remaining Training Programs */}
        {remainingTrainings.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}
            className="training-home-grid"
          >
            {remainingTrainings.map((t) => (
              <CompactTrainingCard key={t.id} training={t} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        /* Smooth, stable card hover without layout shifts or transform bouncing */
        .training-card {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .training-card:hover {
          border-color: var(--color-border-hover) !important;
          box-shadow: var(--shadow-md) !important;
        }
        .training-card:hover .training-media-frame {
          border-color: var(--color-accent-border) !important;
        }
        .training-media-frame:hover .training-media-overlay {
          opacity: 1 !important;
        }
        .training-title-link:hover {
          color: var(--color-accent) !important;
        }
        @media (max-width: 900px) {
          .training-featured-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .training-home-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}

/* =========================================================================
   1. Flagship Featured Training Hero Card (Balanced 2-Column Layout)
   ========================================================================= */
function FeaturedTrainingHeroCard({ training }: { training: Training }) {
  const orgName = training.organization || training.provider || 'Technical Institute'
  const modeColor =
    training.mode === 'Online'
      ? '#3B82F6'
      : training.mode === 'Hybrid'
      ? '#10B981'
      : 'var(--color-accent)'

  return (
    <article
      className="training-card"
      style={{
        background: 'var(--color-card-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: 'clamp(20px, 3vw, 32px)',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 400px) 1fr',
          gap: 'clamp(20px, 3.5vw, 36px)',
          alignItems: 'center',
        }}
        className="training-featured-grid"
      >
        {/* Left Column: Certificate Preview Frame (~42% width) */}
        <div>
          <TrainingMedia
            certificateUrl={training.certificate_url}
            imageUrl={training.image_url}
            title={training.title}
            provider={training.provider}
            organization={training.organization}
            category={training.category}
            credentialId={training.credential_id}
            duration={training.duration}
            date={training.start_date ? formatDate(training.start_date, 'MMM yyyy') : null}
            aspectRatio="16/10"
            maxHeight="280px"
            interactive
          />
        </div>

        {/* Right Column: Training Narrative & Metadata (~58% width) */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Top Badges Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-accent-bg)',
                border: '1px solid var(--color-accent-border)',
                color: 'var(--color-accent)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {training.category}
            </span>

            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                padding: '3px 8px',
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
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 138, 61, 0.15)',
                  border: '1px solid rgba(255, 138, 61, 0.3)',
                  color: 'var(--color-accent)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontWeight: 600,
                }}
              >
                <Sparkles size={9} /> FEATURED
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: 'clamp(22px, 2.6vw, 30px)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: '0 0 6px',
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
            }}
          >
            <Link
              href={`/training/${training.slug}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
              className="training-title-link"
            >
              {training.title}
            </Link>
          </h3>

          {/* Organization & Meta Row */}
          <div
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '12px',
            }}
          >
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{orgName}</span>
            {training.provider && training.organization && training.provider !== training.organization && (
              <>
                <span>·</span>
                <span style={{ color: 'var(--color-text-muted)' }}>Via {training.provider}</span>
              </>
            )}
            {training.duration && (
              <>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Clock size={11} style={{ color: 'var(--color-accent-teal)' }} /> {training.duration}
                </span>
              </>
            )}
            {training.start_date && (
              <>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Calendar size={11} /> {formatDate(training.start_date)}
                </span>
              </>
            )}
          </div>

          {/* Short Description */}
          {training.description && (
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                margin: '0 0 14px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {training.description}
            </p>
          )}

          {/* Skills Pills */}
          {training.skills && training.skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
              {training.skills.map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 8px',
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
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              href={`/training/${training.slug}`}
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: '11px' }}
            >
              <span>VIEW TRAINING DETAILS</span>
              <ArrowRight size={13} />
            </Link>

            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {training.credential_id ? `ID: ${training.credential_id}` : 'Verified Digital Credential'}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

/* =========================================================================
   2. Compact Regular Training Card (Uniform Dimensions)
   ========================================================================= */
function CompactTrainingCard({ training }: { training: Training }) {
  const orgName = training.organization || training.provider || 'Technical Institute'
  const modeColor =
    training.mode === 'Online'
      ? '#3B82F6'
      : training.mode === 'Hybrid'
      ? '#10B981'
      : 'var(--color-accent)'

  return (
    <article
      className="training-card"
      style={{
        background: 'var(--color-card-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md, 10px)',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div>
        {/* Top Preview Frame */}
        <div style={{ marginBottom: '12px' }}>
          <TrainingMedia
            certificateUrl={training.certificate_url}
            imageUrl={training.image_url}
            title={training.title}
            provider={training.provider}
            organization={training.organization}
            category={training.category}
            credentialId={training.credential_id}
            duration={training.duration}
            date={training.start_date ? formatDate(training.start_date, 'MMM yyyy') : null}
            aspectRatio="16/10"
            maxHeight="190px"
            interactive
          />
        </div>

        {/* Category & Mode Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
            flexWrap: 'wrap',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                padding: '2px 7px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-accent-bg)',
                border: '1px solid var(--color-accent-border)',
                color: 'var(--color-accent)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {training.category}
            </span>

            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-surface-2)',
                color: modeColor,
                fontWeight: 600,
              }}
            >
              {training.mode}
            </span>
          </div>

          {training.duration && (
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Clock size={11} style={{ color: 'var(--color-accent-teal)' }} />
              {training.duration}
            </span>
          )}
        </div>

        {/* Title */}
        <h4
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: '0 0 4px',
            lineHeight: 1.35,
          }}
        >
          <Link
            href={`/training/${training.slug}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
            className="training-title-link"
          >
            {training.title}
          </Link>
        </h4>

        {/* Organization */}
        <div
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-secondary)',
            marginBottom: '8px',
          }}
        >
          {orgName} {training.start_date ? `· ${formatDate(training.start_date, 'MMM yyyy')}` : ''}
        </div>

        {/* Short Description */}
        {training.description && (
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              margin: '0 0 10px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {training.description}
          </p>
        )}

        {/* Skills Tags */}
        {training.skills && training.skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {training.skills.slice(0, 3).map((s, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
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

      {/* Card Action Link */}
      <div style={{ paddingTop: '10px', borderTop: '1px solid var(--color-border-subtle)' }}>
        <Link
          href={`/training/${training.slug}`}
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: 'var(--color-accent)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>VIEW TRAINING DETAILS</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </article>
  )
}
