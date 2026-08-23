import type { Metadata } from 'next'
import { getProjects } from '@/lib/data'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'A collection of projects by Babul Kumar — AI/ML systems, web applications, developer tools, and more.',
}

export const revalidate = 3600

const CATEGORIES = ['All', 'AI / ML', 'Machine Learning', 'Full Stack', 'Tools', 'Security', 'Other']

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div style={{ padding: 'var(--section-gap) var(--container-pad)', minHeight: '80vh' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '80px' }}>
          <div className="text-label" style={{ marginBottom: '16px' }}>Work</div>
          <h1 className="text-display" style={{ maxWidth: '600px' }}>
            ALL<br />PROJECTS
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginTop: '24px', maxWidth: '440px', lineHeight: 1.7 }}>
            A curated archive of systems, tools, and experiments across AI, machine learning, and full-stack development.
          </p>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '48px' }}>
          {CATEGORIES.map((cat) => (
            <span key={cat} style={{
              fontSize: '12px', letterSpacing: '0.04em',
              padding: '6px 14px',
              border: '1px solid var(--color-border)',
              borderRadius: '3px',
              color: cat === 'All' ? 'var(--color-bg)' : 'var(--color-text-secondary)',
              background: cat === 'All' ? 'var(--color-text)' : 'transparent',
              cursor: 'default',
            }}>
              {cat}
            </span>
          ))}
        </div>

        {/* Projects */}
        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No projects yet.</p>
            <p style={{ fontSize: '14px' }}>Check back soon.</p>
          </div>
        ) : (
          <div>
            {projects.map((project, i) => (
              <Link key={project.id} href={`/projects/${project.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <article
                  className="project-archive-item"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 100px',
                    gap: '24px',
                    alignItems: 'center',
                    padding: '32px 0',
                    borderBottom: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {(i + 1).toString().padStart(2, '0')}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
                        {project.title}
                      </h2>
                      <span style={{ fontSize: '12px', color: 'var(--color-accent)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {project.category}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                      {project.short_desc}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {project.technologies.slice(0, 5).map((t) => (
                        <span key={t} style={{ fontSize: '11px', padding: '3px 8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '3px', color: 'var(--color-text-secondary)' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {project.thumbnail_url ? (
                      <Image src={project.thumbnail_url} alt={project.title} width={80} height={60}
                        style={{ objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
                    ) : (
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{formatDate(project.project_date)}</div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .project-archive-item {
          transition: background-color 0.2s ease, padding 0.2s ease;
        }
        .project-archive-item:hover {
          background-color: var(--color-surface);
          padding-left: 16px;
          padding-right: 16px;
        }
        @media (max-width: 640px) {
          .project-archive-item { grid-template-columns: 32px 1fr !important; }
        }
      `}</style>
    </div>
  )
}
