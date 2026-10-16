'use client'

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { CheckCircle2, RotateCcw, Send, Compass } from 'lucide-react'

export interface ContactMessageData {
  name: string
  email: string
  message: string
}

interface PigeonDeliveryAnimationProps {
  data: ContactMessageData
  onReset: () => void
}

type AnimationPhase =
  | 'letter_reading' // Phase 1: User reads their submitted letter on desk (1.2s)
  | 'letter_folding' // Phase 2: Letter physically folds in 3D into compact scroll (1.6s)
  | 'pigeon_arrival' // Phase 3: Rock dove swoops in, grabs scroll with claws, bobs head, liftoff (2.0s)
  | 'pigeon_flight'  // Phase 4: Pigeon soars across sky along animated flight route (2.4s)
  | 'confirmation'   // Phase 5: Pigeon exits 100% off-screen; pristine confirmation card appears

const subscribe = () => () => {}

export default function PigeonDeliveryAnimation({ data, onReset }: PigeonDeliveryAnimationProps) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )

  // Respect user preference for reduced motion
  const [phase, setPhase] = useState<AnimationPhase>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'confirmation'
    }
    return 'letter_reading'
  })

  // Physical anchor coordinates where the desk scroll and pigeon land
  const deskAnchorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Trajectory flight coordinates for the soaring pigeon in sky portal
  const [flightPos, setFlightPos] = useState<{ x: number; y: number; scale: number; rotation: number }>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 4,
  })

  // Trajectory launch & target coordinates for SVG flight route line
  const [routeCoords, setRouteCoords] = useState<{
    startX: number
    startY: number
    ctrlX: number
    ctrlY: number
    targetX: number
    targetY: number
  }>({
    startX: 0,
    startY: 0,
    ctrlX: 0,
    ctrlY: 0,
    targetX: 0,
    targetY: 0,
  })

  // Live flight progress percentage (0 - 100) for desk flight radar
  const [flightProgressPct, setFlightProgressPct] = useState(0)

  // Whether the scroll has been secured in the bird's talons
  const [hasScrollOnBird, setHasScrollOnBird] = useState(false)

  const deskRef = useRef<HTMLDivElement>(null)
  const birdPortalRef = useRef<HTMLDivElement>(null)
  const routePathRef = useRef<SVGPathElement>(null)
  const animFrameRef = useRef<number | null>(null)
  const flightPosRef = useRef({ x: 0, y: 0, scale: 1, rotation: 4 })

  // Measure desk anchor position on mount and whenever window resizes / scrolls
  useEffect(() => {
    const measureAnchor = () => {
      if (deskRef.current) {
        const rect = deskRef.current.getBoundingClientRect()
        // Anchor is centered horizontally, and aligned with resting scroll vertically (+61px from center)
        deskAnchorRef.current = {
          x: rect.left + rect.width * 0.5,
          y: rect.top + rect.height * 0.5,
        }
      }
    }

    measureAnchor()
    window.addEventListener('resize', measureAnchor)
    window.addEventListener('scroll', measureAnchor, { passive: true })

    // Automatically smooth-scroll container into comfortable view on mobile screens
    if (deskRef.current && window.innerWidth < 860) {
      const rect = deskRef.current.getBoundingClientRect()
      // Only scroll if card is not already comfortably visible
      if (rect.top < 60 || rect.bottom > window.innerHeight) {
        deskRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    return () => {
      window.removeEventListener('resize', measureAnchor)
      window.removeEventListener('scroll', measureAnchor)
    }
  }, [])

  // Sequential Phase Progression: One coherent, uninterrupted story
  useEffect(() => {
    let timer: NodeJS.Timeout
    let grabTimer: NodeJS.Timeout

    if (phase === 'letter_reading') {
      setHasScrollOnBird(false)
      // 1. User reviews their submitted letter on desk (1.2s)
      timer = setTimeout(() => {
        setPhase('letter_folding')
      }, 1200)
    } else if (phase === 'letter_folding') {
      setHasScrollOnBird(false)
      // 2. 3D origami folding: top flap down, bottom flap up, wax seal stamp, rolls into scroll (1.6s)
      timer = setTimeout(() => {
        setPhase('pigeon_arrival')
      }, 1600)
    } else if (phase === 'pigeon_arrival') {
      setHasScrollOnBird(false)
      // 3. Pigeon swoops in; exact talon contact made at 850ms
      grabTimer = setTimeout(() => {
        setHasScrollOnBird(true)
      }, 850)

      // Liftoff spring at 2000ms -> seamlessly transitions into sky portal flight
      timer = setTimeout(() => {
        let launchX = deskAnchorRef.current.x
        let launchY = deskAnchorRef.current.y
        if (deskRef.current) {
          const rect = deskRef.current.getBoundingClientRect()
          launchX = rect.left + rect.width * 0.5
          // Matches the perched pigeon's upward spring leap (-28px) at end of swoop
          launchY = rect.top + rect.height * 0.5 - 28
        }

        const vpW = typeof window !== 'undefined' ? window.innerWidth : 1200
        const vpH = typeof window !== 'undefined' ? window.innerHeight : 800

        const finalTargetX = vpW + 280
        const finalTargetY = -220
        const cX = (launchX + finalTargetX) * 0.45
        const cY = Math.min(launchY - 140, vpH * 0.2)

        setRouteCoords({
          startX: launchX,
          startY: launchY,
          ctrlX: cX,
          ctrlY: cY,
          targetX: finalTargetX,
          targetY: finalTargetY,
        })

        flightPosRef.current = {
          x: launchX || vpW / 2,
          y: launchY || vpH / 2,
          scale: 1.05,
          rotation: 4,
        }
        setFlightPos(flightPosRef.current)
        setPhase('pigeon_flight')
      }, 2000)
    }

    return () => {
      clearTimeout(timer)
      clearTimeout(grabTimer)
    }
  }, [phase])

  // Continuous Flight Kinematics, Live Trajectory Route, and Guaranteed Off-Screen Departure
  useEffect(() => {
    if (phase !== 'pigeon_flight') return

    const vpWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
    const vpHeight = typeof window !== 'undefined' ? window.innerHeight : 800

    const startX = flightPosRef.current.x || vpWidth * 0.5
    const startY = flightPosRef.current.y || vpHeight * 0.55

    // Target is safely outside the visible viewport boundary (full wingspan clearance)
    const targetX = vpWidth + 280
    const targetY = -220

    const flightDuration = 2400 // 2.4s of soaring sky flight
    const startTime = performance.now()

    // Safety fallback timer protects against background tab suspension
    const safetyTimeout = setTimeout(() => {
      setPhase('confirmation')
    }, flightDuration + 800)

    const stepFlight = (now: number) => {
      const elapsed = now - startTime
      const rawProgress = Math.min(elapsed / flightDuration, 1.0)

      // Smooth acceleration curve into distance
      const progress = Math.pow(rawProgress, 1.15)

      // Aerodynamic lift undulation (gentle heave on each wingstroke)
      const liftUndulation = Math.sin((elapsed / 260) * Math.PI * 2) * -6
      const ascendingArc = Math.sin(rawProgress * Math.PI * 0.9) * -60

      const currentX = startX + (targetX - startX) * progress
      const currentY = startY + (targetY - startY) * progress + ascendingArc + liftUndulation

      // Perspective distance scaling: scales smoothly from 1.05 down to 0.45
      const currentScale = Math.max(1.05 - rawProgress * 0.6, 0.45)

      // Aerodynamic banking angle along flight trajectory (starts at +4deg, banks into turn)
      const currentRotation = 4 - rawProgress * 14 + Math.sin(rawProgress * Math.PI) * -6

      // Update radar progress percent
      setFlightProgressPct(Math.round(rawProgress * 100))

      // Direct DOM update for 60fps performance without React state thrashing
      if (birdPortalRef.current) {
        birdPortalRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${currentScale}) rotate(${currentRotation}deg)`
      }



      flightPosRef.current = {
        x: currentX,
        y: currentY,
        scale: currentScale,
        rotation: currentRotation,
      }

      // STRICT OFF-SCREEN CHECK:
      // Bird size is 180px * currentScale. Radius is ~100 * currentScale.
      // Must be completely past right viewport edge OR completely above top edge
      const birdRadius = 100 * currentScale
      const isPastRight = currentX - birdRadius >= vpWidth
      const isAboveTop = currentY + birdRadius <= 0

      if (rawProgress >= 1.0 && (isPastRight || isAboveTop)) {
        clearTimeout(safetyTimeout)
        setPhase('confirmation')
      } else {
        animFrameRef.current = requestAnimationFrame(stepFlight)
      }
    }

    animFrameRef.current = requestAnimationFrame(stepFlight)

    return () => {
      clearTimeout(safetyTimeout)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [phase])

  // Truncate long preview message gracefully for the letter card
  const previewMessage = data.message.length > 160 ? data.message.slice(0, 157) + '...' : data.message

  return (
    <div
      ref={deskRef}
      className="pigeon-animation-container"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '440px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
      }}
      aria-live="polite"
    >
      {/* =========================================================================
          DESK SCENE: 3D LETTER FOLDING -> SCROLL -> PIGEON ARRIVAL & PICKUP
          ========================================================================= */}
      {(phase === 'letter_reading' || phase === 'letter_folding' || phase === 'pigeon_arrival') && (
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            position: 'relative',
            perspective: '1400px',
            transformStyle: 'preserve-3d',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '340px',
          }}
        >
          {/* Desk surface horizon and grounded soft contact shadow (aligned with resting scroll at +64px) */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(50% + 64px)',
              left: '10%',
              right: '10%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(234, 88, 12, 0.22), transparent)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(50% + 58px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '150px',
              height: '16px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.55) 0%, transparent 75%)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* THE PHYSICAL LUXURY DISPATCH PARCHMENT LETTER */}
          {(phase === 'letter_reading' || phase === 'letter_folding') && (
            <div
              className={`letter-sheet-wrapper ${phase === 'letter_folding' ? 'is-folding' : 'is-open'}`}
              style={{
                width: '100%',
                maxWidth: '360px',
                position: 'relative',
                perspective: '1400px',
                transformStyle: 'preserve-3d',
                zIndex: 3,
              }}
            >
              <div className="letter-tri-fold">
                {/* Panel 1: Top Panel (Header & Metadata) */}
                <div className="letter-panel panel-top">
                  <div className="flap-face flap-front">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '9.5px',
                        fontFamily: 'var(--font-mono)',
                        color: '#78716C',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#C2410C' }}>
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#EA580C',
                            display: 'inline-block',
                          }}
                        />
                        TO: BABUL KUMAR &lt;babulkumar0220@gmail.com&gt;
                      </span>
                      <span
                        style={{
                          fontSize: '8px',
                          background: 'rgba(234, 88, 12, 0.1)',
                          color: '#C2410C',
                          padding: '1.5px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                        }}
                      >
                        RECIPIENT INBOX
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#292524', lineHeight: 1.3 }}>
                      FROM: <span style={{ color: '#1C1917' }}>{data.name}</span>{' '}
                      <span style={{ fontSize: '9.5px', color: '#78716C', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>
                        &lt;{data.email}&gt;
                      </span>
                    </div>
                  </div>
                  {/* Flap backface when folded down */}
                  <div className="flap-face flap-back">
                    <div className="fold-crease-texture" />
                  </div>
                </div>

                {/* Panel 2: Middle Panel (Message Text) */}
                <div className="letter-panel panel-middle">
                  <div style={{ width: '100%' }}>
                    <div
                      style={{
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.3), transparent)',
                        marginBottom: '8px',
                      }}
                    />
                    <div
                      style={{
                        fontSize: '12.5px',
                        lineHeight: 1.55,
                        color: '#1C1917',
                        fontStyle: 'italic',
                        position: 'relative',
                        maxHeight: '84px',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '16px',
                          fontFamily: 'serif',
                          color: '#EA580C',
                          lineHeight: 0,
                          marginRight: '3px',
                          verticalAlign: '-2px',
                        }}
                      >
                        &ldquo;
                      </span>
                      {previewMessage}
                      <span
                        style={{
                          fontSize: '16px',
                          fontFamily: 'serif',
                          color: '#EA580C',
                          lineHeight: 0,
                          marginLeft: '3px',
                          verticalAlign: '-2px',
                        }}
                      >
                        &rdquo;
                      </span>
                    </div>
                    <div
                      style={{
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.3), transparent)',
                        marginTop: '8px',
                      }}
                    />
                  </div>
                </div>

                {/* Panel 3: Bottom Panel (Signature & Wax Seal) */}
                <div className="letter-panel panel-bottom">
                  <div className="flap-face flap-front">
                    <div>
                      <div style={{ fontSize: '10px', color: '#78716C' }}>Respectfully,</div>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#1C1917',
                          fontFamily: 'var(--font-mono)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '200px',
                        }}
                      >
                        {data.name}
                      </div>
                    </div>

                    {/* Pre-embossed BK Monogram */}
                    <div className="wax-seal-badge" title="BK Wax Seal">
                      <div className="wax-seal-inner-ring" />
                      <span className="wax-seal-text">BK</span>
                    </div>
                  </div>

                  {/* Flap backface when folded up: Center BK Seal locks the envelope */}
                  <div className="flap-face flap-back">
                    <div className="envelope-v-flap" />
                    <div className="wax-seal-badge seal-center" title="BK Wax Seal">
                      <div className="wax-seal-inner-ring" />
                      <span className="wax-seal-text">BK</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* THE AUTHENTIC ROLLED DESK SCROLL (100% pixel-aligned with pigeon talons) */}
          {(phase === 'letter_folding' || phase === 'pigeon_arrival') && (
            <div
              className={`desk-scroll ${phase === 'letter_folding' ? 'emerging' : hasScrollOnBird ? 'picked-up' : 'resting'}`}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '180px',
                height: '180px',
                transform: 'translate(-50%, -50%)',
                zIndex: 4,
                pointerEvents: 'none',
              }}
            >
              <Image
                src="/images/pigeon/pigeon_clean_desk_scroll.webp"
                alt="Rolled parchment dispatch scroll"
                width={180}
                height={180}
                priority
                unoptimized
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.45))',
                }}
              />
            </div>
          )}

          {/* THE MESSENGER PIGEON (Arrival swoop & touchdown grab on desk) */}
          {phase === 'pigeon_arrival' && (
            <div
              className="pigeon-actor arrival-swoop"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '180px',
                height: '180px',
                transform: 'translate(-50%, -50%)',
                zIndex: 8,
                pointerEvents: 'none',
              }}
            >
              <PerchedPigeon hasScroll={hasScrollOnBird} />
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          DESK STATUS DURING FLIGHT (Interactive Flight Radar & Route Monitor)
          ========================================================================= */}
      {phase === 'pigeon_flight' && (
        <div
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '340px',
            width: '100%',
            animation: 'fadeInUp 0.35s ease-out forwards',
          }}
        >
          {/* Compass / Dispatch Radar Icon */}
          <div
            style={{
              position: 'relative',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(234, 88, 12, 0.08)',
              border: '1.5px solid rgba(234, 88, 12, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              boxShadow: '0 0 24px rgba(234, 88, 12, 0.22)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '1px dashed rgba(234, 88, 12, 0.3)',
                animation: 'radarSpin 8s linear infinite',
              }}
            />
            <Send size={20} color="#EA580C" style={{ transform: 'translate(1px, -1px)' }} />
          </div>

          <div
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: '4px',
              letterSpacing: '-0.01em',
            }}
          >
            Dispatched via Courier Pigeon
          </div>

          <div
            style={{
              fontSize: '12.5px',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-mono)',
              marginBottom: '20px',
            }}
          >
            Route: Client Dispatch → Babul Kumar
          </div>

          {/* Flight Progress Bar */}
          <div
            style={{
              width: '100%',
              maxWidth: '240px',
              height: '5px',
              background: 'var(--color-surface-2)',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${flightProgressPct}%`,
                background: 'linear-gradient(90deg, #EA580C, #F59E0B)',
                transition: 'width 0.1s linear',
                borderRadius: '4px',
              }}
            />
          </div>

          <div
            style={{
              marginTop: '8px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#EA580C',
                animation: 'pulseGlow 1s infinite alternate',
              }}
            />
            <span>TRANSIT PROGRESS {flightProgressPct}%</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          PORTALED FULL-VIEWPORT SKY FLIGHT & ROUTE OVERLAY
          ========================================================================= */}
      {isClient && phase === 'pigeon_flight' && typeof document !== 'undefined' && createPortal(
        <div
          id="pigeon-sky-flight-portal"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 999999,
            overflow: 'hidden',
          }}
        >
          {/* SVG Flight Trajectory Route Arc */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            <defs>
              <linearGradient id="pigeon-flight-route-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EA580C" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
              </linearGradient>
              <filter id="pigeon-route-glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>



            {/* Launch Origin Waypoint Marker */}
            <g transform={`translate(${routeCoords.startX}, ${routeCoords.startY})`}>
              <circle r="12" fill="none" stroke="#EA580C" strokeWidth="1" opacity="0.4" className="waypoint-pulse" />
              <circle r="4" fill="#EA580C" />
            </g>
          </svg>

          {/* Sleek Route HUD Header Banner */}
          <div
            className="pigeon-sky-route-hud"
            style={{
              position: 'fixed',
              top: 'clamp(14px, 2.5vh, 24px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(18, 17, 16, 0.88)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(234, 88, 12, 0.35)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(234, 88, 12, 0.15)',
              zIndex: 1000000,
              pointerEvents: 'none',
              animation: 'fadeInDown 0.3s ease-out forwards',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#EA580C',
                boxShadow: '0 0 8px #EA580C',
                animation: 'pulseGlow 0.8s infinite alternate',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: '#FFF7ED',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}
            >
              ROUTE: CLIENT <span style={{ color: '#EA580C' }}>⟶</span> BABUL KUMAR
            </span>
            <span
              style={{
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                color: '#EA580C',
                background: 'rgba(234, 88, 12, 0.12)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 700,
                letterSpacing: '0.06em',
              }}
            >
              AIR COURIER
            </span>
          </div>

          {/* THE SOARING PIGEON (Flapping wings continuously across the viewport) */}
          <div
            ref={birdPortalRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translate3d(${flightPos.x}px, ${flightPos.y}px, 0) translate(-50%, -50%) scale(${flightPos.scale}) rotate(${flightPos.rotation}deg)`,
              transformOrigin: 'center center',
              transition: 'none',
              filter: 'drop-shadow(0 14px 24px rgba(0, 0, 0, 0.5))',
              willChange: 'transform',
            }}
          >
            <FlyingPigeon />
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
          FINAL CONFIRMATION CARD (Revealed only after pigeon is 100% off-screen)
          ========================================================================= */}
      {phase === 'confirmation' && (
        <div
          className="final-confirmation-card"
          style={{
            width: '100%',
            maxWidth: '440px',
            margin: '0 auto',
            textAlign: 'center',
            padding: '36px 28px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
            animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          {/* Subtle teal success ripple and checkmark */}
          <div
            style={{
              position: 'relative',
              width: '68px',
              height: '68px',
              margin: '0 auto 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'rgba(20, 184, 166, 0.12)',
                animation: 'rippleGlow 2.5s infinite ease-out',
              }}
            />
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #0F766E 0%, #115E59 100%)',
                border: '1.5px solid #14B8A6',
                boxShadow: '0 0 20px rgba(20, 184, 166, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <CheckCircle2 size={26} color="#5EEAD4" strokeWidth={2.4} />
            </div>
          </div>

          <h3
            style={{
              fontSize: '21px',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: '8px',
              letterSpacing: '-0.01em',
            }}
          >
            Message sent successfully.
          </h3>

          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              marginBottom: '20px',
              lineHeight: 1.5,
            }}
          >
            Thank you for reaching out, <strong style={{ color: 'var(--color-text)' }}>{data.name}</strong>. Your message was successfully dispatched and delivered directly to Babul Kumar.
          </p>

          {/* Explicit Recipient & Dispatch Manifest Receipt */}
          <div
            style={{
              width: '100%',
              margin: '0 auto 24px',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border-subtle)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--color-border-subtle)',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                ● DISPATCH RECEIPT
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: '#10B981',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                DELIVERED
              </span>
            </div>

            {/* Recipient */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Recipient:
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexWrap: 'wrap',
                }}
              >
                <span>Babul Kumar</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-accent)',
                    fontWeight: 400,
                  }}
                >
                  &lt;babulkumar0220@gmail.com&gt;
                </span>
              </div>
            </div>

            {/* Sender */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Sender:
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexWrap: 'wrap',
                }}
              >
                <span>{data.name}</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  &lt;{data.email}&gt;
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="btn-secondary"
            style={{
              fontSize: '13px',
              padding: '10px 22px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 500,
              cursor: 'pointer',
              margin: '0 auto',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <RotateCcw size={14} />
            <span>Send another message</span>
          </button>
        </div>
      )}

      {/* Global CSS for 3D Origami Folding, Seamless Pigeon Grab, and Natural Flight */}
      <style>{`
        /* =========================================================================
           TRUE PHYSICAL 3D LETTER ORIGAMI FOLDING SYSTEM
           ========================================================================= */
        .letter-sheet-wrapper {
          width: 100%;
          transform-style: preserve-3d;
          background: transparent;
        }

        .letter-tri-fold {
          width: 100%;
          background: transparent;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          transform-style: preserve-3d;
          position: relative;
          filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.45));
        }

        .letter-panel {
          position: relative;
          background: linear-gradient(175deg, #FFFDF8 0%, #FAF5EA 50%, #F5EEE0 100%);
          transform-style: preserve-3d;
          border-left: 1.5px solid #E8DFCE;
          border-right: 1.5px solid #E8DFCE;
          box-sizing: border-box;
        }

        .panel-top {
          height: 66px;
          border-top: 1.5px solid #E8DFCE;
          border-radius: 8px 8px 0 0;
          transform-origin: bottom center;
          z-index: 2;
        }

        .panel-middle {
          min-height: 74px;
          border-top: 1px dashed rgba(217, 119, 6, 0.35);
          border-bottom: 1px dashed rgba(217, 119, 6, 0.35);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          z-index: 1;
        }

        .panel-bottom {
          height: 56px;
          border-bottom: 1.5px solid #E8DFCE;
          border-radius: 0 0 8px 8px;
          transform-origin: top center;
          z-index: 3;
        }

        /* Dual Faces for folding flaps */
        .flap-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          padding: 9px 16px 8px;
          box-sizing: border-box;
          border-radius: inherit;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .panel-top .flap-face {
          display: block;
        }

        .flap-front {
          background: linear-gradient(175deg, #FFFDF8 0%, #FAF5EA 50%, #F5EEE0 100%);
        }

        .flap-back {
          background: linear-gradient(175deg, #F5EEE0 0%, #ECE3D2 100%);
          border: 1.5px solid #DDD3BF;
          transform: rotateX(180deg);
          box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .fold-crease-texture {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(180, 160, 130, 0.5), transparent);
        }

        .envelope-v-flap {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: linear-gradient(135deg, rgba(234, 88, 12, 0.04) 0%, transparent 100%);
          clip-path: polygon(0 0, 100% 0, 50% 100%);
          border-bottom: 1.5px solid rgba(194, 65, 12, 0.25);
          pointer-events: none;
        }

        .seal-center {
          position: relative;
          z-index: 10;
          margin: 0 auto;
        }

        /* Wax Seal Badge */
        .wax-seal-badge {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #FB923C 0%, #EA580C 45%, #C2410C 85%, #7C2D12 100%);
          box-shadow: 0 4px 12px rgba(154, 52, 18, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #9A3412;
          position: relative;
          flex-shrink: 0;
        }

        .wax-seal-inner-ring {
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          border: 1px dashed rgba(255, 237, 213, 0.6);
          pointer-events: none;
        }

        .wax-seal-text {
          font-size: 12px;
          font-weight: 900;
          font-family: serif;
          color: #FFF7ED;
          letter-spacing: 0.04em;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        /* 3D Folding Keyframes */
        .letter-sheet-wrapper.is-folding .panel-top {
          animation: foldTopClean 0.45s cubic-bezier(0.33, 1, 0.68, 1) forwards;
        }

        .letter-sheet-wrapper.is-folding .panel-bottom {
          animation: foldBottomClean 0.45s cubic-bezier(0.33, 1, 0.68, 1) 0.3s forwards;
        }

        .letter-sheet-wrapper.is-folding .flap-back .wax-seal-badge {
          animation: sealStampPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.75s forwards;
        }

        /* Symmetrical collapse directly toward resting scroll coordinates (-6.4px, 61.1px) */
        .letter-sheet-wrapper.is-folding .letter-tri-fold {
          animation: rollIntoScrollTarget 0.5s cubic-bezier(0.4, 0, 0.2, 1) 1.05s forwards;
        }

        @keyframes foldTopClean {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(-180deg); z-index: 4; }
        }

        @keyframes foldBottomClean {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(180deg); z-index: 5; }
        }

        @keyframes sealStampPop {
          0% { transform: scale(0.85); box-shadow: 0 2px 6px rgba(154, 52, 18, 0.3); }
          60% { transform: scale(1.25); box-shadow: 0 0 25px rgba(234, 88, 12, 0.8); }
          100% { transform: scale(1); box-shadow: 0 4px 14px rgba(154, 52, 18, 0.5); }
        }

        @keyframes rollIntoScrollTarget {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
            border-radius: 8px;
          }
          50% {
            transform: translate(-3px, 30px) scale(0.55, 0.45) rotate(-2deg);
            border-radius: 16px;
            opacity: 0.9;
          }
          100% {
            transform: translate(-6.4px, 61.1px) scale(0.12, 0.12) rotate(-4deg);
            border-radius: 24px;
            opacity: 0;
          }
        }

        /* Desk Scroll Emergence (Synchronized at -6.4px, 61.1px) */
        .desk-scroll.emerging {
          animation: scrollSettleBounce 0.4s cubic-bezier(0.34, 1.3, 0.64, 1) 1.25s forwards;
          opacity: 0;
        }

        .desk-scroll.resting {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1) rotate(0deg);
        }

        .desk-scroll.picked-up {
          opacity: 0;
        }

        @keyframes scrollSettleBounce {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.65) rotate(-5deg);
          }
          70% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.04) rotate(1deg);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
        }

        /* Pigeon Arrival Swoop & Touchdown Grab */
        .pigeon-actor.arrival-swoop {
          animation: pigeonSwoopAndGrab 2.0s cubic-bezier(0.2, 0.85, 0.35, 1) forwards;
        }

        @keyframes pigeonSwoopAndGrab {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-70px, -90px) scale(0.75) rotate(12deg);
          }
          32% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(-20px, -24px) scale(0.92) rotate(5deg);
          }
          42% {
            /* Touchdown grab squarely on scroll at 850ms */
            opacity: 1;
            transform: translate(-50%, -50%) translate(0, 0) scale(1) rotate(0deg);
          }
          50% {
            /* Knee landing cushion */
            opacity: 1;
            transform: translate(-50%, -50%) translateY(3px) scale(0.985) rotate(0.5deg);
          }
          58% {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0) scale(1) rotate(0deg);
          }
          66% {
            /* Alert head bob left */
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0) scale(1) rotate(-2.5deg);
          }
          76% {
            /* Alert forward nod */
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0) scale(1.015) rotate(1deg);
          }
          86% {
            /* Crouch to spring */
            opacity: 1;
            transform: translate(-50%, -50%) translateY(3px) scale(0.98) rotate(-2deg);
          }
          94% {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(-14px) scale(1.02) rotate(2deg);
          }
          100% {
            /* Upward spring liftoff (instantaneous handoff to sky portal) */
            transform: translate(-50%, -50%) translateY(-28px) scale(1.05) rotate(4deg);
            opacity: 0;
          }
        }

        /* Wing Flapping System: Step-based crisp wingbeats with continuous aerodynamic heave */
        .pigeon-flight-container {
          position: relative;
          width: 180px;
          height: 180px;
        }

        .pigeon-flight-inner-bob {
          position: relative;
          width: 100%;
          height: 100%;
          animation: pigeonFlightHeave 0.26s infinite ease-in-out;
        }

        @keyframes pigeonFlightHeave {
          0% {
            transform: translateY(0px) rotate(-3deg);
          }
          50% {
            transform: translateY(-8px) rotate(2deg);
          }
          100% {
            transform: translateY(0px) rotate(-3deg);
          }
        }

        .pigeon-wing-frame {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
        }

        .pigeon-wings-up {
          animation: flapUpStep 0.26s steps(1) infinite;
        }

        .pigeon-wings-down {
          animation: flapDownStep 0.26s steps(1) infinite;
        }

        @keyframes flapUpStep {
          0%, 49.9% {
            opacity: 1;
            visibility: visible;
          }
          50%, 100% {
            opacity: 0;
            visibility: hidden;
          }
        }

        @keyframes flapDownStep {
          0%, 49.9% {
            opacity: 0;
            visibility: hidden;
          }
          50%, 100% {
            opacity: 1;
            visibility: visible;
          }
        }

        /* Animated Dashed Trajectory Flight Route */
        .pigeon-route-animated-path {
          animation: routeDashMove 1.2s linear infinite;
        }

        @keyframes routeDashMove {
          from {
            stroke-dashoffset: 32;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes radarSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes waypointPulse {
          0% { r: 6px; opacity: 0.6; }
          100% { r: 18px; opacity: 0; }
        }

        .waypoint-pulse {
          animation: waypointPulse 1.8s ease-out infinite;
        }

        /* Confirmation Ripple */
        @keyframes rippleGlow {
          0% {
            transform: scale(0.9);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.25);
            opacity: 0.2;
          }
          100% {
            transform: scale(0.9);
            opacity: 0.7;
          }
        }

        /* Fade in animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translate(-50%, -12px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        /* Pulse Glow */
        @keyframes pulseGlow {
          from {
            opacity: 0.6;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1.04);
          }
        }
      `}</style>
    </div>
  )
}

function PerchedPigeon({ hasScroll }: { hasScroll: boolean }) {
  const src = hasScroll
    ? '/images/pigeon/pigeon_perched_with_scroll.webp'
    : '/images/pigeon/pigeon_perched_empty_perfect.webp'

  return (
    <div
      style={{
        position: 'relative',
        width: '180px',
        height: '180px',
        filter: 'drop-shadow(0 12px 22px rgba(0, 0, 0, 0.45))',
      }}
      aria-label="Messenger Pigeon Perched on Desk"
    >
      <Image
        src={src}
        alt="Rock Dove Messenger"
        width={180}
        height={180}
        priority
        unoptimized
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

function FlyingPigeon() {
  return (
    <div className="pigeon-flight-container" aria-label="Rock Dove Soaring in Flight">
      <div className="pigeon-flight-inner-bob">
        {/* Upstroke Wing Frame */}
        <Image
          src="/images/pigeon/pigeon_fly_up_aligned.webp"
          alt="Upstroke Wings"
          width={180}
          height={180}
          priority
          unoptimized
          className="pigeon-wing-frame pigeon-wings-up"
          draggable={false}
        />
        {/* Downstroke Wing Frame */}
        <Image
          src="/images/pigeon/pigeon_fly_down_aligned.webp"
          alt="Downstroke Wings"
          width={180}
          height={180}
          priority
          unoptimized
          className="pigeon-wing-frame pigeon-wings-down"
          draggable={false}
        />
      </div>
    </div>
  )
}
