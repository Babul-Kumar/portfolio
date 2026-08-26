'use client'

import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  itemName?: string
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  itemName,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen && !loading) {
        onCancel()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, loading, onCancel])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        ref={dialogRef}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#13171F',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          animation: 'slideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {isDestructive && (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={18} />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              id="confirm-dialog-title"
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#F5F5F5',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: '#9CA3AF',
                marginTop: '6px',
                lineHeight: 1.5,
                margin: '6px 0 0',
              }}
            >
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6B7280',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Item Target Highlight */}
        {itemName && (
          <div
            style={{
              padding: '12px 24px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '13px',
              color: '#E5E7EB',
              fontFamily: 'var(--font-mono, monospace)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            &ldquo;{itemName}&rdquo;
          </div>
        )}

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            background: '#0E1116',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#D1D5DB',
              fontSize: '13px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              background: isDestructive ? '#DC2626' : '#E45D2C',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(12px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
