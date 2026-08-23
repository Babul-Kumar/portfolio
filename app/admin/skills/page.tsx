'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { skillSchema, type SkillFormValues } from '@/lib/validations'
import { Plus, Trash2 } from 'lucide-react'
import type { Skill } from '@/types'
import { FALLBACK_SKILLS } from '@/lib/data'
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
  fontSize: '10px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#666',
  marginBottom: '5px',
}

const CATEGORIES = ['Programming', 'AI / ML', 'Frontend', 'Backend', 'Database', 'DevOps & Tools', 'Tools']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

function AddSkillForm({ onAdd }: { onAdd: () => void }) {
  const [saving, setSaving] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: { category: 'Programming', level: 'Intermediate', featured: false, published: true },
  })

  async function onSubmit(values: SkillFormValues) {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('skills').insert(values)
      if (error) {
        toast.error(`Failed to add skill: ${error.message}`)
        setSaving(false)
        return
      }
      toast.success('Skill added')
      reset()
      setSaving(false)
      onAdd()
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
        border: '1px solid #282828',
        borderRadius: '10px',
        padding: '20px 24px',
        marginBottom: '28px',
      }}
    >
      <h3 style={{ color: '#F5F5F5', fontSize: '14px', marginBottom: '14px', fontWeight: 500 }}>
        Add New Technical Skill
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
        <div>
          <label style={label}>Skill Name *</label>
          <input {...register('name')} style={input} placeholder="e.g. PyTorch / Next.js" />
          {errors.name && <p style={{ color: '#E45D2C', fontSize: '11px', marginTop: '4px' }}>{errors.name.message}</p>}
        </div>
        <div>
          <label style={label}>Category</label>
          <select {...register('category')} style={input}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={label}>Proficiency</label>
          <select {...register('level')} style={input}>
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '12px', paddingBottom: '8px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              color: '#888',
              fontSize: '12px',
            }}
          >
            <input type="checkbox" {...register('featured')} style={{ accentColor: '#E45D2C' }} /> Featured
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          style={{
            background: '#E45D2C',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Plus size={14} /> {saving ? '…' : 'Add Skill'}
        </button>
      </div>
    </form>
  )
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('skills').select('*').order('category').order('sort_order')
      if (!error && data && data.length > 0) {
        setSkills(data)
      } else {
        setSkills(FALLBACK_SKILLS)
      }
      setLoading(false)
    } catch {
      setSkills(FALLBACK_SKILLS)
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    async function loadData() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from('skills').select('*').order('category').order('sort_order')
        if (active) {
          if (!error && data && data.length > 0) {
            setSkills(data)
          } else {
            setSkills(FALLBACK_SKILLS)
          }
          setLoading(false)
        }
      } catch {
        if (active) {
          setSkills(FALLBACK_SKILLS)
          setLoading(false)
        }
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [])

  async function deleteSkill(id: string, name: string, category?: string) {
    if (!confirm(`Delete skill "${name}"?`)) return
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('skills').delete().eq('id', id)
        if (error) {
          toast.error('Failed to delete skill')
          return
        }
      } else if (name && category) {
        await supabase.from('skills').delete().eq('name', name).eq('category', category)
      }
    } catch {
      // Ignored for non-uuid fallback item
    }

    toast.success('Skill deleted')
    setSkills((prev) => prev.filter((s) => s.id !== id))
  }

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  return (
    <div style={{ maxWidth: '900px' }}>
      <Toaster position="top-right" theme="dark" />
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F5F5F5', letterSpacing: '-0.02em' }}>
          Skills & Technologies
        </h1>
        <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
          {skills.length} technical skills across {Object.keys(grouped).length} categories
        </p>
      </div>

      <AddSkillForm onAdd={load} />

      {loading ? (
        <div style={{ color: '#666', fontSize: '14px', padding: '40px 0', textAlign: 'center' }}>
          Loading skills matrix…
        </div>
      ) : (
        Object.entries(grouped).map(([category, catSkills]) => (
          <div key={category} style={{ marginBottom: '28px' }}>
            <h3
              style={{
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#777',
                marginBottom: '12px',
                fontWeight: 600,
              }}
            >
              {category} <span style={{ color: '#555', fontWeight: 400 }}>({catSkills.length})</span>
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {catSkills.map((skill) => (
                <div
                  key={skill.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#1A1A1A',
                    border: `1px solid ${skill.featured ? 'rgba(228,93,44,0.4)' : '#242424'}`,
                    borderRadius: '6px',
                    padding: '8px 14px',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#F5F5F5', fontWeight: skill.featured ? 500 : 400 }}>
                    {skill.name}
                  </span>
                  <span style={{ fontSize: '11px', color: '#666', background: '#141414', padding: '1px 6px', borderRadius: '4px' }}>
                    {skill.level}
                  </span>
                  <button
                    onClick={() => deleteSkill(skill.id, skill.name, category)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#444',
                      padding: '0 0 0 4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Delete skill"
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#E45D2C')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
                  >
                    <Trash2 size={12} />
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
