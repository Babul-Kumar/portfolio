'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { experienceSchema, type ExperienceFormValues } from '@/lib/validations'
import { parseCSV, joinCSV, formatDate } from '@/lib/utils'
import { Plus, Trash2, Pencil } from 'lucide-react'
import type { Experience } from '@/types'

const inp = { width: '100%', background: '#111', border: '1px solid #2C2C2C', borderRadius: '6px', padding: '10px 14px', color: '#F5F5F5', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }
const lbl = { display: 'block', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#555', marginBottom: '5px' }

function ExperienceForm({ item, onSave, onCancel }: { item?: Experience; onSave: () => void; onCancel: () => void }) {
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
    if (isEdit) await supabase.from('experience').update(payload).eq('id', item.id)
    else await supabase.from('experience').insert(payload)
    setSaving(false)
    onSave()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ background: '#1A1A1A', border: '1px solid #333', borderRadius: '10px', padding: '24px', marginBottom: '20px' }}>
      <h3 style={{ color: '#F5F5F5', fontSize: '14px', marginBottom: '16px', fontWeight: 500 }}>{isEdit ? 'Edit' : 'Add'} Experience</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div><label style={lbl}>Company *</label><input {...register('company')} style={inp} /></div>
        <div><label style={lbl}>Role *</label><input {...register('role')} style={inp} /></div>
        <div><label style={lbl}>Start Date</label><input type="date" {...register('start_date')} style={inp} /></div>
        <div><label style={lbl}>End Date</label><input type="date" {...register('end_date')} style={inp} /></div>
        <div><label style={lbl}>Location</label><input {...register('location')} style={inp} /></div>
        <div><label style={lbl}>Type</label>
          <select {...register('type')} style={inp}>
            {['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: '12px' }}><label style={lbl}>Technologies</label><input {...register('technologies')} style={inp} placeholder="Python, React, PostgreSQL" /></div>
      <div style={{ marginBottom: '12px' }}><label style={lbl}>Description</label><textarea {...register('description')} style={{ ...inp, minHeight: '80px', resize: 'vertical' as const }} /></div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#666', fontSize: '12px', marginBottom: '16px' }}>
        <input type="checkbox" {...register('is_current')} style={{ accentColor: '#B65C3A' }} /> Currently working here
      </label>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" disabled={saving} style={{ background: '#B65C3A', color: '#fff', border: 'none', borderRadius: '6px', padding: '9px 18px', fontSize: '12px', cursor: 'pointer' }}>
          {saving ? 'Saving…' : isEdit ? 'Save' : 'Add'}
        </button>
        <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', color: '#555', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
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
    const supabase = createClient()
    const { data } = await supabase.from('experience').select('*').order('sort_order')
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#F5F5F5' }}>Experience</h1>
        <button onClick={() => { setEditing(undefined); setShowForm(true) }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#B65C3A', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
          <Plus size={15} /> Add
        </button>
      </div>

      {(showForm || editing) && (
        <ExperienceForm
          item={editing}
          onSave={() => { setShowForm(false); setEditing(undefined); load() }}
          onCancel={() => { setShowForm(false); setEditing(undefined) }}
        />
      )}

      {loading ? <div style={{ color: '#555' }}>Loading…</div> : items.length === 0 ? (
        <div style={{ color: '#555', textAlign: 'center', padding: '40px' }}>No experience entries yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((item) => (
            <div key={item.id} style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: '8px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#F5F5F5', fontSize: '14px', fontWeight: 500 }}>{item.role}</div>
                <div style={{ color: '#888', fontSize: '13px', marginTop: '2px' }}>{item.company} · {item.type}</div>
                <div style={{ color: '#555', fontSize: '12px', marginTop: '2px' }}>
                  {formatDate(item.start_date)} — {item.is_current ? 'Present' : formatDate(item.end_date)}
                  {item.location ? ` · ${item.location}` : ''}
                </div>
              </div>
              <button onClick={() => { setEditing(item); setShowForm(true); window.scrollTo(0, 0) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '8px' }}><Pencil size={14} /></button>
              <button onClick={async () => { if (!confirm('Delete?')) return; const s = createClient(); await s.from('experience').delete().eq('id', item.id); load() }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '8px' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#C96B46')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
