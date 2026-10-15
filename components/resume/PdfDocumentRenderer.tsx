'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  FileText,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface PdfDocumentRendererProps {
  pdfUrl: string
  title?: string
  onDownload?: () => void
}

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: {
        workerSrc: string
      }
      getDocument: (src: string | { url: string }) => {
        promise: Promise<{
          numPages: number
          getPage: (pageNumber: number) => Promise<{
            getViewport: (params: { scale: number }) => {
              width: number
              height: number
            }
            render: (params: {
              canvasContext: CanvasRenderingContext2D
              viewport: { width: number; height: number }
            }) => { promise: Promise<void> }
          }>
        }>
      }
    }
  }
}

export default function PdfDocumentRenderer({
  pdfUrl,
  title = 'Curriculum Vitae',
  onDownload,
}: PdfDocumentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [zoomScale, setZoomScale] = useState<number>(1.0)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load PDF.js script dynamically if not present
  const loadPdfJs = useCallback((): Promise<typeof window.pdfjsLib> => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        return resolve(window.pdfjsLib)
      }

      const existingScript = document.querySelector('script[src*="pdf.js"]')
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.pdfjsLib))
        existingScript.addEventListener('error', (e) => reject(e))
        return
      }

      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.async = true
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
          resolve(window.pdfjsLib)
        } else {
          reject(new Error('PDF.js failed to initialize'))
        }
      }
      script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'))
      document.head.appendChild(script)
    })
  }, [])

  // Render PDF pages into canvases
  useEffect(() => {
    let isCancelled = false

    async function renderDoc() {
      if (!pdfUrl) return
      setLoading(true)
      setError(null)

      try {
        const pdfjs = await loadPdfJs()
        if (!pdfjs) throw new Error('PDF library unavailable')

        const container = containerRef.current
        if (!container) return

        // Clear previous render
        container.innerHTML = ''

        // Fetch document
        const loadingTask = pdfjs.getDocument(pdfUrl)
        const pdf = await loadingTask.promise
        if (isCancelled) return

        setNumPages(pdf.numPages)

        // Device pixel ratio for crisp rendering on high-DPI/Retina screens
        const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2.5) : 1
        const effectiveScale = dpr * zoomScale * 1.5

        for (let i = 1; i <= pdf.numPages; i++) {
          if (isCancelled) return

          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: effectiveScale })

          const pageWrapper = document.createElement('div')
          pageWrapper.className = 'pdf-page-wrapper'
          pageWrapper.style.width = '100%'
          pageWrapper.style.maxWidth = '100%'
          pageWrapper.style.display = 'flex'
          pageWrapper.style.justifyContent = 'center'
          pageWrapper.style.marginBottom = i < pdf.numPages ? '16px' : '0'

          const canvas = document.createElement('canvas')
          canvas.className = 'pdf-page-canvas'
          canvas.width = viewport.width
          canvas.height = viewport.height
          canvas.style.width = '100%'
          canvas.style.maxWidth = '820px'
          canvas.style.height = 'auto'
          canvas.style.display = 'block'
          canvas.style.borderRadius = '6px'
          canvas.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.18)'
          canvas.style.backgroundColor = '#FFFFFF'

          pageWrapper.appendChild(canvas)
          container.appendChild(pageWrapper)

          const ctx = canvas.getContext('2d')
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise
          }
        }

        if (!isCancelled) {
          setLoading(false)
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.warn('PDF canvas rendering failed, falling back to native iframe:', err)
          setError(err instanceof Error ? err.message : 'Failed to render PDF')
          setLoading(false)
        }
      }
    }

    renderDoc()

    return () => {
      isCancelled = true
    }
  }, [pdfUrl, zoomScale, loadPdfJs])

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.25, 2.0))
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.25, 0.75))
  const handleZoomReset = () => setZoomScale(1.0)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Floating Zoom / Control Bar for PDF */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '8px 14px',
          background: 'var(--color-surface, #1A1D24)',
          borderBottom: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
          fontSize: '11px',
          fontFamily: 'var(--font-mono, monospace)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)' }}>
          <FileText size={13} style={{ color: 'var(--color-accent)' }} />
          <span>{title}</span>
          {numPages > 0 && <span>• {numPages} {numPages === 1 ? 'Page' : 'Pages'}</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Zoom controls */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              background: 'var(--color-surface-2, rgba(255, 255, 255, 0.05))',
              border: '1px solid var(--color-border)',
              borderRadius: '5px',
              padding: '2px 4px',
            }}
          >
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomScale <= 0.75}
              style={{
                background: 'transparent',
                border: 'none',
                color: zoomScale <= 0.75 ? 'var(--color-text-muted)' : 'var(--color-text)',
                cursor: zoomScale <= 0.75 ? 'not-allowed' : 'pointer',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut size={12} />
            </button>

            <span
              style={{
                minWidth: '32px',
                textAlign: 'center',
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--color-text)',
              }}
            >
              {Math.round(zoomScale * 100)}%
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomScale >= 2.0}
              style={{
                background: 'transparent',
                border: 'none',
                color: zoomScale >= 2.0 ? 'var(--color-text-muted)' : 'var(--color-text)',
                cursor: zoomScale >= 2.0 ? 'not-allowed' : 'pointer',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn size={12} />
            </button>

            {zoomScale !== 1.0 && (
              <button
                type="button"
                onClick={handleZoomReset}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-accent)',
                  cursor: 'pointer',
                  padding: '3px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Reset zoom"
                aria-label="Reset zoom"
              >
                <RotateCcw size={10} />
              </button>
            )}
          </div>

          {/* Raw PDF tab */}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              padding: '3px 8px',
              borderRadius: '5px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-2)',
              fontSize: '11px',
            }}
            title="Open raw PDF document"
          >
            <ExternalLink size={11} />
            <span className="hidden sm:inline">Raw PDF</span>
          </a>

          {/* Download button if provided */}
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#FFFFFF',
                background: 'var(--color-accent, #E45D2C)',
                border: 'none',
                padding: '3px 9px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
              title="Download PDF"
            >
              <Download size={11} />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Document Body */}
      <div
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '100%',
          overflowY: 'auto',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: isMobile ? '12px 8px' : '20px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'var(--color-surface-2, #14171E)',
          position: 'relative',
        }}
      >
        {/* Loading Spinner */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              background: 'rgba(19, 21, 26, 0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 10,
              color: 'var(--color-text)',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12px',
            }}
          >
            <Loader2 className="animate-spin" size={28} style={{ color: 'var(--color-accent)' }} />
            <span>Rendering high-definition document pages...</span>
          </div>
        )}

        {/* Fallback Iframe / Error View */}
        {error && (
          <div
            style={{
              padding: '28px',
              textAlign: 'center',
              maxWidth: '480px',
              margin: 'auto',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
            }}
          >
            <AlertCircle size={32} style={{ color: 'var(--color-accent)', margin: '0 auto 12px' }} />
            <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: 'var(--color-text)' }}>
              Inline Document Rendering Notice
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
              Your mobile browser prefers external document reading. You can view the document directly or download a copy.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="resume-btn resume-btn-neutral"
                style={{ textDecoration: 'none' }}
              >
                <ExternalLink size={12} />
                <span>Open Raw PDF</span>
              </a>
              {onDownload && (
                <button
                  type="button"
                  onClick={onDownload}
                  className="resume-btn resume-btn-download"
                >
                  <Download size={12} />
                  <span>Download PDF</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Canvases Container (Pages Rendered Here) */}
        <div
          ref={containerRef}
          style={{
            width: '100%',
            maxWidth: '820px',
            display: error ? 'none' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        />
      </div>
    </div>
  )
}
