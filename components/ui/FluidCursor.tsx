'use client'

import { useEffect, useRef, useState } from 'react'

export default function FluidCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || prefersReducedMotion) return

    let rafId: number
    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (!isVisible) setIsVisible(true)

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null
      const isInteractive = Boolean(
        target?.closest('a, button, input, textarea, select, [role="button"], .interactive-hover')
      )
      setIsHovered(isInteractive)
    }

    const onMouseDown = () => setIsClicking(true)
    const onMouseUp = () => setIsClicking(false)
    const onMouseLeave = () => setIsVisible(false)
    const onMouseEnter = () => setIsVisible(true)

    const tick = () => {
      // Direct positioning for center pinpoint dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`
      }

      // Smooth trailing physics for outer aura ring
      ringX += (mouseX - ringX) * 0.18
      ringY += (mouseY - ringY) * 0.18

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0)`
      }

      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown, { passive: true })
    window.addEventListener('mouseup', onMouseUp, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      cancelAnimationFrame(rafId)
    }
  }, [isVisible])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* 1. Trailing Fluid Aura Ring */}
      <div
        ref={ringRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: isHovered ? '48px' : '32px',
          height: isHovered ? '48px' : '32px',
          margin: isHovered ? '-24px 0 0 -24px' : '-16px 0 0 -16px',
          borderRadius: '50%',
          border: isHovered
            ? '1.5px solid var(--color-accent)'
            : '1px solid rgba(228, 93, 44, 0.45)',
          background: isHovered
            ? 'radial-gradient(circle, rgba(228, 93, 44, 0.15) 0%, transparent 70%)'
            : 'transparent',
          boxShadow: isHovered
            ? '0 0 16px var(--color-accent-glow), 0 0 24px rgba(6, 182, 212, 0.2)'
            : '0 0 8px rgba(228, 93, 44, 0.2)',
          transform: 'translate3d(-100px, -100px, 0)',
          willChange: 'transform, width, height',
          transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s cubic-bezier(0.16, 1, 0.3, 1), margin 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
          transformOrigin: 'center center',
          scale: isClicking ? '0.82' : '1',
        }}
      />

      {/* 2. Precision Center Core Dot */}
      <div
        ref={dotRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '6px',
          height: '6px',
          margin: '-3px 0 0 -3px',
          borderRadius: '50%',
          backgroundColor: isHovered ? 'var(--color-accent-teal)' : 'var(--color-accent)',
          boxShadow: isHovered
            ? '0 0 8px var(--color-accent-teal)'
            : '0 0 8px var(--color-accent)',
          transform: 'translate3d(-100px, -100px, 0)',
          willChange: 'transform',
          transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
          transformOrigin: 'center center',
          scale: isClicking ? '1.5' : '1',
        }}
      />
    </div>
  )
}
