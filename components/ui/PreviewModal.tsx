'use client'

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  ShieldCheck,
  FileText,
} from 'lucide-react'
import { isPdfDocument } from '@/lib/supabase/storage'

export interface PreviewMedia {
  url: string
  caption?: string | null
  isPdf?: boolean
  title?: string
}

export interface PreviewItem {
  type: 'certificate' | 'training' | 'co-curricular' | 'project'
  headerTag?: string
  title: string
  subtitle?: string
  category?: string
  organizationOrIssuer?: string
  dateOrDuration?: string
  role?: string
  achievement?: string
  description?: string | null
  skills?: string[]
  technologies?: string[]
  credentialId?: string | null
  media: PreviewMedia[]
  downloadUrl?: string | null
  verificationUrl?: string | null
  credentialUrl?: string | null
  githubUrl?: string | null
  liveUrl?: string | null
  detailsUrl?: string | null
  detailsLabel?: string
}

export interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  item: PreviewItem | null
}

export default function PreviewModal({ isOpen, onClose, item }: PreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const panStartRef = useRef({ x: 0, y: 0 })
  const modalContentRef = useRef<HTMLDivElement>(null)

  // Reset zoom & pan when image changes or modal opens/closes
  const resetZoom = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const [prevItem, setPrevItem] = useState(item)
  if (item !== prevItem) {
    setPrevItem(item)
    setCurrentIndex(0)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Lock body scroll and manage keyboard focus when modal is open
  useEffect(() => {
    if (isOpen && item) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      // Focus first focusable element or modal container
      const timer = setTimeout(() => {
        if (modalContentRef.current) {
          const firstFocusable = modalContentRef.current.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          firstFocusable?.focus()
        }
      }, 50)

      return () => {
        clearTimeout(timer)
        document.body.style.overflow = originalOverflow
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
          previousFocusRef.current.focus()
        }
      }
    }
  }, [isOpen, item])

  // Keyboard navigation: ESC to close, Arrow keys for gallery, Tab trapping
  useEffect(() => {
    if (!isOpen || !item) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && item.media.length > 1) {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : item.media.length - 1))
        resetZoom()
      } else if (e.key === 'ArrowRight' && item.media.length > 1) {
        setCurrentIndex((prev) => (prev < item.media.length - 1 ? prev + 1 : 0))
        resetZoom()
      } else if (e.key === 'Tab' && modalContentRef.current) {
        const focusableElements = Array.from(
          modalContentRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        )
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, item, onClose, resetZoom])

  const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (!isClient || !item) return null

  const activeMedia = item.media[currentIndex] || item.media[0]
  const isPdf = activeMedia ? activeMedia.isPdf || isPdfDocument(activeMedia.url) : false
  const hasMultipleImages = item.media.length > 1

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.35, 3.0))
  }

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.35, 1.0)
      if (next === 1.0) setPan({ x: 0, y: 0 })
      return next
    })
  }

  const handleToggleZoom = () => {
    if (zoom > 1) {
      resetZoom()
    } else {
      setZoom(1.85)
    }
  }

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    if (isPdf) return
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1 || isPdf) return
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    panStartRef.current = { ...pan }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    const maxPan = 140 * (zoom - 1)
    setPan({
      x: Math.max(-maxPan, Math.min(maxPan, panStartRef.current.x + dx)),
      y: Math.max(-maxPan, Math.min(maxPan, panStartRef.current.y + dy)),
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch pan handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || isPdf || e.touches.length !== 1) return
    setIsDragging(true)
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    panStartRef.current = { ...pan }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return
    const dx = e.touches[0].clientX - dragStartRef.current.x
    const dy = e.touches[0].clientY - dragStartRef.current.y
    const maxPan = 140 * (zoom - 1)
    setPan({
      x: Math.max(-maxPan, Math.min(maxPan, panStartRef.current.x + dx)),
      y: Math.max(-maxPan, Math.min(maxPan, panStartRef.current.y + dy)),
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Effective download URL
  const effectiveDownloadUrl = item.downloadUrl || (activeMedia ? activeMedia.url : null)

  return createPortal(
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="preview-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100dvh',
              maxHeight: '100dvh',
              zIndex: 999999, // Truly topmost stacking layer above navbar (100) and footer (1)
              background: '#04060A', // Solid opaque backdrop to completely occlude the underlying page and footer
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(16px, 2.5vh, 32px)',
              overflow: 'hidden',
            }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={item.title}
          >
            {/* Top-Right Floating Close Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                position: 'fixed',
                top: 'clamp(16px, 2.5vh, 24px)',
                right: 'clamp(18px, 3vw, 28px)',
                zIndex: 1000000,
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(18, 22, 30, 0.92)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
              }}
              aria-label="Close preview"
              className="lightbox-close-btn"
            >
              <X size={20} />
            </button>

            {/* Lightbox Content Container - Positioned with comfortable headroom */}
            <motion.div
              ref={modalContentRef}
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'relative',
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                maxWidth: 'min(94vw, 1000px)',
                maxHeight: '94vh',
                margin: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 1. Image View (Certificate / Visual Media) */}
              {activeMedia?.url && !isPdf ? (
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',
                    cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                  }}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onDoubleClick={handleToggleZoom}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeMedia.url}
                    alt={activeMedia.caption || item.title}
                    style={{
                      maxWidth: 'min(92vw, 960px)',
                      maxHeight: 'min(76vh, 640px)',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      borderRadius: '6px',
                      boxShadow: '0 24px 70px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.15)',
                      backgroundColor: '#FFFFFF',
                      display: 'block',
                      transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                      transformOrigin: 'center center',
                      transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      pointerEvents: 'none',
                    }}
                    draggable={false}
                  />

                  {/* Floating Minimal Zoom Pills */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(10, 12, 18, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '6px',
                      padding: '3px 6px',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
                      zIndex: 10,
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      disabled={zoom <= 1.0}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: zoom <= 1.0 ? 'rgba(255,255,255,0.4)' : '#FFFFFF',
                        cursor: zoom <= 1.0 ? 'not-allowed' : 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '3px',
                      }}
                      title="Zoom Out"
                    >
                      <ZoomOut size={13} />
                    </button>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-accent)',
                        minWidth: '36px',
                        textAlign: 'center',
                        fontWeight: 600,
                      }}
                    >
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      disabled={zoom >= 3.0}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: zoom >= 3.0 ? 'rgba(255,255,255,0.4)' : '#FFFFFF',
                        cursor: zoom >= 3.0 ? 'not-allowed' : 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '3px',
                      }}
                      title="Zoom In"
                    >
                      <ZoomIn size={13} />
                    </button>
                    {zoom > 1 && (
                      <button
                        type="button"
                        onClick={resetZoom}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '3px',
                          marginLeft: '2px',
                        }}
                        title="Reset Zoom"
                      >
                        <RotateCcw size={11} />
                      </button>
                    )}
                  </div>

                  {/* Gallery Arrows if multiple images */}
                  {hasMultipleImages && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentIndex((prev) => (prev > 0 ? prev - 1 : item.media.length - 1))
                          resetZoom()
                        }}
                        style={{
                          position: 'absolute',
                          left: '-18px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: 'rgba(10, 12, 18, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          backdropFilter: 'blur(8px)',
                          zIndex: 10,
                        }}
                        className="gallery-nav-btn"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentIndex((prev) => (prev < item.media.length - 1 ? prev + 1 : 0))
                          resetZoom()
                        }}
                        style={{
                          position: 'absolute',
                          right: '-18px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: 'rgba(10, 12, 18, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          backdropFilter: 'blur(8px)',
                          zIndex: 10,
                        }}
                        className="gallery-nav-btn"
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>
              ) : isPdf ? (
                /* 2. PDF Document Preview */
                <div
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '40px 32px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '14px',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
                    maxWidth: '480px',
                    width: '90vw',
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(228, 93, 44, 0.12)',
                      border: '1px solid var(--color-accent-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-accent)',
                    }}
                  >
                    <FileText size={32} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 6px' }}>
                      {item.title}
                    </h4>
                    {item.organizationOrIssuer && (
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                        Issued by {item.organizationOrIssuer}
                      </p>
                    )}
                  </div>
                  {activeMedia?.url && (
                    <a
                      href={activeMedia.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary"
                      style={{ fontSize: '12px', padding: '9px 20px', textDecoration: 'none', marginTop: '6px' }}
                    >
                      <span>OPEN FULL PDF DOCUMENT ↗</span>
                    </a>
                  )}
                </div>
              ) : (
                /* 3. Fallback Credential Card */
                <div
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '40px 32px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
                    maxWidth: '440px',
                    width: '90vw',
                  }}
                >
                  <ShieldCheck size={40} style={{ color: 'var(--color-accent)' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                    {item.title}
                  </h4>
                  {item.organizationOrIssuer && (
                    <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: 0 }}>
                      Issued by {item.organizationOrIssuer}
                    </p>
                  )}
                  {item.credentialId && (
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                      ID: {item.credentialId}
                    </span>
                  )}
                </div>
              )}

              {/* Minimal Floating Footer Pill (Title + Quick Action Links Only) */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '7px 18px',
                  borderRadius: '24px',
                  background: 'rgba(14, 18, 26, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {item.title}
                </span>

                {effectiveDownloadUrl && (
                  <a
                    href={effectiveDownloadUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-accent)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(228, 93, 44, 0.12)',
                      border: '1px solid rgba(228, 93, 44, 0.3)',
                    }}
                    className="hover-accent-text"
                  >
                    <Download size={11} />
                    <span>DOWNLOAD</span>
                  </a>
                )}

                {(item.verificationUrl || item.credentialUrl) && (
                  <a
                    href={item.verificationUrl || item.credentialUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-secondary)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                    }}
                    className="hover-accent-text"
                  >
                    <ShieldCheck size={11} />
                    <span>VERIFY</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .lightbox-close-btn:hover {
          background: rgba(228, 93, 44, 0.2) !important;
          border-color: var(--color-accent) !important;
          color: var(--color-accent) !important;
          transform: scale(1.08) !important;
        }
        .gallery-nav-btn:hover {
          border-color: var(--color-accent) !important;
          color: var(--color-accent) !important;
          transform: translateY(-50%) scale(1.08) !important;
        }
      `}</style>
    </>,
    document.body
  )
}
