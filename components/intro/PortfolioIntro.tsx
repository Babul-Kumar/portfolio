'use client'

import React, { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react'

const FIRST_NAME = 'BABUL'
const LAST_NAME = 'KUMAR'

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

export default function PortfolioIntro() {
  const sessionSeen = useSyncExternalStore(subscribeNoop, getSessionSnapshot, () => false)
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false)

  const [isMounted, setIsMounted] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<'bk' | 'name' | 'particles' | 'atom' | 'dissolve' | 'complete'>('bk')

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const phaseRef = useRef<'bk' | 'name' | 'particles' | 'atom' | 'dissolve' | 'complete'>('bk')
  const completedRef = useRef(false)
  const isFadingOutRef = useRef(false)

  // Subtle pointer-driven 3D tilt (smooth lerp, desktop only)
  const targetTilt = useRef({ x: 0, y: 0 })
  const currentTilt = useRef({ x: 0, y: 0 })
  const isTouchRef = useRef(false)

  // Particles array for Phase 3 convergence
  const particlesRef = useRef<
    Array<{
      startX: number
      startY: number
      currentX: number
      currentY: number
      cpX: number
      cpY: number
      size: number
      color: string
      alpha: number
      delay: number
    }>
  >([])

  const completeIntro = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    phaseRef.current = 'complete'

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }

    try {
      sessionStorage.setItem('bk_intro_seen', 'true')
      document.documentElement.classList.remove('intro-active', 'intro-emerging')
      document.documentElement.classList.add('intro-seen')
      document.documentElement.setAttribute('data-intro-seen', 'true')
    } catch {}

    setIsMounted(false)
  }, [])

  const skipIntro = useCallback(() => {
    if (completedRef.current) return
    isFadingOutRef.current = true
    setIsFadingOut(true)
    try {
      document.documentElement.classList.add('intro-emerging')
    } catch {}
    setTimeout(() => {
      completeIntro()
    }, 280)
  }, [completeIntro])

  // Inactive Tab / Visibility Listener & Keyboard Escape Handler
  useEffect(() => {
    if (sessionSeen || reducedMotion) {
      completeIntro()
      return
    }

    try {
      document.documentElement.classList.add('intro-active')
      document.documentElement.classList.remove('intro-seen')
    } catch {}

    const handleVisibilityChange = () => {
      if (document.hidden && phaseRef.current !== 'complete') {
        skipIntro()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'R' || e.key === 'r' || e.key === 'I' || e.key === 'i') && e.shiftKey) {
        try {
          sessionStorage.removeItem('bk_intro_seen')
          window.location.search = '?replay=true'
        } catch {}
        return
      }

      if (e.key === 'Escape') {
        const activeEl = document.activeElement
        if (
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            (activeEl as HTMLElement).isContentEditable)
        ) {
          return
        }
        skipIntro()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [sessionSeen, reducedMotion, skipIntro, completeIntro])

  // Pointer move for subtle desktop tilt
  useEffect(() => {
    const checkTouch = () => {
      isTouchRef.current = window.matchMedia('(pointer: coarse)').matches
    }
    checkTouch()

    const onPointerMove = (e: PointerEvent) => {
      if (isTouchRef.current) return
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      targetTilt.current = {
        x: Math.max(-5, Math.min(5, nx * 5)),
        y: Math.max(-5, Math.min(5, -ny * 5)),
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  // Master Canvas & Timeline Loop
  useEffect(() => {
    if (!isMounted || sessionSeen || reducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    // Generate convergence particles for Phase 3
    const colors = ['#EA580C', '#FB923C', '#14B8A6', '#F59E0B', '#F5F6F8']
    const particles: typeof particlesRef.current = []
    const particleCount = 44
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
      const dist = 60 + Math.random() * 140
      const startX = Math.cos(angle) * dist * 1.6
      const startY = Math.sin(angle) * (dist * 0.45)
      // Curved control point for elegant vortex swirl
      const perpAngle = angle + (i % 2 === 0 ? 0.75 : -0.75)
      const cpDist = dist * 0.8
      const cpX = Math.cos(perpAngle) * cpDist
      const cpY = Math.sin(perpAngle) * cpDist

      particles.push({
        startX,
        startY,
        currentX: startX,
        currentY: startY,
        cpX,
        cpY,
        size: 1.2 + Math.random() * 1.8,
        color: colors[i % colors.length],
        alpha: 0.4 + Math.random() * 0.6,
        delay: Math.random() * 0.22,
      })
    }
    particlesRef.current = particles

    // Three atomic orbital plane parameters
    // Tilted angles in radians: -35 deg, +35 deg, +86 deg
    const orbits = [
      {
        theta: -0.61, // -35 deg
        startTime: 2.7,
        drawDuration: 0.65,
        period: 2.35, // orbital period in seconds
        electronColor: '#14B8A6',
        electronCore: '#5EEAD4',
        electronRadius: 3.2,
      },
      {
        theta: 0.61, // +35 deg
        startTime: 3.5,
        drawDuration: 0.65,
        period: 2.85,
        electronColor: '#EA580C',
        electronCore: '#FB923C',
        electronRadius: 3.0,
      },
      {
        theta: 1.5, // ~86 deg (near vertical)
        startTime: 4.3,
        drawDuration: 0.65,
        period: 3.25,
        electronColor: '#F59E0B',
        electronCore: '#FFFBEB',
        electronRadius: 3.0,
      },
    ]

    // Nucleus pulse waves on electron arrivals
    const pulses: Array<{ triggerTime: number; color: string }> = [
      { triggerTime: 2.7, color: 'rgba(20, 184, 166, 0.7)' },
      { triggerTime: 3.5, color: 'rgba(234, 88, 12, 0.7)' },
      { triggerTime: 4.3, color: 'rgba(245, 158, 11, 0.7)' },
    ]

    let hasTriggeredEmerge = false

    const render = (now: number) => {
      if (completedRef.current) return

      if (startTimeRef.current === null) {
        startTimeRef.current = now
      }
      const elapsed = (now - startTimeRef.current) / 1000 // elapsed in seconds

      // Timeline Phase updates
      if (elapsed < 0.8) {
        if (phaseRef.current !== 'bk') {
          phaseRef.current = 'bk'
          setCurrentPhase('bk')
        }
      } else if (elapsed < 1.9) {
        if (phaseRef.current !== 'name') {
          phaseRef.current = 'name'
          setCurrentPhase('name')
        }
      } else if (elapsed < 2.7) {
        if (phaseRef.current !== 'particles') {
          phaseRef.current = 'particles'
          setCurrentPhase('particles')
        }
      } else if (elapsed < 5.3) {
        if (phaseRef.current !== 'atom') {
          phaseRef.current = 'atom'
          setCurrentPhase('atom')
        }
      } else if (elapsed < 6.7) {
        if (phaseRef.current !== 'dissolve') {
          phaseRef.current = 'dissolve'
          setCurrentPhase('dissolve')
        }
      } else {
        completeIntro()
        return
      }

      // Progressively wake homepage background at 5.4s
      if (elapsed >= 5.4 && !hasTriggeredEmerge) {
        hasTriggeredEmerge = true
        try {
          document.documentElement.classList.add('intro-emerging')
        } catch {}
      }

      // Smooth cinematic crossfade of intro overlay at 6.1s into homepage
      if (elapsed >= 6.1 && !isFadingOutRef.current) {
        isFadingOutRef.current = true
        setIsFadingOut(true)
      }

      // Smooth pointer tilt interpolation
      currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * 0.06
      currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * 0.06

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      const centerX = width * 0.5
      const centerY = height * 0.5

      ctx.save()
      ctx.translate(centerX, centerY)

      // Apply subtle 3D perspective tilt
      // Simulate 3D rotation projection on 2D canvas
      const radX = (currentTilt.current.x * Math.PI) / 180
      const radY = (currentTilt.current.y * Math.PI) / 180
      ctx.transform(Math.cos(radX), Math.sin(radY) * 0.12, -Math.sin(radX) * 0.12, Math.cos(radY), 0, 0)

      // Radius scale based on screen size (clamp between 95px mobile and 160px desktop)
      const baseRadius = Math.max(95, Math.min(160, Math.min(width, height) * 0.22))
      const semiMajor = baseRadius
      const semiMinor = baseRadius * 0.38

      // Overall atom opacity for Phase 5 dissolve
      let atomMasterOpacity = 1.0
      if (elapsed >= 5.3) {
        const dissolveProgress = Math.min((elapsed - 5.3) / 1.4, 1.0)
        atomMasterOpacity = Math.max(0, 1.0 - dissolveProgress)
      }

      // =========================================================================
      // PHASE 3: PARTICLES CONVERGENCE (1.9s - 2.7s)
      // =========================================================================
      if (elapsed >= 1.9 && elapsed <= 2.8) {
        const partElapsed = elapsed - 1.9
        const rawT = Math.min(partElapsed / 0.75, 1.0)
        // Ease-in cubic for gravitational acceleration toward center
        const tConv = Math.pow(rawT, 1.8)

        particlesRef.current.forEach((p) => {
          if (partElapsed < p.delay) return
          const localT = Math.min((partElapsed - p.delay) / (0.75 - p.delay), 1.0)
          const easeT = Math.pow(localT, 2.2)

          // Quadratic Bezier interpolation from (startX, startY) through (cpX, cpY) to (0, 0)
          const oneMinusT = 1 - easeT
          p.currentX = oneMinusT * oneMinusT * p.startX + 2 * oneMinusT * easeT * p.cpX
          p.currentY = oneMinusT * oneMinusT * p.startY + 2 * oneMinusT * easeT * p.cpY

          const pAlpha = p.alpha * Math.sin(localT * Math.PI)
          if (pAlpha > 0.01) {
            ctx.save()
            ctx.globalAlpha = pAlpha
            ctx.fillStyle = p.color
            ctx.shadowColor = p.color
            ctx.shadowBlur = 6
            ctx.beginPath()
            ctx.arc(p.currentX, p.currentY, p.size * (1 - easeT * 0.4), 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
          }
        })
      }

      // =========================================================================
      // NUCLEUS RENDERING (Forms at 2.3s, holds through 5.3s, dissolves at 6.8s)
      // =========================================================================
      if (elapsed >= 2.3 && atomMasterOpacity > 0.01) {
        const nucleusGrowT = Math.min((elapsed - 2.3) / 0.45, 1.0)
        const nucleusScale = 0.3 + 0.7 * Math.sin(nucleusGrowT * (Math.PI / 2))
        const nAlpha = nucleusGrowT * atomMasterOpacity

        // Ambient gentle core breathing oscillation
        const breath = 1.0 + Math.sin(elapsed * 3.5) * 0.06

        ctx.save()
        ctx.globalAlpha = nAlpha

        // Outer soft glow
        const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 32 * nucleusScale * breath)
        outerGlow.addColorStop(0, 'rgba(234, 88, 12, 0.45)')
        outerGlow.addColorStop(0.4, 'rgba(20, 184, 166, 0.20)')
        outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = outerGlow
        ctx.beginPath()
        ctx.arc(0, 0, 32 * nucleusScale * breath, 0, Math.PI * 2)
        ctx.fill()

        // Inner luminous core
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 7 * nucleusScale)
        coreGrad.addColorStop(0, '#FFFFFF')
        coreGrad.addColorStop(0.45, '#FDBA74')
        coreGrad.addColorStop(0.85, '#EA580C')
        coreGrad.addColorStop(1, 'rgba(234, 88, 12, 0)')
        ctx.fillStyle = coreGrad
        ctx.beginPath()
        ctx.arc(0, 0, 7 * nucleusScale, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      }

      // =========================================================================
      // NUCLEUS PULSES ON ELECTRON ARRIVALS
      // =========================================================================
      pulses.forEach((pulse) => {
        if (elapsed >= pulse.triggerTime && elapsed <= pulse.triggerTime + 0.55 && atomMasterOpacity > 0.01) {
          const pT = (elapsed - pulse.triggerTime) / 0.55
          const ringRadius = 8 + pT * 42
          const ringAlpha = (1 - pT) * 0.65 * atomMasterOpacity

          ctx.save()
          ctx.globalAlpha = ringAlpha
          ctx.strokeStyle = pulse.color
          ctx.lineWidth = 1.5 * (1 - pT)
          ctx.beginPath()
          ctx.arc(0, 0, ringRadius, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()
        }
      })

      // =========================================================================
      // PHASE 4: THREE ELECTRONS & ORBITAL ELLIPSES (2.7s - 5.3s - 6.8s)
      // =========================================================================
      if (elapsed >= 2.65 && atomMasterOpacity > 0.01) {
        // Collect electron depth data to draw background/foreground Z-sorting
        const activeElectrons: Array<{
          x: number
          y: number
          z: number
          color: string
          core: string
          radius: number
          alpha: number
        }> = []

        orbits.forEach((orbit, idx) => {
          if (elapsed < orbit.startTime) return

          const orbitElapsed = elapsed - orbit.startTime
          const drawProgress = Math.min(orbitElapsed / orbit.drawDuration, 1.0)
          const orbitFadeIn = Math.min(orbitElapsed / 0.35, 1.0)
          const orbitOpacity = orbitFadeIn * atomMasterOpacity

          // 1. Draw Thin Elliptical Orbital Path
          ctx.save()
          ctx.rotate(orbit.theta)
          ctx.globalAlpha = orbitOpacity * 0.55
          ctx.lineWidth = 1.0
          ctx.strokeStyle = idx === 0 ? 'rgba(20, 184, 166, 0.45)' : idx === 1 ? 'rgba(234, 88, 12, 0.45)' : 'rgba(245, 158, 11, 0.45)'
          ctx.shadowColor = idx === 0 ? 'rgba(20, 184, 166, 0.3)' : 'rgba(234, 88, 12, 0.3)'
          ctx.shadowBlur = 4

          ctx.beginPath()
          // Animate drawing the ellipse arc from 0 to 2*PI * drawProgress
          const maxAngle = Math.PI * 2 * drawProgress
          const steps = 60
          for (let s = 0; s <= steps; s++) {
            const angle = (s / steps) * maxAngle
            const ex = semiMajor * Math.cos(angle)
            const ey = semiMinor * Math.sin(angle)
            if (s === 0) ctx.moveTo(ex, ey)
            else ctx.lineTo(ex, ey)
          }
          ctx.stroke()
          ctx.restore()

          // 2. Compute Continuous Electron Position
          // Continuous time-based angle ensures no reset when subsequent electrons join
          const omega = (Math.PI * 2) / orbit.period
          const phi = omega * orbitElapsed

          // Local ellipse coordinates
          const lx = semiMajor * Math.cos(phi)
          const ly = semiMinor * Math.sin(phi)
          const zDepth = Math.sin(phi) // > 0 = in front of nucleus, < 0 = behind nucleus

          // Global rotated 2D coordinates
          const gx = lx * Math.cos(orbit.theta) - ly * Math.sin(orbit.theta)
          const gy = lx * Math.sin(orbit.theta) + ly * Math.cos(orbit.theta)

          // Subtle electron fade-in upon appearance
          const electronFadeIn = Math.min(orbitElapsed / 0.25, 1.0)

          activeElectrons.push({
            x: gx,
            y: gy,
            z: zDepth,
            color: orbit.electronColor,
            core: orbit.electronCore,
            radius: orbit.electronRadius,
            alpha: electronFadeIn * atomMasterOpacity,
          })
        })

        // Draw electrons with depth lighting
        activeElectrons.forEach((el) => {
          ctx.save()
          // When passing behind nucleus (z < 0), slightly dimmer & smaller
          const depthScale = el.z > 0 ? 1.0 + el.z * 0.15 : 1.0 + el.z * 0.2
          const depthAlpha = el.alpha * (el.z > 0 ? 1.0 : 0.72)

          ctx.globalAlpha = depthAlpha
          ctx.shadowColor = el.color
          ctx.shadowBlur = 10

          // Luminous aura
          ctx.fillStyle = el.color
          ctx.beginPath()
          ctx.arc(el.x, el.y, el.radius * depthScale * 1.5, 0, Math.PI * 2)
          ctx.fill()

          // Brilliant core
          ctx.fillStyle = el.core
          ctx.beginPath()
          ctx.arc(el.x, el.y, el.radius * depthScale * 0.7, 0, Math.PI * 2)
          ctx.fill()

          ctx.restore()
        })
      }

      ctx.restore()

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', resize)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isMounted, sessionSeen, reducedMotion, completeIntro])

  if (sessionSeen || reducedMotion || !isMounted) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={`cinematic-intro-overlay ${isFadingOut ? 'fade-out' : ''}`}
      role="presentation"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#060709',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Background subtle technical grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px)',
          backgroundSize: '32px 32px, 96px 96px, 96px 96px',
          opacity: 0.85,
          pointerEvents: 'none',
        }}
      />

      {/* Ambient center radial glow */}
      <div
        style={{
          position: 'absolute',
          width: 'clamp(320px, 45vw, 600px)',
          height: 'clamp(320px, 45vw, 600px)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(234, 88, 12, 0.16) 0%, rgba(20, 184, 166, 0.08) 45%, transparent 72%)',
          pointerEvents: 'none',
          transform: 'translate3d(0, 0, 0)',
        }}
      />

      {/* HTML / SVG Typography Layer for Phase 1 (BK) and Phase 2 (BABUL KUMAR) */}
      <div
        className="intro-typography-stage"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* PHASE 1: BK Monogram (0.0s – 0.8s) */}
        <div className={`intro-bk-stage ${currentPhase === 'bk' ? 'active' : 'exited'}`}>
          <svg
            viewBox="0 0 160 100"
            width="clamp(110px, 14vw, 150px)"
            height="100%"
            fill="none"
            style={{ overflow: 'visible' }}
          >
            {/* B Strokes */}
            <path
              className="bk-stroke-b-spine"
              d="M14,10 L14,90"
              stroke="#F5F6F8"
              strokeWidth="6"
              strokeLinecap="round"
              pathLength={100}
            />
            <path
              className="bk-stroke-b-top"
              d="M14,10 C50,10 50,50 14,50"
              stroke="#F5F6F8"
              strokeWidth="6"
              strokeLinecap="round"
              pathLength={100}
            />
            <path
              className="bk-stroke-b-bot"
              d="M14,50 C56,50 56,90 14,90"
              stroke="#F5F6F8"
              strokeWidth="6"
              strokeLinecap="round"
              pathLength={100}
            />

            {/* K Strokes */}
            <path
              className="bk-stroke-k-spine"
              d="M88,10 L88,90"
              stroke="#EA580C"
              strokeWidth="6"
              strokeLinecap="round"
              pathLength={100}
            />
            <path
              className="bk-stroke-k-top"
              d="M88,50 L138,10"
              stroke="#EA580C"
              strokeWidth="6"
              strokeLinecap="round"
              pathLength={100}
            />
            <path
              className="bk-stroke-k-bot"
              d="M88,50 L138,90"
              stroke="#EA580C"
              strokeWidth="6"
              strokeLinecap="round"
              pathLength={100}
            />

            {/* Accent Slash */}
            <path
              className="bk-stroke-slash"
              d="M68,18 L76,82"
              stroke="#EA580C"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.8"
              pathLength={100}
            />
          </svg>
        </div>

        {/* PHASE 2: BABUL KUMAR Full Name Expansion (0.8s – 1.9s) */}
        <div className={`intro-name-stage ${currentPhase === 'name' ? 'active' : currentPhase === 'bk' ? 'pending' : 'dissolved'}`}>
          <h1
            style={{
              fontSize: 'clamp(28px, 4.2vw, 52px)',
              fontWeight: 800,
              letterSpacing: '0.12em',
              lineHeight: 1.1,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(10px, 1.8vw, 20px)',
              textShadow: '0 4px 28px rgba(0, 0, 0, 0.8)',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <span style={{ color: '#F5F6F8' }}>{FIRST_NAME}</span>
            <span style={{ color: '#EA580C' }}>{LAST_NAME}</span>
          </h1>
          <div
            style={{
              fontSize: 'clamp(10px, 1vw, 12px)',
              letterSpacing: '0.24em',
              color: '#94A3B8',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              marginTop: '10px',
              textAlign: 'center',
              opacity: 0.9,
            }}
          >
            AI / ML &bull; SOFTWARE ENGINEER
          </div>
        </div>
      </div>

      {/* HTML5 Canvas for Particles Convergence (Phase 3), Nucleus, and Orbits/Electrons (Phase 4 & 5) */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* Keyboard Accessible Skip Intro Link (Bottom Right) */}
      <button
        type="button"
        onClick={skipIntro}
        className="intro-skip-btn"
        aria-label="Skip introduction animation"
      >
        Skip intro &rarr;
      </button>

      {/* Scoped CSS Animations */}
      <style>{`
        .cinematic-intro-overlay {
          transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .cinematic-intro-overlay.fade-out {
          opacity: 0 !important;
          pointer-events: none !important;
        }

        /* Skip Intro Button */
        .intro-skip-btn {
          position: absolute;
          bottom: clamp(20px, 3.5vw, 36px);
          right: clamp(24px, 4vw, 44px);
          z-index: 100000;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
          padding: 8px 18px;
          color: rgba(255, 255, 255, 0.55);
          font-family: var(--font-mono, monospace);
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }
        .intro-skip-btn:hover {
          color: #EA580C;
          border-color: rgba(234, 88, 12, 0.4);
          background: rgba(234, 88, 12, 0.06);
          transform: translateX(2px);
        }
        .intro-skip-btn:focus-visible {
          outline: 2px solid #EA580C;
          outline-offset: 2px;
          color: #FFFFFF;
        }

        /* Stage 1: BK Monogram */
        .intro-bk-stage {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .intro-bk-stage.active {
          opacity: 1;
          transform: scale(1);
        }
        .intro-bk-stage.exited {
          opacity: 0;
          transform: scale(1.12);
          pointer-events: none;
        }

        /* Normalized 100% pathLength SVG stroke draws */
        .bk-stroke-b-spine {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawStroke 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.04s forwards;
        }
        .bk-stroke-b-top {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawStroke 0.42s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
        }
        .bk-stroke-b-bot {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawStroke 0.42s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards;
        }
        .bk-stroke-k-spine {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawStroke 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.12s forwards;
        }
        .bk-stroke-k-top {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawStroke 0.42s cubic-bezier(0.16, 1, 0.3, 1) 0.26s forwards;
        }
        .bk-stroke-k-bot {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawStroke 0.42s cubic-bezier(0.16, 1, 0.3, 1) 0.36s forwards;
        }
        .bk-stroke-slash {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawStroke 0.38s cubic-bezier(0.16, 1, 0.3, 1) 0.22s forwards;
        }

        @keyframes drawStroke {
          from { stroke-dashoffset: 100; }
          to   { stroke-dashoffset: 0; }
        }

        /* Stage 2: Name Expansion */
        .intro-name-stage {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .intro-name-stage.pending {
          opacity: 0;
          transform: scale(0.92) translate3d(0, 10px, 0);
          pointer-events: none;
        }
        .intro-name-stage.active {
          opacity: 1;
          transform: scale(1) translate3d(0, 0, 0);
        }
        .intro-name-stage.dissolved {
          opacity: 0;
          transform: scale(0.96);
          pointer-events: none;
        }

        /* Suppression Rules for Returning Visitors */
        html.intro-seen .cinematic-intro-overlay,
        html[data-intro-seen="true"] .cinematic-intro-overlay {
          display: none !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .cinematic-intro-overlay {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
