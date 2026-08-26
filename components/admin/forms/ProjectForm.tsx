'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  projectSchema,
  PROJECT_CATEGORIES,
  type ProjectFormValues,
} from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { slugify, joinCSV, parseCSV } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import FileUpload from '@/components/admin/FileUpload'
import GitHubAiUploader from '@/components/admin/GitHubAiUploader'
import type { Project, GitHubProjectAnalysis } from '@/types'
import { toast, Toaster } from 'sonner'
import { uploadFileFromBrowser } from '@/lib/supabase/storage-client'
import {
  Save,
  FolderKanban,
  Code2,
  FileText,
} from 'lucide-react'

const inputStyle = {
  width: '100%',
  background: '#0D0F14',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  padding: '10px 14px',
  color: '#F5F5F5',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
  resize: 'vertical' as const,
  transition: 'border-color 0.15s',
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

const sectionStyle = {
  background: '#101318',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
}

export default function AdminProjectForm({ project }: { project?: Project }) {
  const router = useRouter()
  const isEdit = !!project
  const [saving, setSaving] = useState(false)
  const [heroUrl, setHeroUrl] = useState<string | null>(project?.hero_image_url ?? null)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProjectFormValues>({
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
      category: project?.category ?? 'AI & Machine Learning',
      technologies: project ? joinCSV(project.technologies) : '',
      github_url: project?.github_url ?? '',
      live_url: project?.live_url ?? '',
      project_date: project?.project_date ?? '',
      featured: project?.featured ?? false,
      published: project?.published ?? false,
    },
  })

  const checkHasExistingData = useCallback(() => {
    const title = getValues('title')
    const desc = getValues('description')
    const shortDesc = getValues('short_desc')
    return Boolean(title?.trim() || desc?.trim() || shortDesc?.trim())
  }, [getValues])

  function autoSlug() {
    const curTitle = getValues('title')
    if (!isEdit && curTitle) {
      setValue('slug', slugify(curTitle), { shouldValidate: true })
    }
  }

  function handleApplyAiAnalysis(data: GitHubProjectAnalysis, mode: 'all' | 'empty-only') {
    const applyString = (field: keyof ProjectFormValues, val: string | null | undefined) => {
      if (!val) return
      if (mode === 'all') {
        setValue(field, val, { shouldValidate: true })
      } else {
        const cur = getValues(field)
        if (!cur || (typeof cur === 'string' && !cur.trim())) {
          setValue(field, val, { shouldValidate: true })
        }
      }
    }

    applyString('title', data.title)
    applyString('slug', data.slug)
    applyString('category', data.category)
    applyString('short_desc', data.short_desc)
    applyString('description', data.description)
    applyString('problem', data.problem)
    applyString('solution', data.solution)
    applyString('architecture', data.architecture)
    applyString('results', data.results)
    applyString('challenges', data.challenges)
    if (data.technologies && data.technologies.length > 0) {
      applyString('technologies', joinCSV(data.technologies))
    }
    applyString('github_url', data.github_url)
    applyString('live_url', data.live_url)
    applyString('project_date', data.project_date)

    if (data.preview_image_url && !heroUrl) {
      setHeroUrl(data.preview_image_url)
    }
  }

  async function handleHeroUpload(file: File) {
    setUploading(true)
    try {
      const result = await uploadFileFromBrowser('projects', file, 'heroes')
      if (result.url) {
        setHeroUrl(result.url)
        toast.success('Hero image uploaded')
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(values: ProjectFormValues) {
    setSaving(true)
    try {
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

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        project?.id ?? ''
      )

      if (isEdit && isUuid) {
        const { data: existing } = await supabase
          .from('projects')
          .select('id')
          .eq('id', project!.id)
          .single()
        if (existing) {
          const { error } = await supabase.from('projects').update(payload).eq('id', project!.id)
          if (error) {
            toast.error(`Update failed: ${error.message}`)
            setSaving(false)
            return
          }
        } else {
          const { error } = await supabase.from('projects').insert(payload)
          if (error) {
            toast.error(`Save failed: ${error.message}`)
            setSaving(false)
            return
          }
        }
      } else if (isEdit) {
        const { data: existing } = await supabase
          .from('projects')
          .select('id')
          .eq('slug', payload.slug)
          .single()
        if (existing) {
          const { error } = await supabase.from('projects').update(payload).eq('id', existing.id)
          if (error) {
            toast.error(`Update failed: ${error.message}`)
            setSaving(false)
            return
          }
        } else {
          const { error } = await supabase.from('projects').insert(payload)
          if (error) {
            toast.error(`Save failed: ${error.message}`)
            setSaving(false)
            return
          }
        }
      } else {
        const { error } = await supabase.from('projects').insert(payload)
        if (error) {
          toast.error(`Insert failed: ${error.message}`)
          setSaving(false)
          return
        }
      }

      // Invalidate cache and revalidate public project routes
      try {
        await fetch('/api/admin/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'projects', slug: payload.slug }),
        })
      } catch {
        // Non-blocking
      }

      toast.success(isEdit ? 'Project updated successfully' : 'Project created successfully')
      setTimeout(() => {
        router.push('/admin/projects')
        router.refresh()
      }, 500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save project'
      toast.error(message)
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
            {isEdit ? 'Edit Engineering Project' : 'New Engineering Project'}
          </h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px', margin: 0 }}>
            {isEdit
              ? `Editing /${project?.slug}`
              : 'Create a showcase project or auto-import metadata from GitHub with AI'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={saving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: saving ? '#333' : 'linear-gradient(135deg, #E45D2C 0%, #FF8A3D 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(228, 93, 44, 0.25)',
            transition: 'all 0.15s',
          }}
        >
          <Save size={15} />
          {saving ? 'Saving Project…' : isEdit ? 'Update Project' : 'Save Project'}
        </button>
      </div>

      {/* 1. AI GitHub Repository Import Tool */}
      <GitHubAiUploader
        onApplyAnalysis={handleApplyAiAnalysis}
        hasExistingData={checkHasExistingData}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 2. Core Project Information */}
        <div style={sectionStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#F5F5F5',
              marginBottom: '16px',
            }}
          >
            <FolderKanban size={16} style={{ color: '#E45D2C' }} />
            <span>Core Information</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div>
              <label style={labelStyle}>Project Title *</label>
              <input
                {...register('title')}
                style={inputStyle}
                onBlur={autoSlug}
                placeholder="e.g. Smart System Monitor"
              />
              {errors.title && (
                <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label style={labelStyle}>Slug *</label>
              <input {...register('slug')} style={inputStyle} placeholder="smart-system-monitor" />
              {errors.slug && (
                <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px' }}>
                  {errors.slug.message}
                </p>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div>
              <label style={labelStyle}>Category *</label>
              <select {...register('category')} style={inputStyle}>
                {PROJECT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Project Release Date</label>
              <input type="date" {...register('project_date')} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Short Elevator Pitch (Hero & Card Previews)</label>
            <input
              {...register('short_desc')}
              style={inputStyle}
              placeholder="Concise 1-2 sentence overview of capability and impact"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Technologies (Comma Separated)</label>
            <input
              {...register('technologies')}
              style={inputStyle}
              placeholder="Next.js, TypeScript, Tailwind CSS, Python, PyTorch, Supabase"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <label style={labelStyle}>GitHub Repository URL</label>
              <input
                {...register('github_url')}
                style={inputStyle}
                placeholder="https://github.com/username/repository"
              />
            </div>
            <div>
              <label style={labelStyle}>Live Demo / Production URL</label>
              <input {...register('live_url')} style={inputStyle} placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* 3. Deep Case Study Narrative */}
        <div style={sectionStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#F5F5F5',
              marginBottom: '16px',
            }}
          >
            <FileText size={16} style={{ color: '#E45D2C' }} />
            <span>Deep Case Study Narrative</span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Comprehensive Overview</label>
            <textarea
              {...register('description')}
              style={{ ...inputStyle, minHeight: '90px' }}
              placeholder="Full narrative covering workflow, architecture, and capabilities…"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div>
              <label style={labelStyle}>Problem Statement</label>
              <textarea
                {...register('problem')}
                style={{ ...inputStyle, minHeight: '80px' }}
                placeholder="What pain point or engineering problem does this solve?"
              />
            </div>
            <div>
              <label style={labelStyle}>Solution & Technical Approach</label>
              <textarea
                {...register('solution')}
                style={{ ...inputStyle, minHeight: '80px' }}
                placeholder="How does this codebase implement the solution?"
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>System Architecture & Data Flow</label>
            <textarea
              {...register('architecture')}
              style={{ ...inputStyle, minHeight: '80px' }}
              placeholder="Component layers, APIs, microservices, pipeline structure…"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <label style={labelStyle}>Measurable Results & Benchmarks</label>
              <textarea
                {...register('results')}
                style={{ ...inputStyle, minHeight: '70px' }}
                placeholder="Speedups, accuracy scores, load test results, milestones…"
              />
            </div>
            <div>
              <label style={labelStyle}>Engineering Challenges & Trade-offs</label>
              <textarea
                {...register('challenges')}
                style={{ ...inputStyle, minHeight: '70px' }}
                placeholder="Complexities overcome, concurrency hurdles, architectural trade-offs…"
              />
            </div>
          </div>
        </div>

        {/* 4. Media & Hero Assets */}
        <div style={sectionStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#F5F5F5',
              marginBottom: '16px',
            }}
          >
            <Code2 size={16} style={{ color: '#E45D2C' }} />
            <span>Project Hero & Visuals</span>
          </div>

          <FileUpload
            label="Hero Image Banner"
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
            hint="JPG, PNG, or WebP · Max 5MB"
            maxSize={5 * 1024 * 1024}
            onFileSelect={handleHeroUpload}
            currentUrl={heroUrl}
            onRemove={() => setHeroUrl(null)}
            uploading={uploading}
          />
        </div>

        {/* 5. Visibility & Publishing Options */}
        <div
          style={{
            ...sectionStyle,
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            flexWrap: 'wrap',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#F5F5F5',
              fontWeight: 500,
            }}
          >
            <input
              type="checkbox"
              {...register('featured')}
              style={{ accentColor: '#E45D2C', width: '16px', height: '16px' }}
            />
            <span>Featured Project (Highlighted on Home)</span>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#F5F5F5',
              fontWeight: 500,
            }}
          >
            <input
              type="checkbox"
              {...register('published')}
              style={{ accentColor: '#10B981', width: '16px', height: '16px' }}
            />
            <span>Published (Visible publicly in portfolio)</span>
          </label>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: saving ? '#333' : 'linear-gradient(135deg, #E45D2C 0%, #FF8A3D 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 32px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(228, 93, 44, 0.3)',
              transition: 'all 0.15s',
            }}
          >
            <Save size={16} />
            {saving ? 'Saving Project…' : isEdit ? 'Update Project' : 'Save Project'}
          </button>
        </div>
      </form>
    </div>
  )
}
