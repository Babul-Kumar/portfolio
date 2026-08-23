'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/admin/FileUpload'
import { RefreshCw, CheckCircle2 } from 'lucide-react'
import { toast, Toaster } from 'sonner'

export default function AdminSettingsPage() {
  const [resumeUrl, setResumeUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const [messages, setMessages] = useState<
    { id: string; name: string; email: string; message: string; created_at: string; read: boolean }[]
  >([])
  const [loadingMsgs, setLoadingMsgs] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const supabase = createClient()
      const [{ data: setting }, { data: msgs }] = await Promise.all([
        supabase.from('site_settings').select('value').eq('key', 'resume_url').single(),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(50),
      ])
      if (active) {
        if (setting?.value) setResumeUrl(setting.value)
        setMessages(msgs ?? [])
        setLoadingMsgs(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  async function handleResumeUpload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'resume')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setResumeUrl(data.url)
        const supabase = createClient()
        await supabase.from('site_settings').upsert({ key: 'resume_url', value: data.url })
        toast.success('Resume uploaded successfully')
      } else {
        toast.error(data.error ?? 'Upload failed')
      }
    } catch {
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  async function handleSyncContent() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/admin/sync', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Content synchronization completed')
        setSyncResult('All baseline projects, certificates, achievements, skills, and profile records are synced to the database.')
      } else {
        toast.error(data.error || 'Sync failed')
      }
    } catch {
      toast.error('Sync failed — check network connectivity')
    } finally {
      setSyncing(false)
    }
  }

  async function markRead(id: string, read: boolean) {
    const supabase = createClient()
    const { error } = await supabase.from('contact_messages').update({ read: !read }).eq('id', id)
    if (error) {
      toast.error('Failed to update message')
      return
    }
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: !read } : m)))
  }

  async function deleteMessage(id: string) {
    if (!confirm('Delete this message?')) return
    const supabase = createClient()
    const { error } = await supabase.from('contact_messages').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete message')
      return
    }
    toast.success('Message deleted')
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  const cardStyle = {
    background: '#1A1A1A',
    border: '1px solid #242424',
    borderRadius: '10px',
    padding: '28px',
    marginBottom: '24px',
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <Toaster position="top-right" theme="dark" />
      <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F5F5F5', marginBottom: '32px', letterSpacing: '-0.02em' }}>
        Settings & Database Sync
      </h1>

      {/* Database Sync */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#F5F5F5', marginBottom: '8px' }}>
          Database Content Synchronization
        </h2>
        <p style={{ fontSize: '13px', color: '#777', lineHeight: '1.5', marginBottom: '16px' }}>
          Sync initial baseline records (projects, certificates, achievements, education, experience, skills) into the Supabase database. This operation is idempotent and will not overwrite existing database records.
        </p>

        {syncResult && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(74, 124, 89, 0.15)', border: '1px solid rgba(74, 124, 89, 0.3)', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', color: '#7CC594', fontSize: '12px' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{syncResult}</span>
          </div>
        )}

        <button
          onClick={handleSyncContent}
          disabled={syncing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: syncing ? '#333' : '#E45D2C',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: syncing ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Synchronizing Data…' : 'Sync Baseline Data to Supabase'}
        </button>
      </div>

      {/* Resume */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#F5F5F5', marginBottom: '16px' }}>
          Resume Document
        </h2>
        {resumeUrl && (
          <div style={{ marginBottom: '12px' }}>
            <a href={resumeUrl} target="_blank" rel="noreferrer" style={{ color: '#E45D2C', fontSize: '13px', textDecoration: 'none' }}>
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
        <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#F5F5F5', marginBottom: '16px' }}>
          Contact Messages{' '}
          <span style={{ color: '#666', fontSize: '13px', fontWeight: 400 }}>
            ({messages.filter((m) => !m.read).length} unread)
          </span>
        </h2>
        {loadingMsgs ? (
          <div style={{ color: '#666', fontSize: '13px' }}>Loading…</div>
        ) : messages.length === 0 ? (
          <div style={{ color: '#666', fontSize: '13px' }}>No messages yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  background: msg.read ? '#141414' : '#1E1E1E',
                  border: `1px solid ${msg.read ? '#222' : '#333'}`,
                  borderRadius: '8px',
                  padding: '14px 18px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '6px',
                  }}
                >
                  <div>
                    <span style={{ color: '#F5F5F5', fontSize: '13px', fontWeight: 500 }}>{msg.name}</span>
                    <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>{msg.email}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#555' }}>
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => markRead(msg.id, msg.read)}
                      style={{
                        background: 'none',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        color: '#777',
                        fontSize: '11px',
                        padding: '3px 8px',
                        cursor: 'pointer',
                      }}
                    >
                      {msg.read ? 'Mark unread' : 'Mark read'}
                    </button>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '14px' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#E45D2C')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <p style={{ color: '#888', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{msg.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
