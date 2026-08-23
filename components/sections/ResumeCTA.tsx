'use client'

import Link from 'next/link'

export default function ResumeCTASection({ resumeUrl }: { resumeUrl: string | null }) {
  return (
    <section className="section" style={{ background: 'rgba(17, 17, 17, 0.5)' }}>
      <div className="container">
        <div
          className="glass-card"
          style={{
            padding: 'clamp(32px, 6vw, 64px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '32px',
          }}
        >
          <div>
            <div className="text-label" style={{ marginBottom: '12px' }}>
              07 / Documentation
            </div>
            <h2
              style={{
                fontSize: 'clamp(28px, 4.5vw, 48px)',
                fontWeight: 600,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: 'var(--color-text)',
              }}
            >
              DOWNLOAD MY<br />
              CURRICULUM VITAE.
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: 'var(--color-text-secondary)',
                marginTop: '16px',
                maxWidth: '440px',
                lineHeight: 1.6,
              }}
            >
              A structured summary of my technical competencies, AI/ML engineering projects,
              hackathons, and academic background at Lovely Professional University.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            {resumeUrl ? (
              <>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="btn-primary"
                >
                  <span>Download PDF</span>
                  <span>↓</span>
                </a>
                <Link
                  href="/resume"
                  className="btn-secondary"
                >
                  <span>Interactive Sheet</span>
                  <span>→</span>
                </Link>
              </>
            ) : (
              <Link
                href="/resume"
                className="btn-primary"
              >
                <span>View Full Résumé</span>
                <span>→</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
