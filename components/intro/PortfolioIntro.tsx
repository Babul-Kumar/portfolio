'use client'

import React, { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'

export type IntroPhase = 'start' | 'monogram' | 'identity' | 'emerge' | 'complete'

function subscribeNoop() {
  return () => {}
}

function getSessionSnapshot(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem('bk_intro_seen') === 'true'
  } catch {
    return false
  }
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getDebugPhaseSnapshot(): IntroPhase | null {
  if (typeof window === 'undefined') return null
  try {
    const params = new URLSearchParams(window.location.search)
    const debug = params.get('intro_phase')
    if (debug) {
      if (['monogram', 'bk'].includes(debug)) return 'monogram'
      if (['identity'].includes(debug)) return 'identity'
      if (['emerge', 'dissolve'].includes(debug)) return 'emerge'
    }
  } catch {
    return null
  }
  return null
}

export default function PortfolioIntro() {
  const sessionSeen = useSyncExternalStore(subscribeNoop, getSessionSnapshot, () => false)
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false)
  const debugPhase = useSyncExternalStore(subscribeNoop, getDebugPhaseSnapshot, () => null)

  const [phase, setPhase] = useState<IntroPhase>('start')
  const timersRef = useRef<NodeJS.Timeout[]>([])

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const completeIntro = useCallback(() => {
    clearAllTimers()
    try {
      sessionStorage.setItem('bk_intro_seen', 'true')
      document.documentElement.classList.remove('intro-active', 'intro-emerging', 'intro-dissolving')
      document.documentElement.classList.add('intro-seen')
      document.documentElement.setAttribute('data-intro-seen', 'true')
    } catch {}
    setPhase('complete')
  }, [clearAllTimers])

  useEffect(() => {
    // Immediate bypass for reduced motion, returning visitor, or active debug phase
    if (debugPhase || sessionSeen || reducedMotion) {
      try {
        document.documentElement.classList.add('intro-seen')
      } catch {}
      return
    }

    try {
      document.documentElement.classList.add('intro-active')
    } catch {}

    // =========================================================================
    // Redesigned Continuous Brand Reveal Timeline (~1.2s total duration)
    // 0.00s (0ms)   : Pure quiet dark canvas (#060709)
    // 0.08s (80ms)  : BK monogram mark smoothly emerges with subtle warm aura
    // 0.42s (420ms) : Identity seamlessly unfolds: BABUL KUMAR & AI · ML · FULL-STACK
    // 0.82s (820ms) : Environment emerges: darkness lifts, real hero grid & avatar reveal
    // 1.20s (1200ms): Sequence complete: overlay unmounts cleanly, page interactive
    // =========================================================================
    const t1 = setTimeout(() => setPhase('monogram'), 80)
    const t2 = setTimeout(() => setPhase('identity'), 420)
    const t3 = setTimeout(() => {
      setPhase('emerge')
      try {
        document.documentElement.classList.remove('intro-active')
        document.documentElement.classList.add('intro-emerging', 'intro-dissolving')
      } catch {}
    }, 820)
    const t4 = setTimeout(() => completeIntro(), 1200)

    // Safety failsafe timeout
    const tFailsafe = setTimeout(() => completeIntro(), 1500)

    timersRef.current = [t1, t2, t3, t4, tFailsafe]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        completeIntro()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearAllTimers()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [debugPhase, sessionSeen, reducedMotion, completeIntro, clearAllTimers])

  // If already seen in session, reduced-motion preferred, or completed, render nothing
  if (!debugPhase && (sessionSeen || reducedMotion || phase === 'complete')) {
    return null
  }

  const currentPhase = debugPhase || phase
  const isEmerging = currentPhase === 'emerge'
  const isMonogram = currentPhase === 'monogram'
  const isIdentity = currentPhase === 'identity' || currentPhase === 'emerge'

  return (
    <div
      className={`portfolio-intro-overlay ${isEmerging ? 'intro-emerging intro-dissolving' : ''}`}
      onClick={completeIntro}
      role="presentation"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#060709',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        pointerEvents: isEmerging ? 'none' : 'auto',
        userSelect: 'none',
        transition: 'opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isEmerging ? 0 : 1,
        willChange: 'opacity',
        overflow: 'hidden',
      }}
    >
      {/* Restrained Ambient Warm Aura behind signature mark */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate3d(-50%, -50%, 0)',
          width: 'clamp(280px, 36vw, 480px)',
          height: 'clamp(280px, 36vw, 480px)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(228, 93, 44, 0.08) 0%, rgba(20, 184, 166, 0.02) 40%, transparent 68%)',
          pointerEvents: 'none',
          opacity: isEmerging ? 0 : isMonogram || isIdentity ? 1 : 0,
          transition: 'opacity 0.32s ease-out',
          willChange: 'opacity',
        }}
      />

      {/* Central Identity Presentation Container (Anchored Focal Point) */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '24px',
          width: '100%',
          maxWidth: '720px',
          transform: isEmerging ? 'translate3d(0, -6px, 0)' : 'translate3d(0, 0, 0)',
          opacity: isEmerging ? 0 : 1,
          transition: 'opacity 0.32s cubic-bezier(0.16, 1, 0.3, 1), transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'opacity, transform',
        }}
      >
        {/* Stage 1: BK Monogram Mark */}
        <div
          className="intro-bk-mark"
          style={{
            position: isIdentity ? 'absolute' : 'relative',
            opacity: isMonogram ? 1 : 0,
            transform: isMonogram
              ? 'translate3d(0, 0, 0)'
              : isIdentity
                ? 'translate3d(0, -2px, 0)'
                : 'translate3d(0, 4px, 0)',
            transition: 'opacity 0.26s cubic-bezier(0.16, 1, 0.3, 1), transform 0.26s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            willChange: 'opacity, transform',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(44px, 5.5vw, 68px)',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--color-text, #F5F6F8)',
              textShadow: '0 0 24px rgba(245, 246, 248, 0.12)',
            }}
          >
            BK
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(36px, 4.5vw, 56px)',
              fontWeight: 300,
              color: 'var(--color-accent, #E45D2C)',
              textShadow: '0 0 20px rgba(228, 93, 44, 0.3)',
              opacity: 0.9,
            }}
          >
            /
          </span>
        </div>

        {/* Stage 2: Expanded Personal Identity & Engineering Pillars */}
        <div
          className="intro-identity-wrapper"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: isIdentity ? 1 : 0,
            transform: isIdentity ? 'translate3d(0, 0, 0)' : 'translate3d(0, 4px, 0)',
            transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'opacity, transform',
            pointerEvents: 'none',
          }}
        >
          {/* Signature Name: BABUL KUMAR */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(30px, 4.2vw, 52px)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ color: 'var(--color-text, #F5F6F8)' }}>BABUL</span>
              <span style={{ color: 'var(--color-accent, #E45D2C)' }}>KUMAR</span>
            </h1>
          </div>

          {/* Technical Sub-Signature: AI · ML · FULL-STACK */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(11px, 1.1vw, 13px)',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary, #9499A6)',
              opacity: isIdentity ? 1 : 0,
              transform: isIdentity ? 'translate3d(0, 0, 0)' : 'translate3d(0, 3px, 0)',
              transition:
                'opacity 0.26s cubic-bezier(0.16, 1, 0.3, 1) 0.08s, transform 0.26s cubic-bezier(0.16, 1, 0.3, 1) 0.08s',
              willChange: 'opacity, transform',
            }}
          >
            <span>AI</span>
            <span style={{ color: 'var(--color-accent-teal, #14B8A6)', opacity: 0.85, fontSize: '9px' }}>
              •
            </span>
            <span>ML</span>
            <span style={{ color: 'var(--color-accent-teal, #14B8A6)', opacity: 0.85, fontSize: '9px' }}>
              •
            </span>
            <span>FULL-STACK</span>
          </div>
        </div>
      </div>

      <style>{`
        /* Immediate suppression for returning visitors across SSR/SSG */
        html.intro-seen .portfolio-intro-overlay,
        html[data-intro-seen="true"] .portfolio-intro-overlay {
          display: none !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .portfolio-intro-overlay {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
