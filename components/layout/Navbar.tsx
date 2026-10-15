'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useSyncExternalStore } from 'react'
import { Search, Terminal as TerminalIcon, Volume2, VolumeX } from 'lucide-react'
import CommandPalette from '@/components/ui/CommandPalette'
import CyberTerminalModal from '@/components/ui/CyberTerminalModal'
import { isSfxEnabled, setSfxEnabled, playMechanicalClick, playHoverTick } from '@/lib/audio'

// Multi-Page Dedicated Navigation Routes
const NAV_ITEMS = [
  { label: 'About', href: '/about' },
  { label: 'Training', href: '/training' },
  { label: 'Certificates', href: '/certificates' },
  { label: 'Co-Curricular', href: '/co-curricular' },
  { label: 'Work', href: '/work' },
  { label: 'Contact', href: '/contact' },
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

  const [scrollProgress, setScrollProgress] = useState(0)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [sfxActive, setSfxActive] = useState(false)

  // Scroll background and reading telemetry progress effect
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)))
      }
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
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

  // Global keydown listeners: Cmd+K / Ctrl+K, Backtick for terminal, Escape
  useEffect(() => {
    setSfxActive(isSfxEnabled())

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        playMechanicalClick()
        setCommandPaletteOpen((prev) => !prev)
        return
      }

      if (e.key === '`' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault()
        playMechanicalClick()
        setTerminalOpen((prev) => !prev)
        return
      }

      if (e.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    const handleOpenPalette = () => {
      playMechanicalClick()
      setCommandPaletteOpen(true)
    }

    const handleOpenTerminal = () => {
      playMechanicalClick()
      setTerminalOpen(true)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-command-palette', handleOpenPalette)
    window.addEventListener('open-cyber-terminal', handleOpenTerminal)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-command-palette', handleOpenPalette)
      window.removeEventListener('open-cyber-terminal', handleOpenTerminal)
    }
  }, [])

  function toggleTheme() {
    playMechanicalClick()
    const next = theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  // Active state matching supporting nested routes
  const isItemActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    if (href === '/about') {
      return pathname === '/about' || pathname.startsWith('/about/')
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
          transition: 'background-color 0.3s var(--ease-out), border-color 0.3s var(--ease-out)',
        }}
      >
        {/* Top Cyber Telemetry Laser Scroll-Progress Indicator */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${scrollProgress.toFixed(1)}%`,
            height: '2.5px',
            background: 'linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-teal) 50%, var(--color-accent-cyan) 100%)',
            boxShadow: '0 0 10px var(--color-accent), 0 0 20px var(--color-accent-teal)',
            zIndex: 105,
            transition: 'width 0.08s linear',
          }}
        />

        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Logo (Left) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

            {/* Live System Status HUD Badge */}
            <div
              className="desktop-nav"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 8px #10B981',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontSize: '10.5px',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.02em',
                  color: '#10B981',
                  fontWeight: 600,
                }}
              >
                Available
              </span>
            </div>
          </div>

          {/* Center Navigation in exact order: About, Training, Certificates, Co-Curricular, Work, Contact */}
          <nav
            className="desktop-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '26px',
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
                    fontSize: '13.5px',
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: '-0.01em',
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    position: 'relative',
                    padding: '6px 0',
                    transition: 'color 0.2s ease',
                    fontFamily: 'var(--font-sans)',
                  }}
                  className="nav-link"
                >
                  {item.label}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'var(--color-accent)',
                      borderRadius: '1px',
                      boxShadow: '0 0 10px var(--color-accent), 0 0 20px rgba(228, 93, 44, 0.4)',
                      transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'left center',
                      transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                </Link>
              )
            })}
          </nav>

          {/* Right Actions: Command Palette, Terminal, SFX, Theme & Resume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Quick Command Palette Launcher */}
            <button
              type="button"
              onClick={() => {
                playMechanicalClick()
                setCommandPaletteOpen(true)
              }}
              onMouseEnter={() => playHoverTick()}
              aria-label="Open Command Palette (Ctrl+K or Cmd+K)"
              className="desktop-nav"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 11px',
                cursor: 'pointer',
                color: 'var(--color-text)',
                boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s var(--ease-out)',
              }}
            >
              <Search size={12} style={{ color: 'var(--color-accent)' }} />
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.01em',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                }}
              >
                Search
              </span>
            </button>

            {/* Interactive Shell Terminal Button */}
            <button
              type="button"
              onClick={() => {
                playMechanicalClick()
                setTerminalOpen(true)
              }}
              onMouseEnter={() => playHoverTick()}
              aria-label="Open Developer Shell Terminal (`)"
              title="Interactive Terminal Shell (`)"
              className="desktop-nav"
              style={{
                background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-text)',
                boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s var(--ease-out)',
              }}
            >
              <TerminalIcon size={14} style={{ color: 'var(--color-accent-teal, #14B8A6)' }} />
            </button>

            {/* UI Audio SFX Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !sfxActive
                setSfxActive(next)
                setSfxEnabled(next)
                if (next) playMechanicalClick()
              }}
              aria-label={sfxActive ? 'Mute UI audio haptics' : 'Enable UI audio haptics'}
              title={sfxActive ? 'Sound FX: ACTIVE (Click to mute)' : 'Sound FX: MUTED (Click to activate)'}
              style={{
                background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                border: sfxActive ? '1px solid var(--color-accent-border)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: sfxActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {sfxActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
              style={{
                background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                width: '34px',
                height: '34px',
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
              <span style={{ fontSize: '13px', lineHeight: 1 }}>
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
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
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
              <span style={{ fontSize: '11px' }}>↗</span>
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
          gap: '16px',
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
                fontSize: '19px',
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '-0.015em',
                color: isActive ? 'var(--color-accent)' : 'var(--color-text)',
                textDecoration: 'none',
                fontFamily: 'var(--font-sans)',
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

        {/* Mobile Quick Action Buttons: Search & Terminal */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              setCommandPaletteOpen(true)
            }}
            style={{
              padding: '9px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '12px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Search size={13} style={{ color: 'var(--color-accent)' }} />
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              setTerminalOpen(true)
            }}
            style={{
              padding: '9px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-accent-teal, #14B8A6)',
              fontSize: '12px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <TerminalIcon size={13} />
            <span>Terminal (~)</span>
          </button>
        </div>

        <Link
          href="/resume"
          onClick={() => setMenuOpen(false)}
          style={{
            marginTop: '8px',
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

      {/* Global Interactive Modals */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenTerminal={() => setTerminalOpen(true)}
      />
      <CyberTerminalModal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
      />

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
