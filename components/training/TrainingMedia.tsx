'use client'

import { useState } from 'react'
import { resolveCertificateUrl, isPdfDocument } from '@/lib/supabase/storage'
import {
  FileText,
  ShieldCheck,
  ExternalLink,
  GraduationCap,
  Maximize2,
} from 'lucide-react'
import CertificateLightbox from '@/components/certificates/CertificateLightbox'

interface TrainingMediaProps {
  certificateUrl?: string | null
  imageUrl?: string | null
  title: string
  provider?: string | null
  organization?: string | null
  category: string
  credentialId?: string | null
  duration?: string | null
  date?: string | null
  aspectRatio?: string
  maxHeight?: string
  interactive?: boolean
  className?: string
}

export default function TrainingMedia({
  certificateUrl,
  imageUrl,
  title,
  provider,
  organization,
  category,
  credentialId,
  duration,
  date,
  aspectRatio = '16/10',
  maxHeight = '320px',
  interactive = true,
  className = '',
}: TrainingMediaProps) {
  const [imageError, setImageError] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const resolvedUrl = resolveCertificateUrl(certificateUrl || imageUrl)
  const isPdf = isPdfDocument(resolvedUrl)
  const issuer = organization || provider || 'Training Program'
  const altText = `${title} certificate issued by ${issuer}`

  function handleContainerClick(e: React.MouseEvent) {
    if (!interactive || !resolvedUrl) return
    e.preventDefault()
    e.stopPropagation()
    setLightboxOpen(true)
  }

  // 1. PDF Document Preview Card
  if (resolvedUrl && isPdf && !imageError) {
    return (
      <>
        <div
          className={`training-media-frame training-pdf-frame ${className}`}
          style={{
            width: '100%',
            aspectRatio,
            maxHeight,
            background: 'var(--color-surface-2, #11141C)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md, 8px)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px',
            cursor: interactive ? 'pointer' : 'default',
            boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.2))',
          }}
          onClick={handleContainerClick}
          role={interactive ? 'button' : undefined}
          aria-label={interactive ? `View PDF certificate for ${title}` : undefined}
          tabIndex={interactive ? 0 : undefined}
          onKeyDown={(e) => {
            if (interactive && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              setLightboxOpen(true)
            }
          }}
        >
          {/* Top bar with document badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-accent, #E45D2C)',
                background: 'var(--color-accent-bg, rgba(228, 93, 44, 0.12))',
                border: '1px solid var(--color-accent-border, rgba(228, 93, 44, 0.25))',
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <FileText size={11} /> PDF DOCUMENT
            </span>
            <span
              style={{
                fontSize: '9px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--color-text-muted, #9CA3AF)',
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <ShieldCheck size={11} style={{ color: '#10B981' }} /> VERIFIED
            </span>
          </div>

          {/* Center Document Badge */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              zIndex: 2,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--color-accent-bg, rgba(228, 93, 44, 0.1))',
                border: '1px solid var(--color-accent-border, rgba(228, 93, 44, 0.25))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-accent, #E45D2C)',
              }}
            >
              <FileText size={20} />
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-primary, #F3F4F6)',
                fontWeight: 600,
                maxWidth: '240px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {issuer}
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '10px',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--color-text-muted, #9CA3AF)',
              zIndex: 2,
              borderTop: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.06))',
              paddingTop: '8px',
            }}
          >
            <span>Official Credential</span>
            {interactive && (
              <span
                style={{
                  color: 'var(--color-accent, #E45D2C)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontWeight: 600,
                }}
              >
                Inspect PDF <ExternalLink size={10} />
              </span>
            )}
          </div>
        </div>

        {/* Fullscreen Lightbox Modal */}
        <CertificateLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          fileUrl={resolvedUrl}
          title={title}
          issuer={issuer}
          credentialId={credentialId}
          category={category}
          duration={duration}
          date={date}
        />
      </>
    )
  }

  // 2. Image Certificate / Thumbnail Preview with Containment (Zero-Flicker Architecture)
  if (resolvedUrl && !imageError) {
    return (
      <>
        <div
          className={`training-media-frame ${className}`}
          style={{
            width: '100%',
            aspectRatio,
            maxHeight,
            background: 'var(--color-surface-2, #0A0D14)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md, 8px)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            cursor: interactive ? 'pointer' : 'default',
            boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.2))',
          }}
          onClick={handleContainerClick}
          role={interactive ? 'button' : undefined}
          aria-label={interactive ? `Open full certificate for ${title}` : undefined}
          tabIndex={interactive ? 0 : undefined}
          onKeyDown={(e) => {
            if (interactive && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              setLightboxOpen(true)
            }
          }}
        >
          {/* Certificate Image Framed & Contained — Completely stable, no transform jitter */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedUrl}
            alt={altText}
            loading="lazy"
            onError={() => setImageError(true)}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              objectPosition: 'center',
              display: 'block',
              borderRadius: '4px',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />

          {/* Subtle Hover Action Overlay — Pure opacity transition, no backdrop-filter to prevent repaint flash */}
          {interactive && (
            <div
              className="training-media-overlay"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(5, 7, 12, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s ease',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: 'var(--color-accent, #E45D2C)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm, 4px)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                  letterSpacing: '0.04em',
                }}
              >
                <Maximize2 size={12} /> View Certificate ↗
              </span>
            </div>
          )}

          {/* Bottom Badge Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: '6px',
              left: '8px',
              right: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          >
            <span
              style={{
                fontSize: '9px',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#E5E7EB',
                background: 'rgba(0, 0, 0, 0.75)',
                padding: '2px 6px',
                borderRadius: '3px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                maxWidth: '160px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {issuer}
            </span>
            <span
              style={{
                fontSize: '9px',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#10B981',
                background: 'rgba(0, 0, 0, 0.75)',
                padding: '2px 6px',
                borderRadius: '3px',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={9} /> VERIFIED
            </span>
          </div>
        </div>

        {/* Fullscreen Lightbox Modal (Zoom, Download, Open Original only rendered here on demand) */}
        <CertificateLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          fileUrl={resolvedUrl}
          title={title}
          issuer={issuer}
          credentialId={credentialId}
          category={category}
          duration={duration}
          date={date}
        />
      </>
    )
  }

  // 3. Fallback High-Aesthetic Digital Learning Credential Seal (when image missing or errored)
  return (
    <div
      className={`training-media-frame training-fallback-frame ${className}`}
      style={{
        width: '100%',
        aspectRatio,
        maxHeight,
        background: 'var(--color-surface-2, #11141C)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md, 8px)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <span
          style={{
            fontSize: '9px',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-accent, #E45D2C)',
            background: 'var(--color-accent-bg, rgba(228, 93, 44, 0.1))',
            border: '1px solid var(--color-accent-border, rgba(228, 93, 44, 0.25))',
            padding: '3px 8px',
            borderRadius: '4px',
          }}
        >
          {category}
        </span>
        <span
          style={{
            fontSize: '9px',
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--color-text-muted, #9CA3AF)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <ShieldCheck size={10} style={{ color: '#10B981' }} /> OFFICIAL PROGRAM
        </span>
      </div>

      {/* Center Seal */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          zIndex: 2,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--color-surface, #1A1D24)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-accent, #E45D2C)',
          }}
        >
          <GraduationCap size={20} />
        </div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-text-primary, #F3F4F6)',
            maxWidth: '220px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {issuer}
        </div>
      </div>

      {/* Bottom Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10px',
          fontFamily: 'var(--font-mono, monospace)',
          color: 'var(--color-text-muted, #9CA3AF)',
          zIndex: 2,
          borderTop: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.05))',
          paddingTop: '8px',
        }}
      >
        <span>Training Record</span>
        <span>{imageError ? 'Preview In Detail View' : 'Verified Training'}</span>
      </div>
    </div>
  )
}
