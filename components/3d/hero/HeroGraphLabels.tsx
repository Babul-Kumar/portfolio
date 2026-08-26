'use client'

import { Html } from '@react-three/drei'

interface HeroGraphLabelsProps {
  isLight: boolean
  screenSize: 'desktop' | 'tablet' | 'mobile'
}

export default function HeroGraphLabels({ isLight, screenSize }: HeroGraphLabelsProps) {
  const isMobile = screenSize === 'mobile'
  const isTablet = screenSize === 'tablet'

  const coreColor = isLight ? '#D45024' : '#FF6B35'
  const tealColor = isLight ? '#0F766E' : '#2DD4BF'

  const labelBaseStyle: React.CSSProperties = {
    fontSize: isMobile ? '8px' : isTablet ? '8.5px' : '9px',
    fontFamily: 'var(--font-mono, monospace)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: isLight ? '#141312' : '#F5F6F8',
    background: isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(15, 20, 28, 0.92)',
    border: `1px solid ${isLight ? 'rgba(20, 19, 18, 0.18)' : 'rgba(255, 255, 255, 0.18)'}`,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
    padding: '2px 6px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: 600,
    lineHeight: 1.2,
    backdropFilter: 'blur(6px)',
  }

  return (
    <group>
      {/* 1. CORE (Always visible on all screen sizes) */}
      <Html position={[0.0, 0.30, 0.0]} center distanceFactor={6}>
        <div style={labelBaseStyle}>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: coreColor }} />
          CORE
        </div>
      </Html>

      {/* 2. MODEL (Visible on Desktop & Tablet) */}
      {!isMobile && (
        <Html position={[0.0, 1.18, 0.1]} center distanceFactor={6}>
          <div style={labelBaseStyle}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: tealColor }} />
            MODEL
          </div>
        </Html>
      )}

      {/* 3. DATA (Visible on Desktop only — offset inward to guarantee zero clipping) */}
      {screenSize === 'desktop' && (
        <Html position={[-1.0, 0.52, -0.1]} center distanceFactor={6}>
          <div style={labelBaseStyle}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: coreColor }} />
            DATA
          </div>
        </Html>
      )}

      {/* 4. AGENT (Visible on Desktop only — offset inward to guarantee zero clipping) */}
      {screenSize === 'desktop' && (
        <Html position={[0.98, 0.42, 0.15]} center distanceFactor={6}>
          <div style={labelBaseStyle}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: tealColor }} />
            AGENT
          </div>
        </Html>
      )}
    </group>
  )
}
