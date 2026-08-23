import type { Metadata } from 'next'
import { getAchievements } from '@/lib/data'
import { groupBy, getYear, formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Achievements',
  description: 'Hackathons, competitions, awards, and milestones in Babul Kumar\'s journey.',
}

export const revalidate = 3600

const CATEGORY_ICONS: Record<string, string> = {
  Hackathon: '⚡',
  Competition: '🏆',
  Award: '🎖️',
  Certification: '📜',
  Other: '✦',
}

export default async function AchievementsPage() {
  const achievements = await getAchievements()
  const byYear = groupBy(achievements, (a) => getYear(a.date))
  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a))

  return (
    <div style={{ padding: 'var(--section-gap) var(--container-pad)', minHeight: '85vh' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '56px', borderBottom: '1px solid var(--color-border)', paddingBottom: '32px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>
            Milestones & Recognition
          </div>
          <h1 className="text-display" style={{ marginBottom: '20px' }}>
            ACHIEVEMENTS
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
              maxWidth: '540px',
              lineHeight: 1.65,
            }}
          >
            A chronological timeline of hackathons, algorithmic coding competitions,
            academic honors, and engineering milestones.
          </p>
        </div>

        {achievements.length === 0 ? (
          <div
            className="glass-card"
            style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--color-text-muted)' }}
          >
            <p>No achievements listed yet.</p>
          </div>
        ) : (
          <div>
            {years.map((year) => (
              <div key={year} style={{ marginBottom: '56px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '32px' }} className="timeline-page-grid">
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-accent)',
                      paddingTop: '6px',
                      textAlign: 'right',
                    }}
                  >
                    {year}
                  </div>
                  <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '32px' }}>
                    {byYear[year].map((achievement) => (
                      <div
                        key={achievement.id}
                        className="glass-card"
                        style={{
                          padding: '24px',
                          marginBottom: '24px',
                          position: 'relative',
                        }}
                      >
                        {/* Dot */}
                        <div
                          style={{
                            position: 'absolute',
                            left: '-37px',
                            top: '24px',
                            width: '9px',
                            height: '9px',
                            borderRadius: '50%',
                            background: achievement.featured ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.2)',
                            boxShadow: achievement.featured ? '0 0 10px var(--color-accent)' : 'none',
                          }}
                        />

                        {/* Category + rank */}
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                            marginBottom: '8px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span style={{ fontSize: '13px' }}>
                            {CATEGORY_ICONS[achievement.category] ?? '✦'}
                          </span>
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
                            {achievement.category}
                          </span>
                          {achievement.rank && (
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
                              {achievement.rank}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--color-text-muted)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            · {formatDate(achievement.date, 'MMM yyyy')}
                          </span>
                        </div>

                        <h2
                          style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            letterSpacing: '-0.01em',
                            color: 'var(--color-text)',
                            marginBottom: '6px',
                          }}
                        >
                          {achievement.title}
                        </h2>

                        {achievement.organization && (
                          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                            {achievement.organization}
                          </div>
                        )}

                        {achievement.description && (
                          <p
                            style={{
                              fontSize: '14px',
                              color: 'var(--color-text-secondary)',
                              lineHeight: 1.65,
                              maxWidth: '600px',
                            }}
                          >
                            {achievement.description}
                          </p>
                        )}

                        {achievement.verification_url && (
                          <a
                            href={achievement.verification_url}
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
                              marginTop: '12px',
                            }}
                            className="hover-accent-text"
                          >
                            Verify Credential ↗
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

      <style>{`
        @media (max-width: 640px) {
          .timeline-page-grid {
            grid-template-columns: 50px 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}
