'use client'

import dynamic from 'next/dynamic'
import { useRef, useEffect, useState, useSyncExternalStore } from 'react'
import type { Profile } from '@/types'
import Link from 'next/link'

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
      <svg viewBox="0 0 200 200" style={{ width: '60%', opacity: 0.3 }}>
        <polygon
          points="100,25 175,65 175,135 100,175 25,135 25,65"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1"
        />
        <circle cx="100" cy="100" r="12" fill="var(--color-accent)" opacity="0.6" />
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

interface HeroProps {
  profile: Profile | null
}

export default function HeroSection({ profile }: HeroProps) {
  const mouse = useRef({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement>(null)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false)
  const [isVisible, setIsVisible] = useState(true)

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

    return () => {
      window.removeEventListener('mousemove', onMove)
      observer.disconnect()
    }
  }, [])

  const name = profile?.display_name ?? 'BABUL KUMAR'
  const [firstName, lastName] = name.split(' ')
  const tagline = profile?.tagline ?? 'Computer Science · AI / ML · Full Stack'

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '80px',
        paddingBottom: '40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Main Hero Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.9fr',
            gap: '48px',
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          {/* Left Column: Hero Typography & Actions */}
          <div>
            {/* Eyebrow Status Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                marginBottom: '24px',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 0.6s var(--ease-out)',
              }}
            >
              <span className="status-pulse" />
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 500,
                }}
              >
                {tagline}
              </span>
            </div>

            {/* Level 1: Main Display Name */}
            <div
              style={{
                marginBottom: '24px',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.7s var(--ease-out) 0.1s',
              }}
            >
              <h1 className="text-display" style={{ color: 'var(--color-text)' }}>
                {firstName || 'BABUL'}
              </h1>
              <h1
                className="text-display"
                style={{
                  color: 'var(--color-accent)',
                  marginTop: '-4px',
                }}
              >
                {lastName || 'KUMAR'}
              </h1>
            </div>

            {/* Level 2: Main Statement */}
            <h2
              style={{
                fontSize: 'clamp(18px, 1.8vw, 24px)',
                color: 'var(--color-text)',
                lineHeight: 1.45,
                fontWeight: 500,
                letterSpacing: '-0.01em',
                maxWidth: '560px',
                marginBottom: '16px',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(14px)',
                transition: 'all 0.7s var(--ease-out) 0.2s',
              }}
            >
              Building intelligent systems at the intersection of AI research and full-stack engineering.
            </h2>

            {/* Level 3: Supporting Description */}
            <p
              style={{
                fontSize: 'clamp(14px, 1.1vw, 16px)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.7,
                maxWidth: '500px',
                marginBottom: '36px',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(14px)',
                transition: 'all 0.7s var(--ease-out) 0.3s',
              }}
            >
              B.Tech Computer Science & Engineering student at Lovely Professional University.
              Developing AST-aware developer agents, predictive machine learning models, and high-performance applications.
            </p>

            {/* CTA Row */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                flexWrap: 'wrap',
                alignItems: 'center',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(12px)',
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
                <span>VIEW WORK</span>
                <span>↓</span>
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
                  fontWeight: 500,
                }}
                className="hover-accent-text"
              >
                RÉSUMÉ ↗
              </Link>
            </div>
          </div>

          {/* Right Column: 3D Interactive WebGL Object */}
          <div
            style={{
              height: 'clamp(360px, 40vw, 540px)',
              position: 'relative',
              opacity: mounted ? 1 : 0,
              transition: 'opacity 1s var(--ease-out) 0.3s',
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
                <svg viewBox="0 0 200 200" style={{ width: '65%', opacity: 0.8 }}>
                  <polygon
                    points="100,25 175,65 175,135 100,175 25,135 25,65"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="100,50 145,75 145,125 100,150 55,125 55,75"
                    fill="none"
                    stroke="rgba(120,120,120,0.3)"
                    strokeWidth="1"
                  />
                  <circle cx="100" cy="100" r="14" fill="var(--color-accent)" opacity="0.8" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Minimal Scroll Down Indicator Aligned within Global Container */}
        <div
          style={{
            marginTop: 'clamp(32px, 6vw, 64px)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            opacity: mounted ? 0.7 : 0,
            transition: 'opacity 0.8s ease 0.6s',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              fontWeight: 500,
            }}
          >
            SCROLL
          </span>
          <span style={{ fontSize: '12px', color: 'var(--color-accent)' }}>↓</span>
          <div
            style={{
              width: '40px',
              height: '1px',
              background: 'linear-gradient(to right, var(--color-accent), transparent)',
            }}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .hero-3d-wrapper {
            height: 300px !important;
            order: -1;
          }
        }
      `}</style>
    </section>
  )
}
