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
  BookOpen,
  Calendar,
  Sparkles,
  Clock,
} from 'lucide-react'
import type { Training } from '@/types'
import { formatDate } from '@/lib/utils'
import { toast, Toaster } from 'sonner'
import StatusBadge from '@/components/admin/StatusBadge'
import SearchBar from '@/components/admin/SearchBar'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { ContentCardSkeleton } from '@/components/admin/LoadingSkeleton'

const CATEGORIES = [
  'All',
  'AI / ML',
  'Full Stack',
  'Web Development',
  'Data Science',
  'Cloud & DevOps',
  'Industrial Training',
  'Workshop',
  'Bootcamp',
  'Other',
]

const MODES = ['All', 'Online', 'Offline', 'Hybrid']

export default function AdminTrainingPage() {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedMode, setSelectedMode] = useState('All')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all')

  // Confirm Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<Training | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true
    async function loadData() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('training')
          .select('*')
          .order('display_order', { ascending: true })
          .order('start_date', { ascending: false })

        if (active) {
          if (!error && Array.isArray(data)) {
            setTrainings(data)
          } else {
            setTrainings([])
          }
          setLoading(false)
        }
      } catch {
        if (active) {
          setTrainings([])
          setLoading(false)
        }
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [])

  // Filtered Training List
  const filteredTrainings = useMemo(() => {
    return trainings.filter((t) => {
      // Category filter
      if (selectedCategory !== 'All' && t.category !== selectedCategory) {
        return false
      }
      // Mode filter
      if (selectedMode !== 'All' && t.mode !== selectedMode) {
        return false
      }
      // Status filter
      if (statusFilter === 'published' && !t.published) return false
      if (statusFilter === 'draft' && t.published) return false
      if (statusFilter === 'featured' && !t.featured) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = t.title.toLowerCase().includes(q)
        const matchProvider = (t.provider ?? '').toLowerCase().includes(q)
        const matchOrg = (t.organization ?? '').toLowerCase().includes(q)
        const matchSkills = (t.skills ?? []).some((s) => s.toLowerCase().includes(q))
        return matchTitle || matchProvider || matchOrg || matchSkills
      }

      return true
    })
  }, [trainings, selectedCategory, selectedMode, statusFilter, searchQuery])

  // Quick Toggle Published
  async function handleTogglePublished(item: Training) {
    const updated = !item.published
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)
    try {
      const supabase = createClient()
      if (isUuid) {
        const { error } = await supabase
          .from('training')
          .update({ published: updated, updated_at: new Date().toISOString() })
          .eq('id', item.id)
        if (error) throw error
      } else if (item.slug) {
        const { error } = await supabase
          .from('training')
          .update({ published: updated, updated_at: new Date().toISOString() })
          .eq('slug', item.slug)
        if (error) throw error
      }

      setTrainings((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, published: updated } : t))
      )
      toast.success(updated ? 'Training published to website' : 'Training set to draft')

      // Revalidate cache
      fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'training', slug: item.slug }),
      }).catch(() => {})
    } catch {
      toast.error('Failed to update status')
    }
  }

  // Quick Toggle Featured
  async function handleToggleFeatured(item: Training) {
    const updated = !item.featured
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)
    try {
      const supabase = createClient()
      if (isUuid) {
        const { error } = await supabase
          .from('training')
          .update({ featured: updated, updated_at: new Date().toISOString() })
          .eq('id', item.id)
        if (error) throw error
      } else if (item.slug) {
        const { error } = await supabase
          .from('training')
          .update({ featured: updated, updated_at: new Date().toISOString() })
          .eq('slug', item.slug)
        if (error) throw error
      }

      setTrainings((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, featured: updated } : t))
      )
      toast.success(updated ? 'Training featured on homepage' : 'Removed from featured')

      // Revalidate cache
      fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'training' }),
      }).catch(() => {})
    } catch {
      toast.error('Failed to update featured flag')
    }
  }

  // Confirm Delete
  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleting(true)

    // Handle local fallback items immediately without triggering database errors
    if (deleteTarget.id.startsWith('00000000-0000-4000-')) {
      setTrainings((prev) => prev.filter((t) => t.id !== deleteTarget.id))
      toast.success('Training program removed from view')
      setDeleting(false)
      setDeleteTarget(null)
      return
    }

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const headers: Record<string, string> = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      // 1. First attempt server-side authenticated delete endpoint (handles safe storage cleanup & cache revalidation)
      let endpointSucceeded = false
      try {
        const res = await fetch(`/api/admin/training/${encodeURIComponent(deleteTarget.id)}`, {
          method: 'DELETE',
          headers,
        })

        if (res.ok) {
          const result = await res.json().catch(() => ({}))
          if (result.success) {
            endpointSucceeded = true
          }
        }
      } catch {
        // Fall through to client deletion if fetch fails
      }

      if (!endpointSucceeded) {
        // 2. Fallback to direct client delete
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(deleteTarget.id)

        try {
          if (isUuid) {
            const { error } = await supabase.from('training').delete().eq('id', deleteTarget.id)
            if (error) {
              if (deleteTarget.slug) {
                const { error: slugErr } = await supabase.from('training').delete().eq('slug', deleteTarget.slug)
                if (slugErr) throw slugErr
              } else {
                throw error
              }
            }
          } else if (deleteTarget.slug) {
            const { error } = await supabase.from('training').delete().eq('slug', deleteTarget.slug)
            if (error) throw error
          }
        } catch (dbErr: unknown) {
          const dbMsg = dbErr instanceof Error ? dbErr.message : String(dbErr)
          if (!dbMsg.toLowerCase().includes('schema cache') && !dbMsg.toLowerCase().includes('could not find the table')) {
            throw dbErr
          }
        }
      }

      setTrainings((prev) => prev.filter((t) => t.id !== deleteTarget.id))
      toast.success('Training program deleted successfully')

      // Revalidate cache
      fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'training', slug: deleteTarget.slug }),
      }).catch(() => {})
    } catch (err: unknown) {
      let msg = 'Deletion failed'
      if (typeof err === 'object' && err !== null && 'message' in err) {
        msg = String((err as { message: unknown }).message)
      } else if (err instanceof Error) {
        msg = err.message
      }

      if (msg.toLowerCase().includes('schema cache') || msg.toLowerCase().includes('could not find the table')) {
        setTrainings((prev) => prev.filter((t) => t.id !== deleteTarget.id))
        toast.info('Removed from view. (Table not yet created in Supabase)')
      } else {
        console.warn('Training deletion warning:', msg)
        toast.error(msg)
      }
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <Toaster position="top-right" richColors />

      {/* Action Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#F5F5F5', margin: 0 }}>
            Training Programs & Workshops
          </h1>
          <p style={{ fontSize: '13px', color: '#8A8F98', margin: '4px 0 0' }}>
            Manage industrial training programs, specialized bootcamps, and technical learning experiences.
          </p>
        </div>

        <Link
          href="/admin/training/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #E45D2C 0%, #FF8A3D 100%)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(228, 93, 44, 0.35)',
            transition: 'all 0.2s',
          }}
        >
          <Plus size={16} />
          Add Training
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          background: '#0D1117',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div style={{ flex: '1 1 280px', maxWidth: '420px' }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search training title, provider, skills..."
            />
          </div>

          {/* Status Segmented Buttons */}
          <div
            style={{
              display: 'flex',
              background: '#13171F',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '3px',
              gap: '2px',
            }}
          >
            {(['all', 'published', 'draft', 'featured'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: statusFilter === st ? '#1E2430' : 'transparent',
                  border: 'none',
                  color: statusFilter === st ? '#FF8A3D' : '#8A8F98',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Category & Mode Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#8A8F98',
              textTransform: 'uppercase',
              marginRight: '4px',
            }}
          >
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  background: isActive ? 'rgba(228, 93, 44, 0.15)' : '#13171F',
                  border: `1px solid ${isActive ? '#E45D2C' : 'rgba(255, 255, 255, 0.08)'}`,
                  color: isActive ? '#FF8A3D' : '#8A8F98',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {cat}
              </button>
            )
          })}

          <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 4px' }} />

          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#8A8F98',
              textTransform: 'uppercase',
              marginRight: '4px',
            }}
          >
            Mode:
          </span>
          {MODES.map((m) => {
            const isActive = selectedMode === m
            return (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMode(m)}
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  background: isActive ? 'rgba(20, 184, 166, 0.15)' : '#13171F',
                  border: `1px solid ${isActive ? '#14B8A6' : 'rgba(255, 255, 255, 0.08)'}`,
                  color: isActive ? '#14B8A6' : '#8A8F98',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {m}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid of Training Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4].map((n) => (
            <ContentCardSkeleton key={n} />
          ))}
        </div>
      ) : filteredTrainings.length === 0 ? (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: '#0D1117',
            border: '1px dashed rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
          }}
        >
          <BookOpen size={36} style={{ color: '#8A8F98', marginBottom: '12px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '16px', color: '#F5F5F5', margin: '0 0 6px' }}>No training records found</h3>
          <p style={{ fontSize: '13px', color: '#8A8F98', margin: '0 0 16px' }}>
            {searchQuery || selectedCategory !== 'All'
              ? 'Try adjusting your filters or search terms.'
              : 'Add your first industrial training or workshop to showcase your continuous learning.'}
          </p>
          <Link
            href="/admin/training/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#E45D2C',
              color: '#FFFFFF',
              fontSize: '13px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            <Plus size={14} /> Add Training Program
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredTrainings.map((t) => {
            const orgName = t.organization || t.provider || 'Independent Learning'
            const durationLabel = t.duration || 'Flexible'
            const modeBadgeColor =
              t.mode === 'Online'
                ? '#3B82F6'
                : t.mode === 'Hybrid'
                ? '#10B981'
                : '#FF8A3D'

            return (
              <div
                key={t.id}
                style={{
                  background: '#0D1117',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
              >
                <div>
                  {/* Top Bar: Category & Badges */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(228, 93, 44, 0.12)',
                          color: '#FF8A3D',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {t.category}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: `${modeBadgeColor}15`,
                          color: modeBadgeColor,
                          fontWeight: 600,
                        }}
                      >
                        {t.mode}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {t.featured && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(255, 138, 61, 0.15)',
                            color: '#FF8A3D',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <Sparkles size={10} /> Featured
                        </span>
                      )}
                      <StatusBadge type={t.published ? 'published' : 'draft'} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#F5F5F5',
                      margin: '0 0 6px',
                      lineHeight: 1.4,
                    }}
                  >
                    {t.title}
                  </h3>

                  {/* Organization & Duration Meta */}
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#8A8F98',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                      marginBottom: '10px',
                    }}
                  >
                    <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{orgName}</span>
                    <span>·</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> {durationLabel}
                    </span>
                    {t.start_date && (
                      <>
                        <span>·</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={11} /> {formatDate(t.start_date)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Skills Tags */}
                  {t.skills && t.skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                      {t.skills.slice(0, 4).map((s, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono)',
                            padding: '1px 6px',
                            borderRadius: '3px',
                            background: '#13171F',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#CBD5E1',
                          }}
                        >
                          {s}
                        </span>
                      ))}
                      {t.skills.length > 4 && (
                        <span style={{ fontSize: '10px', color: '#8A8F98', alignSelf: 'center' }}>
                          +{t.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(t)}
                      title={t.published ? 'Unpublish' : 'Publish'}
                      style={{
                        padding: '5px 8px',
                        background: '#13171F',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '4px',
                        color: t.published ? '#10B981' : '#8A8F98',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                      }}
                    >
                      {t.published ? <Eye size={13} /> : <EyeOff size={13} />}
                      <span>{t.published ? 'Live' : 'Draft'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(t)}
                      title="Toggle Featured"
                      style={{
                        padding: '5px 8px',
                        background: '#13171F',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '4px',
                        color: t.featured ? '#FF8A3D' : '#8A8F98',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                      }}
                    >
                      <Sparkles size={12} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Link
                      href={`/training/${t.slug}`}
                      target="_blank"
                      title="Public Preview"
                      style={{
                        padding: '5px 8px',
                        background: '#13171F',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '4px',
                        color: '#8A8F98',
                        display: 'inline-flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                      }}
                    >
                      <ExternalLink size={13} />
                    </Link>

                    <Link
                      href={`/admin/training/${t.id}`}
                      title="Edit Training"
                      style={{
                        padding: '5px 8px',
                        background: '#13171F',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '4px',
                        color: '#FF8A3D',
                        display: 'inline-flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                      }}
                    >
                      <Pencil size={13} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(t)}
                      title="Delete Training"
                      style={{
                        padding: '5px 8px',
                        background: '#13171F',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '4px',
                        color: '#EF4444',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Training Program?"
        description="Are you sure you want to remove this training record? This action cannot be undone."
        itemName={deleteTarget?.title}
        confirmLabel={deleting ? 'Deleting...' : 'Delete Program'}
        isDestructive={true}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
