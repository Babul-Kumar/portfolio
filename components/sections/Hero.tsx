'use client'

import { useRef, useEffect, useState } from 'react'
import type { Profile } from '@/types'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight, Sparkles, Terminal, Cpu, Database, Network } from 'lucide-react'
import HeroBackground from '@/components/hero/HeroBackground'
import HeroAvatarStage from '@/components/hero/HeroAvatarStage'

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
      <HeroBackground mouse={mouse} />

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

            {/* CTA Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: '32px',
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
            <div>
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

          {/* Right Column: Large Full-Body 3D AI Engineer Avatar Stage */}
          <div
            style={{
              height: 'clamp(620px, 78vh, 800px)',
              width: '100%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
              transform: 'translateY(-24px)',
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
            height: clamp(600px, 80vh, 740px) !important;
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
