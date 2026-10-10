'use client'

import React, { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

export type IntroPhase = 'black' | 'bk' | 'identity' | 'reveal' | 'complete'

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
    if (debug && ['black', 'bk', 'identity', 'reveal'].includes(debug)) {
      return debug
    }
  } catch {
    return null
  }
  return null
}

export default function PortfolioIntro() {
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false)
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
      document.documentElement.setAttribute('data-intro-seen', 'true')
    } catch {
      // Ignore private browsing storage restrictions
    }
    setPhase('complete')
  }, [clearAllTimers])

  useEffect(() => {
    // If debug phase is active, already seen in session, or user prefers reduced motion:
    if (debugPhase || sessionSeen || reducedMotion) {
      return
    }

    // Timeline:
    // 0.00s: near-black screen (phase: 'black')
    // 0.12s: BK mark appears softly (phase: 'bk')
    // 0.42s: BABUL KUMAR & AI · ML · FULL-STACK identity expands (phase: 'identity')
    // 0.82s: environment & avatar reveal starts, overlay dissolves (phase: 'reveal')
    // 1.38s: animation fully completed, unmount overlay (phase: 'complete')
    const t1 = setTimeout(() => setPhase('bk'), 120)
    const t2 = setTimeout(() => setPhase('identity'), 420)
    const t3 = setTimeout(() => setPhase('reveal'), 820)
    const t4 = setTimeout(() => completeIntro(), 1380)

    // Safety failsafe: hard maximum 1.6s guarantee so user is never trapped
    const tFailsafe = setTimeout(() => completeIntro(), 1600)

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
  const isRevealing = currentPhase === 'reveal'
  const showBK = currentPhase === 'bk'
  const showIdentity = currentPhase === 'identity' || currentPhase === 'reveal'

  const overlayContent = (
    <div
      className={`portfolio-intro-overlay ${isRevealing ? 'intro-revealing' : ''}`}
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
        pointerEvents: isRevealing ? 'none' : 'auto',
        userSelect: 'none',
        transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isRevealing ? 0 : 1,
        backdropFilter: isRevealing ? 'blur(0px)' : 'blur(20px)',
        WebkitBackdropFilter: isRevealing ? 'blur(0px)' : 'blur(20px)',
      }}
    >
      {/* Ambient Subtle Radial Aura behind identity */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(280px, 45vw, 560px)',
          height: 'clamp(280px, 45vw, 560px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(228, 93, 44, 0.14) 0%, rgba(20, 184, 166, 0.05) 45%, transparent 72%)',
          filter: 'blur(36px)',
          pointerEvents: 'none',
          opacity: isRevealing ? 0 : 1,
          transition: 'opacity 0.4s ease-out',
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
          padding: '20px',
          transform: isRevealing ? 'translateY(-12px)' : 'translateY(0)',
          opacity: isRevealing ? 0 : 1,
          transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease-out',
        }}
      >
        {/* Stage 1: BK Monogram Mark */}
        <div
          className="intro-bk-mark"
          style={{
            position: showIdentity ? 'absolute' : 'relative',
            opacity: showBK && !showIdentity ? 1 : 0,
            transform: showBK && !showIdentity ? 'scale(1)' : showIdentity ? 'scale(0.95)' : 'scale(0.92)',
            transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(44px, 5.5vw, 68px)',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: 'var(--color-text, #F5F6F8)',
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
              opacity: 0.85,
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
            opacity: showIdentity ? 1 : 0,
            transform: showIdentity ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.96)',
            transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Signature Name: BABUL KUMAR */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '10px',
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(28px, 4.2vw, 50px)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
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
              fontSize: 'clamp(11px, 1.15vw, 13px)',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary, #9499A6)',
            }}
          >
            <span>AI</span>
            <span style={{ color: 'var(--color-accent-teal, #14B8A6)', opacity: 0.85, fontSize: '10px' }}>
              •
            </span>
            <span>ML</span>
            <span style={{ color: 'var(--color-accent-teal, #14B8A6)', opacity: 0.85, fontSize: '10px' }}>
              •
            </span>
            <span>FULL-STACK</span>
          </div>
        </div>
      </div>

      <style>{`
        /* Hide overlay immediately for returning visitors across SSR/SSG */
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

  return (
    <>
      {/* Inline early-execution script to prevent returning-visitor dark flash */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem('bk_intro_seen')==='true'){document.documentElement.setAttribute('data-intro-seen','true')}}catch(e){}`,
        }}
      />
      {isClient && typeof document !== 'undefined' ? createPortal(overlayContent, document.body) : null}
    </>
  )
}
