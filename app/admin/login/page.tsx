'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectedFrom') ?? '/admin/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isNetworkError, setIsNetworkError] = useState(false)

  function handleDevBypass() {
    document.cookie = 'sb-local-dev-auth=true; path=/; max-age=86400; SameSite=Lax'
    window.location.href = redirectTo
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setIsNetworkError(false)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        const rawMessage = authError.message || ''
        if (
          rawMessage.includes('fetch') ||
          rawMessage.includes('Failed to fetch') ||
          rawMessage.includes('network') ||
          rawMessage.includes('RESOLVED')
        ) {
          setIsNetworkError(true)
          setError(
            'Unable to reach Supabase database (ERR_NAME_NOT_RESOLVED). The Supabase URL in .env.local is unreachable. You can continue in Local Developer Mode to test the CMS dashboard.'
          )
        } else {
          setError(rawMessage)
        }
        setLoading(false)
        return
      }

      if (data?.session) {
        // Full document navigation ensures the session cookies set by @supabase/ssr
        // are sent in the HTTP request headers to Next.js middleware/proxy & server components
        window.location.href = redirectTo
      } else {
        setError('Login successful, but no active session was returned. Please verify your email.')
        setLoading(false)
      }
    } catch (err: unknown) {
      const rawMessage = err instanceof Error ? err.message : String(err)
      if (
        rawMessage.includes('fetch') ||
        rawMessage.includes('Failed to fetch') ||
        rawMessage.includes('network') ||
        rawMessage.includes('RESOLVED')
      ) {
        setIsNetworkError(true)
        setError(
          'Unable to reach Supabase database (ERR_NAME_NOT_RESOLVED). The Supabase URL in .env.local is unreachable. You can continue in Local Developer Mode to test the CMS dashboard.'
        )
      } else {
        setError(rawMessage || 'An unexpected error occurred during login.')
      }
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '420px',
        padding: '32px 24px',
        background: '#161616',
        border: '1px solid #282828',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: '36px', textAlign: 'center' }}>
        <div
          style={{
            fontSize: '12px',
            letterSpacing: '0.18em',
            color: '#B65C3A',
            marginBottom: '6px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          BABUL KUMAR PORTFOLIO
        </div>
        <div
          style={{
            fontSize: '18px',
            fontWeight: 500,
            color: '#F5F5F5',
            letterSpacing: '-0.01em',
          }}
        >
          Admin Management CMS
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '18px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#888',
              marginBottom: '8px',
              fontWeight: 500,
            }}
          >
            Admin Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="Enter your email"
            style={{
              width: '100%',
              background: '#1F1F1F',
              border: '1px solid #333',
              borderRadius: '6px',
              padding: '12px 14px',
              color: '#F5F5F5',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#B65C3A')}
            onBlur={(e) => (e.target.style.borderColor = '#333')}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#888',
              marginBottom: '8px',
              fontWeight: 500,
            }}
          >
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
              background: '#1F1F1F',
              border: '1px solid #333',
              borderRadius: '6px',
              padding: '12px 14px',
              color: '#F5F5F5',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#B65C3A')}
            onBlur={(e) => (e.target.style.borderColor = '#333')}
          />
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(182, 92, 58, 0.12)',
              border: '1px solid rgba(182, 92, 58, 0.4)',
              borderRadius: '6px',
              padding: '12px 14px',
              marginBottom: '20px',
              color: '#E07B53',
              fontSize: '13px',
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? '#333' : '#B65C3A',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '13px',
            fontSize: '13px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => !loading && ((e.target as HTMLButtonElement).style.background = '#9E4F31')}
          onMouseLeave={(e) => !loading && ((e.target as HTMLButtonElement).style.background = '#B65C3A')}
        >
          {loading ? 'Authenticating…' : 'Sign in to Dashboard'}
        </button>

        {isNetworkError && (
          <button
            type="button"
            onClick={handleDevBypass}
            style={{
              width: '100%',
              marginTop: '12px',
              background: '#1F1F1F',
              border: '1px solid #444',
              color: '#F5F5F5',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '12px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.borderColor = '#B65C3A')}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.borderColor = '#444')}
          >
            Enter Local Developer Mode →
          </button>
        )}
      </form>

      <div
        style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid #242424',
          textAlign: 'center',
          fontSize: '11px',
          color: '#555',
          lineHeight: 1.6,
        }}
      >
        Authorized access only. Authentication is secured by Supabase Auth with RLS policies.
        <div style={{ marginTop: '12px' }}>
          <button
            type="button"
            onClick={handleDevBypass}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '10px',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              textDecoration: 'underline',
              padding: 0,
            }}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.color = '#B65C3A')}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.color = '#888')}
          >
            Running locally or offline? Access via Local Dev Mode
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0D0D0D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'var(--font-sans, system-ui)',
      }}
    >
      <Suspense fallback={<div style={{ color: '#555', fontSize: '13px' }}>Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
