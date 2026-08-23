'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, type ProjectFormValues } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { slugify, joinCSV, parseCSV } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FileUpload from '@/components/admin/FileUpload'
import type { Project } from '@/types'

const input = {
  width: '100%',
  background: '#1A1A1A',
  border: '1px solid #2C2C2C',
  borderRadius: '6px',
  padding: '10px 14px',
  color: '#F5F5F5',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'inherit',
  resize: 'vertical' as const,
}

const label = {
  display: 'block',
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#666',
  marginBottom: '6px',
}

const field = { marginBottom: '20px' }

export default function AdminProjectForm({ project }: { project?: Project }) {
  const router = useRouter()
  const isEdit = !!project
  const [saving, setSaving] = useState(false)
  const [heroUrl, setHeroUrl] = useState<string | null>(project?.hero_image_url ?? null)
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title ?? '',
      slug: project?.slug ?? '',
      short_desc: project?.short_desc ?? '',
      description: project?.description ?? '',
      problem: project?.problem ?? '',
      solution: project?.solution ?? '',
      architecture: project?.architecture ?? '',
      results: project?.results ?? '',
      challenges: project?.challenges ?? '',
      category: project?.category ?? 'AI / ML',
      technologies: project ? joinCSV(project.technologies) : '',
      github_url: project?.github_url ?? '',
      live_url: project?.live_url ?? '',
      project_date: project?.project_date ?? '',
      featured: project?.featured ?? false,
      published: project?.published ?? false,
    },
  })

  const title = watch('title')

  function autoSlug() {
    if (!isEdit) {
      setValue('slug', slugify(title), { shouldValidate: true })
    }
  }

  async function handleHeroUpload(file: File) {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'projects')
    formData.append('prefix', 'heroes')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) setHeroUrl(data.url)
    setUploading(false)
  }

  async function onSubmit(values: ProjectFormValues) {
    setSaving(true)
    const supabase = createClient()

    const payload = {
      title: values.title,
      slug: values.slug,
      short_desc: values.short_desc || null,
      description: values.description || null,
      problem: values.problem || null,
      solution: values.solution || null,
      architecture: values.architecture || null,
      results: values.results || null,
      challenges: values.challenges || null,
      category: values.category,
      technologies: values.technologies ? parseCSV(values.technologies) : [],
      github_url: values.github_url || null,
      live_url: values.live_url || null,
      project_date: values.project_date || null,
      featured: values.featured,
      published: values.published,
      hero_image_url: heroUrl,
    }

    if (isEdit) {
      await supabase.from('projects').update(payload).eq('id', project.id)
    } else {
      await supabase.from('projects').insert(payload)
    }

    setSaving(false)
    router.push('/admin/projects')
  }

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#F5F5F5' }}>
          {isEdit ? 'Edit Project' : 'New Project'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: '10px', padding: '28px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={field}>
              <label style={label}>Title *</label>
              <input {...register('title')} style={input} onBlur={autoSlug} />
              {errors.title && <p style={{ color: '#C96B46', fontSize: '12px', marginTop: '4px' }}>{errors.title.message}</p>}
            </div>
            <div style={field}>
              <label style={label}>Slug *</label>
              <input {...register('slug')} style={input} />
              {errors.slug && <p style={{ color: '#C96B46', fontSize: '12px', marginTop: '4px' }}>{errors.slug.message}</p>}
            </div>
          </div>

          <div style={field}>
            <label style={label}>Short Description</label>
            <input {...register('short_desc')} style={input} placeholder="One sentence summary" />
          </div>

          <div style={field}>
            <label style={label}>Category</label>
            <select {...register('category')} style={input}>
              {['AI / ML','Machine Learning','Full Stack','Tools','Security','Other'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={field}>
            <label style={label}>Technologies (comma-separated)</label>
            <input {...register('technologies')} style={input} placeholder="Python, React, PostgreSQL" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={field}>
              <label style={label}>GitHub URL</label>
              <input {...register('github_url')} style={input} placeholder="https://github.com/…" />
            </div>
            <div style={field}>
              <label style={label}>Live URL</label>
              <input {...register('live_url')} style={input} placeholder="https://…" />
            </div>
          </div>

          <div style={field}>
            <label style={label}>Project Date</label>
            <input type="date" {...register('project_date')} style={input} />
          </div>
        </div>

        {/* Long form fields */}
        <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: '10px', padding: '28px', marginBottom: '20px' }}>
          {(['description', 'problem', 'solution', 'architecture', 'results', 'challenges'] as const).map((f) => (
            <div style={field} key={f}>
              <label style={label}>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
              <textarea {...register(f)} style={{ ...input, minHeight: '100px' }} />
            </div>
          ))}
        </div>

        {/* Hero image */}
        <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: '10px', padding: '28px', marginBottom: '20px' }}>
          <FileUpload
            label="Hero Image"
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
            hint="JPG, PNG or WebP · Max 5MB"
            maxSize={5 * 1024 * 1024}
            onFileSelect={handleHeroUpload}
            currentUrl={heroUrl}
            onRemove={() => setHeroUrl(null)}
            uploading={uploading}
          />
        </div>

        {/* Toggles */}
        <div style={{
          background: '#1A1A1A', border: '1px solid #222', borderRadius: '10px',
          padding: '24px 28px', marginBottom: '24px',
          display: 'flex', gap: '32px',
        }}>
          {(['featured', 'published'] as const).map((key) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" {...register(key)} style={{ accentColor: '#B65C3A', width: '16px', height: '16px' }} />
              <span style={{ fontSize: '13px', color: '#888', textTransform: 'capitalize' }}>{key}</span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: saving ? '#333' : '#B65C3A', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '12px 24px', fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project'}
          </button>
          <a href="/admin/projects" style={{
            padding: '12px 20px', color: '#555', fontSize: '13px', textDecoration: 'none',
          }}>
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
