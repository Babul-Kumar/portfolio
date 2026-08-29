'use client'

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Download,
  FileText,
  Award,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react'
import { isPdfDocument } from '@/lib/supabase/storage'

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

interface CertificateLightboxProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string | null
  title: string
  issuer?: string | null
  credentialId?: string | null
  category?: string | null
  duration?: string | null
  date?: string | null
}

export default function CertificateLightbox({
  isOpen,
  onClose,
  fileUrl,
  title,
  issuer,
  credentialId,
  category,
  duration,
  date,
}: CertificateLightboxProps) {
  const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const isPdf = isPdfDocument(fileUrl)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => {
    setZoomLevel(1)
    onClose()
  }, [onClose])

  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(2.5, +(prev + 0.25).toFixed(2)))
  }, [])

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(0.5, +(prev - 0.25).toFixed(2)))
  }, [])

  const resetZoom = useCallback(() => {
    setZoomLevel(1)
  }, [])

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose()
      } else if (e.key === '+' || e.key === '=') {
        zoomIn()
      } else if (e.key === '-' || e.key === '_') {
        zoomOut()
      } else if (e.key === '0') {
        resetZoom()
      }
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleClose, zoomIn, zoomOut, resetZoom])

  if (!isClient || !isOpen || !fileUrl) return null

  const orgLabel = issuer || 'Verified Program'

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Certificate viewer for ${title}`}
      className="training-viewer-isolated-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        maxHeight: '100dvh',
        zIndex: 9999999, // Truly isolated topmost stacking layer
        background: '#07090E', // Solid non-transparent background to prevent any page bleed-through
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'trainingViewerFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
      }}
      onClick={handleClose}
    >
      {/* =========================================================================
          1. TOP VIEWER HEADER (Isolated 54px Header at top: 0, covers navbar)
          ========================================================================= */}
      <header
        style={{
          flex: '0 0 54px',
          height: '54px',
          padding: '0 clamp(16px, 3vw, 32px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#0D111A',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 10,
          gap: '12px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Back button */}
        <button
          type="button"
          onClick={handleClose}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '6px',
            color: '#F3F4F6',
            padding: '6px 14px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            transition: 'background 0.15s ease',
          }}
          aria-label="Back to Training view"
        >
          <ArrowLeft size={14} />
          <span>BACK TO TRAINING</span>
        </button>

        {/* Center Title Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-accent, #E45D2C)',
              background: 'var(--color-accent-bg, rgba(228, 93, 44, 0.12))',
              border: '1px solid var(--color-accent-border, rgba(228, 93, 44, 0.28))',
              padding: '3px 10px',
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {isPdf ? <FileText size={12} /> : <Award size={12} />}
            TRAINING CERTIFICATE VIEWER
          </span>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '6px',
            color: '#FCA5A5',
            padding: '6px 14px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 600,
            transition: 'background 0.15s ease',
          }}
          aria-label="Close viewer (Escape)"
        >
          <X size={14} />
          <span>CLOSE (ESC)</span>
        </button>
      </header>

      {/* =========================================================================
          2. CENTRAL VIEWER VIEWPORT (Calculated Height & Centering)
          ========================================================================= */}
      <main
        ref={containerRef}
        style={{
          flex: '1 1 0',
          minHeight: 0,
          minWidth: 0,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: zoomLevel > 1 ? 'auto' : 'hidden',
          padding: '16px clamp(16px, 3vw, 36px)',
          background: 'radial-gradient(circle at center, rgba(228, 93, 44, 0.05) 0%, #07090E 70%)',
        }}
        onClick={(e) => {
          if (e.target === containerRef.current) {
            handleClose()
          }
        }}
      >
        {/* Loading Spinner */}
        {isLoading && !imageError && (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--color-text-muted, #9CA3AF)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono, monospace)',
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '2px solid rgba(228, 93, 44, 0.2)',
                borderTopColor: 'var(--color-accent, #E45D2C)',
                borderRadius: '50%',
                animation: 'trainingViewerSpin 0.8s linear infinite',
              }}
            />
            <span>LOADING CERTIFICATE…</span>
          </div>
        )}

        {/* Error Fallback */}
        {imageError ? (
          <div
            style={{
              background: 'rgba(18, 22, 32, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              padding: '32px 24px',
              textAlign: 'center',
              maxWidth: '440px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Award size={40} style={{ color: 'var(--color-accent, #E45D2C)', margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#F9FAFB', margin: '0 0 8px' }}>
              {title}
            </h3>
            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 18px' }}>
              {orgLabel} · {category || 'Verified Training'}
            </p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'var(--color-accent, #E45D2C)',
                color: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Open Document Directly</span>
              <ExternalLink size={13} />
            </a>
          </div>
        ) : isPdf ? (
          /* PDF Viewer Stage */
          <div
            style={{
              width: '100%',
              maxWidth: '920px',
              height: 'clamp(380px, calc(100dvh - 180px), 740px)',
              background: '#131722',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.95)',
              zIndex: 3,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`${fileUrl}#toolbar=1`}
              title={title}
              onLoad={() => setIsLoading(false)}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          </div>
        ) : (
          /* Image Certificate Stage (Unified Centered Composition) */
          <div
            className="training-certificate-stage"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              maxWidth: '100%',
              maxHeight: '100%',
              zIndex: 3,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Framed Certificate Canvas */}
            <div
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.12)',
                background: '#0B0E14',
                transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: '0 1 auto',
                minHeight: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileUrl}
                alt={`${title} certificate issued by ${orgLabel}`}
                loading="eager"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false)
                  setImageError(true)
                }}
                style={{
                  maxHeight: 'clamp(280px, calc(100dvh - 200px), 720px)',
                  maxWidth: 'clamp(260px, calc(100vw - 64px), 920px)',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: '6px',
                  userSelect: 'none',
                  opacity: isLoading ? 0 : 1,
                  transition: 'opacity 0.2s ease',
                }}
              />
            </div>

            {/* Integrated Zoom & Fit Pill Directly Below Certificate */}
            {!isLoading && (
              <div
                style={{
                  marginTop: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'rgba(14, 18, 26, 0.96)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '9999px',
                  padding: '3px 8px',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.7)',
                  gap: '4px',
                  zIndex: 10,
                  flex: '0 0 auto',
                }}
              >
                <button
                  type="button"
                  onClick={zoomOut}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#D1D5DB',
                    padding: '5px 7px',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Zoom Out (-)"
                  aria-label="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>

                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 600,
                    color: '#F3F4F6',
                    minWidth: '42px',
                    textAlign: 'center',
                  }}
                >
                  {Math.round(zoomLevel * 100)}%
                </span>

                <button
                  type="button"
                  onClick={zoomIn}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#D1D5DB',
                    padding: '5px 7px',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Zoom In (+)"
                  aria-label="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>

                <div style={{ width: '1px', height: '12px', background: 'rgba(255, 255, 255, 0.15)', margin: '0 2px' }} />

                <button
                  type="button"
                  onClick={resetZoom}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    padding: '5px 7px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 600,
                  }}
                  title="Reset to Fit Screen (0)"
                  aria-label="Reset to Fit Screen"
                >
                  <RotateCcw size={12} />
                  <span>FIT</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* =========================================================================
          3. BOTTOM INFORMATION & ACTIONS BAR (Isolated 44px Footer at bottom: 0)
          ========================================================================= */}
      <footer
        style={{
          flex: '0 0 44px',
          height: '44px',
          padding: '0 clamp(14px, 2.5vw, 24px)',
          background: '#0A0E16',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          zIndex: 10,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Credential Metadata */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#F9FAFB' }}>
              {title}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#10B981',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '1px 6px',
                borderRadius: '3px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={11} /> VERIFIED
            </span>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono, monospace)', color: '#9CA3AF' }}>
              · {orgLabel} {duration ? `· ${duration}` : ''} {date ? `· ${date}` : ''} {credentialId ? `· ID: ${credentialId}` : ''}
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              color: '#F3F4F6',
              padding: '6px 14px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.15s ease',
            }}
            title="Open original document in a new tab"
          >
            <span>OPEN ORIGINAL</span>
            <ExternalLink size={12} />
          </a>

          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noreferrer"
            style={{
              background: 'var(--color-accent, #E45D2C)',
              borderRadius: '6px',
              color: '#FFFFFF',
              padding: '6px 16px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(228, 93, 44, 0.3)',
            }}
            title="Download credential file"
          >
            <Download size={12} />
            <span>DOWNLOAD</span>
          </a>
        </div>
      </footer>

      <style>{`
        @keyframes trainingViewerFadeIn {
          from { opacity: 0; transform: scale(0.99); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes trainingViewerSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )

  return createPortal(modalNode, document.body)
}
