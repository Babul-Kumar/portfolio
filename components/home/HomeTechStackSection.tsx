'use client'

import React, { useState, useRef, useCallback, useSyncExternalStore } from 'react'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'
import { TechIcon } from './TechIcons'

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

interface TechItem {
  name: string
  category: string
  filterGroup: 'ai' | 'web' | 'systems' | 'cloud'
  description: string
  iconKey: string
  brandColor: string
  badge: string
}

const TECH_STACK_ITEMS: TechItem[] = [
  {
    name: 'Python',
    category: 'Core & AI/ML',
    filterGroup: 'ai',
    description: 'Primary language for ML modeling, agent development, automation, and backend services.',
    iconKey: 'python',
    brandColor: '#3776AB',
    badge: 'Core Language',
  },
  {
    name: 'C++',
    category: 'Systems & DSA',
    filterGroup: 'systems',
    description: 'High-performance computing, competitive programming, and memory-conscious algorithms.',
    iconKey: 'cplusplus',
    brandColor: '#6366F1',
    badge: 'Systems & DSA',
  },
  {
    name: 'JavaScript',
    category: 'Web Core',
    filterGroup: 'web',
    description: 'Modern ES2024+ client-side logic, asynchronous event loops, and interactive UI behavior.',
    iconKey: 'javascript',
    brandColor: '#F7DF1E',
    badge: 'Modern ES2024+',
  },
  {
    name: 'TypeScript',
    category: 'Type Safety',
    filterGroup: 'web',
    description: 'Strict type systems, interface modeling, and full-stack runtime safety across Next.js apps.',
    iconKey: 'typescript',
    brandColor: '#3178C6',
    badge: 'Strict Types',
  },
  {
    name: 'React',
    category: 'Component UI',
    filterGroup: 'web',
    description: 'React 19 hooks, component composition, virtual DOM reconciliation, and fluid state management.',
    iconKey: 'react',
    brandColor: '#61DAFB',
    badge: 'React 19',
  },
  {
    name: 'Next.js',
    category: 'Framework',
    filterGroup: 'web',
    description: 'Next.js 16 App Router, Turbopack, server components, ISR caching, and optimized edge routes.',
    iconKey: 'nextdotjs',
    brandColor: '#E2E8F0',
    badge: 'Next.js 16 App Router',
  },
  {
    name: 'FastAPI',
    category: 'Microservices',
    filterGroup: 'systems',
    description: 'High-throughput async Python backends, Pydantic type validation, and OpenAPI documentation.',
    iconKey: 'fastapi',
    brandColor: '#009688',
    badge: 'Async Microservices',
  },
  {
    name: 'Machine Learning',
    category: 'Data Science',
    filterGroup: 'ai',
    description: 'Scikit-learn, Random Forests, feature engineering, classification models, and ROC-AUC metrics.',
    iconKey: 'scikitlearn',
    brandColor: '#F7931E',
    badge: 'Predictive Modeling',
  },
  {
    name: 'Generative AI',
    category: 'LLMs & Agents',
    filterGroup: 'ai',
    description: 'Autonomous AST-aware agent orchestration, Ollama local inference, Gemini 2.5, and prompt pipelines.',
    iconKey: 'googlegemini',
    brandColor: '#8E75FF',
    badge: 'LLMs & Agents',
  },
  {
    name: 'SQL / PostgreSQL',
    category: 'Databases',
    filterGroup: 'systems',
    description: 'Relational data modeling, PostgreSQL query optimization, transactions, and Row Level Security.',
    iconKey: 'postgresql',
    brandColor: '#4169E1',
    badge: 'Relational SQL',
  },
  {
    name: 'Git / GitHub',
    category: 'Version Control',
    filterGroup: 'cloud',
    description: 'Collaborative branch workflows, pull requests, semantic commit tracking, and GitHub Actions.',
    iconKey: 'git',
    brandColor: '#F05032',
    badge: 'Version Control',
  },
  {
    name: 'Cloud Infrastructure',
    category: 'Infrastructure',
    filterGroup: 'cloud',
    description: 'Supabase storage/database, Vercel deployments, serverless functions, and scalable hosting.',
    iconKey: 'supabase',
    brandColor: '#3ECF8E',
    badge: 'Cloud & Supabase',
  },
]

type FilterKey = 'all' | 'ai' | 'web' | 'systems' | 'cloud'

const FILTER_TABS: { key: FilterKey; label: string; count: number }[] = [
  { key: 'all', label: 'All Technologies', count: 12 },
  { key: 'ai', label: 'AI & Applied ML', count: 3 },
  { key: 'web', label: 'Web & Frontend', count: 4 },
  { key: 'systems', label: 'Systems & Backend', count: 3 },
  { key: 'cloud', label: 'Infra & Cloud', count: 2 },
]

