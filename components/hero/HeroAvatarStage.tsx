'use client'

import { useRef, useEffect, useState, useSyncExternalStore, useCallback } from 'react'
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
  const avatarImageRef = useRef<HTMLDivElement>(null)
  const shadowRef = useRef<HTMLDivElement>(null)
  const scanBeamRef = useRef<HTMLDivElement>(null)

  const [isClickPulsing, setIsClickPulsing] = useState(false)
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Interactive Click / Tap Reaction
  const handleStageClick = useCallback(() => {
    if (reducedMotion) return
    setIsClickPulsing(true)
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current)
    clickTimeoutRef.current = setTimeout(() => {
      setIsClickPulsing(false)
    }, 950)
  }, [reducedMotion])

  // Direct 60FPS DOM physics loop: 3D Yaw/Pitch/Roll, Dynamic Shadow, and Dynamic Rim-Light tracking
  useEffect(() => {
    if (reducedMotion || !isVisible) return

    let animId: number
    let isRunning = false
    let currentX = 0
    let currentY = 0
    let currentRoll = 0
    let currentTransX = 0
    let currentTransY = 0

    const tick = () => {
      if (mouse.current && wrapperRef.current) {
        // Multi-axis 3D perspective calculation
        const targetX = mouse.current.x * 7.5 // max 7.5 deg yaw
        const targetY = mouse.current.y * -5.0 // max 5.0 deg pitch
        const targetRoll = mouse.current.x * -1.2 // subtle roll counter-balance
        const targetTransX = mouse.current.x * 14 // 14px lateral 3D pivot
        const targetTransY = mouse.current.y * 7 // 7px vertical shift

        // Smooth spring interpolation
        currentX += (targetX - currentX) * 0.08
        currentY += (targetY - currentY) * 0.08
        currentRoll += (targetRoll - currentRoll) * 0.08
        currentTransX += (targetTransX - currentTransX) * 0.08
        currentTransY += (targetTransY - currentTransY) * 0.08

        // 1. Transform the 3D perspective container
        wrapperRef.current.style.transform = `translate3d(${currentTransX.toFixed(2)}px, ${currentTransY.toFixed(2)}px, 0) rotateY(${currentX.toFixed(2)}deg) rotateX(${currentY.toFixed(2)}deg) rotateZ(${currentRoll.toFixed(2)}deg)`

        // 2. Dynamic Rim Light Direction Shift based on cursor position
        if (avatarImageRef.current) {
          if (isLight) {
            avatarImageRef.current.style.filter = `drop-shadow(${(-currentX * 1.5).toFixed(1)}px 10px 24px rgba(15, 23, 42, 0.14)) contrast(1.02)`
          } else {
            const leftAlpha = (0.12 + Math.max(0, -currentX * 0.025)).toFixed(3)
            const rightAlpha = (0.14 + Math.max(0, currentX * 0.025)).toFixed(3)
            avatarImageRef.current.style.filter = `drop-shadow(${(-currentX * 1.8 - 3).toFixed(1)}px 0 14px rgba(249, 115, 22, ${leftAlpha})) drop-shadow(${(currentX * 1.8 + 3).toFixed(1)}px 0 14px rgba(6, 182, 212, ${rightAlpha})) drop-shadow(0 14px 26px rgba(0, 0, 0, 0.58))`
          }
        }

        // 3. Keep animating while motion delta is perceptible
        const delta =
          Math.abs(targetX - currentX) +
          Math.abs(targetY - currentY) +
          Math.abs(targetTransX - currentTransX)
        if (delta > 0.02) {
          animId = requestAnimationFrame(tick)
        } else {
          isRunning = false
        }
      } else {
        isRunning = false
      }
    }

    const onMove = () => {
      if (!isRunning) {
        isRunning = true
        animId = requestAnimationFrame(tick)
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    onMove()

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(animId)
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current)
    }
  }, [mouse, reducedMotion, isVisible, isLight])

  return (
    <div
      ref={containerRef}
      onClick={handleStageClick}
      className={`hero-avatar-stage group cursor-pointer ${isClickPulsing ? 'stage-pulsing' : ''}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        perspective: '1200px',
        userSelect: 'none',
        pointerEvents: 'auto',
        contain: 'layout',
        overflow: 'visible',
      }}
      aria-label="Interactive 3D Avatar of Babul Kumar — Click to trigger holographic pulse"
      title="Click avatar for holographic scan pulse"
    >
      {/* Background AI Environment: Minimal ambient nodes in peripheral space */}
      <HeroAIEnvironment
        mouse={mouse}
        isLight={isLight}
        reducedMotion={reducedMotion}
      />

      {/* Dynamic 3D Parallax & Breathing Layer */}
      <div
        ref={wrapperRef}
        className={`avatar-perspective-wrapper ${!reducedMotion ? 'animate-avatar-motion' : ''}`}
        style={{
          position: 'relative',
          height: '100%',
          maxHeight: '100%',
          maxWidth: '100%',
          aspectRatio: '457 / 1200',
          transform: 'none',
          transformStyle: 'preserve-3d',
          transition: isClickPulsing ? 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.12s cubic-bezier(0.2, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        {/* =========================================================================
            1. Atmosphere & Backlight Aura (Deep 3D plane)
            ========================================================================= */}
        <div
          className={`avatar-backlight-aura ${!reducedMotion ? 'animate-aura-pulse' : ''}`}
          style={{
            position: 'absolute',
            top: '32%',
            left: '50%',
            transform: 'translate(-50%, -25%) translateZ(-40px)',
            width: '135%',
            height: '78%',
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle at 50% 35%, rgba(2, 132, 199, 0.08) 0%, rgba(234, 88, 12, 0.06) 45%, transparent 70%)'
              : 'radial-gradient(circle at 50% 35%, rgba(249, 115, 22, 0.18) 0%, rgba(6, 182, 212, 0.12) 45%, transparent 70%)',
            filter: 'blur(45px)',
            pointerEvents: 'none',
            zIndex: 1,
            transition: 'opacity 0.4s ease',
          }}
          aria-hidden="true"
        />

        {/* =========================================================================
            2. Holographic Floor Marker & Precision Dynamic Contact Shadows
            - Directly aligned to Babul's shoes (X=142 and X=366 in 457-wide coordinate space)
            - Shadow dynamically scales and softens when avatar floats upwards
            ========================================================================= */}
        <div
          ref={shadowRef}
          className={`avatar-floor-shadow ${!reducedMotion ? 'animate-shadow-scale' : ''}`}
          style={{
            position: 'absolute',
            bottom: '-18px',
            left: '50%',
            transform: 'translateX(-50%) rotateX(75deg) translateZ(-15px)',
            width: '100%',
            height: '52px',
            pointerEvents: 'none',
            zIndex: 1,
            transformOrigin: 'center center',
          }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 457 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Outer Cyan Dashed Ring */}
            <ellipse
              cx="254"
              cy="50"
              rx="220"
              ry="36"
              fill="none"
              stroke={isLight ? 'rgba(2, 132, 199, 0.28)' : 'rgba(6, 182, 212, 0.32)'}
              strokeWidth="1.2"
              strokeDasharray="6 8"
              className={!reducedMotion ? 'spin-clockwise' : ''}
            />

            {/* Inner Orange Accent Arc */}
            <ellipse
              cx="254"
              cy="50"
              rx="160"
              ry="26"
              fill="none"
              stroke={isLight ? 'rgba(234, 88, 12, 0.22)' : 'rgba(249, 115, 22, 0.26)'}
              strokeWidth="1.0"
              strokeDasharray="14 10"
              className={!reducedMotion ? 'spin-counter' : ''}
            />

            {/* Soft Ambient Ground Shadow between and around shoes */}
            <ellipse
              cx="254"
              cy="53"
              rx="140"
              ry="12"
              fill={isLight ? 'rgba(15, 23, 42, 0.16)' : 'rgba(0, 0, 0, 0.48)'}
              filter="blur(6px)"
            />

            {/* Precise Contact Shadow under Left Shoe (cx: 142) */}
            <ellipse
              cx="142"
              cy="52"
              rx="28"
              ry="9"
              fill={isLight ? 'rgba(15, 23, 42, 0.32)' : 'rgba(0, 0, 0, 0.78)'}
              filter="blur(3.5px)"
            />

            {/* Precise Contact Shadow under Right Shoe (cx: 366) */}
            <ellipse
              cx="366"
              cy="52"
              rx="26"
              ry="9"
              fill={isLight ? 'rgba(15, 23, 42, 0.32)' : 'rgba(0, 0, 0, 0.78)'}
              filter="blur(3.5px)"
            />
          </svg>
        </div>

        {/* =========================================================================
            3. Interactive Holographic Scanner Laser Beam (Activates on Click/Tap)
            ========================================================================= */}
        <div
          ref={scanBeamRef}
          className={`hologram-scan-beam ${isClickPulsing ? 'active' : ''}`}
          style={{
            position: 'absolute',
            left: '-10%',
            right: '-10%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.95), rgba(249, 115, 22, 0.95), transparent)',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.8), 0 0 32px rgba(249, 115, 22, 0.6)',
            pointerEvents: 'none',
            zIndex: 4,
            opacity: 0,
            transform: 'translateZ(30px)',
          }}
          aria-hidden="true"
        />

        {/* =========================================================================
            4. Large Full-Body 3D AI Engineer Avatar
            - Dynamic multi-layer breathing and floating
            - Reactive dynamic rim-lighting
            ========================================================================= */}
        <div
          ref={avatarImageRef}
          className={`avatar-image-container ${isClickPulsing ? 'avatar-click-spring' : ''}`}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            zIndex: 3,
            transform: 'translateZ(25px)',
            transformOrigin: 'bottom center',
            transition: 'filter 0.15s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            pointerEvents: 'none',
          }}
        >
          <Image
            src="/images/babul_avatar_cutout.webp"
            alt="Babul Kumar — Full Body 3D AI Engineer Avatar"
            fill
            sizes="(max-width: 640px) 85vw, (max-width: 1080px) 45vw, 460px"
            priority
            style={{
              objectFit: 'contain',
              objectPosition: 'bottom center',
            }}
          />
        </div>
      </div>

      <style>{`
        /* Continuous organic 3D float & breathing cycle */
        @keyframes avatar-float-breathe {
          0%, 100% {
            transform: translateY(0px) scale(1) rotateZ(0deg);
          }
          25% {
            transform: translateY(-4px) scale(1.006) rotateZ(-0.25deg);
          }
          50% {
            transform: translateY(-8px) scale(1.014) rotateZ(0deg);
          }
          75% {
            transform: translateY(-4px) scale(1.008) rotateZ(0.25deg);
          }
        }

        /* Shadow expansion and softening synced to floating */
        @keyframes shadow-breath-scale {
          0%, 100% {
            transform: translateX(-50%) rotateX(75deg) translateZ(-15px) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateX(-50%) rotateX(75deg) translateZ(-15px) scale(0.92);
            opacity: 0.72;
          }
        }

        /* Backlight aura breathing pulse */
        @keyframes aura-breath-pulse {
          0%, 100% {
            transform: translate(-50%, -25%) translateZ(-40px) scale(1);
            opacity: 0.85;
          }
          50% {
            transform: translate(-50%, -25%) translateZ(-40px) scale(1.08);
            opacity: 1;
          }
        }

        /* Click holographic scan wave */
        @keyframes scanBeamPass {
          0% {
            top: 100%;
            opacity: 0;
            transform: translateZ(30px);
          }
          15% {
            opacity: 1;
            transform: translateZ(30px);
          }
          85% {
            opacity: 0.9;
            transform: translateZ(30px);
          }
          100% {
            top: 0%;
            opacity: 0;
            transform: translateZ(30px);
          }
        }

        @keyframes clickSpringFeedback {
          0% {
            transform: translateZ(25px) scale(1);
          }
          20% {
            transform: translateZ(25px) scale(0.98) translateY(3px);
          }
          55% {
            transform: translateZ(25px) scale(1.025) translateY(-5px);
          }
          100% {
            transform: translateZ(25px) scale(1) translateY(0);
          }
        }

        .animate-avatar-motion {
          animation: avatar-float-breathe 5.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }

        .animate-shadow-scale {
          animation: shadow-breath-scale 5.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }

        .animate-aura-pulse {
          animation: aura-breath-pulse 5.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }

        .hologram-scan-beam.active {
          animation: scanBeamPass 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .avatar-click-spring {
          animation: clickSpringFeedback 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
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

        .spin-clockwise {
          animation: spin-cw 26s linear infinite;
          transform-origin: 50% 50%;
        }

        .spin-counter {
          animation: spin-ccw 19s linear infinite;
          transform-origin: 50% 50%;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-avatar-motion,
          .animate-shadow-scale,
          .animate-aura-pulse,
          .hologram-scan-beam.active,
          .avatar-click-spring {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}

