'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Profile } from '@/types'
import { FALLBACK_PROFILE } from '@/lib/data'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'

interface FooterProps {
  profile?: Profile | null
}

export default function Footer({ profile }: FooterProps = {}) {
  const year = new Date().getFullYear()
  const [istTime, setIstTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setIstTime(
        new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now)
      )
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

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
        background: 'var(--color-card-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
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
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { href: '/', label: 'About' },
                { href: '/training', label: 'Training' },
                { href: '/certificates', label: 'Certificates' },
                { href: '/co-curricular', label: 'Co-Curricular' },
                { href: '/work', label: 'Work' },
                { href: '/contact', label: 'Contact' },
                { href: '/resume', label: 'Résumé' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{
                    fontSize: '12.5px',
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    letterSpacing: '-0.01em',
                    fontWeight: 500,
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Quick Interactive Command Launchers */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '5px 10px',
                  color: 'var(--color-text-secondary)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.01em',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent-border)'
                  e.currentTarget.style.color = 'var(--color-accent)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                }}
              >
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-cyber-terminal'))}
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '5px 10px',
                  color: 'var(--color-accent-teal, #14B8A6)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.01em',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
              >
                <span>Terminal (~)</span>
              </button>

              <button
                onClick={scrollToTop}
                aria-label="Scroll back to top"
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '5px 10px',
                  color: 'var(--color-text)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.01em',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  fontWeight: 500,
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
                <span>Top ↑</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Social Links + IST Live Clock + Status Beacon + Copyright */}
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

          {/* Telemetry IST Clock & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Live IST Clock */}
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
                  background: 'var(--color-accent-cyan, #06B6D4)',
                  boxShadow: '0 0 6px var(--color-accent-cyan, #06B6D4)',
                }}
              />
              <span style={{ fontWeight: 500, letterSpacing: '0.02em' }}>
                Punjab, IN · {istTime || '12:00:00'} IST
              </span>
            </div>

            {/* Health Beacon */}
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
              <span style={{ fontWeight: 600, letterSpacing: '0.02em', color: '#10B981' }}>Available</span>
            </div>
          </div>

          <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            © {year} Babul Kumar · LPU CSE · Next.js 16
          </div>
        </div>
      </div>
    </footer>
  )
}
