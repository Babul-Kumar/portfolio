'use client'

import React, { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'

export type IntroPhase =
  | 'start'      // 0.00s: Deep OLED black canvas (#060709)
  | 'monogram'   // 0.15s: BK monogram awakens with soft ambient core glow
  | 'transform'  // 1.20s: Connected morph from BK into BABUL KUMAR with subtle light pass
  | 'hold'       // 1.80s: Deliberate, crisp, stationary reading hold
  | 'wake'       // 2.80s: Android wake-up: radial bloom expands, canvas dissolves
  | 'content'    // 3.40s: Avatar, hero narrative, and navbar resolve synchronously
  | 'complete'   // 4.35s: Unmount cleanly, 100% interactive

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
      if (['transform', 'identity'].includes(debug)) return 'transform'
      if (['hold'].includes(debug)) return 'hold'
      if (['wake', 'dissolve', 'emerge'].includes(debug)) return 'wake'
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
        if (debugPhase === 'wake') {
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
    // Premium Flagship Android Boot Sequence Timeline (~4.35s total duration)
    // 0.00s (0ms)   : Deep OLED black canvas (#060709)
    // 0.15s (150ms) : BK monogram awakens with soft ambient backlight
    // 1.20s (1200ms): Connected morph from BK into BABUL KUMAR with subtle light pass
    // 1.80s (1800ms): Deliberate, crisp, stationary reading hold (1.0s window)
    // 2.80s (2800ms): Android wake-up: radial bloom expands, canvas dissolves
    // 3.40s (3400ms): Real avatar, hero narrative, and navbar resolve in unison
    // 4.35s (4350ms): Sequence complete: overlay unmounts cleanly, page interactive
    // =========================================================================

    const t1 = setTimeout(() => {
      setPhase('monogram')
    }, 150)

    const t2 = setTimeout(() => {
      setPhase('transform')
    }, 1200)

    const t3 = setTimeout(() => {
      setPhase('hold')
    }, 1800)

    const t4 = setTimeout(() => {
      setPhase('wake')
      try {
        document.documentElement.classList.add('intro-emerging')
      } catch {}
    }, 2800)

    const t5 = setTimeout(() => {
      setPhase('content')
      try {
        document.documentElement.classList.add('intro-content-reveal')
      } catch {}
    }, 3400)

    const t6 = setTimeout(() => {
      completeIntro()
    }, 4350)

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
  const isMonogramActive = currentPhase === 'monogram'
  const isIdentityActive = currentPhase === 'transform' || currentPhase === 'hold'
  const isWaking = currentPhase === 'wake' || currentPhase === 'content'

  return (
    <div
      className={`portfolio-intro-overlay ${isWaking ? 'intro-waking' : ''}`}
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
        pointerEvents: isWaking ? 'none' : 'auto',
        userSelect: 'none',
        transition: 'opacity 1.05s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isWaking ? 0 : 1,
        willChange: 'opacity',
        overflow: 'hidden',
      }}
    >
      {/* =========================================================================
          Ambient Radial Wake Halo (OLED Display Backlight & Wake Bloom)
         ========================================================================= */}
      <div
        className="intro-radial-halo"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 'clamp(340px, 44vw, 560px)',
          height: 'clamp(340px, 44vw, 560px)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(228, 93, 44, 0.16) 0%, rgba(20, 184, 166, 0.07) 35%, transparent 70%)',
          pointerEvents: 'none',
          willChange: 'transform, opacity',
          transform: isWaking
            ? 'translate(-50%, -50%) scale(3.4)'
            : isIdentityActive
              ? 'translate(-50%, -50%) scale(1.15)'
              : isMonogramActive
                ? 'translate(-50%, -50%) scale(1.0)'
                : 'translate(-50%, -50%) scale(0.85)',
          opacity: isWaking
            ? 0
            : isIdentityActive
              ? 0.75
              : isMonogramActive
                ? 0.6
                : 0,
          transition: isWaking
            ? 'transform 0.95s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.95s cubic-bezier(0.16, 1, 0.3, 1)'
            : isIdentityActive
              ? 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.65s ease-out'
              : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out',
        }}
      />

      {/* =========================================================================
          Central Anchored Identity Container
         ========================================================================= */}
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
          opacity: isWaking ? 0 : 1,
          transform: isWaking ? 'scale(1.02)' : 'scale(1.0)',
          transition: isWaking
            ? 'opacity 0.5s ease-out, transform 0.5s ease-out'
            : 'none',
          willChange: 'opacity, transform',
        }}
      >
        {/* Stage 1: BK Monogram Mark (Initial Awakening) */}
        <div
          className="intro-bk-mark"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            pointerEvents: 'none',
            willChange: 'opacity, transform, letter-spacing',
            opacity: isMonogramActive ? 1 : 0,
            transform: isMonogramActive
              ? 'scale(1.0)'
              : currentPhase === 'start'
                ? 'scale(0.94)'
                : 'scale(1.05)',
            letterSpacing: isMonogramActive
              ? '0.08em'
              : currentPhase === 'start'
                ? '0.12em'
                : '0.18em',
            transition: isMonogramActive
              ? 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), letter-spacing 0.75s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'opacity 0.38s ease-out, transform 0.38s ease-out, letter-spacing 0.38s ease-out',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(48px, 6vw, 76px)',
              fontWeight: 700,
              color: '#F5F6F8',
              lineHeight: 1,
              textShadow: '0 0 28px rgba(245, 246, 248, 0.12)',
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
              lineHeight: 1,
              opacity: isMonogramActive ? 0.9 : 0,
              transition: 'opacity 0.28s ease-out',
              textShadow: '0 0 20px rgba(228, 93, 44, 0.28)',
            }}
          >
            /
          </span>
        </div>

        {/* Stage 2 & Hold: BABUL KUMAR Identity & Pillars */}
        <div
          className="intro-identity-wrapper"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            willChange: 'opacity, transform',
            opacity: isIdentityActive ? 1 : 0,
            transform: isIdentityActive ? 'scale(1.0)' : 'scale(0.96)',
            transition: isIdentityActive
              ? 'opacity 0.58s cubic-bezier(0.16, 1, 0.3, 1), transform 0.58s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'opacity 0.4s ease-out, transform 0.4s ease-out',
          }}
        >
          {/* Signature Typography: BABUL KUMAR with Refined Sheen Beam */}
          <div
            style={{
              position: 'relative',
              marginBottom: '14px',
              display: 'inline-block',
              overflow: 'hidden',
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
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.6)',
              }}
            >
              <span style={{ color: '#F5F6F8' }}>BABUL</span>
              <span style={{ color: '#E45D2C' }}>KUMAR</span>
            </h1>

            {/* Subtle Android Horizontal Sheen Beam */}
            {currentPhase === 'transform' && (
              <div
                className="android-sheen-beam"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '60%',
                  height: '100%',
                  background:
                    'linear-gradient(105deg, transparent 15%, rgba(255, 255, 255, 0.22) 50%, transparent 85%)',
                  pointerEvents: 'none',
                  animation: 'androidSheenPass 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              />
            )}
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
              opacity: isIdentityActive ? 1 : 0,
              transform: isIdentityActive ? 'translateY(0)' : 'translateY(5px)',
              transition: isIdentityActive
                ? 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.16s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.16s'
                : 'opacity 0.3s ease-out, transform 0.3s ease-out',
            }}
          >
            <span>AI</span>
            <span
              style={{
                color: '#14B8A6',
                opacity: 0.9,
                fontSize: '9px',
                textShadow: '0 0 6px rgba(20, 184, 166, 0.6)',
              }}
            >
              •
            </span>
            <span>ML</span>
            <span
              style={{
                color: '#14B8A6',
                opacity: 0.9,
                fontSize: '9px',
                textShadow: '0 0 6px rgba(20, 184, 166, 0.6)',
              }}
            >
              •
            </span>
            <span>FULL-STACK</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes androidSheenPass {
          0% {
            transform: translateX(-120%);
            opacity: 0;
          }
          30% {
            opacity: 0.6;
          }
          70% {
            opacity: 0.45;
          }
          100% {
            transform: translateX(200%);
            opacity: 0;
          }
        }

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
