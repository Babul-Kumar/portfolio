'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import type { Project } from '@/types'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
    setProjects(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function togglePublished(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('projects').update({ published: !current }).eq('id', id)
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, published: !current } : p))
  }

  async function deleteProject(id: string) {
    if (!confirm('Delete this project? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('projects').delete().eq('id', id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#F5F5F5' }}>Projects</h1>
          <p style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>{projects.length} total</p>
        </div>
        <Link href="/admin/projects/new" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#B65C3A', color: '#fff', textDecoration: 'none',
          padding: '10px 16px', borderRadius: '8px', fontSize: '13px',
        }}>
          <Plus size={15} /> Add Project
        </Link>
      </div>

      {loading ? (
        <div style={{ color: '#555', fontSize: '14px' }}>Loading…</div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
          <p>No projects yet.</p>
          <Link href="/admin/projects/new" style={{ color: '#B65C3A', fontSize: '13px' }}>Add your first project →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {projects.map((project, i) => (
            <div key={project.id} style={{
              background: '#1A1A1A', border: '1px solid #222', borderRadius: '8px',
              padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <span style={{ fontSize: '11px', color: '#444', minWidth: '24px' }}>
                {(i + 1).toString().padStart(2, '0')}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', color: '#F5F5F5', fontWeight: 500, marginBottom: '2px' }}>
                  {project.title}
                </div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  {project.category} · /{project.slug}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {project.featured && (
                  <span style={{
                    fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: '#B65C3A', border: '1px solid rgba(182,92,58,0.3)',
                    padding: '2px 8px', borderRadius: '4px',
                  }}>Featured</span>
                )}
                <button
                  onClick={() => togglePublished(project.id, project.published)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: project.published ? '#4A7C59' : '#555', padding: '8px',
                  }}
                  title={project.published ? 'Published — click to unpublish' : 'Draft — click to publish'}
                >
                  {project.published ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <Link
                  href={`/admin/projects/${project.id}`}
                  style={{ background: 'none', padding: '8px', color: '#555', display: 'flex' }}
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => deleteProject(project.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#555' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#C96B46')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
