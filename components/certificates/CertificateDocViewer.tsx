'use client'

import { useState } from 'react'
import {
  FileText,
  ShieldCheck,
  Award,
  ExternalLink,
  Download,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react'
import { isPdfDocument } from '@/lib/supabase/storage'
import CertificateLightbox from './CertificateLightbox'

interface CertificateDocViewerProps {
  publicFileUrl: string | null
  title: string
  issuer: string
  category: string
  credentialId?: string | null
}

export default function CertificateDocViewer({
  publicFileUrl,
  title,
  issuer,
  category,
  credentialId,
}: CertificateDocViewerProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const isPdf = isPdfDocument(publicFileUrl)

  function zoomIn() {
    setZoomLevel((prev) => Math.min(2.5, +(prev + 0.25).toFixed(2)))
  }

  function zoomOut() {
    setZoomLevel((prev) => Math.max(0.6, +(prev - 0.25).toFixed(2)))
  }

  function resetZoom() {
    setZoomLevel(1)
  }

  if (!publicFileUrl) {
    return (
      <div
        style={{
          background: 'var(--color-surface, #10131A)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
        }}
      >
        <Award size={40} style={{ color: 'var(--color-accent)', margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '16px', color: 'var(--color-text)', margin: '0 0 6px' }}>
          Document Record
        </h3>
        <p style={{ fontSize: '13px', margin: 0 }}>Verified credential record for {title}.</p>
      </div>
    )
  }

  return (
    <>
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          margin: '0 auto',
          background: 'var(--color-surface, #0E121B)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg, 12px)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg, 0 20px 50px rgba(0, 0, 0, 0.6))',
        }}
      >
        {/* =========================================================================
            1. DOCUMENT VIEWER TOOLBAR
            ========================================================================= */}
        <div
          style={{
            background: 'var(--color-surface-2, #141824)',
            borderBottom: '1px solid var(--color-border)',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Document Type Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-accent, #E45D2C)',
                background: 'var(--color-accent-bg, rgba(228, 93, 44, 0.12))',
                border: '1px solid var(--color-accent-border, rgba(228, 93, 44, 0.28))',
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {isPdf ? <FileText size={11} /> : <Award size={11} />}
              {isPdf ? 'PDF DOCUMENT' : 'OFFICIAL CERTIFICATE'}
            </span>

            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#10B981',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={11} /> VERIFIED
            </span>
          </div>

          {/* Quick Toolbar Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                color: 'var(--color-text, #E5E7EB)',
                padding: '6px 12px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
                transition: 'background 0.15s ease',
              }}
              title="Expand to Fullscreen Lightbox"
            >
              <Maximize2 size={12} />
              <span>Fullscreen</span>
            </button>

            <a
              href={publicFileUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                color: 'var(--color-text, #E5E7EB)',
                padding: '6px 12px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
                transition: 'background 0.15s ease',
              }}
              title="Open raw certificate URL in new tab"
            >
              <span>Open Original</span>
              <ExternalLink size={12} />
            </a>

            <a
              href={publicFileUrl}
              download
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'var(--color-accent, #E45D2C)',
                borderRadius: '6px',
                color: '#FFFFFF',
                padding: '6px 12px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 8px rgba(228, 93, 44, 0.3)',
              }}
              title="Download certificate document"
            >
              <Download size={12} />
              <span>Download</span>
            </a>
          </div>
        </div>

        {/* =========================================================================
            2. CENTERED DOCUMENT VIEWPORT
            ========================================================================= */}
        <div
          style={{
            position: 'relative',
            padding: 'clamp(20px, 4vh, 40px) clamp(16px, 3vw, 32px)',
            background: 'radial-gradient(circle at 50% 50%, rgba(228, 93, 44, 0.05) 0%, #080A0E 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '440px',
            overflow: 'hidden',
          }}
        >
          {isPdf ? (
            /* Embedded PDF Document */
            <div style={{ width: '100%', height: 'clamp(440px, 65vh, 720px)' }}>
              <iframe
                src={`${publicFileUrl}#toolbar=1`}
                title={title}
                style={{
                  width: '100%',
                  height: '100%',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  background: '#1A1D24',
                  display: 'block',
                }}
              />
            </div>
          ) : imageError ? (
            /* Error Fallback */
            <div style={{ padding: '36px 20px', textAlign: 'center', color: '#9CA3AF' }}>
              <Award size={40} style={{ color: 'var(--color-accent)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', color: '#F3F4F6', margin: '0 0 6px' }}>{title}</h3>
              <p style={{ fontSize: '13px', margin: 0 }}>Issued by {issuer} · {category}</p>
            </div>
          ) : (
            /* High-Res Contained Certificate Image */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              {/* Framed Canvas */}
              <div
                style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  background: '#0B0D13',
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  cursor: 'zoom-in',
                  maxWidth: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => setLightboxOpen(true)}
                title="Click to view in fullscreen lightbox"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publicFileUrl}
                  alt={`${title} certificate issued by ${issuer}`}
                  loading="eager"
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false)
                    setImageError(true)
                  }}
                  style={{
                    maxHeight: 'clamp(280px, 56vh, 620px)',
                    maxWidth: 'clamp(260px, 78vw, 860px)',
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

              {/* In-Canvas Zoom Toolbar */}
              <div
                style={{
                  marginTop: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'rgba(15, 19, 28, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 'var(--radius-full, 9999px)',
                  padding: '3px 8px',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
                  gap: '4px',
                  zIndex: 5,
                }}
              >
                <button
                  type="button"
                  onClick={zoomOut}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#D1D5DB',
                    padding: '5px 8px',
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
                    padding: '5px 8px',
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

                <div style={{ width: '1px', height: '12px', background: 'rgba(255, 255, 255, 0.12)', margin: '0 2px' }} />

                <button
                  type="button"
                  onClick={resetZoom}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    padding: '5px 8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                  title="Reset to Fit Screen"
                  aria-label="Reset to Fit Screen"
                >
                  <RotateCcw size={12} />
                  <span>FIT</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            3. VIEWER BOTTOM METADATA BAR
            ========================================================================= */}
        <div
          style={{
            background: 'var(--color-surface-2, #141824)',
            borderTop: '1px solid var(--color-border)',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--color-text-secondary, #9CA3AF)',
          }}
        >
          <div>
            <strong style={{ color: 'var(--color-text, #F3F4F6)' }}>{issuer}</strong>
            {credentialId ? ` · ID: ${credentialId}` : ''}
          </div>

          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent, #E45D2C)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>CLICK CERTIFICATE FOR FULLSCREEN EXPANSION</span>
            <Maximize2 size={11} />
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox Triggered on Demand */}
      <CertificateLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        fileUrl={publicFileUrl}
        title={title}
        issuer={issuer}
        credentialId={credentialId}
        category={category}
      />
    </>
  )
}
