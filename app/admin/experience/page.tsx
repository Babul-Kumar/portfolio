'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { experienceSchema, type ExperienceFormValues } from '@/lib/validations'
import { parseCSV, joinCSV, formatDate } from '@/lib/utils'
import { Plus, Trash2, Pencil, Briefcase, Eye, EyeOff } from 'lucide-react'
import type { Experience } from '@/types'
import { FALLBACK_EXPERIENCE } from '@/lib/data'
import { toast, Toaster } from 'sonner'

const inp = {
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
const lbl = {
  display: 'block',
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#666',
  marginBottom: '6px',
}

function ExperienceForm({
  item,
  onSave,
  onCancel,
}: {
  item?: Experience
  onSave: () => void
  onCancel: () => void
}) {
  const isEdit = !!item
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: item?.company ?? '',
      role: item?.role ?? '',
      start_date: item?.start_date ?? '',
      end_date: item?.end_date ?? '',
      is_current: item?.is_current ?? false,
      description: item?.description ?? '',
      technologies: item ? joinCSV(item.technologies) : '',
      company_url: item?.company_url ?? '',
      location: item?.location ?? '',
      type: item?.type ?? 'Full-time',
      published: item?.published ?? true,
    },
  })

  async function onSubmit(values: ExperienceFormValues) {
    setSaving(true)
    try {
      const supabase = createClient()
      const payload = {
        company: values.company,
        role: values.role,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        is_current: values.is_current,
        description: values.description || null,
        technologies: values.technologies ? parseCSV(values.technologies) : [],
        company_url: values.company_url || null,
        location: values.location || null,
        type: values.type,
        published: values.published,
      }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item?.id ?? '')

      if (isEdit && isUuid) {
        const { data: existing } = await supabase.from('experience').select('id').eq('id', item!.id).single()
        if (existing) {
          const { error } = await supabase.from('experience').update(payload).eq('id', item!.id)
          if (error) {
            toast.error(`Update failed: ${error.message}`)
            setSaving(false)
            return
          }
        } else {
          const { error } = await supabase.from('experience').insert(payload)
          if (error) {
            toast.error(`Save failed: ${error.message}`)
            setSaving(false)
            return
          }
        }
      } else if (isEdit) {
        const { data: existing } = await supabase
          .from('experience')
          .select('id')
          .eq('company', payload.company)
          .eq('role', payload.role)
          .single()
        if (existing) {
          const { error } = await supabase.from('experience').update(payload).eq('id', existing.id)
          if (error) {
            toast.error(`Update failed: ${error.message}`)
            setSaving(false)
            return
          }
        } else {
          const { error } = await supabase.from('experience').insert(payload)
          if (error) {
            toast.error(`Save failed: ${error.message}`)
            setSaving(false)
            return
          }
        }
      } else {
        const { error } = await supabase.from('experience').insert(payload)
        if (error) {
          toast.error(`Insert failed: ${error.message}`)
          setSaving(false)
          return
        }
      }

      toast.success(isEdit ? 'Experience updated' : 'Experience added')
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
        <h3 style={{ color: '#F5F5F5', fontSize: '16px', fontWeight: 500 }}>
          {isEdit ? 'Edit Experience' : 'Add Experience'}
        </h3>
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
          <label style={lbl}>Company / Organization *</label>
          <input {...register('company')} style={inp} placeholder="e.g. AI Research & Open Source" />
        </div>
        <div>
          <label style={lbl}>Role / Title *</label>
          <input {...register('role')} style={inp} placeholder="e.g. Software & ML Engineer" />
        </div>
        <div>
          <label style={lbl}>Start Date</label>
          <input type="date" {...register('start_date')} style={inp} />
        </div>
        <div>
          <label style={lbl}>End Date</label>
          <input type="date" {...register('end_date')} style={inp} />
        </div>
        <div>
          <label style={lbl}>Location</label>
          <input {...register('location')} style={inp} placeholder="e.g. Remote / On-site" />
        </div>
        <div>
          <label style={lbl}>Engagement Type</label>
          <select {...register('type')} style={inp}>
            {['Full-time', 'Part-time', 'Internship', 'Contract', 'Project & Research', 'Freelance'].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: '14px' }}>
        <label style={lbl}>Technologies (comma separated)</label>
        <input {...register('technologies')} style={inp} placeholder="Python, PyTorch, Next.js, TypeScript" />
      </div>
      <div style={{ marginBottom: '14px' }}>
        <label style={lbl}>Description & Accomplishments</label>
        <textarea
          {...register('description')}
          style={{ ...inp, minHeight: '80px', resize: 'vertical' as const }}
        />
      </div>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            color: '#888',
            fontSize: '13px',
          }}
        >
          <input type="checkbox" {...register('is_current')} style={{ accentColor: '#E45D2C' }} /> Currently working here
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            color: '#888',
            fontSize: '13px',
          }}
        >
          <input type="checkbox" {...register('published')} style={{ accentColor: '#E45D2C' }} /> Published
        </label>
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
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Experience'}
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

