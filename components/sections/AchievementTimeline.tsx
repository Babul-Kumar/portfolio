'use client'

import type { Achievement } from '@/types'
import { formatDate, getYear, groupBy } from '@/lib/utils'
import Link from 'next/link'

const CATEGORY_ICONS: Record<string, string> = {
  Hackathon: '⚡',
  Competition: '🏆',
  Award: '🎖️',
  Certification: '📜',
  Other: '✦',
}

export default function AchievementTimelineSection({
  achievements,
}: {
  achievements: Achievement[]
}) {
  if (achievements.length === 0) return null

  const byYear = groupBy(achievements, (a) => getYear(a.date))
  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a))

  return (
    <section id="milestones" className="section">
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '56px',
            flexWrap: 'wrap',
            gap: '16px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '24px',
          }}
        >
          <div>
            <div className="text-label" style={{ marginBottom: '12px' }}>
              03 / Milestones & Recognition
            </div>
            <h2 className="text-display-sm">
              ACHIEVEMENTS
            </h2>
          </div>
          <Link
            href="/achievements"
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
              background: 'rgba(229, 106, 61, 0.08)',
              border: '1px solid var(--color-accent-border)',
            }}
          >
            <span>View All Milestones</span>
            <span>→</span>
          </Link>
        </div>

        {/* Timeline Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '0 32px' }} className="timeline-grid">
          {years.map((year) => (
            <YearBlock key={year} year={year} items={byYear[year]} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .timeline-grid {
            grid-template-columns: 50px 1fr !important;
            gap: 0 16px !important;
          }
        }
      `}</style>
    </section>
  )
}

function YearBlock({ year, items }: { year: string; items: Achievement[] }) {
  return (
    <>
      {/* Year Label */}
      <div
        style={{
          paddingTop: '6px',
          fontSize: '13px',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-accent)',
          gridColumn: '1',
          textAlign: 'right',
        }}
      >
        {year}
      </div>

      {/* Item Blocks */}
      <div
        style={{
          gridColumn: '2',
          paddingBottom: '36px',
          borderLeft: '1px solid var(--color-border)',
          paddingLeft: '32px',
        }}
      >
        {items.map((item) => (
          <div key={item.id} className="glass-card" style={{ padding: '20px 24px', marginBottom: '20px', position: 'relative' }}>
            {/* Timeline Dot */}
            <div
              style={{
                position: 'absolute',
                left: '-37px',
                top: '24px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: item.featured ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.2)',
                boxShadow: item.featured ? '0 0 10px var(--color-accent)' : 'none',
              }}
            />

            {/* Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: '12px' }}>{CATEGORY_ICONS[item.category] ?? '✦'}</span>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                }}
              >
                {item.category}
              </span>
              {item.rank && (
                <span
                  style={{
                    fontSize: '11px',
                    color: '#10B981',
                    fontWeight: 500,
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {item.rank}
                </span>
              )}
            </div>

            <h3
              style={{
                fontSize: '17px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: 'var(--color-text)',
                marginBottom: '4px',
              }}
            >
              {item.title}
            </h3>

            {item.description && (
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '8px',
                }}
              >
                {item.description}
              </p>
            )}

            {item.organization && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {item.organization}
                {item.date && (
                  <span style={{ marginLeft: '8px' }}>· {formatDate(item.date, 'MMM yyyy')}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ gridColumn: '1' }} />
    </>
  )
}
