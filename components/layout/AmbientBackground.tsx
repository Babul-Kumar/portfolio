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

// =========================================================================
// Advanced Quantum Orbital Simulation Architecture
// =========================================================================

interface QuantumPulse {
  radius: number
  maxRadius: number
  alpha: number
  speed: number
  color: string
}

interface OrbitalElectron {
  id: string
  angle: number // theta on orbit [0, 2*PI]
  baseSpeed: number // base angular velocity (graceful, majestic)
  radius: number // particle core radius
  colorType: 'terracotta' | 'teal' | 'violet' | 'gold'
  trail: { x: number; y: number; z: number }[]
  maxTrail: number
  spinAngle: number // quantum spin phase
  spinSpeed: number // micro-satellite rotation speed
  sparkleTimer: number
}

interface OrbitRing {
  baseRadius: number // semi-major axis (unscaled)
  tiltBeta: number // inclination pitch angle (rad)
  rotationGamma: number // in-plane rotation angle (rad)
  precessionSpeed: number // slow continuous 3D rotation
  shellType: 'circular' | 'figure8' | 'deBroglie' | 'eccentric'
  standingWaveFreq?: number
  ringColorType?: 'terracotta' | 'teal' | 'violet' | 'gold'
  electrons: OrbitalElectron[]
}

interface AtomSystem {
  id: string
  name: string
  xRatio: number // normalized viewport coordinates
  yRatio: number
  currentX: number
  currentY: number
  baseX: number
  baseY: number
  scale: number
  dominantColor: 'terracotta' | 'teal' | 'violet'
  rings: OrbitRing[]
  pulses: QuantumPulse[]
  nextPulseTimer: number
  gyroOffsetX: number
  gyroOffsetY: number
  magneticPoleTilt: number
}

interface CosmicDust {
  x: number
  y: number
  vx: number
  vy: number
  baseRadius: number
  colorType: 'terracotta' | 'teal' | 'violet' | 'neutral'
  pulsePhase: number
  pulseSpeed: number
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
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Track latest theme in ref for 60fps canvas loop without resetting simulation state
  const isLightRef = useRef(isLight)
  useEffect(() => {
    isLightRef.current = isLight
  }, [isLight])

  // =========================================================================
  // Canvas 3D Atomic Orbital & Quantum Particle Simulation Engine
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

