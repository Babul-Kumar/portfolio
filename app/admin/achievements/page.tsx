'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { achievementSchema, type AchievementFormValues } from '@/lib/validations'
import { slugify, formatDate, sanitizeDateForDb } from '@/lib/utils'
import { Plus, Pencil, Trash2, Eye, EyeOff, Award, ExternalLink } from 'lucide-react'
import type { Achievement } from '@/types'
import { toast, Toaster } from 'sonner'
import StatusBadge from '@/components/admin/StatusBadge'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

const inputStyle = {
  width: '100%',
  background: '#0D0F14',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  padding: '9px 12px',
  color: '#F5F5F5',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
}

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#8A8F98',
  fontWeight: 600,
  marginBottom: '6px',
}

function AchievementForm({
  achievement,
  onSave,
  onCancel,
}: {
  achievement?: Achievement
  onSave: () => void
  onCancel: () => void
}) {
  const isEdit = !!achievement
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: achievement?.title ?? '',
      slug: achievement?.slug ?? '',
      organization: achievement?.organization ?? '',
      category: achievement?.category ?? 'Hackathon',
      date: achievement?.date ?? '',
      rank: achievement?.rank ?? '',
      description: achievement?.description ?? '',
      verification_url: achievement?.verification_url ?? '',
      featured: achievement?.featured ?? false,
      published: achievement?.published ?? true,
    },
  })

  async function onSubmit(values: AchievementFormValues) {
    setSaving(true)
    try {
      const supabase = createClient()
      const payload = {
        title: values.title,
        slug: values.slug || slugify(values.title),
        organization: values.organization || null,
        category: values.category,
        date: sanitizeDateForDb(values.date),
        rank: values.rank || null,
        description: values.description || null,
        verification_url: values.verification_url || null,
        featured: values.featured,
        published: values.published,
      }

      if (isEdit) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          achievement.id
        )
        if (isUuid) {
          const { error } = await supabase
            .from('achievements')
            .update(payload)
            .eq('id', achievement.id)
          if (error) {
            toast.error(`Update failed: ${error.message}`)
            setSaving(false)
            return
          }
        } else {
          const { error } = await supabase.from('achievements').insert(payload)
          if (error) {
            toast.error(`Save failed: ${error.message}`)
            setSaving(false)
            return
          }
        }
      } else {
        const { error } = await supabase.from('achievements').insert(payload)
        if (error) {
          toast.error(`Insert failed: ${error.message}`)
          setSaving(false)
          return
        }
      }

      toast.success(isEdit ? 'Achievement updated' : 'Achievement created')
      fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'achievements' }),
      }).catch(() => {})
      setSaving(false)
      onSave()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      toast.error(message)
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        background: '#101318',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '28px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <h2 style={{ color: '#F5F5F5', fontSize: '15px', fontWeight: 600, margin: 0 }}>
          {isEdit ? 'Edit Achievement' : 'New Achievement Record'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '13px' }}
        >
          Cancel
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          marginBottom: '14px',
        }}
      >
        <div>
          <label style={labelStyle}>Title *</label>
          <input
            {...register('title')}
            style={inputStyle}
            placeholder="e.g. Smart India Hackathon Winner"
            onBlur={() => {
              const curTitle = getValues('title')
              if (!isEdit && curTitle) setValue('slug', slugify(curTitle))
            }}
          />
          {errors.title && (
            <p style={{ color: '#E45D2C', fontSize: '11px', marginTop: '4px' }}>
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label style={labelStyle}>Slug *</label>
          <input {...register('slug')} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Organization</label>
          <input {...register('organization')} style={inputStyle} placeholder="e.g. Ministry of Education / Tech Veda" />
        </div>

        <div>
          <label style={labelStyle}>Category</label>
          <select {...register('category')} style={inputStyle}>
            {['Hackathon', 'Competition', 'Award', 'Certification', 'Other'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" {...register('date')} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Rank / Position</label>
          <input {...register('rank')} style={inputStyle} placeholder="e.g. 1st Place, National Winner" />
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Verification / Proof URL</label>
        <input {...register('verification_url')} style={inputStyle} placeholder="https://..." />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Description & Impact</label>
        <textarea
          {...register('description')}
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }}
          placeholder="Summary of project developed, team role, and achievements..."
        />
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#D1D5DB', fontSize: '13px' }}>
          <input type="checkbox" {...register('featured')} style={{ accentColor: '#E45D2C' }} /> Featured Badge
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#D1D5DB', fontSize: '13px' }}>
          <input type="checkbox" {...register('published')} style={{ accentColor: '#E45D2C' }} /> Published on Public Portfolio
        </label>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            background: saving ? '#333' : 'linear-gradient(135deg, #E45D2C 0%, #FF8A3D 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 22px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(228, 93, 44, 0.25)',
          }}
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Achievement'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            color: '#D1D5DB',
            padding: '10px 16px',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Achievement | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null)

  async function load() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('date', { ascending: false })
      if (!error && Array.isArray(data)) {
        setAchievements(data)
      } else {
        setAchievements([])
      }
      setLoading(false)
    } catch {
      setAchievements([])
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    async function loadData() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .order('date', { ascending: false })
        if (active) {
          if (!error && Array.isArray(data)) {
            setAchievements(data)
          } else {
            setAchievements([])
          }
          setLoading(false)
        }
      } catch {
        if (active) {
          setAchievements([])
          setLoading(false)
        }
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [])

  async function confirmDelete() {
    if (!deleteTarget) return
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      deleteTarget.id
    )
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('achievements').delete().eq('id', deleteTarget.id)
        if (error) {
          toast.error(`Delete failed: ${error.message}`)
          return
        }
      } else {
        await supabase.from('achievements').delete().eq('title', deleteTarget.title)
      }
      fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'achievements' }),
      }).catch(() => {})
    } catch {
      // Ignored
    }

    toast.success('Achievement deleted')
    setAchievements((prev) => prev.filter((a) => a.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  async function togglePublished(id: string, current: boolean) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('achievements').update({ published: !current }).eq('id', id)
        if (error) {
          toast.error('Update failed')
        } else {
          toast.success(current ? 'Unpublished' : 'Published')
          fetch('/api/admin/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'achievements' }),
          }).catch(() => {})
        }
      } else {
        toast.success(current ? 'Unpublished' : 'Published')
      }
    } catch {
      toast.success(current ? 'Unpublished' : 'Published')
    }

    setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, published: !current } : a)))
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <Toaster position="top-right" theme="dark" />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '28px',
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
            Achievements & Awards
          </h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px', margin: 0 }}>
            {achievements.length} competitive awards & honors in portfolio
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(undefined)
            setShowForm(!showForm)
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: showForm ? '#1A1D24' : 'linear-gradient(135deg, #E45D2C 0%, #FF8A3D 100%)',
            color: '#fff',
            border: 'none',
            padding: '9px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: showForm ? 'none' : '0 4px 12px rgba(228, 93, 44, 0.25)',
            transition: 'all 0.15s',
          }}
        >
          <Plus size={16} /> {showForm ? 'Close Form' : 'Add Achievement'}
        </button>
      </div>

      {showForm && (
        <AchievementForm
          achievement={editing}
          onSave={() => {
            setShowForm(false)
            setEditing(undefined)
            load()
          }}
          onCancel={() => {
            setShowForm(false)
            setEditing(undefined)
          }}
        />
      )}

      {loading ? (
        <div style={{ color: '#6B7280', fontSize: '13px', padding: '40px 0', textAlign: 'center' }}>
          Loading achievements…
        </div>
      ) : achievements.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#101318',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <p style={{ fontSize: '15px', color: '#AAA', marginBottom: '8px' }}>No achievements recorded yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {achievements.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#101318',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'border-color 0.15s',
              }}
              className="admin-hover-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: 'rgba(228, 93, 44, 0.1)',
                    border: '1px solid rgba(228, 93, 44, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#E45D2C',
                    flexShrink: 0,
                  }}
                >
                  <Award size={22} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#F5F5F5' }}>
                      {item.title}
                    </span>
                    <StatusBadge type="category" label={item.category} />
                    {item.featured && <StatusBadge type="featured" />}
                  </div>

                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '3px' }}>
                    {item.organization && <span>{item.organization}</span>}
                    {item.rank && <span style={{ color: '#E45D2C', fontWeight: 500 }}> · {item.rank}</span>}
                    {item.date && <span> · {formatDate(item.date)}</span>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {item.verification_url && (
                  <a
                    href={item.verification_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#9CA3AF', padding: '6px' }}
                    title="View proof URL"
                  >
                    <ExternalLink size={15} />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => togglePublished(item.id, item.published)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    color: item.published ? '#10B981' : '#6B7280',
                    cursor: 'pointer',
                    padding: '6px',
                  }}
                  title={item.published ? 'Unpublish' : 'Publish'}
                >
                  {item.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditing(item)
                    setShowForm(true)
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    color: '#E5E7EB',
                    cursor: 'pointer',
                    padding: '6px',
                  }}
                  title="Edit achievement"
                >
                  <Pencil size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '6px',
                    color: '#EF4444',
                    cursor: 'pointer',
                    padding: '6px',
                  }}
                  title="Delete achievement"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Achievement"
        description="Are you sure you want to permanently delete this achievement record?"
        itemName={deleteTarget?.title}
        confirmLabel="Delete Achievement"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <style>{`
        .admin-hover-row:hover {
          border-color: rgba(255, 255, 255, 0.18) !important;
          background: #141822 !important;
        }
      `}</style>
    </div>
  )
}
