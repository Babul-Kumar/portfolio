import type { Metadata } from 'next'
import { getExperience } from '@/lib/data'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Experience',
  description: 'Professional experience, roles, internships, and technical contributions by Babul Kumar.',
}

export const revalidate = 3600

export default async function ExperiencePage() {
  const experiences = await getExperience()

  return (
    <div style={{ padding: 'var(--section-gap) var(--container-pad)', minHeight: '85vh' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '56px', borderBottom: '1px solid var(--color-border)', paddingBottom: '32px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>
            Career & Research
          </div>
          <h1 className="text-display" style={{ marginBottom: '20px' }}>
            WORK<br />EXPERIENCE
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
              maxWidth: '540px',
              lineHeight: 1.65,
            }}
          >
            Engineering contributions, AI research, open-source development, and technical roles.
          </p>
        </div>

        {experiences.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: '64px 32px',
              textAlign: 'center',
              maxWidth: '640px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: '12px',
              }}
            >
              Academic Exploration & Projects
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '12px' }}>
              Currently seeking engineering internships
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: '28px' }}>
              Focusing on AI/ML research and building full-stack applications. Available for internships and engineering roles.
            </p>
            <Link
              href="/contact"
              className="btn-primary"
            >
              Contact Me →
            </Link>
          </div>
        ) : (
          <div style={{ maxWidth: '880px' }}>
            {experiences.map((exp) => (
              <article
                key={exp.id}
                className="glass-card"
                style={{
                  padding: '32px',
                  marginBottom: '32px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                      {exp.role}
                    </h2>
                    <div style={{ fontSize: '15px', color: 'var(--color-accent)', fontWeight: 500, marginTop: '2px' }}>
                      {exp.company}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                      {formatDate(exp.start_date, 'MMM yyyy')} —{' '}
                      <span style={{ color: exp.is_current ? 'var(--color-accent)' : 'inherit' }}>
                        {exp.is_current ? 'Present' : formatDate(exp.end_date, 'MMM yyyy')}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--color-text-muted)',
                        marginTop: '4px',
                      }}
                    >
                      {exp.type}
                    </div>
                  </div>
                </div>

                {exp.location && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
                    📍 {exp.location}
                  </div>
                )}

                {exp.description && (
                  <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '20px' }}>
                    {exp.description}
                  </p>
                )}

                {exp.technologies && exp.technologies.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {exp.technologies.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          padding: '3px 9px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
