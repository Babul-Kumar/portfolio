'use client'

import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  const externalLinks = [
    { href: 'https://github.com/babul-kumar', label: 'GitHub' },
    { href: 'https://linkedin.com/in/babul-kumar', label: 'LinkedIn' },
    { href: 'https://kaggle.com/babul-kumar', label: 'Kaggle' },
    { href: 'mailto:bk7321634@gmail.com', label: 'Email' },
  ]

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        padding: '72px 0 40px',
        background: 'var(--color-card-bg)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
        }}
      >
        {/* Top row: Brand & Back to Top */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 'clamp(32px, 5vw, 64px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
                color: 'var(--color-text)',
              }}
            >
              BABUL<br />KUMAR
            </div>
            <div
              style={{
                fontSize: '12px',
                letterSpacing: '0.12em',
                color: 'var(--color-accent)',
                textTransform: 'uppercase',
                marginTop: '12px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
              }}
            >
              AI / ML · Full Stack · Software Engineering
            </div>
          </div>

          <button
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 18px',
              color: 'var(--color-text-secondary)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent-border)'
              e.currentTarget.style.color = 'var(--color-text)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
            }}
          >
            <span>Back to Top</span>
            <span>↑</span>
          </button>
        </div>

        {/* Bottom row: Social Links + Copyright */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            paddingTop: '32px',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {externalLinks.map(({ href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              >
                {label} ↗
              </a>
            ))}
            <Link
              href="/contact"
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            >
              Contact ↗
            </Link>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            © {year} Babul Kumar. Crafted with precision & Three.js.
          </div>
        </div>
      </div>
    </footer>
  )
}
