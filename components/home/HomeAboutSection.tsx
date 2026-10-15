'use client'

import React, { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { GraduationCap, Target, Compass, Code, ArrowRight } from 'lucide-react'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'

function InteractiveAboutCard({
  children,
  accentColor = '#14B8A6',
}: {
  children: React.ReactNode
  accentColor?: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ x: 0, y: 0, rotX: 0, rotY: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotX = -((relY - centerY) / centerY) * 5.0
    const rotY = ((relX - centerX) / centerX) * 5.0

    setCoords({ x: relX, y: relY, rotX, rotY })
  }, [])

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setCoords({ x: 0, y: 0, rotX: 0, rotY: 0 })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="interactive-about-card"
      style={{
        position: 'relative',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '24px',
        background: isHovered ? 'var(--color-surface-2)' : 'var(--color-surface)',
        border: `1px solid ${isHovered ? accentColor + '44' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md, 10px)',
        transform: isHovered
          ? `perspective(800px) rotateX(${coords.rotX.toFixed(2)}deg) rotateY(${coords.rotY.toFixed(2)}deg) translateZ(6px)`
          : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        transition: isHovered
          ? 'transform 90ms ease-out, border-color 220ms ease, box-shadow 220ms ease'
          : 'transform 360ms cubic-bezier(0.16, 1, 0.3, 1), border-color 220ms ease, box-shadow 220ms ease',
        boxShadow: isHovered
          ? `0 18px 38px rgba(0, 0, 0, 0.45), 0 0 24px ${accentColor}18`
          : '0 2px 8px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
      }}
    >
      {/* Specular Radial Spotlight Sheen */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          background: `radial-gradient(280px circle at ${coords.x}px ${coords.y}px, ${accentColor}1C, transparent 75%)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 200ms ease',
          zIndex: 1,
        }}
      />

      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '24px' }}>
        {children}
      </div>
    </div>
  )
}

export default function HomeAboutSection() {
  return (
    <section
      id="about"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(64px, 8vw, 96px) 0',
        background: 'transparent',
        borderTop: '1px solid var(--color-border-subtle)',
      }}
    >
      <AmbientSectionEnvironment variant="architecture" intensity={0.35} accentMode="dual" />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <div style={{ marginBottom: '48px' }}>
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
            <span>Profile &amp; Vision</span>
          </div>

          <h2
            className="text-display"
            style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              margin: '0 0 16px',
              letterSpacing: '-0.025em',
              fontWeight: 700,
            }}
          >
            Engineering at the Intersection<br />
            of Intelligence &amp; Systems.
          </h2>

          <p
            style={{
              fontSize: 'clamp(14.5px, 1.1vw, 16px)',
              color: 'var(--color-text-secondary)',
              maxWidth: '680px',
              lineHeight: 1.7,
              margin: '0 0 16px',
            }}
          >
            I am a software engineer and AI/ML practitioner focused on building pragmatic, high-density digital systems.
            From low-latency desktop automation engines to cloud-native predictive services, I architect software that solves real-world bottlenecks.
          </p>

          <Link
            href="/about"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--color-accent)',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-accent-bg)',
              border: '1px solid var(--color-accent-border)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              transition: 'all 0.2s ease',
            }}
            className="hover-accent-text"
          >
            <span>Explore Detailed Profile &amp; Academic Journey</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Two-Column Interactive 3D Cyber Composition */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Card 1: Professional Intro & Education */}
          <InteractiveAboutCard accentColor="#14B8A6">
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#14B8A6',
                  }}
                >
                  <GraduationCap size={20} />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '11px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    Academic Foundation
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '10px',
                    color: '#10B981',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: '#10B981',
                      boxShadow: '0 0 6px #10B981',
                    }}
                  />
                  <span>B.Tech CSE (2024–2028)</span>
                </div>
              </div>

              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  marginBottom: '8px',
                  letterSpacing: '-0.02em',
                }}
              >
                B.Tech in Computer Science & Engineering
              </h3>

              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--color-accent)',
                  fontFamily: 'var(--font-mono, monospace)',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Lovely Professional University · 2024 — 2028</span>
              </div>

              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.65,
                  marginBottom: '16px',
                }}
              >
                Rigorous computer science curriculum emphasizing machine learning, algorithms, operating system internals,
                distributed networks, and modern software engineering.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                }}
              >
                {['Data Structures & Algorithms', 'OS Paging & Memory', 'Machine Learning', 'Computer Networks', 'Database Systems'].map(
                  (tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono, monospace)',
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                        padding: '4px 9px',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'all 180ms ease',
                      }}
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Career Direction Pill */}
            <div
              style={{
                paddingTop: '20px',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={16} style={{ color: 'var(--color-accent)' }} />
                <span style={{ fontSize: '12.5px', color: 'var(--color-text)', fontWeight: 500 }}>
                  Target: SDE & Applied AI/ML Roles
                </span>
              </div>

              <Link
                href="/resume"
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: 'var(--color-accent)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                className="hover-accent-text"
              >
                <span>CV / Resume</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </InteractiveAboutCard>

          {/* Card 2: Current Focus & Technical Interests */}
          <InteractiveAboutCard accentColor="var(--color-accent)">
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--color-accent)',
                  }}
                >
                  <Target size={20} />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '11px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    Current Focus
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '10px',
                    color: 'var(--color-accent)',
                    background: 'var(--color-accent-bg)',
                    border: '1px solid var(--color-accent-border)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: 'var(--color-accent)',
                      boxShadow: '0 0 6px var(--color-accent)',
                    }}
                  />
                  <span>Active Engineering</span>
                </div>
              </div>

              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  marginBottom: '8px',
                  letterSpacing: '-0.02em',
                }}
              >
                Agentic Workflows & Resilient Backends
              </h3>

              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.65,
                  marginBottom: '16px',
                }}
              >
                Actively engineering local AST-aware AI desktop orchestrators (<em>BotBro</em>) with 18 Win32 subsystem bindings,
                training gradient-boosted ensemble models for tabular predictions (94.2% ROC-AUC), and developing modern full-stack platforms with Next.js 16.
              </p>

              {/* Technical Interests Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  {
                    title: 'Autonomous AI Agents',
                    desc: 'Local Ollama & transformer inference, AST code telemetry, Model Context Protocol.',
                  },
                  {
                    title: 'Applied Machine Learning',
                    desc: 'Scikit-learn, Random Forests, feature engineering, real-time prediction pipelines.',
                  },
                  {
                    title: 'Full-Stack Systems Architecture',
                    desc: 'Next.js Turbopack, React 19, FastAPI microservices, Supabase SSR & PostgreSQL.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 180ms ease',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '2px' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Link to Work */}
            <div
              style={{
                paddingTop: '20px',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code size={16} style={{ color: 'var(--color-accent)' }} />
                <span style={{ fontSize: '12.5px', color: 'var(--color-text)', fontWeight: 500 }}>
                  Ready to inspect production code?
                </span>
              </div>

              <Link
                href="/work"
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: 'var(--color-accent)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                className="hover-accent-text"
              >
                <span>View Projects</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </InteractiveAboutCard>
        </div>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          :global(.interactive-about-card) {
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  )
}

