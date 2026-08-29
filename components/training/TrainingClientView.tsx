'use client'

import { useState, useMemo } from 'react'
import type { Training } from '@/types'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import {
  Search,
  BookOpen,
  Clock,
  X,
  ArrowRight,
  Eye,
  ExternalLink,
} from 'lucide-react'
import TrainingMedia from '@/components/training/TrainingMedia'
import PreviewModal, { type PreviewItem, type PreviewMedia } from '@/components/ui/PreviewModal'
import { getCertificatePublicUrl, isPdfDocument } from '@/lib/supabase/storage'
import { motion } from 'framer-motion'

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
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline')
  const [previewTraining, setPreviewTraining] = useState<Training | null>(null)

  // Map active training into unified PreviewItem
  const trainingPreviewItem: PreviewItem | null = useMemo(() => {
    if (!previewTraining) return null

    const resolvedUrl = getCertificatePublicUrl(
      previewTraining.certificate_url || previewTraining.image_url
    )
    const isPdf = isPdfDocument(resolvedUrl)

    const mediaList: PreviewMedia[] = []
    if (resolvedUrl) {
      mediaList.push({
        url: resolvedUrl,
        caption: previewTraining.title,
        isPdf,
      })
    }

    return {
      type: 'training',
      headerTag: `// TRAINING_PREVIEW · ${previewTraining.category || 'CURRICULUM'}`,
      title: previewTraining.title,
      category: previewTraining.category,
      organizationOrIssuer: previewTraining.organization || previewTraining.provider || undefined,
      dateOrDuration:
        previewTraining.duration ||
        (previewTraining.start_date ? formatDate(previewTraining.start_date, 'MMM yyyy') : undefined),
      credentialId: previewTraining.credential_id,
      description: previewTraining.description,
      skills: previewTraining.skills,
      technologies: previewTraining.technologies,
      media: mediaList,
      downloadUrl: resolvedUrl,
      credentialUrl: previewTraining.credential_url,
      verificationUrl: previewTraining.credential_url,
      detailsUrl: `/training/${previewTraining.slug}`,
      detailsLabel: 'VIEW CURRICULUM',
    }
  }, [previewTraining])

  // Dynamic unique categories (preserving 'All' as first, strictly unique)
  const categories = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = ['All']
    seen.add('all')

    for (const t of initialTrainings) {
      const cat = t.category?.trim()
      if (cat && !seen.has(cat.toLowerCase())) {
        seen.add(cat.toLowerCase())
        result.push(cat)
      }
    }
    for (const def of DEFAULT_CATEGORIES) {
      if (!seen.has(def.toLowerCase())) {
        seen.add(def.toLowerCase())
        result.push(def)
      }
    }
    return result
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

  return (
    <div>
      {/* =========================================================================
          2. Search, Mode, View Mode & Category Filters
          ========================================================================= */}
      <div style={{ marginBottom: '36px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              fontWeight: 600,
            }}
          >
            All Verified Training Programs ({initialTrainings.length})
          </div>

          {/* View Mode Switcher: Timeline vs Grid */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: viewMode === 'timeline' ? 'var(--color-accent)' : 'transparent',
                border: 'none',
                color: viewMode === 'timeline' ? '#FFFFFF' : 'var(--color-text-secondary)',
                fontWeight: viewMode === 'timeline' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              TIMELINE VIEW
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: viewMode === 'grid' ? 'var(--color-accent)' : 'transparent',
                border: 'none',
                color: viewMode === 'grid' ? '#FFFFFF' : 'var(--color-text-secondary)',
                fontWeight: viewMode === 'grid' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              GRID VIEW
            </button>
          </div>
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
          3. Training Content: Timeline vs Grid
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
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {viewMode === 'timeline' ? (
            <FuturisticTrainingTimeline trainings={filteredTrainings} onPreview={setPreviewTraining} />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
                gap: '24px',
              }}
              className="training-client-grid"
            >
              {filteredTrainings.map((t) => (
                <RegularTrainingCard key={t.id} training={t} onPreview={setPreviewTraining} />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Unified Training Preview / Lightbox Modal */}
      <PreviewModal
        isOpen={Boolean(previewTraining)}
        onClose={() => setPreviewTraining(null)}
        item={trainingPreviewItem}
      />

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
        .btn-preview-cyber:hover {
          background: rgba(228, 93, 44, 0.22) !important;
          border-color: var(--color-accent) !important;
          box-shadow: 0 0 10px var(--color-accent-glow) !important;
          transform: translateY(-1px) !important;
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
   Regular Compact Training Card Component (Standardized Dimensions)
   ========================================================================= */
function RegularTrainingCard({
  training,
  onPreview,
}: {
  training: Training
  onPreview: (t: Training) => void
}) {
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
        <div
          style={{ marginBottom: '14px', cursor: (training.certificate_url || training.image_url) ? 'pointer' : 'default' }}
          onClick={(training.certificate_url || training.image_url) ? () => onPreview(training) : undefined}
        >
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

      {/* Card Action Link & Preview Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border-subtle)',
        }}
      >
        <Link
          href={`/training/${training.slug}`}
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: (training.certificate_url || training.image_url)
              ? 'var(--color-text-secondary)'
              : 'var(--color-accent)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
          className="hover-accent-text"
        >
          <span>VIEW CURRICULUM</span>
          <ArrowRight size={12} />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onPreview(training)}
            style={{
              fontSize: '11.5px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: 'var(--color-accent)',
              background: 'var(--color-accent-bg)',
              border: '1px solid var(--color-accent-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            className="btn-preview-cyber"
            aria-label={`Preview certificate for ${training.title}`}
          >
            <Eye size={13} />
            <span>VIEW CERTIFICATE</span>
          </button>

          {training.credential_url && (
            <a
              href={training.credential_url}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '5px 8px',
              }}
              className="hover-accent-text"
              title="Official Verification Link"
            >
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

/* =========================================================================
   Futuristic Cyber Timeline View Component
   ========================================================================= */
function FuturisticTrainingTimeline({
  trainings,
  onPreview,
}: {
  trainings: Training[]
  onPreview: (t: Training) => void
}) {
  return (
    <div
      style={{
        position: 'relative',
        paddingLeft: 'clamp(44px, 6vw, 64px)',
        margin: '20px 0 60px',
      }}
    >
      {/* Animated glowing vertical cyber timeline rail */}
      <div
        style={{
          position: 'absolute',
          left: 'clamp(18px, 3vw, 24px)',
          top: '12px',
          bottom: '24px',
          width: '2px',
          background:
            'linear-gradient(to bottom, var(--color-accent) 0%, rgba(228, 93, 44, 0.4) 70%, transparent 100%)',
          boxShadow: '0 0 10px rgba(228, 93, 44, 0.4)',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
        {trainings.map((t, index) => {
          const phaseNum = String(index + 1).padStart(2, '0')
          const orgName = t.organization || t.provider || 'Technical Institute'
          const dateStr = t.start_date ? formatDate(t.start_date, 'MMM yyyy') : null

          return (
            <div key={t.id} style={{ position: 'relative' }}>
              {/* Pulsing Node Milestone Marker centered on rail */}
              <div
                style={{
                  position: 'absolute',
                  left: 'calc(-1 * clamp(44px, 6vw, 64px) + clamp(18px, 3vw, 24px) - 12px)',
                  top: '24px',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--color-surface)',
                  border: '2px solid var(--color-accent)',
                  boxShadow: '0 0 10px var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  zIndex: 2,
                }}
              >
                {phaseNum}
              </div>

              {/* Glowing Timeline Card */}
              <div
                className="glass-card"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'clamp(20px, 3vw, 28px)',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                }}
              >
                {/* Header row: Module Tag + Category + Mode + Duration/Date */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                      }}
                    >
                      {`// PHASE_${phaseNum}`}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {t.category}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-surface-2)',
                        color: 'var(--color-accent-teal)',
                        fontWeight: 600,
                      }}
                    >
                      {t.mode}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {t.duration && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} style={{ color: 'var(--color-accent)' }} />
                        {t.duration}
                      </span>
                    )}
                    {dateStr && <span>{dateStr}</span>}
                  </div>
                </div>

                {/* Training Title */}
                <h3
                  style={{
                    fontSize: 'clamp(18px, 2vw, 22px)',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    margin: '0 0 6px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  <Link
                    href={`/training/${t.slug}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    className="training-title-link"
                  >
                    {t.title}
                  </Link>
                </h3>

                {/* Organization */}
                <div
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-accent)',
                    marginBottom: '14px',
                    fontWeight: 500,
                  }}
                >
                  {orgName}
                </div>

                {/* Description */}
                {t.description && (
                  <p
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.65,
                      margin: '0 0 16px',
                    }}
                  >
                    {t.description}
                  </p>
                )}

                {/* Technologies and Skills */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {t.technologies && t.technologies.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-text-muted)',
                          textTransform: 'uppercase',
                        }}
                      >
                        Stack:
                      </span>
                      {t.technologies.map((tech) => (
                        <span
                          key={tech}
                          style={{
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-accent-bg)',
                            border: '1px solid var(--color-accent-border)',
                            color: 'var(--color-accent)',
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {t.skills && t.skills.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-text-muted)',
                          textTransform: 'uppercase',
                        }}
                      >
                        Skills:
                      </span>
                      {t.skills.map((skill) => (
                        <span
                          key={skill}
                          style={{
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-surface-2)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom CTA Links */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <Link
                    href={`/training/${t.slug}`}
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: (t.certificate_url || t.image_url)
                        ? 'var(--color-text-secondary)'
                        : 'var(--color-accent)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600,
                    }}
                    className="hover-accent-text"
                  >
                    <span>VIEW CURRICULUM MODULE</span>
                    <ArrowRight size={13} />
                  </Link>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => onPreview(t)}
                      style={{
                        fontSize: '11.5px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: 'var(--color-accent)',
                        background: 'var(--color-accent-bg)',
                        border: '1px solid var(--color-accent-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px 14px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                      }}
                      className="btn-preview-cyber"
                      aria-label={`Preview certificate for ${t.title}`}
                    >
                      <Eye size={13} />
                      <span>VIEW CERTIFICATE</span>
                    </button>

                    {t.credential_url && (
                      <a
                        href={t.credential_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '11.5px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-text-secondary)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 10px',
                          border: '1px solid var(--color-border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-2)',
                        }}
                        className="hover-accent-text"
                        title="Official Credential Verification"
                      >
                        <span>VERIFY</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
