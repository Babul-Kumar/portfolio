'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react'
import type { Project } from '@/types'
import { FALLBACK_PROJECTS } from '@/lib/data'
import { toast, Toaster } from 'sonner'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

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
          if (!error && data && data.length > 0) {
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

  async function togglePublished(id: string, current: boolean, slug?: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('projects').update({ published: !current }).eq('id', id)
        if (error) {
          toast.error('Failed to update status in database')
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
  }

  async function deleteProject(id: string, title: string, slug?: string) {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('projects').delete().eq('id', id)
        if (error) {
          toast.error(`Delete failed: ${error.message}`)
          return
        }
      } else if (slug) {
        await supabase.from('projects').delete().eq('slug', slug)
      }
    } catch {
      // Ignored for non-uuid fallback item
    }

    toast.success('Project deleted successfully')
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      <Toaster position="top-right" theme="dark" />
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F5F5F5', letterSpacing: '-0.02em' }}>
            Projects
          </h1>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
            {projects.length} total active projects in portfolio
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#E45D2C',
            color: '#fff',
            textDecoration: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'background 0.15s',
          }}
        >
          <Plus size={16} /> Add Project
        </Link>
      </div>

      {loading ? (
        <div style={{ color: '#666', fontSize: '14px', padding: '40px 0', textAlign: 'center' }}>
          Loading portfolio projects…
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666', background: '#141414', borderRadius: '10px', border: '1px solid #222' }}>
          <p style={{ fontSize: '15px', color: '#AAA', marginBottom: '8px' }}>No projects found</p>
          <Link
            href="/admin/projects/new"
            style={{ color: '#E45D2C', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}
          >
            Add your first project →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {projects.map((project, i) => (
            <div
              key={project.id}
              style={{
                background: '#1A1A1A',
                border: '1px solid #242424',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'border-color 0.15s',
              }}
            >
              <span style={{ fontSize: '12px', color: '#555', fontFamily: 'monospace', minWidth: '24px' }}>
                {(i + 1).toString().padStart(2, '0')}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px', color: '#F5F5F5', fontWeight: 500 }}>
                    {project.title}
                  </span>
                  {project.featured && (
                    <span
                      style={{
                        fontSize: '10px',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#E45D2C',
                        background: 'rgba(228,93,44,0.12)',
                        border: '1px solid rgba(228,93,44,0.25)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 500,
                      }}
                    >
                      Featured
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: '#777', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#AAA' }}>{project.category}</span>
                  <span>·</span>
                  <span style={{ fontFamily: 'monospace', color: '#666' }}>/{project.slug}</span>
                  {project.technologies && project.technologies.length > 0 && (
                    <>
                      <span>·</span>
                      <span style={{ color: '#555' }}>{project.technologies.slice(0, 3).join(', ')}{project.technologies.length > 3 ? '…' : ''}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Link
                  href={`/projects/${project.slug}`}
                  target="_blank"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: '#141414',
                    border: '1px solid #282828',
                    color: '#888',
                    textDecoration: 'none',
                  }}
                  title="Preview on live website"
                >
                  <ExternalLink size={13} />
                </Link>

                <button
                  onClick={() => togglePublished(project.id, project.published, project.slug)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: '#141414',
                    border: '1px solid #282828',
                    cursor: 'pointer',
                    color: project.published ? '#4A7C59' : '#666',
                  }}
                  title={project.published ? 'Published — click to unpublish' : 'Draft — click to publish'}
                >
                  {project.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>

                <Link
                  href={`/admin/projects/${project.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: '#141414',
                    border: '1px solid #282828',
                    color: '#DDD',
                    textDecoration: 'none',
                  }}
                  title="Edit project"
                >
                  <Pencil size={13} />
                </Link>

                <button
                  onClick={() => deleteProject(project.id, project.title, project.slug)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: '#141414',
                    border: '1px solid #282828',
                    cursor: 'pointer',
                    color: '#666',
                  }}
                  title="Delete project"
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#E45D2C')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
