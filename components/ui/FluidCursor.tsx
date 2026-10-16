'use client'

import { useEffect, useRef } from 'react'

export default function FluidCursor() {
  const containerRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

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
    let isVisible = false
    let isHovered = false
    let isClicking = false
    let lastTarget: EventTarget | null = null

    const container = containerRef.current
    const dot = dotRef.current
    const ring = ringRef.current
    if (!container || !dot || !ring) return

    const updateHoverState = (target: HTMLElement | null) => {
      const interactive = Boolean(
        target?.closest('a, button, input, textarea, select, [role="button"], .interactive-hover')
      )
      if (interactive !== isHovered) {
        isHovered = interactive
        if (isHovered) {
          ring.style.width = '48px'
          ring.style.height = '48px'
          ring.style.margin = '-24px 0 0 -24px'
          ring.style.borderColor = 'var(--color-accent)'
          ring.style.background = 'radial-gradient(circle, rgba(228, 93, 44, 0.15) 0%, transparent 70%)'
          ring.style.boxShadow = '0 0 16px var(--color-accent-glow), 0 0 24px rgba(6, 182, 212, 0.2)'
          dot.style.backgroundColor = 'var(--color-accent-teal)'
          dot.style.boxShadow = '0 0 8px var(--color-accent-teal)'
        } else {
          ring.style.width = '32px'
          ring.style.height = '32px'
          ring.style.margin = '-16px 0 0 -16px'
          ring.style.borderColor = 'rgba(228, 93, 44, 0.45)'
          ring.style.background = 'transparent'
          ring.style.boxShadow = '0 0 8px rgba(228, 93, 44, 0.2)'
          dot.style.backgroundColor = 'var(--color-accent)'
          dot.style.boxShadow = '0 0 8px var(--color-accent)'
        }
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      if (!isVisible) {
        isVisible = true
        container.style.opacity = '1'
      }

      // Check hover only when target changes to prevent layout thrashing
      if (e.target !== lastTarget) {
        lastTarget = e.target
        updateHoverState(e.target as HTMLElement | null)
      }
    }

    const onMouseDown = () => {
      isClicking = true
      ring.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0) scale(0.82)`
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(1.4)`
    }

    const onMouseUp = () => {
      isClicking = false
      ring.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0) scale(1)`
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(1)`
    }

    const onMouseLeave = () => {
      isVisible = false
      container.style.opacity = '0'
    }

    const onMouseEnter = () => {
      isVisible = true
      container.style.opacity = '1'
    }

    const tick = () => {
      // Direct positioning for center pinpoint dot (no React render)
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(${isClicking ? 1.4 : 1})`

      // Smooth trailing physics for outer aura ring
      ringX += (mouseX - ringX) * 0.22
      ringY += (mouseY - ringY) * 0.22

      ring.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0) scale(${isClicking ? 0.82 : 1})`

      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown, { passive: true })
    window.addEventListener('mouseup', onMouseUp, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave, { passive: true })
    document.addEventListener('mouseenter', onMouseEnter, { passive: true })

    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0,
        transition: 'opacity 0.25s ease',
      }}
    >
      {/* 1. Trailing Fluid Aura Ring */}
      <div
        ref={ringRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '32px',
          height: '32px',
          margin: '-16px 0 0 -16px',
          borderRadius: '50%',
          border: '1px solid rgba(228, 93, 44, 0.45)',
          background: 'transparent',
          boxShadow: '0 0 8px rgba(228, 93, 44, 0.2)',
          transform: 'translate3d(-100px, -100px, 0)',
          willChange: 'transform',
          transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s cubic-bezier(0.16, 1, 0.3, 1), margin 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
          transformOrigin: 'center center',
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
          backgroundColor: 'var(--color-accent)',
          boxShadow: '0 0 8px var(--color-accent)',
          transform: 'translate3d(-100px, -100px, 0)',
          willChange: 'transform',
          transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
          transformOrigin: 'center center',
        }}
      />
    </div>
  )
}
