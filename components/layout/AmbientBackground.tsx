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
      const isTablet = width >= 768 && width < 1024

      // ---------------------------------------------------------------------
      // Single Unified Quantum Atom: "Solitary Singularity Core"
      // POSITION: Upper-Left Quadrant (x: 0.18, y: 0.22)
      // The 3D Character Avatar on the right is completely unobstructed!
      // Features: Single high-energy nucleus with 8 intersecting 3D shells
      // and 32 densely orbiting electrons with luminous comet trails.
      // ---------------------------------------------------------------------
      const atomScale = isMobile ? 0.65 : isTablet ? 0.95 : 1.28
      const trailMultiplier = isMobile ? 0.75 : 1.0

      const singleAtom: AtomSystem = {
        id: 'atom-singularity',
        name: 'Solitary Singularity Core',
        xRatio: 0.50,
        yRatio: 0.50,
        currentX: 0.50 * width,
        currentY: 0.50 * height,
        baseX: 0.50 * width,
        baseY: 0.50 * height,
        scale: atomScale,
        dominantColor: 'terracotta',
        pulses: [],
        nextPulseTimer: 2.2,
        gyroOffsetX: 0,
        gyroOffsetY: 0,
        magneticPoleTilt: 0.35,
        rings: [
          // -----------------------------------------------------------------
          // Shell 1: K-Shell (n=1) - Inner High-Velocity Bohr Core Orbit
          // 2 electrons, ultra-bright stellar gold & terracotta
          // -----------------------------------------------------------------
          {
            baseRadius: 46,
            tiltBeta: 0.92,
            rotationGamma: 0.15,
            precessionSpeed: 0.0006,
            shellType: 'circular',
            ringColorType: 'gold',
            electrons: [
              {
                id: 'e1-1',
                angle: 0.2,
                baseSpeed: 0.018,
                radius: 2.3,
                colorType: 'gold',
                trail: [],
                maxTrail: Math.floor(16 * trailMultiplier),
                spinAngle: 0,
                spinSpeed: 0.08,
                sparkleTimer: 0,
              },
              {
                id: 'e1-2',
                angle: 0.2 + Math.PI,
                baseSpeed: 0.018,
                radius: 2.3,
                colorType: 'terracotta',
                trail: [],
                maxTrail: Math.floor(16 * trailMultiplier),
                spinAngle: Math.PI,
                spinSpeed: -0.08,
                sparkleTimer: 0,
              },
            ],
          },

          // -----------------------------------------------------------------
          // Shell 2: L-Shell (n=2) - Balanced 3-Electron Gyroscope Ring
          // -----------------------------------------------------------------
          {
            baseRadius: 88,
            tiltBeta: 1.12,
            rotationGamma: 0.78,
            precessionSpeed: -0.00045,
            shellType: 'circular',
            ringColorType: 'terracotta',
            electrons: [
              {
                id: 'e2-1',
                angle: 0.1,
                baseSpeed: 0.013,
                radius: 2.4,
                colorType: 'terracotta',
                trail: [],
                maxTrail: Math.floor(20 * trailMultiplier),
                spinAngle: 0.5,
                spinSpeed: 0.07,
                sparkleTimer: 0,
              },
              {
                id: 'e2-2',
                angle: 0.1 + (2 * Math.PI) / 3,
                baseSpeed: 0.013,
                radius: 2.4,
                colorType: 'gold',
                trail: [],
                maxTrail: Math.floor(20 * trailMultiplier),
                spinAngle: 2.6,
                spinSpeed: -0.07,
                sparkleTimer: 0,
              },
              {
                id: 'e2-3',
                angle: 0.1 + (4 * Math.PI) / 3,
                baseSpeed: 0.013,
                radius: 2.4,
                colorType: 'terracotta',
                trail: [],
                maxTrail: Math.floor(20 * trailMultiplier),
                spinAngle: 4.7,
                spinSpeed: 0.07,
                sparkleTimer: 0,
              },
            ],
          },

          // -----------------------------------------------------------------
          // Shell 3: M-Shell (n=3) - Equatorial Precision Cyan/Teal Ring
          // 4 electrons in balanced quadrature spacing
          // -----------------------------------------------------------------
          {
            baseRadius: 132,
            tiltBeta: 1.25,
            rotationGamma: -0.68,
            precessionSpeed: 0.00035,
            shellType: 'circular',
            ringColorType: 'teal',
            electrons: [
              {
                id: 'e3-1',
                angle: 0.3,
                baseSpeed: 0.0098,
                radius: 2.5,
                colorType: 'teal',
                trail: [],
                maxTrail: Math.floor(22 * trailMultiplier),
                spinAngle: 0.8,
                spinSpeed: 0.065,
                sparkleTimer: 0,
              },
              {
                id: 'e3-2',
                angle: 0.3 + 0.5 * Math.PI,
                baseSpeed: 0.0098,
                radius: 2.5,
                colorType: 'gold',
                trail: [],
                maxTrail: Math.floor(22 * trailMultiplier),
                spinAngle: 2.3,
                spinSpeed: -0.065,
                sparkleTimer: 0,
              },
              {
                id: 'e3-3',
                angle: 0.3 + 1.0 * Math.PI,
                baseSpeed: 0.0098,
                radius: 2.5,
                colorType: 'teal',
                trail: [],
                maxTrail: Math.floor(22 * trailMultiplier),
                spinAngle: 3.9,
                spinSpeed: 0.065,
                sparkleTimer: 0,
              },
              {
                id: 'e3-4',
                angle: 0.3 + 1.5 * Math.PI,
                baseSpeed: 0.0098,
                radius: 2.5,
                colorType: 'terracotta',
                trail: [],
                maxTrail: Math.floor(22 * trailMultiplier),
                spinAngle: 5.4,
                spinSpeed: -0.065,
                sparkleTimer: 0,
              },
            ],
          },

          // -----------------------------------------------------------------
          // Shell 4: N-Shell (n=4) - Tilted Harmonic Golden Ring
          // 4 electrons spaced symmetrically
          // -----------------------------------------------------------------
          {
            baseRadius: 178,
            tiltBeta: 1.08,
            rotationGamma: 1.48,
            precessionSpeed: -0.00028,
            shellType: 'circular',
            ringColorType: 'gold',
            electrons: [
              {
                id: 'e4-1',
                angle: 0.0,
                baseSpeed: 0.0075,
                radius: 2.6,
                colorType: 'gold',
                trail: [],
                maxTrail: Math.floor(26 * trailMultiplier),
                spinAngle: 0.2,
                spinSpeed: 0.055,
                sparkleTimer: 0,
              },
              {
                id: 'e4-2',
                angle: 0.5 * Math.PI,
                baseSpeed: 0.0075,
                radius: 2.6,
                colorType: 'terracotta',
                trail: [],
                maxTrail: Math.floor(26 * trailMultiplier),
                spinAngle: 1.8,
                spinSpeed: -0.055,
                sparkleTimer: 0,
              },
              {
                id: 'e4-3',
                angle: 1.0 * Math.PI,
                baseSpeed: 0.0075,
                radius: 2.6,
                colorType: 'teal',
                trail: [],
                maxTrail: Math.floor(26 * trailMultiplier),
                spinAngle: 3.4,
                spinSpeed: 0.055,
                sparkleTimer: 0,
              },
              {
                id: 'e4-4',
                angle: 1.5 * Math.PI,
                baseSpeed: 0.0075,
                radius: 2.6,
                colorType: 'violet',
                trail: [],
                maxTrail: Math.floor(26 * trailMultiplier),
                spinAngle: 5.0,
                spinSpeed: -0.055,
                sparkleTimer: 0,
              },
            ],
          },

          // -----------------------------------------------------------------
          // Shell 5: Valence Perimeter Ring (n=5) - Outer Gyroscopic Perimeter
          // 3 electrons with long luminous comet trails
          // -----------------------------------------------------------------
          {
            baseRadius: 224,
            tiltBeta: 0.98,
            rotationGamma: -1.35,
            precessionSpeed: 0.0002,
            shellType: 'circular',
            ringColorType: 'teal',
            electrons: [
              {
                id: 'e5-1',
                angle: 0.6,
                baseSpeed: 0.0055,
                radius: 2.7,
                colorType: 'teal',
                trail: [],
                maxTrail: Math.floor(32 * trailMultiplier),
                spinAngle: 0.7,
                spinSpeed: 0.045,
                sparkleTimer: 0,
              },
              {
                id: 'e5-2',
                angle: 0.6 + (2 * Math.PI) / 3,
                baseSpeed: 0.0055,
                radius: 2.7,
                colorType: 'violet',
                trail: [],
                maxTrail: Math.floor(32 * trailMultiplier),
                spinAngle: 2.8,
                spinSpeed: -0.045,
                sparkleTimer: 0,
              },
              {
                id: 'e5-3',
                angle: 0.6 + (4 * Math.PI) / 3,
                baseSpeed: 0.0055,
                radius: 2.7,
                colorType: 'terracotta',
                trail: [],
                maxTrail: Math.floor(32 * trailMultiplier),
                spinAngle: 4.9,
                spinSpeed: 0.045,
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
      // Layer 0: Harmonic Wave Streamlines
      // =====================================================================
      ctx.save()
      const waveAlpha = light ? 0.055 : 0.07
      ctx.beginPath()
      const yWave1 = height * 0.28
      ctx.moveTo(0, yWave1)
      for (let x = 0; x <= width; x += 36) {
        const y = yWave1 + Math.sin(x * 0.0018 + time * 0.6) * 22 + Math.cos(x * 0.001 + time * 0.4) * 10
        ctx.lineTo(x, y)
      }
      ctx.strokeStyle = `rgba(${terracottaRGB}, ${waveAlpha})`
      ctx.lineWidth = 0.95
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
      ctx.lineWidth = 0.95
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

      // Constellation mesh between close dust particles
      const MAX_DUST_LINE = 105
      for (let i = 0; i < cosmicDust.length; i++) {
        const p1 = cosmicDust[i]
        for (let j = i + 1; j < cosmicDust.length; j++) {
          const p2 = cosmicDust[j]
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y)
          if (dist < MAX_DUST_LINE) {
            const alpha = (1 - dist / MAX_DUST_LINE) * (light ? 0.14 : 0.10)
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(${neutralRGB}, ${alpha})`
            ctx.lineWidth = 0.7
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
        ctx.fillStyle = `rgba(${cRGB}, ${light ? 0.45 : 0.6})`
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

        // Stable, serene orbital speed
        const speedMultiplier = 1.0

        // -------------------------------------------------------------------
        // 4A. CONTINUOUS CLOSED 3D ORBITAL AXIS RINGS (Seamless & Unbroken)
        // Volumetric Dual-Pass Light: Soft Ambient Glow Halo + Precision Laser Filament Core
        // -------------------------------------------------------------------
        ctx.save()
        for (let r = 0; r < atom.rings.length; r++) {
          const ring = atom.rings[r]
          ring.rotationGamma += ring.precessionSpeed

          const effGamma = ring.rotationGamma + atom.gyroOffsetX
          const effBeta = ring.tiltBeta + atom.gyroOffsetY

          // Seamless, continuous 3D closed orbit loop (96 steps for liquid-smooth curve)
          const steps = 96
          ctx.beginPath()
          for (let step = 0; step <= steps; step++) {
            const theta = (step / steps) * Math.PI * 2
            const pt = getOrbitPoint(ring, theta, atom.scale, cx, cy, effGamma, effBeta, time)
            if (step === 0) {
              ctx.moveTo(pt.x, pt.y)
            } else {
              ctx.lineTo(pt.x, pt.y)
            }
          }
          ctx.closePath()

          const rColorRGB = ring.ringColorType ? getColorRGB(ring.ringColorType) : atomColorRGB

          // Pass 1: Soft Ambient Glow Halo Beam
          ctx.strokeStyle = `rgba(${rColorRGB}, ${light ? 0.10 : 0.16})`
          ctx.lineWidth = light ? 2.6 : 3.4
          ctx.stroke()

          // Pass 2: Precision Laser Filament Core with Radiant Bloom
          ctx.strokeStyle = `rgba(${rColorRGB}, ${light ? 0.38 : 0.58})`
          ctx.lineWidth = light ? 1.05 : 1.35
          ctx.shadowColor = `rgba(${rColorRGB}, ${light ? 0.25 : 0.50})`
          ctx.shadowBlur = light ? 3 : 7
          ctx.stroke()
          ctx.shadowBlur = 0
        }
        ctx.restore()

        // -------------------------------------------------------------------
        // 4B. BACK ELECTRONS & TAILS (z < 0: Revolve Behind Nucleus)
        // -------------------------------------------------------------------
        for (let r = 0; r < atom.rings.length; r++) {
          const ring = atom.rings[r]
          const effGamma = ring.rotationGamma + atom.gyroOffsetX
          const effBeta = ring.tiltBeta + atom.gyroOffsetY

          for (let e = 0; e < ring.electrons.length; e++) {
            const el = ring.electrons[e]

            // Keplerian speed modulation (accelerates gently near periapsis)
            const keplerFactor = 1.0 + 0.15 * Math.cos(el.angle)
            el.angle += el.baseSpeed * speedMultiplier * keplerFactor
            if (el.angle > Math.PI * 2) el.angle -= Math.PI * 2

            el.spinAngle += el.spinSpeed

            // Calculate current 3D position
            const pt = getOrbitPoint(ring, el.angle, atom.scale, cx, cy, effGamma, effBeta, time)

            el.trail.push({ x: pt.x, y: pt.y, z: pt.z })
            if (el.trail.length > el.maxTrail) el.trail.shift()

            // If in back half, draw back electron and trail
            if (pt.z < 0) {
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
                    ctx.strokeStyle = `rgba(${elColorRGB}, ${quadAlpha * (light ? 0.32 : 0.44)})`
                    ctx.lineWidth = 0.5 + progress * (light ? 0.9 : 1.3)
                    ctx.stroke()
                  }
                }
              }

              // Draw electron head (dimmer behind nucleus)
              const radius = el.radius * (light ? 0.85 : 0.95)
              ctx.beginPath()
              ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2)
              ctx.fillStyle = `rgba(${elColorRGB}, ${light ? 0.72 : 0.82})`
              ctx.fill()
            }
          }
        }

        // -------------------------------------------------------------------
        // 4C. ATOMIC NUCLEUS: RADIANT QUANTUM FUSION CORE
        // A single majestic, soft-glowing starburst core with coronal plasma,
        // magnetic horizon, and specular white-hot singularity point.
        // (NO mechanical crosshairs or target reticles!)
        // -------------------------------------------------------------------
        // 1. Quantum pulse wavefronts (slow serene ripples expanding outward)
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
          ctx.strokeStyle = `rgba(${pulse.color}, ${pulse.alpha})`
          ctx.lineWidth = 0.95
          ctx.stroke()
        }

        // 2. Subtle Quantum Probability Atmosphere (Faint Golden Shell Aura)
        ctx.save()
        const auraR = 38 * atom.scale
        ctx.beginPath()
        ctx.arc(cx, cy, auraR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${goldRGB}, ${light ? 0.12 : 0.18})`
        ctx.lineWidth = 0.85
        ctx.setLineDash([2, 6])
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()

        // 3. Outer Fusion Corona Glow (Soft, Breathing, Hypnotic)
        const breathe = Math.sin(time * 1.6) * 3.0
        const coronaRadius = (30 + breathe) * atom.scale
        const coronaGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, coronaRadius)
        coronaGrad.addColorStop(0, `rgba(${goldRGB}, ${light ? 0.50 : 0.70})`)
        coronaGrad.addColorStop(0.35, `rgba(${atomColorRGB}, ${light ? 0.22 : 0.35})`)
        coronaGrad.addColorStop(0.70, `rgba(${atomColorRGB}, ${light ? 0.06 : 0.12})`)
        coronaGrad.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(cx, cy, coronaRadius, 0, Math.PI * 2)
        ctx.fillStyle = coronaGrad
        ctx.fill()

        // 4. Confinement Energy Ring
        const fluxRingR = (13.5 + Math.sin(time * 2.2) * 0.7) * atom.scale
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, fluxRingR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${goldRGB}, ${light ? 0.38 : 0.65})`
        ctx.lineWidth = 0.95
        ctx.setLineDash([3, 5])
        ctx.lineDashOffset = -time * 10
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()

        // 5. HIGH-ENERGY SOLID FUSION SPHERE
        const coreR = (8.0 + Math.sin(time * 2.0) * 0.45) * atom.scale
        const sphereGrad = ctx.createRadialGradient(
          cx - coreR * 0.3,
          cy - coreR * 0.3,
          1,
          cx,
          cy,
          coreR
        )
        sphereGrad.addColorStop(0, '#FFFFFF')
        sphereGrad.addColorStop(0.28, `rgb(${goldRGB})`)
        sphereGrad.addColorStop(0.72, `rgb(${atomColorRGB})`)
        sphereGrad.addColorStop(1, light ? 'rgba(160, 45, 15, 0.95)' : 'rgba(120, 30, 8, 0.95)')

        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2)
        ctx.fillStyle = sphereGrad
        ctx.shadowColor = `rgba(${atomColorRGB}, ${light ? 0.55 : 0.9})`
        ctx.shadowBlur = light ? 7 : 14
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.restore()

        // 6. SPECULAR WHITE-HOT SINGULARITY PEARL (Pure Star Core - No Crosshairs!)
        const sparkR = 2.4 * atom.scale
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, sparkR, 0, Math.PI * 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.shadowColor = '#FFFFFF'
        ctx.shadowBlur = light ? 8 : 14
        ctx.fill()
        ctx.restore()

        // -------------------------------------------------------------------
        // (Note: Orbital axis rings are seamlessly rendered in full 3D in 4A
        // to guarantee 100% closed, unbroken loops with zero horizon gaps)
        // -------------------------------------------------------------------

        // -------------------------------------------------------------------
        // 4E. FRONT ELECTRONS & LUMINOUS COMET TAILS (z >= 0: Sweeping Foreground)
        // Fluid Quadratic Decay (t^2 / L^2) + Specular Spark Particles
        // -------------------------------------------------------------------
        for (let r = 0; r < atom.rings.length; r++) {
          const ring = atom.rings[r]
          for (let e = 0; e < ring.electrons.length; e++) {
            const el = ring.electrons[e]
            const latest = el.trail[el.trail.length - 1]
            if (!latest || latest.z < 0) continue

            const elColorRGB = getColorRGB(el.colorType)
            const len = el.trail.length

            // Luminous seamless quadratic fading comet tail
            if (len > 2) {
              ctx.save()
              ctx.shadowColor = `rgba(${elColorRGB}, ${light ? 0.35 : 0.65})`
              ctx.shadowBlur = light ? 4 : 8
              for (let t = 0; t < len - 1; t++) {
                const pt1 = el.trail[t]
                const pt2 = el.trail[t + 1]
                const progress = (t + 1) / len
                const quadAlpha = progress * progress
                ctx.beginPath()
                ctx.moveTo(pt1.x, pt1.y)
                ctx.lineTo(pt2.x, pt2.y)
                ctx.strokeStyle = `rgba(${elColorRGB}, ${quadAlpha * (light ? 0.68 : 0.92)})`
                ctx.lineWidth = 0.6 + progress * (light ? 2.0 : 2.8)
                ctx.stroke()
              }
              ctx.restore()
            }

            // Glowing electron head
            const radius = el.radius
            // Outer soft aura
            ctx.beginPath()
            ctx.arc(latest.x, latest.y, radius * 1.7, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${elColorRGB}, ${light ? 0.20 : 0.32})`
            ctx.fill()

            // Solid jewel particle
            ctx.beginPath()
            ctx.arc(latest.x, latest.y, radius, 0, Math.PI * 2)
            ctx.fillStyle = `rgb(${elColorRGB})`
            ctx.shadowColor = `rgba(${elColorRGB}, ${light ? 0.75 : 0.95})`
            ctx.shadowBlur = light ? 8 : 14
            ctx.fill()
            ctx.shadowBlur = 0

            // Inner specular white hot quantum spark
            ctx.beginPath()
            ctx.arc(latest.x, latest.y, Math.max(1.0, radius * 0.42), 0, Math.PI * 2)
            ctx.fillStyle = '#FFFFFF'
            ctx.fill()

            // Micro Spin Satellite Particle (Quantum Spin s = ±1/2)
            const spinR = 3.8 * atom.scale
            const sx = latest.x + Math.cos(el.spinAngle) * spinR
            const sy = latest.y + Math.sin(el.spinAngle) * spinR

            ctx.beginPath()
            ctx.arc(sx, sy, 1.0, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${elColorRGB}, 0.82)`
            ctx.fill()
          }
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
