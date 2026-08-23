import { getProjectBySlug, getAllProjectSlugs } from '@/lib/data'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return { title: 'Project Not Found' }
  return {
    title: project.title,
    description: project.short_desc ?? project.description ?? '',
    openGraph: {
      title: project.title,
      description: project.short_desc ?? '',
      images: project.hero_image_url ? [{ url: project.hero_image_url }] : [],
    },
  }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  const sections = [
    { label: 'Overview', content: project.description },
    { label: 'Problem', content: project.problem },
    { label: 'Solution', content: project.solution },
    { label: 'Architecture', content: project.architecture },
    { label: 'Results', content: project.results },
    { label: 'Challenges', content: project.challenges },
  ].filter((s) => s.content)

  return (
    <article style={{ minHeight: '80vh' }}>
      {/* Hero */}
      {project.hero_image_url && (
        <div style={{ height: 'clamp(200px, 45vw, 560px)', overflow: 'hidden', borderBottom: '1px solid var(--color-border)' }}>
          <Image
            src={project.hero_image_url}
            alt={project.title}
            width={1400}
            height={560}
            priority
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
      )}

      <div style={{ padding: 'var(--section-gap) var(--container-pad)' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          {/* Back */}
          <Link
            href="/projects"
            className="hover-text-accent"
            style={{ fontSize: '13px', color: 'var(--color-text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '48px', letterSpacing: '0.04em' }}
          >
            ← All projects
          </Link>

          {/* Header */}
          <div style={{ marginBottom: '60px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
                {project.category}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>·</span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{formatDate(project.project_date, 'MMMM yyyy')}</span>
            </div>

            <h1 style={{ fontSize: 'clamp(36px, 6vw, 80px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 0.95, color: 'var(--color-text)', marginBottom: '24px' }}>
              {project.title}
            </h1>

            {project.short_desc && (
              <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', lineHeight: 1.65, maxWidth: '580px' }}>
                {project.short_desc}
              </p>
            )}
          </div>

          {/* Meta row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '24px',
            padding: '32px 0',
            borderTop: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '64px',
          }}>
            {project.technologies.length > 0 && (
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>Technologies</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {project.technologies.map((t) => (
                    <span key={t} style={{ fontSize: '12px', padding: '3px 8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '3px', color: 'var(--color-text-secondary)' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {project.github_url && (
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>GitHub</div>
                <a href={project.github_url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--color-accent)', textDecoration: 'none' }}>
                  View source ↗
                </a>
              </div>
            )}

            {project.live_url && (
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>Live Demo</div>
                <a href={project.live_url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--color-accent)', textDecoration: 'none' }}>
                  Open demo ↗
                </a>
              </div>
            )}
          </div>

          {/* Content sections */}
          {sections.map(({ label, content }) => (
            <div key={label} style={{ marginBottom: '56px' }}>
              <h2 style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                {label}
              </h2>
              <div style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                {content}
              </div>
            </div>
          ))}

          {/* Screenshots */}
          {project.project_images && project.project_images.length > 0 && (
            <div style={{ marginBottom: '56px' }}>
              <h2 style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                Screenshots
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {project.project_images.map((img) => (
                  <div key={img.id} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    <Image src={img.url} alt={img.caption ?? project.title} width={600} height={400} style={{ objectFit: 'cover', width: '100%', height: 'auto', display: 'block' }} />
                    {img.caption && (
                      <div style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--color-text-muted)' }}>{img.caption}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer nav */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
            <Link
              href="/projects"
              className="hover-text-accent"
              style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
            >
              ← All projects
            </Link>
            <Link
              href="/contact"
              className="hover-text-accent"
              style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
            >
              Interested? Let&apos;s talk →
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
