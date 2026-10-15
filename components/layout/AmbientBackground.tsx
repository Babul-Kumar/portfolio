'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'

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

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  baseRadius: number
  type: 'terracotta' | 'teal' | 'violet' | 'neutral'
  pulsePhase: number
  pulseSpeed: number
  flashIntensity: number
}

interface DataPacket {
  fromIndex: number
  toIndex: number
  progress: number // 0 to 1
  speed: number
  color: string
}

interface CursorRipple {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
}

export default function AmbientBackground() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark' as const)
  const isLight = theme === 'light'
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false)

  const spotlightRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const orbContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Track latest theme in ref for 60fps canvas loop without resetting particle state
  const isLightRef = useRef(isLight)
  useEffect(() => {
    isLightRef.current = isLight
  }, [isLight])

  // =========================================================================
  // Canvas Animated Constellation, Traveling Packets & Cyber Wave Engine
  // =========================================================================
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reducedMotion) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let rafId: number
    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    let mouseX = -9999
    let mouseY = -9999
    let lastMouseX = -9999
    let lastMouseY = -9999
    let time = 0

    const ripples: CursorRipple[] = []

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      // Emit subtle ripples when cursor travels enough distance
      const dist = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY)
      if (dist > 45 && ripples.length < 5) {
        ripples.push({
          x: mouseX,
          y: mouseY,
          radius: 4,
          maxRadius: 75,
          alpha: isLightRef.current ? 0.35 : 0.45,
        })
        lastMouseX = mouseX
        lastMouseY = mouseY
      }
    }

    const onMouseLeave = () => {
      mouseX = -9999
      mouseY = -9999
    }

    // Determine optimal particle density for visual depth
    const getTargetParticleCount = (w: number, h: number) => {
      if (w < 640) return 32
      if (w < 1024) return 50
      return Math.min(72, Math.max(52, Math.floor((w * h) / 24000)))
    }

    let particles: Particle[] = []
    let packets: DataPacket[] = []

    const initParticles = () => {
      const count = getTargetParticleCount(width, height)
      particles = []
      packets = []
      const types: Particle['type'][] = ['terracotta', 'teal', 'violet', 'neutral']

      for (let i = 0; i < count; i++) {
        const typeIndex = i % types.length
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.72,
          vy: (Math.random() - 0.5) * 0.72,
          baseRadius: 1.8 + Math.random() * 1.8,
          type: types[typeIndex],
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.025,
          flashIntensity: 0,
        })
      }
    }

    const resizeCanvas = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.scale(dpr, dpr)
      initParticles()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas, { passive: true })
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave, { passive: true })

    const MAX_LINE_DIST = 135
    const MOUSE_INFLUENCE_DIST = 160

    let isPaused = false
    const onVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true
        cancelAnimationFrame(rafId)
      } else {
        isPaused = false
        rafId = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const render = () => {
      if (isPaused) return
      time += 0.016

      ctx.clearRect(0, 0, width, height)
      const light = isLightRef.current

      const terracottaRGB = light ? '212, 72, 28' : '228, 93, 44'
      const tealRGB = light ? '13, 122, 112' : '20, 184, 166'
      const violetRGB = light ? '109, 40, 217' : '129, 140, 248'
      const neutralRGB = light ? '30, 27, 24' : '245, 246, 248'

      // =======================================================================
      // Layer A: Harmonic Cyber Streamlines (Continuously Undulating Wave Paths)
      // =======================================================================
      ctx.save()
      const waveAlpha = light ? 0.08 : 0.09
      
      // Top Streamline (Terracotta Amber)
      ctx.beginPath()
      const yBase1 = height * 0.28
      ctx.moveTo(0, yBase1)
      for (let x = 0; x <= width; x += 30) {
        const y = yBase1 + Math.sin(x * 0.0022 + time * 0.9) * 28 + Math.cos(x * 0.0014 + time * 0.6) * 16
        ctx.lineTo(x, y)
      }
      ctx.strokeStyle = `rgba(${terracottaRGB}, ${waveAlpha})`
      ctx.lineWidth = 1.2
      ctx.setLineDash([12, 18])
      ctx.lineDashOffset = -time * 30
      ctx.stroke()

      // Lower Streamline (Quantum Teal)
      ctx.beginPath()
      const yBase2 = height * 0.72
      ctx.moveTo(0, yBase2)
      for (let x = 0; x <= width; x += 30) {
        const y = yBase2 + Math.sin(x * 0.0028 - time * 0.8) * 32 + Math.cos(x * 0.0016 + time * 0.5) * 20
        ctx.lineTo(x, y)
      }
      ctx.strokeStyle = `rgba(${tealRGB}, ${waveAlpha})`
      ctx.lineWidth = 1.2
      ctx.setLineDash([14, 20])
      ctx.lineDashOffset = time * 26
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()

      // =======================================================================
      // Layer B: Cursor Energy Ripples
      // =======================================================================
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.radius += 1.8
        r.alpha *= 0.96

        if (r.alpha < 0.02 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${terracottaRGB}, ${r.alpha})`
        ctx.lineWidth = 1.2
        ctx.stroke()
      }

      // =======================================================================
      // Layer C: Particles Update & Cursor Repulsion
      // =======================================================================
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        // Wrap around viewport edges with soft padding
        if (p.x < -30) p.x = width + 30
        else if (p.x > width + 30) p.x = -30
        if (p.y < -30) p.y = height + 30
        else if (p.y > height + 30) p.y = -30

        // Gentle cursor repulsion for organic fluid feel
        const dx = p.x - mouseX
        const dy = p.y - mouseY
        const dist = Math.hypot(dx, dy)
        if (dist < MOUSE_INFLUENCE_DIST && dist > 1) {
          const force = (1 - dist / MOUSE_INFLUENCE_DIST) * 2.2
          p.x += (dx / dist) * force
          p.y += (dy / dist) * force
        }

        // Decay node flash intensity
        if (p.flashIntensity > 0) {
          p.flashIntensity *= 0.94
          if (p.flashIntensity < 0.01) p.flashIntensity = 0
        }

        p.pulsePhase += p.pulseSpeed
      }

      // =======================================================================
      // Layer D: Dynamic Inter-Node Constellation Lines
      // =======================================================================
      const activePairs: [number, number, string][] = []

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.hypot(dx, dy)

          if (dist < MAX_LINE_DIST) {
            const lineFactor = 1 - dist / MAX_LINE_DIST
            const lineAlpha = lineFactor * (light ? 0.32 : 0.24)

            let strokeColor = `rgba(${neutralRGB}, ${lineAlpha * 0.7})`
            let packetColor = terracottaRGB

            if (p1.type === 'terracotta' || p2.type === 'terracotta') {
              strokeColor = `rgba(${terracottaRGB}, ${lineAlpha})`
              packetColor = terracottaRGB
            } else if (p1.type === 'teal' || p2.type === 'teal') {
              strokeColor = `rgba(${tealRGB}, ${lineAlpha})`
              packetColor = tealRGB
            } else if (p1.type === 'violet' || p2.type === 'violet') {
              strokeColor = `rgba(${violetRGB}, ${lineAlpha})`
              packetColor = violetRGB
            }

            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = strokeColor
            ctx.lineWidth = light ? 0.85 : 0.95
            ctx.stroke()

            activePairs.push([i, j, packetColor])
          }
        }
      }

      // =======================================================================
      // Layer E: Traveling Glowing Data Packets (Active Neural Bus Pulses)
      // =======================================================================
      // Maintain 8-14 traveling photons along active connections
      const targetPacketCount = Math.min(14, Math.max(6, Math.floor(activePairs.length / 4)))
      while (packets.length < targetPacketCount && activePairs.length > 0) {
        const randomPair = activePairs[Math.floor(Math.random() * activePairs.length)]
        packets.push({
          fromIndex: randomPair[0],
          toIndex: randomPair[1],
          progress: 0,
          speed: 0.012 + Math.random() * 0.018,
          color: randomPair[2],
        })
      }

      for (let i = packets.length - 1; i >= 0; i--) {
        const pkt = packets[i]
        const p1 = particles[pkt.fromIndex]
        const p2 = particles[pkt.toIndex]

        if (!p1 || !p2) {
          packets.splice(i, 1)
          continue
        }

        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y)
        if (dist > MAX_LINE_DIST * 1.1) {
          packets.splice(i, 1)
          continue
        }

        pkt.progress += pkt.speed

        if (pkt.progress >= 1) {
          // Packet arrived: trigger subtle flash on target particle
          p2.flashIntensity = 1.0
          packets.splice(i, 1)
          continue
        }

        const curX = p1.x + (p2.x - p1.x) * pkt.progress
        const curY = p1.y + (p2.y - p1.y) * pkt.progress

        // Draw luminous traveling photon with tail
        ctx.beginPath()
        ctx.arc(curX, curY, light ? 2.0 : 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${pkt.color})`
        ctx.shadowColor = `rgba(${pkt.color}, ${light ? 0.6 : 0.9})`
        ctx.shadowBlur = light ? 6 : 10
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // =======================================================================
      // Layer F: Interactive Cursor Neural Filaments
      // =======================================================================
      if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          const dx = p.x - mouseX
          const dy = p.y - mouseY
          const dist = Math.hypot(dx, dy)

          if (dist < MOUSE_INFLUENCE_DIST) {
            const mFactor = 1 - dist / MOUSE_INFLUENCE_DIST
            const mAlpha = mFactor * (light ? 0.45 : 0.55)

            ctx.beginPath()
            ctx.moveTo(mouseX, mouseY)
            ctx.lineTo(p.x, p.y)
            ctx.strokeStyle = `rgba(${terracottaRGB}, ${mAlpha})`
            ctx.lineWidth = 1.1
            ctx.stroke()
          }
        }
      }

      // =======================================================================
      // Layer G: Individual Glowing Cyber Constellation Nodes
      // =======================================================================
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const pulse = 0.85 + Math.sin(p.pulsePhase) * 0.35
        const flash = p.flashIntensity * 1.6
        const r = (p.baseRadius + flash) * pulse

        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)

        if (p.type === 'terracotta') {
          ctx.fillStyle = light ? '#D4481C' : '#E45D2C'
          ctx.shadowColor = `rgba(${terracottaRGB}, ${light ? 0.45 : 0.75})`
          ctx.shadowBlur = light ? 5 : 9
        } else if (p.type === 'teal') {
          ctx.fillStyle = light ? '#0D7A70' : '#14B8A6'
          ctx.shadowColor = `rgba(${tealRGB}, ${light ? 0.45 : 0.75})`
          ctx.shadowBlur = light ? 5 : 9
        } else if (p.type === 'violet') {
          ctx.fillStyle = light ? '#6D28D9' : '#818CF8'
          ctx.shadowColor = `rgba(${violetRGB}, ${light ? 0.45 : 0.75})`
          ctx.shadowBlur = light ? 5 : 9
        } else {
          ctx.fillStyle = light ? 'rgba(30, 27, 24, 0.75)' : 'rgba(245, 246, 248, 0.8)'
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
        }

        ctx.fill()
      }

      ctx.shadowBlur = 0
      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [reducedMotion])

  // =========================================================================
  // Smooth Parallax on Cursor Spotlight & Architectural Grid
  // =========================================================================
  useEffect(() => {
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = '1'
    }

    if (reducedMotion) return

    let rafId: number
    let isRunning = false
    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let currentX = targetX
    let currentY = targetY

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
      if (!isRunning) {
        isRunning = true
        rafId = requestAnimationFrame(animate)
      }
    }

    const animate = () => {
      currentX += (targetX - currentX) * 0.08
      currentY += (targetY - currentY) * 0.08

      // 1. Move interactive cursor spotlight
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${(currentX - 300).toFixed(1)}px, ${(currentY - 300).toFixed(1)}px, 0)`
      }

      // 2. Subtle parallax on global blueprint grid & aurora orbs
      const normalizedX = (currentX / window.innerWidth - 0.5) * 2
      const normalizedY = (currentY / window.innerHeight - 0.5) * 2

      if (gridRef.current) {
        gridRef.current.style.transform = `translate3d(${(normalizedX * 6).toFixed(1)}px, ${(normalizedY * 6).toFixed(1)}px, 0)`
      }

      if (orbContainerRef.current) {
        orbContainerRef.current.style.transform = `translate3d(${(normalizedX * -10).toFixed(1)}px, ${(normalizedY * -10).toFixed(1)}px, 0)`
      }

      if (Math.abs(targetX - currentX) > 0.2 || Math.abs(targetY - currentY) > 0.2) {
        rafId = requestAnimationFrame(animate)
      } else {
        isRunning = false
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    isRunning = true
    rafId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [reducedMotion])

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
      {/* =========================================================================
          Layer 1: Continuous Precision Computational Blueprint Grid
          - 24px and 96px dual-scale architectural grid
          - Runs uninterrupted across the entire website from top to bottom
          - Subtle breathing cycle and smooth cursor parallax
          ========================================================================= */}
      <div
        ref={gridRef}
        className={!reducedMotion ? 'ambient-grid-pulse' : ''}
        style={{
          position: 'absolute',
          inset: '-20px',
          backgroundImage: isLight
            ? `
              linear-gradient(to right, rgba(18, 17, 16, 0.045) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(18, 17, 16, 0.045) 1px, transparent 1px),
              linear-gradient(to right, rgba(18, 17, 16, 0.085) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(18, 17, 16, 0.085) 1px, transparent 1px)
            `
            : `
              linear-gradient(to right, var(--color-border-subtle) 1px, transparent 1px),
              linear-gradient(to bottom, var(--color-border-subtle) 1px, transparent 1px),
              linear-gradient(to right, var(--color-border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)
            `,
          backgroundSize: '24px 24px, 24px 24px, 96px 96px, 96px 96px',
          opacity: isLight ? 0.95 : 0.70,
          willChange: 'transform',
        }}
      />

      {/* =========================================================================
          Layer 2: Multi-Sphere Fluid Aurora Glow Orbs
          - Positioned strategically to illuminate Hero, About, Skills, Radar & Footer
          - Slow, organic floating motion in 3D perspective
          ========================================================================= */}
      <div
        ref={orbContainerRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      >
        {/* Primary Warm Terracotta / Orange Glow (Hero & Top Narrative) */}
        <div
          className={!reducedMotion ? 'ambient-aurora-orb-orange' : ''}
          style={{
            position: 'absolute',
            top: '4%',
            right: '2%',
            width: 'clamp(440px, 52vw, 780px)',
            height: 'clamp(440px, 52vw, 780px)',
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle, rgba(234, 88, 12, 0.08) 0%, rgba(249, 115, 22, 0.03) 42%, transparent 72%)'
              : 'radial-gradient(circle, var(--color-accent-glow) 0%, var(--color-accent-bg) 38%, transparent 72%)',
            filter: isLight ? 'blur(80px)' : 'blur(55px)',
            opacity: isLight ? 0.95 : 0.88,
            willChange: 'transform',
          }}
        />

        {/* Secondary Quantum Cyan / Teal Glow (About & Technical Capabilities) */}
        <div
          className={!reducedMotion ? 'ambient-aurora-orb-teal' : ''}
          style={{
            position: 'absolute',
            top: '26%',
            left: '-6%',
            width: 'clamp(380px, 46vw, 680px)',
            height: 'clamp(380px, 46vw, 680px)',
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle, rgba(13, 122, 112, 0.07) 0%, rgba(20, 184, 166, 0.025) 45%, transparent 68%)'
              : 'radial-gradient(circle, var(--color-accent-teal-bg) 0%, transparent 68%)',
            filter: isLight ? 'blur(85px)' : 'blur(65px)',
            opacity: isLight ? 0.9 : 0.82,
            willChange: 'transform',
          }}
        />

        {/* Tertiary Deep Indigo / Violet Harmonizer (Modules & Case Studies) */}
        <div
          className={!reducedMotion ? 'ambient-aurora-orb-indigo' : ''}
          style={{
            position: 'absolute',
            top: '56%',
            right: '-4%',
            width: 'clamp(360px, 42vw, 640px)',
            height: 'clamp(360px, 42vw, 640px)',
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle, rgba(109, 40, 217, 0.045) 0%, transparent 68%)'
              : 'radial-gradient(circle, rgba(99, 102, 241, 0.09) 0%, rgba(139, 92, 246, 0.03) 55%, transparent 70%)',
            filter: isLight ? 'blur(90px)' : 'blur(80px)',
            opacity: isLight ? 0.85 : 0.78,
            willChange: 'transform',
          }}
        />

        {/* Quaternary Warm Hearth Accent (Bottom Page & Footer) */}
        <div
          className={!reducedMotion ? 'ambient-aurora-orb-hearth' : ''}
          style={{
            position: 'absolute',
            bottom: '4%',
            left: '10%',
            width: 'clamp(340px, 40vw, 600px)',
            height: 'clamp(340px, 40vw, 600px)',
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle, rgba(212, 72, 28, 0.06) 0%, transparent 66%)'
              : 'radial-gradient(circle, var(--color-accent-bg) 0%, transparent 66%)',
            filter: isLight ? 'blur(80px)' : 'blur(70px)',
            opacity: isLight ? 0.85 : 0.75,
            willChange: 'transform',
          }}
        />
      </div>

      {/* =========================================================================
          Layer 3: Dynamic High-Performance Cyber Constellation, Traveling Photons & Waves
          - Renders organic drifting particles, live traveling data packets, and stream waves
          - Reacts dynamically to user cursor proximity with elastic repulsion and ripples
          ========================================================================= */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 1,
        }}
      />

      {/* =========================================================================
          Layer 4: Interactive Cursor Reactive Spotlight (GPU Accelerated)
          - Follows user pointer with smooth spring lag
          ========================================================================= */}
      <div
        ref={spotlightRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: isLight
            ? 'radial-gradient(circle, rgba(212, 72, 28, 0.07) 0%, rgba(249, 115, 22, 0.02) 35%, transparent 70%)'
            : 'radial-gradient(circle, var(--color-accent-glow) 0%, rgba(249, 115, 22, 0.04) 30%, transparent 70%)',
          pointerEvents: 'none',
          willChange: 'transform',
          transform: 'translate3d(-9999px, -9999px, 0)',
          opacity: 0,
          transition: 'opacity 0.6s ease',
          zIndex: 2,
        }}
      />

      {/* Embedded High-Performance GPU Keyframes */}
      <style>{`
        @keyframes ambientAuroraFlowA {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate3d(-35px, 40px, 0) scale(1.08);
          }
          66% {
            transform: translate3d(20px, -25px, 0) scale(0.96);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes ambientAuroraFlowB {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate3d(45px, -30px, 0) scale(1.06);
          }
          66% {
            transform: translate3d(-20px, 35px, 0) scale(0.94);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes ambientAuroraFlowC {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(-30px, -35px, 0) scale(1.1);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes ambientGridBreathe {
          0%, 100% {
            opacity: 0.55;
          }
          50% {
            opacity: 0.82;
          }
        }

        .ambient-aurora-orb-orange {
          animation: ambientAuroraFlowA 24s ease-in-out infinite;
        }

        .ambient-aurora-orb-teal {
          animation: ambientAuroraFlowB 28s ease-in-out infinite;
        }

        .ambient-aurora-orb-indigo {
          animation: ambientAuroraFlowC 32s ease-in-out infinite;
        }

        .ambient-aurora-orb-hearth {
          animation: ambientAuroraFlowB 22s ease-in-out infinite reverse;
        }

        .ambient-grid-pulse {
          animation: ambientGridBreathe 12s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .ambient-aurora-orb-orange,
          .ambient-aurora-orb-teal,
          .ambient-aurora-orb-indigo,
          .ambient-aurora-orb-hearth,
          .ambient-grid-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
