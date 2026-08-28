'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  trainingSchema,
  TRAINING_CATEGORIES,
  TRAINING_MODES,
  type TrainingFormValues,
} from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { slugify, joinCSV, parseCSV, sanitizeDateForDb } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FileUpload from '@/components/admin/FileUpload'
import CertificateAiUploader from '@/components/admin/CertificateAiUploader'
import type { Training, GeminiTrainingExtraction, TrainingExtractionConfidence, AnyDocumentExtraction } from '@/types'
import { toast, Toaster } from 'sonner'
import { uploadFileFromBrowser } from '@/lib/supabase/storage-client'
import {
  CheckCircle2,
  BookOpen,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  FileText,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'

const inputStyle = {
  width: '100%',
  background: '#13171F',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  padding: '11px 14px',
  color: '#F5F5F5',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const labelStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#8A8F98',
  marginBottom: '6px',
  fontFamily: 'var(--font-mono, monospace)',
}

const sectionHeaderStyle = {
  fontSize: '12px',
  fontFamily: 'var(--font-mono, monospace)',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: '#FF8A3D',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '16px',
  paddingBottom: '8px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
}

export default function TrainingForm({ training }: { training?: Training }) {
  const router = useRouter()
  const isEdit = !!training
  const [saving, setSaving] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(training?.image_url ?? null)
  const [certificateUrl, setCertificateUrl] = useState<string | null>(training?.certificate_url ?? null)
  const [previewDocumentUrl, setPreviewDocumentUrl] = useState<string | null>(
    training?.certificate_url ?? null
  )
  const [confidence, setConfidence] = useState<TrainingExtractionConfidence | null>(null)
  const [aiExtracted, setAiExtracted] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingCert, setUploadingCert] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      title: training?.title ?? '',
      slug: training?.slug ?? '',
      provider: training?.provider ?? '',
      organization: training?.organization ?? '',
      category: training?.category ?? 'Full Stack',
      description: training?.description ?? '',
      start_date: training?.start_date ?? '',
      end_date: training?.end_date ?? '',
      duration: training?.duration ?? '',
      location: training?.location ?? '',
      mode: training?.mode ?? 'Online',
      credential_id: training?.credential_id ?? '',
      credential_url: training?.credential_url ?? '',
      skills: training ? joinCSV(training.skills) : '',
      technologies: training ? joinCSV(training.technologies) : '',
      featured: training?.featured ?? false,
      published: training?.published ?? true,
      display_order: training?.display_order ?? 0,
    },
  })

  function handleAutoSlug() {
    const titleVal = getValues('title')
    const slugVal = getValues('slug')
    if (titleVal && (!training || !slugVal)) {
      setValue('slug', slugify(titleVal), { shouldValidate: true })
    }
  }

  // Handle AI Certificate Extraction
  function handleAiExtraction(
    extraction: AnyDocumentExtraction,
    file: File,
    previewUrl: string,
    storageUrl?: string | null
  ) {
    const trainData = extraction as GeminiTrainingExtraction
    setAiExtracted(true)
    if (trainData.confidence) {
      setConfidence(trainData.confidence)
    }

    if (trainData.title) {
      setValue('title', trainData.title, { shouldValidate: true })
      if (!isEdit || !getValues('slug')) {
        setValue('slug', slugify(trainData.title), { shouldValidate: true })
      }
    }

    if (trainData.provider) {
      setValue('provider', trainData.provider, { shouldValidate: true })
    }

    if (trainData.organization) {
      setValue('organization', trainData.organization, { shouldValidate: true })
    }

    if (trainData.category) {
      setValue('category', trainData.category, { shouldValidate: true })
    }

    if (trainData.description) {
      setValue('description', trainData.description, { shouldValidate: true })
    }

    if (trainData.start_date) {
      const clean = sanitizeDateForDb(trainData.start_date)
      if (clean) setValue('start_date', clean, { shouldValidate: true })
    }

    if (trainData.end_date) {
      const clean = sanitizeDateForDb(trainData.end_date)
      if (clean) setValue('end_date', clean, { shouldValidate: true })
    }

    if (trainData.duration) {
      setValue('duration', trainData.duration, { shouldValidate: true })
    }

    if (trainData.location) {
      setValue('location', trainData.location, { shouldValidate: true })
    }

    if (trainData.mode) {
      setValue('mode', trainData.mode, { shouldValidate: true })
    }

    if (trainData.skills && trainData.skills.length > 0) {
      setValue('skills', trainData.skills.join(', '), { shouldValidate: true })
    }

    if (trainData.technologies && trainData.technologies.length > 0) {
      setValue('technologies', trainData.technologies.join(', '), { shouldValidate: true })
    }

    if (trainData.credential_id) {
      setValue('credential_id', trainData.credential_id, { shouldValidate: true })
    }

    if (trainData.credential_url) {
      setValue('credential_url', trainData.credential_url, { shouldValidate: true })
    }

    const docUrl = storageUrl || trainData.file_url || null
    if (docUrl) {
      setCertificateUrl(docUrl)
    }

    if (previewUrl) {
      setPreviewDocumentUrl(previewUrl)
    } else if (docUrl) {
      setPreviewDocumentUrl(docUrl)
    }
  }

  function handleFileRemoved() {
    setAiExtracted(false)
    setConfidence(null)
    setPreviewDocumentUrl(null)
  }

  // Handle Image Upload
  async function handleImageUpload(file: File) {
    setUploadingImage(true)
    try {
      const { url, error } = await uploadFileFromBrowser('certificate', file, 'training/images')
      if (error) {
        toast.error(`Image upload failed: ${error}`)
      } else if (url) {
        setImageUrl(url)
        toast.success('Training image uploaded successfully!')
      }
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle Certificate Document Upload
  async function handleCertificateUpload(file: File) {
    setUploadingCert(true)
    try {
      const { url, error } = await uploadFileFromBrowser('certificate', file, 'training/documents')
      if (error) {
        toast.error(`Certificate upload failed: ${error}`)
      } else if (url) {
        setCertificateUrl(url)
        setPreviewDocumentUrl(url)
        toast.success('Training certificate uploaded successfully!')
      }
    } catch {
      toast.error('Failed to upload certificate document')
    } finally {
      setUploadingCert(false)
    }
  }

  // Submit Handler
  async function onSubmit(data: TrainingFormValues) {
    if (saving) return
    setSaving(true)

    try {
      const supabase = createClient()
      const payload = {
        title: data.title.trim(),
        slug: data.slug.trim(),
        provider: data.provider?.trim() || null,
        organization: data.organization?.trim() || null,
        category: data.category,
        description: data.description?.trim() || null,
        start_date: sanitizeDateForDb(data.start_date),
        end_date: sanitizeDateForDb(data.end_date),
        duration: data.duration?.trim() || null,
        location: data.location?.trim() || null,
        mode: data.mode || 'Online',
        credential_id: data.credential_id?.trim() || null,
        credential_url: data.credential_url?.trim() || null,
        skills: parseCSV(data.skills ?? ''),
        technologies: parseCSV(data.technologies ?? ''),
        image_url: imageUrl,
        certificate_url: certificateUrl,
        featured: Boolean(data.featured),
        published: Boolean(data.published),
        display_order: Number(data.display_order) || 0,
        updated_at: new Date().toISOString(),
      }

      if (isEdit && training?.id) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(training.id)
        let existing = null
        if (isUuid) {
          const { data } = await supabase.from('training').select('id').eq('id', training.id).maybeSingle()
          existing = data
        }
        if (!existing && training.slug) {
          const { data } = await supabase.from('training').select('id').eq('slug', training.slug).maybeSingle()
          existing = data
        }

        if (existing) {
          const { error } = await supabase.from('training').update(payload).eq('id', existing.id)
          if (error) {
            handleSaveError(error, 'Updating training record')
            setSaving(false)
            return
          }
          toast.success('Training updated successfully!')
        } else {
          const { error } = await supabase.from('training').insert([payload])
          if (error) {
            handleSaveError(error, 'Adding training record')
            setSaving(false)
            return
          }
          toast.success('Training program added successfully!')
        }
      } else {
        const { error } = await supabase.from('training').insert([payload])
        if (error) {
          handleSaveError(error, 'Adding training record')
          setSaving(false)
          return
        }
        toast.success('Training program added successfully!')
      }

      // Revalidate cache non-blocking with timeout
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2500)
        await fetch('/api/admin/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'training', slug: data.slug }),
          signal: controller.signal,
        }).catch(() => {})
        clearTimeout(timeoutId)
      } catch {
        // Non-blocking
      }

      setSaving(false)

      setTimeout(() => {
        router.push('/admin/training')
        router.refresh()
      }, 300)
    } catch (err: unknown) {
      handleSaveError(err, 'Saving training')
      setSaving(false)
    }
  }

  function handleSaveError(err: unknown, context: string) {
    let msg = 'Database error occurred'

    if (typeof err === 'object' && err !== null) {
      const e = err as { message?: string; details?: string; hint?: string; code?: string }
      if (e.message) msg = e.message
      if (e.details && !msg.includes(e.details)) msg += ` (${e.details})`
    } else if (err instanceof Error) {
      msg = err.message
    }

    console.warn(`${context} notice:`, msg)

    if (msg.toLowerCase().includes('schema cache') || msg.toLowerCase().includes('could not find the table')) {
      toast.error('Supabase Table Missing: The "training" table has not been created yet in Supabase. Please run the SQL migration in Supabase SQL Editor.', {
        duration: 9000,
      })
    } else if (msg.toLowerCase().includes('duplicate key') || msg.toLowerCase().includes('unique constraint') || msg.includes('23505')) {
      toast.error('A training program with this slug already exists. Please change the URL Slug field.')
    } else if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('row-level security') || msg.includes('42501')) {
      toast.error('Permission Denied: Please check your admin session or Supabase RLS policies.')
    } else {
      toast.error(`Save Failed: ${msg}`)
    }
  }

  function renderConfidenceBadge(field: keyof TrainingExtractionConfidence) {
    if (!confidence) return null
    const score = confidence[field]
    if (score === undefined || score === 0) return null

    const isHigh = score >= 0.8
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          fontSize: '10px',
          fontFamily: 'var(--font-mono, monospace)',
          color: isHigh ? '#10B981' : '#F59E0B',
          background: isHigh ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          padding: '1px 6px',
          borderRadius: '3px',
          textTransform: 'none',
        }}
      >
        {isHigh ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
        {isHigh ? `${Math.round(score * 100)}% AI` : `${Math.round(score * 100)}% Review`}
      </span>
    )
  }

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', paddingBottom: '60px' }}>
      <Toaster position="top-right" richColors theme="dark" />

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/admin/training"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#13171F',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#F5F5F5',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#F5F5F5', margin: 0 }}>
              {isEdit ? 'Edit Training Program' : 'Add New Training'}
            </h1>
            <p style={{ fontSize: '13px', color: '#8A8F98', margin: '3px 0 0' }}>
              Manage industrial training, bootcamps, and technical learning with AI auto-fill assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Prominent AI Document Uploader & Analyzer */}
      <CertificateAiUploader
        type="training"
        onExtractionSuccess={handleAiExtraction}
        onFileRemoved={handleFileRemoved}
      />

      {/* AI Extraction Banner Notice */}
      {aiExtracted && (
        <div
          style={{
            background: 'rgba(228, 93, 44, 0.08)',
            border: '1px solid rgba(228, 93, 44, 0.25)',
            borderRadius: '8px',
            padding: '14px 18px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            color: '#F5F5F5',
          }}
        >
          <Sparkles size={16} style={{ color: '#FF8A3D', flexShrink: 0 }} />
          <div>
            <strong>AI Auto-Fill Active:</strong> Google Gemini parsed details from your certificate document.
            Please review the pre-populated values and make any adjustments before saving.
          </div>
        </div>
      )}

      {/* Main Dual-Column Layout when document preview is active */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: previewDocumentUrl ? 'minmax(280px, 320px) 1fr' : '1fr',
          gap: '28px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Visual Document Preview Sheet */}
        {previewDocumentUrl && (
          <div
            style={{
              background: '#0D1117',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '18px',
              position: 'sticky',
              top: '20px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#8A8F98',
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Document Verification</span>
              <ShieldCheck size={14} style={{ color: '#10B981' }} />
            </div>

            {previewDocumentUrl.match(/\.(jpg|jpeg|png|webp|avif)$/i) ||
            previewDocumentUrl.startsWith('blob:') ? (
              <div
                style={{
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '14px',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewDocumentUrl}
                  alt="Certificate Document"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            ) : (
              <div
                style={{
                  padding: '28px 16px',
                  textAlign: 'center',
                  background: '#13171F',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '14px',
                }}
              >
                <FileText size={32} style={{ color: '#FF8A3D', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '13px', color: '#F5F5F5', fontWeight: 500 }}>
                  PDF Certificate Document
                </div>
                <div style={{ fontSize: '11px', color: '#8A8F98', marginTop: '4px' }}>
                  Stored & ready for publishing
                </div>
              </div>
            )}

            {certificateUrl && (
              <a
                href={certificateUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: '#FF8A3D',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Open Full Document <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}

        {/* Right Column: Editable Training Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* =========================================================================
              SECTION 1: BASIC INFORMATION
              ========================================================================= */}
          <div
            style={{
              background: '#0D1117',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '24px',
              marginBottom: '20px',
            }}
          >
            <div style={sectionHeaderStyle}>
              <BookOpen size={14} />
              01 / Basic Information
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {/* Title */}
              <div>
                <label style={labelStyle}>
                  <span>Training Title *</span>
                  {renderConfidenceBadge('title')}
                </label>
                <input
                  {...register('title')}
                  onBlur={handleAutoSlug}
                  placeholder="e.g. Full-Stack Web & Applied AI Systems Engineering"
                  style={inputStyle}
                />
                {errors.title && (
                  <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label style={labelStyle}>
                  <span>URL Slug *</span>
                  <span style={{ color: '#6B7280', textTransform: 'none' }}>Auto-generated</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    {...register('slug')}
                    placeholder="e.g. full-stack-web-ai-systems-engineering"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={handleAutoSlug}
                    style={{
                      padding: '0 14px',
                      background: '#181E29',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      color: '#FF8A3D',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Auto
                  </button>
                </div>
                {errors.slug && (
                  <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.slug.message}
                  </p>
                )}
              </div>

              {/* Provider & Organization */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>
                    <span>Provider / Platform</span>
                    {renderConfidenceBadge('provider')}
                  </label>
                  <input
                    {...register('provider')}
                    placeholder="e.g. Centre for Professional Development / Coursera"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    <span>Organization / Institution</span>
                    {renderConfidenceBadge('organization')}
                  </label>
                  <input
                    {...register('organization')}
                    placeholder="e.g. Lovely Professional University"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label style={labelStyle}>
                  <span>Category *</span>
                  {renderConfidenceBadge('category')}
                </label>
                <select {...register('category')} style={inputStyle}>
                  {TRAINING_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>
                  <span>Program Description</span>
                  {renderConfidenceBadge('description')}
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Detail what was learned, architected, and built during the training..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 2: TRAINING DETAILS & SCHEDULE
              ========================================================================= */}
          <div
            style={{
              background: '#0D1117',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '24px',
              marginBottom: '20px',
            }}
          >
            <div style={sectionHeaderStyle}>
              <Calendar size={14} />
              02 / Training Details & Schedule
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Start Date */}
              <div>
                <label style={labelStyle}>
                  <span>Start Date</span>
                  {renderConfidenceBadge('start_date')}
                </label>
                <input type="date" {...register('start_date')} style={inputStyle} />
              </div>

              {/* End Date */}
              <div>
                <label style={labelStyle}>
                  <span>End Date</span>
                  {renderConfidenceBadge('end_date')}
                </label>
                <input type="date" {...register('end_date')} style={inputStyle} />
              </div>

              {/* Duration */}
              <div>
                <label style={labelStyle}>
                  <span>Duration</span>
                  {renderConfidenceBadge('duration')}
                </label>
                <input {...register('duration')} placeholder="e.g. 8 Weeks, 60 Hours" style={inputStyle} />
              </div>

              {/* Mode */}
              <div>
                <label style={labelStyle}>
                  <span>Training Mode</span>
                  {renderConfidenceBadge('mode')}
                </label>
                <select {...register('mode')} style={inputStyle}>
                  {TRAINING_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>
                  <span>Location / Campus</span>
                  {renderConfidenceBadge('location')}
                </label>
                <input
                  {...register('location')}
                  placeholder="e.g. Punjab, India / Remote / Hybrid"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 3: SKILLS & TECHNOLOGIES
              ========================================================================= */}
          <div
            style={{
              background: '#0D1117',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '24px',
              marginBottom: '20px',
            }}
          >
            <div style={sectionHeaderStyle}>
              <Sparkles size={14} />
              03 / Skills & Technologies
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>
                  <span>Skills Acquired (Comma Separated)</span>
                  {renderConfidenceBadge('skills')}
                </label>
                <input
                  {...register('skills')}
                  placeholder="e.g. Supervised Learning, Deep Neural Networks, Vector Embeddings, REST APIs"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  <span>Technologies Used (Comma Separated)</span>
                  {renderConfidenceBadge('technologies')}
                </label>
                <input
                  {...register('technologies')}
                  placeholder="e.g. Next.js, PyTorch, PostgreSQL, Docker, FastAPI"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 4: CREDENTIAL & VERIFICATION
              ========================================================================= */}
          <div
            style={{
              background: '#0D1117',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '24px',
              marginBottom: '20px',
            }}
          >
            <div style={sectionHeaderStyle}>
              <ExternalLink size={14} />
              04 / Credential & Verification
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>
                  <span>Credential ID / Reference Number</span>
                  {renderConfidenceBadge('credential_id')}
                </label>
                <input
                  {...register('credential_id')}
                  placeholder="e.g. TRN-2025-FS-8812"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  <span>Verification URL</span>
                  {renderConfidenceBadge('credential_url')}
                </label>
                <input
                  {...register('credential_url')}
                  placeholder="https://..."
                  style={inputStyle}
                />
                {errors.credential_url && (
                  <span style={{ color: '#EF4444', fontSize: '12px' }}>
                    {errors.credential_url.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 5: MEDIA & DOCUMENTS
              ========================================================================= */}
          <div
            style={{
              background: '#0D1117',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '24px',
              marginBottom: '20px',
            }}
          >
            <div style={sectionHeaderStyle}>
              <BookOpen size={14} />
              05 / Media & Certificate Documents
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Training Image Thumbnail */}
              <div>
                <FileUpload
                  label="Training Thumbnail / Banner"
                  hint="Image preview (JPG, PNG, WEBP, Max 5MB)"
                  accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
                  currentUrl={imageUrl}
                  onFileSelect={handleImageUpload}
                  onRemove={() => setImageUrl(null)}
                  uploading={uploadingImage}
                />
              </div>

              {/* Certificate Document */}
              <div>
                <FileUpload
                  label="Certificate / Proof Document"
                  hint="PDF or Image (PDF, JPG, PNG, Max 20MB)"
                  accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
                  currentUrl={certificateUrl}
                  onFileSelect={handleCertificateUpload}
                  onRemove={() => {
                    setCertificateUrl(null)
                    setPreviewDocumentUrl(null)
                  }}
                  uploading={uploadingCert}
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 6: PUBLISHING & DISPLAY
              ========================================================================= */}
          <div
            style={{
              background: '#0D1117',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '24px',
              marginBottom: '28px',
            }}
          >
            <div style={sectionHeaderStyle}>
              <CheckCircle2 size={14} />
              06 / Publishing & Priority
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '32px',
                alignItems: 'center',
              }}
            >
              {/* Published Toggle */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#F5F5F5',
                }}
              >
                <input
                  type="checkbox"
                  {...register('published')}
                  style={{ width: '18px', height: '18px', accentColor: '#E45D2C', cursor: 'pointer' }}
                />
                <span>Published (Visible on Public Website)</span>
              </label>

              {/* Featured Toggle */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#F5F5F5',
                }}
              >
                <input
                  type="checkbox"
                  {...register('featured')}
                  style={{ width: '18px', height: '18px', accentColor: '#FF8A3D', cursor: 'pointer' }}
                />
                <span>Featured (Highlighted on Homepage)</span>
              </label>

              {/* Display Order */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Display Order:</label>
                <input
                  type="number"
                  {...register('display_order', { valueAsNumber: true })}
                  style={{ ...inputStyle, width: '90px', padding: '6px 10px' }}
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '14px',
            }}
          >
            <Link
              href="/admin/training"
              style={{
                padding: '11px 20px',
                borderRadius: '6px',
                background: '#13171F',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#8A8F98',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                textDecoration: 'none',
              }}
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || uploadingImage || uploadingCert}
              style={{
                padding: '11px 28px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #E45D2C 0%, #FF8A3D 100%)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(228, 93, 44, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              {saving ? 'Saving Program...' : isEdit ? 'Update Training' : 'Save Training Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