      const dist = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY)
      if (dist > 60 && ripples.length < 4) {
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

    // =======================================================================
    // Individualized Atomic Systems Architecture
    // (Notice: Atom 1 moved to Upper-Left; Character Stage on Right is Free!)
    // =======================================================================
    let atoms: AtomSystem[] = []
    let cosmicDust: CosmicDust[] = []

    const initSimulation = () => {
      atoms = []
      cosmicDust = []
      const isMobile = width < 768
      const isTablet = width < 1024

      // ---------------------------------------------------------------------
      // Unified Quantum Atom: Matches the intro's 3-orbital-plane atom
      // Position: Centered (x: 0.50, y: 0.50) in deep ambient background
      // Soft, delicate, lighter colors to ensure 100% page content legibility
      // ---------------------------------------------------------------------
      const introRadius = Math.max(95, Math.min(160, Math.min(width, height) * 0.22))
      const atomScale = 1.0

      const singleAtom: AtomSystem = {
        id: 'atom-singularity',
        name: 'Quantum Atom Matrix',
        xRatio: 0.50,
        yRatio: 0.50,
        currentX: 0.50 * width,
        currentY: 0.50 * height,
        baseX: 0.50 * width,
        baseY: 0.50 * height,
        scale: atomScale,
        dominantColor: 'terracotta',
        pulses: [],
        nextPulseTimer: 3.8,
        gyroOffsetX: 0,
        gyroOffsetY: 0,
        magneticPoleTilt: 0.35,
        rings: [
          // Orbit 1: Teal (-35 deg = -0.61 rad)
          {
            baseRadius: introRadius,
            tiltBeta: 1.18,
            rotationGamma: -0.61,
            precessionSpeed: 0.00012,
            shellType: 'circular',
            ringColorType: 'teal',
            electrons: [
              {
                id: 'e1',
                angle: 0.5,
                baseSpeed: 0.0092,
                radius: 2.2,
                colorType: 'teal',
                trail: [],
                maxTrail: 14,
                spinAngle: 0,
                spinSpeed: 0.05,
                sparkleTimer: 0,
              },
            ],
          },
          // Orbit 2: Terracotta (+35 deg = +0.61 rad)
          {
            baseRadius: introRadius,
            tiltBeta: 1.18,
            rotationGamma: 0.61,
            precessionSpeed: -0.00012,
            shellType: 'circular',
            ringColorType: 'terracotta',
            electrons: [
              {
                id: 'e2',
                angle: 2.1,
                baseSpeed: 0.0076,
                radius: 2.2,
                colorType: 'terracotta',
                trail: [],
                maxTrail: 14,
                spinAngle: 1.5,
                spinSpeed: -0.05,
                sparkleTimer: 0,
              },
            ],
          },
          // Orbit 3: Amber/Gold (+86 deg = +1.50 rad)
          {
            baseRadius: introRadius,
            tiltBeta: 1.18,
            rotationGamma: 1.50,
            precessionSpeed: 0.00015,
            shellType: 'circular',
            ringColorType: 'gold',
            electrons: [
              {
                id: 'e3',
                angle: 4.2,
                baseSpeed: 0.0068,
                radius: 2.2,
                colorType: 'gold',
                trail: [],
                maxTrail: 14,
                spinAngle: 3.1,
                spinSpeed: 0.05,
                sparkleTimer: 0,
              },
            ],
          },
        ],
      }
      atoms.push(singleAtom)

      // ---------------------------------------------------------------------
      // Ambient Cosmic Sub-Particulates (Gravitationally Slingshot Around Nuclei)
      // ---------------------------------------------------------------------
      const dustCount = isMobile ? 16 : isTablet ? 24 : 34
      const types: CosmicDust['colorType'][] = ['terracotta', 'teal', 'violet', 'neutral']
      for (let i = 0; i < dustCount; i++) {
        cosmicDust.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.32,
          baseRadius: 1.3 + Math.random() * 1.3,
          colorType: types[i % types.length],
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.015 + Math.random() * 0.015,
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
      initSimulation()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas, { passive: true })
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave, { passive: true })

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

    // =======================================================================
    // 3D Orbital Projection Function
    // =======================================================================
    // 3D Orbital Projection Function (Harmonic 3D Euler Gyroscope Shells)
    // =======================================================================
    const getOrbitPoint = (
      ring: OrbitRing,
      theta: number,
      scale: number,
      cx: number,
      cy: number,
      effGamma: number,
      effBeta: number,
      _t: number
    ): { x: number; y: number; z: number } => {
      const majorR = ring.baseRadius * scale
      const cosB = Math.cos(effBeta)
      const minorR = majorR * cosB

      // Pure 3D circular/elliptical Euler projection
      const u = majorR * Math.cos(theta)
      const v = minorR * Math.sin(theta)
      const w = majorR * Math.sin(theta) * Math.sin(effBeta)

      const px = cx + u * Math.cos(effGamma) - v * Math.sin(effGamma)
      const py = cy + u * Math.sin(effGamma) + v * Math.cos(effGamma)
      const pz = w

      return { x: px, y: py, z: pz }
    }

    // =======================================================================
    // 60FPS High-Efficiency Canvas Simulation Loop
    // =======================================================================
    const render = () => {
      if (isPaused) return
      time += 0.016

      ctx.clearRect(0, 0, width, height)
      const light = isLightRef.current

      // Curated Harmonious Palette
      const terracottaRGB = light ? '212, 72, 28' : '228, 93, 44'
      const tealRGB = light ? '13, 122, 112' : '20, 184, 166'
      const violetRGB = light ? '109, 40, 217' : '129, 140, 248'
      const goldRGB = light ? '180, 120, 20' : '250, 204, 21'
      const neutralRGB = light ? '30, 27, 24' : '245, 246, 248'

      const getColorRGB = (colorType: OrbitalElectron['colorType'] | CosmicDust['colorType']) => {
        switch (colorType) {
          case 'terracotta':
            return terracottaRGB
          case 'teal':
            return tealRGB
          case 'violet':
            return violetRGB
          case 'gold':
            return goldRGB
          default:
            return neutralRGB
        }
      }

      // =====================================================================
      // Layer 0: Harmonic Wave Streamlines (Subtle Background Flow)
      // =====================================================================
      ctx.save()
      const waveAlpha = light ? 0.025 : 0.038
      ctx.beginPath()
      const yWave1 = height * 0.28
      ctx.moveTo(0, yWave1)
      for (let x = 0; x <= width; x += 36) {
        const y = yWave1 + Math.sin(x * 0.0018 + time * 0.6) * 22 + Math.cos(x * 0.001 + time * 0.4) * 10
        ctx.lineTo(x, y)
      }
      ctx.strokeStyle = `rgba(${terracottaRGB}, ${waveAlpha})`
      ctx.lineWidth = 0.85
      ctx.setLineDash([12, 18])
      ctx.lineDashOffset = -time * 16
      ctx.stroke()

      ctx.beginPath()
      const yWave2 = height * 0.74
      ctx.moveTo(0, yWave2)
      for (let x = 0; x <= width; x += 36) {
        const y = yWave2 + Math.sin(x * 0.002 - time * 0.5) * 24 + Math.cos(x * 0.0012 + time * 0.3) * 12
        ctx.lineTo(x, y)
      }
      ctx.strokeStyle = `rgba(${tealRGB}, ${waveAlpha})`
      ctx.lineWidth = 0.85
      ctx.setLineDash([14, 20])
      ctx.lineDashOffset = time * 14
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()

      // =====================================================================
      // Layer 1: Cursor Space-Time Ripples
      // =====================================================================
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.radius += 1.6
        r.alpha *= 0.965

        if (r.alpha < 0.02 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${terracottaRGB}, ${r.alpha})`
        ctx.lineWidth = 1.0
        ctx.stroke()
      }

      // =====================================================================
      // Layer 2: Cosmic Dust & Gravitational Slingshot Physics
      // =====================================================================
      for (let i = 0; i < cosmicDust.length; i++) {
        const p = cosmicDust[i]
        p.x += p.vx
        p.y += p.vy

        // Wrap around boundaries
        if (p.x < -20) p.x = width + 20
        else if (p.x > width + 20) p.x = -20
        if (p.y < -20) p.y = height + 20
        else if (p.y > height + 20) p.y = -20

        // Gravitational deflection near atomic nuclei
        for (let a = 0; a < atoms.length; a++) {
          const atom = atoms[a]
          const dx = atom.currentX - p.x
          const dy = atom.currentY - p.y
          const d = Math.hypot(dx, dy)
          if (d < 160 && d > 16) {
            const pull = (1 - d / 160) * 0.032
            p.vx += (dx / d) * pull
            p.vy += (dy / d) * pull
            p.vx *= 0.99
            p.vy *= 0.99
          }
        }

        p.pulsePhase += p.pulseSpeed
      }

      // Constellation mesh between close dust particles (soft, faint connections)
      const MAX_DUST_LINE = 105
      for (let i = 0; i < cosmicDust.length; i++) {
        const p1 = cosmicDust[i]
        for (let j = i + 1; j < cosmicDust.length; j++) {
          const p2 = cosmicDust[j]
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y)
          if (dist < MAX_DUST_LINE) {
            const alpha = (1 - dist / MAX_DUST_LINE) * (light ? 0.08 : 0.06)
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(${neutralRGB}, ${alpha})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      for (let i = 0; i < cosmicDust.length; i++) {
        const p = cosmicDust[i]
        const pulse = 0.82 + Math.sin(p.pulsePhase) * 0.28
        const r = p.baseRadius * pulse
        const cRGB = getColorRGB(p.colorType)

        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${cRGB}, ${light ? 0.18 : 0.25})`
        ctx.fill()
      }

      // =====================================================================
      // Layer 3: Atomic Position Tracking & Gyro Magnetic Orientation
      // =====================================================================
      for (let a = 0; a < atoms.length; a++) {
        const atom = atoms[a]

        // Rock-solid stable anchor (no erratic cursor pull or wobble)
        atom.baseX = atom.xRatio * width
        atom.baseY = atom.yRatio * height
        atom.currentX = atom.baseX
        atom.currentY = atom.baseY
        atom.gyroOffsetX = 0
        atom.gyroOffsetY = 0

        // Periodic quantum wave emission (slowed down: speed 0.7)
        atom.nextPulseTimer -= 0.016
        if (atom.nextPulseTimer <= 0) {
          atom.nextPulseTimer = 4.2 + Math.random() * 2.0
          atom.pulses.push({
            radius: 8,
            maxRadius: (light ? 160 : 190) * atom.scale,
            alpha: light ? 0.35 : 0.45,
            speed: 0.75 + Math.random() * 0.3,
            color: getColorRGB(atom.dominantColor),
          })
        }
      }

      // =====================================================================
      // Layer 4 & 5 & 6: 3D Atomic Systems
      // True 3D Depth Layering: Back Arcs -> Back Electrons -> Nucleus -> Front Arcs -> Front Electrons
      // =====================================================================
      for (let a = 0; a < atoms.length; a++) {
        const atom = atoms[a]
        const cx = atom.currentX
        const cy = atom.currentY
        const atomColorRGB = getColorRGB(atom.dominantColor)

        // Read synchronized time with the cinematic intro epoch
        const atomEpoch =
          typeof window !== 'undefined' && (window as any).__portfolioAtomEpoch
            ? (window as any).__portfolioAtomEpoch
            : 0
        const epochElapsed = atomEpoch ? (performance.now() - atomEpoch) / 1000 : time + 5.0

        // -------------------------------------------------------------------
        // 4A. CONTINUOUS CLOSED 3D ORBITAL AXIS RINGS (Seamless & Unbroken)
        // Delicate, ethereal single hairline paths in harmonious subtle tones
        // -------------------------------------------------------------------
        ctx.save()
        for (let r = 0; r < atom.rings.length; r++) {
          const ring = atom.rings[r]
          const rColorRGB = ring.ringColorType ? getColorRGB(ring.ringColorType) : atomColorRGB

          // Calculate closed in-plane ellipse coordinates matching PortfolioIntro
          const steps = 80
          ctx.beginPath()
          for (let step = 0; step <= steps; step++) {
            const angle = (step / steps) * Math.PI * 2
            const lx = ring.baseRadius * atom.scale * Math.cos(angle)
            const ly = ring.baseRadius * atom.scale * 0.38 * Math.sin(angle)
            const px = cx + lx * Math.cos(ring.rotationGamma) - ly * Math.sin(ring.rotationGamma)
            const py = cy + lx * Math.sin(ring.rotationGamma) + ly * Math.cos(ring.rotationGamma)
            if (step === 0) {
              ctx.moveTo(px, py)
            } else {
              ctx.lineTo(px, py)
            }
          }
          ctx.closePath()

          // Subtle, low-contrast hairline stroke (non-distracting ambient background)
          ctx.strokeStyle = `rgba(${rColorRGB}, ${light ? 0.08 : 0.14})`
          ctx.lineWidth = 0.85
          ctx.stroke()
        }
        ctx.restore()

        // -------------------------------------------------------------------
        // 4B. BACK ELECTRONS & TAILS (z < 0: Revolve Behind Nucleus)
        // -------------------------------------------------------------------
        for (let r = 0; r < atom.rings.length; r++) {
          const ring = atom.rings[r]
          const el = ring.electrons[0]
          if (!el) continue

          const period = r === 0 ? 2.35 : r === 1 ? 2.85 : 3.25
          const ringStartTime = r === 0 ? 2.7 : r === 1 ? 3.5 : 4.3
          const omega = (Math.PI * 2) / period
          const phi = omega * Math.max(0, epochElapsed - ringStartTime)

          const majorR = ring.baseRadius * atom.scale
          const minorR = majorR * 0.38
          const lx = majorR * Math.cos(phi)
          const ly = minorR * Math.sin(phi)
          const zDepth = Math.sin(phi)

          const px = cx + lx * Math.cos(ring.rotationGamma) - ly * Math.sin(ring.rotationGamma)
          const py = cy + lx * Math.sin(ring.rotationGamma) + ly * Math.cos(ring.rotationGamma)

          el.trail.push({ x: px, y: py, z: zDepth })
          if (el.trail.length > el.maxTrail) el.trail.shift()

          if (zDepth < 0) {
            const elColorRGB = getColorRGB(el.colorType)
            const len = el.trail.length

            if (len > 2) {
              for (let t = 0; t < len - 1; t++) {
                const pt1 = el.trail[t]
                const pt2 = el.trail[t + 1]
                if (pt1.z < 0) {
                  const progress = (t + 1) / len
                  const quadAlpha = progress * progress
                  ctx.beginPath()
                  ctx.moveTo(pt1.x, pt1.y)
                  ctx.lineTo(pt2.x, pt2.y)
                  ctx.strokeStyle = `rgba(${elColorRGB}, ${quadAlpha * (light ? 0.08 : 0.14)})`
                  ctx.lineWidth = 0.4 + progress * 0.6
                  ctx.stroke()
                }
              }
            }

            // Faint back electron head
            ctx.beginPath()
            ctx.arc(px, py, 1.8, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${elColorRGB}, ${light ? 0.22 : 0.30})`
            ctx.fill()
          }
        }

        // -------------------------------------------------------------------
        // 4C. ATOMIC NUCLEUS: SOFT LUMINOUS AMBIENT PEARL
        // Ethereal, gentle breathing star core with light, calm transparency
        // -------------------------------------------------------------------
        // 1. Quantum pulse wavefronts (gentle ambient ripples)
        for (let pIdx = atom.pulses.length - 1; pIdx >= 0; pIdx--) {
          const pulse = atom.pulses[pIdx]
          pulse.radius += pulse.speed
          pulse.alpha *= 0.982

          if (pulse.alpha < 0.015 || pulse.radius >= pulse.maxRadius) {
            atom.pulses.splice(pIdx, 1)
            continue
          }

          ctx.beginPath()
          ctx.arc(cx, cy, pulse.radius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${pulse.color}, ${pulse.alpha * (light ? 0.35 : 0.45)})`
          ctx.lineWidth = 0.75
          ctx.stroke()
        }

        // 2. Soft Coronal Glow (Breathing softly, low alpha)
        const breath = 1.0 + Math.sin(time * 2.0) * 0.05
        const coronaRadius = 22 * atom.scale * breath
        const coronaGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coronaRadius)
        coronaGrad.addColorStop(0, `rgba(${goldRGB}, ${light ? 0.10 : 0.16})`)
        coronaGrad.addColorStop(0.45, `rgba(${terracottaRGB}, ${light ? 0.05 : 0.09})`)
        coronaGrad.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(cx, cy, coronaRadius, 0, Math.PI * 2)
        ctx.fillStyle = coronaGrad
        ctx.fill()

        // 3. Delicate Luminous Core Pearl (Clean, subtle, non-distracting)
        const coreR = 3.6 * atom.scale
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR)
        coreGrad.addColorStop(0, '#FFFFFF')
        coreGrad.addColorStop(0.4, `rgba(${goldRGB}, ${light ? 0.45 : 0.65})`)
        coreGrad.addColorStop(0.9, `rgba(${terracottaRGB}, ${light ? 0.20 : 0.35})`)
        coreGrad.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2)
        ctx.fillStyle = coreGrad
        ctx.fill()

        // -------------------------------------------------------------------
        // 4D. FRONT ELECTRONS & LUMINOUS COMET TAILS (z >= 0: Sweeping Foreground)
        // Light, non-obtrusive trails and soft delicate jewel points
        // -------------------------------------------------------------------
        for (let r = 0; r < atom.rings.length; r++) {
          const ring = atom.rings[r]
          const el = ring.electrons[0]
          if (!el) continue

          const latest = el.trail[el.trail.length - 1]
          if (!latest || latest.z < 0) continue

          const elColorRGB = getColorRGB(el.colorType)
          const len = el.trail.length

          // Delicate fading comet tail
          if (len > 2) {
            for (let t = 0; t < len - 1; t++) {
              const pt1 = el.trail[t]
              const pt2 = el.trail[t + 1]
              const progress = (t + 1) / len
              const quadAlpha = progress * progress
              ctx.beginPath()
              ctx.moveTo(pt1.x, pt1.y)
              ctx.lineTo(pt2.x, pt2.y)
              ctx.strokeStyle = `rgba(${elColorRGB}, ${quadAlpha * (light ? 0.16 : 0.24)})`
              ctx.lineWidth = 0.5 + progress * 0.8
              ctx.stroke()
            }
          }

          // Subtle electron head aura
          ctx.beginPath()
          ctx.arc(latest.x, latest.y, 2.8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${elColorRGB}, ${light ? 0.08 : 0.14})`
          ctx.fill()

          // Jewel particle core
          ctx.beginPath()
          ctx.arc(latest.x, latest.y, 2.0, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${elColorRGB}, ${light ? 0.45 : 0.60})`
          ctx.fill()

          // Specular white center spark
          ctx.beginPath()
          ctx.arc(latest.x, latest.y, 0.8, 0, Math.PI * 2)
          ctx.fillStyle = '#FFFFFF'
          ctx.fill()
        }
      }





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
  // High-Performance Cursor Spotlight
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
      currentX += (targetX - currentX) * 0.12
      currentY += (targetY - currentY) * 0.12

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${(currentX - 300).toFixed(1)}px, ${(currentY - 300).toFixed(1)}px, 0)`
      }

      if (Math.abs(targetX - currentX) > 0.3 || Math.abs(targetY - currentY) > 0.3) {
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
        contain: 'strict',
      }}
    >
      {/* =========================================================================
          Layer 1: Continuous Architectural Blueprint Grid (Hardware Accelerated)
          - 24px and 96px dual-scale precision grid
          ========================================================================= */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: isLight
            ? `
              linear-gradient(to right, rgba(18, 17, 16, 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(18, 17, 16, 0.04) 1px, transparent 1px),
              linear-gradient(to right, rgba(18, 17, 16, 0.075) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(18, 17, 16, 0.075) 1px, transparent 1px)
            `
            : `
              linear-gradient(to right, var(--color-border-subtle) 1px, transparent 1px),
              linear-gradient(to bottom, var(--color-border-subtle) 1px, transparent 1px),
              linear-gradient(to right, var(--color-border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)
            `,
          backgroundSize: '24px 24px, 24px 24px, 96px 96px, 96px 96px',
          opacity: isLight ? 0.95 : 0.65,
          contain: 'strict',
        }}
      />

      {/* =========================================================================
          Layer 2: GPU-Native Radial Aurora Glow Orbs (Zero Filter Blur Penalty)
          ========================================================================= */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          contain: 'strict',
        }}
      >
        {/* Primary Warm Terracotta / Orange Glow (Upper Left/Center) */}
        <div
          className={!reducedMotion ? 'ambient-aurora-orb-orange' : ''}
          style={{
            position: 'absolute',
            top: '2%',
            left: '2%',
            width: 'clamp(460px, 52vw, 800px)',
            height: 'clamp(460px, 52vw, 800px)',
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle, rgba(234, 88, 12, 0.08) 0%, rgba(249, 115, 22, 0.025) 45%, transparent 72%)'
              : 'radial-gradient(circle, var(--color-accent-glow) 0%, var(--color-accent-bg) 35%, transparent 72%)',
            opacity: isLight ? 0.95 : 0.88,
            contain: 'strict',
            willChange: 'transform',
          }}
        />

        {/* Secondary Quantum Cyan / Teal Glow (Capabilities - Mid Left) */}
        <div
          className={!reducedMotion ? 'ambient-aurora-orb-teal' : ''}
          style={{
            position: 'absolute',
            top: '28%',
            left: '-6%',
            width: 'clamp(400px, 46vw, 700px)',
            height: 'clamp(400px, 46vw, 700px)',
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle, rgba(13, 122, 112, 0.07) 0%, rgba(20, 184, 166, 0.02) 48%, transparent 70%)'
              : 'radial-gradient(circle, var(--color-accent-teal-bg) 0%, rgba(20, 184, 166, 0.025) 45%, transparent 70%)',
            opacity: isLight ? 0.9 : 0.82,
            contain: 'strict',
            willChange: 'transform',
          }}
        />

        {/* Tertiary Deep Indigo / Violet Harmonizer (Modules - Lower) */}
        <div
          className={!reducedMotion ? 'ambient-aurora-orb-indigo' : ''}
          style={{
            position: 'absolute',
            top: '58%',
            right: '-4%',
            width: 'clamp(380px, 42vw, 660px)',
            height: 'clamp(380px, 42vw, 660px)',
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle, rgba(109, 40, 217, 0.045) 0%, transparent 68%)'
              : 'radial-gradient(circle, rgba(99, 102, 241, 0.085) 0%, rgba(139, 92, 246, 0.025) 50%, transparent 70%)',
            opacity: isLight ? 0.85 : 0.78,
            contain: 'strict',
            willChange: 'transform',
          }}
        />

        {/* Quaternary Warm Hearth Accent (Footer) */}
        <div
          className={!reducedMotion ? 'ambient-aurora-orb-hearth' : ''}
          style={{
            position: 'absolute',
            bottom: '2%',
            left: '8%',
            width: 'clamp(360px, 40vw, 620px)',
            height: 'clamp(360px, 40vw, 620px)',
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle, rgba(212, 72, 28, 0.055) 0%, transparent 66%)'
              : 'radial-gradient(circle, var(--color-accent-bg) 0%, transparent 66%)',
            opacity: isLight ? 0.85 : 0.75,
            contain: 'strict',
            willChange: 'transform',
          }}
        />
      </div>

      {/* =========================================================================
          Layer 3: 3D Atomic Orbital & Quantum Particle Canvas Engine
          ========================================================================= */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="ambient-background-canvas"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 1,
          contain: 'strict',
        }}
      />

      {/* =========================================================================
          Layer 4: Interactive Cursor Reactive Spotlight
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
            ? 'radial-gradient(circle, rgba(212, 72, 28, 0.06) 0%, rgba(249, 115, 22, 0.015) 35%, transparent 70%)'
            : 'radial-gradient(circle, var(--color-accent-glow) 0%, rgba(249, 115, 22, 0.035) 30%, transparent 70%)',
          pointerEvents: 'none',
          willChange: 'transform',
          transform: 'translate3d(-9999px, -9999px, 0)',
          opacity: 0,
          transition: 'opacity 0.6s ease',
          zIndex: 2,
          contain: 'strict',
        }}
      />

      {/* Embedded High-Performance GPU Keyframes */}
      <style>{`
        @keyframes ambientAuroraFlowA {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate3d(-30px, 35px, 0) scale(1.05);
          }
          66% {
            transform: translate3d(18px, -20px, 0) scale(0.97);
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
            transform: translate3d(35px, -25px, 0) scale(1.04);
          }
          66% {
            transform: translate3d(-18px, 28px, 0) scale(0.96);
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
            transform: translate3d(-25px, -30px, 0) scale(1.06);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        .ambient-aurora-orb-orange {
          animation: ambientAuroraFlowA 26s ease-in-out infinite;
        }

        .ambient-aurora-orb-teal {
          animation: ambientAuroraFlowB 30s ease-in-out infinite;
        }

        .ambient-aurora-orb-indigo {
          animation: ambientAuroraFlowC 34s ease-in-out infinite;
        }

        .ambient-aurora-orb-hearth {
          animation: ambientAuroraFlowB 24s ease-in-out infinite reverse;
        }

        @media (prefers-reduced-motion: reduce) {
          .ambient-aurora-orb-orange,
          .ambient-aurora-orb-teal,
          .ambient-aurora-orb-indigo,
          .ambient-aurora-orb-hearth {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
