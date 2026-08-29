'use client'

import { useEffect, useRef } from 'react'

// 22 Deterministic Ambient Cyber Particles
const AMBIENT_PARTICLES = [
  { id: 1, left: '8%', top: '15%', size: 2.5, color: '#E45D2C', delay: '0s', duration: '16s' },
  { id: 2, left: '22%', top: '35%', size: 2.0, color: '#14B8A6', delay: '2.5s', duration: '19s' },
  { id: 3, left: '38%', top: '20%', size: 3.0, color: '#E45D2C', delay: '1s', duration: '14s' },
  { id: 4, left: '52%', top: '45%', size: 2.0, color: '#38BDF8', delay: '3.5s', duration: '22s' },
  { id: 5, left: '68%', top: '25%', size: 2.5, color: '#E45D2C', delay: '4s', duration: '17s' },
  { id: 6, left: '84%', top: '18%', size: 2.0, color: '#14B8A6', delay: '1.5s', duration: '15s' },
  { id: 7, left: '92%', top: '40%', size: 2.5, color: '#E45D2C', delay: '5s', duration: '20s' },
  { id: 8, left: '15%', top: '65%', size: 2.0, color: '#38BDF8', delay: '2s', duration: '18s' },
  { id: 9, left: '30%', top: '80%', size: 3.0, color: '#E45D2C', delay: '0.5s', duration: '16s' },
  { id: 10, left: '48%', top: '70%', size: 2.0, color: '#14B8A6', delay: '3s', duration: '21s' },
  { id: 11, left: '62%', top: '85%', size: 2.5, color: '#E45D2C', delay: '4.5s', duration: '19s' },
  { id: 12, left: '78%', top: '62%', size: 2.0, color: '#38BDF8', delay: '1.2s', duration: '15s' },
  { id: 13, left: '88%', top: '78%', size: 2.5, color: '#E45D2C', delay: '3.8s', duration: '17s' },
  { id: 14, left: '5%', top: '90%', size: 2.0, color: '#14B8A6', delay: '2.2s', duration: '23s' },
  { id: 15, left: '42%', top: '10%', size: 2.5, color: '#E45D2C', delay: '0.8s', duration: '18s' },
  { id: 16, left: '75%', top: '8%', size: 2.0, color: '#38BDF8', delay: '2.8s', duration: '14s' },
  { id: 17, left: '25%', top: '55%', size: 2.5, color: '#E45D2C', delay: '1.8s', duration: '20s' },
  { id: 18, left: '70%', top: '50%', size: 2.0, color: '#14B8A6', delay: '4.2s', duration: '16s' },
  { id: 19, left: '12%', top: '42%', size: 3.0, color: '#E45D2C', delay: '3.1s', duration: '17s' },
  { id: 20, left: '58%', top: '60%', size: 2.0, color: '#38BDF8', delay: '0.2s', duration: '19s' },
  { id: 21, left: '80%', top: '32%', size: 2.5, color: '#E45D2C', delay: '2.4s', duration: '15s' },
  { id: 22, left: '35%', top: '92%', size: 2.0, color: '#14B8A6', delay: '4.8s', duration: '21s' },
]

export default function AmbientBackground() {
  const spotlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = '1'
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    let rafId: number
    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let currentX = targetX
    let currentY = targetY

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
    }

    const animateSpotlight = () => {
      // Smooth linear interpolation for buttery cursor following
      currentX += (targetX - currentX) * 0.08
      currentY += (targetY - currentY) * 0.08

      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(650px circle at ${currentX.toFixed(
          1
        )}px ${currentY.toFixed(1)}px, rgba(228, 93, 44, 0.07), transparent 70%)`
      }

      rafId = requestAnimationFrame(animateSpotlight)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    rafId = requestAnimationFrame(animateSpotlight)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* 1. Subtle Precision Computational Blueprint Grid */}
      <div
        className="ambient-grid-pulse"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(228, 93, 44, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(228, 93, 44, 0.035) 1px, transparent 1px),
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
          `,
          backgroundSize: '28px 28px, 28px 28px, 140px 140px, 140px 140px',
          opacity: 0.75,
        }}
      />

      {/* 2. Ambient Drifting Nebular Glow: Primary Amber / Cyber Orange */}
      <div
        className="ambient-nebula-orange"
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: 'clamp(380px, 50vw, 700px)',
          height: 'clamp(380px, 50vw, 700px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(228, 93, 44, 0.12) 0%, rgba(228, 93, 44, 0.03) 45%, transparent 70%)',
          filter: 'blur(70px)',
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}
      />

      {/* 3. Ambient Drifting Nebular Glow: Secondary Teal / Cyan */}
      <div
        className="ambient-nebula-teal"
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '-8%',
          width: 'clamp(340px, 45vw, 620px)',
          height: 'clamp(340px, 45vw, 620px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.09) 0%, rgba(56, 189, 248, 0.025) 45%, transparent 70%)',
          filter: 'blur(75px)',
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}
      />

      {/* 4. Interactive Cursor Reactive Spotlight */}
      <div
        ref={spotlightRef}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: 'none',
        }}
      />

      {/* 5. Sweeping Cyber Terminal Beam */}
      <div className="ambient-scanline" />

      {/* 6. Floating Cyber Data Particles */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {AMBIENT_PARTICLES.map((p) => (
          <span
            key={p.id}
            className="ambient-particle"
            style={{
              position: 'absolute',
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}, 0 0 16px ${p.color}88`,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Embedded High-Performance GPU Keyframes */}
      <style>{`
        @keyframes ambientNebulaDriftA {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(-30px, 45px, 0) scale(1.1);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes ambientNebulaDriftB {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(40px, -35px, 0) scale(1.08);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes ambientGridBreathe {
          0%, 100% {
            opacity: 0.65;
          }
          50% {
            opacity: 0.9;
          }
        }

        @keyframes ambientScanSweep {
          0% {
            top: -5%;
            opacity: 0;
          }
          15% {
            opacity: 0.35;
          }
          85% {
            opacity: 0.35;
          }
          100% {
            top: 105%;
            opacity: 0;
          }
        }

        @keyframes ambientParticleFloat {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0.15;
          }
          50% {
            transform: translate3d(15px, -35px, 0);
            opacity: 0.85;
          }
          100% {
            transform: translate3d(0, -70px, 0);
            opacity: 0.15;
          }
        }

        .ambient-nebula-orange {
          animation: ambientNebulaDriftA 22s ease-in-out infinite;
        }

        .ambient-nebula-teal {
          animation: ambientNebulaDriftB 26s ease-in-out infinite;
        }

        .ambient-grid-pulse {
          animation: ambientGridBreathe 8s ease-in-out infinite;
        }

        .ambient-scanline {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, rgba(228, 93, 44, 0.45) 50%, transparent 100%);
          box-shadow: 0 0 14px rgba(228, 93, 44, 0.5);
          animation: ambientScanSweep 14s linear infinite;
          pointer-events: none;
        }

        .ambient-particle {
          animation: ambientParticleFloat ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .ambient-nebula-orange,
          .ambient-nebula-teal,
          .ambient-grid-pulse,
          .ambient-scanline,
          .ambient-particle {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
