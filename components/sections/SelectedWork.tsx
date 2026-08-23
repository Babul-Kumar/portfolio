import Link from 'next/link'
import Image from 'next/image'
import type { Project } from '@/types'
import { formatDate } from '@/lib/utils'

export default function SelectedWorkSection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null

  return (
    <section className="section" style={{ padding: 'var(--section-gap) var(--container-pad)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Section header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '64px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div className="text-label" style={{ marginBottom: '12px' }}>02 / Selected Work</div>
            <h2 className="text-display-sm" style={{ color: 'var(--color-text)' }}>
              SELECTED<br />WORK
            </h2>
          </div>
          <Link
            href="/projects"
            className="hover-text-accent"
            style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            View all work →
          </Link>
        </div>

        {/* Project list */}
        <div>
          {projects.map((project, index) => (
            <ProjectRow key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectRow({ project, index }: { project: Project; index: number }) {
  return (
    <Link href={`/projects/${project.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr auto',
          gap: '24px',
          alignItems: 'center',
          padding: '28px 0',
          borderBottom: '1px solid var(--color-border)',
          cursor: 'pointer',
          borderRadius: '4px',
        }}
        className="project-row"
      >
        {/* Number */}
        <div style={{
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.06em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {(index + 1).toString().padStart(2, '0')}
        </div>

        {/* Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'center' }}>
          <div>
            <h3 style={{
              fontSize: 'clamp(18px, 2.5vw, 28px)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'var(--color-text)',
              marginBottom: '6px',
              transition: 'color 0.2s',
            }}>
              {project.title}
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              marginBottom: '12px',
              maxWidth: '480px',
            }}>
              {project.short_desc}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {project.technologies.slice(0, 4).map((tech) => (
                <span key={tech} style={{
                  fontSize: '11px',
                  padding: '3px 9px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '3px',
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.04em',
                }}>
                  {tech}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', padding: '3px 0' }}>
                  +{project.technologies.length - 4}
                </span>
              )}
            </div>
          </div>

          {/* Date + category */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '4px' }}>
              {formatDate(project.project_date)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {project.category}
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <div style={{
          width: '80px',
          height: '60px',
          background: 'var(--color-surface)',
          borderRadius: '6px',
          overflow: 'hidden',
          flexShrink: 0,
          border: '1px solid var(--color-border)',
        }}>
          {project.thumbnail_url ? (
            <Image
              src={project.thumbnail_url}
              alt={project.title}
              width={80}
              height={60}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', color: 'var(--color-border)',
            }}>
              ⬡
            </div>
          )}
        </div>
      </article>

      <style>{`
        .project-row {
          transition: background-color 0.2s ease, padding 0.2s ease;
        }
        .project-row:hover {
          background-color: var(--color-surface);
          padding-left: 16px;
          padding-right: 16px;
        }
        @media (max-width: 640px) {
          .project-row { grid-template-columns: 32px 1fr !important; }
        }
      `}</style>
    </Link>
  )
}