function SkillCard({ item, activeFilter }: { item: TechItem; activeFilter: FilterKey }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ x: 0, y: 0, rotX: 0, rotY: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark' as const)
  const isLight = theme === 'light'

  // On light paper (#FAF9F6), pure white Next.js logo is invisible; render sharp carbon black
  const brandColor = item.iconKey === 'nextdotjs' && isLight ? '#0F172A' : item.brandColor

  const isMatched = activeFilter === 'all' || item.filterGroup === activeFilter

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Smooth tilt angles (clamped to max ±7.5 deg)
    const rotX = -((relY - centerY) / centerY) * 7.5
    const rotY = ((relX - centerX) / centerX) * 7.5

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
      className="interactive-skill-card"
      style={{
        position: 'relative',
        background: isHovered ? 'var(--color-surface-2)' : 'var(--color-surface)',
        border: `1px solid ${isHovered ? brandColor + '4D' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md, 10px)',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '142px',
        transform: isHovered
          ? `perspective(700px) rotateX(${coords.rotX.toFixed(2)}deg) rotateY(${coords.rotY.toFixed(2)}deg) translateZ(6px)`
          : 'perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        transition: isHovered
          ? 'transform 90ms ease-out, border-color 220ms ease, box-shadow 220ms ease'
          : 'transform 360ms cubic-bezier(0.16, 1, 0.3, 1), border-color 220ms ease, box-shadow 220ms ease',
        boxShadow: isHovered
          ? isLight
            ? `0 12px 28px rgba(18, 17, 16, 0.08), 0 0 16px ${brandColor}20`
            : `0 14px 32px rgba(0, 0, 0, 0.45), 0 0 20px ${brandColor}22`
          : isLight
            ? '0 2px 8px rgba(18, 17, 16, 0.04)'
            : '0 2px 8px rgba(0, 0, 0, 0.15)',
        opacity: isMatched ? 1 : 0.28,
        filter: isMatched ? 'none' : 'grayscale(0.65)',
        cursor: 'default',
        overflow: 'hidden',
      }}
    >
      {/* Specular brand-color cursor spotlight sheen */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          background: `radial-gradient(220px circle at ${coords.x}px ${coords.y}px, ${brandColor}26, transparent 75%)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 200ms ease',
          zIndex: 1,
        }}
      />

      {/* Card Content Top: Logo + Category Pill */}
      <div style={{ position: 'relative', zIndex: 3, marginBottom: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <div
            className="skill-logo-box"
            aria-hidden="true"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: isHovered ? `${brandColor}18` : 'var(--color-surface-2)',
              border: `1px solid ${isHovered ? brandColor + '55' : 'var(--color-border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: isHovered ? `0 0 12px ${brandColor}33` : 'none',
              transition: 'all 200ms ease',
            }}
          >
            <TechIcon name={item.iconKey} size={20} color={brandColor} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: isHovered ? brandColor : 'var(--color-border)',
                boxShadow: isHovered ? `0 0 6px ${brandColor}` : 'none',
                transition: 'all 200ms ease',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '0.04em',
                color: isHovered ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontWeight: 500,
                transition: 'color 200ms ease',
              }}
            >
              {item.category}
            </span>
          </div>
        </div>

        {/* Technology Name & Concise Description */}
        <h3
          style={{
            fontSize: '15.5px',
            fontWeight: 600,
            color: 'var(--color-text)',
            margin: '0 0 6px 0',
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{item.name}</span>
        </h3>

        <p
          style={{
            fontSize: '12.5px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {item.description}
        </p>
      </div>

      {/* Card Content Bottom: Micro Badge & Active Status */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          paddingTop: '10px',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '10.5px',
            letterSpacing: '0.02em',
            color: isHovered ? brandColor : 'var(--color-text-muted)',
            fontWeight: 600,
            transition: 'color 200ms ease',
          }}
        >
          {item.badge}
        </span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '10px',
            color: isHovered ? 'var(--color-text)' : 'var(--color-text-muted)',
            fontWeight: 500,
            transition: 'color 200ms ease',
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: isHovered ? '0 0 6px rgba(34, 197, 94, 0.7)' : 'none',
              transition: 'box-shadow 200ms ease',
            }}
          />
          Active
        </span>
      </div>

      {/* Reactive Bottom Glow Beam */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${brandColor}, transparent)`,
          transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'center',
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isHovered ? `0 0 10px ${brandColor}` : 'none',
          zIndex: 4,
        }}
      />
    </div>
  )
}

export default function HomeTechStackSection() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  return (
    <section
      id="skills"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(64px, 8vw, 96px) 0',
        background: 'transparent',
        borderTop: '1px solid var(--color-border-subtle)',
      }}
    >
      <AmbientSectionEnvironment variant="minimal" intensity={0.2} accentMode="cyan" />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11px',
              letterSpacing: '0.12em',
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
            <span>Technical Capabilities · Skills &amp; Toolkit</span>
          </div>

          <h2
            className="text-display"
            style={{
              fontSize: 'clamp(28px, 4.5vw, 42px)',
              margin: '0 0 14px',
              letterSpacing: '-0.025em',
              color: 'var(--color-text)',
            }}
          >
            Core Technologies &amp; Tools.
          </h2>

          <p
            style={{
              fontSize: 'clamp(14.5px, 1.1vw, 16px)',
              color: 'var(--color-text-secondary)',
              maxWidth: '640px',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            The production-tested languages, frameworks, machine learning libraries, and architectural primitives
            I utilize to engineer robust systems.
          </p>
        </div>

        {/* High-Tech Filter Tabs Bar */}
        <div
          role="tablist"
          aria-label="Filter technology categories"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '28px',
            padding: '4px',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm, 6px)',
            width: 'fit-content',
            maxWidth: '100%',
          }}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(tab.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: isActive ? '1px solid var(--color-accent)' : '1px solid transparent',
                  background: isActive ? 'var(--color-accent-bg)' : 'transparent',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 180ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '9.5px',
                    opacity: 0.85,
                    padding: '1px 5px',
                    borderRadius: '10px',
                    background: isActive ? 'var(--color-accent-border)' : 'var(--color-surface-3)',
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* 12-Card Interactive 3D Technology Grid */}
        <div className="skills-grid">
          {TECH_STACK_ITEMS.map((item) => (
            <SkillCard key={item.name} item={item} activeFilter={activeFilter} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 16px;
        }

        @media (min-width: 580px) {
          .skills-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 880px) {
          .skills-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
          }
        }

        @media (min-width: 1200px) {
          .skills-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 18px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          :global(.interactive-skill-card) {
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  )
}

