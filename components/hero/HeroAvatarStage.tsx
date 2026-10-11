'use client'

import { useRef, useEffect, useSyncExternalStore } from 'react'
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

  // Smooth mouse tilt via direct DOM transform (zero React re-renders)
  useEffect(() => {
    if (reducedMotion || !isVisible) return

    let animId: number
    let isRunning = false
    let currentX = 0
    let currentY = 0

    const tick = () => {
      if (mouse.current && wrapperRef.current) {
        const targetX = mouse.current.x * 4 // max 4 deg yaw
        const targetY = mouse.current.y * -3 // max 3 deg pitch

        currentX += (targetX - currentX) * 0.08
        currentY += (targetY - currentY) * 0.08

        wrapperRef.current.style.transform = `rotateY(${currentX.toFixed(2)}deg) rotateX(${currentY.toFixed(2)}deg)`

        if (Math.abs(targetX - currentX) > 0.02 || Math.abs(targetY - currentY) > 0.02) {
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
    }
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
        alignItems: 'flex-end',
        justifyContent: 'center',
        perspective: '1200px',
        userSelect: 'none',
        pointerEvents: 'auto',
        contain: 'layout',
        overflow: 'visible',
      }}
      aria-label="Full-Body 3D AI Engineer Avatar of Babul Kumar"
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
        className={`avatar-perspective-wrapper ${!reducedMotion ? 'animate-idle-breathing' : ''}`}
        style={{
          position: 'relative',
          height: '100%',
          maxHeight: '100%',
          maxWidth: '100%',
          aspectRatio: '457 / 1200',
          transform: 'none',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s cubic-bezier(0.2, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        {/* =========================================================================
            1. Atmosphere & Backlight Aura (Centered behind Babul)
            ========================================================================= */}
        <div
          style={{
            position: 'absolute',
            top: '32%',
            left: '50%',
            transform: 'translate(-50%, -25%)',
            width: '130%',
            height: '75%',
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle at 50% 35%, rgba(2, 132, 199, 0.06) 0%, rgba(234, 88, 12, 0.05) 45%, transparent 70%)'
              : 'radial-gradient(circle at 50% 35%, rgba(249, 115, 22, 0.14) 0%, rgba(6, 182, 212, 0.10) 45%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          aria-hidden="true"
        />

        {/* =========================================================================
            2. Holographic Floor Marker & Precision Contact Shadows
            - Directly aligned to Babul's shoes (X=142 and X=366 in 457-wide coordinate space)
            - Soft ambient occlusion grounded between feet
            ========================================================================= */}
        <div
          style={{
            position: 'absolute',
            bottom: '0px',
            left: '50%',
            transform: 'translateX(-50%) rotateX(78deg)',
            width: '100%',
            height: '50px',
            pointerEvents: 'none',
            zIndex: 1,
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
              stroke={isLight ? 'rgba(2, 132, 199, 0.22)' : 'rgba(6, 182, 212, 0.24)'}
              strokeWidth="1"
              strokeDasharray="5 8"
              className={!reducedMotion ? 'spin-clockwise' : ''}
            />

            {/* Inner Orange Accent Arc */}
            <ellipse
              cx="254"
              cy="50"
              rx="160"
              ry="26"
              fill="none"
              stroke={isLight ? 'rgba(234, 88, 12, 0.16)' : 'rgba(249, 115, 22, 0.18)'}
              strokeWidth="0.8"
              strokeDasharray="12 12"
              className={!reducedMotion ? 'spin-counter' : ''}
            />

            {/* Soft Ambient Ground Shadow between and around shoes */}
            <ellipse
              cx="254"
              cy="53"
              rx="140"
              ry="12"
              fill={isLight ? 'rgba(15, 23, 42, 0.14)' : 'rgba(0, 0, 0, 0.42)'}
              filter="blur(6px)"
            />

            {/* Precise Contact Shadow under Left Shoe (cx: 142) */}
            <ellipse
              cx="142"
              cy="52"
              rx="28"
              ry="9"
              fill={isLight ? 'rgba(15, 23, 42, 0.28)' : 'rgba(0, 0, 0, 0.7)'}
              filter="blur(3.5px)"
            />

            {/* Precise Contact Shadow under Right Shoe (cx: 366) */}
            <ellipse
              cx="366"
              cy="52"
              rx="26"
              ry="9"
              fill={isLight ? 'rgba(15, 23, 42, 0.28)' : 'rgba(0, 0, 0, 0.7)'}
              filter="blur(3.5px)"
            />
          </svg>
        </div>

        {/* =========================================================================
            3. Large Full-Body 3D AI Engineer Avatar
            - Pristine developer portrait
            - Relaxed, confident standing posture with empty hands
            - Headroom intact (37px top clear), shoes cleanly grounded
            - Subtle dual rim-lighting (warm terracotta & cool teal)
            ========================================================================= */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            zIndex: 3,
            filter: isLight
              ? 'drop-shadow(0 10px 24px rgba(15, 23, 42, 0.12)) contrast(1.02)'
              : 'drop-shadow(-3px 0 12px rgba(249, 115, 22, 0.12)) drop-shadow(3px 0 12px rgba(6, 182, 212, 0.14)) drop-shadow(0 12px 24px rgba(0, 0, 0, 0.55))',
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
        @keyframes idle-breathing {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
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

        .spin-clockwise {
          animation: spin-cw 28s linear infinite;
          transform-origin: 50% 50%;
        }

        .spin-counter {
          animation: spin-ccw 22s linear infinite;
          transform-origin: 50% 50%;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-idle-breathing {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
