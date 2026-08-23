'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const navLinks = [
  { href: '/projects', label: 'Work' },
  { href: '/certificates', label: 'Archive' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (stored) setTheme(stored)

    const handler = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 var(--container-pad)',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'var(--color-bg)' : 'transparent',
          borderBottom: scrolled ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
          transition: 'background 0.35s ease, border-color 0.35s ease',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="brand-logo"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>BK</span>
          <span style={{ fontSize: '10px', color: 'var(--color-accent)', opacity: 0.8 }}>/</span>
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.15em' }}>ARCHIVE</span>
        </Link>

        {/* Desktop nav */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '36px',
          }}
          className="desktop-nav"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="navbar-link"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Minimal Theme Glyph Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="theme-toggle-btn"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>
              {theme === 'light' ? '◐' : '○'}
            </span>
          </button>

          {/* Resume CTA */}
          <Link
            href="/resume"
            className="resume-btn desktop-nav"
          >
            <span>RESUME</span>
            <span className="resume-arrow">→</span>
          </Link>

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-burger"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              flexDirection: 'column',
              gap: '5px',
            }}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: 'block',
                  width: '22px',
                  height: '1.5px',
                  background: 'var(--color-text)',
                  transition: 'all 0.3s',
                  transformOrigin: 'center',
                  transform: menuOpen
                    ? i === 0
                      ? 'rotate(45deg) translate(4.5px, 4.5px)'
                      : i === 2
                      ? 'rotate(-45deg) translate(4.5px, -4.5px)'
                      : 'scaleX(0)'
                    : 'none',
                }}
              />
            ))}
          </button>
        </div>
      </header>

      {/* Mobile overlay menu */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99,
          background: 'var(--color-bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'all' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      >
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMenuOpen(false)}
            style={{
              fontSize: '32px',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'var(--color-text)',
              textDecoration: 'none',
            }}
          >
            {label}
          </Link>
        ))}
        <Link
          href="/resume"
          onClick={() => setMenuOpen(false)}
          style={{
            fontSize: '14px',
            color: 'var(--color-accent)',
            textDecoration: 'none',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginTop: '16px',
            fontWeight: 500,
          }}
        >
          RESUME →
        </Link>
      </div>

      <style>{`
        .navbar-link {
          font-size: 13px;
          color: var(--color-text-secondary);
          letter-spacing: 0.04em;
          text-decoration: none;
          position: relative;
          padding-bottom: 2px;
          transition: color 0.2s ease;
        }
        .navbar-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background-color: var(--color-accent);
          transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .navbar-link:hover {
          color: var(--color-text);
        }
        .navbar-link:hover::after {
          width: 100%;
        }

        .theme-toggle-btn {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-text);
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .theme-toggle-btn:hover {
          border-color: var(--color-accent);
          transform: scale(1.05);
        }

        .resume-btn {
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-text);
          border: 1px solid var(--color-border);
          padding: 8px 16px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          background: transparent;
        }
        .resume-btn .resume-arrow {
          transition: transform 0.2s ease;
        }
        .resume-btn:hover {
          background: var(--color-text);
          color: var(--color-bg);
          border-color: var(--color-text);
        }
        .resume-btn:hover .resume-arrow {
          transform: translateX(3px);
        }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-burger { display: flex !important; }
        }
      `}</style>

      {/* Nav spacer */}
      <div style={{ height: '64px' }} />
    </>
  )
}
