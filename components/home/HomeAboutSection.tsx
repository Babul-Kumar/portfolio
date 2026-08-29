'use client'

import Link from 'next/link'
import { GraduationCap, Target, Compass, Code, ArrowRight } from 'lucide-react'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'

export default function HomeAboutSection() {
  return (
    <section
      id="about"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(64px, 8vw, 96px) 0',
        background: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
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
            <span>{'// SYSTEM_ORIGIN_01 · PROFILE & VISION'}</span>
          </div>

          <h2
            className="text-display"
            style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              margin: '0 0 16px',
              letterSpacing: '-0.03em',
            }}
          >
            ENGINEERING AT THE INTERSECTION<br />
            OF INTELLIGENCE & SYSTEMS.
          </h2>

          <p
            style={{
              fontSize: 'clamp(14.5px, 1.1vw, 16px)',
              color: 'var(--color-text-secondary)',
              maxWidth: '680px',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            I am a software engineer and AI/ML practitioner focused on building pragmatic, high-density digital systems.
            From low-latency desktop automation engines to cloud-native predictive services, I architect software that solves real-world bottlenecks.
          </p>
        </div>

        {/* Two-Column Cyber Composition */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Card 1: Professional Intro & Education */}
          <div
            className="glass-card"
            style={{
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '24px',
              border: '1px solid var(--color-border)',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '18px',
                  color: 'var(--color-accent)',
                }}
              >
                <GraduationCap size={20} />
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '12px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  ACADEMIC FOUNDATION
                </span>
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
                }}
              >
                Lovely Professional University · 2023 — 2027
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
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
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
          </div>

          {/* Card 2: Current Focus & Technical Interests */}
          <div
            className="glass-card"
            style={{
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '24px',
              border: '1px solid var(--color-border)',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '18px',
                  color: 'var(--color-accent)',
                }}
              >
                <Target size={20} />
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '12px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  CURRENT TECHNICAL FOCUS
                </span>
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
          </div>
        </div>
      </div>
    </section>
  )
}
