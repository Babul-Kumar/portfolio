'use client'

import { Sparkles, Star } from 'lucide-react'

interface StatusBadgeProps {
  type: 'published' | 'draft' | 'featured' | 'ai' | 'category' | 'count' | 'neutral'
  label?: string
  count?: number
  size?: 'sm' | 'md'
}

export default function StatusBadge({
  type,
  label,
  count,
  size = 'sm',
}: StatusBadgeProps) {
  const isSm = size === 'sm'
  const padding = isSm ? '2px 8px' : '4px 10px'
  const fontSize = isSm ? '11px' : '12px'

  switch (type) {
    case 'published':
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding,
            fontSize,
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#10B981',
            border: '1px solid rgba(16, 185, 129, 0.28)',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
            }}
          />
          {label || 'Published'}
        </span>
      )

    case 'draft':
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding,
            fontSize,
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#8A8F98',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontWeight: 500,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#6B7280',
            }}
          />
          {label || 'Draft'}
        </span>
      )

    case 'featured':
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding,
            fontSize,
            borderRadius: '9999px',
            background: 'rgba(228, 93, 44, 0.12)',
            color: '#E45D2C',
            border: '1px solid rgba(228, 93, 44, 0.3)',
            fontWeight: 600,
          }}
        >
          <Star size={isSm ? 11 : 13} fill="#E45D2C" />
          {label || 'Featured'}
        </span>
      )

    case 'ai':
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding,
            fontSize,
            borderRadius: '9999px',
            background: 'rgba(168, 85, 247, 0.12)',
            color: '#C084FC',
            border: '1px solid rgba(168, 85, 247, 0.28)',
            fontWeight: 500,
          }}
        >
          <Sparkles size={isSm ? 11 : 13} />
          {label || 'AI Parsed'}
        </span>
      )

    case 'category':
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding,
            fontSize,
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.06)',
            color: '#D1D5DB',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </span>
      )

    case 'count':
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '1px 6px',
            fontSize: '11px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#9CA3AF',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 600,
          }}
        >
          {count ?? 0}
        </span>
      )

    default:
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding,
            fontSize,
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.04)',
            color: '#9CA3AF',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {label}
        </span>
      )
  }
}
