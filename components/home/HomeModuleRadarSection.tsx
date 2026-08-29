'use client'

import Link from 'next/link'
import {
  GraduationCap,
  Award,
  Users,
  Code2,
  Send,
  ArrowUpRight,
} from 'lucide-react'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'

const MODULE_LINKS = [
  {
    tag: '// MODULE_02',
    name: 'TRAINING & INTERNSHIPS',
    desc: 'Industrial training programs, specialized bootcamps, and foundations built in AI/ML and systems.',
    href: '/training',
    icon: GraduationCap,
    action: 'Explore Timeline',
  },
  {
    tag: '// MODULE_03',
    name: 'VERIFIED CERTIFICATES',
    desc: 'Interactive credentials gallery with modal verification across Machine Learning, Cloud, and Web.',
    href: '/certificates',
    icon: Award,
    action: 'View Gallery',
  },
  {
    tag: '// MODULE_04',
    name: 'CO-CURRICULAR ACTIVITIES',
    desc: 'Competitive hackathons, tech conclaves, student clubs, leadership roles, and milestones.',
    href: '/co-curricular',
    icon: Users,
    action: 'Inspect Milestones',
  },
  {
    tag: '// MODULE_05',
    name: 'WORK & CASE STUDIES',
    desc: 'Flagship engineering projects, AST-aware agents, telemetry streams, and detailed case study breakdowns.',
    href: '/work',
    icon: Code2,
    action: 'Enter Showcase',
  },
  {
    tag: '// MODULE_06',
    name: 'COMMUNICATION TERMINAL',
    desc: 'Direct dispatch terminal to connect for SDE and Applied AI/ML engineering opportunities.',
    href: '/contact',
    icon: Send,
    action: 'Open Terminal',
  },
]

export default function HomeModuleRadarSection() {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(64px, 8vw, 96px) 0',
        background: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <AmbientSectionEnvironment variant="minimal" intensity={0.25} accentMode="dual" />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11px',
              letterSpacing: '0.14em',
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
            <span>{'// PORTFOLIO_SITEMAP · NAVIGATION RADAR'}</span>
          </div>

          <h2
            className="text-display"
            style={{
              fontSize: 'clamp(26px, 4vw, 40px)',
              margin: '0 0 14px',
              letterSpacing: '-0.02em',
            }}
          >
            EXPLORE THE PORTFOLIO MODULES.
          </h2>

          <p
            style={{
              fontSize: '14.5px',
              color: 'var(--color-text-secondary)',
              maxWidth: '600px',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Navigate deeper into dedicated sections covering verified technical training, certifications, hackathon achievements, and production software.
          </p>
        </div>

        {/* Modules Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {MODULE_LINKS.map((mod) => {
            const Icon = mod.icon
            return (
              <Link
                key={mod.name}
                href={mod.href}
                className="glass-card"
                style={{
                  padding: '28px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '20px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '11px',
                        letterSpacing: '0.1em',
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                      }}
                    >
                      {mod.tag}
                    </span>

                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-accent)',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      marginBottom: '8px',
                      letterSpacing: '-0.01em',
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

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: 'var(--color-accent)',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  <span>{mod.action}</span>
                  <ArrowUpRight size={14} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
