import type { Metadata } from 'next'
import { getEducation } from '@/lib/data'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Education',
  description: 'Academic background, degree, coursework, and institutions attended by Babul Kumar.',
}

export const revalidate = 3600

export default async function EducationPage() {
  const educationList = await getEducation()

  return (
    <div style={{ padding: 'var(--section-gap) var(--container-pad)', minHeight: '80vh' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '80px' }}>
          <div className="text-label" style={{ marginBottom: '16px' }}>Academic Journey</div>
          <h1 className="text-display">
            EDUCATION &<br />FOUNDATION
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginTop: '24px', maxWidth: '440px', lineHeight: 1.7 }}>
            Degrees, academic milestones, core coursework, and foundational studies.
          </p>
        </div>

        <div style={{ maxWidth: '840px' }}>
          {educationList.map((edu, index) => (
            <article key={edu.id} style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr',
              gap: '40px',
              paddingBottom: '48px',
              marginBottom: '48px',
              borderBottom: index < educationList.length - 1 ? '1px solid var(--color-border)' : 'none',
            }} className="edu-item">
              {/* Period */}
              <div style={{
                fontSize: '13px',
                color: 'var(--color-text-muted)',
                paddingTop: '4px',
              }}>
                <div>{formatDate(edu.start_date, 'yyyy')} — {edu.is_current ? 'Present' : formatDate(edu.end_date, 'yyyy')}</div>
                {edu.is_current && (
                  <span style={{
                    display: 'inline-block',
                    fontSize: '10px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--color-accent)',
                    border: '1px solid var(--color-accent)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    marginTop: '8px',
                  }}>
                    Enrolled
                  </span>
                )}
              </div>

              {/* Details */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                    {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                  </h2>
                  {edu.grade && (
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--color-accent)',
                      background: 'var(--color-accent-bg)',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontWeight: 500,
                    }}>
                      {edu.grade}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '8px', fontWeight: 400 }}>
                  {edu.institution} {edu.location ? `· ${edu.location}` : ''}
                </div>

                {edu.description && (
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginTop: '14px' }}>
                    {edu.description}
                  </p>
                )}

                {edu.website_url && (
                  <a
                    href={edu.website_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: 'var(--color-accent)',
                      textDecoration: 'none',
                      marginTop: '16px',
                    }}
                  >
                    Institution Website ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .edu-item {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}
