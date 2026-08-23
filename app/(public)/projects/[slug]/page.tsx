import { getProjectBySlug, getAllProjectSlugs } from '@/lib/data'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, ExternalLink, Code2 } from 'lucide-react'

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return { title: 'Project Not Found' }
  return {
    title: `${project.title} — Technical Case Study`,
    description: project.short_desc ?? project.description ?? '',
    openGraph: {
      title: `${project.title} — Babul Kumar`,
      description: project.short_desc ?? '',
      images: project.hero_image_url ? [{ url: project.hero_image_url }] : [],
    },
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  const sections = [
    { label: 'System Overview', content: project.description },
    { label: 'Problem & Objective', content: project.problem },
    { label: 'Engineered Solution', content: project.solution },
    { label: 'System Architecture', content: project.architecture },
    { label: 'Results & Performance', content: project.results },
    { label: 'Technical Challenges', content: project.challenges },
  ].filter((s) => s.content)

  return (
    <article style={{ padding: '48px var(--container-pad) 96px', minHeight: '85vh' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Back Link */}
        <Link
          href="/projects"
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '40px',
            fontWeight: 500,
            transition: 'color 0.2s',
          }}
          className="hover-accent-text"
        >
          <ArrowLeft size={14} /> Back to Projects
        </Link>

        {/* Hero image if present */}
        {project.hero_image_url && (
          <div
            style={{
              width: '100%',
              height: 'clamp(240px, 40vw, 480px)',
              overflow: 'hidden',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              marginBottom: '48px',
              position: 'relative',
            }}
          >
            <Image
              src={project.hero_image_url}
              alt={project.title}
              fill
              priority
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Header Badges */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '18px',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-accent-border)',
              background: 'var(--color-accent-bg)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
            }}
          >
            {project.category}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-border)' }}>·</span>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
            }}
          >
            {formatDate(project.project_date, 'MMMM yyyy')}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 'clamp(32px, 5.5vw, 68px)',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 1.02,
            color: 'var(--color-text)',
            marginBottom: '24px',
          }}
        >
          {project.title}
        </h1>

        {/* Short summary */}
        {project.short_desc && (
          <p
            style={{
              fontSize: '18px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.65,
              maxWidth: '680px',
              marginBottom: '40px',
            }}
          >
            {project.short_desc}
          </p>
        )}

        {/* Metadata Matrix */}
        <div
          className="glass-card"
          style={{
            padding: '24px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '24px',
            marginBottom: '56px',
          }}
        >
          {project.technologies.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  marginBottom: '10px',
                }}
              >
                Technologies
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {project.technologies.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      padding: '3px 8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.github_url && (
            <div>
              <div
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  marginBottom: '10px',
                }}
              >
                Source Code
              </div>
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Code2 size={14} /> View Repository ↗
              </a>
            </div>
          )}

          {project.live_url && (
            <div>
              <div
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  marginBottom: '10px',
                }}
              >
                Live Deployment
              </div>
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ExternalLink size={14} /> Open Live Demo ↗
              </a>
            </div>
          )}
        </div>

        {/* Content Breakdown Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', marginBottom: '64px' }}>
          {sections.map(({ label, content }) => (
            <div key={label}>
              <h2
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {label}
              </h2>
              <div
                style={{
                  fontSize: '16px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {content}
              </div>
            </div>
          ))}
        </div>

        {/* Screenshots if available */}
        {project.project_images && project.project_images.length > 0 && (
          <div style={{ marginBottom: '64px' }}>
            <h2
              style={{
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: '20px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              System Interface & Architecture Captures
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
              }}
            >
              {project.project_images.map((img) => (
                <div
                  key={img.id}
                  className="glass-card"
                  style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}
                >
                  <Image
                    src={img.url}
                    alt={img.caption ?? project.title}
                    width={600}
                    height={400}
                    style={{ objectFit: 'cover', width: '100%', height: 'auto', display: 'block' }}
                  />
                  {img.caption && (
                    <div
                      style={{
                        padding: '12px 16px',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {img.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '36px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <Link
            href="/projects"
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
            }}
            className="hover-accent-text"
          >
            ← All Projects
          </Link>
          <Link
            href="/contact"
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-accent)',
              textDecoration: 'none',
              fontWeight: 500,
            }}
            className="hover-accent-text"
          >
            Discuss Collaboration →
          </Link>
        </div>
      </div>
    </article>
  )
}
