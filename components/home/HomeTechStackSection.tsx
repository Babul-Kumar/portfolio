'use client'

import {
  Cpu,
  Binary,
  Layers,
  Terminal,
  Server,
  Workflow,
  Sparkles,
  Database,
  GitBranch,
  Cloud,
  Code2,
  Boxes,
} from 'lucide-react'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'

interface TechItem {
  name: string
  category: string
  description: string
  icon: typeof Cpu
  accent: string
  tag: string
}

const TECH_STACK_ITEMS: TechItem[] = [
  {
    name: 'Python',
    category: 'Core & AI/ML',
    description: 'Primary language for ML modeling, agent development, automation, and backend services.',
    icon: Terminal,
    accent: '#3B82F6',
    tag: 'PRODUCTION',
  },
  {
    name: 'C++',
    category: 'Systems & DSA',
    description: 'High-performance computing, competitive programming, and memory-conscious algorithms.',
    icon: Binary,
    accent: '#6366F1',
    tag: 'SYSTEMS',
  },
  {
    name: 'JavaScript',
    category: 'Web Core',
    description: 'Modern ES2024+ client-side logic, asynchronous event loops, and interactive UI behavior.',
    icon: Code2,
    accent: '#F59E0B',
    tag: 'FRONTEND',
  },
  {
    name: 'TypeScript',
    category: 'Type Safety',
    description: 'Strict type systems, interface modeling, and full-stack runtime safety across Next.js apps.',
    icon: Layers,
    accent: '#38BDF8',
    tag: 'ENTERPRISE',
  },
  {
    name: 'React',
    category: 'Component UI',
    description: 'React 19 hooks, component composition, virtual DOM reconciliation, and fluid state management.',
    icon: Boxes,
    accent: '#06B6D4',
    tag: 'REACT 19',
  },
  {
    name: 'Next.js',
    category: 'Full-Stack Framework',
    description: 'Next.js 16 App Router, Turbopack, server components, ISR caching, and optimized edge routes.',
    icon: Server,
    accent: '#E45D2C',
    tag: 'NEXT 16',
  },
  {
    name: 'FastAPI',
    category: 'API Microservices',
    description: 'High-throughput async Python backends, Pydantic type validation, and OpenAPI documentation.',
    icon: Workflow,
    accent: '#10B981',
    tag: 'REST / ASYNC',
  },
  {
    name: 'Machine Learning',
    category: 'Predictive Models',
    description: 'Scikit-learn, Random Forests, feature engineering, classification models, and ROC-AUC metrics.',
    icon: Cpu,
    accent: '#A855F7',
    tag: 'DATA SCIENCE',
  },
  {
    name: 'Generative AI',
    category: 'LLMs & Agents',
    description: 'Autonomous AST-aware agent orchestration, Ollama local inference, Gemini 2.5, and prompt pipelines.',
    icon: Sparkles,
    accent: '#EC4899',
    tag: 'AGENTIC AI',
  },
  {
    name: 'SQL',
    category: 'Databases',
    description: 'Relational data modeling, PostgreSQL query optimization, transactions, and Row Level Security.',
    icon: Database,
    accent: '#F97316',
    tag: 'POSTGRESQL',
  },
  {
    name: 'Git / GitHub',
    category: 'Version Control',
    description: 'Collaborative branch workflows, pull requests, semantic commit tracking, and GitHub Actions.',
    icon: GitBranch,
    accent: '#E2E8F0',
    tag: 'DEVOPS',
  },
  {
    name: 'Cloud',
    category: 'Infrastructure',
    description: 'Supabase storage/database, Vercel deployments, serverless functions, and scalable hosting.',
    icon: Cloud,
    accent: '#14B8A6',
    tag: 'SERVERLESS',
  },
]

export default function HomeTechStackSection() {
  return (
    <section
      id="tech-stack"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(64px, 8vw, 96px) 0',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <AmbientSectionEnvironment variant="engineering" intensity={0.3} accentMode="cyan" />

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
            <span>{'// TECHNICAL_INVENTORY_02 · TECH STACK'}</span>
          </div>

          <h2
            className="text-display"
            style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              margin: '0 0 16px',
              letterSpacing: '-0.03em',
            }}
          >
            CORE TECHNOLOGIES & TOOLS.
          </h2>

          <p
            style={{
              fontSize: 'clamp(14.5px, 1.1vw, 16px)',
              color: 'var(--color-text-secondary)',
              maxWidth: '640px',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            The production-tested languages, frameworks, AI libraries, and architectural primitives
            I utilize to engineer robust systems.
          </p>
        </div>

        {/* 12-Card Technical Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
          className="tech-stack-grid"
        >
          {TECH_STACK_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.name}
                className="glass-card card-3d-tilt"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  position: 'relative',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div>
                  {/* Top Bar: Icon + Category Badge */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.accent,
                      }}
                    >
                      <Icon size={20} />
                    </div>

                    <span
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '10px',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  {/* Tech Name */}
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      marginBottom: '4px',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {item.name}
                  </h3>

                  <div
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: 'var(--color-accent)',
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {item.category}
                  </div>

                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Subtle telemetry line */}
                <div
                  style={{
                    paddingTop: '12px',
                    borderTop: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '10.5px',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <span>STATUS: VERIFIED</span>
                  <span style={{ color: item.accent }}>● ACTIVE</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
