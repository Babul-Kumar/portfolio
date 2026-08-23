'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { achievementSchema, type AchievementFormValues } from '@/lib/validations'
import { slugify } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import type { Achievement } from '@/types'
import { formatDate } from '@/lib/utils'

const input = { width: '100%', background: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: '6px', padding: '10px 14px', color: '#F5F5F5', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }
const label = { display: 'block', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#666', marginBottom: '6px' }

function AchievementForm({ achievement, onSave }: { achievement?: Achievement; onSave: () => void }) {
  const isEdit = !!achievement
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AchievementFormValues>({
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

  const title = watch('title')

  async function onSubmit(values: AchievementFormValues) {
    setSaving(true)
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
    if (isEdit) {
      await supabase.from('achievements').update(payload).eq('id', achievement.id)
    } else {
      await supabase.from('achievements').insert(payload)
    }
    setSaving(false)
    onSave()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: '10px', padding: '28px', marginBottom: '24px' }}>
      <h2 style={{ color: '#F5F5F5', fontSize: '16px', marginBottom: '20px', fontWeight: 500 }}>{isEdit ? 'Edit Achievement' : 'New Achievement'}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div><label style={label}>Title *</label><input {...register('title')} style={input} onBlur={() => !isEdit && setValue('slug', slugify(title))} />{errors.title && <p style={{ color: '#C96B46', fontSize: '12px' }}>{errors.title.message}</p>}</div>
        <div><label style={label}>Slug *</label><input {...register('slug')} style={input} /></div>
        <div><label style={label}>Organization</label><input {...register('organization')} style={input} /></div>
        <div><label style={label}>Category</label>
          <select {...register('category')} style={input}>
            {['Hackathon', 'Competition', 'Award', 'Certification', 'Other'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><label style={label}>Date</label><input type="date" {...register('date')} style={input} /></div>
        <div><label style={label}>Rank / Position</label><input {...register('rank')} style={input} placeholder="e.g. 4th Place, Winner" /></div>
      </div>
      <div style={{ marginBottom: '16px' }}><label style={label}>Description</label><textarea {...register('description')} style={{ ...input, minHeight: '80px', resize: 'vertical' as const }} /></div>
      <div style={{ marginBottom: '20px' }}><label style={label}>Verification URL</label><input {...register('verification_url')} style={input} /></div>
      <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
        {(['featured', 'published'] as const).map((k) => (
          <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#888', fontSize: '13px' }}>
            <input type="checkbox" {...register(k)} style={{ accentColor: '#B65C3A' }} />
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </label>
        ))}
      </div>
      <button type="submit" disabled={saving} style={{ background: '#B65C3A', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }}>
        {saving ? 'Saving…' : isEdit ? 'Save' : 'Create'}
      </button>
    </form>
  )
}

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Achievement | undefined>()

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('achievements').select('*').order('date', { ascending: false })
    setAchievements(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function deleteItem(id: string) {
    if (!confirm('Delete?')) return
    const supabase = createClient()
    await supabase.from('achievements').delete().eq('id', id)
    setAchievements((prev) => prev.filter((a) => a.id !== id))
  }

  async function togglePublished(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('achievements').update({ published: !current }).eq('id', id)
    setAchievements((prev) => prev.map((a) => a.id === id ? { ...a, published: !current } : a))
  }

  function handleSave() {
    setShowForm(false)
    setEditing(undefined)
    load()
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#F5F5F5' }}>Achievements</h1>
        <button onClick={() => { setEditing(undefined); setShowForm(true) }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#B65C3A', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
          <Plus size={15} /> Add Achievement
        </button>
      </div>

      {(showForm || editing) && <AchievementForm achievement={editing} onSave={handleSave} />}

      {loading ? <div style={{ color: '#555' }}>Loading…</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {achievements.map((a) => (
            <div key={a.id} style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: '8px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#F5F5F5', fontSize: '14px', fontWeight: 500 }}>{a.title}</div>
                <div style={{ color: '#555', fontSize: '12px', marginTop: '2px' }}>{a.organization} · {formatDate(a.date)} · {a.category}{a.rank ? ` · ${a.rank}` : ''}</div>
              </div>
              <button onClick={() => togglePublished(a.id, a.published)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: a.published ? '#4A7C59' : '#555', padding: '8px' }}>
                {a.published ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => { setEditing(a); setShowForm(true); window.scrollTo(0, 0) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '8px' }}>
                <Pencil size={14} />
              </button>
              <button onClick={() => deleteItem(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '8px' }}
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
