'use client'

import Link from 'next/link'
import type { Project } from '@/types'
import { formatDate } from '@/lib/utils'
import { ArrowRight, ExternalLink, Code2, Layers } from 'lucide-react'

export default function SelectedWorkSection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null

  return (
    <section id="work" className="section">
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '56px',
            flexWrap: 'wrap',
            gap: '20px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '24px',
          }}
        >
          <div>
            <div className="text-label" style={{ marginBottom: '12px' }}>
              03 / Selected Work
            </div>
            <h2 className="text-display-sm">
              SELECTED<br />WORK
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
              fontWeight: 500,
            }}
          >
            <span>View All Projects</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Alternating Large Editorial Project Showcases */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {projects.map((project, index) => (
            <EditorialProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function EditorialProjectCard({ project, index }: { project: Project; index: number }) {
  const isEven = index % 2 === 1

  return (
    <article
      className="glass-card card-3d-tilt"
      style={{
        padding: 'clamp(28px, 4vw, 44px)',
        display: 'grid',
        gridTemplateColumns: isEven ? '1fr 1.2fr' : '1.2fr 1fr',
        gap: '44px',
        alignItems: 'center',
      }}
    >
      {/* Project Info Block */}
      <div style={{ order: isEven ? 2 : 1 }}>
        {/* Number & Category */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '18px',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-accent)',
              fontWeight: 700,
            }}
          >
            {(index + 1).toString().padStart(2, '0')}
          </span>
          <span style={{ color: 'var(--color-border)' }}>/</span>
          <span
            style={{
              fontSize: '11px',
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
          <span
            style={{
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {formatDate(project.project_date, 'yyyy')}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: 'clamp(24px, 2.8vw, 36px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--color-text)',
            marginBottom: '16px',
            lineHeight: 1.15,
          }}
        >
          <Link
            href={`/projects/${project.slug}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {project.title}
          </Link>
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            marginBottom: '24px',
          }}
        >
          {project.short_desc}
        </p>

        {/* Tech Stack Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
          {project.technologies.map((tech) => (
            <span
              key={tech}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
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
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            href={`/projects/${project.slug}`}
            className="btn-primary"
            style={{ padding: '10px 22px', fontSize: '11px' }}
          >
            <span>Explore Architecture</span>
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
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-accent)'
                e.currentTarget.style.borderColor = 'var(--color-accent-border)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-secondary)'
                e.currentTarget.style.borderColor = 'var(--color-border)'
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
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-accent)'
                e.currentTarget.style.borderColor = 'var(--color-accent-border)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-secondary)'
                e.currentTarget.style.borderColor = 'var(--color-border)'
              }}
            >
              <ExternalLink size={13} />
              <span>Demo</span>
            </a>
          )}
        </div>
      </div>

      {/* Visual Architectural Spec Panel */}
      <div
        style={{
          order: isEven ? 1 : 2,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '32px',
          minHeight: '260px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              marginBottom: '14px',
              fontWeight: 600,
            }}
          >
            <Layers size={13} /> Architecture & Implementation
          </div>

          <div
            style={{
              fontSize: '14px',
              color: 'var(--color-text)',
              lineHeight: 1.7,
              marginBottom: '16px',
            }}
          >
            {project.architecture ||
              project.solution ||
              'Engineered with high performance, modular architecture, and end-to-end type safety.'}
          </div>
        </div>

        {project.problem && (
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
              borderTop: '1px solid var(--color-border-subtle)',
              paddingTop: '14px',
            }}
          >
            Core Target: {project.problem}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 860px) {
          article.glass-card {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          article.glass-card > div {
            order: unset !important;
          }
        }
      `}</style>
    </article>
  )
}
