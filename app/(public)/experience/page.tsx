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
    <div style={{ padding: 'var(--section-gap) var(--container-pad)', minHeight: '80vh' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '80px' }}>
          <div className="text-label" style={{ marginBottom: '16px' }}>Career & Roles</div>
          <h1 className="text-display">
            WORK<br />EXPERIENCE
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginTop: '24px', maxWidth: '440px', lineHeight: 1.7 }}>
            A record of internships, engineering roles, and technical collaborations.
          </p>
        </div>

        {experiences.length === 0 ? (
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '64px 32px',
            textAlign: 'center',
            maxWidth: '600px',
          }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '8px' }}>
              Academic Exploration & Projects
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-text)', marginBottom: '12px' }}>
              Currently seeking new opportunities
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              Focusing on AI/ML research and building full-stack applications. Available for internships and engineering roles.
            </p>
            <Link href="/contact" style={{
              display: 'inline-block',
              background: 'var(--color-text)',
              color: 'var(--color-bg)',
              padding: '12px 24px',
              borderRadius: '4px',
              fontSize: '13px',
              textDecoration: 'none',
              fontWeight: 500,
            }}>
              Contact Me →
            </Link>
          </div>
        ) : (
          <div style={{ maxWidth: '800px' }}>
            {experiences.map((exp, index) => (
              <article key={exp.id} style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: '40px',
                paddingBottom: '48px',
                marginBottom: '48px',
                borderBottom: index < experiences.length - 1 ? '1px solid var(--color-border)' : 'none',
              }} className="exp-item">
                <div style={{
                  fontSize: '12px',
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.04em',
                  paddingTop: '4px',
                }}>
                  <div>{formatDate(exp.start_date, 'MMM yyyy')}</div>
                  <div style={{ color: 'var(--color-accent)', marginTop: '2px' }}>
                    {exp.is_current ? 'Present' : formatDate(exp.end_date, 'MMM yyyy')}
                  </div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '8px' }}>
                    {exp.type}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                      {exp.role}
                    </h2>
                    <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                      {exp.company}
                    </span>
                  </div>

                  {exp.location && (
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
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
                        <span key={t} style={{
                          fontSize: '11px',
                          padding: '3px 9px',
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '3px',
                          color: 'var(--color-text-secondary)',
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .exp-item {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}
