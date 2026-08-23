'use client'

import dynamic from 'next/dynamic'
import { useRef, useEffect, useState } from 'react'
import type { Profile } from '@/types'
import Link from 'next/link'

const HeroScene = dynamic(() => import('@/components/3d/HeroScene'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', height: '100%',
      background: 'radial-gradient(circle at center, var(--color-surface) 0%, transparent 70%)',
      borderRadius: '50%',
    }} />
  ),
})

interface HeroProps {
  profile: Profile | null
}

export default function HeroSection({ profile }: HeroProps) {
  const mouse = useRef({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setMounted(true)
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)

    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const name = profile?.display_name ?? 'BABUL KUMAR'
  const [firstName, lastName] = name.split(' ')
  const tagline = profile?.tagline ?? 'Computer Science · AI / ML · Full Stack'
  const bio = profile?.bio ?? 'B.Tech Computer Science & Engineering student at Lovely Professional University, exploring Artificial Intelligence, Machine Learning and Full-Stack Development.'

  return (
    <section style={{
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      padding: '80px var(--container-pad) 60px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'center',
      }}>
        {/* Left: Text */}
        <div>
          {/* Label */}
          <div className="text-label" style={{
            marginBottom: '32px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            {tagline}
          </div>

          {/* Name */}
          <h1 className="text-display" style={{
            marginBottom: '8px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
          }}>
            {firstName}
          </h1>
          <h1 className="text-display" style={{
            color: 'var(--color-accent)',
            marginBottom: '40px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
          }}>
            {lastName}
          </h1>

          {/* Subtext */}
          <p style={{
            fontSize: 'clamp(15px, 1.4vw, 18px)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.65,
            maxWidth: '440px',
            marginBottom: '48px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.35s',
          }}>
            {bio}
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.45s',
          }}>
            <Link href="/projects" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--color-text)',
              color: 'var(--color-bg)',
              padding: '14px 28px',
              borderRadius: '4px',
              fontSize: '13px',
              letterSpacing: '0.04em',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'opacity 0.2s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              View Work
            </Link>
            <Link href="/contact" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              padding: '14px 28px',
              borderRadius: '4px',
              fontSize: '13px',
              letterSpacing: '0.04em',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-text)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'
              }}
            >
              Get in touch
            </Link>
          </div>
        </div>

        {/* Right: 3D Scene */}
        <div style={{
          height: 'clamp(320px, 40vw, 560px)',
          position: 'relative',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1.2s ease 0.3s',
        }}>
          {!reducedMotion ? (
            <HeroScene mouse={mouse} />
          ) : (
            /* Reduced motion fallback: geometric SVG */
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg viewBox="0 0 200 200" style={{ width: '60%', opacity: 0.7 }}>
                <polygon points="100,20 180,60 180,140 100,180 20,140 20,60" fill="none" stroke="var(--color-accent)" strokeWidth="1" />
                <polygon points="100,50 150,75 150,125 100,150 50,125 50,75" fill="none" stroke="var(--color-border)" strokeWidth="1" />
                <circle cx="100" cy="100" r="20" fill="var(--color-accent)" opacity="0.3" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        opacity: mounted ? 0.4 : 0,
        transition: 'opacity 1s ease 1s',
      }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
          Scroll
        </div>
        <div style={{
          width: '1px',
          height: '40px',
          background: 'linear-gradient(to bottom, var(--color-text-muted), transparent)',
          animation: 'scrollLine 2s ease-in-out infinite',
        }} />
      </div>

      <style>{`
        @keyframes scrollLine {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(0.6); }
        }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-3d { display: none !important; }
        }
      `}</style>
    </section>
  )
}
