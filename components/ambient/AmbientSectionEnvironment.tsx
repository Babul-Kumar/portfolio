'use client'

import { useSyncExternalStore } from 'react'

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
  intensity?: number
  accentMode?: AccentMode
  className?: string
}

export default function AmbientSectionEnvironment({
  variant,
  intensity = 0.5,
  accentMode = 'dual',
  className = '',
}: AmbientSectionEnvironmentProps) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark' as const)
  const isLight = theme === 'light'

  // Lightweight pure CSS ambient section wash — zero JS canvas overhead
  const orangeRgb = isLight ? '212, 72, 28' : '228, 93, 44'
  const cyanRgb = isLight ? '13, 122, 112' : '20, 184, 166'

  let primaryColor = cyanRgb
  if (accentMode === 'orange') primaryColor = orangeRgb
  else if (accentMode === 'dual') primaryColor = variant === 'architecture' || variant === 'engineering' ? orangeRgb : cyanRgb

  const opacity = Math.min(0.08, (isLight ? 0.03 : 0.05) * intensity)

  return (
    <div
      className={`ambient-section-environment ambient-variant-${variant} ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        background: `radial-gradient(ellipse at 85% 20%, rgba(${primaryColor}, ${opacity}) 0%, transparent 65%)`,
        contain: 'strict',
      }}
      aria-hidden="true"
    />
  )
}
