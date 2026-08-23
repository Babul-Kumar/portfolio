import type { Metadata } from 'next'
import { getEducation } from '@/lib/data'
import { formatDate } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Education',
  description: 'Academic background, degree, coursework, and institutions attended by Babul Kumar.',
}

export const revalidate = 3600

export default async function EducationPage() {
  const educationList = await getEducation()

  return (
    <div style={{ padding: 'var(--section-gap) var(--container-pad)', minHeight: '85vh' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '56px', borderBottom: '1px solid var(--color-border)', paddingBottom: '32px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>
            Academic Journey
          </div>
          <h1 className="text-display" style={{ marginBottom: '20px' }}>
            EDUCATION &<br />FOUNDATION
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
              maxWidth: '540px',
              lineHeight: 1.65,
            }}
          >
            Undergraduate degree, specialized coursework, and core computer science foundations.
          </p>
        </div>

        <div style={{ maxWidth: '880px' }}>
          {educationList.map((edu) => (
            <article
              key={edu.id}
              className="glass-card"
              style={{
                padding: '32px',
                marginBottom: '32px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                    {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                  </h2>
                  <div style={{ fontSize: '15px', color: 'var(--color-accent)', fontWeight: 500, marginTop: '2px' }}>
                    {edu.institution} {edu.location ? `· ${edu.location}` : ''}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                    {formatDate(edu.start_date, 'yyyy')} — {edu.is_current ? 'Present' : formatDate(edu.end_date, 'yyyy')}
                  </div>
                  {edu.grade && (
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: '#10B981',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        marginTop: '4px',
                      }}
                    >
                      {edu.grade}
                    </span>
                  )}
                </div>
              </div>

              {edu.description && (
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.75, marginTop: '16px' }}>
                  {edu.description}
                </p>
              )}

              {edu.website_url && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border-subtle)' }}>
                  <a
                    href={edu.website_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-accent)',
                      textDecoration: 'none',
                    }}
                    className="hover-accent-text"
                  >
                    Institution Website <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
