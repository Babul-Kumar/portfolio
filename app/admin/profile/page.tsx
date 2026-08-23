'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileFormValues } from '@/lib/validations'
import FileUpload from '@/components/admin/FileUpload'
import { FALLBACK_PROFILE } from '@/lib/data'
import { Toaster, toast } from 'sonner'

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
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#666',
  marginBottom: '6px',
}
const section = {
  background: '#1A1A1A',
  border: '1px solid #242424',
  borderRadius: '10px',
  padding: '24px',
  marginBottom: '20px',
}

export default function AdminProfilePage() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from('profiles').select('*').limit(1).single()
        const activeProfile = (!error && data) ? data : FALLBACK_PROFILE
        setAvatarUrl(activeProfile.avatar_url)
        reset({
          name: activeProfile.name ?? '',
          display_name: activeProfile.display_name ?? '',
          tagline: activeProfile.tagline ?? '',
          bio: activeProfile.bio ?? '',
          bio_extended: activeProfile.bio_extended ?? '',
          location: activeProfile.location ?? '',
          university: activeProfile.university ?? '',
          degree: activeProfile.degree ?? '',
          graduation_year: activeProfile.graduation_year ? String(activeProfile.graduation_year) : '',
          email: activeProfile.email ?? '',
          phone: activeProfile.phone ?? '',
          github_url: activeProfile.github_url ?? '',
          linkedin_url: activeProfile.linkedin_url ?? '',
          kaggle_url: activeProfile.kaggle_url ?? '',
          portfolio_url: activeProfile.portfolio_url ?? '',
          available_for: activeProfile.available_for ?? '',
        })
      } catch {
        reset({
          name: FALLBACK_PROFILE.name ?? '',
          display_name: FALLBACK_PROFILE.display_name ?? '',
          tagline: FALLBACK_PROFILE.tagline ?? '',
          bio: FALLBACK_PROFILE.bio ?? '',
          bio_extended: FALLBACK_PROFILE.bio_extended ?? '',
          location: FALLBACK_PROFILE.location ?? '',
          university: FALLBACK_PROFILE.university ?? '',
          degree: FALLBACK_PROFILE.degree ?? '',
          graduation_year: FALLBACK_PROFILE.graduation_year ? String(FALLBACK_PROFILE.graduation_year) : '',
          email: FALLBACK_PROFILE.email ?? '',
          phone: FALLBACK_PROFILE.phone ?? '',
          github_url: FALLBACK_PROFILE.github_url ?? '',
          linkedin_url: FALLBACK_PROFILE.linkedin_url ?? '',
          kaggle_url: FALLBACK_PROFILE.kaggle_url ?? '',
          portfolio_url: FALLBACK_PROFILE.portfolio_url ?? '',
          available_for: FALLBACK_PROFILE.available_for ?? '',
        })
      }
    }
    load()
  }, [reset])

  async function handleAvatarUpload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'profile picture')
      formData.append('prefix', 'avatar')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setAvatarUrl(data.url)
        toast.success('Avatar uploaded')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(values: ProfileFormValues) {
    setSaving(true)
    try {
      const supabase = createClient()
      const payload = {
        ...values,
        avatar_url: avatarUrl,
        graduation_year: values.graduation_year ? Number(values.graduation_year) : null,
      }

      // Check if profile exists in database
      const { data: existing } = await supabase.from('profiles').select('id').limit(1).single()

      if (existing?.id) {
        const { error } = await supabase.from('profiles').update(payload).eq('id', existing.id)
        if (error) {
          toast.error(`Failed to save: ${error.message}`)
          setSaving(false)
          return
        }
      } else {
        const { error } = await supabase.from('profiles').insert(payload)
        if (error) {
          toast.error(`Failed to save: ${error.message}`)
          setSaving(false)
          return
        }
      }

      toast.success('Profile saved successfully')
      setSaving(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile'
      toast.error(message)
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <Toaster position="top-right" theme="dark" />
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F5F5F5', letterSpacing: '-0.02em' }}>
          Personal Profile & Bio
        </h1>
        <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
          Manage your public identity, bio narratives, academic details, and contact points
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Avatar */}
        <div style={section}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#F5F5F5', marginBottom: '16px' }}>
            Profile Photograph
          </h2>
          <FileUpload
            label="Avatar Image"
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
            hint="JPG, PNG or WebP · Max 5MB"
            maxSize={5 * 1024 * 1024}
            onFileSelect={handleAvatarUpload}
            currentUrl={avatarUrl}
            onRemove={() => setAvatarUrl(null)}
            uploading={uploading}
          />
        </div>

        {/* Identity */}
        <div style={section}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#F5F5F5', marginBottom: '16px' }}>
            Identity & Narrative
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={label}>Full Name *</label>
              <input {...register('name')} style={input} />
            </div>
            <div>
              <label style={label}>Display Name</label>
              <input {...register('display_name')} style={input} placeholder="BABUL KUMAR" />
            </div>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Tagline</label>
            <input {...register('tagline')} style={input} placeholder="Computer Science · AI / ML · Full Stack" />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Short Bio (Hero & Preview)</label>
            <textarea {...register('bio')} style={{ ...input, minHeight: '80px', resize: 'vertical' as const }} />
          </div>
          <div>
            <label style={label}>Extended Narrative (About Section)</label>
            <textarea {...register('bio_extended')} style={{ ...input, minHeight: '110px', resize: 'vertical' as const }} />
          </div>
        </div>

        {/* Academics & Status */}
        <div style={section}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#F5F5F5', marginBottom: '16px' }}>
            Academic Profile
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={label}>University</label>
              <input {...register('university')} style={input} />
            </div>
            <div>
              <label style={label}>Degree Program</label>
              <input {...register('degree')} style={input} />
            </div>
            <div>
              <label style={label}>Graduation Year</label>
              <input type="number" {...register('graduation_year')} style={input} />
            </div>
            <div>
              <label style={label}>Location</label>
              <input {...register('location')} style={input} />
            </div>
          </div>
          <div>
            <label style={label}>Available For</label>
            <input {...register('available_for')} style={input} placeholder="Internships, Research Collaborations, Open Source" />
          </div>
        </div>

        {/* Contact & Socials */}
        <div style={section}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#F5F5F5', marginBottom: '16px' }}>
            Links & Contact Points
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={label}>Email</label>
              <input {...register('email')} type="email" style={input} />
            </div>
            <div>
              <label style={label}>Phone</label>
              <input {...register('phone')} style={input} />
            </div>
            <div>
              <label style={label}>GitHub URL</label>
              <input {...register('github_url')} style={input} />
            </div>
            <div>
              <label style={label}>LinkedIn URL</label>
              <input {...register('linkedin_url')} style={input} />
            </div>
            <div>
              <label style={label}>Kaggle URL</label>
              <input {...register('kaggle_url')} style={input} />
            </div>
            <div>
              <label style={label}>Portfolio URL</label>
              <input {...register('portfolio_url')} style={input} />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            background: saving ? '#333' : '#E45D2C',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 28px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {saving ? 'Saving Profile…' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  )
}
