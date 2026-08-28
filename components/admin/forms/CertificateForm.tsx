'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  certificateSchema,
  CERTIFICATE_CATEGORIES,
  type CertificateFormValues,
} from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { slugify, joinCSV, parseCSV, sanitizeDateForDb } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FileUpload from '@/components/admin/FileUpload'
import CertificateAiUploader from '@/components/admin/CertificateAiUploader'
import type { Certificate, GeminiCertificateExtraction, ExtractionConfidence, AnyDocumentExtraction } from '@/types'
import { toast, Toaster } from 'sonner'
import { uploadFileFromBrowser } from '@/lib/supabase/storage-client'
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'

const inputStyle = {
  width: '100%',
  background: '#141414',
  border: '1px solid #282828',
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
  color: '#777',
  marginBottom: '6px',
  fontFamily: 'var(--font-mono, monospace)',
}

export default function AdminCertificateForm({ certificate }: { certificate?: Certificate }) {
  const router = useRouter()
  const isEdit = !!certificate
  const [saving, setSaving] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | null>(certificate?.file_url ?? null)
  const [thumbUrl, setThumbUrl] = useState<string | null>(certificate?.thumbnail_url ?? null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [previewDocumentUrl, setPreviewDocumentUrl] = useState<string | null>(
    certificate?.file_url ?? null
  )
  const [confidence, setConfidence] = useState<ExtractionConfidence | null>(null)
  const [aiExtracted, setAiExtracted] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      title: certificate?.title ?? '',
      slug: certificate?.slug ?? '',
      issuer: certificate?.issuer ?? '',
      category: certificate?.category ?? 'AI / ML',
      issue_date: certificate?.issue_date ?? '',
      expiry_date: certificate?.expiry_date ?? '',
      credential_id: certificate?.credential_id ?? '',
      verification_url: certificate?.verification_url ?? '',
      description: certificate?.description ?? '',
      skills: certificate ? joinCSV(certificate.skills) : '',
      featured: certificate?.featured ?? false,
      published: certificate?.published ?? false,
    },
  })

  function handleAiExtraction(
    extraction: AnyDocumentExtraction,
    file: File,
    previewUrl: string,
    storageUrl?: string | null
  ) {
    const certData = extraction as GeminiCertificateExtraction
    setAiExtracted(true)
    if (certData.confidence) {
      setConfidence(certData.confidence)
    }

    if (certData.title) {
      setValue('title', certData.title, { shouldValidate: true })
      if (!isEdit || !getValues('slug')) {
        setValue('slug', slugify(certData.title), { shouldValidate: true })
      }
    }

    if (certData.issuer) {
      setValue('issuer', certData.issuer, { shouldValidate: true })
    }

    if (certData.category) {
      setValue('category', certData.category, { shouldValidate: true })
    }

    if (certData.issue_date) {
      const clean = sanitizeDateForDb(certData.issue_date)
      if (clean) setValue('issue_date', clean, { shouldValidate: true })
    }

    if (certData.expiry_date) {
      const clean = sanitizeDateForDb(certData.expiry_date)
      if (clean) setValue('expiry_date', clean, { shouldValidate: true })
    }

    if (certData.credential_id) {
      setValue('credential_id', certData.credential_id, { shouldValidate: true })
    }

    if (certData.verification_url) {
      setValue('verification_url', certData.verification_url, { shouldValidate: true })
    }

    if (certData.description) {
      setValue('description', certData.description, { shouldValidate: true })
    }

    if (certData.skills && certData.skills.length > 0) {
      setValue('skills', certData.skills.join(', '), { shouldValidate: true })
    }

    const docUrl = storageUrl || certData.file_url || null
    if (docUrl) {
      setFileUrl(docUrl)
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

  async function handleFileUpload(file: File) {
    setUploadingFile(true)
    try {
      const result = await uploadFileFromBrowser('certificate', file, 'documents')
      if (result.url) {
        setFileUrl(result.url)
        setPreviewDocumentUrl(result.url)
        toast.success('Document uploaded to Supabase Storage')
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      toast.error(msg)
    } finally {
      setUploadingFile(false)
    }
  }

  async function handleThumbUpload(file: File) {
    setUploadingThumb(true)
    try {
      const result = await uploadFileFromBrowser('certificate', file, 'thumbnails')
      if (result.url) {
        setThumbUrl(result.url)
        toast.success('Thumbnail uploaded to Supabase Storage')
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      toast.error(msg)
    } finally {
      setUploadingThumb(false)
    }
  }

  async function onSubmit(values: CertificateFormValues) {
    setSaving(true)
    try {
      const supabase = createClient()

      const payload = {
        title: values.title.trim(),
        slug: values.slug.trim(),
        issuer: values.issuer.trim(),
        category: values.category,
        issue_date: sanitizeDateForDb(values.issue_date),
        expiry_date: sanitizeDateForDb(values.expiry_date),
        credential_id: values.credential_id?.trim() || null,
        verification_url: values.verification_url?.trim() || null,
        description: values.description?.trim() || null,
        skills: values.skills ? parseCSV(values.skills) : [],
        featured: values.featured,
        published: values.published,
        file_url: fileUrl,
        thumbnail_url: thumbUrl,
      }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(certificate?.id ?? '')

      if (isEdit && isUuid) {
        const { data: existing } = await supabase.from('certificates').select('id').eq('id', certificate!.id).single()
        if (existing) {
          const { error } = await supabase
            .from('certificates')
            .update(payload)
            .eq('id', certificate!.id)
          if (error) {
            toast.error(`Update failed: ${error.message}`)
            setSaving(false)
            return
          }
        } else {
          const { error } = await supabase.from('certificates').insert(payload)
          if (error) {
            toast.error(`Save failed: ${error.message}`)
            setSaving(false)
            return
          }
        }
      } else if (isEdit) {
        const { data: existing } = await supabase.from('certificates').select('id').eq('slug', payload.slug).single()
        if (existing) {
          const { error } = await supabase
            .from('certificates')
            .update(payload)
            .eq('id', existing.id)
          if (error) {
            toast.error(`Update failed: ${error.message}`)
            setSaving(false)
            return
          }
        } else {
          const { error } = await supabase.from('certificates').insert(payload)
          if (error) {
            toast.error(`Save failed: ${error.message}`)
            setSaving(false)
            return
          }
        }
      } else {
        const { error } = await supabase.from('certificates').insert(payload)
        if (error) {
          toast.error(`Insert failed: ${error.message}`)
          setSaving(false)
          return
        }
      }

      // Invalidate cache and revalidate public routes (non-blocking with timeout)
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2500)
        await fetch('/api/admin/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'certificates', slug: payload.slug }),
          signal: controller.signal,
        }).catch(() => {})
        clearTimeout(timeoutId)
      } catch {
        // Non-blocking
      }

      toast.success(isEdit ? 'Certificate updated successfully' : 'Certificate created successfully')
      setSaving(false)

      setTimeout(() => {
        router.push('/admin/certificates')
        router.refresh()
      }, 300)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save certificate'
      toast.error(message)
      setSaving(false)
    }
  }

  function renderConfidenceBadge(field: keyof ExtractionConfidence) {
    if (!confidence) return null
    const score = confidence[field]
    if (score === undefined || score === 0) return null

    const isHigh = score >= 0.85
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
    <div style={{ maxWidth: '1100px' }}>
      <Toaster position="top-right" theme="dark" />

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: '4px',
          }}
        >
          {isEdit ? 'Credential Management' : 'AI-Assisted Publishing'}
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F5F5F5' }}>
          {isEdit ? 'Edit Certificate' : 'Add New Certificate'}
        </h1>
      </div>

      {/* Prominent AI Upload & Extraction Component */}
      <CertificateAiUploader
        type="certificate"
        onExtractionSuccess={handleAiExtraction}
        onFileRemoved={handleFileRemoved}
      />

      {/* AI Extraction Banner Notice */}
      {aiExtracted && (
        <div
          style={{
            background: 'rgba(229, 106, 61, 0.08)',
            border: '1px solid var(--color-accent-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 18px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            color: 'var(--color-text)',
          }}
        >
          <Sparkles size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          <div>
            <strong>AI Auto-Fill Completed:</strong> Google Gemini extracted metadata from your
            certificate. Please review and edit any fields below before publishing.
          </div>
        </div>
      )}

      {/* Main Dual-Column Layout on Desktop */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: previewDocumentUrl ? 'minmax(280px, 340px) 1fr' : '1fr',
          gap: '32px',
          alignItems: 'start',
        }}
        className="certificate-admin-layout"
      >
        {/* Left Column: Visual Document Preview Sheet */}
        {previewDocumentUrl && (
          <div
            style={{
              background: '#141414',
              border: '1px solid #222',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
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
                color: '#777',
                marginBottom: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Document Verification</span>
              <ShieldCheck size={14} style={{ color: 'var(--color-accent)' }} />
            </div>

            {previewDocumentUrl.match(/\.(jpg|jpeg|png|webp|avif)$/i) ||
            previewDocumentUrl.startsWith('blob:') ? (
              <div
                style={{
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: '1px solid #282828',
                  marginBottom: '16px',
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
                  padding: '32px 16px',
                  textAlign: 'center',
                  background: '#1A1A1A',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #282828',
                  marginBottom: '16px',
                }}
              >
                <FileText size={32} style={{ color: 'var(--color-accent)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '13px', color: '#F5F5F5', fontWeight: 500 }}>
                  PDF Certificate Document
                </div>
                <div style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>
                  Stored & ready for publishing
                </div>
              </div>
            )}

            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Open Full Asset <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}

        {/* Right Column: Editable Certificate Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Section: Core Information */}
          <div
            style={{
              background: '#141414',
              border: '1px solid #222',
              borderRadius: 'var(--radius-md)',
              padding: '28px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-accent)',
                marginBottom: '20px',
                paddingBottom: '8px',
                borderBottom: '1px solid #222',
              }}
            >
              01 / Core Credential Details
            </div>

            {/* Title & Slug */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px',
              }}
            >
              <div>
                <label style={labelStyle}>
                  <span>Title *</span>
                  {renderConfidenceBadge('title')}
                </label>
                <input
                  {...register('title')}
                  style={inputStyle}
                  onBlur={() => {
                    const curTitle = getValues('title')
                    if (!isEdit && curTitle) setValue('slug', slugify(curTitle))
                  }}
                  placeholder="e.g. Machine Learning Specialization"
                />
                {errors.title && (
                  <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>
                  <span>Slug *</span>
                  <span style={{ color: '#555', textTransform: 'none' }}>Auto-generated</span>
                </label>
                <input
                  {...register('slug')}
                  style={inputStyle}
                  placeholder="machine-learning-specialization"
                />
                {errors.slug && (
                  <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            {/* Issuer & Category */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px',
              }}
            >
              <div>
                <label style={labelStyle}>
                  <span>Issuer / Organization *</span>
                  {renderConfidenceBadge('issuer')}
                </label>
                <input
                  {...register('issuer')}
                  style={inputStyle}
                  placeholder="e.g. Stanford Online & DeepLearning.AI"
                />
                {errors.issuer && (
                  <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.issuer.message}
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>
                  <span>Category *</span>
                  {renderConfidenceBadge('category')}
                </label>
                <select {...register('category')} style={inputStyle}>
                  {CERTIFICATE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Issue Date & Expiry Date */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px',
              }}
            >
              <div>
                <label style={labelStyle}>
                  <span>Issue Date</span>
                  {renderConfidenceBadge('issue_date')}
                </label>
                <input type="date" {...register('issue_date')} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>
                  <span>Expiry Date (Optional)</span>
                  {renderConfidenceBadge('expiry_date')}
                </label>
                <input type="date" {...register('expiry_date')} style={inputStyle} />
              </div>
            </div>

            {/* Credential ID & Verification URL */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px',
              }}
            >
              <div>
                <label style={labelStyle}>
                  <span>Credential ID</span>
                  {renderConfidenceBadge('credential_id')}
                </label>
                <input
                  {...register('credential_id')}
                  style={inputStyle}
                  placeholder="e.g. STAN-ML-89241"
                />
              </div>

              <div>
                <label style={labelStyle}>
                  <span>Verification URL</span>
                  {renderConfidenceBadge('verification_url')}
                </label>
                <input
                  {...register('verification_url')}
                  style={inputStyle}
                  placeholder="https://coursera.org/verify/..."
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>
                <span>Program / Course Description</span>
                {renderConfidenceBadge('description')}
              </label>
              <textarea
                {...register('description')}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' as const }}
                placeholder="Comprehensive specialization covering supervised learning, neural networks..."
              />
            </div>

            {/* Skills */}
            <div>
              <label style={labelStyle}>
                <span>Demonstrated Skills (Comma separated)</span>
                {renderConfidenceBadge('skills')}
              </label>
              <input
                {...register('skills')}
                style={inputStyle}
                placeholder="Deep Learning, Neural Networks, PyTorch, Python"
              />
            </div>
          </div>

          {/* Section: Asset Management */}
          <div
            style={{
              background: '#141414',
              border: '1px solid #222',
              borderRadius: 'var(--radius-md)',
              padding: '28px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-accent)',
                marginBottom: '20px',
                paddingBottom: '8px',
                borderBottom: '1px solid #222',
              }}
            >
              02 / Storage & Thumbnail Assets
            </div>

            <div style={{ marginBottom: '24px' }}>
              <FileUpload
                label="Certificate Document (PDF or Image)"
                accept={{
                  'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
                  'application/pdf': ['.pdf'],
                }}
                hint="PDF, JPG, PNG · Max 15MB"
                maxSize={15 * 1024 * 1024}
                onFileSelect={handleFileUpload}
                currentUrl={fileUrl}
                onRemove={() => {
                  setFileUrl(null)
                  setPreviewDocumentUrl(null)
                }}
                uploading={uploadingFile}
              />
            </div>

            <div>
              <FileUpload
                label="Preview Thumbnail (Optional)"
                accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
                hint="JPG, PNG, or WebP · Max 5MB"
                maxSize={5 * 1024 * 1024}
                onFileSelect={handleThumbUpload}
                currentUrl={thumbUrl}
                onRemove={() => setThumbUrl(null)}
                uploading={uploadingThumb}
              />
            </div>
          </div>

          {/* Section: Visibility Flags */}
          <div
            style={{
              background: '#141414',
              border: '1px solid #222',
              borderRadius: 'var(--radius-md)',
              padding: '20px 28px',
              marginBottom: '28px',
              display: 'flex',
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
              }}
            >
              <input
                type="checkbox"
                {...register('featured')}
                style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px' }}
              />
              <span>Featured on Homepage</span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#F5F5F5',
              }}
            >
              <input
                type="checkbox"
                {...register('published')}
                style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px' }}
              />
              <span>Published (Visible in certificates)</span>
            </label>
          </div>

          {/* Submit CTA */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ padding: '14px 32px', fontSize: '14px' }}
            >
              {saving
                ? 'Saving to Database…'
                : isEdit
                ? 'Update Certificate'
                : 'Save Certificate'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/admin/certificates')}
              className="btn-secondary"
              style={{ padding: '14px 24px', fontSize: '14px' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .certificate-admin-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
