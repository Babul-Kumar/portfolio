'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Project } from '@/types'
import { formatDate } from '@/lib/utils'
import ProjectPreviewMedia from '@/components/projects/ProjectPreviewMedia'

const CATEGORIES = ['All', 'AI / ML', 'Machine Learning', 'Full Stack', 'Tools']

export default function InteractiveProjectList({ projects }: { projects: Project[] }) {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory)

  return (
    <div>
      {/* Interactive Filter Chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
        {CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                padding: '7px 16px',
                border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-sm)',
                color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                background: isActive ? 'var(--color-accent)' : 'var(--color-surface)',
                boxShadow: isActive ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            color: 'var(--color-text-muted)',
          }}
        >
          <p style={{ fontSize: '15px', color: 'var(--color-text)', marginBottom: '12px' }}>
            No projects found under &quot;{activeCategory}&quot;.
          </p>
          <button
            onClick={() => setActiveCategory('All')}
            className="btn-secondary"
          >
            Show all projects
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px',
          }}
          className="projects-showcase-grid"
        >
          {filtered.map((project, i) => {
            const projectImageUrl =
              project.hero_image_url ||
              project.thumbnail_url ||
              (project.project_images && project.project_images.length > 0
                ? project.project_images[0].url
                : null)

            return (
              <article
                key={project.id}
                className="glass-card card-3d-tilt"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '340px',
                }}
              >
                <div>
                  {/* Visual Preview Media */}
                  <div style={{ marginBottom: '18px' }}>
                    <ProjectPreviewMedia
                      imageUrl={projectImageUrl}
                      title={project.title}
                      slug={project.slug}
                      category={project.category}
                      technologies={project.technologies}
                      isFeatured={false}
                    />
                  </div>

                  {/* Header */}
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
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                      }}
                    >
                      {(i + 1).toString().padStart(2, '0')}
                    </span>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: 'var(--color-text-secondary)',
                          background: 'var(--color-surface-2)',
                          border: '1px solid var(--color-border)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
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
                  </div>

                  {/* Title */}
                  <h2
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      color: 'var(--color-text)',
                      marginBottom: '10px',
                      lineHeight: 1.25,
                    }}
                  >
                    <Link
                      href={`/projects/${project.slug}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {project.title}
                    </Link>
                  </h2>

                {/* Description */}
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                    marginBottom: '24px',
                  }}
                >
                  {project.short_desc}
                </p>

                {/* Tech Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                  {project.technologies.slice(0, 5).map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                  {project.technologies.length > 5 && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--font-mono)',
                        padding: '3px 4px',
                      }}
                    >
                      +{project.technologies.length - 5}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '18px',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', gap: '14px' }}>
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
                        gap: '4px',
                      }}
                      className="hover-accent-text"
                    >
                      Code ↗
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
                        gap: '4px',
                      }}
                      className="hover-accent-text"
                    >
                      Demo ↗
                    </a>
                  )}
                </div>

                <Link
                  href={`/projects/${project.slug}`}
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  className="hover-accent-text"
                >
                  <span>Explore</span>
                  <span>→</span>
                </Link>
              </div>
            </article>
          )
        })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .projects-showcase-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
