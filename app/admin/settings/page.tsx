'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/admin/FileUpload'
import {
  RefreshCw,
  CheckCircle2,
  FileText,
  Mail,
  Trash2,
  ExternalLink,
  Database,
} from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { uploadFileFromBrowser } from '@/lib/supabase/storage-client'
import StatusBadge from '@/components/admin/StatusBadge'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

const cardStyle = {
  background: '#101318',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
}

export default function AdminSettingsPage() {
  const [resumeUrl, setResumeUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const [messages, setMessages] = useState<
    { id: string; name: string; email: string; message: string; created_at: string; read: boolean }[]
  >([])
  const [loadingMsgs, setLoadingMsgs] = useState(true)

  // Confirm delete message
  const [deleteMsgId, setDeleteMsgId] = useState<string | null>(null)

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
      const result = await uploadFileFromBrowser('resume', file, 'cv')
      if (result.url) {
        setResumeUrl(result.url)
        const supabase = createClient()
        await supabase.from('site_settings').upsert({ key: 'resume_url', value: result.url })
        toast.success('Resume uploaded to Supabase Storage')
      } else {
        toast.error(result.error ?? 'Upload failed')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload file'
      toast.error(msg)
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
        setSyncResult(
          'All baseline projects, certificates, achievements, skills, and profile records are synced to the database.'
        )
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

  async function confirmDeleteMessage() {
    if (!deleteMsgId) return
    const supabase = createClient()
    const { error } = await supabase.from('contact_messages').delete().eq('id', deleteMsgId)
    if (error) {
      toast.error('Failed to delete message')
      return
    }
    toast.success('Message deleted')
    setMessages((prev) => prev.filter((m) => m.id !== deleteMsgId))
    setDeleteMsgId(null)
  }

  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Toaster position="top-right" theme="dark" />

      {/* Header */}
      <div
        style={{
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '28px',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#F5F5F5',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Settings & System Operations
        </h1>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px', margin: 0 }}>
          Manage resume documents, database baseline synchronization, and visitor contact messages
        </p>
      </div>

      {/* Section 1: Resume Document */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: '#E45D2C' }} />
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#F5F5F5', margin: 0 }}>
              Curriculum Vitae / Resume Document
            </h2>
          </div>

          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#E45D2C',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>View Current Resume</span>
              <ExternalLink size={13} />
            </a>
          )}
        </div>

        <FileUpload
          label="Upload Resume PDF"
          accept={{ 'application/pdf': ['.pdf'] }}
          hint="PDF format only · Max 10MB"
          maxSize={10 * 1024 * 1024}
          onFileSelect={handleResumeUpload}
          currentUrl={resumeUrl}
          onRemove={() => setResumeUrl('')}
          uploading={uploading}
        />
      </div>

      {/* Section 2: Database Synchronization */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <Database size={18} style={{ color: '#38BDF8' }} />
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#F5F5F5', margin: 0 }}>
            Database Baseline Content Synchronization
          </h2>
        </div>

        <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.5, marginBottom: '16px' }}>
          Sync initial baseline records (projects, certificates, achievements, education, experience,
          skills) into the Supabase database. This operation is idempotent and will not overwrite
          existing customized database records.
        </p>

        {syncResult && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.28)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              color: '#10B981',
              fontSize: '13px',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{syncResult}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleSyncContent}
          disabled={syncing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: syncing ? '#333' : '#13171F',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            color: '#F5F5F5',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: syncing ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Synchronizing Data…' : 'Sync Baseline Data to Supabase'}
        </button>
      </div>

      {/* Section 3: Contact Messages */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={18} style={{ color: '#E45D2C' }} />
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#F5F5F5', margin: 0 }}>
              Visitor Contact Inquiries
            </h2>
          </div>

          <StatusBadge
            type={unreadCount > 0 ? 'featured' : 'published'}
            label={unreadCount > 0 ? `${unreadCount} Unread` : 'All Read'}
          />
        </div>

        {loadingMsgs ? (
          <div style={{ color: '#6B7280', fontSize: '13px', padding: '24px 0', textAlign: 'center' }}>
            Loading contact inquiries…
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              padding: '32px 20px',
              textAlign: 'center',
              color: '#6B7280',
              fontSize: '13px',
              background: '#0D0F14',
              borderRadius: '8px',
            }}
          >
            No contact messages received yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  background: msg.read ? '#0D0F14' : '#141822',
                  border: `1px solid ${
                    msg.read ? 'rgba(255, 255, 255, 0.06)' : 'rgba(228, 93, 44, 0.28)'
                  }`,
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'border-color 0.15s',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div>
                    <span style={{ color: '#F5F5F5', fontSize: '14px', fontWeight: 600 }}>
                      {msg.name}
                    </span>
                    <span
                      style={{
                        color: '#9CA3AF',
                        fontSize: '12px',
                        marginLeft: '8px',
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    >
                      {msg.email}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>

                    <button
                      type="button"
                      onClick={() => markRead(msg.id, msg.read)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        color: msg.read ? '#9CA3AF' : '#10B981',
                        fontSize: '11px',
                        fontWeight: 500,
                        padding: '3px 8px',
                        cursor: 'pointer',
                      }}
                    >
                      {msg.read ? 'Mark unread' : 'Mark as read'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteMsgId(msg.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Delete message"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p style={{ color: '#D1D5DB', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteMsgId)}
        title="Delete Contact Message"
        description="Are you sure you want to permanently delete this message record?"
        confirmLabel="Delete Message"
        onConfirm={confirmDeleteMessage}
        onCancel={() => setDeleteMsgId(null)}
      />
    </div>
  )
}
