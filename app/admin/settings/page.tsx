'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/admin/FileUpload'
import { toast, Toaster } from 'sonner'

export default function AdminSettingsPage() {
  const [resumeUrl, setResumeUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [messages, setMessages] = useState<{ id: string; name: string; email: string; message: string; created_at: string; read: boolean }[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: setting }, { data: msgs }] = await Promise.all([
        supabase.from('site_settings').select('value').eq('key', 'resume_url').single(),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(50),
      ])
      if (setting?.value) setResumeUrl(setting.value)
      setMessages(msgs ?? [])
      setLoadingMsgs(false)
    }
    load()
  }, [])

  async function handleResumeUpload(file: File) {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'resume')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) {
      setResumeUrl(data.url)
      // Auto-save to DB
      const supabase = createClient()
      await supabase.from('site_settings').upsert({ key: 'resume_url', value: data.url })
      toast.success('Resume uploaded')
    }
    setUploading(false)
  }

  async function markRead(id: string, read: boolean) {
    const supabase = createClient()
    await supabase.from('contact_messages').update({ read: !read }).eq('id', id)
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: !read } : m))
  }

  async function deleteMessage(id: string) {
    if (!confirm('Delete this message?')) return
    const supabase = createClient()
    await supabase.from('contact_messages').delete().eq('id', id)
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  const cardStyle = { background: '#1A1A1A', border: '1px solid #222', borderRadius: '10px', padding: '28px', marginBottom: '24px' }

  return (
    <div style={{ maxWidth: '900px' }}>
      <Toaster position="top-right" theme="dark" />
      <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#F5F5F5', marginBottom: '32px' }}>Settings</h1>

      {/* Resume */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#F5F5F5', marginBottom: '16px', letterSpacing: '0.05em' }}>Resume</h2>
        {resumeUrl && (
          <div style={{ marginBottom: '12px' }}>
            <a href={resumeUrl} target="_blank" rel="noreferrer" style={{ color: '#B65C3A', fontSize: '13px' }}>
              View current resume ↗
            </a>
          </div>
        )}
        <FileUpload
          label="Upload Resume PDF"
          accept={{ 'application/pdf': ['.pdf'] }}
          hint="PDF only · Max 10MB"
          maxSize={10 * 1024 * 1024}
          onFileSelect={handleResumeUpload}
          uploading={uploading}
        />
      </div>

      {/* Messages */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#F5F5F5', marginBottom: '16px' }}>
          Contact Messages <span style={{ color: '#555', fontSize: '12px' }}>({messages.filter((m) => !m.read).length} unread)</span>
        </h2>
        {loadingMsgs ? <div style={{ color: '#555', fontSize: '13px' }}>Loading…</div> : messages.length === 0 ? (
          <div style={{ color: '#555', fontSize: '13px' }}>No messages yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                background: msg.read ? '#111' : '#1E1E1E',
                border: `1px solid ${msg.read ? '#1A1A1A' : '#333'}`,
                borderRadius: '8px', padding: '14px 18px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <span style={{ color: '#F5F5F5', fontSize: '13px', fontWeight: 500 }}>{msg.name}</span>
                    <span style={{ color: '#555', fontSize: '12px', marginLeft: '8px' }}>{msg.email}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#444' }}>
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                    <button onClick={() => markRead(msg.id, msg.read)} style={{ background: 'none', border: '1px solid #333', borderRadius: '4px', color: '#555', fontSize: '11px', padding: '3px 8px', cursor: 'pointer' }}>
                      {msg.read ? 'Mark unread' : 'Mark read'}
                    </button>
                    <button onClick={() => deleteMessage(msg.id)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '12px' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#C96B46')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}>
                      ×
                    </button>
                  </div>
                </div>
                <p style={{ color: '#777', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{msg.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
