'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectedFrom') ?? '/admin/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      padding: '0 24px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div style={{
          fontSize: '13px',
          letterSpacing: '0.15em',
          color: '#666',
          marginBottom: '8px',
          textTransform: 'uppercase',
        }}>
          BABUL KUMAR
        </div>
        <div style={{
          fontSize: '11px',
          letterSpacing: '0.1em',
          color: '#444',
          textTransform: 'uppercase',
        }}>
          Admin Access
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#666',
            marginBottom: '8px',
          }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="your@email.com"
            style={{
              width: '100%',
              background: '#1A1A1A',
              border: '1px solid #2C2C2C',
              borderRadius: '6px',
              padding: '12px 14px',
              color: '#F5F5F5',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#B65C3A'}
            onBlur={(e) => e.target.style.borderColor = '#2C2C2C'}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#666',
            marginBottom: '8px',
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            style={{
              width: '100%',
              background: '#1A1A1A',
              border: '1px solid #2C2C2C',
              borderRadius: '6px',
              padding: '12px 14px',
              color: '#F5F5F5',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#B65C3A'}
            onBlur={(e) => e.target.style.borderColor = '#2C2C2C'}
          />
        </div>

        {error && (
          <div style={{
            background: 'rgba(182, 92, 58, 0.1)',
            border: '1px solid rgba(182, 92, 58, 0.3)',
            borderRadius: '6px',
            padding: '10px 14px',
            marginBottom: '16px',
            color: '#C96B46',
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? '#2C2C2C' : '#B65C3A',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '13px',
            fontSize: '13px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => !loading && ((e.target as HTMLButtonElement).style.background = '#9E4F31')}
          onMouseLeave={(e) => !loading && ((e.target as HTMLButtonElement).style.background = '#B65C3A')}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div style={{
        marginTop: '32px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#333',
      }}>
        This is a private admin area.
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F0F0F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans, system-ui)',
    }}>
      <Suspense fallback={<div style={{ color: '#555', fontSize: '13px' }}>Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
