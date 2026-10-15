'use client'

import React, { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Code2,
  Terminal,
  Cpu,
  Activity,
  ArrowUpRight,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'
import { sound } from '@/lib/audio'

interface FlagshipProject {
  id: string
  title: string
  subtitle: string
  slug: string
  category: string
  badge: string
  accentColor: string
  githubUrl: string
  metrics: { label: string; value: string }[]
  technologies: string[]
  overview: string
  architectureFlow: { step: string; label: string; desc: string }[]
  terminalLines: string[]
}

const FLAGSHIP_PROJECTS: FlagshipProject[] = [
  {
    id: 'botbro',
    title: 'BotBro — Local AI Desktop Orchestration System',
    subtitle: 'Autonomous AST-aware agent engine with low-level Win32 subsystem hooks & Ollama inference.',
    slug: 'botbro-local-ai-desktop-orchestration-system',
    category: 'Autonomous Systems & GenAI',
    badge: 'Core Agent Engine',
    accentColor: '#E45D2C',
    githubUrl: 'https://github.com/babul-kumar/botbro',
    metrics: [
      { label: 'Subsystem Bindings', value: '18 Win32 APIs' },
      { label: 'Inference Engine', value: 'Local Ollama / LLMs' },
      { label: 'Code Safety', value: 'AST Guardrails' },
    ],
    technologies: ['Python', 'AST Telemetry', 'Win32 APIs', 'Ollama', 'FastAPI', 'Next.js'],
    overview:
      'Engineered an autonomous desktop assistant running entirely locally without cloud dependence. Combines an Abstract Syntax Tree (AST) code verification pipeline with 18 low-level Win32 subsystem bindings to safely orchestrate application tasks, file indexing, and system commands.',
    architectureFlow: [
      { step: '01', label: 'Intent Parser', desc: 'Parses multimodal user commands into deterministic tool DAGs.' },
      { step: '02', label: 'AST Guardrail', desc: 'Analyzes Python script AST nodes to prevent unsafe execution.' },
      { step: '03', label: 'Win32 Subsystem', desc: 'Dispatches verified actions to OS window & process handles.' },
    ],
    terminalLines: [
      '[botbro-core] daemon initialized on port 8420',
      '[ast-telemetry] syntax tree validated: 0 unsafe syscalls',
      '[win32-runtime] 18 native hooks connected to explorer.exe',
      '[ollama-bridge] local qwen/mistral inference stream active (18 tok/s)',
      '[agent-status] system ready // listening on background hotkey',
    ],
  },
  {
    id: 'flight-delay',
    title: 'Flight Delay Prediction & Analytics Engine',
    subtitle: 'High-throughput predictive machine learning pipeline with real-time airport weather feature engineering.',
    slug: 'flight-delay-prediction-system',
    category: 'Applied Machine Learning',
    badge: '94.2% ROC-AUC ENSEMBLE',
    accentColor: '#14B8A6',
    githubUrl: 'https://github.com/babul-kumar/flight-delay-prediction',
    metrics: [
      { label: 'Model ROC-AUC', value: '94.2%' },
      { label: 'Feature Pipeline', value: '15+ Live Vectors' },
      { label: 'Evaluation Metric', value: 'Stratified K-Fold' },
    ],
    technologies: ['Python', 'Scikit-learn', 'XGBoost', 'Feature Engineering', 'FastAPI', 'PostgreSQL'],
    overview:
      'Trained and evaluated high-capacity gradient-boosted ensemble models predicting commercial flight delays. Solved severe class imbalance using SMOTE and engineered temporal, weather, and historical route latency vectors.',
    architectureFlow: [
      { step: '01', label: 'Ingestion Engine', desc: 'Ingests DOT flight schedules and NOAA weather feeds.' },
      { step: '02', label: 'Feature Transformer', desc: 'Encodes cyclical departure times and departure congestion.' },
      { step: '03', label: 'Ensemble Inference', desc: 'Gradient-Boosted Trees generate probabilistic delay risk.' },
    ],
    terminalLines: [
      '[ml-pipeline] loading flight dataset: 240,000 recorded sectors',
      '[feature-eng] cyclical sin/cos hour encodings mapped',
      '[model-eval] XGBoost + Random Forest ensemble trained',
      '[metrics-check] ROC-AUC: 0.942 · F1-Score: 0.887 · Latency: 4.2ms',
      '[serving] FastAPI inference endpoint live on /v1/predict',
    ],
  },
  {
    id: 'system-monitor',
    title: 'Smart System Monitor & Paging Profiler',
    subtitle: 'Real-time telemetry profiler visualizing memory allocations, CPU core thermals, and OS page swaps.',
    slug: 'smart-system-monitor',
    category: 'Systems & OS Internals',
    badge: 'SYSTEM RESOURCE TELEMETRY',
    accentColor: '#38BDF8',
    githubUrl: 'https://github.com/babul-kumar/smart-system-monitor',
    metrics: [
      { label: 'CPU Overhead', value: '< 1.2%' },
      { label: 'Sample Frequency', value: '250ms Telemetry' },
      { label: 'Visualization', value: 'Real-Time Canvas' },
    ],
    technologies: ['Python', 'Streamlit', 'Psutil', 'Operating Systems', 'Memory Paging', 'Data Viz'],
    overview:
      'Engineered an interactive operating system telemetry monitor capturing CPU core usage, RAM page fault rates, and active thread states with minimal runtime overhead.',
    architectureFlow: [
      { step: '01', label: 'Kernel Polling', desc: 'Reads OS memory counters and process tables with <1% overhead.' },
      { step: '02', label: 'Paging Analyzer', desc: 'Tracks page faults, swap memory usage, and working sets.' },
      { step: '03', label: 'Canvas Rendering', desc: 'Streams dynamic 60fps metrics to an interactive dashboard.' },
    ],
    terminalLines: [
      '[sys-monitor] attached to host OS kernel interfaces',
      '[memory-tracker] physical memory: 16,384 MB · active pages logged',
      '[swap-profiler] page fault delta: 124 faults/sec (within safe bounds)',
      '[cpu-governor] 8 logical cores monitored · avg load: 14.2%',
      '[telemetry-ui] real-time stream broadcast active',
    ],
  },
]

function ProjectCard({ project }: { project: FlagshipProject }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'terminal'>('overview')
  const [coords, setCoords] = useState({ x: 0, y: 0, rotX: 0, rotY: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotX = -((relY - centerY) / centerY) * 4.5
    const rotY = ((relX - centerX) / centerX) * 4.5

    setCoords({ x: relX, y: relY, rotX, rotY })
  }, [])

  const handleMouseEnter = () => {
    setIsHovered(true)
    sound.playHover(720)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setCoords({ x: 0, y: 0, rotX: 0, rotY: 0 })
  }

  const handleTabChange = (tab: 'overview' | 'architecture' | 'terminal') => {
    setActiveTab(tab)
    sound.playClick(680)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flagship-project-card"
      style={{
        position: 'relative',
        background: isHovered ? 'var(--color-surface-2)' : 'var(--color-surface)',
        border: `1px solid ${isHovered ? project.accentColor + '55' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md, 10px)',
        padding: 'clamp(24px, 3vw, 36px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transform: isHovered
          ? `perspective(900px) rotateX(${coords.rotX.toFixed(2)}deg) rotateY(${coords.rotY.toFixed(2)}deg) translateZ(8px)`
          : 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        transition: isHovered
          ? 'transform 90ms ease-out, border-color 220ms ease, box-shadow 220ms ease'
          : 'transform 360ms cubic-bezier(0.16, 1, 0.3, 1), border-color 220ms ease, box-shadow 220ms ease',
        boxShadow: isHovered
          ? `0 20px 48px rgba(0, 0, 0, 0.5), 0 0 30px ${project.accentColor}1A`
          : '0 4px 16px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
      }}
    >
      {/* Specular Cursor-Following Spotlight */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          background: `radial-gradient(320px circle at ${coords.x}px ${coords.y}px, ${project.accentColor}1A, transparent 75%)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 200ms ease',
          zIndex: 1,
        }}
      />

      {/* Card Content */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        {/* Top Header Row: Category & Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: project.accentColor,
                boxShadow: `0 0 8px ${project.accentColor}`,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: project.accentColor,
                fontWeight: 600,
              }}
            >
              {project.category}
            </span>
          </div>

          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10px',
              letterSpacing: '0.08em',
              color: 'var(--color-text)',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              padding: '3px 8px',
              borderRadius: '4px',
              fontWeight: 600,
            }}
          >
            {project.badge}
          </span>
        </div>

        {/* Project Title & Subtitle */}
        <h3
          style={{
            fontSize: 'clamp(20px, 2.2vw, 26px)',
            fontWeight: 700,
            color: 'var(--color-text)',
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
          }}
        >
          {project.title}
        </h3>

        <p
          style={{
            fontSize: '14.5px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            margin: '0 0 20px',
          }}
        >
          {project.subtitle}
        </p>

        {/* Key Metrics Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
            marginBottom: '20px',
            padding: '12px 14px',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {project.metrics.map((m) => (
            <div key={m.label}>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '9.5px',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '2px',
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                }}
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Mode Tabs (Overview | Architecture | Live Console) */}
        <div
          role="tablist"
          aria-label="Project details view"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px',
            background: 'var(--color-surface-3)',
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => handleTabChange('overview')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              background: activeTab === 'overview' ? project.accentColor : 'transparent',
              color: activeTab === 'overview' ? '#FFFFFF' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            OVERVIEW
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'architecture'}
            onClick={() => handleTabChange('architecture')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              background: activeTab === 'architecture' ? project.accentColor : 'transparent',
              color: activeTab === 'architecture' ? '#FFFFFF' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            ARCHITECTURE
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'terminal'}
            onClick={() => handleTabChange('terminal')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              background: activeTab === 'terminal' ? project.accentColor : 'transparent',
              color: activeTab === 'terminal' ? '#FFFFFF' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            TELEMETRY LOGS
          </button>
        </div>

        {/* Tab Content 1: Overview */}
        {activeTab === 'overview' && (
          <div style={{ marginBottom: '20px', minHeight: '80px' }}>
            <p
              style={{
                fontSize: '13.5px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              {project.overview}
            </p>
          </div>
        )}

        {/* Tab Content 2: Architecture Pipeline */}
        {activeTab === 'architecture' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', minHeight: '80px' }}>
            {project.architectureFlow.map((flow) => (
              <div
                key={flow.step}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '12.5px',
                  background: 'var(--color-surface-2)',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '10px',
                    color: project.accentColor,
                    fontWeight: 700,
                    paddingTop: '2px',
                  }}
                >
                  {flow.step}
                </span>
                <div>
                  <strong style={{ color: 'var(--color-text)', marginRight: '6px' }}>{flow.label}:</strong>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{flow.desc}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content 3: Terminal Logs */}
        {activeTab === 'terminal' && (
          <div
            style={{
              background: '#0B0F19',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              padding: '12px 14px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11px',
              color: '#34D399',
              lineHeight: 1.55,
              marginBottom: '20px',
              minHeight: '80px',
              overflowX: 'auto',
            }}
          >
            {project.terminalLines.map((line, idx) => (
              <div key={idx} style={{ opacity: 0.9 }}>
                {line}
              </div>
            ))}
          </div>
        )}

        {/* Technology Tags */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '24px',
          }}
        >
          {project.technologies.map((tech) => (
            <span
              key={tech}
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--color-text-secondary)',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer: Action Links */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          paddingTop: '16px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <Link
          href={`/work/${project.slug}`}
          onClick={() => sound.playClick(800)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono, monospace)',
            color: project.accentColor,
            fontWeight: 700,
            textDecoration: 'none',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            transition: 'gap 200ms ease',
          }}
          className="hover-accent-text"
        >
          <span>View Case Study</span>
          <ArrowUpRight size={14} />
        </Link>

        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => sound.playClick(600)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11.5px',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              transition: 'color 180ms ease',
            }}
            className="hover-accent-text"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            <span>Source Code</span>
          </a>
        )}
      </div>
    </div>
  )
}

