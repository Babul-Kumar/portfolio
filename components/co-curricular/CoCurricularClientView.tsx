'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import type { CoCurricularActivity } from '@/types'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import {
  Search,
  ExternalLink,
  Trophy,
  Calendar,
  Sparkles,
  MapPin,
  X,
  ArrowRight,
  Award,
  Eye,
} from 'lucide-react'
import CertificateMedia from '@/components/certificates/CertificateMedia'
import PreviewModal, { type PreviewItem, type PreviewMedia } from '@/components/ui/PreviewModal'
import { getCertificatePublicUrl, isPdfDocument } from '@/lib/supabase/storage'

interface CoCurricularClientViewProps {
  initialActivities: CoCurricularActivity[]
}

const DEFAULT_CATEGORIES = [
  'Hackathon',
  'Technical Event',
  'Competition',
  'Workshop',
  'Conference',
  'Presentation',
  'Leadership',
  'Open Source',
  'Club',
]

const MODES = ['All', 'Offline', 'Online', 'Hybrid']

function CyberStatCounter({
  target,
  suffix = '',
  color,
}: {
  target: number
  suffix?: string
  color: string
}) {
  const [count, setCount] = useState(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return target
    }
    return 0
  })
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      return
    }

    let animId: number

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          observer.disconnect()

          let startTime: number | null = null
          const duration = 1000

          const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = Math.round(eased * target)
            setCount(current)

            if (progress < 1) {
              animId = requestAnimationFrame(step)
            } else {
              setCount(target)
            }
          }

          animId = requestAnimationFrame(step)
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (animId) cancelAnimationFrame(animId)
    }
  }, [target])

  return (
    <div
      ref={ref}
      style={{
        fontSize: '28px',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        fontVariantNumeric: 'tabular-nums',
        color,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        marginBottom: '6px',
      }}
    >
      {count}
      {suffix}
    </div>
  )
}

