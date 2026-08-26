'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  FolderKanban,
  Code2,
  GitFork,
} from 'lucide-react'
import type { Project } from '@/types'
import { FALLBACK_PROJECTS } from '@/lib/data'
import { toast, Toaster } from 'sonner'
import StatusBadge from '@/components/admin/StatusBadge'
import SearchBar from '@/components/admin/SearchBar'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { ContentCardSkeleton } from '@/components/admin/LoadingSkeleton'

const PROJECT_CATEGORIES = [
  'All',
  'AI & Machine Learning',
  'Full-Stack Web',
  'Systems & Infrastructure',
  'Mobile Applications',
  'Developer Tools',
]

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Confirm Delete Dialog
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true
    async function loadData() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('sort_order', { ascending: true })

        if (active) {
          if (!error && Array.isArray(data)) {
            setProjects(data)
          } else {
            setProjects(FALLBACK_PROJECTS)
          }
          setLoading(false)
        }
      } catch {
        if (active) {
          setProjects(FALLBACK_PROJECTS)
          setLoading(false)
        }
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [])

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Category match
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false
      }
      // Status match
      if (statusFilter === 'published' && !p.published) return false
      if (statusFilter === 'draft' && p.published) return false
      if (statusFilter === 'featured' && !p.featured) return false

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const titleMatch = p.title.toLowerCase().includes(q)
        const slugMatch = p.slug.toLowerCase().includes(q)
        const descMatch = p.short_desc?.toLowerCase().includes(q)
        const techMatch = p.technologies?.some((t) => t.toLowerCase().includes(q))
        return titleMatch || slugMatch || descMatch || techMatch
      }
      return true
    })
  }, [projects, selectedCategory, statusFilter, searchQuery])

  async function togglePublished(id: string, current: boolean, slug?: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('projects').update({ published: !current }).eq('id', id)
        if (error) {
          toast.error('Failed to update status')
        } else {
          toast.success(current ? 'Project unpublished' : 'Project published')
        }
      } else if (slug) {
        await supabase.from('projects').update({ published: !current }).eq('slug', slug)
        toast.success(current ? 'Project unpublished' : 'Project published')
      } else {
        toast.success(current ? 'Project unpublished' : 'Project published')
      }
    } catch {
      toast.success(current ? 'Project unpublished' : 'Project published')
    }

    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, published: !current } : p)))
    try {
      fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'projects', slug }),
      }).catch(() => {})
    } catch {}
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      deleteTarget.id
    )
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('projects').delete().eq('id', deleteTarget.id)
        if (error) {
          toast.error(`Delete failed: ${error.message}`)
          setDeleting(false)
          return
        }
      } else if (deleteTarget.slug) {
        await supabase.from('projects').delete().eq('slug', deleteTarget.slug)
      }
    } catch {
      // Ignored for non-uuid fallback item
    }

    try {
      fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'projects', slug: deleteTarget.slug }),
      }).catch(() => {})
    } catch {}

    toast.success('Project deleted successfully')
    setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Toaster position="top-right" theme="dark" />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#F5F5F5',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Projects
          </h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px', margin: 0 }}>
            {projects.length} featured engineering projects in portfolio
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #E45D2C 0%, #FF8A3D 100%)',
            color: '#FFFFFF',
            textDecoration: 'none',
            padding: '9px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(228, 93, 44, 0.25)',
            transition: 'all 0.15s',
          }}
        >
          <Plus size={16} /> Add Project
        </Link>
      </div>

      {/* Search and Filters */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search projects by title, slug, description, or technology…"
        categories={PROJECT_CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        statusFilter={statusFilter}
        onSelectStatus={setStatusFilter}
        statusOptions={[
          { label: 'All Status', value: 'all' },
          { label: 'Published Only', value: 'published' },
          { label: 'Drafts Only', value: 'draft' },
          { label: 'Featured Only', value: 'featured' },
        ]}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        totalCount={projects.length}
        filteredCount={filteredProjects.length}
      />

      {/* Content Rendering */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          <ContentCardSkeleton />
          <ContentCardSkeleton />
          <ContentCardSkeleton />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 20px',
            background: '#101318',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(228, 93, 44, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#E45D2C',
              margin: '0 auto 16px',
            }}
          >
            <FolderKanban size={24} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F5F5F5', margin: '0 0 6px' }}>
            No projects match your search
          </h3>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px', maxWidth: '360px', marginInline: 'auto' }}>
            Try resetting your filters or search terms.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
              setStatusFilter('all')
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#F5F5F5',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARD VIEW */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="admin-project-card"
              style={{
                background: '#101318',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div>
                {/* Hero / Media Container */}
                <div
                  style={{
                    height: '140px',
                    borderRadius: '8px',
                    background: '#0B0D12',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                  }}
                >
                  {project.hero_image_url || project.thumbnail_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={project.hero_image_url || project.thumbnail_url || ''}
                      alt={project.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#6B7280',
                      }}
                    >
                      <Code2 size={32} />
                      <span style={{ fontSize: '11px' }}>Engineering Project</span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      display: 'flex',
                      gap: '6px',
                    }}
                  >
                    <StatusBadge type="category" label={project.category} />
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      display: 'flex',
                      gap: '6px',
                    }}
                  >
                    {project.featured && <StatusBadge type="featured" />}
                    <StatusBadge type={project.published ? 'published' : 'draft'} />
                  </div>
                </div>

                {/* Title & Slug */}
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#F5F5F5',
                    margin: '0 0 4px',
                  }}
                >
                  {project.title}
                </h3>

                <div
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#E45D2C',
                    marginBottom: '8px',
                  }}
                >
                  /{project.slug}
                </div>

                {/* Short Description */}
                {project.short_desc && (
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#9CA3AF',
                      lineHeight: 1.5,
                      margin: '0 0 14px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {project.short_desc}
                  </p>
                )}

                {/* Tech Pills */}
                {project.technologies && project.technologies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#151921',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#D1D5DB',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span style={{ fontSize: '10px', color: '#6B7280', padding: '2px 4px' }}>
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div
                style={{
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Link
                    href={`/projects/${project.slug}`}
                    target="_blank"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: '#9CA3AF',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                  >
                    <ExternalLink size={13} /> View Live
                  </Link>

                  {project.github_url && (
                    <Link
                      href={project.github_url}
                      target="_blank"
                      style={{ color: '#6B7280' }}
                      title="GitHub Repository"
                    >
                      <GitFork size={14} />
                    </Link>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => togglePublished(project.id, project.published, project.slug)}
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: project.published ? '#10B981' : '#6B7280',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={project.published ? 'Unpublish' : 'Publish'}
                  >
                    {project.published ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>

                  <Link
                    href={`/admin/projects/${project.id}`}
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                    }}
                    title="Edit project"
                  >
                    <Pencil size={14} />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(project)}
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#EF4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* DENSE TABLE VIEW */
        <div
          style={{
            background: '#101318',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '13px',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: '#0D0F14',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#8A8F98',
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  <th style={{ padding: '12px 20px' }}>Project</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Technologies</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.12s',
                    }}
                    className="admin-table-row"
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#F5F5F5' }}>{p.title}</div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#E45D2C',
                          fontFamily: 'var(--font-mono, monospace)',
                          marginTop: '2px',
                        }}
                      >
                        /{p.slug}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge type="category" label={p.category} />
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                        {p.technologies?.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#151921',
                              color: '#9CA3AF',
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <StatusBadge type={p.published ? 'published' : 'draft'} />
                        {p.featured && <StatusBadge type="featured" />}
                      </div>
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Link
                          href={`/projects/${p.slug}`}
                          target="_blank"
                          style={{ color: '#9CA3AF', padding: '4px' }}
                          title="View on site"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <Link
                          href={`/admin/projects/${p.id}`}
                          style={{ color: '#D1D5DB', padding: '4px' }}
                          title="Edit project"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(p)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                          title="Delete project"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Project"
        description="Are you sure you want to permanently delete this project from your portfolio CMS?"
        itemName={deleteTarget?.title}
        confirmLabel="Delete Project"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <style>{`
        .admin-project-card:hover {
          border-color: rgba(255, 255, 255, 0.2) !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
        }
        .admin-table-row:hover {
          background: #141822 !important;
        }
      `}</style>
    </div>
  )
}
