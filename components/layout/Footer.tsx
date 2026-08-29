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
        padding: '16px 0 14px',
        background: 'var(--color-surface)',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <AmbientSectionEnvironment variant="minimal" intensity={0.08} accentMode="cyan" />
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Row 1: Brand + Nav Links + Back to Top */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Brand & Role */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--color-text)',
                textTransform: 'uppercase',
              }}
            >
              BABUL <span style={{ color: 'var(--color-accent)' }}>KUMAR</span>
            </span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border-subtle)',
                padding: '2px 7px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              AI / ML Engineer · Full-Stack Architect
            </span>
          </div>

          {/* Quick Nav Links & Back to Top */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { href: '/', label: 'ABOUT' },
                { href: '/training', label: 'TRAINING' },
                { href: '/certificates', label: 'CERTIFICATES' },
                { href: '/co-curricular', label: 'CO-CURRICULAR' },
                { href: '/work', label: 'WORK' },
                { href: '/contact', label: 'CONTACT' },
                { href: '/resume', label: 'RESUME' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{
                    fontSize: '10.5px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <button
              onClick={scrollToTop}
              aria-label="Scroll back to top"
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-sm)',
                padding: '4px 10px',
                color: 'var(--color-text)',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
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
              <span>TOP</span>
              <span>↑</span>
            </button>
          </div>
        </div>

        {/* Row 2: Social Links + Status + Copyright */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            paddingTop: '8px',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            {externalLinks.map(({ href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '11px',
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
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--color-text-secondary)',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 6px #10B981',
              }}
            />
            <span style={{ fontWeight: 600, letterSpacing: '0.06em' }}>SYSTEM: ONLINE</span>
          </div>

          <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            © {year} Babul Kumar · Next.js 16 · Supabase
          </div>
        </div>
      </div>
    </footer>
  )
}
