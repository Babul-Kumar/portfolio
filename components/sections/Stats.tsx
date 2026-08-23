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
            // easeOutQuart
            const ease = 1 - Math.pow(1 - progress, 4)
            setCount(Math.round(ease * target))
            if (progress < 1) requestAnimationFrame(tick)
          }

          requestAnimationFrame(tick)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count.toString().padStart(2, '0')}</span>
}

interface StatItem {
  value: number
  label: string
}

export default function StatsSection({ stats }: { stats: PortfolioStats }) {
  const items: StatItem[] = [
    { value: stats.projects, label: 'Projects' },
    { value: stats.certificates, label: 'Certificates' },
    { value: stats.achievements, label: 'Achievements' },
    { value: stats.hackathons, label: 'Hackathons' },
  ]

  return (
    <section style={{
      borderTop: '1px solid var(--color-border)',
      borderBottom: '1px solid var(--color-border)',
      padding: '60px var(--container-pad)',
    }}>
      <div style={{
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0',
      }}>
        {items.map((item, i) => (
          <div
            key={item.label}
            style={{
              padding: '40px 0',
              textAlign: 'center',
              borderRight: i < items.length - 1 ? '1px solid var(--color-border)' : 'none',
              position: 'relative',
            }}
          >
            <div style={{
              fontSize: 'clamp(48px, 6vw, 88px)',
              fontWeight: 500,
              letterSpacing: '-0.04em',
              lineHeight: 0.9,
              color: 'var(--color-text)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              <AnimatedCounter target={item.value} />
            </div>
            <div style={{
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginTop: '12px',
            }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
