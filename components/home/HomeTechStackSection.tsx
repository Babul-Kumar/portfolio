'use client'

import React from 'react'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'
import { TechIcon } from './TechIcons'

interface TechItem {
  name: string
  category: string
  description: string
  iconKey: string
  brandColor: string
}

const TECH_STACK_ITEMS: TechItem[] = [
  {
    name: 'Python',
    category: 'Core & AI/ML',
    description: 'Primary language for ML modeling, agent development, automation, and backend services.',
    iconKey: 'python',
    brandColor: '#3776AB',
  },
  {
    name: 'C++',
    category: 'Systems & DSA',
    description: 'High-performance computing, competitive programming, and memory-conscious algorithms.',
    iconKey: 'cplusplus',
    brandColor: '#6366F1',
  },
  {
    name: 'JavaScript',
    category: 'Web Core',
    description: 'Modern ES2024+ client-side logic, asynchronous event loops, and interactive UI behavior.',
    iconKey: 'javascript',
    brandColor: '#F7DF1E',
  },
  {
    name: 'TypeScript',
    category: 'Type Safety',
    description: 'Strict type systems, interface modeling, and full-stack runtime safety across Next.js apps.',
    iconKey: 'typescript',
    brandColor: '#3178C6',
  },
  {
    name: 'React',
    category: 'Component UI',
    description: 'React 19 hooks, component composition, virtual DOM reconciliation, and fluid state management.',
    iconKey: 'react',
    brandColor: '#61DAFB',
  },
  {
    name: 'Next.js',
    category: 'Framework',
    description: 'Next.js 16 App Router, Turbopack, server components, ISR caching, and optimized edge routes.',
    iconKey: 'nextdotjs',
    brandColor: '#FFFFFF',
  },
  {
    name: 'FastAPI',
    category: 'Microservices',
    description: 'High-throughput async Python backends, Pydantic type validation, and OpenAPI documentation.',
    iconKey: 'fastapi',
    brandColor: '#009688',
  },
  {
    name: 'Machine Learning',
    category: 'Data Science',
    description: 'Scikit-learn, Random Forests, feature engineering, classification models, and ROC-AUC metrics.',
    iconKey: 'scikitlearn',
    brandColor: '#F7931E',
  },
  {
    name: 'Generative AI',
    category: 'LLMs & Agents',
    description: 'Autonomous AST-aware agent orchestration, Ollama local inference, Gemini 2.5, and prompt pipelines.',
    iconKey: 'googlegemini',
    brandColor: '#8E75FF',
  },
  {
    name: 'SQL / PostgreSQL',
    category: 'Databases',
    description: 'Relational data modeling, PostgreSQL query optimization, transactions, and Row Level Security.',
    iconKey: 'postgresql',
    brandColor: '#4169E1',
  },
  {
    name: 'Git / GitHub',
    category: 'Version Control',
    description: 'Collaborative branch workflows, pull requests, semantic commit tracking, and GitHub Actions.',
    iconKey: 'git',
    brandColor: '#F05032',
  },
  {
    name: 'Cloud Infrastructure',
    category: 'Infrastructure',
    description: 'Supabase storage/database, Vercel deployments, serverless functions, and scalable hosting.',
    iconKey: 'supabase',
    brandColor: '#3ECF8E',
  },
]

export default function HomeTechStackSection() {
  return (
    <section
      id="skills"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(64px, 8vw, 96px) 0',
        background: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <AmbientSectionEnvironment variant="minimal" intensity={0.2} accentMode="cyan" />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <div style={{ marginBottom: '40px' }}>
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
            <span>TECHNICAL CAPABILITIES · SKILLS &amp; TOOLKIT</span>
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
            CORE TECHNOLOGIES &amp; TOOLS.
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

        {/* 12-Card Compact Technology Grid */}
        <div className="skills-grid">
          {TECH_STACK_ITEMS.map((item) => (
            <div key={item.name} className="skill-card">
              {/* Top Row: Authentic Logo + Category Tag */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div className="skill-logo-box" aria-hidden="true">
                  <TechIcon name={item.iconKey} size={19} color={item.brandColor} />
                </div>

                <span
                  style={{
                    fontSize: '10.5px',
                    fontFamily: 'var(--font-mono, monospace)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    fontWeight: 500,
                  }}
                >
                  {item.category}
                </span>
              </div>

              {/* Main Content: Technology Name + Concise Description */}
              <div>
                <h3
                  style={{
                    fontSize: '15.5px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    margin: '0 0 5px 0',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.3,
                  }}
                >
                  {item.name}
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
            </div>
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

        .skill-card {
          position: relative;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md, 10px);
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          justifyContent: flex-start;
          transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 180ms ease,
                      background-color 180ms ease,
                      box-shadow 180ms ease;
          min-height: 118px;
        }

        .skill-card:hover {
          transform: translateY(-2.5px);
          border-color: rgba(255, 255, 255, 0.18);
          background: var(--color-surface-2);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .skill-logo-box {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background-color 180ms ease, border-color 180ms ease;
        }

        .skill-card:hover .skill-logo-box {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.16);
        }

        @media (prefers-reduced-motion: reduce) {
          .skill-card {
            transition: none !important;
          }
          .skill-card:hover {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  )
}
