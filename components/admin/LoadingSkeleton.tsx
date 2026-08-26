'use client'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  style?: React.CSSProperties
  className?: string
}

export function Skeleton({
  width = '100%',
  height = '16px',
  borderRadius = '4px',
  style,
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`admin-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #151921 0%, #202632 50%, #151921 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.6s infinite ease-in-out',
        ...style,
      }}
    >
      <style jsx>{`
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div
      style={{
        background: '#101318',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton width="80px" height="12px" />
        <Skeleton width="18px" height="18px" borderRadius="50%" />
      </div>
      <Skeleton width="60px" height="32px" borderRadius="6px" />
      <Skeleton width="110px" height="10px" />
    </div>
  )
}

export function ContentCardSkeleton() {
  return (
    <div
      style={{
        background: '#101318',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <Skeleton width="100%" height="140px" borderRadius="8px" />
      <div style={{ display: 'flex', gap: '8px' }}>
        <Skeleton width="70px" height="20px" borderRadius="9999px" />
        <Skeleton width="60px" height="20px" borderRadius="9999px" />
      </div>
      <Skeleton width="80%" height="18px" />
      <Skeleton width="50%" height="14px" />
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
        <Skeleton width="80px" height="14px" />
        <Skeleton width="60px" height="14px" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <Skeleton width="36px" height="36px" borderRadius="6px" />
      <div style={{ flex: 2 }}>
        <Skeleton width="70%" height="14px" style={{ marginBottom: '6px' }} />
        <Skeleton width="40%" height="10px" />
      </div>
      {Array.from({ length: cols - 2 }).map((_, i) => (
        <Skeleton key={i} width="80px" height="14px" style={{ flex: 1 }} />
      ))}
      <Skeleton width="60px" height="28px" borderRadius="6px" />
    </div>
  )
}
