'use client'

import { useRef, useEffect } from 'react'

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

interface TelemetryLabel {
  text: string
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  color: string
}

// Telemetry words per variant
const VARIANT_LABELS: Record<AmbientVariant, string[]> = {
  architecture: ['GRAPH_V3', 'MICRO_KERNEL', 'AST_DISPATCH', 'EVENT_BUS', 'LATENCY_9MS'],
  education: ['d/dx f(x)', '∑ (w·x + b)', '∇L(θ)', 'λ_REG', 'MATRIX_T', 'CONV_2D'],
  learning: ['LEARNING', 'MODEL', 'DATASET', 'PYTORCH', 'ATTENTION', 'TENSOR', 'EPOCH_42'],
  verification: ['SHA_256', 'VERIFIED', 'CREDENTIAL', 'ACCREDITED', 'SIG_VALID', 'INDEXED'],
  network: ['COLLABORATION', 'CONSENSUS', 'HACKATHON', 'PEER_SYNC', 'AGENT_SWARM', 'DISTRIBUTED'],
  engineering: ['BUILD', 'DEPLOY', 'INFERENCE', 'API_V2', 'VECTOR_EMBED', 'PIPELINE', 'REDIS_CACHE'],
  communication: ['SIGNAL_OK', 'CARRIER_ACTIVE', 'TLS_1.3', 'WEBSOCKET', 'TRANSMIT'],
  minimal: ['SYS_IDLE', 'STANDBY', 'HEARTBEAT'],
}

