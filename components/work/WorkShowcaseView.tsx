'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Project } from '@/types'
import { formatDate } from '@/lib/utils'
import { Search, ExternalLink, Code2, ArrowRight, Sparkles, Terminal, X } from 'lucide-react'
import ProjectPreviewMedia from '@/components/projects/ProjectPreviewMedia'
import PreviewModal, { type PreviewItem, type PreviewMedia } from '@/components/ui/PreviewModal'
import { getProjectPublicAssetUrl } from '@/lib/supabase/storage'

interface WorkShowcaseViewProps {
  projects: Project[]
}

const WORK_CATEGORIES = [
  'ALL',
  'AI / ML',
  'FULL STACK',
  'GEN AI',
  'COMPUTER VISION',
  'OTHER',
]

export default function WorkShowcaseView({ projects }: WorkShowcaseViewProps) {
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewProject, setPreviewProject] = useState<Project | null>(null)

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Category match
      let matchCat = true
      const catLower = (p.category || '').toLowerCase()
      const titleLower = p.title.toLowerCase()
      const descLower = (p.short_desc || p.description || '').toLowerCase()

      if (activeCategory === 'AI / ML') {
        matchCat =
          catLower.includes('ai') ||
          catLower.includes('ml') ||
          catLower.includes('machine learning') ||
          titleLower.includes('predict') ||
          titleLower.includes('flight delay')
      } else if (activeCategory === 'FULL STACK') {
        matchCat =
          catLower.includes('full stack') ||
          catLower.includes('web') ||
          catLower.includes('next') ||
          descLower.includes('full-stack')
      } else if (activeCategory === 'GEN AI') {
        matchCat =
          catLower.includes('gen ai') ||
          catLower.includes('llm') ||
          catLower.includes('agent') ||
          titleLower.includes('botbro') ||
          descLower.includes('ollama')
      } else if (activeCategory === 'COMPUTER VISION') {
        matchCat =
          catLower.includes('vision') ||
          catLower.includes('cv') ||
          titleLower.includes('steg') ||
          descLower.includes('image') ||
          descLower.includes('forensic')
      } else if (activeCategory === 'OTHER') {
        matchCat =
          !catLower.includes('ai') &&
          !catLower.includes('ml') &&
          !catLower.includes('full stack') &&
          !catLower.includes('agent') &&
          !catLower.includes('vision')
      }

      // Search match
      const q = searchQuery.trim().toLowerCase()
      const matchSearch =
        !q ||
        titleLower.includes(q) ||
        descLower.includes(q) ||
        (p.problem && p.problem.toLowerCase().includes(q)) ||
        (p.technologies && p.technologies.some((t) => t.toLowerCase().includes(q)))

      return matchCat && matchSearch
    })
  }, [projects, activeCategory, searchQuery])

  // Split into Featured flagship and Standard projects
  const { featuredProject, remainingProjects } = useMemo(() => {
    if (activeCategory !== 'ALL' || searchQuery) {
      return { featuredProject: null, remainingProjects: filteredProjects }
    }
    const featured = filteredProjects.find((p) => p.featured) || filteredProjects[0] || null
    const remaining = featured
      ? filteredProjects.filter((p) => p.id !== featured.id)
      : filteredProjects
    return { featuredProject: featured, remainingProjects: remaining }
  }, [filteredProjects, activeCategory, searchQuery])

  // Map active project into unified PreviewItem
  const projectPreviewItem: PreviewItem | null = useMemo(() => {
    if (!previewProject) return null

    const mediaList: PreviewMedia[] = []
    const seenUrls = new Set<string>()

    const heroUrl = getProjectPublicAssetUrl(
      previewProject.hero_image_url || previewProject.thumbnail_url
    )
    if (heroUrl) {
      seenUrls.add(heroUrl)
      mediaList.push({
        url: heroUrl,
        caption: previewProject.title,
      })
    }

    if (previewProject.project_images && previewProject.project_images.length > 0) {
      for (const img of previewProject.project_images) {
        const resolved = getProjectPublicAssetUrl(img.url)
        if (resolved && !seenUrls.has(resolved)) {
          seenUrls.add(resolved)
          mediaList.push({
            url: resolved,
            caption: img.caption || `${previewProject.title} Screenshot`,
          })
        }
      }
    }

    return {
      type: 'project',
      headerTag: `// PROJECT_PREVIEW · ${previewProject.category || 'SYSTEM'}`,
      title: previewProject.title,
      subtitle: previewProject.category,
      category: previewProject.category,
      description: previewProject.short_desc || previewProject.description,
      technologies: previewProject.technologies,
      media: mediaList,
      githubUrl: previewProject.github_url,
      liveUrl: previewProject.live_url,
      detailsUrl: `/work/${previewProject.slug}`,
      detailsLabel: 'DETAILED CASE STUDY',
    }
  }, [previewProject])

  return (
    <div>
      {/* Categories & Search Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '36px',
        }}
      >
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {WORK_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.08em',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: isActive ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  boxShadow: isActive ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Search Input with Clear Action */}
        <div style={{ position: 'relative', minWidth: '240px' }} role="search">
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or stack..."
            aria-label="Search projects by title, stack, or category"
            style={{
              width: '100%',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-sm)',
              padding: searchQuery ? '8px 32px 8px 34px' : '8px 12px 8px 34px',
              color: 'var(--color-text)',
              fontSize: '12.5px',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search input"
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '64px 24px',
            textAlign: 'center',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Terminal size={38} style={{ color: 'var(--color-accent)', margin: '0 auto 14px' }} />
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-accent)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            {'// NO_MATCHES_FOUND'}
          </div>
          <h3 style={{ fontSize: '18px', color: 'var(--color-text)', marginBottom: '8px', fontWeight: 600 }}>
            No Projects Located
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px', maxWidth: '440px', margin: '0 auto 20px' }}>
            Zero system architectures matched &quot;{searchQuery || activeCategory}&quot;. Adjust your search terms or active category filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('ALL')
              setSearchQuery('')
            }}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '8px 18px' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Flagship Featured Project Card (Large Hero Card) */}
          {featuredProject && (
            <article
              className="glass-card"
              style={{
                padding: 'clamp(24px, 4vw, 36px)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-accent-border)',
                background: 'linear-gradient(135deg, var(--color-surface) 0%, rgba(228, 93, 44, 0.04) 100%)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                position: 'relative',
              }}
            >
              {/* Featured Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  color: 'var(--color-accent)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  marginBottom: '20px',
                }}
              >
                <Sparkles size={14} />
                <span>FLAGSHIP ARCHITECTURE</span>
              </div>

              {/* Two-Column Featured Layout */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '32px',
                  alignItems: 'center',
                }}
              >
                {/* Left: Interactive Media Preview */}
                <div>
                  <ProjectPreviewMedia
                    imageUrl={
                      featuredProject.hero_image_url ||
                      featuredProject.thumbnail_url ||
                      (featuredProject.project_images && featuredProject.project_images.length > 0
                        ? featuredProject.project_images[0].url
                        : null)
                    }
                    title={featuredProject.title}
                    slug={featuredProject.slug}
                    category={featuredProject.category}
                    technologies={featuredProject.technologies}
                    isFeatured={true}
                    height="300px"
                    onPreviewClick={() => setPreviewProject(featuredProject)}
                  />
                </div>

                {/* Right: Technical Narrative */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-accent)',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                      }}
                    >
                      <span>{featuredProject.category || 'AI / ML'}</span>
                      {featuredProject.created_at && (
                        <span>· {formatDate(featuredProject.created_at, 'yyyy')}</span>
                      )}
                    </div>

                    <h2
                      style={{
                        fontSize: 'clamp(22px, 3vw, 32px)',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        margin: '0 0 12px',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.15,
                      }}
                    >
                      <Link
                        href={`/work/${featuredProject.slug}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                        className="hover-accent-text"
                      >
                        {featuredProject.title}
                      </Link>
                    </h2>

                    <p
                      style={{
                        fontSize: '14.5px',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.65,
                        margin: '0 0 14px',
                      }}
                    >
                      {featuredProject.short_desc || featuredProject.description}
                    </p>

                    {/* Problem Solved Highlight */}
                    {featuredProject.problem && (
                      <div
                        style={{
                          background: 'var(--color-surface-2)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '10px 14px',
                          marginBottom: '16px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '10.5px',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--color-accent)',
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            marginBottom: '4px',
                          }}
                        >
                          PROBLEM SOLVED
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                          {featuredProject.problem}
                        </div>
                      </div>
                    )}

                    {/* Technologies Pills */}
                    {featuredProject.technologies && featuredProject.technologies.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                        {featuredProject.technologies.map((tech) => (
                          <span
                            key={tech}
                            style={{
                              fontSize: '11px',
                              fontFamily: 'var(--font-mono)',
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--color-surface)',
                              border: '1px solid var(--color-border)',
                              color: 'var(--color-text)',
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      alignItems: 'center',
                      paddingTop: '16px',
                      borderTop: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <Link
                      href={`/work/${featuredProject.slug}`}
                      className="btn-primary"
                      style={{ fontSize: '12px', padding: '9px 18px' }}
                    >
                      <span>DETAILED CASE STUDY</span>
                      <ArrowRight size={13} />
                    </Link>

                    {featuredProject.github_url && (
                      <a
                        href={featuredProject.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ fontSize: '12px', padding: '9px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Code2 size={14} />
                        <span>GITHUB REPO</span>
                      </a>
                    )}

                    {featuredProject.live_url && (
                      <a
                        href={featuredProject.live_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '12px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-accent)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '9px 12px',
                        }}
                      >
                        <span>LIVE SYSTEM</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* Standard Project Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '24px',
            }}
          >
            {remainingProjects.map((project) => (
              <article
                key={project.id}
                className="glass-card work-card-hover"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '18px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                }}
              >
                <div>
                  {/* Image Preview */}
                  <div style={{ marginBottom: '16px' }}>
                    <ProjectPreviewMedia
                      imageUrl={
                        project.hero_image_url ||
                        project.thumbnail_url ||
                        (project.project_images && project.project_images.length > 0
                          ? project.project_images[0].url
                          : null)
                      }
                      title={project.title}
                      slug={project.slug}
                      category={project.category}
                      technologies={project.technologies}
                      height="200px"
                      onPreviewClick={() => setPreviewProject(project)}
                    />
                  </div>

                  {/* Category & Status */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-accent)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}
                    >
                      {project.category || 'SYSTEM'}
                    </span>

                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {project.featured ? 'FEATURED' : 'PRODUCTION'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: '19px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      margin: '0 0 8px',
                      letterSpacing: '-0.01em',
                      lineHeight: 1.3,
                    }}
                  >
                    <Link
                      href={`/work/${project.slug}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                      className="hover-accent-text"
                    >
                      {project.title}
                    </Link>
                  </h3>

                  {/* Short Description */}
                  <p
                    style={{
                      fontSize: '13.5px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                      margin: '0 0 12px',
                    }}
                  >
                    {project.short_desc || project.description}
                  </p>

                  {/* Problem Solved Snippet */}
                  {project.problem && (
                    <div
                      style={{
                        fontSize: '12.5px',
                        color: 'var(--color-text-secondary)',
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '14px',
                        lineHeight: 1.5,
                      }}
                    >
                      <strong style={{ color: 'var(--color-text)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                        SOLVED:
                      </strong>{' '}
                      {project.problem}
                    </div>
                  )}

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          style={{
                            fontSize: '10.5px',
                            fontFamily: 'var(--font-mono)',
                            padding: '2px 7px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-surface-2)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar: GitHub, Live Demo, Detailed View */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                        title="View GitHub Repository"
                      >
                        <Code2 size={13} />
                        <span>GitHub</span>
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
                        title="View Live Demo"
                      >
                        <span>Demo</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <Link
                    href={`/work/${project.slug}`}
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-accent)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600,
                    }}
                    className="hover-accent-text"
                  >
                    <span>DETAILED VIEW</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Unified Project Lightbox / Preview Modal */}
      <PreviewModal
        isOpen={Boolean(previewProject)}
        onClose={() => setPreviewProject(null)}
        item={projectPreviewItem}
      />

      <style>{`
        .work-card-hover {
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.22s ease, box-shadow 0.22s ease !important;
        }
        .work-card-hover:hover {
          border-color: var(--color-accent-border) !important;
          transform: translateY(-3px) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45) !important;
        }
      `}</style>
    </div>
  )
}
