'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Trash2,
  Check,
  RotateCcw,
  Star,
  ExternalLink,
  CheckCheck,
  Inbox,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import type { ContactMessage } from '@/types'
import ConfirmDialog from './ConfirmDialog'

interface VisitorContactInquiriesProps {
  initialMessages: ContactMessage[]
}

export default function VisitorContactInquiries({
  initialMessages,
}: VisitorContactInquiriesProps) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  const unreadCount = messages.filter((m) => !m.read).length
  const readCount = messages.filter((m) => m.read).length

  const filteredMessages = messages.filter((m) => {
    if (filter === 'unread') return !m.read
    if (filter === 'read') return m.read
    return true
  })

  // Format date cleanly as D/M/YYYY or DD/MM/YYYY matching screenshot
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
    } catch {
      return dateStr
    }
  }

  // Toggle read status
  async function handleToggleRead(id: string, currentRead: boolean) {
    const nextRead = !currentRead
    // Optimistic UI update
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: nextRead } : m))
    )

    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: nextRead }),
      })

      if (!res.ok) {
        throw new Error('Failed to update status')
      }
      toast.success(nextRead ? 'Marked as read' : 'Marked as unread')
    } catch {
      // Revert on failure
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: currentRead } : m))
      )
      toast.error('Could not update message status')
    }
  }

  // Mark all as read
  async function handleMarkAllAsRead() {
    if (unreadCount === 0) return
    setIsMarkingAll(true)

    // Optimistic update
    const previous = [...messages]
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })))

    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })

      if (!res.ok) throw new Error('Failed to mark all read')
      toast.success('All inquiries marked as read')
    } catch {
      setMessages(previous)
      toast.error('Failed to mark all as read')
    } finally {
      setIsMarkingAll(false)
    }
  }

  // Delete message confirmation & execution
  async function handleConfirmDelete() {
    if (!deleteId) return
    setIsDeleting(true)

    try {
      const res = await fetch(`/api/admin/messages?id=${deleteId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete message')

      setMessages((prev) => prev.filter((m) => m.id !== deleteId))
      toast.success('Inquiry record deleted')
    } catch {
      toast.error('Could not delete inquiry')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #10141C 0%, #0A0D14 100%)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius: '14px',
        padding: 'clamp(18px, 2.5vw, 24px)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(228, 93, 44, 0.04)',
      }}
    >
      {/* Background Cyber Blueprint Grid Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(228, 93, 44, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(228, 93, 44, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
          opacity: 0.8,
        }}
      />

      {/* =========================================================================
          1. Header Row Matching User Screenshot
          ========================================================================= */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(228, 93, 44, 0.12)',
              border: '1px solid rgba(228, 93, 44, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#E45D2C',
            }}
          >
            <Mail size={17} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#F5F6F8',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Visitor Contact Inquiries
            </h3>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#8A8F98',
              }}
            >
              {messages.length} total messages received via public contact form
            </span>
          </div>
        </div>

        {/* Top-Right Badges & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {unreadCount > 0 ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'rgba(228, 93, 44, 0.15)',
                border: '1px solid rgba(228, 93, 44, 0.38)',
                color: '#FF8A3D',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 600,
                boxShadow: '0 0 12px rgba(228, 93, 44, 0.18)',
              }}
            >
              <Star size={12} fill="#FF8A3D" />
              <span>{unreadCount} Unread</span>
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10B981',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 600,
              }}
            >
              <Check size={12} />
              <span>All Read</span>
            </span>
          )}

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#D1D5DB',
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                padding: '5px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s',
              }}
              className="admin-inquiry-btn-hover"
            >
              <CheckCheck size={12} style={{ color: '#10B981' }} />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. Filter Tabs Row (All / Unread / Read)
          ========================================================================= */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          paddingBottom: '12px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={12} style={{ color: '#6B7280' }} />
          <span style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'var(--font-mono)' }}>
            FILTER:
          </span>

          <button
            type="button"
            onClick={() => setFilter('all')}
            style={{
              background: filter === 'all' ? 'rgba(228, 93, 44, 0.12)' : 'transparent',
              border: `1px solid ${filter === 'all' ? 'rgba(228, 93, 44, 0.35)' : 'rgba(255, 255, 255, 0.06)'}`,
              color: filter === 'all' ? '#E45D2C' : '#9CA3AF',
              padding: '3px 9px',
              borderRadius: '5px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: filter === 'all' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            All ({messages.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('unread')}
            style={{
              background: filter === 'unread' ? 'rgba(228, 93, 44, 0.12)' : 'transparent',
              border: `1px solid ${filter === 'unread' ? 'rgba(228, 93, 44, 0.35)' : 'rgba(255, 255, 255, 0.06)'}`,
              color: filter === 'unread' ? '#E45D2C' : '#9CA3AF',
              padding: '3px 9px',
              borderRadius: '5px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: filter === 'unread' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            ★ Unread ({unreadCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter('read')}
            style={{
              background: filter === 'read' ? 'rgba(228, 93, 44, 0.12)' : 'transparent',
              border: `1px solid ${filter === 'read' ? 'rgba(228, 93, 44, 0.35)' : 'rgba(255, 255, 255, 0.06)'}`,
              color: filter === 'read' ? '#E45D2C' : '#9CA3AF',
              padding: '3px 9px',
              borderRadius: '5px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: filter === 'read' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Read ({readCount})
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. Messages List with Smooth Animations
          ========================================================================= */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginTop: '4px',
        }}
      >
        {filteredMessages.length === 0 ? (
          <div
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              background: 'rgba(13, 16, 22, 0.6)',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Inbox size={28} style={{ color: '#6B7280' }} />
            <span style={{ color: '#9CA3AF', fontSize: '13px' }}>
              {filter === 'unread'
                ? 'No unread inquiries. You are all caught up!'
                : 'No contact inquiries found.'}
            </span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredMessages.map((msg) => {
              const isUnread = !msg.read

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  style={{
                    background: isUnread
                      ? 'linear-gradient(180deg, #131722 0%, #0E121B 100%)'
                      : '#0D1016',
                    border: `1px solid ${
                      isUnread
                        ? 'rgba(228, 93, 44, 0.32)'
                        : 'rgba(255, 255, 255, 0.07)'
                    }`,
                    borderLeft: isUnread
                      ? '3px solid #E45D2C'
                      : '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '8px',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: isUnread
                      ? '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 16px rgba(228, 93, 44, 0.06)'
                      : 'none',
                    transition: 'border-color 0.2s, background 0.2s, transform 0.15s',
                  }}
                  className="inquiry-card-hover"
                >
                  {/* Top Row: Sender Info & Actions */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    {/* Left: Name and Email */}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span
                        style={{
                          color: '#FFFFFF',
                          fontSize: '14.5px',
                          fontWeight: 600,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {msg.name}
                      </span>
                      <a
                        href={`mailto:${msg.email}`}
                        title="Click to write email"
                        style={{
                          color: '#9CA3AF',
                          fontSize: '12.5px',
                          fontFamily: 'var(--font-mono, monospace)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          transition: 'color 0.15s',
                        }}
                        className="hover-accent-text"
                      >
                        <span>{msg.email}</span>
                        <ExternalLink size={10} style={{ opacity: 0.7 }} />
                      </a>
                    </div>

                    {/* Right: Date, Mark as Read button, Delete button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#6B7280',
                          fontFamily: 'var(--font-mono, monospace)',
                        }}
                      >
                        {formatDate(msg.created_at)}
                      </span>

                      {/* Mark as read / Mark unread button */}
                      <button
                        type="button"
                        onClick={() => handleToggleRead(msg.id, msg.read)}
                        style={{
                          background: isUnread ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${
                            isUnread ? 'rgba(16, 185, 129, 0.38)' : 'rgba(255, 255, 255, 0.12)'
                          }`,
                          borderRadius: '6px',
                          color: isUnread ? '#10B981' : '#9CA3AF',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 500,
                          padding: '4px 10px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          transition: 'all 0.15s ease',
                        }}
                        className="admin-inquiry-btn-hover"
                      >
                        {isUnread ? (
                          <>
                            <Check size={12} />
                            <span>Mark as read</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw size={11} />
                            <span>Mark unread</span>
                          </>
                        )}
                      </button>

                      {/* Delete button matching screenshot */}
                      <button
                        type="button"
                        onClick={() => setDeleteId(msg.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '5px 8px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                        title="Delete message record"
                        className="admin-delete-btn-hover"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Message Body */}
                  <p
                    style={{
                      color: '#E5E7EB',
                      fontSize: '13.5px',
                      lineHeight: 1.55,
                      margin: '2px 0 0',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.message}
                  </p>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Delete Contact Inquiry"
        description="Are you sure you want to permanently delete this message record? This action cannot be undone."
        confirmLabel="Delete Message"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <style>{`
        .admin-inquiry-btn-hover:hover {
          filter: brightness(1.2);
          transform: translateY(-1px);
        }
        .admin-delete-btn-hover:hover {
          background: rgba(239, 68, 68, 0.2) !important;
          border-color: #EF4444 !important;
          transform: translateY(-1px);
        }
        .inquiry-card-hover:hover {
          border-color: rgba(228, 93, 44, 0.45) !important;
        }
      `}</style>
    </div>
  )
}
