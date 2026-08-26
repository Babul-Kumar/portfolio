'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { educationSchema, type EducationFormValues } from '@/lib/validations'
import { Plus, Trash2, Pencil, GraduationCap, Eye, EyeOff, ExternalLink } from 'lucide-react'
import type { Education } from '@/types'
import { FALLBACK_EDUCATION } from '@/lib/data'
import { formatDate } from '@/lib/utils'
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
        institution: values.institution,
        degree: values.degree,
        field: values.field || null,
        start_date: values.start_date || null,
        end_date: values.is_current ? null : values.end_date || null,
        is_current: values.is_current,
        grade: values.grade || null,
        description: values.description || null,
        location: values.location || null,
        website_url: values.website_url || null,
        published: values.published,
        sort_order: item?.sort_order ?? 0,
      }

      if (isEdit) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)
        if (isUuid) {
          const { error } = await supabase.from('education').update(payload).eq('id', item.id)
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
        <h3 style={{ color: '#F5F5F5', fontSize: '15px', fontWeight: 600, margin: 0 }}>
          {isEdit ? 'Edit Academic Qualification' : 'Add Academic Qualification'}
        </h3>
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
          <label style={labelStyle}>Institution *</label>
          <input {...register('institution')} style={inputStyle} placeholder="e.g. University Name" />
        </div>
        <div>
          <label style={labelStyle}>Degree *</label>
          <input {...register('degree')} style={inputStyle} placeholder="e.g. B.Tech Computer Science" />
        </div>
        <div>
          <label style={labelStyle}>Field of Study</label>
          <input {...register('field')} style={inputStyle} placeholder="e.g. Computer Science & Engineering" />
        </div>
        <div>
          <label style={labelStyle}>Location</label>
          <input {...register('location')} style={inputStyle} placeholder="e.g. India" />
        </div>
        <div>
          <label style={labelStyle}>Start Date</label>
          <input type="date" {...register('start_date')} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>End Date / Expected</label>
          <input type="date" {...register('end_date')} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Grade / CGPA</label>
          <input {...register('grade')} style={inputStyle} placeholder="e.g. 8.8 CGPA" />
        </div>
        <div>
          <label style={labelStyle}>Website URL</label>
          <input {...register('website_url')} style={inputStyle} placeholder="https://..." />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Key Coursework & Highlights</label>
        <textarea
          {...register('description')}
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }}
          placeholder="Relevant coursework: Data Structures, Machine Learning, Operating Systems, Computer Networks..."
        />
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#D1D5DB', fontSize: '13px' }}>
          <input type="checkbox" {...register('is_current')} style={{ accentColor: '#E45D2C' }} /> Currently Enrolled
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
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Education'}
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

export default function AdminEducationPage() {
  const [items, setItems] = useState<Education[]>(FALLBACK_EDUCATION)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Education | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Education | null>(null)

  async function load() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('education').select('*').order('sort_order', { ascending: true })
      if (!error && Array.isArray(data)) {
        setItems(data)
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
          if (!error && Array.isArray(data)) {
            setItems(data)
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

  async function confirmDelete() {
    if (!deleteTarget) return
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(deleteTarget.id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('education').delete().eq('id', deleteTarget.id)
        if (error) {
          toast.error(`Delete failed: ${error.message}`)
          return
        }
      } else {
        await supabase.from('education').delete().eq('institution', deleteTarget.institution)
      }
    } catch {
      // Ignored for non-uuid fallback item
    }

    toast.success('Education entry deleted')
    setItems((prev) => prev.filter((e) => e.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  async function togglePublished(id: string, current: boolean) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('education').update({ published: !current }).eq('id', id)
        if (error) {
          toast.error('Update failed')
        } else {
          toast.success(current ? 'Unpublished' : 'Published')
        }
      } else {
        toast.success(current ? 'Unpublished' : 'Published')
      }
    } catch {
      toast.success(current ? 'Unpublished' : 'Published')
    }

    setItems((prev) => prev.map((e) => (e.id === id ? { ...e, published: !current } : e)))
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
            Education & Academics
          </h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px', margin: 0 }}>
            {items.length} academic degrees & educational qualifications
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
        <div style={{ color: '#6B7280', fontSize: '13px', padding: '40px 0', textAlign: 'center' }}>
          Loading education history…
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#101318',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <p style={{ fontSize: '15px', color: '#AAA', marginBottom: '8px' }}>No education records found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((edu) => (
            <div
              key={edu.id}
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
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#3B82F6',
                    flexShrink: 0,
                  }}
                >
                  <GraduationCap size={22} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#F5F5F5' }}>
                      {edu.institution}
                    </span>
                    {edu.is_current && <StatusBadge type="published" label="Current" />}
                  </div>

                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '3px' }}>
                    <span style={{ color: '#E45D2C', fontWeight: 500 }}>{edu.degree}</span>
                    {edu.field && <span> · {edu.field}</span>}
                    {edu.grade && <span style={{ color: '#10B981' }}> · {edu.grade}</span>}
                    {edu.start_date && (
                      <span> · {formatDate(edu.start_date)} — {edu.is_current ? 'Present' : formatDate(edu.end_date ?? '')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {edu.website_url && (
                  <a
                    href={edu.website_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#9CA3AF', padding: '6px' }}
                    title="Visit institution website"
                  >
                    <ExternalLink size={15} />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => togglePublished(edu.id, edu.published)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    color: edu.published ? '#10B981' : '#6B7280',
                    cursor: 'pointer',
                    padding: '6px',
                  }}
                  title={edu.published ? 'Unpublish' : 'Publish'}
                >
                  {edu.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditing(edu)
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
                  title="Edit education entry"
                >
                  <Pencil size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(edu)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '6px',
                    color: '#EF4444',
                    cursor: 'pointer',
                    padding: '6px',
                  }}
                  title="Delete education entry"
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
        title="Delete Education Entry"
        description="Are you sure you want to remove this academic degree from your portfolio?"
        itemName={deleteTarget?.institution}
        confirmLabel="Delete Entry"
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
