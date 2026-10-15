'use client'

import React, { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'

export type IntroPhase =
  | 'monogram'   // Stage 1: BK Monogram draws, nodes glow, shimmer
  | 'transform'  // Transition: BK implodes into center singularity
  | 'hold'       // Stage 2: BABUL KUMAR identity expands & holds
  | 'wake'       // Stage 3: Overlay dissolves, portfolio reveals
  | 'content'    // Stage 4: Homepage awake & interactive
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

    const navEntries = (window.performance && typeof window.performance.getEntriesByType === 'function')
      ? (window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[])
      : []
    const isReload =
      (navEntries.length > 0 && navEntries[0].type === 'reload') ||
      (window.performance && (window.performance as unknown as { navigation?: { type: number } }).navigation?.type === 1)

    if (isReload) {
      sessionStorage.removeItem('bk_intro_seen')
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

function getThemeSnapshot(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'dark'
}

function subscribeTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

export default function PortfolioIntro() {
  const sessionSeen = useSyncExternalStore(subscribeNoop, getSessionSnapshot, () => false)
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false)
  const debugPhase = useSyncExternalStore(subscribeNoop, getDebugPhaseSnapshot, () => null)
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark' as const)
  const isLight = theme === 'light'

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

  // Master Intro Timeline
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

    // Wake homepage elements smoothly at 3.2s as overlay dissolves
    const emergeTimer = setTimeout(() => {
      try {
        document.documentElement.classList.add('intro-emerging')
      } catch {}
    }, 3200)

    // Complete intro at 4.2s (clean, snappy, 0 overlap)
    const masterTimer = setTimeout(() => { completeIntro() }, 4200)
    const failsafeTimer = setTimeout(() => { completeIntro() }, 5500)
    timersRef.current = [emergeTimer, masterTimer, failsafeTimer]

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

  // Static overrides for manual visual inspection via ?intro_phase=
  const overlayDebug = isDebugging && debugPhase === 'content'
    ? { opacity: 0, pointerEvents: 'none' as const }
    : isDebugging && debugPhase === 'wake'
      ? { opacity: 0.2, pointerEvents: 'none' as const }
      : {}

  const bkDebug = isDebugging
    ? debugPhase === 'monogram'
      ? { opacity: 1, transform: 'scale(1)', visibility: 'visible' as const }
      : debugPhase === 'transform'
        ? { opacity: 0.5, transform: 'scale(0.3)', visibility: 'visible' as const }
        : { opacity: 0, visibility: 'hidden' as const }
    : {}

  const nameDebug = isDebugging
    ? (debugPhase === 'hold' || debugPhase === 'wake')
      ? { opacity: 1, transform: 'scale(1) translate3d(0, 0, 0)', visibility: 'visible' as const }
      : { opacity: 0, visibility: 'hidden' as const }
    : {}

  const taglineDebug = isDebugging && (debugPhase === 'hold' || debugPhase === 'wake')
    ? { opacity: 1, transform: 'translate3d(0, 0, 0)', visibility: 'visible' as const }
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
        backgroundColor: isLight ? '#FAF9F6' : '#060709',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        overflow: 'hidden',
        ...overlayDebug,
      }}
    >
      {/* Ambient radial halo — GPU composited */}
      <div
        className={`intro-radial-halo${!isDebugging ? ' intro-running' : ''}`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 'clamp(320px, 42vw, 560px)',
          height: 'clamp(320px, 42vw, 560px)',
          borderRadius: '50%',
          background: isLight
            ? 'radial-gradient(circle, rgba(212,72,28,0.16) 0%, rgba(13,122,112,0.08) 42%, transparent 72%)'
            : 'radial-gradient(circle, rgba(228,93,44,0.24) 0%, rgba(20,184,166,0.10) 42%, transparent 72%)',
          pointerEvents: 'none',
          transform: 'translate3d(-50%, -50%, 0)',
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
          height: '220px',
        }}
      >
        {/* ── STAGE 1: BK Monogram (0.0s – 1.65s) — completely disappears before Stage 2 ── */}
        <div
          className={`intro-bk-mark${!isDebugging ? ' intro-running' : ''}`}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            transformOrigin: 'center center',
            willChange: 'opacity, transform',
            ...bkDebug,
          }}
        >
          <svg
            viewBox="0 0 160 100"
            width="clamp(110px, 14vw, 160px)"
            height="100%"
            fill="none"
            aria-hidden="true"
            style={{ overflow: 'visible' }}
          >
            {/* Ambient shimmer wave */}
            <circle
              className={`bk-shimmer-ring${!isDebugging ? ' intro-running' : ''}`}
              cx="76"
              cy="50"
              r="10"
              stroke={isLight ? 'rgba(18,17,16,0.3)' : 'rgba(255,255,255,0.6)'}
              strokeWidth="1.8"
              fill="none"
            />

            {/* B — discrete strokes for flawless drawing animation */}
            <path
              className={`bk-b-spine${!isDebugging ? ' intro-running' : ''}`}
              d="M14,10 L14,90"
              stroke={isLight ? '#121110' : '#F5F6F8'}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              className={`bk-b-top${!isDebugging ? ' intro-running' : ''}`}
              d="M14,10 C50,10 50,50 14,50"
              stroke={isLight ? '#121110' : '#F5F6F8'}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              className={`bk-b-bot${!isDebugging ? ' intro-running' : ''}`}
              d="M14,50 C56,50 56,90 14,90"
              stroke={isLight ? '#121110' : '#F5F6F8'}
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* K — discrete strokes for flawless drawing animation */}
            <path
              className={`bk-k-spine${!isDebugging ? ' intro-running' : ''}`}
              d="M88,10 L88,90"
              stroke={isLight ? '#D4481C' : '#E45D2C'}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              className={`bk-k-top${!isDebugging ? ' intro-running' : ''}`}
              d="M88,50 L138,10"
              stroke={isLight ? '#D4481C' : '#E45D2C'}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              className={`bk-k-bot${!isDebugging ? ' intro-running' : ''}`}
              d="M88,50 L138,90"
              stroke={isLight ? '#D4481C' : '#E45D2C'}
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Accent slash */}
            <path
              className={`bk-slash${!isDebugging ? ' intro-running' : ''}`}
              d="M68,18 L76,82"
              stroke={isLight ? '#D4481C' : '#E45D2C'}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Luminous vertex nodes (ignite at stroke intersections) */}
            <circle className={`bk-node bk-node-1${!isDebugging ? ' intro-running' : ''}`} cx="14" cy="10" r="3.2" fill={isLight ? '#121110' : '#F5F6F8'} />
            <circle className={`bk-node bk-node-2${!isDebugging ? ' intro-running' : ''}`} cx="14" cy="90" r="3.2" fill={isLight ? '#121110' : '#F5F6F8'} />
            <circle className={`bk-node bk-node-3${!isDebugging ? ' intro-running' : ''}`} cx="14" cy="50" r="3.0" fill={isLight ? '#121110' : '#F5F6F8'} />
            <circle className={`bk-node bk-node-4${!isDebugging ? ' intro-running' : ''}`} cx="88" cy="10" r="3.2" fill={isLight ? '#D4481C' : '#E45D2C'} />
            <circle className={`bk-node bk-node-5${!isDebugging ? ' intro-running' : ''}`} cx="88" cy="90" r="3.2" fill={isLight ? '#D4481C' : '#E45D2C'} />
            <circle className={`bk-node bk-node-6${!isDebugging ? ' intro-running' : ''}`} cx="88" cy="50" r="3.2" fill={isLight ? '#D4481C' : '#E45D2C'} />
            <circle className={`bk-node bk-node-7${!isDebugging ? ' intro-running' : ''}`} cx="138" cy="10" r="3.2" fill={isLight ? '#EA580C' : '#FF8A3D'} />
            <circle className={`bk-node bk-node-8${!isDebugging ? ' intro-running' : ''}`} cx="138" cy="90" r="3.2" fill={isLight ? '#EA580C' : '#FF8A3D'} />
          </svg>
        </div>

        {/* ── STAGE 2: BABUL KUMAR (1.75s – 3.2s) — strictly emerges AFTER BK has vanished ── */}
        <div
          className={`intro-identity-wrapper${!isDebugging ? ' intro-running' : ''}`}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            transformOrigin: 'center center',
            willChange: 'opacity, transform',
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
                  textShadow: isLight ? '0 2px 20px rgba(18,17,16,0.08)' : '0 2px 24px rgba(0,0,0,0.7)',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ color: isLight ? '#121110' : '#F5F6F8', display: 'inline-flex' }} aria-hidden="true">
                  {FIRST_NAME.map((char, index) => (
                    <span key={index} style={{ display: 'inline-block' }}>
                      {char}
                    </span>
                  ))}
                </span>
                <span style={{ color: isLight ? '#D4481C' : '#E45D2C', display: 'inline-flex' }} aria-hidden="true">
                  {LAST_NAME.map((char, index) => (
                    <span key={index} style={{ display: 'inline-block' }}>
                      {char}
                    </span>
                  ))}
                </span>
              </h1>

              {/* Luminous light sheen sweep */}
              <div
                className={`android-sheen-beam${!isDebugging ? ' intro-running' : ''}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '45%',
                  height: '100%',
                  background:
                    'linear-gradient(105deg, transparent 15%, rgba(255,255,255,0.35) 50%, transparent 85%)',
                  pointerEvents: 'none',
                  transform: 'translate3d(-150%, 0, 0)',
                }}
              />
            </div>

            {/* AI · ML · FULL-STACK tagline */}
            <div
              className={`intro-subtitle${!isDebugging ? ' intro-running' : ''}`}
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
                color: isLight ? '#4B5563' : '#9499A6',
                whiteSpace: 'nowrap',
                willChange: 'opacity, transform',
                ...taglineDebug,
              }}
            >
              {(['AI', '•', 'ML', '•', 'FULL-STACK'] as const).map((label, i) => {
                const isDot = label === '•'
                return (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      ...(isDot ? { color: isLight ? '#0D7A70' : '#14B8A6', fontSize: '9px', textShadow: isLight ? 'none' : '0 0 6px rgba(20,184,166,0.6)' } : {}),
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
         * PORTFOLIO INTRO — STRICT NON-OVERLAPPING MASTER TIMELINE (4.2s)
         *
         * [STAGE 1]  0.00s – 1.35s: BK Monogram draws in, luminous nodes ignite, shimmer wave
         * [COLLAPSE] 1.35s – 1.65s: BK collapses into central singularity (scale 1 -> 0, opacity 0)
         * [BARRIER]  1.65s – 1.75s: BK is COMPLETELY HIDDEN (visibility: hidden). Zero overlap possible.
         * [STAGE 2]  1.75s – 3.20s: BABUL KUMAR expands forward from singularity, holds, sheen sweeps
         * [STAGE 3]  3.20s – 4.20s: Overlay dissolves smoothly into the fully awake portfolio
         */

        /* Overlay Dissolve */
        @keyframes introOverlayDissolve {
          0%, 75%   { opacity: 1; pointer-events: auto; }
          95%, 100% { opacity: 0; pointer-events: none; }
        }

        /* Ambient Halo */
        @keyframes introHaloFlow {
          0%   { transform: translate3d(-50%, -50%, 0) scale(0.85); opacity: 0; }
          12%  { transform: translate3d(-50%, -50%, 0) scale(1.0);  opacity: 0.45; }
          36%  { transform: translate3d(-50%, -50%, 0) scale(1.08); opacity: 0.65; }
          75%  { transform: translate3d(-50%, -50%, 0) scale(1.18); opacity: 0.70; }
          92%  { transform: translate3d(-50%, -50%, 0) scale(1.24); opacity: 0.15; }
          100% { transform: translate3d(-50%, -50%, 0) scale(1.28); opacity: 0; }
        }

        /* ── STAGE 1: BK Monogram Sequence (Strictly finishes at 38% = 1.60s) ── */
        @keyframes bkMonogramSequence {
          0% {
            opacity: 0;
            transform: scale(0.88) translate3d(0, 0, 0);
            visibility: visible;
          }
          6% {
            opacity: 1;
            transform: scale(1.0) translate3d(0, 0, 0);
            visibility: visible;
          }
          30% {
            opacity: 1;
            transform: scale(1.0) translate3d(0, 0, 0);
            visibility: visible;
          }
          37% {
            opacity: 0;
            transform: scale(0) translate3d(0, 0, 0);
            visibility: hidden;
          }
          100% {
            opacity: 0;
            transform: scale(0) translate3d(0, 0, 0);
            visibility: hidden;
          }
        }

        /* Explicit pixel stroke drawing animations */
        @keyframes drawBSpine {
          0%   { stroke-dashoffset: 84; opacity: 0; }
          2%   { opacity: 1; }
          100% { stroke-dashoffset: 0;  opacity: 1; }
        }
        @keyframes drawBTop {
          0%   { stroke-dashoffset: 80; opacity: 0; }
          2%   { opacity: 1; }
          100% { stroke-dashoffset: 0;  opacity: 1; }
        }
        @keyframes drawBBot {
          0%   { stroke-dashoffset: 88; opacity: 0; }
          2%   { opacity: 1; }
          100% { stroke-dashoffset: 0;  opacity: 1; }
        }
        @keyframes drawKSpine {
          0%   { stroke-dashoffset: 84; opacity: 0; }
          2%   { opacity: 1; }
          100% { stroke-dashoffset: 0;  opacity: 1; }
        }
        @keyframes drawKTop {
          0%   { stroke-dashoffset: 68; opacity: 0; }
          2%   { opacity: 1; }
          100% { stroke-dashoffset: 0;  opacity: 1; }
        }
        @keyframes drawKBot {
          0%   { stroke-dashoffset: 68; opacity: 0; }
          2%   { opacity: 1; }
          100% { stroke-dashoffset: 0;  opacity: 1; }
        }
        @keyframes drawSlash {
          0%   { stroke-dashoffset: 68; opacity: 0; }
          2%   { opacity: 1; }
          100% { stroke-dashoffset: 0;  opacity: 1; }
        }

        /* Shimmer ring pulse */
        @keyframes bkShimmerRing {
          0%, 20%  { r: 8; opacity: 0; }
          22%      { r: 12; opacity: 0.85; }
          29%      { r: 90; opacity: 0; }
          100%     { r: 90; opacity: 0; }
        }

        /* Nodes ignite cleanly without origin distortion */
        @keyframes nodeIgnite {
          0%, 10%  { opacity: 0; }
          20%      { opacity: 1; }
          30%      { opacity: 1; }
          36%, 100%{ opacity: 0; }
        }

        /* ── STAGE 2: BABUL KUMAR Sequence (Strictly starts AFTER 39% = 1.64s) ── */
        @keyframes introIdentityReveal {
          0%, 39% {
            opacity: 0;
            transform: translate3d(0, 8px, 0) scale(0.86);
            visibility: hidden;
          }
          41% {
            visibility: visible;
            opacity: 0;
            transform: translate3d(0, 8px, 0) scale(0.88);
          }
          48% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1.0);
            visibility: visible;
          }
          75% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1.0);
            visibility: visible;
          }
          90% {
            opacity: 0.2;
            transform: translate3d(0, -6px, 0) scale(1.02);
            visibility: visible;
          }
          96%, 100% {
            opacity: 0;
            transform: translate3d(0, -10px, 0) scale(1.04);
            visibility: hidden;
          }
        }

        /* Subtitle */
        @keyframes introSubtitleReveal {
          0%, 48% {
            opacity: 0;
            transform: translate3d(0, 8px, 0);
            visibility: hidden;
          }
          50% {
            visibility: visible;
            opacity: 0;
            transform: translate3d(0, 8px, 0);
          }
          57%, 75% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
            visibility: visible;
          }
          90%, 100% {
            opacity: 0;
            transform: translate3d(0, -4px, 0);
            visibility: hidden;
          }
        }

        /* Light sheen sweep across typography */
        @keyframes introSheenSweep {
          0%, 54% {
            transform: translate3d(-150%, 0, 0);
            opacity: 0;
          }
          56% {
            opacity: 0.75;
          }
          69% {
            transform: translate3d(260%, 0, 0);
            opacity: 0.65;
          }
          71%, 100% {
            transform: translate3d(260%, 0, 0);
            opacity: 0;
          }
        }

        /* Master Bindings */
        .portfolio-intro-overlay.intro-running {
          animation: introOverlayDissolve 4.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .intro-radial-halo.intro-running {
          animation: introHaloFlow 4.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .intro-bk-mark.intro-running {
          animation: bkMonogramSequence 4.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* B Strokes */
        .bk-b-spine.intro-running {
          stroke-dasharray: 84;
          stroke-dashoffset: 84;
          opacity: 0;
          animation: drawBSpine 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.08s forwards;
        }
        .bk-b-top.intro-running {
          stroke-dasharray: 80;
          stroke-dashoffset: 80;
          opacity: 0;
          animation: drawBTop 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.22s forwards;
        }
        .bk-b-bot.intro-running {
          stroke-dasharray: 88;
          stroke-dashoffset: 88;
          opacity: 0;
          animation: drawBBot 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.36s forwards;
        }

        /* K Strokes */
        .bk-k-spine.intro-running {
          stroke-dasharray: 84;
          stroke-dashoffset: 84;
          opacity: 0;
          animation: drawKSpine 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.16s forwards;
        }
        .bk-k-top.intro-running {
          stroke-dasharray: 68;
          stroke-dashoffset: 68;
          opacity: 0;
          animation: drawKTop 0.50s cubic-bezier(0.16, 1, 0.3, 1) 0.34s forwards;
        }
        .bk-k-bot.intro-running {
          stroke-dasharray: 68;
          stroke-dashoffset: 68;
          opacity: 0;
          animation: drawKBot 0.50s cubic-bezier(0.16, 1, 0.3, 1) 0.46s forwards;
        }

        /* Accent Slash */
        .bk-slash.intro-running {
          stroke-dasharray: 68;
          stroke-dashoffset: 68;
          opacity: 0;
          animation: drawSlash 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.28s forwards;
        }

        /* Static / Debug Fallback when not running */
        .intro-bk-mark:not(.intro-running) path {
          stroke-dashoffset: 0 !important;
          opacity: 1 !important;
        }
        .intro-bk-mark:not(.intro-running) .bk-node {
          opacity: 1 !important;
        }

        .bk-shimmer-ring.intro-running {
          animation: bkShimmerRing 4.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .bk-node.intro-running {
          opacity: 0;
          animation: nodeIgnite 4.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .intro-identity-wrapper.intro-running {
          animation: introIdentityReveal 4.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .intro-subtitle.intro-running {
          animation: introSubtitleReveal 4.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .android-sheen-beam.intro-running {
          animation: introSheenSweep 4.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
