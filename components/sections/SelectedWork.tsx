'use client'

import Link from 'next/link'
import type { Project } from '@/types'
import { formatDate } from '@/lib/utils'
import { ArrowRight, ExternalLink, Code2, Activity, Binary, BrainCircuit, Layers, MessageSquare } from 'lucide-react'

export default function SelectedWorkSection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null

  const [featuredProject, ...remainingProjects] = projects

  return (
    <section id="work" className="section">
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '16px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '20px',
          }}
        >
          <div>
            <div className="text-label" style={{ marginBottom: '8px' }}>
              06 / Selected Engineering Projects
            </div>
            <h2 className="text-display-sm">
              SELECTED<br />
              <span style={{ color: 'var(--color-accent)' }}>ARCHITECTURES</span> & CODE.
            </h2>
          </div>

          <Link
            href="/projects"
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-accent-bg)',
              border: '1px solid var(--color-accent-border)',
              transition: 'all 0.2s ease',
              fontWeight: 600,
            }}
          >
            <span>View Complete Archive ({projects.length}+)</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* 1. Flagship Featured Project Card (Full-Width High-Impact) */}
        {featuredProject && (
          <div style={{ marginBottom: '32px' }}>
            <FlagshipProjectCard project={featuredProject} />
          </div>
        )}

        {/* 2. Varied Bespoke Project Showcases */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {remainingProjects.map((project, index) => (
            <BespokeProjectCard key={project.id} project={project} index={index + 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* =========================================================================
   1. Flagship Featured Hero Project Card (High-Density Terminal & AST)
   ========================================================================= */
function FlagshipProjectCard({ project }: { project: Project }) {
  return (
    <article
      className="glass-card card-3d-tilt"
      style={{
        padding: 'clamp(24px, 4vw, 40px)',
        border: '1px solid var(--color-accent-border)',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Featured Banner Ribbon */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#FFFFFF',
          background: 'var(--color-accent)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <span>FLAGSHIP SYSTEM</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.15fr 1.2fr',
          gap: 'clamp(28px, 4vw, 44px)',
          alignItems: 'center',
        }}
        className="flagship-grid"
      >
        {/* Project Meta & Narrative */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                background: 'var(--color-accent-bg)',
                border: '1px solid var(--color-accent-border)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
              }}
            >
              {project.category}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {formatDate(project.project_date, 'yyyy')} · Production
            </span>
          </div>

          <h3
            style={{
              fontSize: 'clamp(26px, 3.2vw, 40px)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--color-text)',
              marginBottom: '14px',
              lineHeight: 1.15,
            }}
          >
            <Link href={`/projects/${project.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {project.title}
            </Link>
          </h3>

          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: '20px' }}>
            {project.short_desc}
          </p>

          {/* Problem & Architecture Highlights */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '24px',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontWeight: 600, textTransform: 'uppercase' }}>
                Architecture
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text)', marginTop: '2px', fontWeight: 500 }}>
                AST Mutation & Tooling
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent-teal)', fontWeight: 600, textTransform: 'uppercase' }}>
                Protocol
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text)', marginTop: '2px', fontWeight: 500 }}>
                Model Context Protocol (MCP)
              </div>
            </div>
          </div>

          {/* Tech Stack Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '28px' }}>
            {project.technologies.map((tech) => (
              <span
                key={tech}
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontWeight: 500,
                }}
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href={`/projects/${project.slug}`} className="btn-primary" style={{ padding: '10px 20px', fontSize: '11px' }}>
              <span>Case Study & Architecture</span>
              <ArrowRight size={13} />
            </Link>

            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                }}
              >
                <Code2 size={13} />
                <span>Source</span>
              </a>
            )}

            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                }}
              >
                <ExternalLink size={13} />
                <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>

        {/* Right: Live Interactive AST Code Terminal Visualizer */}
        <div
          style={{
            background: '#0B0D13',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
            overflow: 'hidden',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {/* Terminal Title Bar */}
          <div
            style={{
              background: '#121620',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#EF4444' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#F59E0B' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '6px' }}>botbro://agent-runtime.ts</span>
            </div>
            <span style={{ fontSize: '9px', color: '#E45D2C', background: 'rgba(228, 93, 44, 0.15)', padding: '2px 6px', borderRadius: '3px' }}>
              MCP_SESSION_ACTIVE
            </span>
          </div>

          {/* Terminal Code Content */}
          <div style={{ padding: '16px', fontSize: '12px', lineHeight: 1.6, color: '#E5E7EB' }}>
            <div style={{ color: '#6B7280' }}>{'// BotBro AST-Aware Refactoring Agent'}</div>
            <div>
              <span style={{ color: '#93C5FD' }}>const</span> <span style={{ color: '#FCD34D' }}>agent</span> = <span style={{ color: '#93C5FD' }}>new</span> <span style={{ color: '#6EE7B7' }}>AgentRuntime</span>({`{`}
            </div>
            <div style={{ paddingLeft: '16px' }}>
              model: <span style={{ color: '#FCA5A5' }}>&apos;claude-3-7-sonnet&apos;</span>,
            </div>
            <div style={{ paddingLeft: '16px' }}>
              astEngine: <span style={{ color: '#FCA5A5' }}>&apos;@babel/parser&apos;</span>,
            </div>
            <div style={{ paddingLeft: '16px' }}>
              tools: [<span style={{ color: '#FCA5A5' }}>&apos;replace_file_content&apos;</span>, <span style={{ color: '#FCA5A5' }}>&apos;grep_search&apos;</span>],
            </div>
            <div>{`})`}</div>
            <div style={{ marginTop: '10px', color: '#6EE7B7' }}>
              ✓ AST Graph resolved: 418 symbol references
            </div>
            <div style={{ color: '#E45D2C' }}>
              ⚡ Running AST lint verification: 0 errors found.
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

/* =========================================================================
   2. Bespoke Project Card with Custom Visualizers
   ========================================================================= */
function BespokeProjectCard({ project, index }: { project: Project; index: number }) {
  const isEven = index % 2 === 1

  return (
    <article
      className="glass-card card-3d-tilt"
      style={{
        padding: 'clamp(20px, 3.5vw, 36px)',
        display: 'grid',
        gridTemplateColumns: isEven ? '1fr 1.1fr' : '1.1fr 1fr',
        gap: 'clamp(24px, 3.5vw, 40px)',
        alignItems: 'center',
      }}
    >
      {/* Project Meta Details */}
      <div style={{ order: isEven ? 2 : 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontWeight: 700 }}>
            {index.toString().padStart(2, '0')}
          </span>
          <span style={{ color: 'var(--color-border)' }}>/</span>
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              background: 'var(--color-accent-bg)',
              border: '1px solid var(--color-accent-border)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
            }}
          >
            {project.category}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            {formatDate(project.project_date, 'yyyy')}
          </span>
        </div>

        <h3
          style={{
            fontSize: 'clamp(22px, 2.5vw, 30px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--color-text)',
            marginBottom: '10px',
            lineHeight: 1.2,
          }}
        >
          <Link href={`/projects/${project.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {project.title}
          </Link>
        </h3>

        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: '18px' }}>
          {project.short_desc}
        </p>

        {/* Tech Stack Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '22px' }}>
          {project.technologies.map((tech) => (
            <span
              key={tech}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href={`/projects/${project.slug}`} className="btn-primary" style={{ padding: '9px 18px', fontSize: '11px' }}>
            <span>Explore Architecture</span>
            <ArrowRight size={13} />
          </Link>

          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
              }}
            >
              <Code2 size={13} />
              <span>Source</span>
            </a>
          )}

          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
              }}
            >
              <ExternalLink size={13} />
              <span>Demo</span>
            </a>
          )}
        </div>
      </div>

      {/* Bespoke Visual Architectural Spec Panel */}
      <div style={{ order: isEven ? 1 : 2 }}>
        <ProjectVisualizer slug={project.slug} category={project.category} />
      </div>
    </article>
  )
}

/* =========================================================================
   3. Domain-Specific Custom Project Visualizers
   ========================================================================= */
function ProjectVisualizer({
  slug,
  category,
}: {
  slug: string
  category: string
}) {
  const isMl = slug.includes('flight') || category.toLowerCase().includes('machine learning')
  const isMonitor = slug.includes('monitor') || slug.includes('system')
  const isStego = slug.includes('steganography') || slug.includes('detector')
  const isReview = slug.includes('review') || slug.includes('analyzer')

  // 1. Machine Learning & Tabular Decision Matrix
  if (isMl) {
    return (
      <div
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <BrainCircuit size={13} /> GRADIENT_BOOST_MATRIX
          </span>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.1)', padding: '1px 6px', borderRadius: '3px' }}>
            ROC-AUC: 0.892
          </span>
        </div>

        {/* Feature Importance Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text)', marginBottom: '2px' }}>
              <span>Departure_Delay</span>
              <span>0.384</span>
            </div>
            <div style={{ height: '5px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '85%', height: '100%', background: 'var(--color-accent)' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text)', marginBottom: '2px' }}>
              <span>Air_System_Delay</span>
              <span>0.241</span>
            </div>
            <div style={{ height: '5px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', background: 'var(--color-accent-teal)' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text)', marginBottom: '2px' }}>
              <span>Weather_Impact_Index</span>
              <span>0.195</span>
            </div>
            <div style={{ height: '5px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '45%', height: '100%', background: 'var(--color-accent)' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. Real-Time Sparkline System Telemetry
  if (isMonitor) {
    return (
      <div
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent-teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Activity size={13} /> REALTIME_RESOURCE_TELEMETRY
          </span>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="status-pulse" /> ONLINE
          </span>
        </div>

        {/* Telemetry Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div style={{ background: 'var(--color-surface)', padding: '10px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>CPU USAGE</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>24.2%</div>
          </div>
          <div style={{ background: 'var(--color-surface)', padding: '10px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>ANOMALY INDEX</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>0.02 [NOMINAL]</div>
          </div>
        </div>

        {/* Sparkline Graphic */}
        <svg viewBox="0 0 200 40" style={{ width: '100%', height: '36px', overflow: 'visible' }}>
          <polyline
            fill="none"
            stroke="var(--color-accent-teal)"
            strokeWidth="2"
            points="0,30 20,28 40,25 60,32 80,18 100,22 120,12 140,20 160,15 180,10 200,16"
          />
        </svg>
      </div>
    )
  }

  // 3. Computer Vision / Frequency Domain Matrix
  if (isStego) {
    return (
      <div
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Binary size={13} /> FREQUENCY_DOMAIN_FORENSICS
          </span>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', background: 'var(--color-accent-bg)', padding: '1px 6px', borderRadius: '3px' }}>
            ENTROPY: 7.94
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '12px' }}>
          {['Bit 0 (LSB)', 'Bit 1', 'Bit 2', 'Fourier DCT'].map((plane, i) => (
            <div
              key={plane}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                padding: '8px 4px',
                textAlign: 'center',
                borderRadius: '4px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: i === 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              }}
            >
              {plane}
            </div>
          ))}
        </div>

        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
          Statistical Chi-Square p-value: &lt; 0.001 (Steganographic Payload Verified)
        </div>
      </div>
    )
  }

  // 4. NLP / Transformers Token Attention Heatmap
  if (isReview) {
    return (
      <div
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MessageSquare size={13} /> NLP_TOKEN_ATTENTION_WEIGHTS
          </span>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.1)', padding: '1px 6px', borderRadius: '3px' }}>
            CONFIDENCE: 96.2%
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ background: 'var(--color-accent-bg)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', padding: '3px 8px', borderRadius: '4px' }}>
            battery_life: 0.94
          </span>
          <span style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '3px 8px', borderRadius: '4px' }}>
            display: 0.81
          </span>
          <span style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', padding: '3px 8px', borderRadius: '4px' }}>
            performance: 0.76
          </span>
          <span style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', padding: '3px 8px', borderRadius: '4px' }}>
            latency: 0.12
          </span>
        </div>

        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
          Bi-directional self-attention tensor mapped across 512 input tokens.
        </div>
      </div>
    )
  }

  // 5. Default System Architecture Spec Panel
  return (
    <div
      style={{
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        padding: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Layers size={13} /> SYSTEM_ARCHITECTURE_FLOW
        </span>
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent-teal)' }}>
          READY
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
        <div style={{ background: 'var(--color-surface)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-accent)' }}>INPUT:</span> REST API / WebSocket Stream
        </div>
        <div style={{ background: 'var(--color-surface)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-accent-teal)' }}>PROCESSING:</span> Transformer Tokenization & PyTorch Model
        </div>
        <div style={{ background: 'var(--color-surface)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-success)' }}>OUTPUT:</span> Structured Sentiment Tensor & Anomaly Insights
        </div>
      </div>
    </div>
  )
}
