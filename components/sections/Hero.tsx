'use client'

import { useRef, useEffect, useState, useSyncExternalStore } from 'react'
import type { Profile } from '@/types'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight, Sparkles, Terminal, Cpu, Database, Network, Search } from 'lucide-react'
import HeroAvatarStage from '@/components/hero/HeroAvatarStage'
import { playMechanicalClick, playHoverTick } from '@/lib/audio'

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

const TECHNICAL_PILLARS = [
  { num: '01', title: 'AST-Aware AI Agents', icon: Terminal },
  { num: '02', title: 'Predictive ML & Boosting', icon: Cpu },
  { num: '03', title: 'Full-Stack Next.js & RPC', icon: Network },
  { num: '04', title: 'Forensic Computer Vision', icon: Sparkles },
  { num: '05', title: 'Model Context Protocol (MCP)', icon: Database },
]

interface HeroProps {
  profile: Profile | null
}

export default function HeroSection({ profile }: HeroProps) {
  const mouse = useRef({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [activePillar, setActivePillar] = useState(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }

    window.addEventListener('mousemove', onMove, { passive: true })

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    // Pillar ticker cycle
    const interval = setInterval(() => {
      setActivePillar((p) => (p + 1) % TECHNICAL_PILLARS.length)
    }, 3200)

    return () => {
      window.removeEventListener('mousemove', onMove)
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark' as const)
  const isLight = theme === 'light'

  const name = profile?.display_name ?? 'BABUL KUMAR'
  const [firstName, lastName] = name.split(' ')

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingTop: 'clamp(80px, 9vh, 96px)',
        paddingBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Main Hero Two-Column Composition */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.08fr) minmax(0, 1fr)',
            gap: 'clamp(24px, 3.5vw, 56px)',
            alignItems: 'start',
          }}
          className="hero-grid"
        >
          {/* Left Column: Core Identity & Narrative */}
          <div>
            {/* Status Pill Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '9px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '20px',
              }}
            >
              <span className="status-pulse" />
              <span
                style={{
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.01em',
                  color: 'var(--color-text)',
                  fontWeight: 600,
                }}
              >
                Available for SDE &amp; AI / ML Roles
              </span>
              <span
                style={{
                  fontSize: '10.5px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent)',
                  background: 'var(--color-accent-bg)',
                  border: '1px solid var(--color-accent-border)',
                  padding: '1px 7px',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                2028
              </span>
            </div>

            {/* Display Name */}
            <div
              style={{
                marginBottom: '18px',
              }}
            >
              <h1
                className="text-display"
                style={{
                  fontSize: 'clamp(38px, 5.4vw, 68px)',
                  letterSpacing: '-0.035em',
                  lineHeight: 1.04,
                  margin: 0,
                  fontWeight: 800,
                }}
              >
                <span
                  style={{
                    display: 'block',
                    color: isLight ? '#121110' : '#F5F6F8',
                    textShadow: isLight ? 'none' : '0 0 35px rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {firstName || 'Babul'}
                </span>
                <span
                  style={{
                    display: 'block',
                    color: isLight ? '#D4481C' : '#E45D2C',
                    filter: isLight
                      ? 'drop-shadow(0 4px 14px rgba(212, 72, 28, 0.25))'
                      : 'drop-shadow(0 0 25px rgba(228, 93, 44, 0.35))',
                  }}
                >
                  {lastName || 'Kumar'}
                </span>
              </h1>
            </div>

            {/* Main Value Proposition */}
            <h2
              style={{
                fontSize: 'clamp(18px, 1.7vw, 23px)',
                color: 'var(--color-text)',
                lineHeight: 1.4,
                fontWeight: 600,
                letterSpacing: '-0.015em',
                maxWidth: '640px',
                marginBottom: '16px',
              }}
            >
              Building intelligent systems at the intersection of AI research, predictive modeling, and full-stack software architecture.
            </h2>

            {/* Concise Bio */}
            <p
              style={{
                fontSize: 'clamp(14px, 1.05vw, 15px)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.7,
                maxWidth: '580px',
                marginBottom: '32px',
              }}
            >
              Computer Science & Engineering student at <strong>Lovely Professional University</strong>.
              Creator of <em>BotBro</em> (AST-aware developer agents), predictive ML gradient-boosted systems, and resilient cloud software.
            </p>

            {/* CTA Buttons & Interactive Control Deck Launchers */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: '32px',
              }}
            >
              <Link
                href="/work"
                className="btn-primary"
                style={{
                  boxShadow: isLight ? '0 4px 14px rgba(212, 72, 28, 0.22)' : '0 0 24px rgba(228, 93, 44, 0.35)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onClick={() => playMechanicalClick()}
              >
                <span>Explore Work</span>
                <ArrowDown size={14} />
              </Link>

              <Link
                href="/contact"
                className="btn-secondary"
                style={{
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onClick={() => playMechanicalClick()}
              >
                <span>Get in Touch</span>
                <span>→</span>
              </Link>

              <Link
                href="/resume"
                style={{
                  fontSize: '12.5px',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.01em',
                  color: 'var(--color-accent)',
                  padding: '10px 14px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600,
                }}
                className="hover-accent-text"
                onClick={() => playMechanicalClick()}
              >
                <span>Résumé</span>
                <ArrowUpRight size={13} />
              </Link>

              {/* Instant Interactive Launchers */}
              <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    playMechanicalClick()
                    window.dispatchEvent(new CustomEvent('open-command-palette'))
                  }}
                  onMouseEnter={() => playHoverTick()}
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    color: 'var(--color-text-secondary)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.02em',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-border)'
                    e.currentTarget.style.color = 'var(--color-accent)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                  }}
                  title="Search Portfolio"
                >
                  <Search size={12} style={{ color: 'var(--color-accent)' }} />
                  <span>Search</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playMechanicalClick()
                    window.dispatchEvent(new CustomEvent('open-cyber-terminal'))
                  }}
                  onMouseEnter={() => playHoverTick()}
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    color: 'var(--color-accent-teal, #14B8A6)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.02em',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.4)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                  }}
                  title="Open Interactive Cyber Shell (`)"
                >
                  <Terminal size={12} />
                  <span>Terminal</span>
                </button>
              </div>
            </div>

            {/* Technical Pillars Interactive Strip */}
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                Core Focus Areas:
              </span>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {TECHNICAL_PILLARS.map((pillar, idx) => {
                  const isActive = activePillar === idx
                  const Icon = pillar.icon
                  return (
                    <button
                      key={pillar.num}
                      type="button"
                      onClick={() => setActivePillar(idx)}
                      style={{
                        fontSize: '11.5px',
                        fontFamily: 'var(--font-sans)',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: isActive ? 'var(--color-accent-bg)' : 'var(--color-surface)',
                        border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        boxShadow: isActive ? '0 0 16px rgba(228, 93, 44, 0.25)' : 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.25s ease',
                        fontWeight: 500,
                      }}
                    >
                      <Icon size={13} style={{ opacity: isActive ? 1 : 0.6 }} />
                      <span>{pillar.title}</span>
                    </button>
                  )
                })}
              </div>

              {/* Live Telemetry Focus HUD Card */}
              <div
                style={{
                  marginTop: '12px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-accent-border)',
                  background: 'rgba(228, 93, 44, 0.05)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  maxWidth: '560px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--color-accent)',
                      boxShadow: '0 0 8px var(--color-accent)',
                    }}
                  />
                  <span style={{ fontSize: '12px', color: 'var(--color-text)', fontWeight: 600 }}>
                    {TECHNICAL_PILLARS[activePillar].title}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-accent-teal)',
                    letterSpacing: '0.04em',
                    fontWeight: 600,
                  }}
                >
                  Active Specialization #{TECHNICAL_PILLARS[activePillar].num}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Large Full-Body 3D AI Engineer Avatar Stage */}
          <div
            style={{
              height: 'calc(clamp(680px, 86vh, 880px) - 64px)',
              width: '100%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
              transform: 'translateY(0)',
            }}
            className="hero-visual"
          >
            <div
              className="avatar-stage"
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HeroAvatarStage mouse={mouse} isVisible={isVisible} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .hero-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 20px !important;
          }
          .hero-visual {
            height: calc(clamp(640px, 82vh, 780px) - 48px) !important;
            transform: translateY(24px) !important;
          }
        }

        @media (max-width: 860px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            align-items: center !important;
          }
          .hero-visual {
            height: clamp(520px, 84vw, 640px) !important;
            order: 2 !important;
            transform: translateY(0px) !important;
          }
        }
      `}</style>
    </section>
  )
}
