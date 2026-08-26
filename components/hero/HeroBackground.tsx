'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

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
  const [parallax, setParallax] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (reducedMotion) return

    let animationFrameId: number
    const updateParallax = () => {
      if (mouse.current) {
        setParallax({
          x: mouse.current.x * 12,
          y: mouse.current.y * 12,
        })
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
          transform: `translate3d(${parallax.x * 0.15}px, ${parallax.y * 0.15}px, 0)`,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* =========================================================================
          Layer 2: Atmospheric Dual Radial Glows
          ========================================================================= */}
      {/* Primary Warm Terracotta / Orange Glow centered behind 3D Network */}
      <div
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
          transform: `translate3d(${parallax.x * 0.25}px, ${parallax.y * 0.25}px, 0)`,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Secondary Faint Cyan/Teal Ambient Glow */}
      <div
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
          transform: `translate3d(${parallax.x * 0.18}px, ${parallax.y * 0.18}px, 0)`,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* =========================================================================
          Layer 3: 2D Engineering Construction Lines & Blueprint Blueprint Marks (SVG)
          ========================================================================= */}
      <svg
        viewBox="0 0 1440 900"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.55,
          transform: `translate3d(${parallax.x * 0.35}px, ${parallax.y * 0.35}px, 0)`,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="traceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Large Faint Architectural Arc framing the right-hand visual */}
        <path
          d="M 1320,120 A 420 420 0 0 0 920,580"
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />

        <path
          d="M 1280,180 A 340 340 0 0 0 980,540"
          fill="none"
          stroke="var(--color-border-subtle)"
          strokeWidth="1"
        />

        {/* Horizontal Technical Axis Trace */}
        <line
          x1="860"
          y1="340"
          x2="1380"
          y2="340"
          stroke="url(#traceGrad)"
          strokeWidth="1"
        />

        {/* Measurement Crosshairs (+) at key structural intersections */}
        {/* Crosshair 1 */}
        <g transform="translate(960, 240)">
          <line x1="-8" y1="0" x2="8" y2="0" stroke="var(--color-border-hover)" strokeWidth="1" />
          <line x1="0" y1="-8" x2="0" y2="8" stroke="var(--color-border-hover)" strokeWidth="1" />
          <circle cx="0" cy="0" r="2" fill="none" stroke="var(--color-accent)" strokeWidth="0.8" />
        </g>

        {/* Crosshair 2 */}
        <g transform="translate(1260, 480)">
          <line x1="-8" y1="0" x2="8" y2="0" stroke="var(--color-border-hover)" strokeWidth="1" />
          <line x1="0" y1="-8" x2="0" y2="8" stroke="var(--color-border-hover)" strokeWidth="1" />
          <circle cx="0" cy="0" r="2" fill="none" stroke="var(--color-accent-teal)" strokeWidth="0.8" />
        </g>

        {/* Crosshair 3 */}
        <g transform="translate(1080, 620)">
          <line x1="-6" y1="0" x2="6" y2="0" stroke="var(--color-border)" strokeWidth="1" />
          <line x1="0" y1="-6" x2="0" y2="6" stroke="var(--color-border)" strokeWidth="1" />
        </g>

        {/* Technical Coordinate Indicators */}
        <text
          x="1000"
          y="180"
          fill="var(--color-text-muted)"
          fontSize="9"
          fontFamily="var(--font-mono)"
          letterSpacing="0.12em"
          opacity="0.6"
        >
          [SYS_LAT: 31.2536° N // 75.7037° E]
        </text>

        <text
          x="1240"
          y="660"
          fill="var(--color-text-muted)"
          fontSize="9"
          fontFamily="var(--font-mono)"
          letterSpacing="0.12em"
          opacity="0.6"
        >
          [TENSOR_MATRIX // α-01]
        </text>

        <text
          x="940"
          y="520"
          fill="var(--color-accent)"
          fontSize="8"
          fontFamily="var(--font-mono)"
          letterSpacing="0.1em"
          opacity="0.5"
        >
          + 0.892_ROC
        </text>
      </svg>

      {/* =========================================================================
          Layer 4: Subtle Ambient Data Particles
          ========================================================================= */}
      {AMBIENT_PARTICLES.map((p) => {
        const isTeal = p.color === 'teal'
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              backgroundColor: isTeal ? 'var(--color-accent-teal)' : 'var(--color-accent)',
              boxShadow: isTeal
                ? '0 0 6px rgba(20, 184, 166, 0.4)'
                : '0 0 6px rgba(228, 93, 44, 0.4)',
              opacity: 0.45,
              transform: `translate3d(${parallax.x * 0.3}px, ${parallax.y * 0.3}px, 0)`,
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        )
      })}

      {/* =========================================================================
          Layer 5: Soft Viewport Edge Vignette
          ========================================================================= */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(
            ellipse at center,
            transparent 50%,
            var(--color-bg) 95%
          )`,
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
