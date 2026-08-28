'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { skillSchema, type SkillFormValues } from '@/lib/validations'
import { Plus, Trash2, Star } from 'lucide-react'
import type { Skill } from '@/types'
import { toast, Toaster } from 'sonner'
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
  fontSize: '10px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#8A8F98',
  fontWeight: 600,
  marginBottom: '5px',
}

const CATEGORIES = [
  'Programming',
  'AI / ML',
  'Frontend',
  'Backend',
  'Database',
  'DevOps & Tools',
  'Tools',
]
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
      toast.success('Skill added to matrix')
      fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'skills' }),
      }).catch(() => {})
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
        background: '#101318',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '28px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#F5F5F5',
          fontSize: '14px',
          marginBottom: '14px',
          fontWeight: 600,
        }}
      >
        <Plus size={16} style={{ color: '#E45D2C' }} />
        <span>Add New Skill to Matrix</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr)) auto',
          gap: '12px',
          alignItems: 'end',
        }}
      >
        <div>
          <label style={labelStyle}>Skill Name *</label>
          <input {...register('name')} style={inputStyle} placeholder="e.g. PyTorch / Next.js" />
          {errors.name && (
            <p style={{ color: '#E45D2C', fontSize: '11px', marginTop: '4px' }}>
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label style={labelStyle}>Category</label>
          <select {...register('category')} style={inputStyle}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Proficiency Level</label>
          <select {...register('level')} style={inputStyle}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
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
              color: '#D1D5DB',
              fontSize: '12px',
            }}
          >
            <input type="checkbox" {...register('featured')} style={{ accentColor: '#E45D2C' }} />{' '}
            Featured
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            background: saving ? '#333' : 'linear-gradient(135deg, #E45D2C 0%, #FF8A3D 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(228, 93, 44, 0.25)',
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
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null)

  async function load() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category')
        .order('sort_order')
      if (!error && Array.isArray(data)) {
        setSkills(data)
      } else {
        setSkills([])
      }
      setLoading(false)
    } catch {
      setSkills([])
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    async function loadData() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('category')
          .order('sort_order')
        if (active) {
          if (!error && Array.isArray(data)) {
            setSkills(data)
          } else {
            setSkills([])
          }
          setLoading(false)
        }
      } catch {
        if (active) {
          setSkills([])
          setLoading(false)
        }
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [])

  async function confirmDeleteSkill() {
    if (!deleteTarget) return
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      deleteTarget.id
    )
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase.from('skills').delete().eq('id', deleteTarget.id)
        if (error) {
          toast.error('Failed to delete skill')
          return
        }
      } else if (deleteTarget.name && deleteTarget.category) {
        await supabase
          .from('skills')
          .delete()
          .eq('name', deleteTarget.name)
          .eq('category', deleteTarget.category)
      }
      fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'skills' }),
      }).catch(() => {})
    } catch {
      // Ignore
    }

    toast.success('Skill deleted')
    setSkills((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <Toaster position="top-right" theme="dark" />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
            Skills & Competency Matrix
          </h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px', margin: 0 }}>
            {skills.length} technical skills across {Object.keys(grouped).length} categories
          </p>
        </div>
      </div>

      <AddSkillForm onAdd={load} />

      {loading ? (
        <div style={{ color: '#6B7280', fontSize: '13px', padding: '40px 0', textAlign: 'center' }}>
          Loading skills matrix…
        </div>
      ) : (
        Object.entries(grouped).map(([category, catSkills]) => (
          <div
            key={category}
            style={{
              background: '#101318',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '20px 24px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <h3
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#E45D2C',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono, monospace)',
                  margin: 0,
                }}
              >
                {category}
              </h3>
              <span style={{ fontSize: '11px', color: '#6B7280' }}>
                {catSkills.length} skills
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {catSkills.map((skill) => (
                <div
                  key={skill.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: '#0D0F14',
                    border: `1px solid ${
                      skill.featured
                        ? 'rgba(228, 93, 44, 0.35)'
                        : 'rgba(255, 255, 255, 0.08)'
                    }`,
                    fontSize: '12px',
                    color: '#F5F5F5',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{skill.name}</span>

                  {skill.level && (
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#9CA3AF',
                        fontFamily: 'var(--font-mono, monospace)',
                        background: 'rgba(255, 255, 255, 0.04)',
                        padding: '1px 5px',
                        borderRadius: '4px',
                      }}
                    >
                      {skill.level}
                    </span>
                  )}

                  {skill.featured && (
                    <Star size={11} fill="#E45D2C" style={{ color: '#E45D2C' }} />
                  )}

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(skill)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#6B7280',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
                    aria-label={`Delete ${skill.name}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Skill"
        description="Are you sure you want to remove this skill from your technical matrix?"
        itemName={deleteTarget?.name}
        confirmLabel="Delete Skill"
        onConfirm={confirmDeleteSkill}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
