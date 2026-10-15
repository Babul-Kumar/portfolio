'use client'

import { useRef, useEffect, useSyncExternalStore } from 'react'

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

export type AmbientVariant =
  | 'architecture'
  | 'education'
  | 'learning'
  | 'verification'
  | 'network'
  | 'engineering'
  | 'communication'
  | 'minimal'

export type AccentMode = 'orange' | 'cyan' | 'dual'

interface AmbientSectionEnvironmentProps {
  variant: AmbientVariant
  intensity?: number // 0.1 to 1.0 (defaults by variant)
  accentMode?: AccentMode
  className?: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  baseAlpha: number
  pulsePhase: number
  layer: number
}

interface Edge {
  p1: number
  p2: number
  pulseProgress: number // 0 to 1
  pulseSpeed: number
  pulseActive: boolean
  color: string
}

export default function AmbientSectionEnvironment({
  variant,
  intensity = 0.5,
  accentMode = 'dual',
  className = '',
}: AmbientSectionEnvironmentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark' as const)
  const isLight = theme === 'light'

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    // 1. Accessibility check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animId: number
    let isVisible = false
    let width = 0
    let height = 0
    const mouse = { x: -1000, y: -1000, active: false }

    // Color definitions based on accentMode and active theme
    const orangeRgb = isLight ? '212, 72, 28' : '249, 115, 22' // terracotta in light mode, bright orange in dark
    const cyanRgb = isLight ? '13, 122, 112' : '6, 182, 212' // deep teal in light mode, cyan in dark

    function pickColor(isOrangePrefer = false): string {
      if (accentMode === 'orange') return orangeRgb
      if (accentMode === 'cyan') return cyanRgb
      return isOrangePrefer ? orangeRgb : cyanRgb
    }

    // Determine subtle particle count based on screen width & variant (toned down to prevent visual clutter)
    function getParticleCount(w: number): number {
      const isMobile = w < 640
      const isTablet = w >= 640 && w < 1024
      const base = 12
      if (isMobile) return 5
      if (isTablet) return 8
      return base
    }

    let particles: Particle[] = []
    let edges: Edge[] = []
    let scanLineY = 0

    function initScene() {
      if (!canvas) return
      const rect = container?.getBoundingClientRect()
      if (!rect) return
      width = rect.width
      height = rect.height

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx?.scale(dpr, dpr)

      const count = getParticleCount(width)
      particles = []
      edges = []

      // Generate subtle, minimal particles
      for (let i = 0; i < count; i++) {
        const isOrange = i % 3 === 0
        const color = pickColor(isOrange)
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.16 * intensity,
          vy: (Math.random() - 0.5) * 0.16 * intensity,
          radius: 0.7 + Math.random() * 0.6,
          color,
          baseAlpha: 0.03 + Math.random() * 0.06 * intensity,
          pulsePhase: Math.random() * Math.PI * 2,
          layer: 1,
        })
      }

      // Generate edges between nearest neighbors (sparse graph)
      const maxDistance = width < 640 ? 80 : 120
      for (let i = 0; i < particles.length; i++) {
        let connected = 0
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDistance && connected < 2) {
            edges.push({
              p1: i,
              p2: j,
              pulseProgress: Math.random(),
              pulseSpeed: 0.002 + Math.random() * 0.003,
              pulseActive: Math.random() > 0.5,
              color: particles[i].color,
            })
            connected++
          }
        }
      }
    }

    // Resize Observer for dynamic responsiveness
    const resizeObserver = new ResizeObserver(() => {
      initScene()
    })
    resizeObserver.observe(container)
    initScene()

    // 2. Mouse tracking for delicate cursor interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.active = true
    }

    const handleMouseLeave = () => {
      mouse.active = false
      mouse.x = -1000
      mouse.y = -1000
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    // 3. Intersection Observer — only animate when visible!
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible && !animId && !prefersReducedMotion) {
          animId = requestAnimationFrame(render)
        }
      },
      { threshold: 0.05, rootMargin: '100px 0px 100px 0px' }
    )
    intersectionObserver.observe(container)

    // Static fallback for reduced motion
    if (prefersReducedMotion) {
      renderStatic()
      return () => {
        resizeObserver.disconnect()
        intersectionObserver.disconnect()
        window.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseleave', handleMouseLeave)
      }
    }

    // Main animation loop
    function render() {
      if (!ctx || !isVisible) {
        animId = 0
        return
      }

      ctx.clearRect(0, 0, width, height)

      // A. Draw variant-specific ambient background elements
      drawVariantBackground(ctx, variant, width, height, intensity, orangeRgb, cyanRgb, scanLineY)
      scanLineY = (scanLineY + 0.4) % (height + 100)

      // B. Draw network edges and traveling packet pulses (soft and subtle)
      for (const edge of edges) {
        const p1 = particles[edge.p1]
        const p2 = particles[edge.p2]
        if (!p1 || !p2) continue

        const dx = p1.x - p2.x
        const dy = p1.y - p2.y
        const maxDist = width < 640 ? 80 : 120
        const distSq = dx * dx + dy * dy
        if (distSq > maxDist * maxDist) continue
        const dist = Math.sqrt(distSq)

        const edgeAlpha = (1 - dist / maxDist) * 0.035 * intensity
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = `rgba(${edge.color}, ${edgeAlpha})`
        ctx.lineWidth = 0.5
        ctx.stroke()

        // Traveling data packet pulse
        if (edge.pulseActive) {
          edge.pulseProgress += edge.pulseSpeed
          if (edge.pulseProgress > 1) {
            edge.pulseProgress = 0
            edge.pulseActive = Math.random() > 0.4
          }
          const px = p1.x + (p2.x - p1.x) * edge.pulseProgress
          const py = p1.y + (p2.y - p1.y) * edge.pulseProgress
          ctx.beginPath()
          ctx.arc(px, py, 1.0, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${edge.color}, ${0.25 * intensity})`
          ctx.fill()
        }
      }

      // C. Draw subtle particles
      const now = Date.now() * 0.001
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        // Wrap around bounds
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        // Gentle cursor interaction (max 120px influence)
        if (mouse.active) {
          const mdx = p.x - mouse.x
          const mdy = p.y - mouse.y
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
          if (mdist < 120 && mdist > 1) {
            const force = (1 - mdist / 120) * 0.4
            p.x += (mdx / mdist) * force
            p.y += (mdy / mdist) * force
          }
        }

        const pulse = Math.sin(now * 1.5 + p.pulsePhase) * 0.03
        const alpha = Math.max(0.02, p.baseAlpha + pulse)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`
        ctx.fill()
      }

      animId = requestAnimationFrame(render)
    }

    function renderStatic() {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'
      ctx.fillRect(0, 0, width, height)
    }

    return () => {
      cancelAnimationFrame(animId)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [variant, intensity, accentMode, isLight])

  return (
    <div
      ref={containerRef}
      className={`ambient-section-environment ambient-variant-${variant} ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  )
}

// --------------------------------------------------------------------------
// Variant-specific custom background geometry
// --------------------------------------------------------------------------
function drawVariantBackground(
  ctx: CanvasRenderingContext2D,
  variant: AmbientVariant,
  width: number,
  height: number,
  intensity: number,
  orangeRgb: string,
  cyanRgb: string,
  scanLineY: number
) {
  switch (variant) {
    case 'architecture': {
      // Slow horizontal scan line & subtle orthogonal bus lines
      const scanY = scanLineY % height
      const grad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30)
      grad.addColorStop(0, `rgba(${cyanRgb}, 0)`)
      grad.addColorStop(0.5, `rgba(${cyanRgb}, ${0.04 * intensity})`)
      grad.addColorStop(1, `rgba(${cyanRgb}, 0)`)
      ctx.fillStyle = grad
      ctx.fillRect(0, scanY - 30, width, 60)

      // 2 faint circuit horizontal lines
      ctx.strokeStyle = `rgba(${orangeRgb}, ${0.05 * intensity})`
      ctx.lineWidth = 0.5
      ctx.setLineDash([8, 16])
      ctx.beginPath()
      ctx.moveTo(0, height * 0.35)
      ctx.lineTo(width, height * 0.35)
      ctx.moveTo(0, height * 0.75)
      ctx.lineTo(width, height * 0.75)
      ctx.stroke()
      ctx.setLineDash([])
      break
    }

    case 'education': {
      // Subtle vertical data spine representing academic progression
      const spineX = width < 900 ? 32 : width * 0.2
      ctx.strokeStyle = `rgba(${orangeRgb}, ${0.07 * intensity})`
      ctx.lineWidth = 1
      ctx.setLineDash([4, 8])
      ctx.beginPath()
      ctx.moveTo(spineX, 0)
      ctx.lineTo(spineX, height)
      ctx.stroke()
      ctx.setLineDash([])

      // Small rising pulse dot along the spine
      const pulseY = height - (scanLineY % height)
      ctx.beginPath()
      ctx.arc(spineX, pulseY, 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${orangeRgb}, ${0.4 * intensity})`
      ctx.fill()
      break
    }

    case 'learning': {
      // Neural cluster concentric hints in the top right
      const cx = width * 0.85
      const cy = height * 0.3
      for (let r = 50; r <= 150; r += 50) {
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${cyanRgb}, ${(0.035 - r * 0.00015) * intensity})`
        ctx.lineWidth = 0.5
        ctx.setLineDash([4, 12])
        ctx.stroke()
      }
      ctx.setLineDash([])
      break
    }

    case 'verification': {
      // Abstract subtle verification shield/hexagon geometry & vertical scan line
      const scanY = scanLineY % height
      const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20)
      grad.addColorStop(0, `rgba(${cyanRgb}, 0)`)
      grad.addColorStop(0.5, `rgba(${cyanRgb}, ${0.035 * intensity})`)
      grad.addColorStop(1, `rgba(${cyanRgb}, 0)`)
      ctx.fillStyle = grad
      ctx.fillRect(0, scanY - 20, width, 40)

      // Verified node crosses in peripheral background
      ctx.strokeStyle = `rgba(${cyanRgb}, ${0.06 * intensity})`
      ctx.lineWidth = 0.75
      const crossPoints = [
        { x: width * 0.1, y: height * 0.25 },
        { x: width * 0.9, y: height * 0.3 },
        { x: width * 0.15, y: height * 0.75 },
        { x: width * 0.85, y: height * 0.8 },
      ]
      for (const pt of crossPoints) {
        ctx.beginPath()
        ctx.moveTo(pt.x - 4, pt.y)
        ctx.lineTo(pt.x + 4, pt.y)
        ctx.moveTo(pt.x, pt.y - 4)
        ctx.lineTo(pt.x, pt.y + 4)
        ctx.stroke()
      }
      break
    }

    case 'network': {
      // Faint constellation web connection in the upper-left
      ctx.strokeStyle = `rgba(${orangeRgb}, ${0.045 * intensity})`
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.arc(width * 0.15, height * 0.35, 120, 0, Math.PI * 0.7)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(width * 0.85, height * 0.65, 140, Math.PI, Math.PI * 1.6)
      ctx.stroke()
      break
    }

    case 'engineering': {
      // Computational bus lines & data stream corridors
      ctx.strokeStyle = `rgba(${cyanRgb}, ${0.05 * intensity})`
      ctx.lineWidth = 0.5
      ctx.setLineDash([12, 20])
      for (let y = height * 0.2; y <= height * 0.85; y += height * 0.2) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      ctx.setLineDash([])

      // Subtle gradient radial pool in center
      const radGrad = ctx.createRadialGradient(width * 0.5, height * 0.4, 20, width * 0.5, height * 0.4, 300)
      radGrad.addColorStop(0, `rgba(${orangeRgb}, ${0.03 * intensity})`)
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = radGrad
      ctx.fillRect(0, 0, width, height)
      break
    }

    case 'communication': {
      // Subtle signal wave arcs expanding from right toward left (toward the form)
      const originX = width < 900 ? width * 0.5 : width * 0.75
      const originY = height * 0.5
      const wavePhase = (Date.now() * 0.001) % 4
      for (let i = 0; i < 3; i++) {
        const radius = 60 + ((wavePhase + i * 1.3) % 4) * 80
        const waveAlpha = Math.max(0, (1 - radius / 380) * 0.06 * intensity)
        ctx.beginPath()
        ctx.arc(originX, originY, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${orangeRgb}, ${waveAlpha})`
        ctx.lineWidth = 0.75
        ctx.stroke()
      }
      break
    }

    case 'minimal': {
      // Minimal breathing gradient for idle footer
      const breathe = Math.sin(Date.now() * 0.001) * 0.02
      const grad = ctx.createRadialGradient(width * 0.5, height * 0.8, 10, width * 0.5, height * 0.8, width * 0.6)
      grad.addColorStop(0, `rgba(${cyanRgb}, ${Math.max(0.01, 0.03 * intensity + breathe)})`)
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
      break
    }
  }
}
