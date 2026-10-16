'use client'

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { CheckCircle2, RotateCcw, Send } from 'lucide-react'

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
  | 'letter_reading' // Phase 1: User reads their submitted dispatch letter (1.4s)
  | 'letter_folding' // Phase 2: Letter physically folds in 3D into the rolled dispatch scroll (1.8s)
  | 'pigeon_arrival' // Phase 3: Rock dove swoops in, grabs scroll with claws, bobs head, springs for liftoff (2.2s)
  | 'pigeon_flight'  // Phase 4: Pigeon soars across the sky holding the scroll (2.5s)
  | 'confirmation'   // Phase 5: Pigeon exits off-screen; pristine confirmation card appears

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

  // Trajectory flight coordinates for the active soaring pigeon
  const [flightPos, setFlightPos] = useState<{ x: number; y: number; scale: number; rotation: number }>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
  })

  // Whether the scroll has been secured in the bird's talons
  const [hasScrollOnBird, setHasScrollOnBird] = useState(false)

  const deskRef = useRef<HTMLDivElement>(null)
  const birdPortalRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number | null>(null)
  const flightPosRef = useRef({ x: 0, y: 0, scale: 1, rotation: 0 })

  // Measure desk anchor position on mount and whenever window resizes
  useEffect(() => {
    const measureAnchor = () => {
      if (deskRef.current) {
        const rect = deskRef.current.getBoundingClientRect()
        deskAnchorRef.current = {
          x: rect.left + rect.width * 0.5,
          y: rect.top + rect.height * 0.5,
        }
      }
    }

    measureAnchor()
    window.addEventListener('resize', measureAnchor)
    return () => window.removeEventListener('resize', measureAnchor)
  }, [])

  // Sequential Phase Progression: One coherent, uninterrupted story
  useEffect(() => {
    let timer: NodeJS.Timeout
    let grabTimer: NodeJS.Timeout

    if (phase === 'letter_reading') {
      setHasScrollOnBird(false)
      // 1. User reviews their submitted dispatch letter (1.4s)
      timer = setTimeout(() => {
        setPhase('letter_folding')
      }, 1400)
    } else if (phase === 'letter_folding') {
      setHasScrollOnBird(false)
      // 2. 3D origami folding: top panel down, bottom panel up, wax seal stamp, roll into scroll (1.8s)
      timer = setTimeout(() => {
        setPhase('pigeon_arrival')
      }, 1800)
    } else if (phase === 'pigeon_arrival') {
      setHasScrollOnBird(false)
      // 3. Pigeon swoops in and makes exact talon contact at 900ms
      grabTimer = setTimeout(() => {
        setHasScrollOnBird(true)
      }, 900)

      // Liftoff spring at 2200ms -> transitions seamlessly into soaring sky flight
      timer = setTimeout(() => {
        let launchX = deskAnchorRef.current.x
        let launchY = deskAnchorRef.current.y
        if (deskRef.current) {
          const rect = deskRef.current.getBoundingClientRect()
          launchX = rect.left + rect.width * 0.5
          launchY = rect.top + rect.height * 0.5 - 30 // accounts for liftoff spring offset
        }

        flightPosRef.current = {
          x: launchX || (typeof window !== 'undefined' ? window.innerWidth / 2 : 600),
          y: launchY || (typeof window !== 'undefined' ? window.innerHeight / 2 : 400),
          scale: 1,
          rotation: -6,
        }
        setFlightPos(flightPosRef.current)
        setPhase('pigeon_flight')
      }, 2200)
    }

    return () => {
      clearTimeout(timer)
      clearTimeout(grabTimer)
    }
  }, [phase])

  // Continuous Flight Kinematics and Guaranteed Off-Screen Departure
  useEffect(() => {
    if (phase !== 'pigeon_flight') return

    const vpWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
    const vpHeight = typeof window !== 'undefined' ? window.innerHeight : 800

    const startX = flightPosRef.current.x || vpWidth * 0.5
    const startY = flightPosRef.current.y || vpHeight * 0.55

    // Target is safely outside the visible viewport boundary (full wingspan clearance)
    const targetX = vpWidth + 320
    const targetY = -220

    const flightDuration = 2500 // 2.5s of soaring flight
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
      const liftUndulation = Math.sin((elapsed / 220) * Math.PI * 2) * -5
      const ascendingArc = Math.sin(rawProgress * Math.PI * 0.9) * -60

      const currentX = startX + (targetX - startX) * progress
      const currentY = startY + (targetY - startY) * progress + ascendingArc + liftUndulation

      // Perspective distance scaling: scales smoothly from 1.0 down to 0.38
      const currentScale = Math.max(1.0 - rawProgress * 0.62, 0.38)

      // Aerodynamic banking angle along flight trajectory
      const currentRotation = -12 + Math.sin(rawProgress * Math.PI) * -10

      // Direct DOM update for 60fps performance without React state re-render thrashing
      if (birdPortalRef.current) {
        birdPortalRef.current.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%) scale(${currentScale}) rotate(${currentRotation}deg)`
      }

      flightPosRef.current = {
        x: currentX,
        y: currentY,
        scale: currentScale,
        rotation: currentRotation,
      }

      // STRICT OFF-SCREEN CHECK:
      const birdClearance = 110 * currentScale
      const isEntirelyOffScreen = (currentX - birdClearance > vpWidth) || (currentY + birdClearance < 0)

      if (rawProgress >= 1.0 && isEntirelyOffScreen) {
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

  // Truncate long preview message gracefully for the letter
  const previewMessage = data.message.length > 180 ? data.message.slice(0, 177) + '...' : data.message

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
            maxWidth: '440px',
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
          {/* Subtle desk surface horizon and soft contact shadow for physical grounding */}
          <div
            style={{
              position: 'absolute',
              bottom: '58px',
              left: '12%',
              right: '12%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(234, 88, 12, 0.2), transparent)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '52px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '140px',
              height: '16px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.5) 0%, transparent 75%)',
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
                maxWidth: '400px',
                position: 'relative',
                perspective: '1400px',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="letter-tri-fold">
                {/* Panel 1: Top Panel (Header & Metadata) */}
                <div className="letter-panel panel-top">
                  <div className="flap-face flap-front">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#78716C', marginBottom: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EA580C', display: 'inline-block' }} />
                        TO: BABUL KUMAR
                      </span>
                      <span style={{ fontSize: '9px', background: 'rgba(234, 88, 12, 0.1)', color: '#C2410C', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, letterSpacing: '0.04em' }}>
                        EXPRESS DISPATCH
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#292524' }}>
                      FROM: <span style={{ color: '#C2410C' }}>{data.name}</span>{' '}
                      <span style={{ fontSize: '10.5px', fontWeight: 400, color: '#78716C' }}>&lt;{data.email}&gt;</span>
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
                    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.3), transparent)', marginBottom: '10px' }} />
                    <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#1C1917', fontStyle: 'italic', position: 'relative' }}>
                      <span style={{ fontSize: '18px', fontFamily: 'serif', color: '#EA580C', lineHeight: 0, marginRight: '4px', verticalAlign: '-3px' }}>&ldquo;</span>
                      {previewMessage}
                      <span style={{ fontSize: '18px', fontFamily: 'serif', color: '#EA580C', lineHeight: 0, marginLeft: '4px', verticalAlign: '-3px' }}>&rdquo;</span>
                    </div>
                    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.3), transparent)', marginTop: '10px' }} />
                  </div>
                </div>

                {/* Panel 3: Bottom Panel (Signature & Wax Seal) */}
                <div className="letter-panel panel-bottom">
                  <div className="flap-face flap-front">
                    <div>
                      <div style={{ fontSize: '10.5px', color: '#78716C' }}>Respectfully submitted,</div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1C1917', fontFamily: 'var(--font-mono)' }}>{data.name}</div>
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

          {/* THE AUTHENTIC ROLLED DESK SCROLL (Pixel-aligned with pigeon claws) */}
          {(phase === 'letter_folding' || phase === 'pigeon_arrival') && (
            <div
              className={`desk-scroll ${phase === 'letter_folding' ? 'emerging' : hasScrollOnBird ? 'picked-up' : 'resting'}`}
              style={{
                position: 'absolute',
                left: 'calc(50% - 43.25px)',
                top: 'calc(50% + 40.25px)',
                width: '65px',
                height: 'auto',
                zIndex: 4,
                pointerEvents: 'none',
              }}
            >
              <Image
                src="/images/pigeon/desk_scroll_realistic.webp"
                alt="Rolled parchment dispatch scroll"
                width={65}
                height={30}
                priority
                unoptimized
                draggable={false}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.55))',
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
          DESK STATUS DURING FLIGHT (Serene, clean status while bird soars across sky)
          ========================================================================= */}
      {phase === 'pigeon_flight' && (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '340px',
            animation: 'fadeInUp 0.5s ease-out forwards',
          }}
        >
          {/* Subtle warm amber dispatch beacon */}
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(234, 88, 12, 0.08)',
              border: '1.5px solid rgba(234, 88, 12, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 0 20px rgba(234, 88, 12, 0.2)',
              animation: 'pulseGlow 1.4s infinite alternate',
            }}
          >
            <Send size={20} color="#EA580C" style={{ transform: 'translate(1px, -1px)' }} />
          </div>
          <div
            style={{
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
              color: 'var(--color-accent)',
              fontWeight: 600,
              marginBottom: '4px',
            }}
          >
            Dispatch in flight...
          </div>
          <div
            style={{
              fontSize: '12.5px',
              color: 'var(--color-text-secondary)',
            }}
          >
            Air courier delivering to Babul Kumar
          </div>
        </div>
      )}

      {/* =========================================================================
          PORTALED FULL-VIEWPORT FLIGHT OVERLAY (Attached directly to document.body)
          ========================================================================= */}
      {isClient && phase === 'pigeon_flight' && typeof document !== 'undefined' && createPortal(
        <div
          id="pigeon-sky-flight-portal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 999999,
            overflow: 'visible',
          }}
        >
          {/* THE SOARING PIGEON (Flapping wings continuously across the viewport) */}
          <div
            ref={birdPortalRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translate(${flightPos.x}px, ${flightPos.y}px) translate(-50%, -50%) scale(${flightPos.scale}) rotate(${flightPos.rotation}deg)`,
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
            textAlign: 'center',
            padding: '36px 28px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
            animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            position: 'relative',
          }}
        >
          {/* Subtle teal success ripple and checkmark */}
          <div
            style={{
              position: 'relative',
              width: '72px',
              height: '72px',
              margin: '0 auto 20px',
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
                width: '52px',
                height: '52px',
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
              <CheckCircle2 size={28} color="#5EEAD4" strokeWidth={2.4} />
            </div>
          </div>

          <h3
            style={{
              fontSize: '22px',
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
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
              marginBottom: '26px',
              lineHeight: 1.5,
            }}
          >
            Thank you for reaching out.
          </p>

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

      {/* Global CSS for 3D Origami Folding, Seamless Pigeon Grab, and Smooth Flight */}
      <style>{`
        /* =========================================================================
           TRUE PHYSICAL 3D LETTER ORIGAMI FOLDING SYSTEM
           Parent container is transparent: folding physically shrinks height!
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
          filter: drop-shadow(0 18px 36px rgba(0, 0, 0, 0.48));
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
          height: 64px;
          border-top: 1.5px solid #E8DFCE;
          border-radius: 8px 8px 0 0;
          transform-origin: bottom center;
          z-index: 2;
        }

        .panel-middle {
          min-height: 84px;
          border-top: 1px dashed rgba(217, 119, 6, 0.35);
          border-bottom: 1px dashed rgba(217, 119, 6, 0.35);
          padding: 14px 20px;
          display: flex;
          align-items: center;
          z-index: 1;
        }

        .panel-bottom {
          height: 64px;
          border-bottom: 1.5px solid #E8DFCE;
          border-radius: 0 0 8px 8px;
          transform-origin: top center;
          z-index: 3;
        }

        /* Dual Faces for folding flaps (Eliminates transparent hollows) */
        .flap-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          padding: 12px 20px;
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
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #FB923C 0%, #EA580C 45%, #C2410C 85%, #7C2D12 100%);
          box-shadow: 0 4px 12px rgba(154, 52, 18, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #9A3412;
          position: relative;
        }

        .wax-seal-inner-ring {
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          border: 1px dashed rgba(255, 237, 213, 0.6);
          pointer-events: none;
        }

        .wax-seal-text {
          font-size: 13.5px;
          font-weight: 900;
          font-family: serif;
          color: #FFF7ED;
          letter-spacing: 0.04em;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        /* =========================================================================
           TRUE 3D PHYSICAL FOLDING KEYFRAMES
           ========================================================================= */
        .letter-sheet-wrapper.is-folding .panel-top {
          animation: foldTopClean 0.5s cubic-bezier(0.33, 1, 0.68, 1) forwards;
        }

        .letter-sheet-wrapper.is-folding .panel-bottom {
          animation: foldBottomClean 0.5s cubic-bezier(0.33, 1, 0.68, 1) 0.35s forwards;
        }

        /* Wax Seal Stamp Pop on closure */
        .letter-sheet-wrapper.is-folding .flap-back .wax-seal-badge {
          animation: sealStampPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.85s forwards;
        }

        /* Continuous roll into the exact scroll resting position */
        .letter-sheet-wrapper.is-folding .letter-tri-fold {
          animation: rollIntoScrollTarget 0.55s cubic-bezier(0.4, 0, 0.2, 1) 1.2s forwards;
        }

        @keyframes foldTopClean {
          0% {
            transform: rotateX(0deg);
          }
          100% {
            transform: rotateX(-180deg);
            z-index: 4;
          }
        }

        @keyframes foldBottomClean {
          0% {
            transform: rotateX(0deg);
          }
          100% {
            transform: rotateX(180deg);
            z-index: 5;
          }
        }

        @keyframes sealStampPop {
          0% {
            transform: scale(0.85);
            box-shadow: 0 2px 6px rgba(154, 52, 18, 0.3);
          }
          60% {
            transform: scale(1.3);
            box-shadow: 0 0 30px rgba(234, 88, 12, 0.9), 0 0 55px rgba(251, 146, 60, 0.5);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 4px 14px rgba(154, 52, 18, 0.5);
          }
        }

        @keyframes rollIntoScrollTarget {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
            border-radius: 8px;
          }
          45% {
            transform: translate(-18px, 16px) scale(0.65, 0.5) rotate(-4deg);
            border-radius: 16px;
            opacity: 0.95;
          }
          80% {
            transform: translate(-36px, 32px) scale(0.32, 0.26) rotate(-7deg);
            border-radius: 24px;
            opacity: 0.6;
          }
          100% {
            transform: translate(-43.25px, 40.25px) scale(0.16, 0.18) rotate(-9deg);
            border-radius: 28px;
            opacity: 0;
          }
        }

        /* =========================================================================
           DESK SCROLL (Pixel-aligned authentic rolled parchment cylinder)
           ========================================================================= */
        .desk-scroll {
          position: absolute;
          left: calc(50% - 43.25px);
          top: calc(50% + 40.25px);
          width: 65px;
          height: auto;
          z-index: 4;
          pointer-events: none;
          transition: opacity 0.04s ease;
        }

        .desk-scroll.emerging {
          animation: scrollSettleBounce 0.45s cubic-bezier(0.34, 1.3, 0.64, 1) 1.35s forwards;
          opacity: 0;
        }

        .desk-scroll.resting {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }

        .desk-scroll.picked-up {
          opacity: 0;
        }

        @keyframes scrollSettleBounce {
          0% {
            opacity: 0;
            transform: scale(0.7) rotate(-9deg);
          }
          65% {
            opacity: 1;
            transform: scale(1.06) rotate(1.5deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        /* =========================================================================
           PIGEON ARRIVAL, TOUCHDOWN TALON CLAMP, AND PROUD LIFTOFF
           Seamless zero-jump transition because body pixels are 100% identical!
           ========================================================================= */
        .pigeon-actor.arrival-swoop {
          animation: pigeonSwoopAndGrab 2.2s cubic-bezier(0.2, 0.85, 0.35, 1) forwards;
        }

        @keyframes pigeonSwoopAndGrab {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(-85px, -115px) scale(0.7) rotate(14deg);
          }
          30% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(-35px, -45px) scale(0.9) rotate(6deg);
          }
          41% {
            /* Touchdown grab squarely on scroll at 900ms (41% of 2200ms) */
            transform: translate(-50%, -50%) translate(0, 0) scale(1) rotate(0deg);
          }
          48% {
            /* Knee flexion landing cushion (absorbs momentum) */
            transform: translate(-50%, -50%) translateY(3px) scale(0.985) rotate(0.5deg);
          }
          55% {
            /* Gentle rebound to resting stance */
            transform: translate(-50%, -50%) translateY(0) scale(1) rotate(0deg);
          }
          63% {
            /* Inquisitive rock dove head bob - alert tilt left */
            transform: translate(-50%, -50%) translateY(0) scale(1) rotate(-2.5deg);
          }
          72% {
            /* Alert forward nod - proud stance with secured dispatch */
            transform: translate(-50%, -50%) translateY(0) scale(1.015) rotate(1deg);
          }
          82% {
            /* Settle and center */
            transform: translate(-50%, -50%) translateY(0) scale(1) rotate(0deg);
          }
          90% {
            /* Crouch down to coil spring energy in legs */
            transform: translate(-50%, -50%) translateY(3.5px) scale(0.98) rotate(-2deg);
          }
          100% {
            /* Powerful upward spring push-off */
            transform: translate(-50%, -50%) translateY(-30px) scale(1.06) rotate(6deg);
            opacity: 0;
          }
        }

        /* =========================================================================
           CROSS-BROWSER HARDWARE-ACCELERATED WING FLAPPING
           ========================================================================= */
        .pigeon-flight-container {
          position: relative;
          width: 180px;
          height: 180px;
        }

        .pigeon-flight-inner-bob {
          position: relative;
          width: 100%;
          height: 100%;
          animation: pigeonBodyBob 0.24s infinite alternate ease-in-out;
        }

        @keyframes pigeonBodyBob {
          0% {
            transform: translateY(0px) rotate(-3deg);
          }
          100% {
            transform: translateY(-6px) rotate(3deg);
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
          animation: flapUpCycle 0.24s infinite linear;
        }

        .pigeon-wings-down {
          animation: flapDownCycle 0.24s infinite linear;
        }

        @keyframes flapUpCycle {
          0%, 49.99% { opacity: 1; visibility: visible; }
          50%, 100% { opacity: 0; visibility: hidden; }
        }

        @keyframes flapDownCycle {
          0%, 49.99% { opacity: 0; visibility: hidden; }
          50%, 100% { opacity: 1; visibility: visible; }
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

        /* Fade in Up */
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

// =============================================================================
// REFINED ROCK DOVE (COLUMBA LIVIA) PERCHED COMPONENT
// =============================================================================
function PerchedPigeon({ hasScroll }: { hasScroll: boolean }) {
  // Pixel-perfect identical upper body: zero flickering, zero jumping
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

// =============================================================================
// REFINED ROCK DOVE (COLUMBA LIVIA) SOARING FLIGHT COMPONENT WITH WING FLAP
// =============================================================================
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
