'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// 18 Deterministic Micro Data Particles
const AMBIENT_PARTICLES = [
  { id: 1, x: '68%', y: '22%', size: 3, color: 'accent', delay: '0s', duration: '14s' },
  { id: 2, x: '82%', y: '18%', size: 2.5, color: 'teal', delay: '2s', duration: '18s' },
  { id: 3, x: '62%', y: '48%', size: 2, color: 'accent', delay: '1s', duration: '16s' },
  { id: 4, x: '91%', y: '36%', size: 3, color: 'teal', delay: '3s', duration: '15s' },
  { id: 5, x: '74%', y: '72%', size: 2.5, color: 'accent', delay: '4s', duration: '20s' },
  { id: 6, x: '86%', y: '65%', size: 2, color: 'teal', delay: '1.5s', duration: '17s' },
  { id: 7, x: '58%', y: '32%', size: 2, color: 'accent', delay: '2.5s', duration: '19s' },
  { id: 8, x: '79%', y: '84%', size: 3, color: 'teal', delay: '0.5s', duration: '13s' },
  { id: 9, x: '94%', y: '58%', size: 2.5, color: 'accent', delay: '3.5s', duration: '16s' },
  { id: 10, x: '65%', y: '62%', size: 2, color: 'accent', delay: '5s', duration: '22s' },
  { id: 11, x: '72%', y: '14%', size: 2, color: 'teal', delay: '1.8s', duration: '14s' },
  { id: 12, x: '88%', y: '80%', size: 2.5, color: 'accent', delay: '2.8s', duration: '18s' },
  { id: 13, x: '52%', y: '78%', size: 2, color: 'teal', delay: '4.2s', duration: '21s' },
  { id: 14, x: '96%', y: '24%', size: 2.5, color: 'accent', delay: '0.8s', duration: '15s' },
  { id: 15, x: '60%', y: '88%', size: 2, color: 'accent', delay: '3.2s', duration: '17s' },
  { id: 16, x: '76%', y: '42%', size: 3, color: 'teal', delay: '2.2s', duration: '16s' },
  { id: 17, x: '84%', y: '48%', size: 2, color: 'accent', delay: '1.2s', duration: '19s' },
  { id: 18, x: '90%', y: '70%', size: 2.5, color: 'teal', delay: '4.8s', duration: '14s' },
]

export default function HeroBackground({
  mouse,
}: {
  mouse: React.RefObject<{ x: number; y: number }>
}) {
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false)
  const layer1Ref = useRef<HTMLDivElement>(null)
  const layer2Ref = useRef<HTMLDivElement>(null)
  const layer3Ref = useRef<HTMLDivElement>(null)

  // Direct DOM hardware transform without continuous React re-renders
  useEffect(() => {
    if (reducedMotion) return

    let animationFrameId: number
    let lastX = -9999
    let lastY = -9999

    const updateParallax = () => {
      if (mouse.current) {
        const px = mouse.current.x * 12
        const py = mouse.current.y * 12

        if (Math.abs(px - lastX) > 0.05 || Math.abs(py - lastY) > 0.05) {
          lastX = px
          lastY = py
          if (layer1Ref.current) {
            layer1Ref.current.style.transform = `translate3d(${(px * 0.15).toFixed(2)}px, ${(py * 0.15).toFixed(2)}px, 0)`
          }
          if (layer2Ref.current) {
            layer2Ref.current.style.transform = `translate3d(${(px * 0.25).toFixed(2)}px, ${(py * 0.25).toFixed(2)}px, 0)`
          }
          if (layer3Ref.current) {
            layer3Ref.current.style.transform = `translate3d(${(px * 0.18).toFixed(2)}px, ${(py * 0.18).toFixed(2)}px, 0)`
          }
        }
      }
      animationFrameId = requestAnimationFrame(updateParallax)
    }

    animationFrameId = requestAnimationFrame(updateParallax)
    return () => cancelAnimationFrame(animationFrameId)
  }, [mouse, reducedMotion])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      {/* =========================================================================
          Layer 1: Dual-Scale Precision Computational Blueprint Grid
          ========================================================================= */}
      <div
        ref={layer1Ref}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, var(--color-border-subtle) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-border-subtle) 1px, transparent 1px),
            linear-gradient(to right, var(--color-border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 24px 24px, 96px 96px, 96px 96px',
          opacity: 0.65,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* =========================================================================
          Layer 2: Atmospheric Dual Radial Glows
          ========================================================================= */}
      {/* Primary Warm Terracotta / Orange Glow centered behind 3D Network */}
      <div
        ref={layer2Ref}
        style={{
          position: 'absolute',
          top: '15%',
          right: '5%',
          width: 'clamp(380px, 46vw, 680px)',
          height: 'clamp(380px, 46vw, 680px)',
          borderRadius: '50%',
          background: `radial-gradient(
            circle,
            var(--color-accent-glow) 0%,
            var(--color-accent-bg) 38%,
            transparent 72%
          )`,
          filter: 'blur(50px)',
          opacity: 0.85,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Secondary Faint Cyan/Teal Ambient Glow */}
      <div
        ref={layer3Ref}
        style={{
          position: 'absolute',
          top: '8%',
          right: '2%',
          width: 'clamp(280px, 32vw, 480px)',
          height: 'clamp(280px, 32vw, 480px)',
          borderRadius: '50%',
          background: `radial-gradient(
            circle,
            var(--color-accent-teal-bg) 0%,
            transparent 65%
          )`,
          filter: 'blur(60px)',
          opacity: 0.75,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* =========================================================================
          Layer 3: Technical Telemetry HUD HUD Data Tickers
          ========================================================================= */}
      <div
        style={{
          position: 'absolute',
          top: '104px',
          left: 'max(24px, 4vw)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.12em',
          color: 'var(--color-text-muted)',
          opacity: 0.6,
        }}
      >
        <span>{'// AI_SYSTEM_INITIALIZED'}</span>
        <span>{'// TENSOR_GRAPH: ACTIVE'}</span>
        <span>{'// LATENCY: 12MS'}</span>
      </div>

      {/* =========================================================================
          Layer 4: Deterministic Micro Floating Particles
          ========================================================================= */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {AMBIENT_PARTICLES.map((p) => {
          const isTeal = p.color === 'teal'
          return (
            <div
              key={p.id}
              className={!reducedMotion ? 'animate-particle-float' : ''}
              style={{
                position: 'absolute',
                top: p.y,
                left: p.x,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                backgroundColor: isTeal ? 'var(--color-accent-teal)' : 'var(--color-accent)',
                boxShadow: isTeal
                  ? '0 0 8px var(--color-accent-teal)'
                  : '0 0 8px var(--color-accent)',
                animationDuration: p.duration,
                animationDelay: p.delay,
                opacity: 0.7,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
