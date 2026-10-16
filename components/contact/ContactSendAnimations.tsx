'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, RotateCcw, Send, Globe, Sparkles, Rocket } from 'lucide-react'
import { playChirp, playMechanicalClick, playTransmissionWarp } from '@/lib/audio'

export type AnimationStyle = 'rocket' | 'globe' | 'envelope' | 'liquid' | 'plane' | 'burst' | 'laser'

interface ContactSendAnimationProps {
  style: AnimationStyle
  senderName?: string
  onReset: () => void
  onStyleChange?: (newStyle: AnimationStyle) => void
}

interface SparkParticle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  radius: number
  alpha: number
  rotation: number
  vRot: number
  shape: 'circle' | 'square' | 'line'
}

export default function ContactSendAnimation({
  style = 'rocket',
  senderName,
  onReset,
  onStyleChange,
}: ContactSendAnimationProps) {
  const [currentStyle, setCurrentStyle] = useState<AnimationStyle>(style)
  const [phase, setPhase] = useState<'animating' | 'completed'>('animating')
  const [replayKey, setReplayKey] = useState<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animIdRef = useRef<number>(0)
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Interactive 3D globe rotation state (can be dragged with mouse)
  const globeRotRef = useRef<{ x: number; y: number; isDragging: boolean; lastX: number; lastY: number }>({
    x: 0.35,
    y: 0.8,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  })

  // Trigger sound when animation starts
  useEffect(() => {
    if (currentStyle === 'rocket') {
      playTransmissionWarp()
    } else {
      playChirp()
    }
  }, [currentStyle, replayKey])

  // Synchronize state if parent changes style prop
  useEffect(() => {
    setCurrentStyle(style)
    setPhase('animating')
    setReplayKey((k) => k + 1)
  }, [style])

  // Change style callback
  const handleSelectStyle = (newStyle: AnimationStyle) => {
    playMechanicalClick()
    setCurrentStyle(newStyle)
    setPhase('animating')
    setReplayKey((k) => k + 1)
    if (onStyleChange) onStyleChange(newStyle)
  }

  // -------------------------------------------------------------------------
  // CANVAS ANIMATION LOGIC
  // -------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = container.clientWidth
    let height = container.clientHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    ctx.scale(dpr, dpr)

    const colors = ['#E45D2C', '#14B8A6', '#FACC15', '#818CF8', '#10B981', '#FFFFFF']
    const particles: SparkParticle[] = []
    let startTime = performance.now()

    // -----------------------------------------------------------------------
    // STYLE 0: 🚀 COSMIC ROCKET BOOSTER & MACH LIFTOFF (Interactive Steering)
    // -----------------------------------------------------------------------
    if (currentStyle === 'rocket') {
      const totalDuration = 1150
      const rocketTimer = setTimeout(() => {
        setPhase('completed')
      }, totalDuration)

      interface RocketSmoke {
        x: number
        y: number
        vx: number
        vy: number
        radius: number
        growth: number
        alpha: number
        color: string
      }

      interface RocketSpark {
        x: number
        y: number
        vx: number
        vy: number
        alpha: number
        color: string
        size: number
      }

      const smokeParticles: RocketSmoke[] = []
      const sparkParticles: RocketSpark[] = []
      const starStreaks: { x: number; y: number; length: number; speed: number; alpha: number }[] = []

      for (let i = 0; i < 35; i++) {
        starStreaks.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: 3 + Math.random() * 8,
          speed: 1.2 + Math.random() * 2.8,
          alpha: 0.2 + Math.random() * 0.6,
        })
      }

      const padY = Math.min(height * 0.72, 310)
      const centerX = width * 0.5
      let machShockwaveRadius = 0
      let machShockwaveAlpha = 0
      let machTriggered = false

      const renderRocket = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(1, elapsed / totalDuration)

        ctx.clearRect(0, 0, width, height)

        // 1. Starfield Streaks
        const streakSpeedMult = progress > 0.22 ? 1 + (progress - 0.22) * 8 : 1
        ctx.lineWidth = 1.2
        starStreaks.forEach((star) => {
          star.y += star.speed * streakSpeedMult
          if (star.y > height) {
            star.y = 0
            star.x = Math.random() * width
          }
          ctx.beginPath()
          ctx.moveTo(star.x, star.y)
          ctx.lineTo(star.x, star.y + star.length * (streakSpeedMult > 2 ? 2.5 : 1))
          ctx.strokeStyle = `rgba(255, 255, 255, ${star.alpha * (streakSpeedMult > 2 ? 0.7 : 0.35)})`
          ctx.stroke()
        })

        // 2. Rocket Position & Physics
        let curRocketX = centerX
        let curRocketY = padY - 45
        let rocketAngle = 0

        if (progress < 0.22) {
          // Pre-launch rumble jitter
          const rumble = (Math.random() - 0.5) * (progress * 15 + 1.2)
          curRocketX += rumble
        } else {
          // Accelerated climb
          const climbT = Math.min(1, (elapsed - 220) / (900 - 220))
          const climbDist = Math.pow(climbT, 2.3) * (padY + 120)
          curRocketY = padY - 45 - climbDist

          // Interactive steering towards mouse
          const mouseTargetX = mousePosRef.current.x || centerX
          const deltaX = (mouseTargetX - centerX) / (width * 0.5)
          const clampedDeltaX = Math.max(-1, Math.min(1, deltaX))
          rocketAngle = clampedDeltaX * 0.22 * Math.sin(climbT * Math.PI * 0.8)
          curRocketX = centerX + clampedDeltaX * 50 * Math.sin(climbT * Math.PI)

          if (climbT > 0.42 && !machTriggered) {
            machTriggered = true
            machShockwaveRadius = 16
            machShockwaveAlpha = 0.85
          }
        }

        // 3. Launchpad & Clamps (fades out gracefully as rocket ascends into orbit)
        const clampOpenProgress = Math.min(1, elapsed / 240)
        const clampAngle = clampOpenProgress * (Math.PI / 4.2)
        const padAlpha = progress < 0.35 ? 1 : Math.max(0, 1 - (progress - 0.35) / 0.22)

        if (padAlpha > 0) {
          ctx.save()
          ctx.globalAlpha = padAlpha

          // Base Pad
          ctx.fillStyle = '#18181B'
          ctx.strokeStyle = 'rgba(228, 93, 44, 0.4)'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.roundRect(centerX - 55, padY, 110, 16, 4)
          ctx.fill()
          ctx.stroke()

          // Caution Stripes
          ctx.save()
          ctx.beginPath()
          ctx.rect(centerX - 53, padY + 2, 106, 12)
          ctx.clip()
          for (let hx = -60; hx < 60; hx += 12) {
            ctx.beginPath()
            ctx.moveTo(centerX + hx, padY)
            ctx.lineTo(centerX + hx + 8, padY + 16)
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)'
            ctx.lineWidth = 3
            ctx.stroke()
          }
          ctx.restore()

          // Left Gantry Clamp
          ctx.save()
          ctx.translate(centerX - 40, padY)
          ctx.rotate(-clampAngle)
          ctx.strokeStyle = 'rgba(20, 184, 166, 0.7)'
          ctx.fillStyle = '#27272A'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.roundRect(-4, -48, 8, 48, 3)
          ctx.fill()
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(0, -48)
          ctx.lineTo(12, -42)
          ctx.stroke()
          ctx.restore()

          // Right Gantry Clamp
          ctx.save()
          ctx.translate(centerX + 40, padY)
          ctx.rotate(clampAngle)
          ctx.strokeStyle = 'rgba(20, 184, 166, 0.7)'
          ctx.fillStyle = '#27272A'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.roundRect(-4, -48, 8, 48, 3)
          ctx.fill()
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(0, -48)
          ctx.lineTo(-12, -42)
          ctx.stroke()
          ctx.restore()

          ctx.restore()
        }

        // Status HUD text
        if (progress < 0.45) {
          ctx.font = '10px monospace'
          ctx.textAlign = 'center'
          ctx.fillStyle = progress < 0.22 ? '#FACC15' : '#10B981'
          ctx.fillText(
            progress < 0.22 ? '⚡ [T-0: IGNITION SEQUENCE ACTIVE]' : '🚀 [LIFTOFF // MAX-Q CLEARED]',
            centerX,
            padY + 36
          )
        }

        // 4. Particle Generation (Exhaust & Sparks)
        if (progress < 0.88) {
          const nozzleX = curRocketX + Math.sin(rocketAngle) * 30
          const nozzleY = curRocketY + Math.cos(rocketAngle) * 30

          const smokeCount = progress < 0.22 ? 4 : 2
          for (let s = 0; s < smokeCount; s++) {
            smokeParticles.push({
              x: nozzleX + (Math.random() - 0.5) * 14,
              y: nozzleY + Math.random() * 6,
              vx: (Math.random() - 0.5) * (progress < 0.22 ? 5 : 3) - Math.sin(rocketAngle) * 2,
              vy: 2 + Math.random() * 4 + Math.cos(rocketAngle) * 3,
              radius: 6 + Math.random() * 4,
              growth: 0.45 + Math.random() * 0.3,
              alpha: 0.65,
              color: Math.random() > 0.4 ? 'rgba(228, 93, 44, ' : 'rgba(160, 160, 175, ',
            })
          }

          for (let sp = 0; sp < 3; sp++) {
            sparkParticles.push({
              x: nozzleX + (Math.random() - 0.5) * 8,
              y: nozzleY,
              vx: (Math.random() - 0.5) * 6 - Math.sin(rocketAngle) * 5,
              vy: 6 + Math.random() * 8 + Math.cos(rocketAngle) * 4,
              alpha: 1,
              color: Math.random() > 0.5 ? '#FACC15' : Math.random() > 0.5 ? '#38BDF8' : '#FFFFFF',
              size: 1.5 + Math.random() * 2,
            })
          }
        }

        // 5. Render Smoke
        for (let i = smokeParticles.length - 1; i >= 0; i--) {
          const sm = smokeParticles[i]
          sm.x += sm.vx
          sm.y += sm.vy
          sm.radius += sm.growth
          sm.alpha -= 0.018
          sm.vx *= 0.96

          if (sm.alpha <= 0) {
            smokeParticles.splice(i, 1)
            continue
          }

          ctx.beginPath()
          ctx.arc(sm.x, sm.y, sm.radius, 0, Math.PI * 2)
          ctx.fillStyle = `${sm.color}${sm.alpha})`
          ctx.fill()
        }

        // 6. Render Sparks
        for (let j = sparkParticles.length - 1; j >= 0; j--) {
          const spk = sparkParticles[j]
          spk.x += spk.vx
          spk.y += spk.vy
          spk.alpha -= 0.026
          spk.vy += 0.15

          if (spk.alpha <= 0) {
            sparkParticles.splice(j, 1)
            continue
          }

          ctx.beginPath()
          ctx.arc(spk.x, spk.y, spk.size, 0, Math.PI * 2)
          ctx.fillStyle = spk.color
          ctx.globalAlpha = spk.alpha
          ctx.shadowColor = spk.color
          ctx.shadowBlur = 6
          ctx.fill()
          ctx.shadowBlur = 0
          ctx.globalAlpha = 1
        }

        // 7. Render Mach Shockwave Ring
        if (machShockwaveAlpha > 0.02) {
          ctx.save()
          ctx.translate(centerX, curRocketY + 40)
          ctx.rotate(rocketAngle)
          ctx.beginPath()
          ctx.ellipse(0, 0, machShockwaveRadius * 1.8, machShockwaveRadius * 0.45, 0, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(56, 189, 248, ${machShockwaveAlpha})`
          ctx.lineWidth = 2.4
          ctx.shadowColor = '#38BDF8'
          ctx.shadowBlur = 12
          ctx.stroke()
          ctx.shadowBlur = 0
          ctx.restore()

          machShockwaveRadius += 4.5
          machShockwaveAlpha -= 0.025
        }

        // 8. Render Spacecraft
        if (progress < 0.95) {
          ctx.save()
          ctx.translate(curRocketX, curRocketY)
          ctx.rotate(rocketAngle)

          // Engine Flame Plume
          const flameOsc = Math.sin(now * 0.08) * 6
          const flameLen = (progress < 0.22 ? 26 : 58) + flameOsc
          const flameW = 14

          const flameGrad = ctx.createLinearGradient(0, 24, 0, 24 + flameLen)
          flameGrad.addColorStop(0, '#FFFFFF')
          flameGrad.addColorStop(0.2, '#FACC15')
          flameGrad.addColorStop(0.65, '#E45D2C')
          flameGrad.addColorStop(1, 'transparent')

          ctx.beginPath()
          ctx.moveTo(-flameW * 0.5, 24)
          ctx.quadraticCurveTo(-flameW * 0.8, 24 + flameLen * 0.4, 0, 24 + flameLen)
          ctx.quadraticCurveTo(flameW * 0.8, 24 + flameLen * 0.4, flameW * 0.5, 24)
          ctx.closePath()
          ctx.fillStyle = flameGrad
          ctx.shadowColor = '#E45D2C'
          ctx.shadowBlur = 20
          ctx.fill()
          ctx.shadowBlur = 0

          // Inner Plasma Core
          ctx.beginPath()
          ctx.moveTo(-flameW * 0.25, 24)
          ctx.quadraticCurveTo(-flameW * 0.35, 24 + flameLen * 0.35, 0, 24 + flameLen * 0.6)
          ctx.quadraticCurveTo(flameW * 0.35, 24 + flameLen * 0.35, flameW * 0.25, 24)
          ctx.closePath()
          ctx.fillStyle = '#FFFFFF'
          ctx.shadowColor = '#38BDF8'
          ctx.shadowBlur = 10
          ctx.fill()
          ctx.shadowBlur = 0

          // Mach Diamond
          if (progress > 0.22) {
            ctx.beginPath()
            ctx.moveTo(0, 36)
            ctx.lineTo(3.5, 42)
            ctx.lineTo(0, 48)
            ctx.lineTo(-3.5, 42)
            ctx.closePath()
            ctx.fillStyle = '#38BDF8'
            ctx.fill()
          }

          // Left Fin
          ctx.fillStyle = '#27272A'
          ctx.strokeStyle = '#E45D2C'
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.moveTo(-11, 4)
          ctx.lineTo(-24, 25)
          ctx.lineTo(-11, 23)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()

          // Right Fin
          ctx.beginPath()
          ctx.moveTo(11, 4)
          ctx.lineTo(24, 25)
          ctx.lineTo(11, 23)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()

          // Fuselage Body
          const bodyGrad = ctx.createLinearGradient(-12, 0, 12, 0)
          bodyGrad.addColorStop(0, '#3F3F46')
          bodyGrad.addColorStop(0.35, '#FAFAFA')
          bodyGrad.addColorStop(0.7, '#E4E4E7')
          bodyGrad.addColorStop(1, '#27272A')

          ctx.beginPath()
          ctx.moveTo(-11, -12)
          ctx.lineTo(11, -12)
          ctx.lineTo(11, 24)
          ctx.lineTo(-11, 24)
          ctx.closePath()
          ctx.fillStyle = bodyGrad
          ctx.fill()
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
          ctx.lineWidth = 1
          ctx.stroke()

          // Nosecone
          const noseGrad = ctx.createLinearGradient(-11, -38, 11, -12)
          noseGrad.addColorStop(0, '#E45D2C')
          noseGrad.addColorStop(0.4, '#FAFAFA')
          noseGrad.addColorStop(1, '#D4D4D8')

          ctx.beginPath()
          ctx.moveTo(-11, -12)
          ctx.quadraticCurveTo(0, -38, 0, -42)
          ctx.quadraticCurveTo(0, -38, 11, -12)
          ctx.closePath()
          ctx.fillStyle = noseGrad
          ctx.fill()
          ctx.stroke()

          // Nosecone Tip
          ctx.beginPath()
          ctx.arc(0, -41, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = '#E45D2C'
          ctx.fill()

          // Monogram [BK-01]
          ctx.font = 'bold 7px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillStyle = '#E45D2C'
          ctx.fillText('BK-01', 0, 17)

          // Porthole Window
          ctx.beginPath()
          ctx.arc(0, -2, 4.5, 0, Math.PI * 2)
          ctx.fillStyle = '#0284C7'
          ctx.fill()
          ctx.strokeStyle = '#FFFFFF'
          ctx.lineWidth = 1.2
          ctx.stroke()

          // Window gleam
          ctx.beginPath()
          ctx.arc(-1.2, -3.2, 1.4, 0, Math.PI * 2)
          ctx.fillStyle = '#FFFFFF'
          ctx.fill()

          // Nozzle
          ctx.beginPath()
          ctx.moveTo(-6, 24)
          ctx.lineTo(6, 24)
          ctx.lineTo(8, 29)
          ctx.lineTo(-8, 29)
          ctx.closePath()
          ctx.fillStyle = '#F97316'
          ctx.fill()
          ctx.strokeStyle = '#7C2D12'
          ctx.stroke()

          ctx.restore()
        }

        // 9. Stardust Sparkles on Orbit (progress > 0.75)
        if (progress > 0.75) {
          const starBurstAlpha = Math.max(0, 1 - (progress - 0.75) / 0.25)
          for (let b = 0; b < 14; b++) {
            const bx = centerX + (Math.sin(b * 1.5 + now * 0.005) * width) * 0.38
            const by = 80 + Math.cos(b * 2.1 + now * 0.004) * 50
            ctx.beginPath()
            ctx.arc(bx, by, 2.5, 0, Math.PI * 2)
            ctx.fillStyle = b % 2 === 0 ? '#FACC15' : '#14B8A6'
            ctx.globalAlpha = starBurstAlpha * (0.5 + Math.sin(now * 0.01 + b) * 0.5)
            ctx.shadowColor = ctx.fillStyle
            ctx.shadowBlur = 8
            ctx.fill()
            ctx.shadowBlur = 0
            ctx.globalAlpha = 1
          }
        }

        animIdRef.current = requestAnimationFrame(renderRocket)
      }

      animIdRef.current = requestAnimationFrame(renderRocket)
      return () => clearTimeout(rocketTimer)
    }

    // -----------------------------------------------------------------------
    // STYLE 1: 🌐 3D INTERACTIVE GLOBAL RADAR RELAY (Drag to rotate in 360°)
    // -----------------------------------------------------------------------
    else if (currentStyle === 'globe') {
      const globeTimer = setTimeout(() => {
        setPhase('completed')
      }, 700)

      let signalProgress = 0

      const renderGlobe = () => {
        ctx.clearRect(0, 0, width, height)

        const centerX = width * 0.5
        const centerY = 125
        const radius = 85

        const rot = globeRotRef.current
        if (!rot.isDragging) {
          rot.y += 0.007 // steady auto-rotation
        }

        signalProgress += 0.016
        if (signalProgress > 1.4) signalProgress = 0

        // Helper 3D projection
        const project3D = (lat: number, lon: number): { x: number; y: number; z: number } => {
          const x0 = radius * Math.cos(lat) * Math.sin(lon)
          const y0 = -radius * Math.sin(lat)
          const z0 = radius * Math.cos(lat) * Math.cos(lon)

          // Rotate X
          const y1 = y0 * Math.cos(rot.x) - z0 * Math.sin(rot.x)
          const z1 = y0 * Math.sin(rot.x) + z0 * Math.cos(rot.x)

          // Rotate Y
          const x2 = x0 * Math.cos(rot.y) + z1 * Math.sin(rot.y)
          const z2 = -x0 * Math.sin(rot.y) + z1 * Math.cos(rot.y)

          return {
            x: centerX + x2,
            y: centerY + y1,
            z: z2,
          }
        }

        // 1. Atmosphere Glow
        const atmoGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.6, centerX, centerY, radius * 1.25)
        atmoGrad.addColorStop(0, 'rgba(20, 184, 166, 0.08)')
        atmoGrad.addColorStop(0.7, 'rgba(20, 184, 166, 0.03)')
        atmoGrad.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius * 1.25, 0, Math.PI * 2)
        ctx.fillStyle = atmoGrad
        ctx.fill()

        // 2. Outer Ring
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(20, 184, 166, 0.35)'
        ctx.lineWidth = 1.2
        ctx.stroke()

        // 3. Draw Longitude Meridians
        const lonCount = 10
        for (let l = 0; l < lonCount; l++) {
          const lon = (l / lonCount) * Math.PI * 2
          ctx.beginPath()
          let isStarted = false
          for (let step = -18; step <= 18; step++) {
            const lat = (step / 18) * (Math.PI / 2)
            const pt = project3D(lat, lon)
            if (pt.z > 0) {
              if (!isStarted) {
                ctx.moveTo(pt.x, pt.y)
                isStarted = true
              } else {
                ctx.lineTo(pt.x, pt.y)
              }
            } else {
              isStarted = false
            }
          }
          ctx.strokeStyle = 'rgba(20, 184, 166, 0.28)'
          ctx.lineWidth = 0.85
          ctx.stroke()
        }

        // 4. Draw Latitude Parallels
        const latSteps = [-1.0, -0.65, -0.3, 0, 0.3, 0.65, 1.0]
        latSteps.forEach((latFrac) => {
          const lat = latFrac * (Math.PI / 2)
          ctx.beginPath()
          let isStarted = false
          for (let s = 0; s <= 36; s++) {
            const lon = (s / 36) * Math.PI * 2
            const pt = project3D(lat, lon)
            if (pt.z > 0) {
              if (!isStarted) {
                ctx.moveTo(pt.x, pt.y)
                isStarted = true
              } else {
                ctx.lineTo(pt.x, pt.y)
              }
            } else {
              isStarted = false
            }
          }
          ctx.strokeStyle = 'rgba(228, 93, 44, 0.22)'
          ctx.lineWidth = 0.8
          ctx.stroke()
        })

        // 5. Origin Beacon (Visitor - North America / Western Hemisphere)
        const originPt = project3D(0.65, -1.8)
        // Destination Beacon (Babul Kumar - Punjab / LPU India: ~31° N, 75° E = 0.54 rad, 1.3 rad)
        const destPt = project3D(0.54, 1.3)

        // Arced Signal Pulse connecting Origin to Destination
        ctx.beginPath()
        ctx.moveTo(originPt.x, originPt.y)
        const midLat = (0.65 + 0.54) / 2 + 0.35 // arched lift above surface
        const midLon = (-1.8 + 1.3) / 2
        const midPt = project3D(midLat, midLon)
        ctx.quadraticCurveTo(midPt.x, midPt.y, destPt.x, destPt.y)
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)'
        ctx.lineWidth = 1.4
        ctx.setLineDash([4, 4])
        ctx.stroke()
        ctx.setLineDash([])

        // Moving Photon Packet along the arc
        const pT = Math.min(1, signalProgress)
        const curPx = (1 - pT) ** 2 * originPt.x + 2 * (1 - pT) * pT * midPt.x + pT ** 2 * destPt.x
        const curPy = (1 - pT) ** 2 * originPt.y + 2 * (1 - pT) * pT * midPt.y + pT ** 2 * destPt.y

        ctx.beginPath()
        ctx.arc(curPx, curPy, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.shadowColor = '#FACC15'
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0

        // Destination Radar Ping (at Babul's location in India)
        if (destPt.z > 0) {
          const pingR = 6 + (signalProgress * 18) % 18
          const pingA = Math.max(0, 1 - pingR / 24)

          ctx.beginPath()
          ctx.arc(destPt.x, destPt.y, pingR, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(228, 93, 44, ${pingA})`
          ctx.lineWidth = 1.5
          ctx.stroke()

          // Core beacon dot
          ctx.beginPath()
          ctx.arc(destPt.x, destPt.y, 4, 0, Math.PI * 2)
          ctx.fillStyle = '#E45D2C'
          ctx.fill()
          ctx.strokeStyle = '#FFFFFF'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        // Origin Beacon dot
        if (originPt.z > 0) {
          ctx.beginPath()
          ctx.arc(originPt.x, originPt.y, 3, 0, Math.PI * 2)
          ctx.fillStyle = '#14B8A6'
          ctx.fill()
        }

        animIdRef.current = requestAnimationFrame(renderGlobe)
      }

      animIdRef.current = requestAnimationFrame(renderGlobe)
      return () => clearTimeout(globeTimer)
    }

    // -----------------------------------------------------------------------
    // STYLE 1: ✉️ 3D DIGITAL ENVELOPE & HOLOGRAPHIC WAX SEAL
    // -----------------------------------------------------------------------
    else if (currentStyle === 'envelope') {
      const totalDuration = 1250
      let stampTriggered = false

      const envelopeTimer = setTimeout(() => {
        setPhase('completed')
      }, totalDuration)

      const renderEnvelope = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(1, elapsed / totalDuration)

        ctx.clearRect(0, 0, width, height)

        const centerX = width * 0.5
        const centerY = height * 0.48

        const envW = Math.min(220, width * 0.6)
        const envH = 135

        let envY = centerY
        let envScale = 1.0
        let envAlpha = 1.0
        let envRot = 0

        if (progress > 0.6) {
          const flyT = (progress - 0.6) / 0.4
          envY = centerY - flyT * (height * 0.55 + 80)
          envScale = 1.0 + Math.sin(flyT * Math.PI) * 0.15 - flyT * 0.4
          envAlpha = Math.max(0, 1 - flyT * 1.3)
          envRot = -flyT * 0.18
        }

        ctx.save()
        ctx.translate(centerX, envY)
        ctx.rotate(envRot)
        ctx.scale(envScale, envScale)
        ctx.globalAlpha = envAlpha

        ctx.shadowColor = 'rgba(228, 93, 44, 0.35)'
        ctx.shadowBlur = 16
        ctx.fillStyle = '#1E1E24'
        ctx.strokeStyle = 'rgba(228, 93, 44, 0.7)'
        ctx.lineWidth = 1.5

        ctx.beginPath()
        ctx.roundRect(-envW / 2, -envH / 2, envW, envH, 8)
        ctx.fill()
        ctx.stroke()
        ctx.shadowBlur = 0

        ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)'
        ctx.lineWidth = 2
        for (let i = -25; i <= 25; i += 16) {
          ctx.beginPath()
          ctx.moveTo(-envW * 0.35, i)
          ctx.lineTo(envW * 0.35, i)
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.moveTo(-envW / 2, envH / 2)
        ctx.lineTo(0, 0)
        ctx.lineTo(envW / 2, envH / 2)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
        ctx.lineWidth = 1.2
        ctx.stroke()

        const flapProgress = Math.min(1, progress / 0.4)
        const foldCos = Math.cos(flapProgress * Math.PI)
        const flapTipY = -envH / 2 + (foldCos > 0 ? -foldCos * (envH * 0.48) : -foldCos * (envH * 0.48))

        ctx.beginPath()
        ctx.moveTo(-envW / 2, -envH / 2)
        ctx.lineTo(0, flapTipY)
        ctx.lineTo(envW / 2, -envH / 2)
        ctx.closePath()
        ctx.fillStyle = foldCos > 0 ? '#272730' : '#1A1A20'
        ctx.fill()
        ctx.strokeStyle = 'rgba(228, 93, 44, 0.85)'
        ctx.stroke()

        if (progress >= 0.4) {
          if (!stampTriggered) {
            stampTriggered = true
            for (let i = 0; i < 30; i++) {
              const angle = Math.random() * Math.PI * 2
              const speed = 2 + Math.random() * 6
              particles.push({
                x: centerX,
                y: envY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: colors[i % colors.length],
                radius: 1.5 + Math.random() * 2,
                alpha: 1.0,
                rotation: 0,
                vRot: 0,
                shape: 'circle',
              })
            }
          }

          const stampScale = progress < 0.48 ? 1.0 + (0.48 - progress) * 3 : 1.0
          ctx.save()
          ctx.scale(stampScale, stampScale)

          ctx.beginPath()
          ctx.arc(0, 0, 18, 0, Math.PI * 2)
          ctx.fillStyle = '#E45D2C'
          ctx.shadowColor = '#FACC15'
          ctx.shadowBlur = 14
          ctx.fill()
          ctx.shadowBlur = 0

          ctx.strokeStyle = '#FACC15'
          ctx.lineWidth = 1.5
          ctx.stroke()

          ctx.fillStyle = '#FFFFFF'
          ctx.font = 'bold 11px monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('BK', 0, 1)

          ctx.restore()
        }

        ctx.restore()

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.x += p.vx
          p.y += p.vy
          p.alpha *= 0.94
          p.radius *= 0.98

          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.alpha
          ctx.fill()
          ctx.globalAlpha = 1.0

          if (p.alpha < 0.04) particles.splice(i, 1)
        }

        if (progress < 1 || particles.length > 0) {
          animIdRef.current = requestAnimationFrame(renderEnvelope)
        }
      }

      animIdRef.current = requestAnimationFrame(renderEnvelope)
      return () => clearTimeout(envelopeTimer)
    }

    // -----------------------------------------------------------------------
    // STYLE 2: 🌊 LIQUID RIPPLE & BUTTON MORPH
    // -----------------------------------------------------------------------
    else if (currentStyle === 'liquid') {
      const liquidDuration = 850
      const liquidTimer = setTimeout(() => {
        setPhase('completed')
      }, liquidDuration)

      const centerX = width * 0.5
      const centerY = height * 0.5

      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 2 + Math.random() * 5
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: i % 2 === 0 ? '#14B8A6' : '#E45D2C',
          radius: 2 + Math.random() * 3,
          alpha: 1.0,
          rotation: 0,
          vRot: 0,
          shape: 'circle',
        })
      }

      const renderLiquid = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(1, elapsed / liquidDuration)

        ctx.clearRect(0, 0, width, height)

        for (let r = 0; r < 3; r++) {
          const rippleProgress = (progress + r * 0.2) % 1.0
          const radius = rippleProgress * Math.max(width, height) * 0.65
          const alpha = (1 - rippleProgress) * 0.55

          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
          ctx.strokeStyle = r % 2 === 0 ? 'rgba(20, 184, 166, ' + alpha + ')' : 'rgba(228, 93, 44, ' + alpha + ')'
          ctx.lineWidth = 2.5
          ctx.stroke()
        }

        const coreR = 24 + Math.sin(progress * Math.PI) * 12
        ctx.beginPath()
        ctx.arc(centerX, centerY, coreR, 0, Math.PI * 2)
        ctx.fillStyle = '#10B981'
        ctx.shadowColor = '#10B981'
        ctx.shadowBlur = 18
        ctx.fill()
        ctx.shadowBlur = 0

        if (progress > 0.3) {
          const checkProgress = Math.min(1, (progress - 0.3) / 0.5)
          ctx.save()
          ctx.strokeStyle = '#FFFFFF'
          ctx.lineWidth = 3.2
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'

          ctx.beginPath()
          const startX = centerX - 9
          const startY = centerY
          const midX = centerX - 3
          const midY = centerY + 7
          const endX = centerX + 10
          const endY = centerY - 6

          if (checkProgress < 0.5) {
            const t = checkProgress / 0.5
            ctx.moveTo(startX, startY)
            ctx.lineTo(startX + (midX - startX) * t, startY + (midY - startY) * t)
          } else {
            const t = (checkProgress - 0.5) / 0.5
            ctx.moveTo(startX, startY)
            ctx.lineTo(midX, midY)
            ctx.lineTo(midX + (endX - midX) * t, midY + (endY - midY) * t)
          }
          ctx.stroke()
          ctx.restore()
        }

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.x += p.vx
          p.y += p.vy
          p.alpha *= 0.95
          p.radius *= 0.98

          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.alpha
          ctx.fill()
          ctx.globalAlpha = 1.0

          if (p.alpha < 0.04) particles.splice(i, 1)
        }

        if (progress < 1 || particles.length > 0) {
          animIdRef.current = requestAnimationFrame(renderLiquid)
        }
      }

      animIdRef.current = requestAnimationFrame(renderLiquid)
      return () => clearTimeout(liquidTimer)
    }

    // -----------------------------------------------------------------------
    // STYLE 3: ✈️ 3D PAPER PLANE FLIGHT
    // -----------------------------------------------------------------------
    else if (currentStyle === 'plane') {
      const totalDuration = 1100
      const planeTimer = setTimeout(() => {
        setPhase('completed')
      }, totalDuration)

      const renderPlane = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(1, elapsed / totalDuration)

        ctx.clearRect(0, 0, width, height)

        const startX = width * 0.5
        const startY = height * 0.78
        const endX = width * 0.95
        const endY = height * 0.12

        const t = progress
        const cp1x = startX - 40
        const cp1y = startY + 25
        const cp2x = width * 0.65
        const cp2y = height * 0.4

        const planeX =
          (1 - t) ** 3 * startX +
          3 * (1 - t) ** 2 * t * cp1x +
          3 * (1 - t) * t ** 2 * cp2x +
          t ** 3 * endX
        const planeY =
          (1 - t) ** 3 * startY +
          3 * (1 - t) ** 2 * t * cp1y +
          3 * (1 - t) * t ** 2 * cp2y +
          t ** 3 * endY

        if (progress < 0.92) {
          for (let i = 0; i < 2; i++) {
            particles.push({
              x: planeX,
              y: planeY,
              vx: (Math.random() - 0.5) * 1.5 - 1.2,
              vy: Math.random() * 1.2 + 0.8,
              color: colors[Math.floor(Math.random() * colors.length)],
              radius: 1.5 + Math.random() * 2.5,
              alpha: 0.9,
              rotation: Math.random() * Math.PI,
              vRot: (Math.random() - 0.5) * 0.1,
              shape: 'circle',
            })
          }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.x += p.vx
          p.y += p.vy
          p.alpha *= 0.95
          p.radius *= 0.98

          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.alpha
          ctx.fill()
          ctx.globalAlpha = 1.0

          if (p.alpha < 0.05) particles.splice(i, 1)
        }

        if (progress < 0.98) {
          ctx.save()
          ctx.translate(planeX, planeY)

          const dt = 0.02
          const nextT = Math.min(1, t + dt)
          const nextX =
            (1 - nextT) ** 3 * startX +
            3 * (1 - nextT) ** 2 * nextT * cp1x +
            3 * (1 - nextT) * nextT ** 2 * cp2x +
            nextT ** 3 * endX
          const nextY =
            (1 - nextT) ** 3 * startY +
            3 * (1 - nextT) ** 2 * nextT * cp1y +
            3 * (1 - nextT) * nextT ** 2 * cp2y +
            nextT ** 3 * endY
          const angle = Math.atan2(nextY - planeY, nextX - planeX)

          ctx.rotate(angle)

          const planeScale = 1.0 + Math.sin(progress * Math.PI) * 0.25
          ctx.scale(planeScale, planeScale)

          ctx.shadowColor = 'rgba(20, 184, 166, 0.6)'
          ctx.shadowBlur = 12

          ctx.beginPath()
          ctx.moveTo(16, 0)
          ctx.lineTo(-14, -10)
          ctx.lineTo(-6, 0)
          ctx.closePath()
          ctx.fillStyle = '#FFFFFF'
          ctx.fill()

          ctx.beginPath()
          ctx.moveTo(16, 0)
          ctx.lineTo(-14, 10)
          ctx.lineTo(-6, 0)
          ctx.closePath()
          ctx.fillStyle = '#14B8A6'
          ctx.fill()

          ctx.beginPath()
          ctx.moveTo(16, 0)
          ctx.lineTo(-14, 0)
          ctx.lineTo(-8, 3)
          ctx.closePath()
          ctx.fillStyle = '#E45D2C'
          ctx.fill()

          ctx.restore()
        }

        if (progress < 1 || particles.length > 0) {
          animIdRef.current = requestAnimationFrame(renderPlane)
        }
      }

      animIdRef.current = requestAnimationFrame(renderPlane)
      return () => clearTimeout(planeTimer)
    }

    // -----------------------------------------------------------------------
    // STYLE 4: 🎉 STARDUST CONFETTI BURST
    // -----------------------------------------------------------------------
    else if (currentStyle === 'burst') {
      const centerX = width * 0.5
      const centerY = height * 0.5

      for (let i = 0; i < 75; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 3.5 + Math.random() * 8.5
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          color: colors[i % colors.length],
          radius: 2 + Math.random() * 3,
          alpha: 1.0,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
          shape: i % 3 === 0 ? 'square' : i % 3 === 1 ? 'line' : 'circle',
        })
      }

      const burstTimer = setTimeout(() => {
        setPhase('completed')
      }, 700)

      const renderBurst = () => {
        ctx.clearRect(0, 0, width, height)

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.x += p.vx
          p.y += p.vy
          p.vy += 0.16
          p.vx *= 0.97
          p.alpha *= 0.965
          p.rotation += p.vRot

          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rotation)
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = p.color
          ctx.strokeStyle = p.color

          if (p.shape === 'circle') {
            ctx.beginPath()
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2)
            ctx.fill()
          } else if (p.shape === 'square') {
            ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2)
          } else {
            ctx.lineWidth = 1.8
            ctx.beginPath()
            ctx.moveTo(-p.radius * 1.5, 0)
            ctx.lineTo(p.radius * 1.5, 0)
            ctx.stroke()
          }

          ctx.restore()
          if (p.alpha < 0.04) particles.splice(i, 1)
        }

        if (particles.length > 0) {
          animIdRef.current = requestAnimationFrame(renderBurst)
        }
      }

      animIdRef.current = requestAnimationFrame(renderBurst)
      return () => clearTimeout(burstTimer)
    }

    // -----------------------------------------------------------------------
    // STYLE 5: ⚡ CYBERNETIC LASER SCAN
    // -----------------------------------------------------------------------
    else if (currentStyle === 'laser') {
      const scanDuration = 650
      const laserTimer = setTimeout(() => {
        setPhase('completed')
      }, scanDuration)

      const renderLaser = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(1, elapsed / scanDuration)

        ctx.clearRect(0, 0, width, height)

        const scanY = progress * height

        const laserGrad = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 15)
        laserGrad.addColorStop(0, 'rgba(20, 184, 166, 0)')
        laserGrad.addColorStop(0.5, 'rgba(20, 184, 166, 0.85)')
        laserGrad.addColorStop(1, 'rgba(20, 184, 166, 0)')

        ctx.fillStyle = laserGrad
        ctx.fillRect(0, scanY - 15, width, 30)

        ctx.fillStyle = '#FFFFFF'
        ctx.shadowColor = '#14B8A6'
        ctx.shadowBlur = 10
        ctx.fillRect(0, scanY - 1, width, 2)
        ctx.shadowBlur = 0

        if (progress < 1) {
          animIdRef.current = requestAnimationFrame(renderLaser)
        }
      }

      animIdRef.current = requestAnimationFrame(renderLaser)
      return () => clearTimeout(laserTimer)
    }

    return () => {
      cancelAnimationFrame(animIdRef.current)
    }
  }, [currentStyle, replayKey])

  // Mouse interaction for Rocket steering & 3D Globe Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (currentStyle !== 'globe') return
    const rot = globeRotRef.current
    rot.isDragging = true
    rot.lastX = e.clientX
    rot.lastY = e.clientY
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    if (currentStyle === 'globe') {
      const rot = globeRotRef.current
      if (!rot.isDragging) return
      const dx = e.clientX - rot.lastX
      const dy = e.clientY - rot.lastY
      rot.lastX = e.clientX
      rot.lastY = e.clientY

      rot.y += dx * 0.008
      rot.x = Math.max(-1.2, Math.min(1.2, rot.x + dy * 0.008))
    }
  }

  const handleMouseUp = () => {
    globeRotRef.current.isDragging = false
  }

  const handleReplayCurrent = () => {
    playMechanicalClick()
    setPhase('animating')
    setReplayKey((k) => k + 1)
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: currentStyle === 'globe' ? '490px' : '450px',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: currentStyle === 'globe' ? 'flex-end' : 'center',
        padding: currentStyle === 'globe' ? '20px 20px 28px' : '30px 20px',
        cursor: currentStyle === 'globe' ? (globeRotRef.current.isDragging ? 'grabbing' : 'grab') : 'default',
      }}
    >
      {/* Animation Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* -------------------------------------------------------------
          ANIMATION SELECTOR / TESTING CONTROLS (7 Distinct Styles)
          ------------------------------------------------------------- */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10,
          display: 'flex',
          gap: '4px',
          background: 'rgba(0, 0, 0, 0.65)',
          padding: '4px 6px',
          borderRadius: '999px',
          border: '1px solid var(--color-border)',
          backdropFilter: 'blur(8px)',
          flexWrap: 'wrap',
          maxWidth: '94%',
          justifyContent: 'flex-end',
        }}
      >
        <button
          type="button"
          onClick={() => handleSelectStyle('rocket')}
          style={{
            background: currentStyle === 'rocket' ? 'var(--color-accent)' : 'transparent',
            color: currentStyle === 'rocket' ? '#FFFFFF' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: '999px',
            padding: '3px 8px',
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          🚀 1. Rocket Launch
        </button>
        <button
          type="button"
          onClick={() => handleSelectStyle('globe')}
          style={{
            background: currentStyle === 'globe' ? 'var(--color-accent)' : 'transparent',
            color: currentStyle === 'globe' ? '#FFFFFF' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: '999px',
            padding: '3px 8px',
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          🌐 2. 3D Globe
        </button>
        <button
          type="button"
          onClick={() => handleSelectStyle('envelope')}
          style={{
            background: currentStyle === 'envelope' ? 'var(--color-accent)' : 'transparent',
            color: currentStyle === 'envelope' ? '#FFFFFF' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: '999px',
            padding: '3px 8px',
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          ✉️ 3. Envelope
        </button>
        <button
          type="button"
          onClick={() => handleSelectStyle('liquid')}
          style={{
            background: currentStyle === 'liquid' ? 'var(--color-accent)' : 'transparent',
            color: currentStyle === 'liquid' ? '#FFFFFF' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: '999px',
            padding: '3px 8px',
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          🌊 4. Liquid
        </button>
        <button
          type="button"
          onClick={() => handleSelectStyle('plane')}
          style={{
            background: currentStyle === 'plane' ? 'var(--color-accent)' : 'transparent',
            color: currentStyle === 'plane' ? '#FFFFFF' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: '999px',
            padding: '3px 8px',
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          ✈️ 5. Plane
        </button>
        <button
          type="button"
          onClick={() => handleSelectStyle('burst')}
          style={{
            background: currentStyle === 'burst' ? 'var(--color-accent)' : 'transparent',
            color: currentStyle === 'burst' ? '#FFFFFF' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: '999px',
            padding: '3px 8px',
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          🎉 6. Burst
        </button>
        <button
          type="button"
          onClick={() => handleSelectStyle('laser')}
          style={{
            background: currentStyle === 'laser' ? 'var(--color-accent)' : 'transparent',
            color: currentStyle === 'laser' ? '#FFFFFF' : 'var(--color-text-muted)',
            border: 'none',
            borderRadius: '999px',
            padding: '3px 8px',
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          ⚡ 7. Laser
        </button>
      </div>

      {/* -------------------------------------------------------------
          CARD CONTENT (Revealed as animation completes)
          ------------------------------------------------------------- */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          maxWidth: '430px',
          width: '100%',
          opacity: phase === 'completed' ? 1 : 0,
          pointerEvents: phase === 'completed' ? 'auto' : 'none',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: phase === 'completed' ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.95)',
        }}
      >
        {/* Success Icon */}
        <div
          style={{
            width: currentStyle === 'globe' ? '46px' : '56px',
            height: currentStyle === 'globe' ? '46px' : '56px',
            borderRadius: '50%',
            background: currentStyle === 'rocket' ? 'rgba(228, 93, 44, 0.12)' : 'rgba(160, 185, 129, 0.12)',
            border: currentStyle === 'rocket' ? '1px solid rgba(228, 93, 44, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
            color: currentStyle === 'rocket' ? 'var(--color-accent)' : '#10B981',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: currentStyle === 'rocket' ? '0 0 20px rgba(228, 93, 44, 0.25)' : '0 0 20px rgba(16, 185, 129, 0.25)',
          }}
        >
          {currentStyle === 'rocket' ? (
            <Rocket size={26} strokeWidth={2.4} style={{ transform: 'rotate(-45deg)' }} />
          ) : (
            <Check size={currentStyle === 'globe' ? 24 : 28} strokeWidth={2.6} />
          )}
        </div>

        {currentStyle === 'rocket' && (
          <div
            style={{
              fontSize: '10.5px',
              fontFamily: 'var(--font-mono)',
              color: '#E45D2C',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            🚀 [Mission Status: 100% Orbit Insertion Dispatched]
          </div>
        )}

        {currentStyle === 'globe' && (
          <div
            style={{
              fontSize: '10.5px',
              fontFamily: 'var(--font-mono)',
              color: '#14B8A6',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            📡 [Drag globe to rotate] • Signal received in India (31.2°N, 75.7°E)
          </div>
        )}

        <h3
          style={{
            fontSize: currentStyle === 'globe' || currentStyle === 'rocket' ? '20px' : '22px',
            fontWeight: 700,
            color: 'var(--color-text)',
            marginBottom: '6px',
          }}
        >
          {currentStyle === 'rocket' ? 'Payload Dispatched to Orbit!' : 'Message Dispatched Successfully!'}
        </h3>

        <p
          style={{
            fontSize: '13.5px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
            marginBottom: '20px',
          }}
        >
          Thank you for reaching out{senderName ? `, ${senderName}` : ''}! Your message has been sent directly to Babul&apos;s inbox.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onReset}
            className="btn-primary"
            style={{
              padding: '9px 18px',
              fontSize: '11.5px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Send size={13} />
            <span>Send Another Message</span>
          </button>

          <button
            type="button"
            onClick={handleReplayCurrent}
            className="btn-secondary"
            style={{
              padding: '9px 15px',
              fontSize: '11.5px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Replay this animation"
          >
            <RotateCcw size={13} />
            <span>{currentStyle === 'rocket' ? 'Launch Again (rocket) ↺' : `Replay (${currentStyle}) ↺`}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
