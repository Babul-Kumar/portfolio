'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  FileText,
  CheckCircle2,
} from 'lucide-react'

interface DedicatedResumeViewerProps {
  resumeUrl: string | null
  candidateName: string
}

export default function DedicatedResumeViewer({
  resumeUrl,
  candidateName,
}: DedicatedResumeViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (frameRef.current?.requestFullscreen) {
          await frameRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err)
    }
  }

  const handleDownload = async () => {
    if (!resumeUrl) return
    setDownloading(true)
    try {
      const response = await fetch(resumeUrl)
      if (!response.ok) throw new Error('Network response not ok')
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = 'Babul_Kumar_Resume.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      const fallbackLink = document.createElement('a')
      fallbackLink.href = '/api/resume/download'
      fallbackLink.download = 'Babul_Kumar_Resume.pdf'
      document.body.appendChild(fallbackLink)
      fallbackLink.click()
      document.body.removeChild(fallbackLink)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="resume-dedicated-container" style={{ padding: 'calc(68px + 24px) 20px 48px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Navigation & Control Strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '16px',
            padding: '12px 18px',
            borderRadius: '10px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Back link */}
          <Link
            href="/resume"
            className="resume-btn resume-btn-neutral"
            style={{ textDecoration: 'none' }}
          >
            <ArrowLeft size={13} />
            <span>Back to Résumé Page</span>
          </Link>

          {/* Document Identity */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-text)',
            }}
          >
            <FileText size={14} style={{ color: 'var(--color-accent)' }} />
            <span>{candidateName} — Official CV Reader</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#10B981',
                fontSize: '11px',
                marginLeft: '6px',
              }}
            >
              <CheckCircle2 size={12} />
              <span>Verified PDF</span>
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="resume-btn resume-btn-neutral"
              title={isFullscreen ? 'Exit Full Screen (Esc)' : 'Enter Full Screen'}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
            </button>

            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="resume-btn resume-btn-neutral"
                title="Open raw PDF file in new browser tab"
              >
                <ExternalLink size={13} />
                <span>Open in New Tab</span>
              </a>
            )}

            {resumeUrl && (
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="resume-btn resume-btn-download"
                title="Download official PDF copy"
              >
                <Download size={13} />
                <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Dedicated High-Definition Document Frame */}
        <div
          ref={frameRef}
          className="resume-viewer-frame"
          style={{
            minHeight: 'calc(100vh - 220px)',
            height: 'calc(100vh - 200px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {isFullscreen && (
            <div
              style={{
                padding: '8px 16px',
                background: '#13151A',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#9E978F',
              }}
            >
              <span>{candidateName} — Full Screen Document View</span>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="resume-btn resume-btn-neutral"
                style={{ padding: '4px 10px', fontSize: '11px' }}
              >
                <Minimize2 size={12} />
                <span>Exit Full Screen (Esc)</span>
              </button>
            </div>
          )}

          <div style={{ flex: 1, width: '100%', height: '100%', background: '#13151A' }}>
            {resumeUrl ? (
              <iframe
                src={`${resumeUrl}#toolbar=1&navpanes=0&view=FitH`}
                title={`${candidateName} Dedicated Résumé Document`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                  backgroundColor: '#13151A',
                }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                }}
              >
                No PDF configured. Return to resume page.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
