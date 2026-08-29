'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useSyncExternalStore } from 'react'
import { motion } from 'framer-motion'

// Multi-Page Dedicated Navigation Routes
const NAV_ITEMS = [
  { label: 'ABOUT', href: '/' },
  { label: 'TRAINING', href: '/training' },
  { label: 'CERTIFICATES', href: '/certificates' },
  { label: 'CO-CURRICULAR', href: '/co-curricular' },
  { label: 'WORK', href: '/work' },
  { label: 'CONTACT', href: '/contact' },
]

function getThemeSnapshot(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'dark'
}

function subscribeTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark' as const)

  // Scroll background effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-close mobile menu on route change
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setMenuOpen(false)
  }

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [menuOpen])

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  // Active state matching supporting nested routes
  const isItemActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/about'
    }
    if (href === '/work') {
      return pathname.startsWith('/work') || pathname.startsWith('/projects')
    }
    return pathname === href || pathname.startsWith(`${href}/`)
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
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          background: scrolled
            ? 'var(--color-card-bg)'
            : theme === 'light'
              ? 'rgba(247, 245, 240, 0.88)'
              : 'rgba(6, 7, 9, 0.82)',
          borderBottom: scrolled
            ? '1px solid var(--color-border)'
            : theme === 'light'
              ? '1px solid rgba(20, 19, 18, 0.06)'
              : '1px solid rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          transition: 'all 0.3s var(--ease-out)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Logo (Left) */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: 'var(--color-text)',
            }}
            aria-label="Babul Kumar Home"
          >
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                fontFamily: 'var(--font-sans)',
              }}
            >
              BK
            </span>
            <span style={{ color: 'var(--color-accent)', opacity: 0.8, fontSize: '13px' }}>/</span>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.12em',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              Babul Kumar
            </span>
          </Link>

          {/* Center Navigation in exact order: ABOUT, TRAINING, CERTIFICATES, CO-CURRICULAR, WORK, CONTACT */}
          <nav
            className="desktop-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
            }}
            aria-label="Main Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = isItemActive(item.href)

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    position: 'relative',
                    padding: '6px 0',
                    transition: 'color 0.2s ease',
                    fontFamily: 'var(--font-mono)',
                  }}
                  className="nav-link"
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'var(--color-accent)',
                        borderRadius: '1px',
                        boxShadow: '0 0 10px var(--color-accent), 0 0 20px rgba(228, 93, 44, 0.4)',
                      }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Actions: Theme Switcher & Resume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
              style={{
                background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-text)',
                boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease',
              }}
              className="theme-btn"
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>
                {theme === 'light' ? '◐' : '○'}
              </span>
            </button>

            {/* Resume CTA */}
            <Link
              href="/resume"
              className="desktop-nav"
              style={{
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-text)',
                background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--color-border)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s var(--ease-out)',
                fontFamily: 'var(--font-mono)',
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
              <span>RESUME</span>
              <span style={{ fontSize: '12px' }}>↗</span>
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-burger"
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                flexDirection: 'column',
                gap: '5px',
                zIndex: 115,
              }}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation-menu"
            >
              <span
                style={{
                  width: '22px',
                  height: '2px',
                  background: 'var(--color-text)',
                  transition: 'transform 0.25s ease',
                  transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
                }}
              />
              <span
                style={{
                  width: '22px',
                  height: '2px',
                  background: 'var(--color-text)',
                  transition: 'opacity 0.2s ease',
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  width: '22px',
                  height: '2px',
                  background: 'var(--color-text)',
                  transition: 'transform 0.25s ease',
                  transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-navigation-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        style={{
          position: 'fixed',
          inset: 0,
          background: theme === 'light' ? 'rgba(247, 245, 240, 0.98)' : 'rgba(6, 7, 9, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 110,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '18px',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'all' : 'none',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          transform: menuOpen ? 'none' : 'translateY(-10px)',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMenuOpen(false)
        }}
        aria-hidden={!menuOpen}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = isItemActive(item.href)

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: '18px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: isActive ? 'var(--color-accent)' : 'var(--color-text)',
                textDecoration: 'none',
                fontFamily: 'var(--font-mono)',
                padding: '8px 24px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--color-accent-bg)' : 'transparent',
                border: isActive ? '1px solid var(--color-accent-border)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </Link>
          )
        })}
        <Link
          href="/resume"
          onClick={() => setMenuOpen(false)}
          style={{
            marginTop: '12px',
            fontSize: '12px',
            color: 'var(--color-accent)',
            textDecoration: 'none',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            padding: '10px 24px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-accent)',
            background: 'var(--color-accent-bg)',
          }}
        >
          VIEW RÉSUMÉ ↗
        </Link>
      </div>

      <style>{`
        .nav-link:hover {
          color: var(--color-text) !important;
        }
        .theme-btn:hover {
          border-color: var(--color-accent-border);
          transform: scale(1.05);
        }
        @media (max-width: 860px) {
          .desktop-nav { display: none !important; }
          .mobile-burger { display: flex !important; }
        }
      `}</style>
    </>
  )
}
