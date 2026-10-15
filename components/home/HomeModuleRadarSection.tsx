'use client'

import React, { useState, useRef, useCallback, useSyncExternalStore } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Award,
  Users,
  Code2,
  Send,
  ArrowUpRight,
  Radio,
} from 'lucide-react'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'

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

interface ModuleItem {
  number: string
  category: string
  name: string
  desc: string
  href: string
  icon: typeof GraduationCap
  action: string
  badge: string
}

const MODULE_LINKS: ModuleItem[] = [
  {
    number: '01',
    category: 'Industrial Training',
    name: 'Training & Internships',
    desc: 'Formal industrial training programs, applied machine learning coursework, and systems engineering foundations.',
    href: '/training',
    icon: GraduationCap,
    action: 'Explore Programs',
    badge: 'Verified Programs',
  },
  {
    number: '02',
    category: 'Credentials',
    name: 'Verified Certificates',
    desc: 'Industry-recognized certifications and verified credentials across Machine Learning, Cloud Computing, and Software Engineering.',
    href: '/certificates',
    icon: Award,
    action: 'View Credentials',
    badge: 'Official Credentials',
  },
  {
    number: '03',
    category: 'Hackathons & Events',
    name: 'Co-Curricular Milestones',
    desc: 'Competitive hackathon projects, national tech conclaves, student organization leadership, and workshops.',
    href: '/co-curricular',
    icon: Users,
    action: 'Inspect Milestones',
    badge: 'Events & Clubs',
  },
  {
    number: '04',
    category: 'Featured Software',
    name: 'Work & Projects',
    desc: 'Production-ready software systems, machine learning predictive models, system utilities, and open-source contributions.',
    href: '/work',
    icon: Code2,
    action: 'View Projects',
    badge: 'Production Code',
  },
  {
    number: '05',
    category: 'Opportunities',
    name: 'Get in Touch',
    desc: 'Direct communication channel to discuss full-time Software Engineer roles, AI/ML engineering opportunities, and technical projects.',
    href: '/contact',
    icon: Send,
    action: 'Open Contact Form',
    badge: 'Available for Roles',
  },
]

