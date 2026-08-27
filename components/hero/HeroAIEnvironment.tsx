'use client'

import { useRef, useEffect } from 'react'

interface HeroAIEnvironmentProps {
  mouse: React.RefObject<{ x: number; y: number }>
  isLight: boolean
  reducedMotion: boolean
  coreProximity: number
}

// 4 minimal nodes on the left — purely decorative, no labels, peripheral only
const LEFT_NODES = [
  { id: 'ln1', x: 22, y: 20, r: 1.4, orange: true },
  { id: 'ln2', x: 60, y: 14, r: 1.2, orange: false },
  { id: 'ln3', x: 42, y: 50, r: 1.0, orange: true },
  { id: 'ln4', x: 18, y: 72, r: 1.2, orange: false },
]

const LEFT_EDGES = [
  ['ln1', 'ln2'],
  ['ln1', 'ln3'],
  ['ln3', 'ln4'],
]

// 4 minimal nodes on the right — peripheral, no labels
const RIGHT_NODES = [
  { id: 'rn1', x: 28, y: 18, r: 1.2, orange: false },
  { id: 'rn2', x: 72, y: 26, r: 1.4, orange: true },
  { id: 'rn3', x: 46, y: 52, r: 1.0, orange: false },
  { id: 'rn4', x: 76, y: 72, r: 1.2, orange: true },
]

const RIGHT_EDGES = [
  ['rn1', 'rn2'],
  ['rn2', 'rn3'],
  ['rn3', 'rn4'],
]

export default function HeroAIEnvironment({
  mouse,
  isLight,
  reducedMotion,
  coreProximity,
}: HeroAIEnvironmentProps) {
  const leftWingRef = useRef<HTMLDivElement>(null)
  const rightWingRef = useRef<HTMLDivElement>(null)

  // Very gentle parallax on cursor movement — max ~5px
  useEffect(() => {
    if (reducedMotion) return

    let animId: number
    let lx = 0, ly = 0, rx = 0, ry = 0

    const tick = () => {
      if (mouse.current) {
        lx += (mouse.current.x * -5 - lx) * 0.04
        ly += (mouse.current.y * -4 - ly) * 0.04
        rx += (mouse.current.x * 5 - rx) * 0.04
        ry += (mouse.current.y * 4 - ry) * 0.04

        if (leftWingRef.current) leftWingRef.current.style.transform = `translate3d(${lx}px,${ly}px,0)`
        if (rightWingRef.current) rightWingRef.current.style.transform = `translate3d(${rx}px,${ry}px,0)`
      }
      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [mouse, reducedMotion])

  const accentColor = isLight ? '#d45024' : '#f97316'
  const tealColor = isLight ? '#0f766e' : '#06b6d4'

  // Extremely low opacity by default, slightly more when near core
  const baseOpacity = coreProximity > 0.4 ? 0.28 : 0.12

  return (
    <div
      className="hero-ai-environment"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 1,
      }}
      aria-hidden="true"
    >
      {/* LEFT: 4-node ambient constellation in the far peripheral space */}
      <div
        ref={leftWingRef}
        className="ai-env-wing"
        style={{
          position: 'absolute',
          left: '-18%',
          top: '18%',
          width: '28%',
          height: '64%',
        }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="lgLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={accentColor} stopOpacity={baseOpacity} />
              <stop offset="100%" stopColor={tealColor} stopOpacity={baseOpacity} />
            </linearGradient>
          </defs>

          {LEFT_EDGES.map(([a, b], i) => {
            const fa = LEFT_NODES.find(n => n.id === a)!
            const fb = LEFT_NODES.find(n => n.id === b)!
            return (
              <line key={i} x1={fa.x} y1={fa.y} x2={fb.x} y2={fb.y}
                stroke="url(#lgLeft)" strokeWidth="0.4" strokeDasharray="2 5" opacity={baseOpacity * 2} />
            )
          })}

          {/* Single tiny animated packet */}
          {!reducedMotion && (
            <circle r="0.7" fill={accentColor} opacity={baseOpacity * 5}>
              <animateMotion path={`M${LEFT_NODES[0].x},${LEFT_NODES[0].y} L${LEFT_NODES[1].x},${LEFT_NODES[1].y} L${LEFT_NODES[2].x},${LEFT_NODES[2].y} L${LEFT_NODES[3].x},${LEFT_NODES[3].y}`} dur="9s" repeatCount="indefinite" />
            </circle>
          )}

          {LEFT_NODES.map((n) => (
            <g key={n.id} transform={`translate(${n.x},${n.y})`}>
              <circle r={n.r} fill={n.orange ? accentColor : tealColor} opacity={baseOpacity * 4.5} />
            </g>
          ))}
        </svg>
      </div>

      {/* RIGHT: 4-node ambient constellation in the far peripheral space */}
      <div
        ref={rightWingRef}
        className="ai-env-wing"
        style={{
          position: 'absolute',
          right: '-18%',
          top: '20%',
          width: '28%',
          height: '60%',
        }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="lgRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={tealColor} stopOpacity={baseOpacity} />
              <stop offset="100%" stopColor={accentColor} stopOpacity={baseOpacity} />
            </linearGradient>
          </defs>

          {RIGHT_EDGES.map(([a, b], i) => {
            const fa = RIGHT_NODES.find(n => n.id === a)!
            const fb = RIGHT_NODES.find(n => n.id === b)!
            return (
              <line key={i} x1={fa.x} y1={fa.y} x2={fb.x} y2={fb.y}
                stroke="url(#lgRight)" strokeWidth="0.4" strokeDasharray="2 5" opacity={baseOpacity * 2} />
            )
          })}

          {!reducedMotion && (
            <circle r="0.7" fill={tealColor} opacity={baseOpacity * 5}>
              <animateMotion path={`M${RIGHT_NODES[0].x},${RIGHT_NODES[0].y} L${RIGHT_NODES[1].x},${RIGHT_NODES[1].y} L${RIGHT_NODES[2].x},${RIGHT_NODES[2].y} L${RIGHT_NODES[3].x},${RIGHT_NODES[3].y}`} dur="8s" repeatCount="indefinite" />
            </circle>
          )}

          {RIGHT_NODES.map((n) => (
            <g key={n.id} transform={`translate(${n.x},${n.y})`}>
              <circle r={n.r} fill={n.orange ? accentColor : tealColor} opacity={baseOpacity * 4.5} />
            </g>
          ))}
        </svg>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .ai-env-wing { opacity: 0.6 !important; }
        }
        @media (max-width: 860px) {
          .ai-env-wing { display: none !important; }
        }
      `}</style>
    </div>
  )
}
