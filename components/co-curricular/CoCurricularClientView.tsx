'use client'

import { useState, useMemo } from 'react'
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
} from 'lucide-react'

interface CoCurricularClientViewProps {
  initialActivities: CoCurricularActivity[]
}

const DEFAULT_CATEGORIES = [
  'All',
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

export default function CoCurricularClientView({
  initialActivities,
}: CoCurricularClientViewProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [mode, setMode] = useState('All')

  // Dynamic unique categories
  const categories = useMemo(() => {
    const present = new Set<string>()
    for (const a of initialActivities) {
      if (a.category?.trim()) present.add(a.category.trim())
    }
    for (const def of DEFAULT_CATEGORIES) {
      present.add(def)
    }
    return ['All', ...Array.from(present)]
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

  // Find premier featured activity for top hero card if available
  const featuredHero = useMemo(() => {
    if (category !== 'All' || mode !== 'All' || search) return null
    return filteredActivities.find((a) => a.featured) ?? null
  }, [filteredActivities, category, mode, search])

  // Regular activities list (excluding the hero card when shown)
  const regularActivities = useMemo(() => {
    if (!featuredHero) return filteredActivities
    return filteredActivities.filter((a) => a.id !== featuredHero.id)
  }, [filteredActivities, featuredHero])

  return (
    <div>
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
          marginBottom: '40px',
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
          FEATURED HERO SHOWCASE (When present)
          ========================================================================= */}
      {featuredHero && (
        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
            }}
          >
            <Sparkles size={13} />
            SPOTLIGHT INITIATIVE
          </div>

          <article
            style={{
              background: 'linear-gradient(135deg, var(--color-card-bg) 0%, var(--color-surface-2) 100%)',
              border: '1px solid var(--color-accent-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(24px, 4vw, 40px)',
              boxShadow: 'var(--shadow-card)',
              position: 'relative',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '20px',
            }}
            className="featured-hero-card"
          >
            {/* Header Meta */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-accent-bg)',
                    border: '1px solid var(--color-accent-border)',
                    color: 'var(--color-accent)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {featuredHero.category}
                </span>

                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-accent-teal)',
                    fontWeight: 600,
                  }}
                >
                  {featuredHero.mode}
                </span>
              </div>

              {featuredHero.date && (
                <span
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Calendar size={12} /> {formatDate(featuredHero.date)}
                </span>
              )}
            </div>

            {/* Title & Role */}
            <div>
              <h2
                style={{
                  fontSize: 'clamp(22px, 3.2vw, 32px)',
                  fontWeight: 800,
                  color: 'var(--color-text-primary)',
                  margin: '0 0 10px',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25,
                }}
              >
                <Link
                  href={`/co-curricular/${featuredHero.slug}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                  className="activity-title-link"
                >
                  {featuredHero.title}
                </Link>
              </h2>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '16px',
                }}
              >
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                  {featuredHero.organization || 'Independent Event'}
                </span>
                {featuredHero.role && (
                  <>
                    <span>·</span>
                    <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
                      {featuredHero.role}
                    </span>
                  </>
                )}
                {featuredHero.location && (
                  <>
                    <span>·</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={11} /> {featuredHero.location}
                    </span>
                  </>
                )}
              </div>

              {/* Prominent Achievement Badge */}
              {featuredHero.achievement && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: '#F59E0B',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    marginBottom: '16px',
                  }}
                >
                  <Award size={15} />
                  <span>{featuredHero.achievement}</span>
                </div>
              )}

              {featuredHero.description && (
                <p
                  style={{
                    fontSize: '15px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.7,
                    margin: '0 0 20px',
                    maxWidth: '850px',
                  }}
                >
                  {featuredHero.description}
                </p>
              )}

              {/* Skills Tags */}
              {featuredHero.skills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {featuredHero.skills.map((s, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        padding: '3px 9px',
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

              {/* Action Button */}
              <Link
                href={`/co-curricular/${featuredHero.slug}`}
                style={{
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-accent)',
                  boxShadow: 'var(--shadow-accent)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>View Full Activity Overview</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        </div>
      )}

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {regularActivities.map((a) => {
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

                  <Link
                    href={`/co-curricular/${a.slug}`}
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: 'var(--color-accent)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-accent-bg)',
                      border: '1px solid var(--color-accent-border)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>View Activity Details</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <style>{`
        .activity-card:hover, .featured-hero-card:hover {
          border-color: var(--color-border-hover) !important;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md) !important;
        }
        .activity-title-link:hover {
          color: var(--color-accent) !important;
        }
      `}</style>
    </div>
  )
}
