'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { achievementSchema, type AchievementFormValues } from '@/lib/validations'
import { slugify } from '@/lib/utils'
import { Plus, Pencil, Trash2, Eye, EyeOff, Award } from 'lucide-react'
import type { Achievement } from '@/types'
import { FALLBACK_ACHIEVEMENTS } from '@/lib/data'
import { formatDate } from '@/lib/utils'
import { toast, Toaster } from 'sonner'

const input = {
  width: '100%',
  background: '#141414',
  border: '1px solid #282828',
  borderRadius: '6px',
  padding: '10px 14px',
  color: '#F5F5F5',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
}
const label = {
  display: 'block',
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#666',
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
        ...values,
        slug: values.slug || slugify(values.title),
        organization: values.organization || null,
        date: values.date || null,
        rank: values.rank || null,
        description: values.description || null,
        verification_url: values.verification_url || null,
      }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(achievement?.id ?? '')

      if (isEdit && isUuid) {
        const { data: existing } = await supabase.from('achievements').select('id').eq('id', achievement!.id).single()
        if (existing) {
          const { error } = await supabase.from('achievements').update(payload).eq('id', achievement!.id)
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
      } else if (isEdit) {
        const { data: existing } = await supabase.from('achievements').select('id').eq('slug', payload.slug).single()
        if (existing) {
          const { error } = await supabase.from('achievements').update(payload).eq('id', existing.id)
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
        background: '#1A1A1A',
        border: '1px solid #2C2C2C',
        borderRadius: '10px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#F5F5F5', fontSize: '16px', fontWeight: 500 }}>
          {isEdit ? 'Edit Achievement' : 'New Achievement'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '13px' }}
        >
          Cancel
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={label}>Title *</label>
          <input
            {...register('title')}
            style={input}
            onBlur={() => {
              const curTitle = getValues('title')
              if (!isEdit && curTitle) setValue('slug', slugify(curTitle))
            }}
          />
          {errors.title && (
            <p style={{ color: '#E45D2C', fontSize: '11px', marginTop: '4px' }}>{errors.title.message}</p>
          )}
        </div>
        <div>
          <label style={label}>Slug *</label>
          <input {...register('slug')} style={input} />
        </div>
        <div>
          <label style={label}>Organization</label>
          <input {...register('organization')} style={input} placeholder="e.g. OpenAI / University" />
        </div>
        <div>
          <label style={label}>Category</label>
          <select {...register('category')} style={input}>
            {['Hackathon', 'Competition', 'Award', 'Certification', 'Other'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={label}>Date</label>
          <input type="date" {...register('date')} style={input} />
        </div>
        <div>
          <label style={label}>Rank / Position</label>
          <input {...register('rank')} style={input} placeholder="e.g. Winner, 1st Place, Finalist" />
        </div>
      </div>
      <div style={{ marginBottom: '14px' }}>
        <label style={label}>Description</label>
        <textarea
          {...register('description')}
          style={{ ...input, minHeight: '80px', resize: 'vertical' as const }}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={label}>Verification URL</label>
        <input {...register('verification_url')} style={input} placeholder="https://..." />
      </div>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {(['featured', 'published'] as const).map((k) => (
          <label
            key={k}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              color: '#888',
              fontSize: '13px',
            }}
          >
            <input type="checkbox" {...register(k)} style={{ accentColor: '#E45D2C' }} />
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            background: '#E45D2C',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Achievement'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{ background: 'none', border: '1px solid #333', borderRadius: '6px', color: '#888', padding: '10px 16px', fontSize: '13px', cursor: 'pointer' }}
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

  async function load() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('achievements').select('*').order('date', { ascending: false })
      if (!error && data && data.length > 0) {
        setAchievements(data)
      } else {
        setAchievements(FALLBACK_ACHIEVEMENTS)
      }
      setLoading(false)
    } catch {
      setAchievements(FALLBACK_ACHIEVEMENTS)
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    async function loadData() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from('achievements').select('*').order('date', { ascending: false })
        if (active) {
          if (!error && data && data.length > 0) {
            setAchievements(data)
          } else {
            setAchievements(FALLBACK_ACHIEVEMENTS)
          }
          setLoading(false)
        }
      } catch {
        if (active) {
          setAchievements(FALLBACK_ACHIEVEMENTS)
          setLoading(false)
        }
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [])

  async function deleteItem(id: string, title: string, slug?: string) {
    if (!confirm(`Delete achievement "${title}"? This cannot be undone.`)) return
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('achievements').delete().eq('id', id)
        if (error) {
          toast.error(`Delete failed: ${error.message}`)
          return
        }
      } else if (slug) {
        await supabase.from('achievements').delete().eq('slug', slug)
      }
    } catch {
      // Ignored for non-uuid fallback item
    }

    toast.success('Achievement deleted')
    setAchievements((prev) => prev.filter((a) => a.id !== id))
  }

  async function togglePublished(id: string, current: boolean, slug?: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('achievements').update({ published: !current }).eq('id', id)
        if (error) {
          toast.error('Update failed in database')
        } else {
          toast.success(current ? 'Unpublished' : 'Published')
        }
      } else if (slug) {
        await supabase.from('achievements').update({ published: !current }).eq('slug', slug)
        toast.success(current ? 'Unpublished' : 'Published')
      } else {
        toast.success(current ? 'Unpublished' : 'Published')
      }
    } catch {
      toast.success(current ? 'Unpublished' : 'Published')
    }

    setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, published: !current } : a)))
  }

  return (
    <div style={{ maxWidth: '900px' }}>
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
            Achievements & Awards
          </h1>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
            {achievements.length} competitive awards & honors in portfolio
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(undefined)
            setShowForm(!showForm)
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: showForm ? '#222' : '#E45D2C',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.15s',
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
        <div style={{ color: '#666', fontSize: '14px', padding: '40px 0', textAlign: 'center' }}>
          Loading achievements…
        </div>
      ) : achievements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666', background: '#141414', borderRadius: '10px', border: '1px solid #222' }}>
          <p style={{ fontSize: '15px', color: '#AAA', marginBottom: '8px' }}>No achievements yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {achievements.map((item) => (
            <div
              key={item.id}
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
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '6px',
                  background: '#141414',
                  border: '1px solid #2C2C2C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#E45D2C',
                  flexShrink: 0,
                }}
              >
                <Award size={18} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px', color: '#F5F5F5', fontWeight: 500 }}>
                    {item.title}
                  </span>
                  {item.rank && (
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
                      {item.rank}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: '#777', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#AAA' }}>{item.category}</span>
                  {item.organization && (
                    <>
                      <span>·</span>
                      <span style={{ color: '#DDD' }}>{item.organization}</span>
                    </>
                  )}
                  {item.date && (
                    <>
                      <span>·</span>
                      <span>{formatDate(item.date, 'MMM yyyy')}</span>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  onClick={() => togglePublished(item.id, item.published, item.slug)}
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
                    color: item.published ? '#4A7C59' : '#666',
                  }}
                  title={item.published ? 'Published' : 'Draft'}
                >
                  {item.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>

                <button
                  onClick={() => {
                    setEditing(item)
                    setShowForm(true)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
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
                    color: '#DDD',
                  }}
                  title="Edit achievement"
                >
                  <Pencil size={13} />
                </button>

                <button
                  onClick={() => deleteItem(item.id, item.title, item.slug)}
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
                  title="Delete achievement"
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
