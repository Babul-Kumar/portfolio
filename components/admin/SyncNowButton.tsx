'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function SyncNowButton() {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)

  async function handleSync() {
    if (syncing) return
    setSyncing(true)

    try {
      const res = await fetch('/api/admin/sync', { method: 'POST' })
      const data = await res.json()

      if (res.ok && data.success) {
        toast.success('Database synchronized! Stale caches flushed.')
        router.refresh()
      } else {
        toast.error(data.error || 'Sync request failed')
      }
    } catch {
      toast.error('Sync network error — check connection')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={syncing}
      title="Synchronize real-time database state and flush stale caches"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        color: '#D1D5DB',
        padding: '9px 13px',
        borderRadius: '8px',
        fontSize: '12.5px',
        fontFamily: 'var(--font-mono, monospace)',
        cursor: syncing ? 'not-allowed' : 'pointer',
        transition: 'border-color 0.15s, background 0.15s, transform 0.15s',
      }}
      className="admin-btn-secondary-hover"
    >
      <RefreshCw
        size={13}
        style={{
          color: '#34D399',
          animation: syncing ? 'spin 0.8s linear infinite' : 'none',
        }}
      />
      <span>{syncing ? 'Syncing...' : 'Sync Live Data'}</span>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  )
}