export default function CoCurricularClientView({
  initialActivities,
}: CoCurricularClientViewProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [mode, setMode] = useState('All')
  const [previewActivity, setPreviewActivity] = useState<CoCurricularActivity | null>(null)

  // Map selected activity into unified PreviewItem
  const activityPreviewItem: PreviewItem | null = useMemo(() => {
    if (!previewActivity) return null

    const mediaList: PreviewMedia[] = []
    const seenUrls = new Set<string>()

    const primaryDoc = getCertificatePublicUrl(
      previewActivity.document_url || previewActivity.image_url
    )
    const isPdf = isPdfDocument(primaryDoc)
    if (primaryDoc) {
      seenUrls.add(primaryDoc)
      mediaList.push({
        url: primaryDoc,
        caption: previewActivity.title,
        isPdf,
      })
    }

    const thumbUrl = getCertificatePublicUrl(previewActivity.image_url)
    if (thumbUrl && !seenUrls.has(thumbUrl)) {
      seenUrls.add(thumbUrl)
      mediaList.push({
        url: thumbUrl,
        caption: `${previewActivity.title} Visual Evidence`,
      })
    }

    return {
      type: 'co-curricular',
      headerTag: `// ACTIVITY_PREVIEW · ${previewActivity.category || 'CO_CURRICULAR'}`,
      title: previewActivity.title,
      category: previewActivity.category,
      organizationOrIssuer: previewActivity.organization || undefined,
      dateOrDuration: previewActivity.date ? formatDate(previewActivity.date) : undefined,
      role: previewActivity.role || undefined,
      achievement: previewActivity.achievement || undefined,
      credentialId: previewActivity.credential_id,
      description: previewActivity.description,
      skills: previewActivity.skills,
      technologies: previewActivity.technologies,
      media: mediaList,
      downloadUrl: primaryDoc,
      verificationUrl: previewActivity.credential_url,
      detailsUrl: `/co-curricular/${previewActivity.slug}`,
      detailsLabel: 'VIEW ACTIVITY DETAILS',
    }
  }, [previewActivity])

  // Dynamic unique categories (preserving 'All' as first, strictly unique)
  const categories = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = ['All']
    seen.add('all')

    for (const a of initialActivities) {
      const cat = a.category?.trim()
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
  }, [initialActivities])

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return initialActivities.filter((a) => {
      const matchCat = category === 'All' || a.category?.toLowerCase() === category.toLowerCase()
      const matchMode = mode === 'All' || a.mode?.toLowerCase() === mode.toLowerCase()
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.organization && a.organization.toLowerCase().includes(q)) ||
        (a.role && a.role.toLowerCase().includes(q)) ||
        (a.achievement && a.achievement.toLowerCase().includes(q)) ||
        (a.skills && a.skills.some((s) => s.toLowerCase().includes(q))) ||
        (a.technologies && a.technologies.some((t) => t.toLowerCase().includes(q)))
      return matchCat && matchMode && matchSearch
    })
  }, [initialActivities, category, mode, search])

  // All filtered activities in order: featured first, then chronological
  const displayActivities = useMemo(() => {
    return [...filteredActivities].sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return dateB - dateA
    })
  }, [filteredActivities])

  // Dynamic Statistics
  const hackathonsCount = useMemo(
    () =>
      initialActivities.filter(
        (a) =>
          a.category?.toLowerCase().includes('hackathon') ||
          a.title?.toLowerCase().includes('hackathon') ||
          a.title?.toLowerCase().includes('sih')
      ).length,
    [initialActivities]
  )

  const leadershipCount = useMemo(
    () =>
      initialActivities.filter(
        (a) =>
          a.category?.toLowerCase().includes('lead') ||
          a.category?.toLowerCase().includes('club') ||
          a.role?.toLowerCase().includes('lead') ||
          a.role?.toLowerCase().includes('head')
      ).length,
    [initialActivities]
  )

  const competitionCount = useMemo(
    () =>
      initialActivities.filter(
        (a) =>
          a.category?.toLowerCase().includes('competition') ||
          a.achievement?.toLowerCase().includes('winner') ||
          a.achievement?.toLowerCase().includes('finalist')
      ).length,
    [initialActivities]
  )

  return (
    <div>
      {/* =========================================================================
          1. Cyber Statistics & Milestones Banner
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '36px',
        }}
      >
        {[
          {
            label: 'TOTAL ENGAGEMENTS',
            target: initialActivities.length,
            suffix: '',
            sub: 'Hackathons & Technical Events',
            accent: 'var(--color-accent)',
          },
          {
            label: 'HACKATHONS & SIH',
            target: hackathonsCount || 4,
            suffix: '+',
            sub: 'National & University Sprints',
            accent: '#3B82F6',
          },
          {
            label: 'LEADERSHIP & CLUBS',
            target: leadershipCount || 3,
            suffix: '+',
            sub: 'Student Chapters & Communities',
            accent: '#10B981',
          },
          {
            label: 'AWARDS & RECOGNITION',
            target: competitionCount || 2,
            suffix: '+',
            sub: 'Competitive Placements',
            accent: '#F59E0B',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card"
            style={{
              padding: '20px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              {stat.label}
            </div>
            <CyberStatCounter
              target={stat.target}
              suffix={stat.suffix}
              color={stat.accent}
            />
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================================
          Search & Category Filters
          ========================================================================= */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '36px',
        }}
      >
        {/* Category Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {categories.map((cat) => {
            const isActive = cat === category
            const count =
              cat === 'All'
                ? initialActivities.length
                : initialActivities.filter((a) => a.category?.toLowerCase() === cat.toLowerCase()).length

            if (count === 0 && cat !== 'All' && !isActive) return null

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  padding: '7px 14px',
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

        {/* Search Input & Mode Filter */}
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
              placeholder="Search activity, role, outcome..."
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

      {/* =========================================================================
          Editorial Activity Archive Cards
          ========================================================================= */}
      {filteredActivities.length === 0 ? (
        <div
          style={{
            padding: '64px 24px',
            textAlign: 'center',
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Trophy size={36} style={{ color: 'var(--color-text-muted)', opacity: 0.5, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', color: 'var(--color-text-primary)', margin: '0 0 6px' }}>
            No co-curricular activities match your criteria
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
            Try resetting your category, mode, or search filters.
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))',
            gap: '24px',
          }}
          className="co-curricular-grid"
        >
          {displayActivities.map((a) => {
            const orgName = a.organization || 'Independent Event'
            const modeColor =
              a.mode === 'Online'
                ? '#3B82F6'
                : a.mode === 'Hybrid'
                ? '#10B981'
                : 'var(--color-accent)'

            return (
              <article
                key={a.id}
                style={{
                  background: 'var(--color-card-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'clamp(20px, 3.5vw, 32px)',
                  boxShadow: 'var(--shadow-card)',
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
                }}
                className="activity-card"
              >
                {/* Top Header Strip */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingBottom: '14px',
                    borderBottom: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-accent-bg)',
                        border: '1px solid var(--color-accent-border)',
                        color: 'var(--color-accent)',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {a.category}
                    </span>

                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        color: modeColor,
                        fontWeight: 600,
                      }}
                    >
                      {a.mode}
                    </span>

                    {a.featured && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 8px',
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

                  {/* Date Info */}
                  {a.date && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      <Calendar size={12} />
                      <span>{formatDate(a.date)} {a.end_date ? `— ${formatDate(a.end_date)}` : ''}</span>
                    </div>
                  )}
                </div>

                {/* Main Content Body */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                  <div>
                    {/* Activity Image / Certificate Preview */}
                    {(a.image_url || a.document_url) && (
                      <div
                        style={{
                          marginBottom: '16px',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          position: 'relative',
                          cursor: 'pointer',
                        }}
                        onClick={() => setPreviewActivity(a)}
                        className="activity-media-clickable"
                      >
                        <CertificateMedia
                          fileUrl={a.document_url || a.image_url}
                          thumbnailUrl={a.image_url}
                          title={a.title}
                          issuer={orgName}
                          category={a.category}
                          aspectRatio="16/10"
                          interactive={false}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(14, 16, 23, 0.85)',
                            border: '1px solid var(--color-accent-border)',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '10.5px',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--color-accent)',
                            fontWeight: 600,
                            backdropFilter: 'blur(6px)',
                          }}
                        >
                          <Eye size={11} />
                          <span>PREVIEW</span>
                        </div>
                      </div>
                    )}

                    <h2
                      style={{
                        fontSize: 'clamp(18px, 2.2vw, 22px)',
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        margin: '0 0 6px',
                        lineHeight: 1.3,
                      }}
                    >
                      <Link
                        href={`/co-curricular/${a.slug}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                        className="activity-title-link"
                      >
                        {a.title}
                      </Link>
                    </h2>

                    <div
                      style={{
                        fontSize: '13px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                        marginBottom: '12px',
                      }}
                    >
                      <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{orgName}</span>
                      {a.role && (
                        <>
                          <span>·</span>
                          <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{a.role}</span>
                        </>
                      )}
                      {a.location && (
                        <>
                          <span>·</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={11} style={{ opacity: 0.7 }} /> {a.location}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Achievement Outcome Highlight */}
                    {a.achievement && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(245, 158, 11, 0.12)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          color: '#F59E0B',
                          fontSize: '12px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          marginBottom: '14px',
                        }}
                      >
                        <Award size={13} />
                        <span>{a.achievement}</span>
                      </div>
                    )}

                    {a.description && (
                      <p
                        style={{
                          fontSize: '14px',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.65,
                          margin: '0 0 16px',
                        }}
                      >
                        {a.description}
                      </p>
                    )}
                  </div>

                  {/* Skills & Technologies Tags */}
                  {(a.skills?.length > 0 || a.technologies?.length > 0) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {a.skills?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {a.skills.map((s, sIdx) => (
                            <span
                              key={sIdx}
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
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Strip with Action Links */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {a.credential_id && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-text-muted)',
                          background: 'var(--color-surface-2)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border-subtle)',
                        }}
                      >
                        ID: {a.credential_id}
                      </span>
                    )}

                    {a.credential_url && (
                      <a
                        href={a.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '12px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-text-secondary)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'color 0.2s',
                        }}
                      >
                        <span>Verification Link</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setPreviewActivity(a)}
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
                      aria-label={`Preview certificate or credential for ${a.title}`}
                    >
                      <Eye size={13} />
                      <span>VIEW CERTIFICATE</span>
                    </button>

                    <Link
                      href={`/co-curricular/${a.slug}`}
                      style={{
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: 'var(--color-text-secondary)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'transparent',
                        border: '1px solid var(--color-border)',
                        transition: 'all 0.2s ease',
                      }}
                      className="hover-accent-text"
                    >
                      <span>DETAILS</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Unified Activity Preview Modal */}
      <PreviewModal
        isOpen={Boolean(previewActivity)}
        onClose={() => setPreviewActivity(null)}
        item={activityPreviewItem}
      />

      <style>{`
        .activity-card:hover, .featured-hero-card:hover {
          border-color: var(--color-border-hover) !important;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md) !important;
        }
        .activity-title-link:hover {
          color: var(--color-accent) !important;
        }
        .btn-preview-cyber:hover {
          background: rgba(228, 93, 44, 0.22) !important;
          border-color: var(--color-accent) !important;
          box-shadow: 0 0 10px var(--color-accent-glow) !important;
          transform: translateY(-1px) !important;
        }
        .activity-media-clickable:hover {
          opacity: 0.95;
        }
      `}</style>
    </div>
  )
}
