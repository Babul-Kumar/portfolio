'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { skillSchema, type SkillFormValues } from '@/lib/validations'
import { Plus, Trash2 } from 'lucide-react'
import type { Skill } from '@/types'

const input = { width: '100%', background: '#111', border: '1px solid #2C2C2C', borderRadius: '6px', padding: '10px 14px', color: '#F5F5F5', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }
const label = { display: 'block', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#555', marginBottom: '5px' }

const CATEGORIES = ['Programming', 'AI / ML', 'Frontend', 'Backend', 'Database', 'DevOps', 'Tools']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

function AddSkillForm({ onAdd }: { onAdd: () => void }) {
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: { category: 'Programming', level: 'Intermediate', featured: false, published: true },
  })

  async function onSubmit(values: SkillFormValues) {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('skills').insert(values)
    reset()
    setSaving(false)
    onAdd()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
      <h3 style={{ color: '#F5F5F5', fontSize: '14px', marginBottom: '16px', fontWeight: 500 }}>Add Skill</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
        <div>
          <label style={label}>Name *</label>
          <input {...register('name')} style={input} placeholder="e.g. Python" />
          {errors.name && <p style={{ color: '#C96B46', fontSize: '11px' }}>{errors.name.message}</p>}
        </div>
        <div>
          <label style={label}>Category</label>
          <select {...register('category')} style={input}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Level</label>
          <select {...register('level')} style={input}>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '12px', paddingBottom: '2px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#666', fontSize: '12px' }}>
            <input type="checkbox" {...register('featured')} style={{ accentColor: '#B65C3A' }} /> Featured
          </label>
        </div>
        <button type="submit" disabled={saving} style={{ background: '#B65C3A', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 16px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={13} /> {saving ? '…' : 'Add'}
        </button>
      </div>
    </form>
  )
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('skills').select('*').order('category').order('sort_order')
    setSkills(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function deleteSkill(id: string) {
    if (!confirm('Delete skill?')) return
    const supabase = createClient()
    await supabase.from('skills').delete().eq('id', id)
    setSkills((prev) => prev.filter((s) => s.id !== id))
  }

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#F5F5F5', marginBottom: '32px' }}>Skills</h1>
      <AddSkillForm onAdd={load} />

      {loading ? <div style={{ color: '#555' }}>Loading…</div> : (
        Object.entries(grouped).map(([category, catSkills]) => (
          <div key={category} style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: '10px' }}>
              {category} <span style={{ color: '#333' }}>({catSkills.length})</span>
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {catSkills.map((skill) => (
                <div key={skill.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#1A1A1A', border: `1px solid ${skill.featured ? 'rgba(182,92,58,0.4)' : '#222'}`,
                  borderRadius: '6px', padding: '6px 12px',
                }}>
                  <span style={{ fontSize: '13px', color: '#F5F5F5' }}>{skill.name}</span>
                  <span style={{ fontSize: '10px', color: '#444' }}>{skill.level}</span>
                  <button onClick={() => deleteSkill(skill.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: '0 0 0 4px', display: 'flex' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#C96B46')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#333')}>
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
