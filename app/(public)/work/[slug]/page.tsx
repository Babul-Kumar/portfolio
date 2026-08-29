import { getProjectBySlug, getAllProjectSlugs } from '@/lib/data'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, ExternalLink, Code2, CheckCircle2, Cpu, Terminal, ArrowRight } from 'lucide-react'
import { getProjectPublicAssetUrl } from '@/lib/supabase/storage'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'

export const revalidate = 60

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
    title: `${project.title} — Systems Architecture Case Study`,
    description: project.short_desc ?? project.description ?? '',
    openGraph: {
      title: `${project.title} — Babul Kumar`,
      description: project.short_desc ?? '',
      images: project.hero_image_url ? [{ url: project.hero_image_url }] : [],
    },
  }
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  const structuredSections = [
    {
      id: 'overview',
      tag: '// 01_OVERVIEW',
      label: 'System Overview',
      content: project.description,
      icon: Terminal,
    },
    {
      id: 'problem',
      tag: '// 02_PROBLEM_STATEMENT',
      label: 'Problem Statement & Bottlenecks',
      content: project.problem,
      icon: Cpu,
    },
    {
      id: 'solution',
      tag: '// 03_SOLUTION_ARCHITECTURE',
      label: 'Engineered Solution',
      content: project.solution,
      icon: CheckCircle2,
    },
    {
      id: 'architecture',
      tag: '// 04_SYSTEM_DESIGN',
      label: 'Technical Architecture & Pipeline',
      content: project.architecture,
      icon: Code2,
    },
    {
      id: 'challenges',
      tag: '// 05_ENGINEERING_TRADEOFFS',
      label: 'Challenges & Complexities Solved',
      content: project.challenges,
      icon: Terminal,
    },
    {
      id: 'results',
      tag: '// 06_BENCHMARKS',
      label: 'Measurable Results & Benchmarks',
      content: project.results,
      icon: CheckCircle2,
    },
  ].filter((s) => s.content)

  const resolvedHero = getProjectPublicAssetUrl(
    project.hero_image_url || project.thumbnail_url
  )

  const rawFeatureText = `${project.solution || ''}\n${project.architecture || ''}`
  const extractedFeatures: string[] = rawFeatureText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('-') || l.startsWith('*') || l.startsWith('•'))
    .map((l) => l.replace(/^[-*•]\s*/, ''))
    .filter((l) => l.length > 5)
    .slice(0, 6)

  return (
    <article
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(48px, 6vw, 72px) var(--container-pad) 96px',
        minHeight: '85vh',
      }}
    >
      <AmbientSectionEnvironment variant="engineering" intensity={0.4} accentMode="dual" />

      <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Back to Work Navigation Button */}
        <div style={{ marginBottom: '32px' }}>
          <Link
            href="/work"
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.2s ease',
            }}
            className="hover-accent-border"
          >
            <ArrowLeft size={14} />
            <span>BACK TO WORK</span>
          </Link>
        </div>

        {/* Hero Visual Image */}
        {resolvedHero && (
          <div
            style={{
              width: '100%',
              height: 'clamp(260px, 42vw, 480px)',
              overflow: 'hidden',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginBottom: '40px',
              position: 'relative',
              background: '#0B0D13',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <Image
              src={resolvedHero}
              alt={project.title}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
        )}

        {/* Header Metadata Row */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-accent-border)',
              background: 'var(--color-accent-bg)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
            }}
          >
            {project.category || 'SYSTEM'}
          </span>

          {project.project_date && (
            <span
              style={{
                fontSize: '11.5px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
              }}
            >
              · {formatDate(project.project_date, 'MMMM yyyy')}
            </span>
          )}

          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-secondary)',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              textTransform: 'uppercase',
            }}
          >
            STATUS: {project.featured ? 'FLAGSHIP ARCHITECTURE' : 'VERIFIED SYSTEM'}
          </span>
        </div>

        {/* Big Case Study Title */}
        <h1
          style={{
            fontSize: 'clamp(32px, 5.5vw, 56px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: 'var(--color-text)',
            margin: '0 0 20px',
          }}
        >
          {project.title}
        </h1>

        {/* Short Executive Summary */}
        {project.short_desc && (
          <p
            style={{
              fontSize: 'clamp(15px, 1.2vw, 18px)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.65,
              marginBottom: '36px',
            }}
          >
            {project.short_desc}
          </p>
        )}

        {/* Action Matrix Bar: Technologies, GitHub, Live Demo */}
        <div
          className="glass-card"
          style={{
            padding: '24px 28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            marginBottom: '48px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {/* Tech Stack */}
          {project.technologies && project.technologies.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '10.5px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  marginBottom: '10px',
                  fontWeight: 600,
                }}
              >
                SYSTEM TECHNOLOGIES
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {project.technologies.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      padding: '3px 8px',
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* GitHub Action */}
          {project.github_url && (
            <div>
              <div
                style={{
                  fontSize: '10.5px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  marginBottom: '10px',
                  fontWeight: 600,
                }}
              >
                REPOSITORY
              </div>
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '12.5px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                }}
                className="hover-accent-text"
              >
                <Code2 size={15} />
                <span>INSPECT GITHUB CODE</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}

          {/* Live Deployment */}
          {project.live_url && (
            <div>
              <div
                style={{
                  fontSize: '10.5px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  marginBottom: '10px',
                  fontWeight: 600,
                }}
              >
                LIVE DEPLOYMENT
              </div>
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '12.5px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                }}
                className="hover-accent-text"
              >
                <span>VISIT PRODUCTION INSTANCE</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>

        {/* Structured Technical Sections (Overview, Problem, Solution, Architecture, Challenges, Results) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '56px' }}>
          {structuredSections.map((sec) => {
            const Icon = sec.icon
            return (
              <section
                key={sec.id}
                className="glass-card"
                style={{
                  padding: 'clamp(24px, 3.5vw, 32px)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--color-accent)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    fontWeight: 600,
                  }}
                >
                  <Icon size={14} />
                  <span>{sec.tag}</span>
                </div>

                <h2
                  style={{
                    fontSize: '22px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    margin: '0 0 16px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {sec.label}
                </h2>

                <div
                  style={{
                    fontSize: '14.5px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {sec.content}
                </div>
              </section>
            )
          })}
        </div>

        {/* Key Features Grid (if present) */}
        {extractedFeatures.length > 0 && (
          <section
            className="glass-card"
            style={{
              padding: 'clamp(24px, 3.5vw, 32px)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '56px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--color-accent)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '8px',
                fontWeight: 600,
              }}
            >
              {'// FEATURE_MATRIX'}
            </div>

            <h2
              style={{
                fontSize: '22px',
                fontWeight: 600,
                color: 'var(--color-text)',
                margin: '0 0 20px',
                letterSpacing: '-0.01em',
              }}
            >
              Key Capabilities &amp; Features
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
              }}
            >
              {extractedFeatures.map((feature: string, i: number) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <CheckCircle2 size={16} style={{ color: 'var(--color-accent)', marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--color-text)', lineHeight: 1.5 }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Navigation: Back to Work button */}
        <div
          style={{
            paddingTop: '32px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <Link
            href="/work"
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-accent)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
            }}
            className="hover-accent-text"
          >
            <ArrowLeft size={14} />
            <span>RETURN TO WORK ARCHIVE</span>
          </Link>

          <Link
            href="/contact"
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500,
            }}
            className="hover-accent-text"
          >
            <span>DISCUSS THIS SYSTEM WITH BABUL</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  )
}
