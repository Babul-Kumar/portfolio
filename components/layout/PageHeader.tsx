'use client'

interface PageHeaderProps {
  moduleTag: string
  title: string | React.ReactNode
  quote?: string
  description?: string
  statusBadge?: string
  accentColor?: string
}

export default function PageHeader({
  moduleTag,
  title,
  quote,
  description,
  statusBadge = 'LIVE_MODULE_ACTIVE',
  accentColor = 'var(--color-accent)',
}: PageHeaderProps) {
  return (
    <header
      style={{
        marginBottom: '36px',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: '24px',
        position: 'relative',
      }}
    >
      {/* Top HUD Telemetry Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '14px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: accentColor,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: accentColor,
              boxShadow: `0 0 8px ${accentColor}`,
            }}
          />
          <span>{moduleTag}</span>
        </div>

        {statusBadge && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10px',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.08em',
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 8px #10B981',
                animation: 'cyberPulseDot 2s ease-in-out infinite',
              }}
            />
            <span>{statusBadge}</span>
          </div>
        )}
      </div>

      {/* Main Title Display */}
      <h1
        className="text-display"
        style={{
          margin: '0 0 14px',
          maxWidth: '820px',
          fontSize: 'clamp(24px, 3.4vw, 40px)',
          lineHeight: 1.15,
          letterSpacing: '-0.025em',
        }}
      >
        {title}
      </h1>

      {/* Subtitle / Filosofia Quote */}
      {quote && (
        <div
          style={{
            fontSize: '13.5px',
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--color-accent)',
            marginBottom: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--color-accent-bg, rgba(228, 93, 44, 0.08))',
            border: '1px solid var(--color-accent-border, rgba(228, 93, 44, 0.2))',
            padding: '3px 10px',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <span>&ldquo;{quote}&rdquo;</span>
        </div>
      )}

      {/* Body Description */}
      {description && (
        <p
          style={{
            fontSize: 'clamp(13.5px, 1.05vw, 15px)',
            color: 'var(--color-text-secondary)',
            maxWidth: '680px',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {description}
        </p>
      )}

      {/* Cyber Technical Divider Beam */}
      <div
        style={{
          position: 'absolute',
          bottom: '-1px',
          left: 0,
          width: '140px',
          height: '2px',
          background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)`,
          boxShadow: `0 0 12px ${accentColor}`,
        }}
      />
      <style>{`
        @keyframes cyberPulseDot {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.45;
            transform: scale(0.85);
          }
        }
      `}</style>
    </header>
  )
}
