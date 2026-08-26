'use client'

import dynamic from 'next/dynamic'
import { useRef, useEffect, useState, useSyncExternalStore } from 'react'
import type { Profile } from '@/types'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight, Sparkles, Terminal, Cpu, Database, Network } from 'lucide-react'
import HeroBackground from '@/components/hero/HeroBackground'

// Dynamic lazy import of the WebGL 3D Scene
const HeroScene = dynamic(() => import('@/components/3d/HeroScene'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg viewBox="0 0 240 240" style={{ width: '70%', opacity: 0.8 }}>
        {/* Network connections */}
        <line x1="40" y1="80" x2="90" y2="50" stroke="var(--color-border-hover)" strokeWidth="1" />
        <line x1="90" y1="50" x2="160" y2="60" stroke="var(--color-border-hover)" strokeWidth="1" />
        <line x1="160" y1="60" x2="200" y2="100" stroke="var(--color-border-hover)" strokeWidth="1" />
        <line x1="40" y1="80" x2="120" y2="120" stroke="var(--color-accent)" strokeWidth="1.5" />
        <line x1="160" y1="60" x2="120" y2="120" stroke="var(--color-accent)" strokeWidth="1.5" />
        <line x1="200" y1="100" x2="120" y2="120" stroke="var(--color-accent)" strokeWidth="1.5" />
        <line x1="120" y1="120" x2="60" y2="170" stroke="var(--color-border-hover)" strokeWidth="1" />
        <line x1="120" y1="120" x2="180" y2="180" stroke="var(--color-accent-teal)" strokeWidth="1.5" />
        <line x1="60" y1="170" x2="180" y2="180" stroke="var(--color-border-hover)" strokeWidth="1" />

        {/* Nodes */}
        <circle cx="40" cy="80" r="4" fill="var(--color-accent)" />
        <circle cx="90" cy="50" r="3.5" fill="var(--color-text-secondary)" />
        <circle cx="160" cy="60" r="3.5" fill="var(--color-accent-teal)" />
        <circle cx="200" cy="100" r="4" fill="var(--color-text-secondary)" />
        <circle cx="60" cy="170" r="3.5" fill="var(--color-text-secondary)" />
        <circle cx="180" cy="180" r="4" fill="var(--color-accent-teal)" />

        {/* Central Core */}
        <polygon points="120,105 135,120 120,135 105,120" fill="var(--color-accent)" />
        <circle cx="120" cy="120" r="12" fill="none" stroke="var(--color-accent)" strokeWidth="1.2" strokeDasharray="3 3" />
      </svg>
    </div>
  ),
})

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false)
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

  const name = profile?.display_name ?? 'BABUL KUMAR'
  const [firstName, lastName] = name.split(' ')

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '84px',
        paddingBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <HeroBackground mouse={mouse} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Main Hero Two-Column Composition */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            gap: 'clamp(32px, 5vw, 64px)',
            alignItems: 'center',
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
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(8px)',
                transition: 'all 0.6s var(--ease-out)',
              }}
            >
              <span className="status-pulse" />
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text)',
                  fontWeight: 600,
                }}
              >
                AVAILABLE FOR SDE & AI / ML ROLES
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent)',
                  background: 'var(--color-accent-bg)',
                  border: '1px solid var(--color-accent-border)',
                  padding: '1px 6px',
                  borderRadius: '3px',
                }}
              >
                2026
              </span>
            </div>

            {/* Display Name */}
            <div
              style={{
                marginBottom: '18px',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                transition: 'all 0.7s var(--ease-out) 0.1s',
              }}
            >
              <h1
                className="text-display"
                style={{
                  color: 'var(--color-text)',
                  fontSize: 'clamp(46px, 7.2vw, 92px)',
                  letterSpacing: '-0.04em',
                }}
              >
                {firstName || 'BABUL'}
              </h1>
              <h1
                className="text-display"
                style={{
                  color: 'var(--color-accent)',
                  fontSize: 'clamp(46px, 7.2vw, 92px)',
                  letterSpacing: '-0.04em',
                  marginTop: '-6px',
                }}
              >
                {lastName || 'KUMAR'}
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
                maxWidth: '560px',
                marginBottom: '14px',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 0.7s var(--ease-out) 0.2s',
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
                maxWidth: '520px',
                marginBottom: '28px',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 0.7s var(--ease-out) 0.3s',
              }}
            >
              Computer Science & Engineering student at <strong>Lovely Professional University</strong>.
              Creator of <em>BotBro</em> (AST-aware developer agents), predictive ML gradient-boosted systems, and resilient cloud software.
            </p>

            {/* CTA Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: '32px',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(8px)',
                transition: 'all 0.7s var(--ease-out) 0.4s',
              }}
            >
              <a
                href="#work"
                onClick={(e) => {
                  const target = document.getElementById('work')
                  if (target) {
                    e.preventDefault()
                    target.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="btn-primary"
              >
                <span>EXPLORE WORK</span>
                <ArrowDown size={14} />
              </a>

              <a
                href="#contact"
                onClick={(e) => {
                  const target = document.getElementById('contact')
                  if (target) {
                    e.preventDefault()
                    target.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="btn-secondary"
              >
                <span>GET IN TOUCH</span>
                <span>→</span>
              </a>

              <Link
                href="/resume"
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  padding: '10px 14px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600,
                }}
                className="hover-accent-text"
              >
                <span>RÉSUMÉ</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>

            {/* Technical Pillars Interactive Strip */}
            <div
              style={{
                opacity: mounted ? 1 : 0,
                transition: 'opacity 0.8s var(--ease-out) 0.2s',
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                CORE FOCUS:
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
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: isActive ? 'var(--color-accent-bg)' : 'var(--color-surface)',
                        border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.25s ease',
                      }}
                    >
                      <Icon size={12} style={{ opacity: isActive ? 1 : 0.6 }} />
                      <span>{pillar.title}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: 3D Living AI WebGL Object */}
          <div
            style={{
              height: 'clamp(440px, 44vw, 620px)',
              width: '100%',
              position: 'relative',
              opacity: mounted ? 1 : 0,
              transition: 'opacity 0.8s var(--ease-out) 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
            className="hero-3d-wrapper"
          >
            {!reducedMotion ? (
              <HeroScene mouse={mouse} isVisible={isVisible} />
            ) : (
              /* Accessible reduced-motion fallback */
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg viewBox="0 0 240 240" style={{ width: '70%', opacity: 0.9 }}>
                  {/* Network connections */}
                  <line x1="40" y1="80" x2="90" y2="50" stroke="var(--color-border-hover)" strokeWidth="1" />
                  <line x1="90" y1="50" x2="160" y2="60" stroke="var(--color-border-hover)" strokeWidth="1" />
                  <line x1="160" y1="60" x2="200" y2="100" stroke="var(--color-border-hover)" strokeWidth="1" />
                  <line x1="40" y1="80" x2="120" y2="120" stroke="var(--color-accent)" strokeWidth="1.5" />
                  <line x1="160" y1="60" x2="120" y2="120" stroke="var(--color-accent)" strokeWidth="1.5" />
                  <line x1="200" y1="100" x2="120" y2="120" stroke="var(--color-accent)" strokeWidth="1.5" />
                  <line x1="120" y1="120" x2="60" y2="170" stroke="var(--color-border-hover)" strokeWidth="1" />
                  <line x1="120" y1="120" x2="180" y2="180" stroke="var(--color-accent-teal)" strokeWidth="1.5" />
                  <line x1="60" y1="170" x2="180" y2="180" stroke="var(--color-border-hover)" strokeWidth="1" />

                  {/* Nodes */}
                  <circle cx="40" cy="80" r="4.5" fill="var(--color-accent)" />
                  <circle cx="90" cy="50" r="4" fill="var(--color-text-secondary)" />
                  <circle cx="160" cy="60" r="4.5" fill="var(--color-accent-teal)" />
                  <circle cx="200" cy="100" r="4.5" fill="var(--color-text-secondary)" />
                  <circle cx="60" cy="170" r="4" fill="var(--color-text-secondary)" />
                  <circle cx="180" cy="180" r="4.5" fill="var(--color-accent-teal)" />

                  {/* Central Core */}
                  <polygon points="120,105 135,120 120,135 105,120" fill="var(--color-accent)" />
                  <circle cx="120" cy="120" r="14" fill="none" stroke="var(--color-accent)" strokeWidth="1.2" strokeDasharray="3 3" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .hero-3d-wrapper {
            height: 380px !important;
            order: -1;
          }
        }
        @media (max-width: 480px) {
          .hero-3d-wrapper {
            height: 320px !important;
          }
        }
      `}</style>
    </section>
  )
}
