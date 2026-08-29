'use client'

import Link from 'next/link'
import type { Project } from '@/types'
import { formatDate } from '@/lib/utils'
import {
  ArrowRight,
  ExternalLink,
  Code2,
} from 'lucide-react'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'
import ProjectPreviewMedia from '@/components/projects/ProjectPreviewMedia'

export default function SelectedWorkSection({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) return null

  // Data-driven: the first featured project (or first project) is highlighted as the flagship,
  // remaining published projects flow into the 2-column responsive grid
  const featuredProject = projects.find((p) => p.featured) || projects[0]
  const remainingProjects = projects.filter((p) => p.id !== featuredProject.id)

  return (
    <section id="work" className="section" style={{ position: 'relative' }}>
      <AmbientSectionEnvironment variant="engineering" intensity={0.5} accentMode="dual" />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* =========================================================================
            1. SECTION HEADER (Compact, intentional spacing, balanced action button)
            ========================================================================= */}
        <div className="work-section-header">
          <div>
            <div className="text-label" style={{ marginBottom: '6px' }}>
              06 / HIGH-IMPACT PROJECTS
            </div>
            <h2 className="text-display-sm" style={{ margin: 0, lineHeight: 1.12 }}>
              SELECTED<br />
              <span style={{ color: 'var(--color-accent)' }}>ARCHITECTURES</span> &amp; CODE.
            </h2>
          </div>

          <Link
            href="/work"
            className="work-archive-btn"
            aria-label="View complete archive of all engineering projects"
          >
            <span>VIEW COMPLETE ARCHIVE ({projects.length}+)</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* =========================================================================
            2. FEATURED PROJECT (Flagship Architecture — Compact Full Width)
            ========================================================================= */}
        {featuredProject && (
          <div style={{ marginBottom: '24px' }}>
            <FeaturedProjectCard project={featuredProject} />
          </div>
        )}

        {/* =========================================================================
            3. REGULAR PROJECTS (2-Column Responsive CSS Grid)
            ========================================================================= */}
        <div className="work-projects-grid">
          {remainingProjects.map((project, index) => (
            <RegularProjectCard
              key={project.id}
              project={project}
              index={index + 2}
            />
          ))}
        </div>
      </div>

      {/* Scoped responsive styles */}
      <style jsx>{`
        .work-section-header {
          display: flex;
          justifyContent: space-between;
          align-items: flex-end;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 16px;
        }

        .work-archive-btn {
          font-size: 11px;
          font-family: var(--font-mono);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-accent);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          background: var(--color-accent-bg);
          border: 1px solid var(--color-accent-border);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          font-weight: 600;
        }

        .work-archive-btn:hover {
          background: var(--color-accent);
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(228, 93, 44, 0.3);
          transform: translateY(-1px);
        }

        /* 2-Column Responsive Project Grid */
        .work-projects-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        @media (max-width: 768px) {
          .work-projects-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }
        }

        /* Work Card Surface */
        .work-card {
          background: var(--color-card-bg);
          border: 1px solid var(--color-card-border);
          border-radius: var(--radius-md);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.25s ease,
                      box-shadow 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .work-card:hover {
          transform: translateY(-3px);
          border-color: var(--color-accent-border);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(228, 93, 44, 0.08);
        }

        .work-card:hover :global(.work-preview-media) {
          transform: scale(1.02);
        }

        .work-card:hover :global(.work-project-title-link) {
          color: var(--color-accent);
        }

        /* Featured Card 2-Column Internal Layout (45% Info / 55% Preview) */
        .featured-internal-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: clamp(20px, 2.5vw, 32px);
          align-items: center;
        }

        @media (max-width: 880px) {
          .featured-internal-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}</style>
    </section>
  )
}

/* =========================================================================
   FEATURED PROJECT CARD (Flagship Architecture Component)
   ========================================================================= */
function FeaturedProjectCard({ project }: { project: Project }) {
  const imageUrl =
    project.hero_image_url ||
    project.thumbnail_url ||
    (project.project_images && project.project_images.length > 0
      ? project.project_images[0].url
      : null)

  const dateLabel = project.project_date
    ? formatDate(project.project_date, 'yyyy')
    : '2026'

  return (
    <article
      className="work-card"
      style={{
        padding: 'clamp(20px, 2.5vw, 28px)',
        border: '1px solid var(--color-accent-border)',
        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.35), 0 0 16px rgba(228, 93, 44, 0.06)',
      }}
    >
      {/* Top Banner Ribbon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'var(--color-accent)',
              background: 'var(--color-accent-bg)',
              border: '1px solid var(--color-accent-border)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--color-accent)',
                boxShadow: '0 0 6px var(--color-accent)',
              }}
            />
            FLAGSHIP ARCHITECTURE
          </span>

          <span
            style={{
              fontSize: '10.5px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-secondary)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {project.category || 'AI & Machine Learning'}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
          }}
        >
          <span style={{ color: '#10B981' }}>● ACTIVE SYSTEM</span>
          <span>·</span>
          <span>{dateLabel}</span>
        </div>
      </div>

      {/* Featured Inner Grid (45% Info / 55% Preview) */}
      <div className="featured-internal-grid">
        {/* Left: Project Details */}
        <div>
          <h3
            style={{
              fontSize: 'clamp(20px, 2vw, 26px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
              color: 'var(--color-text)',
              marginBottom: '10px',
            }}
          >
            <Link
              href={`/projects/${project.slug}`}
              className="work-project-title-link"
              style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s ease' }}
            >
              {project.title}
            </Link>
          </h3>

          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.65,
              marginBottom: '16px',
            }}
          >
            {project.short_desc ||
              project.description ||
              'High-performance intelligent system built with modular pipelines and production-grade software engineering.'}
          </p>

          {/* Tech Stack Chips */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '5px',
              marginBottom: '20px',
            }}
          >
            {project.technologies.slice(0, 7).map((tech) => (
              <span
                key={tech}
                style={{
                  fontSize: '10.5px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 8px',
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
            {project.technologies.length > 7 && (
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'var(--color-text-muted)',
                }}
              >
                +{project.technologies.length - 7}
              </span>
            )}
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              href={`/projects/${project.slug}`}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '11px' }}
            >
              <span>EXPLORE ARCHITECTURE</span>
              <ArrowRight size={12} />
            </Link>

            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                aria-label={`View GitHub repository for ${project.title}`}
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
                  transition: 'all 0.2s ease',
                }}
              >
                <Code2 size={12} />
                <span>Source</span>
              </a>
            )}

            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                aria-label={`View live demo for ${project.title}`}
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
                  transition: 'all 0.2s ease',
                }}
              >
                <ExternalLink size={12} />
                <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>

        {/* Right: Visual Preview Area (Compact, max 200px height) */}
        <div>
          <CompactProjectPreview
            imageUrl={imageUrl}
            title={project.title}
            slug={project.slug}
            category={project.category}
            technologies={project.technologies}
            isFeatured={true}
          />
        </div>
      </div>
    </article>
  )
}

/* =========================================================================
   REGULAR PROJECT CARD (Compact, balanced visual hierarchy)
   ========================================================================= */
function RegularProjectCard({ project, index }: { project: Project; index: number }) {
  const imageUrl =
    project.hero_image_url ||
    project.thumbnail_url ||
    (project.project_images && project.project_images.length > 0
      ? project.project_images[0].url
      : null)

  const dateLabel = project.project_date
    ? formatDate(project.project_date, 'yyyy')
    : '2026'

  return (
    <article
      className="work-card"
      style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* 1. Compact Project Preview (approx 35-40% height, max 165px) */}
      <div style={{ marginBottom: '14px' }}>
        <CompactProjectPreview
          imageUrl={imageUrl}
          title={project.title}
          slug={project.slug}
          category={project.category}
          technologies={project.technologies}
          isFeatured={false}
        />
      </div>

      {/* 2. Top Meta: Index, Category, Year */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-accent)',
              fontWeight: 700,
            }}
          >
            {index.toString().padStart(2, '0')}
          </span>
          <span style={{ color: 'var(--color-border)', fontSize: '10px' }}>/</span>
          <span
            style={{
              fontSize: '9.5px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              background: 'var(--color-accent-bg)',
              border: '1px solid var(--color-accent-border)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
            }}
          >
            {project.category || 'Engineering'}
          </span>
        </div>

        <span
          style={{
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
          }}
        >
          {dateLabel}
        </span>
      </div>

      {/* 3. Project Title (Clear, strong weight, approximately 19-21px) */}
      <h3
        style={{
          fontSize: 'clamp(18px, 1.3vw, 21px)',
          fontWeight: 700,
          letterSpacing: '-0.015em',
          lineHeight: 1.3,
          color: 'var(--color-text)',
          marginBottom: '8px',
        }}
      >
        <Link
          href={`/projects/${project.slug}`}
          className="work-project-title-link"
          style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s ease' }}
        >
          {project.title}
        </Link>
      </h3>

      {/* 4. Description (Approximately 13.5-14px, 2-3 lines, comfortable line-height) */}
      <p
        style={{
          fontSize: '13.5px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
          marginBottom: '14px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {project.short_desc ||
          project.description ||
          'Production-tested architecture built with modern frameworks and robust engineering.'}
      </p>

      {/* 5. Tech Stack Pills (Compact ~11px) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          marginBottom: '16px',
        }}
      >
        {project.technologies.slice(0, 5).map((tech) => (
          <span
            key={tech}
            style={{
              fontSize: '10.5px',
              fontFamily: 'var(--font-mono)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontWeight: 500,
            }}
          >
            {tech}
          </span>
        ))}
        {project.technologies.length > 5 && (
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              padding: '2px 5px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: 'var(--color-text-muted)',
            }}
          >
            +{project.technologies.length - 5}
          </span>
        )}
      </div>

      {/* 6. Action Row (Pinned to bottom with margin-top: auto for equal heights) */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Link
          href={`/projects/${project.slug}`}
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: 'var(--color-accent)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'transform 0.2s ease',
          }}
        >
          <span>EXPLORE PROJECT</span>
          <ArrowRight size={12} />
        </Link>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Source code for ${project.title}`}
              style={{
                fontSize: '10.5px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 7px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                transition: 'all 0.2s ease',
              }}
            >
              <Code2 size={11} />
              <span>Code</span>
            </a>
          )}

          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Live demo for ${project.title}`}
              style={{
                fontSize: '10.5px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-accent)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 7px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-accent-border)',
                background: 'var(--color-accent-bg)',
                transition: 'all 0.2s ease',
              }}
            >
              <ExternalLink size={11} />
              <span>Live</span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

/* =========================================================================
   COMPACT PROJECT PREVIEW
   Strictly controlled height (~155-170px), zero giant empty black rectangles!
   Renders genuine uploaded image media or code/architecture telemetry.
   ========================================================================= */
function CompactProjectPreview({
  imageUrl,
  title,
  slug,
  category,
  technologies,
  isFeatured,
}: {
  imageUrl: string | null
  title: string
  slug: string
  category?: string
  technologies: string[]
  isFeatured: boolean
}) {
  return (
    <ProjectPreviewMedia
      imageUrl={imageUrl}
      title={title}
      slug={slug}
      category={category}
      technologies={technologies}
      isFeatured={isFeatured}
    />
  )
}
