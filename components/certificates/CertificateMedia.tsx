'use client'

import { useState } from 'react'
import { getCertificatePublicUrl, isPdfDocument } from '@/lib/supabase/storage'
import { FileText, ShieldCheck, Award, ExternalLink } from 'lucide-react'

interface CertificateMediaProps {
  fileUrl?: string | null
  thumbnailUrl?: string | null
  title: string
  issuer: string
  category: string
  aspectRatio?: string
  height?: string
  interactive?: boolean
}

export default function CertificateMedia({
  fileUrl,
  thumbnailUrl,
  title,
  issuer,
  category,
  aspectRatio = '16/10',
  height,
  interactive = false,
}: CertificateMediaProps) {
  const [imageError, setImageError] = useState(false)
  const resolvedUrl = getCertificatePublicUrl(thumbnailUrl || fileUrl)
  const isPdf = isPdfDocument(resolvedUrl)

  // 1. PDF Document Preview
  if (resolvedUrl && isPdf && !imageError) {
    return (
      <div
        className="cert-media-container cert-pdf-preview"
        style={{
          width: '100%',
          aspectRatio: height ? undefined : aspectRatio,
          height: height || undefined,
          background: 'radial-gradient(circle at 50% 0%, var(--color-accent-bg) 0%, var(--color-surface-2) 100%)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px',
        }}
      >
        {/* Top bar with document badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
          <span
            style={{
              fontSize: '9px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#E45D2C',
              background: 'rgba(228, 93, 44, 0.12)',
              border: '1px solid rgba(228, 93, 44, 0.3)',
              padding: '3px 8px',
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <FileText size={10} /> PDF DOCUMENT
          </span>
          <span
            style={{
              fontSize: '9px',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--color-text-muted, #777)',
              letterSpacing: '0.05em',
            }}
          >
            VERIFIED
          </span>
        </div>

        {/* Center watermark icon */}
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
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(228, 93, 44, 0.08)',
              border: '1px solid rgba(228, 93, 44, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#E45D2C',
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #AAA)', fontWeight: 500 }}>
            {issuer}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '10px',
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--color-text-muted, #666)',
            zIndex: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '8px',
          }}
        >
          <span>Official Certificate File</span>
          {interactive && (
            <span style={{ color: '#E45D2C', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              View Document <ExternalLink size={9} />
            </span>
          )}
        </div>

        {/* Subtle geometric background watermark */}
        <div
          style={{
            position: 'absolute',
            right: '-20px',
            bottom: '-20px',
            opacity: 0.04,
            pointerEvents: 'none',
            color: '#FFF',
          }}
        >
          <Award size={140} />
        </div>
      </div>
    )
  }

  // 2. Image Certificate Preview
  if (resolvedUrl && !imageError) {
    return (
      <div
        className="cert-media-container"
        style={{
          width: '100%',
          aspectRatio: height ? undefined : aspectRatio,
          height: height || undefined,
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolvedUrl}
          alt={title}
          loading="lazy"
          onError={() => setImageError(true)}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            objectPosition: 'center center',
            display: 'block',
            borderRadius: '2px',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="cert-img-hover"
        />
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            right: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: '9px',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.06em',
              color: 'var(--color-text)',
              background: 'var(--color-surface)',
              backdropFilter: 'blur(8px)',
              padding: '2px 7px',
              borderRadius: '3px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {issuer}
          </span>
          <span
            style={{
              fontSize: '9px',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--color-success)',
              background: 'var(--color-surface)',
              backdropFilter: 'blur(8px)',
              padding: '2px 7px',
              borderRadius: '3px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <ShieldCheck size={9} /> VERIFIED
          </span>
        </div>
      </div>
    )
  }

  // 3. Fallback High-Aesthetic Digital Credential Canvas
  return (
    <div
      className="cert-media-container cert-fallback-canvas"
      style={{
        width: '100%',
        aspectRatio: height ? undefined : aspectRatio,
        height: height || undefined,
        background: 'radial-gradient(circle at 50% 0%, var(--color-accent-bg) 0%, var(--color-surface-2) 100%)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
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
            color: 'var(--color-text-muted, #777)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <ShieldCheck size={10} style={{ color: '#4A7C59' }} /> AUTHENTICATED
        </span>
      </div>

      {/* Center Credential Seal */}
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
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-accent)',
          }}
        >
          <Award size={20} />
        </div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--color-text, #EEE)',
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
          color: 'var(--color-text-muted, #666)',
          zIndex: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '8px',
        }}
      >
        <span>Digital Identity</span>
        <span>Verified Credential</span>
      </div>

      {/* Decorative background watermark */}
      <div
        style={{
          position: 'absolute',
          right: '-15px',
          bottom: '-15px',
          opacity: 0.03,
          pointerEvents: 'none',
          color: '#FFF',
        }}
      >
        <ShieldCheck size={130} />
      </div>
    </div>
  )
}