export default function AdminExperiencePage() {
  const [items, setItems] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Experience | undefined>()

  async function load() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('experience').select('*').order('sort_order', { ascending: true })
      if (!error && data && data.length > 0) {
        setItems(data)
      } else {
        setItems(FALLBACK_EXPERIENCE)
      }
      setLoading(false)
    } catch {
      setItems(FALLBACK_EXPERIENCE)
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    async function loadData() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from('experience').select('*').order('sort_order', { ascending: true })
        if (active) {
          if (!error && data && data.length > 0) {
            setItems(data)
          } else {
            setItems(FALLBACK_EXPERIENCE)
          }
          setLoading(false)
        }
      } catch {
        if (active) {
          setItems(FALLBACK_EXPERIENCE)
          setLoading(false)
        }
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [])

  async function deleteItem(id: string, role: string, company?: string) {
    if (!confirm(`Delete experience entry for "${role}"?`)) return
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('experience').delete().eq('id', id)
        if (error) {
          toast.error(`Delete failed: ${error.message}`)
          return
        }
      } else if (company && role) {
        await supabase.from('experience').delete().eq('company', company).eq('role', role)
      }
    } catch {
      // Ignored for non-uuid fallback item
    }

    toast.success('Experience deleted')
    setItems((prev) => prev.filter((e) => e.id !== id))
  }

  async function togglePublished(id: string, current: boolean, company?: string, role?: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('experience').update({ published: !current }).eq('id', id)
        if (error) {
          toast.error('Update failed in database')
        } else {
          toast.success(current ? 'Unpublished' : 'Published')
        }
      } else if (company && role) {
        await supabase.from('experience').update({ published: !current }).eq('company', company).eq('role', role)
        toast.success(current ? 'Unpublished' : 'Published')
      } else {
        toast.success(current ? 'Unpublished' : 'Published')
      }
    } catch {
      toast.success(current ? 'Unpublished' : 'Published')
    }

    setItems((prev) => prev.map((e) => (e.id === id ? { ...e, published: !current } : e)))
  }

  return (
    <div style={{ maxWidth: '840px' }}>
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
            Work & Research Experience
          </h1>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
            {items.length} engineering & research roles in portfolio
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
          <Plus size={16} /> {showForm ? 'Close Form' : 'Add Experience'}
        </button>
      </div>

      {showForm && (
        <ExperienceForm
          item={editing}
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
          Loading work experience…
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666', background: '#141414', borderRadius: '10px', border: '1px solid #222' }}>
          <p style={{ fontSize: '15px', color: '#AAA', marginBottom: '8px' }}>No experience entries yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item) => (
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
                <Briefcase size={18} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', color: '#F5F5F5', fontWeight: 500, marginBottom: '2px' }}>
                  {item.role}
                </div>
                <div style={{ color: '#DDD', fontSize: '13px' }}>
                  {item.company} · <span style={{ color: '#888' }}>{item.type}</span>
                </div>
                <div style={{ color: '#777', fontSize: '12px', marginTop: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span>
                    {formatDate(item.start_date)} — {item.is_current ? 'Present' : formatDate(item.end_date)}
                  </span>
                  {item.location && (
                    <>
                      <span>·</span>
                      <span>{item.location}</span>
                    </>
                  )}
                </div>
                {item.technologies && item.technologies.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {item.technologies.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: '11px',
                          color: '#AAA',
                          background: '#141414',
                          border: '1px solid #282828',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  onClick={() => togglePublished(item.id, item.published, item.company, item.role)}
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
                  title="Edit experience"
                >
                  <Pencil size={13} />
                </button>

                <button
                  onClick={() => deleteItem(item.id, item.role, item.company)}
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
                  title="Delete experience"
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
