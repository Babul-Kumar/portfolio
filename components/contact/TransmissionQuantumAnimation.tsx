'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { CheckCircle2, RotateCcw, ShieldCheck, Zap, Send } from 'lucide-react'
import { playTransmissionWarp, playMechanicalClick } from '@/lib/audio'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
  targetX?: number
  targetY?: number
  trail: { x: number; y: number }[]
}

interface Shockwave {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
  color: string
}

interface TransmissionQuantumAnimationProps {
  onReset: () => void
  senderName?: string
  txHash?: string
}

export default function TransmissionQuantumAnimation({
  onReset,
  senderName,
  txHash = 'TX-' + Math.floor(100000 + Math.random() * 900000),
}: TransmissionQuantumAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Stages: 'gathering' (0-1.1s) -> 'warping' (1.1-1.9s) -> 'afterglow' (interactive success state)
  const [stage, setStage] = useState<'gathering' | 'warping' | 'afterglow'>('gathering')
  const [progress, setProgress] = useState(0)
  const [statusLog, setStatusLog] = useState('INITIALIZING QUANTUM ENCRYPTION GATEWAY...')

  const mousePosRef = useRef<{ x: number; y: number } | null>(null)
  const stageRef = useRef<'gathering' | 'warping' | 'afterglow'>('gathering')
  stageRef.current = stage

  const particlesRef = useRef<Particle[]>([])
  const shockwavesRef = useRef<Shockwave[]>([])
  const animFrameRef = useRef<number>(0)

  // Sound trigger
  useEffect(() => {
    playTransmissionWarp()
  }, [])

  // Sequence state transitions
  useEffect(() => {
    let p = 0
    const interval = setInterval(() => {
      p += 2.5
      if (p <= 100) {
        setProgress(Math.min(100, p))
        if (p > 25 && p < 60) {
          setStatusLog('COMPRESSING DATA PACKET INTO SINGULARITY...')
        } else if (p >= 60 && p < 90) {
          setStatusLog('ALIGNING QUANTUM TUNNELING FLUX CONDUIT...')
        } else if (p >= 90) {
          setStatusLog('DISPATCHING PHOTON WARP BEAM → BABUL...')
        }
      }
    }, 28)

    const warpTimer = setTimeout(() => {
      setStage('warping')
    }, 1150)

    const afterglowTimer = setTimeout(() => {
      setStage('afterglow')
    }, 2050)

    return () => {
      clearInterval(interval)
      clearTimeout(warpTimer)
      clearTimeout(afterglowTimer)
    }
  }, [])

  // Canvas animation logic with interactive physics
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

    const colors = ['#E45D2C', '#14B8A6', '#FACC15', '#818CF8', '#FFFFFF']
    const centerX = width / 2
    const centerY = height / 2

    // Initialize Gathering Particles
    const particleCount = 55
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.max(width, height) * (0.45 + Math.random() * 0.45)
      particles.push({
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: 1.5 + Math.random() * 2.2,
        color: colors[i % colors.length],
        alpha: 0.85,
        targetX: centerX,
        targetY: centerY,
        trail: [],
      })
    }
    particlesRef.current = particles

    // Render loop
    let lastTime = performance.now()
    let shockwaveTriggered = false

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time

      ctx.clearRect(0, 0, width, height)
      const currentStage = stageRef.current
      const mouse = mousePosRef.current

      // -------------------------------------------------------------
      // STAGE 1: GATHERING (Particles spiral into center singularity)
      // -------------------------------------------------------------
      if (currentStage === 'gathering') {
        // Draw center pulse target
        const pulseR = 12 + Math.sin(time * 0.008) * 4
        ctx.beginPath()
        ctx.arc(centerX, centerY, pulseR, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(228, 93, 44, 0.45)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([3, 4])
        ctx.stroke()
        ctx.setLineDash([])

        // Glowing singularity seed
        ctx.beginPath()
        ctx.arc(centerX, centerY, 4.5, 0, Math.PI * 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.shadowColor = '#FACC15'
        ctx.shadowBlur = 14
        ctx.fill()
        ctx.shadowBlur = 0

        particles.forEach((p) => {
          const dx = centerX - p.x
          const dy = centerY - p.y
          const dist = Math.hypot(dx, dy)

          // Gravitational pull towards center
          const force = 320 / (dist + 40)
          p.vx += (dx / (dist + 1)) * force * dt * 45
          p.vy += (dy / (dist + 1)) * force * dt * 45

          // Tangential swirl
          p.vx += (-dy / (dist + 1)) * 3.5 * dt * 30
          p.vy += (dx / (dist + 1)) * 3.5 * dt * 30

          // Friction
          p.vx *= 0.95
          p.vy *= 0.95

          p.x += p.vx
          p.y += p.vy

          // Record trail
          p.trail.push({ x: p.x, y: p.y })
          if (p.trail.length > 5) p.trail.shift()

          // Draw trail
          if (p.trail.length > 1) {
            ctx.beginPath()
            ctx.moveTo(p.trail[0].x, p.trail[0].y)
            for (let t = 1; t < p.trail.length; t++) {
              ctx.lineTo(p.trail[t].x, p.trail[t].y)
            }
            ctx.strokeStyle = p.color
            ctx.lineWidth = p.radius * 0.6
            ctx.stroke()
          }

          // Draw particle
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.fill()
        })
      }

      // -------------------------------------------------------------
      // STAGE 2: WARPING (Photon beam launch & shockwave explosion)
      // -------------------------------------------------------------
      else if (currentStage === 'warping') {
        if (!shockwaveTriggered) {
          shockwaveTriggered = true
          // Add shockwaves
          shockwavesRef.current.push({
            x: centerX,
            y: centerY,
            radius: 5,
            maxRadius: Math.max(width, height) * 0.75,
            alpha: 1.0,
            color: '#14B8A6',
          })
          shockwavesRef.current.push({
            x: centerX,
            y: centerY,
            radius: 2,
            maxRadius: Math.max(width, height) * 0.6,
            alpha: 0.9,
            color: '#E45D2C',
          })

          // Explode particles outward
          particles.forEach((p) => {
            const angle = Math.random() * Math.PI * 2
            const speed = 4 + Math.random() * 9
            p.vx = Math.cos(angle) * speed
            p.vy = Math.sin(angle) * speed
            p.x = centerX
            p.y = centerY
            p.trail = []
          })
        }

        // Draw vertical warp beam with high-energy flare
        const beamGrad = ctx.createLinearGradient(centerX, 0, centerX, height)
        beamGrad.addColorStop(0, 'rgba(20, 184, 166, 0)')
        beamGrad.addColorStop(0.3, 'rgba(250, 204, 21, 0.4)')
        beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)')
        beamGrad.addColorStop(0.7, 'rgba(228, 93, 44, 0.5)')
        beamGrad.addColorStop(1, 'rgba(20, 184, 166, 0)')

        ctx.save()
        ctx.fillStyle = beamGrad
        ctx.fillRect(centerX - 16, 0, 32, height)

        // Core white-hot laser filament
        ctx.fillStyle = '#FFFFFF'
        ctx.shadowColor = '#FACC15'
        ctx.shadowBlur = 20
        ctx.fillRect(centerX - 2, 0, 4, height)
        ctx.restore()

        // Render shockwaves
        for (let sIdx = shockwavesRef.current.length - 1; sIdx >= 0; sIdx--) {
          const sw = shockwavesRef.current[sIdx]
          sw.radius += 14
          sw.alpha *= 0.93

          ctx.beginPath()
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2)
          ctx.strokeStyle = sw.color
          ctx.lineWidth = 2.5
          ctx.globalAlpha = sw.alpha
          ctx.stroke()
          ctx.globalAlpha = 1.0

          if (sw.alpha < 0.03 || sw.radius >= sw.maxRadius) {
            shockwavesRef.current.splice(sIdx, 1)
          }
        }
      }

      // -------------------------------------------------------------
      // STAGE 3: INTERACTIVE AFTERGLOW (Sparks float & react to cursor)
      // -------------------------------------------------------------
      else if (currentStage === 'afterglow') {
        particles.forEach((p) => {
          // Friction & natural gentle floating drift
          p.vx *= 0.965
          p.vy *= 0.965

          // Gentle ambient Brownian floating
          p.vx += (Math.random() - 0.5) * 0.18
          p.vy += (Math.random() - 0.5) * 0.18

          // INTERACTIVE MOUSE REPULSION PHYSICS
          if (mouse) {
            const dx = p.x - mouse.x
            const dy = p.y - mouse.y
            const dist = Math.hypot(dx, dy)
            const repelRadius = 110

            if (dist < repelRadius && dist > 1) {
              const force = (1 - dist / repelRadius) * 4.2
              p.vx += (dx / dist) * force
              p.vy += (dy / dist) * force
            }
          }

          p.x += p.vx
          p.y += p.vy

          // Soft bounce boundaries
          if (p.x < 10) { p.x = 10; p.vx = Math.abs(p.vx) * 0.8 }
          if (p.x > width - 10) { p.x = width - 10; p.vx = -Math.abs(p.vx) * 0.8 }
          if (p.y < 10) { p.y = 10; p.vy = Math.abs(p.vy) * 0.8 }
          if (p.y > height - 10) { p.y = height - 10; p.vy = -Math.abs(p.vy) * 0.8 }

          // Draw floating glowing spark
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.shadowColor = p.color
          ctx.shadowBlur = 8
          ctx.fill()
          ctx.shadowBlur = 0
        })

        // Draw dynamic interactive shockwaves on click
        for (let sIdx = shockwavesRef.current.length - 1; sIdx >= 0; sIdx--) {
          const sw = shockwavesRef.current[sIdx]
          sw.radius += 5
          sw.alpha *= 0.94

          ctx.beginPath()
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2)
          ctx.strokeStyle = sw.color
          ctx.lineWidth = 1.8
          ctx.globalAlpha = sw.alpha
          ctx.stroke()
          ctx.globalAlpha = 1.0

          if (sw.alpha < 0.03 || sw.radius >= sw.maxRadius) {
            shockwavesRef.current.splice(sIdx, 1)
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    // Interactive mouse listeners on the canvas
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const onMouseLeave = () => {
      mousePosRef.current = null
    }

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      // Spawn interactive spark ripple
      shockwavesRef.current.push({
        x: clickX,
        y: clickY,
        radius: 4,
        maxRadius: 85,
        alpha: 0.9,
        color: '#FACC15',
      })

      // Push neighboring particles outward
      particles.forEach((p) => {
        const dx = p.x - clickX
        const dy = p.y - clickY
        const dist = Math.hypot(dx, dy)
        if (dist < 100 && dist > 1) {
          p.vx += (dx / dist) * 7.0
          p.vy += (dy / dist) * 7.0
        }
      })
    }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)
    canvas.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
      canvas.removeEventListener('click', onClick)
    }
  }, [])

  // Replay animation handler
  const handleReplay = useCallback(() => {
    playMechanicalClick()
    playTransmissionWarp()
    setStage('gathering')
    setProgress(0)
    setStatusLog('INITIALIZING QUANTUM ENCRYPTION GATEWAY...')

    let p = 0
    const interval = setInterval(() => {
      p += 2.5
      if (p <= 100) {
        setProgress(Math.min(100, p))
        if (p > 30 && p < 60) {
          setStatusLog('COMPRESSING DATA PACKET INTO SINGULARITY...')
        } else if (p >= 60 && p < 90) {
          setStatusLog('ALIGNING QUANTUM TUNNELING FLUX CONDUIT...')
        } else if (p >= 90) {
          setStatusLog('DISPATCHING PHOTON WARP BEAM → BABUL...')
        }
      }
    }, 28)

    setTimeout(() => {
      setStage('warping')
    }, 1150)

    setTimeout(() => {
      setStage('afterglow')
      clearInterval(interval)
    }, 2050)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '460px',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Dynamic Background Particle Physics Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: stage === 'afterglow' ? 'auto' : 'none',
          cursor: stage === 'afterglow' ? 'crosshair' : 'default',
          zIndex: 1,
        }}
      />

      {/* -------------------------------------------------------------
          GATHERING & WARPING OVERLAY HUD
          ------------------------------------------------------------- */}
      {(stage === 'gathering' || stage === 'warping') && (
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            padding: '24px',
            maxWidth: '420px',
            width: '100%',
            pointerEvents: 'none',
          }}
        >
          {/* Status Header */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(228, 93, 44, 0.12)',
              border: '1px solid rgba(228, 93, 44, 0.35)',
              color: 'var(--color-accent)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            <Zap size={14} className="animate-pulse" />
            <span>TRANSMITTING MESSAGE</span>
          </div>

          <h3
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: '12px',
              fontFamily: 'inherit',
            }}
          >
            Routing Through Quantum Conduit
          </h3>

          <p
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
              marginBottom: '20px',
              letterSpacing: '0.04em',
              minHeight: '18px',
            }}
          >
            {statusLog}
          </p>

          {/* Precision High-Tech Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #E45D2C, #FACC15, #14B8A6)',
                boxShadow: '0 0 12px rgba(228, 93, 44, 0.8)',
                transition: 'width 0.04s linear',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '6px',
              fontSize: '10.5px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
            }}
          >
            <span>PACKET: 256-BIT SECURE</span>
            <span>{Math.floor(progress)}%</span>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          AFTERGLOW: INTERACTIVE HOLOGRAPHIC RECEIPT CARD
          ------------------------------------------------------------- */}
      {stage === 'afterglow' && (
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            padding: '36px 28px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '480px',
            width: '100%',
            background: 'rgba(var(--color-card-bg-rgb, 18, 18, 20), 0.72)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(20, 184, 166, 0.35)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35), 0 0 24px rgba(20, 184, 166, 0.12)',
            animation: 'fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Holographic Verification Badge */}
          <div
            style={{
              position: 'relative',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(20, 184, 166, 0.22) 0%, rgba(20, 184, 166, 0.05) 70%)',
              border: '1px solid rgba(20, 184, 166, 0.65)',
              color: '#14B8A6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 0 20px rgba(20, 184, 166, 0.3)',
            }}
          >
            <CheckCircle2 size={30} />
            <div
              style={{
                position: 'absolute',
                inset: '-4px',
                borderRadius: '50%',
                border: '1px dashed rgba(20, 184, 166, 0.4)',
                animation: 'spin 12s linear infinite',
              }}
            />
          </div>

          {/* Interactive Hint */}
          <div
            style={{
              fontSize: '10.5px',
              fontFamily: 'var(--font-mono)',
              color: '#14B8A6',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#14B8A6', display: 'inline-block' }} />
            <span>Interactive Quantum Sparks Active (Move cursor to repel)</span>
          </div>

          <h3
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: '10px',
              letterSpacing: '-0.01em',
            }}
          >
            Message Transmitted Successfully
          </h3>

          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              marginBottom: '20px',
              maxWidth: '380px',
            }}
          >
            Thank you for reaching out{senderName ? `, ${senderName}` : ''}! Your message has been encrypted and delivered directly to Babul&apos;s terminal.
          </p>

          {/* Cryptographic Transmission Receipt */}
          <div
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={13} color="#14B8A6" />
              <span>TRANSMISSION_HASH:</span>
              <strong style={{ color: 'var(--color-text)' }}>{txHash}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>STATUS:</span>
              <strong style={{ color: '#10B981' }}>200 OK</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={onReset}
              className="btn-primary"
              style={{
                padding: '10px 20px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Send size={13} />
              <span>Send Another Message</span>
            </button>

            <button
              type="button"
              onClick={handleReplay}
              className="btn-secondary"
              style={{
                padding: '10px 18px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
              title="Replay this quantum transmission animation"
            >
              <RotateCcw size={13} />
              <span>Replay Animation ↺</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
