'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { experienceSchema, type ExperienceFormValues } from '@/lib/validations'
import { parseCSV, joinCSV, formatDate, sanitizeDateForDb, formatDateForInput } from '@/lib/utils'
import { Plus, Trash2, Pencil, Briefcase, Eye, EyeOff, ExternalLink } from 'lucide-react'
import type { Experience } from '@/types'
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
      start_date: formatDateForInput(item?.start_date),
      end_date: formatDateForInput(item?.end_date),
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
        start_date: sanitizeDateForDb(values.start_date),
        end_date: values.is_current ? null : sanitizeDateForDb(values.end_date),
        is_current: values.is_current,
        description: values.description || null,
        technologies: values.technologies ? parseCSV(values.technologies) : [],
        company_url: values.company_url || null,
        location: values.location || null,
        type: values.type,
        published: values.published,
      }

      if (isEdit) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)
        if (isUuid) {
          const { error } = await supabase.from('experience').update(payload).eq('id', item.id)
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
      fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'experience' }),
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
        <h3 style={{ color: '#F5F5F5', fontSize: '15px', fontWeight: 600, margin: 0 }}>
          {isEdit ? 'Edit Work Experience' : 'Add Work Experience'}
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
          <label style={labelStyle}>Company Name *</label>
          <input {...register('company')} style={inputStyle} placeholder="e.g. AI Research Lab" />
        </div>
        <div>
          <label style={labelStyle}>Role Title *</label>
          <input {...register('role')} style={inputStyle} placeholder="e.g. Full-Stack Engineer" />
        </div>
        <div>
          <label style={labelStyle}>Employment Type</label>
          <select {...register('type')} style={inputStyle}>
            {['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Location / Remote</label>
          <input {...register('location')} style={inputStyle} placeholder="e.g. Remote / Bangalore" />
        </div>
        <div>
          <label style={labelStyle}>Start Date</label>
          <input type="date" {...register('start_date')} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>End Date</label>
          <input type="date" {...register('end_date')} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Company Website URL</label>
          <input {...register('company_url')} style={inputStyle} placeholder="https://..." />
        </div>
        <div>
          <label style={labelStyle}>Technologies Used (Comma Separated)</label>
          <input {...register('technologies')} style={inputStyle} placeholder="Next.js, TypeScript, PostgreSQL, Docker" />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Responsibilities, Impact & Metrics</label>
        <textarea
          {...register('description')}
          style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' as const }}
          placeholder="Detailed accomplishments, features engineered, and business impact..."
        />
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#D1D5DB', fontSize: '13px' }}>
          <input type="checkbox" {...register('is_current')} style={{ accentColor: '#E45D2C' }} /> Currently Working Here
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
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Experience'}
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

export default function AdminExperiencePage() {
  const [items, setItems] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Experience | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null)

  async function load() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('experience').select('*').order('sort_order', { ascending: true })
      if (!error && Array.isArray(data)) {
        setItems(data)
      } else {
        setItems([])
      }
      setLoading(false)
    } catch {
      setItems([])
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
          if (!error && Array.isArray(data)) {
            setItems(data)
          } else {
            setItems([])
          }
          setLoading(false)
        }
      } catch {
        if (active) {
          setItems([])
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
        const { error } = await supabase.from('experience').delete().eq('id', deleteTarget.id)
        if (error) {
          toast.error(`Delete failed: ${error.message}`)
          return
        }
      } else {
        await supabase.from('experience').delete().eq('company', deleteTarget.company)
      }
      fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'experience' }),
      }).catch(() => {})
    } catch {
      // Ignore
    }

    toast.success('Experience entry deleted')
    setItems((prev) => prev.filter((e) => e.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  async function togglePublished(id: string, current: boolean) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('experience').update({ published: !current }).eq('id', id)
        if (error) {
          toast.error('Update failed')
        } else {
          toast.success(current ? 'Unpublished' : 'Published')
          fetch('/api/admin/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'experience' }),
          }).catch(() => {})
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
            Work Experience
          </h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px', margin: 0 }}>
            {items.length} engineering roles and industry experience records
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
        <div style={{ color: '#6B7280', fontSize: '13px', padding: '40px 0', textAlign: 'center' }}>
          Loading work experience…
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
          <p style={{ fontSize: '15px', color: '#AAA', marginBottom: '8px' }}>No experience entries yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((exp) => (
            <div
              key={exp.id}
              style={{
                background: '#101318',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'border-color 0.15s',
              }}
              className="admin-hover-row"
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10B981',
                    flexShrink: 0,
                  }}
                >
                  <Briefcase size={22} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#F5F5F5' }}>
                      {exp.role}
                    </span>
                    <span style={{ color: '#E45D2C', fontWeight: 500, fontSize: '13px' }}>
                      @{exp.company}
                    </span>
                    <StatusBadge type="category" label={exp.type} />
                    {exp.is_current && <StatusBadge type="published" label="Current" />}
                  </div>

                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '3px', marginBottom: '8px' }}>
                    {exp.location && <span>{exp.location} · </span>}
                    {exp.start_date && (
                      <span>{formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date ?? '')}</span>
                    )}
                  </div>

                  {exp.description && (
                    <p style={{ fontSize: '12px', color: '#D1D5DB', lineHeight: 1.5, margin: '0 0 10px' }}>
                      {exp.description}
                    </p>
                  )}

                  {exp.technologies && exp.technologies.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {exp.technologies.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#151921',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#9CA3AF',
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {exp.company_url && (
                  <a
                    href={exp.company_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#9CA3AF', padding: '6px' }}
                    title="Visit company website"
                  >
                    <ExternalLink size={15} />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => togglePublished(exp.id, exp.published)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    color: exp.published ? '#10B981' : '#6B7280',
                    cursor: 'pointer',
                    padding: '6px',
                  }}
                  title={exp.published ? 'Unpublish' : 'Publish'}
                >
                  {exp.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditing(exp)
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
                  title="Edit experience"
                >
                  <Pencil size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(exp)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '6px',
                    color: '#EF4444',
                    cursor: 'pointer',
                    padding: '6px',
                  }}
                  title="Delete experience"
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
        title="Delete Experience Entry"
        description="Are you sure you want to remove this work experience entry from your portfolio?"
        itemName={`${deleteTarget?.role} at ${deleteTarget?.company}`}
        confirmLabel="Delete Experience"
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
