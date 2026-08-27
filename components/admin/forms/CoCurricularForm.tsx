'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  coCurricularSchema,
  CO_CURRICULAR_CATEGORIES,
  CO_CURRICULAR_MODES,
  type CoCurricularFormValues,
} from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { slugify, joinCSV, parseCSV, sanitizeDateForDb } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FileUpload from '@/components/admin/FileUpload'
import CertificateAiUploader from '@/components/admin/CertificateAiUploader'
import type {
  CoCurricularActivity,
  GeminiCoCurricularExtraction,
  CoCurricularExtractionConfidence,
  AnyDocumentExtraction,
} from '@/types'
import { toast, Toaster } from 'sonner'
import { uploadFileFromBrowser } from '@/lib/supabase/storage-client'
import {
  CheckCircle2,
  Trophy,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  Award,
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

export default function CoCurricularForm({ activity }: { activity?: CoCurricularActivity }) {
  const router = useRouter()
  const isEdit = !!activity
  const [saving, setSaving] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(activity?.image_url ?? null)
  const [documentUrl, setDocumentUrl] = useState<string | null>(activity?.document_url ?? null)
  const [previewDocumentUrl, setPreviewDocumentUrl] = useState<string | null>(
    activity?.document_url ?? null
  )
  const [confidence, setConfidence] = useState<CoCurricularExtractionConfidence | null>(null)
  const [aiExtracted, setAiExtracted] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CoCurricularFormValues>({
    resolver: zodResolver(coCurricularSchema),
    defaultValues: {
      title: activity?.title ?? '',
      slug: activity?.slug ?? '',
      organization: activity?.organization ?? '',
      category: activity?.category ?? 'Hackathon',
      description: activity?.description ?? '',
      date: activity?.date ?? '',
      end_date: activity?.end_date ?? '',
      location: activity?.location ?? '',
      mode: activity?.mode ?? 'Offline',
      role: activity?.role ?? '',
      achievement: activity?.achievement ?? '',
      credential_id: activity?.credential_id ?? '',
      credential_url: activity?.credential_url ?? '',
      skills: activity ? joinCSV(activity.skills) : '',
      technologies: activity ? joinCSV(activity.technologies) : '',
      featured: activity?.featured ?? false,
      published: activity?.published ?? true,
      display_order: activity?.display_order ?? 0,
    },
  })

  function handleAutoSlug() {
    const titleVal = getValues('title')
    const slugVal = getValues('slug')
    if (titleVal && (!activity || !slugVal)) {
      setValue('slug', slugify(titleVal), { shouldValidate: true })
    }
  }

  // Handle AI Document Extraction
  function handleAiExtraction(
    extraction: AnyDocumentExtraction,
    file: File,
    previewUrl: string,
    storageUrl?: string | null
  ) {
    const coData = extraction as GeminiCoCurricularExtraction
    setAiExtracted(true)
    if (coData.confidence) {
      setConfidence(coData.confidence)
    }

    if (coData.title) {
      setValue('title', coData.title, { shouldValidate: true })
      if (!isEdit || !getValues('slug')) {
        setValue('slug', slugify(coData.title), { shouldValidate: true })
      }
    }

    if (coData.organization) {
      setValue('organization', coData.organization, { shouldValidate: true })
    }

    if (coData.category) {
      setValue('category', coData.category, { shouldValidate: true })
    }

    if (coData.description) {
      setValue('description', coData.description, { shouldValidate: true })
    }

    if (coData.date) {
      const cleanDate = sanitizeDateForDb(coData.date)
      if (cleanDate) {
        setValue('date', cleanDate, { shouldValidate: true })
      }
    }

    if (coData.end_date) {
      const cleanEndDate = sanitizeDateForDb(coData.end_date)
      if (cleanEndDate) {
        setValue('end_date', cleanEndDate, { shouldValidate: true })
      }
    }

    if (coData.location) {
      setValue('location', coData.location, { shouldValidate: true })
    }

    if (coData.mode) {
      setValue('mode', coData.mode, { shouldValidate: true })
    }

    if (coData.role) {
      setValue('role', coData.role, { shouldValidate: true })
    }

    if (coData.achievement) {
      setValue('achievement', coData.achievement, { shouldValidate: true })
    }

    if (coData.skills && coData.skills.length > 0) {
      setValue('skills', coData.skills.join(', '), { shouldValidate: true })
    }

    if (coData.technologies && coData.technologies.length > 0) {
      setValue('technologies', coData.technologies.join(', '), { shouldValidate: true })
    }

    if (coData.credential_id) {
      setValue('credential_id', coData.credential_id, { shouldValidate: true })
    }

    if (coData.credential_url) {
      setValue('credential_url', coData.credential_url, { shouldValidate: true })
    }

    const docUrl = storageUrl || coData.file_url || null
    if (docUrl) {
      setDocumentUrl(docUrl)
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
      const { url, error } = await uploadFileFromBrowser('certificate', file, 'co-curricular/images')
      if (error) {
        toast.error(`Image upload failed: ${error}`)
      } else if (url) {
        setImageUrl(url)
        toast.success('Activity image uploaded successfully!')
      }
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle Supporting Document Upload
  async function handleDocumentUpload(file: File) {
    setUploadingDoc(true)
    try {
      const { url, error } = await uploadFileFromBrowser('certificate', file, 'co-curricular/documents')
      if (error) {
        toast.error(`Document upload failed: ${error}`)
      } else if (url) {
        setDocumentUrl(url)
        setPreviewDocumentUrl(url)
        toast.success('Supporting document uploaded successfully!')
      }
    } catch {
      toast.error('Failed to upload document')
    } finally {
      setUploadingDoc(false)
    }
  }

  // Submit Handler
  async function onSubmit(data: CoCurricularFormValues) {
    if (saving) return
    setSaving(true)

    try {
      const supabase = createClient()
      const payload = {
        title: data.title.trim(),
        slug: data.slug.trim(),
        organization: data.organization?.trim() || null,
        category: data.category,
        description: data.description?.trim() || null,
        date: sanitizeDateForDb(data.date),
        end_date: sanitizeDateForDb(data.end_date),
        location: data.location?.trim() || null,
        mode: data.mode || 'Offline',
        role: data.role?.trim() || null,
        achievement: data.achievement?.trim() || null,
        credential_id: data.credential_id?.trim() || null,
        credential_url: data.credential_url?.trim() || null,
        skills: parseCSV(data.skills ?? ''),
        technologies: parseCSV(data.technologies ?? ''),
        image_url: imageUrl,
        document_url: documentUrl,
        featured: Boolean(data.featured),
        published: Boolean(data.published),
        display_order: Number(data.display_order) || 0,
        updated_at: new Date().toISOString(),
      }

      if (isEdit && activity?.id) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activity.id)
        let existing = null
        if (isUuid) {
          const { data } = await supabase.from('co_curricular_activities').select('id').eq('id', activity.id).maybeSingle()
          existing = data
        }
        if (!existing && activity.slug) {
          const { data } = await supabase.from('co_curricular_activities').select('id').eq('slug', activity.slug).maybeSingle()
          existing = data
        }

        if (existing) {
          const { error } = await supabase
            .from('co_curricular_activities')
            .update(payload)
            .eq('id', existing.id)
          if (error) {
            handleSaveError(error, 'Updating activity record')
            setSaving(false)
            return
          }
          toast.success('Activity updated successfully!')
        } else {
          const { error } = await supabase.from('co_curricular_activities').insert([payload])
          if (error) {
            handleSaveError(error, 'Adding activity record')
            setSaving(false)
            return
          }
          toast.success('Activity created successfully!')
        }
      } else {
        const { error } = await supabase.from('co_curricular_activities').insert([payload])
        if (error) {
          handleSaveError(error, 'Adding activity record')
          setSaving(false)
          return
        }
        toast.success('Activity created successfully!')
      }

      // Revalidate cache
      fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'co-curricular', slug: data.slug }),
      }).catch(() => {})

      setTimeout(() => {
        router.push('/admin/co-curricular')
        router.refresh()
      }, 600)
    } catch (err: unknown) {
      handleSaveError(err, 'Saving activity')
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
      toast.error('Supabase Table Missing: The "co_curricular_activities" table has not been created yet in Supabase. Please run the SQL migration in Supabase SQL Editor.', {
        duration: 9000,
      })
    } else if (msg.toLowerCase().includes('duplicate key') || msg.toLowerCase().includes('unique constraint') || msg.includes('23505')) {
      toast.error('An activity with this slug already exists. Please change the URL Slug field.')
    } else if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('row-level security') || msg.includes('42501')) {
      toast.error('Permission Denied: Please check your admin session or Supabase RLS policies.')
    } else {
      toast.error(`Save Failed: ${msg}`)
    }
  }

  function renderConfidenceBadge(field: keyof CoCurricularExtractionConfidence) {
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
            href="/admin/co-curricular"
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
              {isEdit ? 'Edit Co-Curricular Activity' : 'Add Co-Curricular Activity'}
            </h1>
            <p style={{ fontSize: '13px', color: '#8A8F98', margin: '3px 0 0' }}>
              Manage hackathons, competitions, leadership, and community activities with AI auto-fill assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Prominent AI Document Uploader & Analyzer */}
      <CertificateAiUploader
        type="co_curricular"
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
            <strong>AI Auto-Fill Active:</strong> Google Gemini extracted activity details from your document.
            Please review the pre-populated values and make any edits before saving.
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
                  alt="Activity Document"
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
                  PDF Proof Document
                </div>
                <div style={{ fontSize: '11px', color: '#8A8F98', marginTop: '4px' }}>
                  Stored & ready for publishing
                </div>
              </div>
            )}

            {documentUrl && (
              <a
                href={documentUrl}
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

        {/* Right Column: Editable Activity Form */}
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
              <Trophy size={14} />
              01 / Basic Information
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {/* Title */}
              <div>
                <label style={labelStyle}>
                  <span>Activity Title *</span>
                  {renderConfidenceBadge('title')}
                </label>
                <input
                  {...register('title')}
                  onBlur={handleAutoSlug}
                  placeholder="e.g. Smart India Hackathon (SIH)"
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
                    placeholder="e.g. smart-india-hackathon"
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

              {/* Organization & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>
                    <span>Organization / Host / University</span>
                    {renderConfidenceBadge('organization')}
                  </label>
                  <input
                    {...register('organization')}
                    placeholder="e.g. Ministry of Education & AICTE / IEEE"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    <span>Category *</span>
                    {renderConfidenceBadge('category')}
                  </label>
                  <select {...register('category')} style={inputStyle}>
                    {CO_CURRICULAR_CATEGORIES.map((cat) => (
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
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>
                  <span>Activity Description</span>
                  {renderConfidenceBadge('description')}
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Describe your contributions, technical implementation, scope of the event, and collaboration..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 2: ACTIVITY DETAILS & SCHEDULE
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
              02 / Activity Details & Schedule
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Role */}
              <div>
                <label style={labelStyle}>
                  <span>Your Role</span>
                  {renderConfidenceBadge('role')}
                </label>
                <input
                  {...register('role')}
                  placeholder="e.g. Team Lead & Full-Stack Architect / Keynote Speaker"
                  style={inputStyle}
                />
              </div>

              {/* Mode */}
              <div>
                <label style={labelStyle}>
                  <span>Event Mode</span>
                  {renderConfidenceBadge('mode')}
                </label>
                <select {...register('mode')} style={inputStyle}>
                  {CO_CURRICULAR_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label style={labelStyle}>
                  <span>Start Date / Event Date</span>
                  {renderConfidenceBadge('date')}
                </label>
                <input type="date" {...register('date')} style={inputStyle} />
              </div>

              {/* End Date */}
              <div>
                <label style={labelStyle}>
                  <span>End Date (If Multi-Day)</span>
                  {renderConfidenceBadge('end_date')}
                </label>
                <input type="date" {...register('end_date')} style={inputStyle} />
              </div>

              {/* Location */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>
                  <span>Location / Venue</span>
                  {renderConfidenceBadge('location')}
                </label>
                <input
                  {...register('location')}
                  placeholder="e.g. Punjab, India / Remote / Nodal Centre"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 3: ROLE & OUTCOME / ACHIEVEMENT
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
              <Award size={14} />
              03 / Role & Outcome / Recognition
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>
                  <span>Achievement / Outcome (Optional)</span>
                  {renderConfidenceBadge('achievement')}
                </label>
                <input
                  {...register('achievement')}
                  placeholder="e.g. National Finalist / Winner / Keynote Speaker — 300+ Attendees"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 4: SKILLS & TECHNOLOGIES
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
              04 / Skills & Technologies
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>
                  <span>Skills (Comma Separated)</span>
                  {renderConfidenceBadge('skills')}
                </label>
                <input
                  {...register('skills')}
                  placeholder="e.g. Team Leadership, System Architecture, Rapid Prototyping, Public Speaking"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  <span>Technologies (Comma Separated)</span>
                  {renderConfidenceBadge('technologies')}
                </label>
                <input
                  {...register('technologies')}
                  placeholder="e.g. Next.js, FastAPI, PyTorch, PostgreSQL, WebSockets"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 5: CREDENTIAL & VERIFICATION
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
              05 / Credential & Verification
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>
                  <span>Credential ID / Reference Number</span>
                  {renderConfidenceBadge('credential_id')}
                </label>
                <input
                  {...register('credential_id')}
                  placeholder="e.g. SIH-2025-FIN-842"
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
              SECTION 6: MEDIA & SUPPORTING DOCUMENTS
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
              <Trophy size={14} />
              06 / Media & Supporting Documents
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Activity Image Thumbnail */}
              <div>
                <FileUpload
                  label="Activity Thumbnail / Photo"
                  hint="Image preview (JPG, PNG, WEBP, Max 5MB)"
                  accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
                  currentUrl={imageUrl}
                  onFileSelect={handleImageUpload}
                  onRemove={() => setImageUrl(null)}
                  uploading={uploadingImage}
                />
              </div>

              {/* Supporting Document / Certificate */}
              <div>
                <FileUpload
                  label="Certificate / Proof Document"
                  hint="PDF or Image (PDF, JPG, PNG, Max 20MB)"
                  accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
                  currentUrl={documentUrl}
                  onFileSelect={handleDocumentUpload}
                  onRemove={() => {
                    setDocumentUrl(null)
                    setPreviewDocumentUrl(null)
                  }}
                  uploading={uploadingDoc}
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 7: PUBLISHING & DISPLAY
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
              07 / Publishing & Priority
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
                <span>Featured (Highlighted on Homepage & Archive)</span>
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
              href="/admin/co-curricular"
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
              disabled={saving || uploadingImage || uploadingDoc}
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
              {saving ? 'Saving Activity...' : isEdit ? 'Update Activity' : 'Save Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