function InteractiveRadarCard({ mod }: { mod: ModuleItem }) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const [coords, setCoords] = useState({ x: 0, y: 0, rotX: 0, rotY: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark' as const)
  const isLight = theme === 'light'
  const cardAccent = isLight ? '#0D7A70' : '#14B8A6'
  const Icon = mod.icon

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // 3D perspective tilt clamped
    const rotX = -((relY - centerY) / centerY) * 6.5
    const rotY = ((relX - centerX) / centerX) * 6.5

    setCoords({ x: relX, y: relY, rotX, rotY })
  }, [])

  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return
    setIsHovered(true)
  }
  const handleMouseLeave = () => {
    setIsHovered(false)
    setCoords({ x: 0, y: 0, rotX: 0, rotY: 0 })
  }

  return (
    <Link
      ref={cardRef}
      href={mod.href}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="interactive-radar-card"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        padding: 'clamp(18px, 4.5vw, 26px)',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '24px',
        background: isHovered ? 'var(--color-surface-2)' : 'var(--color-surface)',
        border: `1px solid ${isHovered ? (isLight ? 'rgba(13, 122, 112, 0.45)' : 'rgba(20, 184, 166, 0.45)') : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md, 12px)',
        transform: isHovered
          ? `perspective(800px) rotateX(${coords.rotX.toFixed(2)}deg) rotateY(${coords.rotY.toFixed(2)}deg) translateZ(8px)`
          : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        transition: isHovered
          ? 'transform 90ms ease-out, border-color 200ms ease, box-shadow 200ms ease'
          : 'transform 360ms cubic-bezier(0.16, 1, 0.3, 1), border-color 200ms ease, box-shadow 200ms ease',
        boxShadow: isHovered
          ? isLight
            ? '0 16px 36px rgba(18, 17, 16, 0.08), 0 0 16px rgba(13, 122, 112, 0.12)'
            : '0 16px 36px rgba(0, 0, 0, 0.45), 0 0 24px rgba(20, 184, 166, 0.16)'
          : isLight
            ? '0 2px 10px rgba(18, 17, 16, 0.03)'
            : '0 2px 8px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
      }}
    >
      {/* Specular Radial Spotlight */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          background: `radial-gradient(240px circle at ${coords.x}px ${coords.y}px, ${isLight ? 'rgba(13, 122, 112, 0.14)' : 'rgba(20, 184, 166, 0.20)'}, transparent 75%)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 200ms ease',
          zIndex: 1,
        }}
      />

      {/* Sweeping Laser Beam Effect on Hover */}
      <div
        className={`radar-card-sweep${isHovered ? ' sweep-active' : ''}`}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: isLight
            ? 'linear-gradient(180deg, transparent 0%, rgba(13, 122, 112, 0.06) 50%, transparent 100%)'
            : 'linear-gradient(180deg, transparent 0%, rgba(20, 184, 166, 0.08) 50%, transparent 100%)',
          pointerEvents: 'none',
          transform: 'translateY(-100%)',
          zIndex: 1,
        }}
      />

      {/* Card Header: Category Badge & Module Icon */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                letterSpacing: '0.06em',
                fontWeight: 600,
                color: isHovered ? cardAccent : 'var(--color-accent)',
                background: isLight ? 'rgba(212, 72, 28, 0.06)' : 'rgba(228, 93, 44, 0.1)',
                border: `1px solid ${isLight ? 'rgba(212, 72, 28, 0.18)' : 'rgba(228, 93, 44, 0.28)'}`,
                padding: '3px 8px',
                borderRadius: '4px',
                transition: 'all 200ms ease',
              }}
            >
              {mod.category}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                fontWeight: 500,
              }}
            >
              #{mod.number}
            </span>
          </div>

          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: isHovered
                ? isLight
                  ? 'rgba(13, 122, 112, 0.12)'
                  : 'rgba(20, 184, 166, 0.16)'
                : 'var(--color-surface-2)',
              border: `1px solid ${isHovered ? (isLight ? 'rgba(13, 122, 112, 0.35)' : 'rgba(20, 184, 166, 0.4)') : 'var(--color-border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isHovered ? cardAccent : 'var(--color-accent)',
              transition: 'all 200ms ease',
              boxShadow: isHovered ? (isLight ? '0 4px 14px rgba(13, 122, 112, 0.15)' : '0 4px 14px rgba(20, 184, 166, 0.2)') : 'none',
            }}
          >
            <Icon size={20} />
          </div>
        </div>

        <h3
          style={{
            fontSize: '19px',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text)',
            marginBottom: '10px',
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
          }}
        >
          {mod.name}
        </h3>

        <p
          style={{
            fontSize: '13.5px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {mod.desc}
        </p>
      </div>

      {/* Card Footer: Action Button & Status */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          paddingTop: '16px',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12.5px',
            fontWeight: 600,
            color: isHovered ? cardAccent : 'var(--color-accent)',
            letterSpacing: '0.02em',
            transition: 'color 200ms ease',
          }}
        >
          <span>{mod.action}</span>
          <ArrowUpRight
            size={14}
            style={{
              transform: isHovered ? 'translate3d(3px, -3px, 0)' : 'none',
              transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>

        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            letterSpacing: '0.04em',
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: '#10B981',
            }}
          />
          {mod.badge}
        </span>
      </div>
    </Link>
  )
}

export default function HomeModuleRadarSection() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark' as const)
  const isLight = theme === 'light'
  const radarAccent = isLight ? '#0D7A70' : '#14B8A6'

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(64px, 8vw, 96px) 0',
        background: 'transparent',
        borderTop: '1px solid var(--color-border-subtle)',
      }}
    >
      <AmbientSectionEnvironment variant="minimal" intensity={0.25} accentMode="dual" />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Header & Live Radar Telemetry Banner */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                fontWeight: 600,
                marginBottom: '12px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--color-accent)',
                  boxShadow: '0 0 8px var(--color-accent)',
                }}
              />
              <span>Portfolio Directory &amp; Overview</span>
            </div>

            <h2
              className="text-display"
              style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                margin: '0 0 14px',
                letterSpacing: '-0.025em',
                fontWeight: 700,
              }}
            >
              Explore the Core Modules.
            </h2>

            <p
              style={{
                fontSize: '15px',
                color: 'var(--color-text-secondary)',
                maxWidth: '620px',
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Detailed walkthroughs of technical training, verified credentials, hackathon achievements, and production software.
            </p>
          </div>

          {/* Portfolio Directory Highlights Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              padding: '12px clamp(12px, 3.5vw, 20px)',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              background: isLight ? 'var(--color-surface)' : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid var(--color-border)`,
              borderRadius: 'var(--radius-md, 10px)',
              boxShadow: isLight ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isLight ? 'rgba(13, 122, 112, 0.1)' : 'rgba(20, 184, 166, 0.12)',
                  border: `1px solid ${isLight ? 'rgba(13, 122, 112, 0.25)' : 'rgba(20, 184, 166, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: radarAccent,
                }}
              >
                <Radio size={14} />
              </div>

              <div>
                <div
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Interactive Portfolio Index
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Quick access to all verified domains of work and technical milestones
                </div>
              </div>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                5 Specialized Modules
              </span>
              <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                100% Verified Portfolio
              </span>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="radar-modules-grid">
          {MODULE_LINKS.map((mod) => (
            <InteractiveRadarCard key={mod.name} mod={mod} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes cardLaserPass {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(200%);
            opacity: 0;
          }
        }

        .radar-card-sweep.sweep-active {
          animation: cardLaserPass 1.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }

        .radar-modules-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        @media (min-width: 640px) {
          .radar-modules-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
          }
        }

        @media (min-width: 1080px) {
          .radar-modules-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 20px;
          }
        }

        @media (max-width: 767px) {
          :global(.interactive-radar-card) {
            transform: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .radar-card-sweep {
            animation: none !important;
          }
          :global(.interactive-radar-card) {
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  )
}
