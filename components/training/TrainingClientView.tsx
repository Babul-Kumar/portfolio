'use client'

import { useState, useMemo } from 'react'
import type { Training } from '@/types'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import {
  Search,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  X,
  ArrowRight,
} from 'lucide-react'
import TrainingMedia from '@/components/training/TrainingMedia'

interface TrainingClientViewProps {
  initialTrainings: Training[]
}

const DEFAULT_CATEGORIES = [
  'Cybersecurity',
  'Industrial Training',
  'AI / ML',
  'Full Stack',
  'Web Development',
  'Data Science',
  'Cloud & DevOps',
  'Workshop',
  'Bootcamp',
]

const MODES = ['All', 'Online', 'Offline', 'Hybrid']

export default function TrainingClientView({ initialTrainings }: TrainingClientViewProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [mode, setMode] = useState('All')

  // Dynamic unique categories (preserving 'All' as first)
  const categories = useMemo(() => {
    const present = new Set<string>()
    for (const t of initialTrainings) {
      if (t.category?.trim()) present.add(t.category.trim())
    }
    for (const def of DEFAULT_CATEGORIES) {
      present.add(def)
    }
    return ['All', ...Array.from(present)]
  }, [initialTrainings])

  // Filtered trainings
  const filteredTrainings = useMemo(() => {
    return initialTrainings.filter((t) => {
      const matchCat = category === 'All' || t.category?.toLowerCase() === category.toLowerCase()
      const matchMode = mode === 'All' || t.mode?.toLowerCase() === mode.toLowerCase()
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.provider && t.provider.toLowerCase().includes(q)) ||
        (t.organization && t.organization.toLowerCase().includes(q)) ||
        (t.skills && t.skills.some((s) => s.toLowerCase().includes(q))) ||
        (t.technologies && t.technologies.some((s) => s.toLowerCase().includes(q)))
      return matchCat && matchMode && matchSearch
    })
  }, [initialTrainings, category, mode, search])

  // Featured flagship training for the top showcase
  const featuredTraining = useMemo(() => {
    return initialTrainings.find((t) => t.featured) || initialTrainings[0] || null
  }, [initialTrainings])

  const isFiltering = category !== 'All' || mode !== 'All' || Boolean(search.trim())

  return (
    <div>
      {/* =========================================================================
          1. Featured Training Showcase (Hero 2-Column Card)
          ========================================================================= */}
      {featuredTraining && !isFiltering && (
        <section style={{ marginBottom: '48px' }}>
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              marginBottom: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={13} />
            <span>FEATURED TRAINING PROGRAM</span>
          </div>

          <FeaturedTrainingHeroCard training={featuredTraining} />
        </section>
      )}

      {/* =========================================================================
          2. Search & Category Filters
          ========================================================================= */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: '16px',
            fontWeight: 600,
          }}
        >
          All Verified Training Programs ({initialTrainings.length})
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Category Chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {categories.map((cat) => {
              const isActive = cat === category
              const count =
                cat === 'All'
                  ? initialTrainings.length
                  : initialTrainings.filter((t) => t.category?.toLowerCase() === cat.toLowerCase()).length

              if (count === 0 && cat !== 'All' && !isActive) return null

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: isActive ? 'var(--color-accent)' : 'var(--color-surface)',
                    color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                    boxShadow: isActive ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{cat}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      opacity: isActive ? 0.9 : 0.6,
                      padding: '1px 5px',
                      borderRadius: '10px',
                      background: isActive ? 'rgba(0,0,0,0.2)' : 'var(--color-surface-2)',
                    }}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search & Mode Filters */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Mode Selector */}
            <div
              style={{
                display: 'flex',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '2px',
              }}
            >
              {MODES.map((m) => {
                const isActive = mode === m
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      background: isActive ? 'var(--color-surface)' : 'transparent',
                      border: 'none',
                      color: isActive ? 'var(--color-accent-teal)' : 'var(--color-text-muted)',
                      fontWeight: isActive ? 600 : 400,
                      cursor: 'pointer',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    {m}
                  </button>
                )
              })}
            </div>

            {/* Search Box */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search training, skills..."
                style={{
                  width: '100%',
                  padding: '7px 32px 7px 34px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. Training Cards Grid (Uniform Dimensions)
          ========================================================================= */}
      {filteredTrainings.length === 0 ? (
        <div
          style={{
            padding: '64px 24px',
            textAlign: 'center',
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <BookOpen size={36} style={{ color: 'var(--color-text-muted)', opacity: 0.5, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', color: 'var(--color-text-primary)', margin: '0 0 6px' }}>
            No training programs match your criteria
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
            Try resetting your filters or search keywords.
          </p>
          {(category !== 'All' || mode !== 'All' || search) && (
            <button
              type="button"
              onClick={() => {
                setCategory('All')
                setMode('All')
                setSearch('')
              }}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-accent)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
          className="training-client-grid"
        >
          {filteredTrainings.map((t) => (
            <RegularTrainingCard key={t.id} training={t} />
          ))}
        </div>
      )}

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
          .training-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .training-client-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

/* =========================================================================
   Featured Flagship Training Hero Component (2-Column Desktop Layout)
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
        padding: 'clamp(20px, 3.5vw, 36px)',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 440px) 1fr',
          gap: 'clamp(24px, 3.5vw, 40px)',
          alignItems: 'center',
        }}
        className="training-hero-grid"
      >
        {/* Left Column: Certificate Preview Frame (Controlled & Contained) */}
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
            maxHeight="320px"
            interactive
          />
        </div>

        {/* Right Column: Training Narrative & Core Details */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Top Badges Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
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
          <h2
            style={{
              fontSize: 'clamp(22px, 2.8vw, 32px)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: '0 0 8px',
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
          </h2>

          {/* Organization & Meta Row */}
          <div
            style={{
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '14px',
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
                  <Clock size={12} style={{ color: 'var(--color-accent-teal)' }} /> {training.duration}
                </span>
              </>
            )}
            {training.start_date && (
              <>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Calendar size={12} /> {formatDate(training.start_date)}
                </span>
              </>
            )}
            {training.location && (
              <>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <MapPin size={12} /> {training.location}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {training.description && (
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.65,
                margin: '0 0 16px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {training.description}
            </p>
          )}

          {/* Skills & Stack Tags */}
          {(training.skills?.length > 0 || training.technologies?.length > 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {training.skills?.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      minWidth: '55px',
                    }}
                  >
                    SKILLS:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {training.skills.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 8px',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      minWidth: '55px',
                    }}
                  >
                    STACK:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {training.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-2)',
                          border: '1px solid var(--color-border-subtle)',
                          color: 'var(--color-accent-teal)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action CTAs */}
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
   Regular Compact Training Card Component (Standardized Dimensions)
   ========================================================================= */
function RegularTrainingCard({ training }: { training: Training }) {
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
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: 'var(--shadow-card)',
        transition: 'all 0.25s ease',
      }}
    >
      <div>
        {/* Top Preview Frame */}
        <div style={{ marginBottom: '14px' }}>
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
            maxHeight="200px"
            interactive
          />
        </div>

        {/* Category & Mode Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
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
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: '0 0 6px',
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
        </h3>

        {/* Organization & Date */}
        <div
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-secondary)',
            marginBottom: '10px',
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
              lineHeight: 1.55,
              margin: '0 0 12px',
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
      <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)' }}>
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
