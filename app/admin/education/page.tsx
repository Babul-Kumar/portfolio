'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { educationSchema, type EducationFormValues } from '@/lib/validations'
import { Plus, Trash2, Pencil, GraduationCap, Eye, EyeOff } from 'lucide-react'
import type { Education } from '@/types'
import { FALLBACK_EDUCATION } from '@/lib/data'
import { formatDate } from '@/lib/utils'
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

function EducationForm({
  item,
  onSave,
  onCancel,
}: {
  item?: Education
  onSave: () => void
  onCancel: () => void
}) {
  const isEdit = !!item
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: item?.institution ?? '',
      degree: item?.degree ?? '',
      field: item?.field ?? '',
      start_date: item?.start_date ?? '',
      end_date: item?.end_date ?? '',
      is_current: item?.is_current ?? false,
      grade: item?.grade ?? '',
      description: item?.description ?? '',
      location: item?.location ?? '',
      website_url: item?.website_url ?? '',
      published: item?.published ?? true,
    },
  })

  async function onSubmit(values: EducationFormValues) {
    setSaving(true)
    try {
      const supabase = createClient()
      const payload = {
        ...values,
        field: values.field || null,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        grade: values.grade || null,
        description: values.description || null,
        location: values.location || null,
        website_url: values.website_url || null,
      }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item?.id ?? '')

      if (isEdit && isUuid) {
        const { data: existing } = await supabase.from('education').select('id').eq('id', item!.id).single()
        if (existing) {
          const { error } = await supabase.from('education').update(payload).eq('id', item!.id)
          if (error) {
            toast.error(`Update failed: ${error.message}`)
            setSaving(false)
            return
          }
        } else {
          const { error } = await supabase.from('education').insert(payload)
          if (error) {
            toast.error(`Save failed: ${error.message}`)
            setSaving(false)
            return
          }
        }
      } else if (isEdit) {
        const { data: existing } = await supabase
          .from('education')
          .select('id')
          .eq('institution', payload.institution)
          .eq('degree', payload.degree)
          .single()
        if (existing) {
          const { error } = await supabase.from('education').update(payload).eq('id', existing.id)
          if (error) {
            toast.error(`Update failed: ${error.message}`)
            setSaving(false)
            return
          }
        } else {
          const { error } = await supabase.from('education').insert(payload)
          if (error) {
            toast.error(`Save failed: ${error.message}`)
            setSaving(false)
            return
          }
        }
      } else {
        const { error } = await supabase.from('education').insert(payload)
        if (error) {
          toast.error(`Insert failed: ${error.message}`)
          setSaving(false)
          return
        }
      }

      toast.success(isEdit ? 'Education updated' : 'Education added')
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
          {isEdit ? 'Edit Education' : 'Add Education'}
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
          <label style={lbl}>Institution *</label>
          <input {...register('institution')} style={inp} placeholder="e.g. Lovely Professional University" />
        </div>
        <div>
          <label style={lbl}>Degree *</label>
          <input {...register('degree')} style={inp} placeholder="e.g. B.Tech" />
        </div>
        <div>
          <label style={lbl}>Field of Study</label>
          <input {...register('field')} style={inp} placeholder="e.g. Computer Science & Engineering" />
        </div>
        <div>
          <label style={lbl}>Location</label>
          <input {...register('location')} style={inp} placeholder="e.g. Punjab, India" />
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
          <label style={lbl}>Grade / Honors</label>
          <input {...register('grade')} style={inp} placeholder="e.g. 8.8 CGPA / First Class" />
        </div>
        <div>
          <label style={lbl}>Website URL</label>
          <input {...register('website_url')} style={inp} placeholder="https://..." />
        </div>
      </div>
      <div style={{ marginBottom: '14px' }}>
        <label style={lbl}>Description / Specialization</label>
        <textarea
          {...register('description')}
          style={{ ...inp, minHeight: '70px', resize: 'vertical' as const }}
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
          <input type="checkbox" {...register('is_current')} style={{ accentColor: '#E45D2C' }} /> Currently enrolled
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
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Education'}
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

export default function AdminEducationPage() {
  const [items, setItems] = useState<Education[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Education | undefined>()

  async function load() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('education').select('*').order('sort_order', { ascending: true })
      if (!error && data && data.length > 0) {
        // Clean out any placeholder strings
        const cleaned = data.filter((e) => e.institution && e.institution !== 'Add School Name')
        setItems(cleaned.length > 0 ? cleaned : FALLBACK_EDUCATION)
      } else {
        setItems(FALLBACK_EDUCATION)
      }
      setLoading(false)
    } catch {
      setItems(FALLBACK_EDUCATION)
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    async function loadData() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from('education').select('*').order('sort_order', { ascending: true })
        if (active) {
          if (!error && data && data.length > 0) {
            const cleaned = data.filter((e) => e.institution && e.institution !== 'Add School Name')
            setItems(cleaned.length > 0 ? cleaned : FALLBACK_EDUCATION)
          } else {
            setItems(FALLBACK_EDUCATION)
          }
          setLoading(false)
        }
      } catch {
        if (active) {
          setItems(FALLBACK_EDUCATION)
          setLoading(false)
        }
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [])

  async function deleteItem(id: string, name: string, degree?: string) {
    if (!confirm(`Delete education entry for "${name}"?`)) return
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('education').delete().eq('id', id)
        if (error) {
          toast.error('Delete failed')
          return
        }
      } else if (name && degree) {
        await supabase.from('education').delete().eq('institution', name).eq('degree', degree)
      }
    } catch {
      // Ignored for non-uuid fallback item
    }

    toast.success('Education deleted')
    setItems((prev) => prev.filter((e) => e.id !== id))
  }

  async function togglePublished(id: string, current: boolean, institution?: string, degree?: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('education').update({ published: !current }).eq('id', id)
        if (error) {
          toast.error('Update failed in database')
        } else {
          toast.success(current ? 'Unpublished' : 'Published')
        }
      } else if (institution && degree) {
        await supabase.from('education').update({ published: !current }).eq('institution', institution).eq('degree', degree)
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
            Education & Academic History
          </h1>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
            {items.length} academic qualifications in portfolio
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
          <Plus size={16} /> {showForm ? 'Close Form' : 'Add Education'}
        </button>
      </div>

      {showForm && (
        <EducationForm
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
          Loading education history…
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666', background: '#141414', borderRadius: '10px', border: '1px solid #222' }}>
          <p style={{ fontSize: '15px', color: '#AAA', marginBottom: '8px' }}>No education records yet.</p>
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
                <GraduationCap size={18} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', color: '#F5F5F5', fontWeight: 500, marginBottom: '4px' }}>
                  {item.degree} {item.field ? `in ${item.field}` : ''}
                </div>
                <div style={{ color: '#DDD', fontSize: '13px' }}>{item.institution}</div>
                <div style={{ color: '#777', fontSize: '12px', marginTop: '2px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span>
                    {formatDate(item.start_date)} — {item.is_current ? 'Present' : formatDate(item.end_date)}
                  </span>
                  {item.grade && (
                    <>
                      <span>·</span>
                      <span style={{ color: '#AAA' }}>{item.grade}</span>
                    </>
                  )}
                  {item.location && (
                    <>
                      <span>·</span>
                      <span>{item.location}</span>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  onClick={() => togglePublished(item.id, item.published, item.institution, item.degree)}
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
                  title="Edit education"
                >
                  <Pencil size={13} />
                </button>

                <button
                  onClick={() => deleteItem(item.id, item.institution, item.degree)}
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
                  title="Delete education"
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
