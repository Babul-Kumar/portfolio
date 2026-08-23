'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileFormValues } from '@/lib/validations'
import FileUpload from '@/components/admin/FileUpload'
import type { Profile } from '@/types'
import { Toaster } from 'sonner'
import { toast } from 'sonner'

const input = { width: '100%', background: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: '6px', padding: '10px 14px', color: '#F5F5F5', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }
const label = { display: 'block', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#666', marginBottom: '6px' }
const section = { background: '#1A1A1A', border: '1px solid #222', borderRadius: '10px', padding: '28px', marginBottom: '20px' }

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('profiles').select('*').limit(1).single()
      if (data) {
        setProfile(data)
        setAvatarUrl(data.avatar_url)
        reset({
          name: data.name ?? '',
          display_name: data.display_name ?? '',
          tagline: data.tagline ?? '',
          bio: data.bio ?? '',
          bio_extended: data.bio_extended ?? '',
          location: data.location ?? '',
          university: data.university ?? '',
          degree: data.degree ?? '',
          graduation_year: data.graduation_year ? String(data.graduation_year) : '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          github_url: data.github_url ?? '',
          linkedin_url: data.linkedin_url ?? '',
          kaggle_url: data.kaggle_url ?? '',
          portfolio_url: data.portfolio_url ?? '',
          available_for: data.available_for ?? '',
        })
      }
    }
    load()
  }, [reset])

  async function handleAvatarUpload(file: File) {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'profile')
    formData.append('prefix', 'avatar')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) setAvatarUrl(data.url)
    setUploading(false)
  }

  async function onSubmit(values: ProfileFormValues) {
    setSaving(true)
    const supabase = createClient()

    const payload = {
      ...values,
      avatar_url: avatarUrl,
      graduation_year: values.graduation_year ? Number(values.graduation_year) : null,
    }

    if (profile?.id) {
      const { error } = await supabase.from('profiles').update(payload).eq('id', profile.id)
      if (error) { toast.error('Failed to save'); setSaving(false); return }
    } else {
      const { error } = await supabase.from('profiles').insert(payload)
      if (error) { toast.error('Failed to save'); setSaving(false); return }
    }

    toast.success('Profile saved successfully')
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: '760px' }}>
      <Toaster position="top-right" theme="dark" />
      <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#F5F5F5', marginBottom: '32px' }}>Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Avatar */}
        <div style={section}>
          <FileUpload
            label="Profile Photo"
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div><label style={label}>Full Name *</label><input {...register('name')} style={input} /></div>
            <div><label style={label}>Display Name</label><input {...register('display_name')} style={input} placeholder="BABUL KUMAR" /></div>
          </div>
          <div style={{ marginBottom: '16px' }}><label style={label}>Tagline</label><input {...register('tagline')} style={input} placeholder="CS · AI/ML · Full Stack" /></div>
          <div style={{ marginBottom: '16px' }}><label style={label}>Short Bio</label><textarea {...register('bio')} style={{ ...input, minHeight: '80px', resize: 'vertical' as const }} /></div>
          <div><label style={label}>Extended Bio</label><textarea {...register('bio_extended')} style={{ ...input, minHeight: '100px', resize: 'vertical' as const }} /></div>
        </div>

        {/* Education */}
        <div style={section}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div><label style={label}>University</label><input {...register('university')} style={input} /></div>
            <div><label style={label}>Degree</label><input {...register('degree')} style={input} /></div>
            <div><label style={label}>Graduation Year</label><input type="number" {...register('graduation_year')} style={input} /></div>
            <div><label style={label}>Location</label><input {...register('location')} style={input} /></div>
          </div>
          <div><label style={label}>Available For</label><input {...register('available_for')} style={input} placeholder="Internships, Research, Open Source" /></div>
        </div>

        {/* Contact */}
        <div style={section}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><label style={label}>Email</label><input {...register('email')} type="email" style={input} /></div>
            <div><label style={label}>Phone</label><input {...register('phone')} style={input} /></div>
            <div><label style={label}>GitHub URL</label><input {...register('github_url')} style={input} /></div>
            <div><label style={label}>LinkedIn URL</label><input {...register('linkedin_url')} style={input} /></div>
            <div><label style={label}>Kaggle URL</label><input {...register('kaggle_url')} style={input} /></div>
            <div><label style={label}>Portfolio URL</label><input {...register('portfolio_url')} style={input} /></div>
          </div>
        </div>

        <button type="submit" disabled={saving} style={{ background: saving ? '#333' : '#B65C3A', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 28px', fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