export default function HomeFeaturedProjectsSection() {
  return (
    <section
      id="featured-work"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(64px, 8vw, 96px) 0',
        background: 'transparent',
        borderTop: '1px solid var(--color-border-subtle)',
      }}
    >
      <AmbientSectionEnvironment variant="engineering" intensity={0.3} accentMode="dual" />

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
            <span>Featured Systems &amp; Production Work</span>
          </div>

          <h2
            className="text-display"
            style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              margin: '0 0 14px',
              letterSpacing: '-0.025em',
              fontWeight: 700,
              color: 'var(--color-text)',
            }}
          >
            Featured Engineering Projects.
          </h2>

          <p
            style={{
              fontSize: 'clamp(14.5px, 1.1vw, 16px)',
              color: 'var(--color-text-secondary)',
              maxWidth: '680px',
              lineHeight: 1.65,
              margin: '0 0 16px',
            }}
          >
            Deep dive into production-grade systems engineered with rigorous architectural safety,
            local transformer inference, and high-precision gradient-boosted analytics.
          </p>

          <Link
            href="/work"
            onClick={() => sound.playClick()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12px',
              color: 'var(--color-accent)',
              textDecoration: 'none',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
            className="hover-accent-text"
          >
            <span>View All Engineering Projects &amp; Case Studies</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {/* 3-Card Flagship Stack */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
            gap: '24px',
          }}
        >
          {FLAGSHIP_PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          :global(.flagship-project-card) {
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  )
}
