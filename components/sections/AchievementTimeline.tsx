import type { Achievement } from '@/types'
import { formatDate, getYear, groupBy } from '@/lib/utils'
import Link from 'next/link'

const CATEGORY_ICONS: Record<string, string> = {
  Hackathon: '⬡',
  Competition: '◈',
  Award: '◆',
  Certification: '◇',
  Other: '○',
}

export default function AchievementTimelineSection({ achievements }: { achievements: Achievement[] }) {
  if (achievements.length === 0) return null

  const byYear = groupBy(achievements, (a) => getYear(a.date))
  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a))

  return (
    <section style={{
      padding: 'var(--section-gap) var(--container-pad)',
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="text-label" style={{ marginBottom: '12px' }}>03 / Achievements</div>
            <h2 className="text-display-sm">MILESTONES</h2>
          </div>
          <Link
            href="/achievements"
            className="hover-text-accent"
            style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
          >
            View all →
          </Link>
        </div>

        {/* Timeline */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0 40px' }}>
          {years.map((year) => (
            <YearBlock key={year} year={year} items={byYear[year]} />
          ))}
        </div>
      </div>
    </section>
  )
}

function YearBlock({ year, items }: { year: string; items: Achievement[] }) {
  return (
    <>
      {/* Year label */}
      <div style={{
        paddingTop: '6px',
        fontSize: '13px',
        fontWeight: 500,
        letterSpacing: '0.06em',
        color: 'var(--color-text-muted)',
        gridColumn: '1',
        textAlign: 'right',
      }}>
        {year}
      </div>

      {/* Items */}
      <div style={{ gridColumn: '2', paddingBottom: '40px', borderLeft: '1px solid var(--color-border)', paddingLeft: '40px' }}>
        {items.map((item) => (
          <div key={item.id} style={{ marginBottom: '24px', position: 'relative' }}>
            {/* Timeline dot */}
            <div style={{
              position: 'absolute',
              left: '-47px',
              top: '6px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: item.featured ? 'var(--color-accent)' : 'var(--color-border)',
              border: '2px solid var(--color-bg)',
              boxShadow: '0 0 0 1px var(--color-border)',
            }} />

            {/* Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {CATEGORY_ICONS[item.category] ?? '○'}
              </span>
              <span style={{
                fontSize: '10px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: item.category === 'Hackathon' ? 'var(--color-accent)' : 'var(--color-text-muted)',
              }}>
                {item.category}
              </span>
              {item.rank && (
                <span style={{ fontSize: '10px', color: 'var(--color-accent)', fontWeight: 500 }}>
                  · {item.rank}
                </span>
              )}
            </div>

            <h3 style={{
              fontSize: '16px',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'var(--color-text)',
              marginBottom: '2px',
            }}>
              {item.title}
            </h3>

            {item.organization && (
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                {item.organization}
                {item.date && <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px' }}>· {formatDate(item.date, 'MMM yyyy')}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Spacer row */}
      <div style={{ gridColumn: '1' }} />
    </>
  )
}
