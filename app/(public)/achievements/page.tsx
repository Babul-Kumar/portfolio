import type { Metadata } from 'next'
import { getAchievements } from '@/lib/data'
import { groupBy, getYear, formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Achievements',
  description: 'Hackathons, competitions, awards, and milestones in Babul Kumar\'s journey.',
}

export const revalidate = 3600

const CATEGORY_ICONS: Record<string, string> = {
  Hackathon: '⬡', Competition: '◈', Award: '◆', Certification: '◇', Other: '○',
}

export default async function AchievementsPage() {
  const achievements = await getAchievements()
  const byYear = groupBy(achievements, (a) => getYear(a.date))
  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a))

  return (
    <div style={{ padding: 'var(--section-gap) var(--container-pad)', minHeight: '80vh' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '80px' }}>
          <div className="text-label" style={{ marginBottom: '16px' }}>Milestones</div>
          <h1 className="text-display">ACHIEVEMENTS</h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginTop: '24px', maxWidth: '440px', lineHeight: 1.7 }}>
            A chronological archive of hackathons, competitions, awards, and notable achievements.
          </p>
        </div>

        {achievements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
            <p>No achievements listed yet.</p>
          </div>
        ) : (
          <div>
            {years.map((year) => (
              <div key={year} style={{ marginBottom: '64px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '40px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.06em', color: 'var(--color-text-muted)', paddingTop: '4px', textAlign: 'right' }}>
                    {year}
                  </div>
                  <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '40px' }}>
                    {byYear[year].map((achievement) => (
                      <div key={achievement.id} style={{ marginBottom: '32px', position: 'relative' }}>
                        {/* Dot */}
                        <div style={{
                          position: 'absolute', left: '-47px', top: '5px',
                          width: '10px', height: '10px', borderRadius: '50%',
                          background: achievement.featured ? 'var(--color-accent)' : 'var(--color-border)',
                          border: '2px solid var(--color-bg)',
                          boxShadow: '0 0 0 1px var(--color-border)',
                        }} />

                        {/* Category + rank */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                            {CATEGORY_ICONS[achievement.category] ?? '○'}
                          </span>
                          <span style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                            {achievement.category}
                          </span>
                          {achievement.rank && (
                            <span style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 500 }}>
                              · {achievement.rank}
                            </span>
                          )}
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            · {formatDate(achievement.date, 'MMM yyyy')}
                          </span>
                        </div>

                        <h2 style={{ fontSize: '18px', fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--color-text)', marginBottom: '4px' }}>
                          {achievement.title}
                        </h2>

                        {achievement.organization && (
                          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                            {achievement.organization}
                          </div>
                        )}

                        {achievement.description && (
                          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '8px', lineHeight: 1.65, maxWidth: '540px' }}>
                            {achievement.description}
                          </p>
                        )}

                        {achievement.verification_url && (
                          <a href={achievement.verification_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--color-accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                            Verify ↗
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
