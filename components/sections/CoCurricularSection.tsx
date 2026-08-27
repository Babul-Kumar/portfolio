'use client'

import Link from 'next/link'
import type { CoCurricularActivity } from '@/types'
import { formatDate } from '@/lib/utils'
import { Calendar, ArrowRight, Award } from 'lucide-react'

export default function CoCurricularSection({
  activities,
}: {
  activities: CoCurricularActivity[]
}) {
  if (activities.length === 0) return null

  return (
    <section id="co-curricular" className="section" style={{ position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '20px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '20px',
          }}
        >
          <div>
            <div className="text-label" style={{ marginBottom: '8px' }}>
              05 / Beyond the Classroom
            </div>
            <h2 className="text-display-sm">
              CO-CURRICULAR &<br />
              <span style={{ color: 'var(--color-accent)' }}>LEADERSHIP</span> INITIATIVES.
            </h2>
          </div>

          <Link
            href="/co-curricular"
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
            <span>View All Activities</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Activities Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
            gap: '24px',
          }}
          className="co-curr-home-grid"
        >
          {activities.map((a) => {
            const orgName = a.organization || 'Independent Initiative'
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
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '18px',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
                }}
                className="co-curr-card"
              >
                {/* Activity Image or Fallback Placeholder */}
                {a.image_url ? (
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      marginBottom: '18px',
                      background: 'var(--color-surface)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.image_url}
                      alt={a.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '18px',
                      gap: '8px',
                    }}
                  >
                    <Award size={18} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        opacity: 0.5,
                      }}
                    >
                      {a.category}
                    </span>
                  </div>
                )}

                <div>
                  {/* Category & Mode Strip */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-accent-bg)',
                          border: '1px solid var(--color-accent-border)',
                          color: 'var(--color-accent)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {a.category}
                      </span>

                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-2)',
                          color: modeColor,
                          fontWeight: 600,
                        }}
                      >
                        {a.mode}
                      </span>
                    </div>

                    {a.date && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Calendar size={11} />
                        {formatDate(a.date)}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: '17px',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      margin: '0 0 8px',
                      lineHeight: 1.35,
                    }}
                  >
                    <Link
                      href={`/co-curricular/${a.slug}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                      className="co-curr-link"
                    >
                      {a.title}
                    </Link>
                  </h3>

                  {/* Organization & Role */}
                  <div
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                      marginBottom: '10px',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{orgName}</span>
                    {a.role && (
                      <>
                        <span>·</span>
                        <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{a.role}</span>
                      </>
                    )}
                  </div>

                  {/* Achievement Highlight */}
                  {a.achievement && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        color: '#F59E0B',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        marginBottom: '12px',
                      }}
                    >
                      <Award size={12} />
                      <span>{a.achievement}</span>
                    </div>
                  )}

                  {/* Short Description */}
                  {a.description && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.6,
                        margin: '0 0 14px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {a.description}
                    </p>
                  )}

                  {/* Skills Tags */}
                  {a.skills && a.skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {a.skills.slice(0, 3).map((s, idx) => (
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
                      {a.skills.length > 3 && (
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                          +{a.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Link */}
                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)' }}>
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
                      gap: '4px',
                    }}
                  >
                    <span>View Activity Details</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <style>{`
        .co-curr-card:hover {
          border-color: var(--color-border-hover) !important;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md) !important;
        }
        .co-curr-link:hover {
          color: var(--color-accent) !important;
        }
        @media (max-width: 768px) {
          .co-curr-home-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
