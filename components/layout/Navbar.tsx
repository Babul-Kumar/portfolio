'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useSyncExternalStore } from 'react'

// Strict Section Order: ABOUT -> TRAINING -> CERTIFICATES -> CO-CURRICULAR -> WORK -> CONTACT
const NAV_ITEMS = [
  { label: 'ABOUT', href: '/#about', path: '/about' },
  { label: 'TRAINING', href: '/#training', path: '/training' },
  { label: 'CERTIFICATES', href: '/#certificates', path: '/certificates' },
  { label: 'CO-CURRICULAR', href: '/#co-curricular', path: '/co-curricular' },
  { label: 'WORK', href: '/#work', path: '/projects' },
  { label: 'CONTACT', href: '/#contact', path: '/contact' },
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
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark' as const)

  // Scroll background effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Active section tracker on homepage in exact order: about, training, certificates, co-curricular, work, contact
  useEffect(() => {
    if (!isHome) return

    const sections = ['about', 'training', 'certificates', 'co-curricular', 'work', 'contact']
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-25% 0px -50% 0px' }
    )

    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [isHome])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const handleNavClick = (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false)
    if (isHome && href.startsWith('/#')) {
      const targetId = href.replace('/#', '')
      const targetEl = document.getElementById(targetId)
      if (targetEl) {
        e.preventDefault()
        targetEl.scrollIntoView({ behavior: 'smooth' })
        window.history.pushState(null, '', href)
      }
    }
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
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          background: scrolled
            ? 'var(--color-card-bg)'
            : theme === 'light'
              ? 'rgba(250, 248, 245, 0.72)'
              : 'transparent',
          borderBottom: scrolled
            ? '1px solid var(--color-border)'
            : theme === 'light'
              ? '1px solid rgba(28, 25, 23, 0.06)'
              : '1px solid transparent',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          transition: 'all 0.35s var(--ease-out)',
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

          {/* Center Navigation in exact order: ABOUT, CERTIFICATES, WORK, CONTACT */}
          <nav
            className="desktop-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
            }}
            aria-label="Main Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const sectionKey = item.href.replace('/#', '')
              const isActive = isHome
                ? activeSection === sectionKey
                : pathname.startsWith(item.path)

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(item.href, e)}
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
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'var(--color-accent)',
                        borderRadius: '1px',
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
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-burger"
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                flexDirection: 'column',
                gap: '5px',
                zIndex: 110,
              }}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <span
                style={{
                  width: '20px',
                  height: '1.5px',
                  background: 'var(--color-text)',
                  transition: 'transform 0.3s ease',
                  transform: menuOpen ? 'rotate(45deg) translate(4.5px, 4.5px)' : 'none',
                }}
              />
              <span
                style={{
                  width: '20px',
                  height: '1.5px',
                  background: 'var(--color-text)',
                  transition: 'opacity 0.3s ease',
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  width: '20px',
                  height: '1.5px',
                  background: 'var(--color-text)',
                  transition: 'transform 0.3s ease',
                  transform: menuOpen ? 'rotate(-45deg) translate(4.5px, -4.5px)' : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation in exact order */}
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
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={(e) => handleNavClick(item.href, e)}
            style={{
              fontSize: '22px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: 'var(--color-text)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/resume"
          onClick={() => setMenuOpen(false)}
          style={{
            marginTop: '16px',
            fontSize: '13px',
            color: 'var(--color-accent)',
            textDecoration: 'none',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
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
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-burger { display: flex !important; }
        }
      `}</style>
    </>
  )
}
