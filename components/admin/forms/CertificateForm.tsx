'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { certificateSchema, type CertificateFormValues } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { slugify, joinCSV, parseCSV } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FileUpload from '@/components/admin/FileUpload'
import type { Certificate } from '@/types'

const input = {
  width: '100%', background: '#1A1A1A', border: '1px solid #2C2C2C',
  borderRadius: '6px', padding: '10px 14px', color: '#F5F5F5',
  fontSize: '14px', outline: 'none', fontFamily: 'inherit',
}

const label = {
  display: 'block', fontSize: '11px', letterSpacing: '0.08em',
  textTransform: 'uppercase' as const, color: '#666', marginBottom: '6px',
}

const CATEGORIES = ['AI / ML', 'Full Stack', 'Programming', 'Cloud', 'Data', 'Cybersecurity', 'Hackathon', 'Other']

export default function CertificateForm({ certificate }: { certificate?: Certificate }) {
  const router = useRouter()
  const isEdit = !!certificate
  const [saving, setSaving] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | null>(certificate?.file_url ?? null)
  const [thumbUrl, setThumbUrl] = useState<string | null>(certificate?.thumbnail_url ?? null)
  const [uploading, setUploading] = useState<'file' | 'thumb' | null>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CertificateFormValues>({
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
      published: certificate?.published ?? true,
    },
  })

  const title = watch('title')

  async function handleUpload(file: File, type: 'file' | 'thumb') {
    setUploading(type)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'certificates')
    formData.append('prefix', type)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (type === 'file') setFileUrl(data.url ?? null)
    else setThumbUrl(data.url ?? null)
    setUploading(null)
  }

  async function onSubmit(values: CertificateFormValues) {
    setSaving(true)
    const supabase = createClient()

    const payload = {
      title: values.title,
      slug: values.slug || slugify(values.title),
      issuer: values.issuer,
      category: values.category,
      issue_date: values.issue_date || null,
      expiry_date: values.expiry_date || null,
      credential_id: values.credential_id || null,
      verification_url: values.verification_url || null,
      description: values.description || null,
      skills: values.skills ? parseCSV(values.skills) : [],
      featured: values.featured,
      published: values.published,
      file_url: fileUrl,
      thumbnail_url: thumbUrl,
    }

    if (isEdit) {
      await supabase.from('certificates').update(payload).eq('id', certificate.id)
    } else {
      await supabase.from('certificates').insert(payload)
    }

    setSaving(false)
    router.push('/admin/certificates')
  }

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#F5F5F5' }}>
          {isEdit ? 'Edit Certificate' : 'New Certificate'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: '10px', padding: '28px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={label}>Title *</label>
              <input {...register('title')} style={input} onBlur={() => !isEdit && setValue('slug', slugify(title))} />
              {errors.title && <p style={{ color: '#C96B46', fontSize: '12px', marginTop: '4px' }}>{errors.title.message}</p>}
            </div>
            <div>
              <label style={label}>Slug *</label>
              <input {...register('slug')} style={input} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={label}>Issuer *</label>
              <input {...register('issuer')} style={input} placeholder="e.g. Coursera, Google, AWS" />
            </div>
            <div>
              <label style={label}>Category</label>
              <select {...register('category')} style={input}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={label}>Issue Date</label>
              <input type="date" {...register('issue_date')} style={input} />
            </div>
            <div>
              <label style={label}>Expiry Date</label>
              <input type="date" {...register('expiry_date')} style={input} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={label}>Credential ID</label>
            <input {...register('credential_id')} style={input} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={label}>Verification URL</label>
            <input {...register('verification_url')} style={input} placeholder="https://…" />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={label}>Skills (comma-separated)</label>
            <input {...register('skills')} style={input} placeholder="Python, Machine Learning, TensorFlow" />
          </div>

          <div>
            <label style={label}>Description</label>
            <textarea {...register('description')} style={{ ...input, minHeight: '80px', resize: 'vertical' }} />
          </div>
        </div>

        {/* File uploads */}
        <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: '10px', padding: '28px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <FileUpload
              label="Certificate File"
              accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 'application/pdf': ['.pdf'] }}
              hint="PDF, JPG, PNG or WebP · Max 20MB"
              maxSize={20 * 1024 * 1024}
              onFileSelect={(f) => handleUpload(f, 'file')}
              currentUrl={fileUrl}
              onRemove={() => setFileUrl(null)}
              uploading={uploading === 'file'}
            />
            <FileUpload
              label="Thumbnail"
              accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
              hint="JPG, PNG or WebP · Max 5MB"
              maxSize={5 * 1024 * 1024}
              onFileSelect={(f) => handleUpload(f, 'thumb')}
              currentUrl={thumbUrl}
              onRemove={() => setThumbUrl(null)}
              uploading={uploading === 'thumb'}
            />
          </div>
        </div>

        <div style={{
          background: '#1A1A1A', border: '1px solid #222', borderRadius: '10px',
          padding: '24px 28px', marginBottom: '24px', display: 'flex', gap: '32px',
        }}>
          {(['featured', 'published'] as const).map((key) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" {...register(key)} style={{ accentColor: '#B65C3A', width: '16px', height: '16px' }} />
              <span style={{ fontSize: '13px', color: '#888', textTransform: 'capitalize' }}>{key}</span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={saving} style={{
            background: saving ? '#333' : '#B65C3A', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '12px 24px', fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Certificate'}
          </button>
          <a href="/admin/certificates" style={{ padding: '12px 20px', color: '#555', fontSize: '13px', textDecoration: 'none' }}>
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
