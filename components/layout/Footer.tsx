'use client'

import Link from 'next/link'
import type { Profile } from '@/types'
import { FALLBACK_PROFILE } from '@/lib/data'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'

interface FooterProps {
  profile?: Profile | null
}

export default function Footer({ profile }: FooterProps = {}) {
  const year = new Date().getFullYear()

  const githubUrl = profile?.github_url || FALLBACK_PROFILE.github_url || 'https://github.com/babul-kumar'
  const linkedinUrl = profile?.linkedin_url || FALLBACK_PROFILE.linkedin_url || 'https://linkedin.com/in/babul-kumar'
  const kaggleUrl = profile?.kaggle_url || FALLBACK_PROFILE.kaggle_url || 'https://kaggle.com/babul-kumar'
  const rawEmail = profile?.email || FALLBACK_PROFILE.email || 'bk7321634@gmail.com'
  const emailHref = rawEmail.startsWith('mailto:') ? rawEmail : `mailto:${rawEmail}`

  const externalLinks = [
    { href: githubUrl, label: 'GitHub' },
    { href: linkedinUrl, label: 'LinkedIn' },
    { href: kaggleUrl, label: 'Kaggle' },
    { href: emailHref, label: 'Email' },
  ]

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        padding: '36px 0 28px',
        background: 'var(--color-surface)',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <AmbientSectionEnvironment variant="minimal" intensity={0.15} accentMode="cyan" />
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'relative',
          zIndex: 1,
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
                fontSize: 'clamp(28px, 4.5vw, 56px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
                color: 'var(--color-text)',
              }}
            >
              BABUL<br />
              <span style={{ color: 'var(--color-accent)' }}>KUMAR</span>
            </div>
            <div
              style={{
                fontSize: '12px',
                letterSpacing: '0.12em',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                marginTop: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
              }}
            >
              AI / ML Engineer · Full Stack Developer
            </div>
          </div>

          <button
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-sm)',
              padding: '10px 18px',
              color: 'var(--color-text)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent-border)'
              e.currentTarget.style.color = 'var(--color-accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-text)'
            }}
          >
            <span>Back to Top</span>
            <span>↑</span>
          </button>
        </div>

        {/* Bottom row: Social Links + Tech Specs + Copyright */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            paddingTop: '24px',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
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
                  gap: '3px',
                  transition: 'color 0.2s ease',
                  fontWeight: 500,
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
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            >
              Contact ↗
            </Link>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            © {year} Babul Kumar. Architecture: Next.js 16 · Three.js · Supabase.
          </div>
        </div>
      </div>
    </footer>
  )
}
