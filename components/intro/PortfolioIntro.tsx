'use client'

import React, { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'

export type IntroPhase = 'black' | 'bk' | 'identity' | 'dissolve' | 'complete'

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
    const debug = params.get('intro_phase') as IntroPhase | null
    if (debug && ['black', 'bk', 'identity', 'dissolve'].includes(debug)) {
      return debug
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

  const [phase, setPhase] = useState<IntroPhase>('black')
  const timersRef = useRef<NodeJS.Timeout[]>([])

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const completeIntro = useCallback(() => {
    clearAllTimers()
    try {
      sessionStorage.setItem('bk_intro_seen', 'true')
      document.documentElement.classList.remove('intro-active', 'intro-dissolving')
      document.documentElement.classList.add('intro-seen')
      document.documentElement.setAttribute('data-intro-seen', 'true')
    } catch {}
    setPhase('complete')
  }, [clearAllTimers])

  useEffect(() => {
    // If debug phase is active, already seen in session, or user prefers reduced motion:
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
    // Cinematic Apple-Inspired Signature Timeline (Harmonious & Organic)
    // 0.00s (0ms)   : Deep obsidian quiet canvas (frame 0)
    // 0.40s (400ms) : BK monogram mark softly emerges with warm aura
    // 1.50s (1500ms): Expands into full identity: BABUL KUMAR & AI · ML · FULL-STACK
    // 2.60s (2600ms): Cohesive reveal: identity floats up softly & page blooms in
    // 3.40s (3400ms): Sequence fully complete, unmount overlay, enable full page
    // =========================================================================
    const t1 = setTimeout(() => setPhase('bk'), 400)
    const t2 = setTimeout(() => setPhase('identity'), 1500)
    const t3 = setTimeout(() => {
      setPhase('dissolve')
      try {
        document.documentElement.classList.remove('intro-active')
        document.documentElement.classList.add('intro-dissolving')
      } catch {}
    }, 2600)
    const t4 = setTimeout(() => completeIntro(), 3400)

    // Safety failsafe timeout
    const tFailsafe = setTimeout(() => completeIntro(), 3900)

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
  const isDissolving = currentPhase === 'dissolve'
  const showBK = currentPhase === 'bk'
  const showIdentity = currentPhase === 'identity' || currentPhase === 'dissolve'

  return (
    <div
      className={`portfolio-intro-overlay ${isDissolving ? 'intro-dissolving' : ''}`}
      onClick={completeIntro}
      role="presentation"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'var(--color-bg, #060709)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        pointerEvents: isDissolving ? 'none' : 'auto',
        userSelect: 'none',
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isDissolving ? 0 : 1,
        willChange: 'opacity',
      }}
    >
      {/* Ambient Warm Radial Aura behind signature mark */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: isDissolving ? 'translate3d(-50%, -50%, 0) scale(1.15)' : 'translate3d(-50%, -50%, 0) scale(1)',
          width: 'clamp(320px, 48vw, 620px)',
          height: 'clamp(320px, 48vw, 620px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(228, 93, 44, 0.14) 0%, rgba(20, 184, 166, 0.04) 42%, transparent 70%)',
          pointerEvents: 'none',
          opacity: isDissolving ? 0 : 1,
          transition: 'opacity 0.75s ease-out, transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'opacity, transform',
        }}
      />

      {/* Central Identity Presentation Container */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '24px',
          transform: isDissolving ? 'translate3d(0, -18px, 0)' : 'translate3d(0, 0, 0)',
          opacity: isDissolving ? 0 : 1,
          filter: isDissolving ? 'blur(3px)' : 'none',
          transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s ease-out, filter 0.7s ease-out',
          willChange: 'opacity, transform, filter',
        }}
      >
        {/* Stage 1: BK Monogram Mark */}
        <div
          className="intro-bk-mark"
          style={{
            position: showIdentity ? 'absolute' : 'relative',
            opacity: showBK && !showIdentity ? 1 : 0,
            transform: showBK && !showIdentity ? 'scale(1) translate3d(0, 0, 0)' : showIdentity ? 'scale(0.96) translate3d(0, -6px, 0)' : 'scale(0.92) translate3d(0, 8px, 0)',
            transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            willChange: 'opacity, transform',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(52px, 6.5vw, 84px)',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: 'var(--color-text, #F5F6F8)',
              textShadow: '0 0 30px rgba(245, 246, 248, 0.2)',
            }}
          >
            BK
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(42px, 5.2vw, 68px)',
              fontWeight: 300,
              color: 'var(--color-accent, #E45D2C)',
              textShadow: '0 0 24px rgba(228, 93, 44, 0.4)',
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
            opacity: showIdentity && !isDissolving ? 1 : 0,
            transform: showIdentity && !isDissolving ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 8px, 0) scale(0.96)',
            transition: 'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'opacity, transform',
          }}
        >
          {/* Signature Name: BABUL KUMAR */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '14px',
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(32px, 4.6vw, 58px)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: 1.08,
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
              gap: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(11px, 1.2vw, 14px)',
              fontWeight: 600,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary, #9499A6)',
            }}
          >
            <span>AI</span>
            <span style={{ color: 'var(--color-accent-teal, #14B8A6)', opacity: 0.9, fontSize: '10px' }}>
              •
            </span>
            <span>ML</span>
            <span style={{ color: 'var(--color-accent-teal, #14B8A6)', opacity: 0.9, fontSize: '10px' }}>
              •
            </span>
            <span>FULL-STACK</span>
          </div>
        </div>
      </div>

      <style>{`
        /* Hide overlay immediately for returning visitors across SSR/SSG */
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
