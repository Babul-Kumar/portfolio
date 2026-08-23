import Link from 'next/link'

export default function ResumeCTASection({ resumeUrl }: { resumeUrl: string | null }) {
  return (
    <section style={{
      padding: 'var(--section-gap) var(--container-pad)',
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
    }}>
      <div style={{
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '40px',
      }}>
        <div>
          <div className="text-label" style={{ marginBottom: '16px' }}>07 / Document</div>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 64px)',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: 'var(--color-text)',
          }}>
            Download<br />my résumé.
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '16px', maxWidth: '360px' }}>
            A comprehensive overview of my skills, projects, and academic achievements.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {resumeUrl ? (
            <>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                download
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'var(--color-text)', color: 'var(--color-bg)',
                  padding: '14px 32px', borderRadius: '4px',
                  fontSize: '13px', letterSpacing: '0.04em',
                  textDecoration: 'none', fontWeight: 500, transition: 'opacity 0.2s',
                }}
              >
                ↓ Download PDF
              </a>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="hover-border-primary"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  border: '1px solid var(--color-border)', color: 'var(--color-text)',
                  padding: '14px 28px', borderRadius: '4px',
                  fontSize: '13px', letterSpacing: '0.04em',
                  textDecoration: 'none',
                }}
              >
                View →
              </a>
            </>
          ) : (
            <Link href="/contact" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'var(--color-accent)', color: '#fff',
              padding: '14px 28px', borderRadius: '4px',
              fontSize: '13px', letterSpacing: '0.04em', textDecoration: 'none',
            }}>
              Request résumé →
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
