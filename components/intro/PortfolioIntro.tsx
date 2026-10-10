'use client'

import React, { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'

export type IntroPhase =
  | 'monogram'   // BK monogram awakens with soft ambient core glow
  | 'transform'  // Continuous overlapping cross-transition from BK into BABUL KUMAR
  | 'hold'       // Stationary reading hold with light sheen pass
  | 'wake'       // Radial halo blooms outward, dark canvas dissolves
  | 'content'    // Real homepage elements emerge and settle
  | 'complete'   // Unmounted and 100% interactive

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
      if (['transform', 'identity', 'morph'].includes(debug)) return 'transform'
      if (['hold', 'stationary'].includes(debug)) return 'hold'
      if (['wake', 'bloom', 'dissolve'].includes(debug)) return 'wake'
      if (['content', 'emerge'].includes(debug)) return 'content'
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

  const [isMounted, setIsMounted] = useState(true)
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
    setIsMounted(false)
  }, [clearAllTimers])

  useEffect(() => {
    // Immediate bypass for reduced motion or returning visitors without debug override
    if (sessionSeen || reducedMotion) {
      try {
        document.documentElement.classList.add('intro-seen')
        document.documentElement.classList.remove('intro-active')
      } catch {}
      return
    }

    // Static phase inspection override for visual QA and screenshot capture
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
      document.documentElement.classList.remove('intro-seen')
    } catch {}

    // Master completion timer: 4.35s (clean dissolution, zero jump)
    const masterTimer = setTimeout(() => {
      completeIntro()
    }, 4350)

    // Safety failsafe
    const failsafeTimer = setTimeout(() => {
      completeIntro()
    }, 5500)

    timersRef.current = [masterTimer, failsafeTimer]

    const handleKeyDown = (e: KeyboardEvent) => {
      // Replay shortcut: Shift + R or Shift + I
      if ((e.key === 'R' || e.key === 'r' || e.key === 'I' || e.key === 'i') && e.shiftKey) {
        try {
          sessionStorage.removeItem('bk_intro_seen')
          window.location.search = '?replay=true'
        } catch {}
        return
      }

      // Fast dismiss: Escape, Space, or Enter
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

  // If already seen, reduced-motion preferred, or completed, unmount cleanly
  if (!debugPhase && (sessionSeen || reducedMotion || !isMounted)) {
    return null
  }

  const isDebugging = debugPhase !== null

  return (
    <div
      className={`portfolio-intro-overlay ${!isDebugging ? 'intro-running' : ''}`}
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
        userSelect: 'none',
        overflow: 'hidden',
        ...(isDebugging && debugPhase === 'content'
          ? { opacity: 0, pointerEvents: 'none' }
          : isDebugging && debugPhase === 'wake'
            ? { opacity: 0.35, pointerEvents: 'none' }
            : {}),
      }}
    >
      {/* =========================================================================
          Luminous Radial Halo (Central Ambient Core Backlight)
         ========================================================================= */}
      <div
        className={`intro-radial-halo ${!isDebugging ? 'intro-running' : ''}`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 'clamp(380px, 48vw, 640px)',
          height: 'clamp(380px, 48vw, 640px)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(228, 93, 44, 0.35) 0%, rgba(20, 184, 166, 0.16) 38%, rgba(228, 93, 44, 0.05) 65%, transparent 75%)',
          pointerEvents: 'none',
          willChange: 'transform, opacity',
          ...(isDebugging && debugPhase === 'monogram'
            ? { transform: 'translate(-50%, -50%) scale(1.0)', opacity: 0.72 }
            : isDebugging && debugPhase === 'transform'
              ? { transform: 'translate(-50%, -50%) scale(1.06)', opacity: 0.78 }
              : isDebugging && debugPhase === 'hold'
                ? { transform: 'translate(-50%, -50%) scale(1.14)', opacity: 0.85 }
                : isDebugging && debugPhase === 'wake'
                  ? { transform: 'translate(-50%, -50%) scale(3.6)', opacity: 0.38 }
                  : {}),
        }}
      />

      {/* =========================================================================
          Shared Optical Identity Stage (Absolute Shared Geometric Center)
         ========================================================================= */}
      <div
        className="intro-optical-stage"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
          maxWidth: '760px',
          height: '180px',
        }}
      >
        {/* Layer 1: BK Monogram Mark */}
        <div
          className={`intro-bk-mark ${!isDebugging ? 'intro-running' : ''}`}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            pointerEvents: 'none',
            willChange: 'opacity, transform, letter-spacing',
            ...(isDebugging && debugPhase === 'monogram'
              ? { opacity: 1, transform: 'scale(1.0)', letterSpacing: '0.06em' }
              : isDebugging && debugPhase === 'transform'
                ? { opacity: 0.60, transform: 'scale(1.02)', letterSpacing: '0.08em' }
                : isDebugging && (debugPhase === 'hold' || debugPhase === 'wake' || debugPhase === 'content')
                  ? { opacity: 0 }
                  : {}),
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(48px, 6vw, 76px)',
              fontWeight: 700,
              color: '#F5F6F8',
              lineHeight: 1,
              textShadow: '0 0 32px rgba(245, 246, 248, 0.16)',
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
              textShadow: '0 0 24px rgba(228, 93, 44, 0.36)',
            }}
          >
            /
          </span>
        </div>

        {/* Layer 2: BABUL KUMAR Identity & Technical Sub-Signature */}
        <div
          className={`intro-identity-wrapper ${!isDebugging ? 'intro-running' : ''}`}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            willChange: 'opacity, transform',
            ...(isDebugging && debugPhase === 'monogram'
              ? { opacity: 0 }
              : isDebugging && debugPhase === 'transform'
                ? { opacity: 0.50, transform: 'scale(0.98)' }
                : isDebugging && debugPhase === 'hold'
                  ? { opacity: 1, transform: 'scale(1.0)' }
                  : isDebugging && debugPhase === 'wake'
                    ? { opacity: 0.25, transform: 'scale(1.02)' }
                    : isDebugging && debugPhase === 'content'
                      ? { opacity: 0 }
                      : {}),
          }}
        >
          {/* Centered Typography Unit */}
          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Signature Name: BABUL KUMAR */}
            <div
              style={{
                position: 'relative',
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
                  textShadow: '0 2px 24px rgba(0, 0, 0, 0.7)',
                }}
              >
                <span style={{ color: '#F5F6F8' }}>BABUL</span>
                <span style={{ color: '#E45D2C' }}>KUMAR</span>
              </h1>

              {/* Light Sheen Beam Sweep */}
              <div
                className={`android-sheen-beam ${!isDebugging ? 'intro-running' : ''}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '50%',
                  height: '100%',
                  background:
                    'linear-gradient(105deg, transparent 10%, rgba(255, 255, 255, 0.35) 50%, transparent 90%)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Technical Subtitle: AI · ML · FULL-STACK (Absolute positioning preserves optical center of h1) */}
            <div
              className={`intro-subtitle ${!isDebugging ? 'intro-running' : ''}`}
              style={{
                position: 'absolute',
                top: 'calc(100% + 14px)',
                left: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(12px, 1.2vw, 14px)',
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#9499A6',
                whiteSpace: 'nowrap',
                willChange: 'opacity, transform',
                ...(isDebugging && debugPhase === 'hold'
                  ? { opacity: 1, transform: 'translateY(0)' }
                  : {}),
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
      </div>

      <style>{`
        /* Master 4.40s Continuous Animation Choreography */
        @keyframes introOverlayDissolve {
          0%, 56% {
            opacity: 1;
            pointer-events: auto;
          }
          86% {
            opacity: 0;
            pointer-events: none;
          }
          100% {
            opacity: 0;
            pointer-events: none;
          }
        }

        @keyframes introHaloFlow {
          0%, 4.5% {
            transform: translate(-50%, -50%) scale(0.85);
            opacity: 0;
          }
          19% {
            transform: translate(-50%, -50%) scale(1.0);
            opacity: 0.72;
          }
          26% {
            transform: translate(-50%, -50%) scale(1.02);
            opacity: 0.75;
          }
          42% {
            transform: translate(-50%, -50%) scale(1.12);
            opacity: 0.82;
          }
          56% {
            transform: translate(-50%, -50%) scale(1.18);
            opacity: 0.90;
          }
          78% {
            transform: translate(-50%, -50%) scale(3.8);
            opacity: 0.35;
          }
          88% {
            transform: translate(-50%, -50%) scale(4.4);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(4.4);
            opacity: 0;
          }
        }

        @keyframes introBkMorph {
          0%, 4.5% {
            opacity: 0;
            transform: scale(0.94);
            letter-spacing: 0.09em;
          }
          18% {
            opacity: 1;
            transform: scale(1.0);
            letter-spacing: 0.06em;
          }
          24% {
            opacity: 1;
            transform: scale(1.0);
            letter-spacing: 0.06em;
          }
          30% {
            opacity: 0.65;
            transform: scale(1.02);
            letter-spacing: 0.08em;
          }
          37.5% {
            opacity: 0;
            transform: scale(1.045);
            letter-spacing: 0.10em;
          }
          100% {
            opacity: 0;
            transform: scale(1.045);
            letter-spacing: 0.10em;
          }
        }

        @keyframes introIdentityCrystallize {
          0%, 24% {
            opacity: 0;
            transform: scale(0.96);
          }
          30% {
            opacity: 0.50;
            transform: scale(0.98);
          }
          37.5% {
            opacity: 1;
            transform: scale(1.0);
          }
          56% {
            opacity: 1;
            transform: scale(1.0);
          }
          68% {
            opacity: 0.35;
            transform: scale(1.015);
          }
          76% {
            opacity: 0;
            transform: scale(1.025);
          }
          100% {
            opacity: 0;
            transform: scale(1.025);
          }
        }

        @keyframes introSheenSweep {
          0%, 42% {
            transform: translateX(-140%);
            opacity: 0;
          }
          43% {
            opacity: 0.65;
          }
          52% {
            opacity: 0.55;
          }
          56% {
            transform: translateX(240%);
            opacity: 0;
          }
          100% {
            transform: translateX(240%);
            opacity: 0;
          }
        }

        @keyframes introSubtitleReveal {
          0%, 35% {
            opacity: 0;
            transform: translateY(6px);
          }
          42% {
            opacity: 1;
            transform: translateY(0);
          }
          56% {
            opacity: 1;
            transform: translateY(0);
          }
          72% {
            opacity: 0;
            transform: translateY(2px);
          }
          100% {
            opacity: 0;
            transform: translateY(2px);
          }
        }

        /* Applied via .intro-running for hardware-accelerated compositor execution */
        .portfolio-intro-overlay.intro-running {
          animation: introOverlayDissolve 4.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .intro-radial-halo.intro-running {
          animation: introHaloFlow 4.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .intro-bk-mark.intro-running {
          animation: introBkMorph 4.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .intro-identity-wrapper.intro-running {
          animation: introIdentityCrystallize 4.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .android-sheen-beam.intro-running {
          animation: introSheenSweep 4.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .intro-subtitle.intro-running {
          animation: introSubtitleReveal 4.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Suppression for returning visitors */
        html.intro-seen .portfolio-intro-overlay,
        html[data-intro-seen="true"] .portfolio-intro-overlay {
          display: none !important;
        }

        /* Accessible reduced-motion mode */
        @media (prefers-reduced-motion: reduce) {
          .portfolio-intro-overlay {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
