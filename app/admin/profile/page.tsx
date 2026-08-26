'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileFormValues } from '@/lib/validations'
import FileUpload from '@/components/admin/FileUpload'
import { FALLBACK_PROFILE } from '@/lib/data'
import { Toaster, toast } from 'sonner'
import { uploadFileFromBrowser } from '@/lib/supabase/storage-client'
import { User, GraduationCap, Globe, Save } from 'lucide-react'

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
      const result = await uploadFileFromBrowser('profile picture', file, 'avatar')
      if (result.url) {
        setAvatarUrl(result.url)
        toast.success('Avatar uploaded to Supabase Storage')
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

  async function onSubmit(values: ProfileFormValues) {
    setSaving(true)
    try {
      const supabase = createClient()
      const payload = {
        ...values,
        avatar_url: avatarUrl,
        graduation_year: values.graduation_year ? Number(values.graduation_year) : null,
      }

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
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
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
            Personal Profile & Narrative
          </h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px', margin: 0 }}>
            Manage your public identity, bio narratives, academic credentials, and contact points
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
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Section 1: Avatar Image */}
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
            <User size={16} style={{ color: '#E45D2C' }} />
            <span>Profile Photo</span>
          </div>

          <FileUpload
            label="Avatar Headshot"
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
            hint="JPG, PNG, or WebP · Max 5MB"
            maxSize={5 * 1024 * 1024}
            onFileSelect={handleAvatarUpload}
            currentUrl={avatarUrl}
            onRemove={() => setAvatarUrl(null)}
            uploading={uploading}
          />
        </div>

        {/* Section 2: Identity & Narrative */}
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
            <User size={16} style={{ color: '#E45D2C' }} />
            <span>Identity & Narrative</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px',
              marginBottom: '14px',
            }}
          >
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input {...register('name')} style={inputStyle} placeholder="Babul Kumar" />
            </div>
            <div>
              <label style={labelStyle}>Display Brand Name</label>
              <input {...register('display_name')} style={inputStyle} placeholder="BABUL KUMAR" />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Tagline / Subtitle</label>
            <input
              {...register('tagline')}
              style={inputStyle}
              placeholder="Computer Science · AI / ML · Full Stack Engineer"
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Short Bio (Hero & Previews)</label>
            <textarea
              {...register('bio')}
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }}
              placeholder="Concise 2-sentence summary of your technical focus and strengths…"
            />
          </div>

          <div>
            <label style={labelStyle}>Extended Bio (About Section)</label>
            <textarea
              {...register('bio_extended')}
              style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' as const }}
              placeholder="Full narrative covering your engineering journey, philosophy, and projects…"
            />
          </div>
        </div>

        {/* Section 3: Academics & Education Profile */}
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
            <GraduationCap size={16} style={{ color: '#E45D2C' }} />
            <span>Academic Background</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px',
              marginBottom: '14px',
            }}
          >
            <div>
              <label style={labelStyle}>University / Institute</label>
              <input {...register('university')} style={inputStyle} placeholder="University name" />
            </div>
            <div>
              <label style={labelStyle}>Degree Program</label>
              <input {...register('degree')} style={inputStyle} placeholder="e.g. B.Tech Computer Science" />
            </div>
            <div>
              <label style={labelStyle}>Graduation Year</label>
              <input type="number" {...register('graduation_year')} style={inputStyle} placeholder="2026" />
            </div>
            <div>
              <label style={labelStyle}>Location / Base</label>
              <input {...register('location')} style={inputStyle} placeholder="e.g. India" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Currently Available For</label>
            <input
              {...register('available_for')}
              style={inputStyle}
              placeholder="Full-time Roles, Internships, Research Collaborations"
            />
          </div>
        </div>

        {/* Section 4: Social Links & Contact Points */}
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
            <Globe size={16} style={{ color: '#E45D2C' }} />
            <span>Links & Contact Points</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px',
            }}
          >
            <div>
              <label style={labelStyle}>Email Address</label>
              <input {...register('email')} type="email" style={inputStyle} placeholder="you@example.com" />
            </div>
            <div>
              <label style={labelStyle}>Phone (Optional)</label>
              <input {...register('phone')} style={inputStyle} placeholder="+91..." />
            </div>
            <div>
              <label style={labelStyle}>GitHub Profile URL</label>
              <input {...register('github_url')} style={inputStyle} placeholder="https://github.com/..." />
            </div>
            <div>
              <label style={labelStyle}>LinkedIn Profile URL</label>
              <input {...register('linkedin_url')} style={inputStyle} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label style={labelStyle}>Kaggle / LeetCode URL</label>
              <input {...register('kaggle_url')} style={inputStyle} placeholder="https://kaggle.com/..." />
            </div>
            <div>
              <label style={labelStyle}>Canonical Portfolio URL</label>
              <input {...register('portfolio_url')} style={inputStyle} placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
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
              padding: '12px 28px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(228, 93, 44, 0.3)',
              transition: 'all 0.15s',
            }}
          >
            <Save size={16} />
            {saving ? 'Saving Profile…' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
