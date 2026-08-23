'use client'

import { useEffect, useRef, useState } from 'react'
import type { PortfolioStats } from '@/types'

function AnimatedCounter({ target, duration = 1600 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()

          const tick = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const ease = 1 - Math.pow(1 - progress, 4)
            setCount(Math.round(ease * target))
            if (progress < 1) requestAnimationFrame(tick)
          }

          requestAnimationFrame(tick)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count.toString().padStart(2, '0')}+</span>
}

interface StatItem {
  value: number
  label: string
  detail: string
}

export default function StatsSection({ stats }: { stats: PortfolioStats }) {
  const items: StatItem[] = [
    { value: Math.max(stats.projects, 4), label: 'Engineered Projects', detail: 'AI, ML & Full-Stack' },
    { value: Math.max(stats.certificates, 4), label: 'Verified Certifications', detail: 'Stanford, Google & DeepLearning.AI' },
    { value: Math.max(stats.achievements, 3), label: 'Hackathons & Awards', detail: 'MLH, OpenAI & LPU' },
    { value: 12, label: 'Core Technologies', detail: 'Python, PyTorch, TypeScript & Next.js' },
  ]

  return (
    <section
      style={{
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '48px var(--container-pad)',
        background: 'rgba(17, 17, 17, 0.4)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
        }}
        className="stats-grid"
      >
        {items.map((item, i) => (
          <div
            key={item.label}
            style={{
              padding: '24px 16px',
              borderRight: i < items.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
            }}
            className="stat-col"
          >
            <div
              style={{
                fontSize: 'clamp(40px, 4.5vw, 68px)',
                fontWeight: 600,
                letterSpacing: '-0.04em',
                lineHeight: 0.95,
                color: 'var(--color-text)',
                fontFamily: 'var(--font-sans)',
                fontVariantNumeric: 'tabular-nums',
                marginBottom: '8px',
              }}
            >
              <AnimatedCounter target={item.value} />
            </div>
            <div
              style={{
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                marginBottom: '4px',
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-muted)',
              }}
            >
              {item.detail}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stat-col { border-right: none !important; }
        }
        @media (max-width: 500px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
