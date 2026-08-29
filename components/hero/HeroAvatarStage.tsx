'use client'

import { useRef, useEffect, useState, useMemo, useSyncExternalStore } from 'react'
import Image from 'next/image'
import HeroAIEnvironment from './HeroAIEnvironment'

interface HeroAvatarStageProps {
  mouse: React.RefObject<{ x: number; y: number }>
  isVisible?: boolean
}



function subscribeTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

function getThemeSnapshot(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'dark'
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function HeroAvatarStage({ mouse, isVisible = true }: HeroAvatarStageProps) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark')
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false)
  const isLight = theme === 'light'

  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)

  // Motion states
  const [coreHovered, setCoreHovered] = useState(false)

  // Subtle floating micro-particles along the hand-to-core energy field
  const energyParticles = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => {
      const duration = 3.5 + (i % 2) * 1.2
      const delay = i * 0.9
      const isOrange = i % 2 === 0
      const startX = 46 + (i % 3) * 6
      return { id: i, duration, delay, isOrange, startX }
    })
  }, [])

  // Smooth mouse tilt via direct DOM transform (zero React re-renders)
  useEffect(() => {
    if (reducedMotion || !isVisible) return

    let animId: number
    let currentX = 0
    let currentY = 0

    const tick = () => {
      if (mouse.current && wrapperRef.current) {
        const targetX = mouse.current.x * 4 // max 4 deg yaw
        const targetY = mouse.current.y * -3 // max 3 deg pitch

        currentX += (targetX - currentX) * 0.08
        currentY += (targetY - currentY) * 0.08

        wrapperRef.current.style.transform = `rotateY(${currentX.toFixed(2)}deg) rotateX(${currentY.toFixed(2)}deg)`
      }
      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [mouse, reducedMotion, isVisible])

  return (
    <div
      ref={containerRef}
      className="hero-avatar-stage"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1200px',
        userSelect: 'none',
        pointerEvents: 'auto',
        contain: 'layout paint',
        overflow: 'hidden',
      }}
      aria-label="Large Full-Body 3D AI Engineer Avatar of Babul Kumar holding an AI Intelligence Core"
    >
      {/* Background AI Environment: Minimal ambient nodes in peripheral space */}
      <HeroAIEnvironment
        mouse={mouse}
        isLight={isLight}
        reducedMotion={reducedMotion}
        coreProximity={coreHovered ? 1 : 0}
      />

      {/* Dynamic 3D Parallax & Breathing Layer */}
      <div
        ref={wrapperRef}
        className={`avatar-perspective-wrapper ${!reducedMotion ? 'animate-idle-breathing' : ''}`}
        style={{
          position: 'relative',
          height: '100%',
          maxHeight: '100%',
          aspectRatio: '457 / 1163',
          transform: 'none',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s cubic-bezier(0.2, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* =========================================================================
            1. Atmosphere & Backlight Aura (Matches website technical lighting)
            ========================================================================= */}
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '50%',
            transform: 'translate(-50%, -25%)',
            width: '120%',
            height: '75%',
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle at 40% 35%, rgba(2, 132, 199, 0.05) 0%, rgba(234, 88, 12, 0.04) 45%, transparent 70%)'
              : 'radial-gradient(circle at 40% 35%, rgba(249, 115, 22, 0.13) 0%, rgba(6, 182, 212, 0.08) 45%, transparent 70%)',
            filter: 'blur(36px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          aria-hidden="true"
        />

        {/* =========================================================================
            2. Subtle Holographic Floor Marker & Shoe Contact Shadows
            - Centered beneath both feet
            - Low opacity, non-distracting
            - Feet naturally occlude the marker
            ========================================================================= */}
        <div
          style={{
            position: 'absolute',
            bottom: '0px',
            left: '52%',
            transform: 'translateX(-50%) rotateX(78deg)',
            width: '88%',
            height: '46px',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 320 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Outer Cyan Dashed Ring */}
            <ellipse
              cx="160"
              cy="50"
              rx="140"
              ry="40"
              fill="none"
              stroke={isLight ? 'rgba(2, 132, 199, 0.24)' : 'rgba(6, 182, 212, 0.26)'}
              strokeWidth="1"
              strokeDasharray="5 8"
              className={!reducedMotion ? 'spin-clockwise' : ''}
            />

            {/* Inner Orange Accent Arc */}
            <ellipse
              cx="160"
              cy="50"
              rx="105"
              ry="28"
              fill="none"
              stroke={isLight ? 'rgba(234, 88, 12, 0.18)' : 'rgba(249, 115, 22, 0.20)'}
              strokeWidth="0.8"
              strokeDasharray="12 12"
              className={!reducedMotion ? 'spin-counter' : ''}
            />

            {/* Subtle Contact Shadows Underneath Left and Right Shoes */}
            <ellipse
              cx="92"
              cy="52"
              rx="26"
              ry="10"
              fill={isLight ? 'rgba(15, 23, 42, 0.28)' : 'rgba(0, 0, 0, 0.65)'}
              filter="blur(3px)"
            />
            <ellipse
              cx="238"
              cy="52"
              rx="24"
              ry="10"
              fill={isLight ? 'rgba(15, 23, 42, 0.28)' : 'rgba(0, 0, 0, 0.65)'}
              filter="blur(3px)"
            />
          </svg>
        </div>

        {/* =========================================================================
            3. Large Transparent Cutout Avatar
            - Full body presence
            - Complete legs, pants, and sneakers cleanly grounded
            - Subtle dual rim lighting: orange ambient (left) + cyan accent (right)
            ========================================================================= */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            zIndex: 2,
            filter: isLight
              ? 'drop-shadow(0 10px 24px rgba(15, 23, 42, 0.12)) contrast(1.02)'
              : 'drop-shadow(-3px 0 12px rgba(249, 115, 22, 0.12)) drop-shadow(3px 0 12px rgba(6, 182, 212, 0.14)) drop-shadow(0 12px 24px rgba(0, 0, 0, 0.55))',
            pointerEvents: 'none',
          }}
        >
          <Image
            src="/images/babul_avatar_cutout.webp"
            alt="Babul Kumar — Full Body 3D AI Engineer Avatar holding AI Intelligence Core"
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1080px) 45vw, 520px"
            priority
            style={{
              objectFit: 'contain',
              objectPosition: 'center center',
            }}
          />
        </div>

        {/* =========================================================================
            4. Hand-Held AI Core Light Bounce & Interaction Layer
            - Physical hand contact: palm supports core, fingers wrap around lower strut
            - Orange bounce light illuminates fingers, hand, and jacket sleeve
            - Subtle energy conduits connect fingertips to core
            - NO separate floating rings or disconnected gadgets
            ========================================================================= */}
        <div
          ref={coreRef}
          onMouseEnter={() => setCoreHovered(true)}
          onMouseLeave={() => setCoreHovered(false)}
          style={{
            position: 'absolute',
            left: '18.0%',
            top: '32.5%',
            width: '32%',
            aspectRatio: '1',
            transform: 'translate(-50%, -50%)',
            zIndex: 3,
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}
        >
          {/* Incident Light Bounce: Illuminates hand, fingers, and nearby jacket */}
          <div
            style={{
              position: 'absolute',
              top: '48%',
              left: '48%',
              transform: 'translate(-50%, -50%)',
              width: '85%',
              height: '85%',
              borderRadius: '50%',
              background: `radial-gradient(circle at 45% 45%, ${
                coreHovered
                  ? 'rgba(249, 115, 22, 0.40)'
                  : 'rgba(249, 115, 22, 0.22)'
              } 0%, rgba(249, 115, 22, 0.10) 45%, rgba(6, 182, 212, 0.06) 65%, transparent 80%)`,
              filter: 'blur(10px)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'none',
            }}
          />

          {/* Contact Point Glow: Concentrated energy right at the palm cradle */}
          <div
            style={{
              position: 'absolute',
              top: '64%',
              left: '51%',
              transform: 'translate(-50%, -50%)',
              width: '38px',
              height: '20px',
              borderRadius: '50%',
              background: `radial-gradient(ellipse, ${
                coreHovered
                  ? 'rgba(249, 115, 22, 0.55)'
                  : 'rgba(249, 115, 22, 0.30)'
              } 0%, rgba(6, 182, 212, 0.18) 60%, transparent 85%)`,
              filter: 'blur(5px)',
              transition: 'all 0.3s ease',
              pointerEvents: 'none',
            }}
          />

          {/* SVG Energy Conduits: Finger-to-core subtle data streams */}
          <svg
            viewBox="0 0 100 100"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              overflow: 'visible',
            }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="coreConduitGlow" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Left finger contact to core strut */}
            <path
              d="M 38 68 Q 40 55 45 44"
              fill="none"
              stroke="url(#coreConduitGlow)"
              strokeWidth="1.1"
              strokeDasharray="2 3"
              className={!reducedMotion ? 'animate-pulse-subtle' : ''}
              opacity={coreHovered ? '0.80' : '0.45'}
            />

            {/* Center palm to core base */}
            <path
              d="M 51 73 Q 50 56 50 40"
              fill="none"
              stroke="url(#coreConduitGlow)"
              strokeWidth="1.3"
              className={!reducedMotion ? 'animate-pulse-subtle' : ''}
              opacity={coreHovered ? '0.85' : '0.50'}
            />

            {/* Right finger contact to core strut */}
            <path
              d="M 62 68 Q 60 55 55 44"
              fill="none"
              stroke="url(#coreConduitGlow)"
              strokeWidth="1.1"
              strokeDasharray="2 3"
              className={!reducedMotion ? 'animate-pulse-subtle' : ''}
              opacity={coreHovered ? '0.80' : '0.45'}
            />

            {/* Fingertip contact micro-nodes */}
            <circle cx="38" cy="68" r="1.5" fill="#f97316" opacity="0.8" />
            <circle cx="51" cy="73" r="1.8" fill="#f97316" opacity="0.9" />
            <circle cx="62" cy="68" r="1.5" fill="#f97316" opacity="0.8" />
          </svg>

          {/* Micro-Particles ascending gently from palm to core */}
          {!reducedMotion &&
            energyParticles.map((p) => (
              <div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: `${p.startX}%`,
                  bottom: '28%',
                  width: '1.8px',
                  height: '1.8px',
                  borderRadius: '50%',
                  backgroundColor: p.isOrange ? '#f97316' : '#06b6d4',
                  boxShadow: `0 0 3px ${p.isOrange ? '#f97316' : '#06b6d4'}`,
                  animation: `particle-ascend ${p.duration}s infinite cubic-bezier(0.4, 0, 0.2, 1) ${p.delay}s`,
                  opacity: 0.75,
                  pointerEvents: 'none',
                }}
              />
            ))}

          {/* Single faint orbital ring — only visible on hover/proximity */}
          {!reducedMotion && (
            <svg
              viewBox="0 0 100 100"
              style={{
                position: 'absolute',
                inset: '-20%',
                width: '140%',
                height: '140%',
                pointerEvents: 'none',
                overflow: 'visible',
                opacity: coreHovered ? 0.55 : 0,
                transition: 'opacity 0.5s ease',
              }}
              aria-hidden="true"
            >
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#f97316"
                strokeWidth="0.6"
                strokeDasharray="3 7"
                className="spin-clockwise"
                style={{ transformOrigin: '50px 50px' }}
              />
            </svg>
          )}

          {/* Hover-only minimal label — positioned to the right of the core, never over it */}
          <div
            style={{
              position: 'absolute',
              left: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              marginLeft: '10px',
              pointerEvents: 'none',
              opacity: coreHovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
              whiteSpace: 'nowrap',
              zIndex: 4,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                background: isLight ? 'rgba(255,255,255,0.88)' : 'rgba(10,12,18,0.88)',
                border: '1px solid rgba(249,115,22,0.4)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <span style={{
                width: '4px', height: '4px', borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 4px #10b981',
              }} />
              <span style={{
                fontSize: '8px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.1em',
                color: 'var(--color-accent)',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                AI CORE · NEURAL ENGINE
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes idle-breathing {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 0.45;
          }
          50% {
            opacity: 0.85;
          }
        }

        @keyframes particle-ascend {
          0% {
            opacity: 0;
            transform: translate(0, 0);
          }
          25% {
            opacity: 0.85;
          }
          80% {
            opacity: 0.75;
          }
          100% {
            opacity: 0;
            transform: translate(0px, -24px);
          }
        }

        @keyframes spin-cw {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-ccw {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        .animate-idle-breathing {
          animation: idle-breathing 4.5s ease-in-out infinite;
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 3.2s ease-in-out infinite;
        }

        .spin-clockwise {
          animation: spin-cw 28s linear infinite;
          transform-origin: 50% 50%;
        }

        .spin-counter {
          animation: spin-ccw 22s linear infinite;
          transform-origin: 50% 50%;
        }
      `}</style>
    </div>
  )
}
