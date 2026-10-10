'use client'

import React, { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'

export type IntroPhase =
  | 'start'      // 0.00s: Pure quiet dark canvas (#060709)
  | 'monogram'   // 0.15s: BK monogram smoothly emerges and settles into stillness
  | 'identity'   // 1.05s: Smooth cross-fade to BABUL KUMAR & technical pillars
  | 'hold'       // 1.65s: Deliberate, intentional, stationary readable hold
  | 'dissolve'   // 2.70s: Identity text dissolves, dark canvas lifts to reveal environment
  | 'content'    // 3.40s: Avatar, hero content, and navbar resolve as a unified composition
  | 'complete'   // 4.55s: Sequence complete, overlay unmounts, homepage fully interactive

function subscribeNoop() {
  return () => {}
}

function getSessionSnapshot(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const params = new URLSearchParams(window.location.search)
    if (
      params.get('replay') === 'true' ||
      params.get('intro') === 'true' ||
      params.get('force_intro') === 'true' ||
      Boolean(params.get('intro_phase'))
    ) {
      return false
    }
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
      if (['hold'].includes(debug)) return 'hold'
      if (['dissolve', 'emerge'].includes(debug)) return 'dissolve'
      if (['content'].includes(debug)) return 'content'
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
      document.documentElement.classList.remove('intro-active', 'intro-emerging', 'intro-content-reveal')
      document.documentElement.classList.add('intro-seen')
      document.documentElement.setAttribute('data-intro-seen', 'true')
    } catch {}
    setPhase('complete')
  }, [clearAllTimers])

  useEffect(() => {
    // Immediate bypass for reduced motion or returning visitor without debug override
    if (sessionSeen || reducedMotion) {
      try {
        document.documentElement.classList.add('intro-seen')
      } catch {}
      return
    }

    // Static phase inspection override for debugging and visual verification
    if (debugPhase) {
      try {
        document.documentElement.classList.add('intro-active')
        if (debugPhase === 'dissolve') {
          document.documentElement.classList.add('intro-emerging')
        } else if (debugPhase === 'content') {
          document.documentElement.classList.add('intro-content-reveal')
        }
      } catch {}
      return
    }

    try {
      document.documentElement.classList.add('intro-active')
      document.documentElement.classList.remove('intro-emerging', 'intro-content-reveal')
    } catch {}

    // =========================================================================
    // Coordinated Cinematic Brand Introduction Timeline (~4.5s total duration)
    // 0.00s (0ms)   : Pure quiet dark canvas (#060709)
    // 0.15s (150ms) : BK monogram mark emerges and settles into stillness
    // 1.05s (1050ms): Smooth continuous cross-fade into BABUL KUMAR & AI · ML · FULL-STACK
    // 1.65s (1650ms): Identity fully established, enters deliberate stationary hold
    // 2.70s (2700ms): Environment emerges from darkness as overlay begins graceful dissolve
    // 3.40s (3400ms): Real avatar, hero content, and navbar resolve into place in unison
    // 4.55s (4550ms): Sequence complete: overlay unmounts cleanly, page fully interactive
    // =========================================================================

    const t1 = setTimeout(() => {
      setPhase('monogram')
    }, 150)

    const t2 = setTimeout(() => {
      setPhase('identity')
    }, 1050)

    const t3 = setTimeout(() => {
      setPhase('hold')
    }, 1650)

    const t4 = setTimeout(() => {
      setPhase('dissolve')
      try {
        document.documentElement.classList.add('intro-emerging')
      } catch {}
    }, 2700)

    const t5 = setTimeout(() => {
      setPhase('content')
      try {
        document.documentElement.classList.add('intro-content-reveal')
      } catch {}
    }, 3400)

    const t6 = setTimeout(() => {
      completeIntro()
    }, 4550)

    // Safety failsafe
    const tFailsafe = setTimeout(() => {
      completeIntro()
    }, 5500)

    timersRef.current = [t1, t2, t3, t4, t5, t6, tFailsafe]

    const handleKeyDown = (e: KeyboardEvent) => {
      // Replay shortcut for testing (Shift + R or Shift + I)
      if ((e.key === 'R' || e.key === 'r' || e.key === 'I' || e.key === 'i') && e.shiftKey) {
        try {
          sessionStorage.removeItem('bk_intro_seen')
          window.location.search = '?replay=true'
        } catch {}
        return
      }

      // Quick dismiss on Escape, Space, or Enter
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
  const isMonogram = currentPhase === 'monogram'
  const isIdentityOrHold = currentPhase === 'identity' || currentPhase === 'hold'
  const isDissolving = currentPhase === 'dissolve' || currentPhase === 'content'

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
        backgroundColor: '#060709',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        pointerEvents: isDissolving ? 'none' : 'auto',
        userSelect: 'none',
        transition: 'opacity 0.95s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isDissolving ? 0 : 1,
        willChange: 'opacity',
        overflow: 'hidden',
      }}
    >
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
          minHeight: '160px',
          opacity: isDissolving ? 0 : 1,
          transition: 'opacity 0.55s ease-out',
          willChange: 'opacity',
        }}
      >
        {/* Stage 1: Stationary BK Monogram Mark */}
        <div
          className="intro-bk-mark"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            opacity: isMonogram ? 1 : 0,
            transition: isMonogram
              ? 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'opacity 0.35s ease-out',
            willChange: 'opacity',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(48px, 6vw, 76px)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#F5F6F8',
              lineHeight: 1,
            }}
          >
            BK
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(40px, 5vw, 64px)',
              fontWeight: 300,
              color: '#E45D2C',
              opacity: 0.9,
              lineHeight: 1,
            }}
          >
            /
          </span>
        </div>

        {/* Stage 2 & 3: Expanded Personal Identity & Engineering Pillars */}
        <div
          className="intro-identity-wrapper"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isIdentityOrHold ? 1 : 0,
            transition: isIdentityOrHold
              ? 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'opacity 0.4s ease-out',
            willChange: 'opacity',
            pointerEvents: 'none',
          }}
        >
          {/* Signature Name: BABUL KUMAR */}
          <div
            style={{
              marginBottom: '14px',
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(34px, 4.8vw, 56px)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ color: '#F5F6F8' }}>BABUL</span>
              <span style={{ color: '#E45D2C' }}>KUMAR</span>
            </h1>
          </div>

          {/* Technical Sub-Signature: AI · ML · FULL-STACK */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(12px, 1.2vw, 14px)',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#9499A6',
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