export default function AmbientSectionEnvironment({
  variant,
  intensity = 0.5,
  accentMode = 'dual',
  className = '',
}: AmbientSectionEnvironmentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    // Color definitions based on accentMode
    const orangeRgb = '249, 115, 22' // var(--color-accent) #f97316
    const cyanRgb = '6, 182, 212' // teal/cyan AI accent #06b6d4

    function pickColor(isOrangePrefer = false): string {
      if (accentMode === 'orange') return orangeRgb
      if (accentMode === 'cyan') return cyanRgb
      return isOrangePrefer ? orangeRgb : cyanRgb
    }

    // Determine particle count based on screen width & variant
    function getParticleCount(w: number): number {
      const isMobile = w < 640
      const isTablet = w >= 640 && w < 1024
      const base = variant === 'engineering' ? 36 : variant === 'architecture' ? 32 : 24
      if (isMobile) return Math.floor(base * 0.35)
      if (isTablet) return Math.floor(base * 0.65)
      return base
    }

    let particles: Particle[] = []
    let edges: Edge[] = []
    let labels: TelemetryLabel[] = []
    let scanLineY = 0

    function initScene() {
      if (!canvas) return
      const rect = container?.getBoundingClientRect()
      if (!rect) return
      width = rect.width
      height = rect.height

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx?.scale(dpr, dpr)

      const count = getParticleCount(width)
      particles = []
      edges = []
      labels = []

      // Generate particles
      for (let i = 0; i < count; i++) {
        const isOrange = i % 3 === 0
        const color = pickColor(isOrange)
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.28 * intensity,
          vy: (Math.random() - 0.5) * 0.28 * intensity,
          radius: 0.9 + Math.random() * 1.5,
          color,
          baseAlpha: 0.12 + Math.random() * 0.25 * intensity,
          pulsePhase: Math.random() * Math.PI * 2,
          layer: Math.random() > 0.6 ? 2 : 1,
        })
      }

      // Generate edges between nearest neighbors (sparse graph)
      const maxDistance = width < 640 ? 90 : 140
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
              pulseSpeed: 0.003 + Math.random() * 0.005,
              pulseActive: Math.random() > 0.4,
              color: particles[i].color,
            })
            connected++
          }
        }
      }

      // Generate ambient telemetry labels
      const wordList = VARIANT_LABELS[variant] || []
      const labelCount = width < 640 ? 2 : Math.min(wordList.length, 4)
      for (let i = 0; i < labelCount; i++) {
        labels.push({
          text: wordList[i % wordList.length],
          x: 40 + Math.random() * (width - 120),
          y: 40 + Math.random() * (height - 80),
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          alpha: 0.08 + Math.random() * 0.08 * intensity,
          color: i % 2 === 0 ? orangeRgb : cyanRgb,
        })
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

      // B. Draw telemetry labels
      ctx.font = '10px "JetBrains Mono", var(--font-mono), monospace'
      ctx.letterSpacing = '0.14em'
      for (const label of labels) {
        label.x += label.vx
        label.y += label.vy
        if (label.x < 10) label.x = width - 80
        if (label.x > width - 60) label.x = 20
        if (label.y < 20) label.y = height - 30
        if (label.y > height - 20) label.y = 30

        ctx.fillStyle = `rgba(${label.color}, ${label.alpha})`
        ctx.fillText(label.text, label.x, label.y)
      }

      // C. Draw network edges and traveling packet pulses
      for (const edge of edges) {
        const p1 = particles[edge.p1]
        const p2 = particles[edge.p2]
        if (!p1 || !p2) continue

        const dx = p1.x - p2.x
        const dy = p1.y - p2.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxDist = width < 640 ? 100 : 150
        if (dist > maxDist) continue

        const edgeAlpha = (1 - dist / maxDist) * 0.09 * intensity
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = `rgba(${edge.color}, ${edgeAlpha})`
        ctx.lineWidth = 0.75
        ctx.stroke()

        // Traveling data packet pulse
        if (edge.pulseActive) {
          edge.pulseProgress += edge.pulseSpeed
          if (edge.pulseProgress > 1) {
            edge.pulseProgress = 0
            edge.pulseActive = Math.random() > 0.3
          }
          const px = p1.x + (p2.x - p1.x) * edge.pulseProgress
          const py = p1.y + (p2.y - p1.y) * edge.pulseProgress
          ctx.beginPath()
          ctx.arc(px, py, 1.4, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${edge.color}, ${0.45 * intensity})`
          ctx.fill()
        }
      }

      // D. Draw particles
      const now = Date.now() * 0.001
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        // Wrap around bounds
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        // Gentle cursor interaction (max 150px influence)
        if (mouse.active) {
          const mdx = p.x - mouse.x
          const mdy = p.y - mouse.y
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
          if (mdist < 140 && mdist > 1) {
            const force = (1 - mdist / 140) * 0.6
            p.x += (mdx / mdist) * force
            p.y += (mdy / mdist) * force
          }
        }

        const pulse = Math.sin(now * 1.5 + p.pulsePhase) * 0.08
        const alpha = Math.max(0.04, p.baseAlpha + pulse)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`
        ctx.fill()

        // Subtle glow ring around larger particles
        if (p.radius > 1.8 && p.layer === 2) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${p.color}, ${alpha * 0.3})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
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
  }, [variant, intensity, accentMode])

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
      grad.addColorStop(0, 'rgba(6, 182, 212, 0)')
      grad.addColorStop(0.5, `rgba(6, 182, 212, ${0.04 * intensity})`)
      grad.addColorStop(1, 'rgba(6, 182, 212, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, scanY - 30, width, 60)

      // 2 faint circuit horizontal lines
      ctx.strokeStyle = `rgba(249, 115, 22, ${0.05 * intensity})`
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
      ctx.strokeStyle = `rgba(249, 115, 22, ${0.07 * intensity})`
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
      ctx.fillStyle = `rgba(249, 115, 22, ${0.4 * intensity})`
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
        ctx.strokeStyle = `rgba(6, 182, 212, ${(0.035 - r * 0.00015) * intensity})`
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
      grad.addColorStop(0, 'rgba(6, 182, 212, 0)')
      grad.addColorStop(0.5, `rgba(6, 182, 212, ${0.035 * intensity})`)
      grad.addColorStop(1, 'rgba(6, 182, 212, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, scanY - 20, width, 40)

      // Verified node crosses in peripheral background
      ctx.strokeStyle = `rgba(6, 182, 212, ${0.06 * intensity})`
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
      ctx.strokeStyle = `rgba(249, 115, 22, ${0.045 * intensity})`
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
      ctx.strokeStyle = `rgba(6, 182, 212, ${0.05 * intensity})`
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
      radGrad.addColorStop(0, `rgba(249, 115, 22, ${0.03 * intensity})`)
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
        ctx.strokeStyle = `rgba(249, 115, 22, ${waveAlpha})`
        ctx.lineWidth = 0.75
        ctx.stroke()
      }
      break
    }

    case 'minimal': {
      // Minimal breathing gradient for idle footer
      const breathe = Math.sin(Date.now() * 0.001) * 0.02
      const grad = ctx.createRadialGradient(width * 0.5, height * 0.8, 10, width * 0.5, height * 0.8, width * 0.6)
      grad.addColorStop(0, `rgba(6, 182, 212, ${Math.max(0.01, 0.03 * intensity + breathe)})`)
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
      break
    }
  }
}
