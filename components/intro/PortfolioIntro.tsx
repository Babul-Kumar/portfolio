'use client'

import React, { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'

export type IntroPhase =
  | 'monogram'   // BK SVG draws itself
  | 'transform'  // BK collapses to a point
  | 'hold'       // BABUL KUMAR rotates out, holds
  | 'wake'       // Overlay dissolves, portfolio revealed
  | 'content'    // Homepage visible
  | 'complete'   // Unmounted

const FIRST_NAME = ['B', 'A', 'B', 'U', 'L']
const LAST_NAME = ['K', 'U', 'M', 'A', 'R']

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
      if (['transform', 'collapse'].includes(debug)) return 'transform'
      if (['hold', 'name'].includes(debug)) return 'hold'
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
    if (sessionSeen || reducedMotion) {
      try {
        document.documentElement.classList.add('intro-seen')
        document.documentElement.classList.remove('intro-active')
      } catch {}
      return
    }

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

    // Total animation: 5.2s + 200ms buffer
    const masterTimer = setTimeout(() => { completeIntro() }, 5400)
    const failsafeTimer = setTimeout(() => { completeIntro() }, 7000)
    timersRef.current = [masterTimer, failsafeTimer]

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'R' || e.key === 'r' || e.key === 'I' || e.key === 'i') && e.shiftKey) {
        try {
          sessionStorage.removeItem('bk_intro_seen')
          window.location.search = '?replay=true'
        } catch {}
        return
      }
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

  if (!debugPhase && (sessionSeen || reducedMotion || !isMounted)) {
    return null
  }

  const isDebugging = debugPhase !== null

  // Static states for visual QA via ?intro_phase=
  const overlayDebug = isDebugging && debugPhase === 'content'
    ? { opacity: 0, pointerEvents: 'none' as const }
    : isDebugging && debugPhase === 'wake'
      ? { opacity: 0.2, pointerEvents: 'none' as const }
      : {}

  const bkDebug = isDebugging
    ? debugPhase === 'monogram'
      ? { opacity: 1, transform: 'scale(1)' }
      : { opacity: 0, transform: 'scale(0)' }
    : {}

  const nameDebug = isDebugging
    ? (debugPhase === 'hold' || debugPhase === 'wake')
      ? { opacity: 1, transform: 'rotateX(0deg) scale(1) translateY(0)' }
      : { opacity: 0, transform: 'rotateX(24deg) scale(0.72) translateY(16px)' }
    : {}

  const letterDebug = isDebugging && (debugPhase === 'hold' || debugPhase === 'wake')
    ? { opacity: 1, transform: 'translateY(0) scale(1)' }
    : {}

  const taglineDebug = isDebugging && (debugPhase === 'hold' || debugPhase === 'wake')
    ? { opacity: 1, transform: 'translateY(0)' }
    : {}

  return (
    <div
      className={`portfolio-intro-overlay${!isDebugging ? ' intro-running' : ''}`}
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
        perspective: '800px',
        ...overlayDebug,
      }}
    >
      {/* Ambient radial halo */}
      <div
        className={`intro-radial-halo${!isDebugging ? ' intro-running' : ''}`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 'clamp(320px, 42vw, 580px)',
          height: 'clamp(320px, 42vw, 580px)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(228,93,44,0.28) 0%, rgba(20,184,166,0.12) 40%, rgba(228,93,44,0.04) 68%, transparent 78%)',
          pointerEvents: 'none',
          willChange: 'transform, opacity',
        }}
      />

      {/* Shared optical center stage */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '800px',
          height: '200px',
        }}
      >
        {/* ── Layer 1: BK SVG Monogram ── */}
        <div
          className={`intro-bk-mark${!isDebugging ? ' intro-running' : ''}`}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            willChange: 'opacity, transform',
            transformOrigin: 'center center',
            ...bkDebug,
          }}
        >
          <svg
            viewBox="0 0 160 100"
            width="clamp(96px, 12vw, 152px)"
            height="auto"
            fill="none"
            aria-hidden="true"
            style={{ overflow: 'visible' }}
          >
            {/* B — vertical spine + two bumps */}
            <path
              className={`bk-stroke-b${!isDebugging ? ' intro-running' : ''}`}
              d="M14,10 L14,90 M14,10 Q52,10 52,32 Q52,50 14,50 M14,50 Q58,50 58,70 Q58,90 14,90"
              stroke="#F5F6F8"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* K — vertical spine + diagonal arms */}
            <path
              className={`bk-stroke-k${!isDebugging ? ' intro-running' : ''}`}
              d="M88,10 L88,90 M88,50 L138,10 M88,50 L138,90"
              stroke="#E45D2C"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Accent slash */}
            <line
              className={`bk-stroke-slash${!isDebugging ? ' intro-running' : ''}`}
              x1="68" y1="18" x2="76" y2="82"
              stroke="#E45D2C"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
        </div>

        {/* ── Layer 2: BABUL KUMAR — rotates out from center ── */}
        <div
          className={`intro-identity-wrapper${!isDebugging ? ' intro-running' : ''}`}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            willChange: 'opacity, transform',
            transformOrigin: 'center center',
            transformStyle: 'preserve-3d',
            ...nameDebug,
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ position: 'relative', display: 'inline-block', overflow: 'hidden' }}>
              <h1
                aria-label="BABUL KUMAR"
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
                  textShadow: '0 2px 24px rgba(0,0,0,0.7)',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ color: '#F5F6F8', display: 'inline-flex' }} aria-hidden="true">
                  {FIRST_NAME.map((char, index) => (
                    <span
                      key={index}
                      className={`intro-letter${!isDebugging ? ' intro-running' : ''}`}
                      style={{
                        display: 'inline-block',
                        animationDelay: `${2000 + index * 40}ms`,
                        ...letterDebug,
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span style={{ color: '#E45D2C', display: 'inline-flex' }} aria-hidden="true">
                  {LAST_NAME.map((char, index) => (
                    <span
                      key={index}
                      className={`intro-letter${!isDebugging ? ' intro-running' : ''}`}
                      style={{
                        display: 'inline-block',
                        animationDelay: `${2000 + (index + 5) * 40}ms`,
                        ...letterDebug,
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </h1>

              {/* Light sheen sweep */}
              <div
                className={`android-sheen-beam${!isDebugging ? ' intro-running' : ''}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '50%',
                  height: '100%',
                  background:
                    'linear-gradient(105deg, transparent 10%, rgba(255,255,255,0.30) 50%, transparent 90%)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* AI · ML · FULL-STACK tagline */}
            <div
              className="intro-subtitle"
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
                fontSize: 'clamp(11px, 1.1vw, 13px)',
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#9499A6',
                whiteSpace: 'nowrap',
                willChange: 'opacity, transform',
              }}
            >
              {(['AI', '•', 'ML', '•', 'FULL-STACK'] as const).map((label, i) => {
                const isDot = label === '•'
                const delays = [2560, 2640, 2700, 2780, 2840]
                return (
                  <span
                    key={i}
                    className={`${isDot ? 'intro-dot' : 'intro-pillar'}${!isDebugging ? ' intro-running' : ''}`}
                    style={{
                      display: 'inline-block',
                      animationDelay: `${delays[i]}ms`,
                      ...(isDot ? { color: '#14B8A6', fontSize: '9px', textShadow: '0 0 6px rgba(20,184,166,0.6)' } : {}),
                      ...taglineDebug,
                    }}
                  >
                    {label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /*
         * ─────────────────────────────────────────────────────────────
         * PORTFOLIO INTRO — 5.2s CONTINUOUS ANIMATION
         *
         * Timeline:
         *   0.0s  Start; dark canvas
         *   0.2s  B begins drawing
         *   0.38s K begins drawing
         *   0.55s Slash draws
         *   1.35s BK fully drawn, halo settled
         *   1.4s  BK starts collapsing (scale 1→0)
         *   1.9s  BK at scale(0) — collapsed to a point
         *   2.0s  BABUL KUMAR rotates out (rotateX 24°→0°)
         *   2.2s  Letters resolve staggered
         *   3.0s  Name fully settled, reading hold begins
         *   4.05s Light sheen fires
         *   4.4s  Overlay begins dissolving
         *   5.2s  Fully transparent → unmount
         * ─────────────────────────────────────────────────────────────
         */

        @keyframes introOverlayDissolve {
          0%, 84% { opacity: 1; pointer-events: auto; }
          98%     { opacity: 0; pointer-events: none; }
          100%    { opacity: 0; pointer-events: none; }
        }

        @keyframes introHaloFlow {
          0%   { transform: translate(-50%,-50%) scale(0.7);  opacity: 0; }
          8%   { transform: translate(-50%,-50%) scale(0.92); opacity: 0.38; }
          36%  { transform: translate(-50%,-50%) scale(1.0);  opacity: 0.62; }
          58%  { transform: translate(-50%,-50%) scale(1.14); opacity: 0.86; }
          82%  { transform: translate(-50%,-50%) scale(1.20); opacity: 0.90; }
          92%  { transform: translate(-50%,-50%) scale(4.0);  opacity: 0.28; }
          100% { transform: translate(-50%,-50%) scale(4.6);  opacity: 0; }
        }

        /* BK container: appear → hold → collapse to center */
        @keyframes introBkMorph {
          0%    { opacity: 0;   transform: scale(0.78); }
          5%    { opacity: 0;   transform: scale(0.78); }
          22%   { opacity: 1;   transform: scale(1.0);  }
          27%   { opacity: 1;   transform: scale(1.0);  }
          36%   { opacity: 0.9; transform: scale(0.22); }
          38.5% { opacity: 0;   transform: scale(0);    }
          100%  { opacity: 0;   transform: scale(0);    }
        }

        /* SVG stroke draws */
        @keyframes strokeDrawB {
          from { stroke-dashoffset: 320; opacity: 0.05; }
          6%   { opacity: 1; }
          to   { stroke-dashoffset: 0; }
        }

        @keyframes strokeDrawK {
          from { stroke-dashoffset: 280; opacity: 0.05; }
          6%   { opacity: 1; }
          to   { stroke-dashoffset: 0; }
        }

        @keyframes strokeDrawSlash {
          from { stroke-dashoffset: 70; opacity: 0; }
          to   { stroke-dashoffset: 0; opacity: 0.7; }
        }

        /* BABUL KUMAR rotates out from the collapsed point */
        @keyframes introIdentityCrystallize {
          0%, 36%  { opacity: 0;    transform: rotateX(24deg)  scale(0.72) translateY(16px); }
          38%      { opacity: 0;    transform: rotateX(24deg)  scale(0.72) translateY(16px); }
          52%      { opacity: 1;    transform: rotateX(0deg)   scale(1.0)  translateY(0);    }
          80%      { opacity: 1;    transform: rotateX(0deg)   scale(1.0)  translateY(0);    }
          90%      { opacity: 0.22; transform: rotateX(-8deg)  scale(1.02) translateY(-6px); }
          96%      { opacity: 0;    transform: rotateX(-12deg) scale(1.04) translateY(-10px);}
          100%     { opacity: 0;    transform: rotateX(-12deg) scale(1.04) translateY(-10px);}
        }

        @keyframes letterRiseReveal {
          from { opacity: 0; transform: translateY(12px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0)    scale(1.0); }
        }

        @keyframes pillarRiseReveal {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }

        @keyframes introSheenSweep {
          0%, 77% { transform: translateX(-150%); opacity: 0;    }
          78%     { opacity: 0.65; }
          87%     { transform: translateX(260%);  opacity: 0.55; }
          88%     { opacity: 0; }
          100%    { transform: translateX(260%);  opacity: 0; }
        }

        /* ── Master bindings ── */

        .portfolio-intro-overlay.intro-running {
          animation: introOverlayDissolve 5.2s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        .intro-radial-halo.intro-running {
          animation: introHaloFlow 5.2s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        .intro-bk-mark.intro-running {
          animation: introBkMorph 5.2s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        .bk-stroke-b.intro-running {
          stroke-dasharray: 320;
          stroke-dashoffset: 320;
          animation: strokeDrawB 1.1s cubic-bezier(0.4,0,0.2,1) 0.2s forwards;
        }

        .bk-stroke-k.intro-running {
          stroke-dasharray: 280;
          stroke-dashoffset: 280;
          animation: strokeDrawK 1.0s cubic-bezier(0.4,0,0.2,1) 0.38s forwards;
        }

        .bk-stroke-slash.intro-running {
          stroke-dasharray: 70;
          stroke-dashoffset: 70;
          animation: strokeDrawSlash 0.7s cubic-bezier(0.4,0,0.2,1) 0.55s forwards;
        }

        .intro-identity-wrapper.intro-running {
          animation: introIdentityCrystallize 5.2s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        .intro-letter.intro-running {
          opacity: 0;
          animation: letterRiseReveal 0.44s cubic-bezier(0.16,1,0.3,1) both;
        }

        .intro-pillar.intro-running {
          opacity: 0;
          animation: pillarRiseReveal 0.38s cubic-bezier(0.16,1,0.3,1) both;
        }

        .intro-dot.intro-running {
          opacity: 0;
          animation: pillarRiseReveal 0.34s cubic-bezier(0.16,1,0.3,1) both;
        }

        .android-sheen-beam.intro-running {
          animation: introSheenSweep 5.2s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        /* Suppression */
        html.intro-seen .portfolio-intro-overlay,
        html[data-intro-seen="true"] .portfolio-intro-overlay {
          display: none !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .portfolio-intro-overlay { display: none !important; }
        }
      `}</style>
    </div>
  )
}
