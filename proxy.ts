import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Allow the login page without a session (handles both trailing slash and non-trailing slash)
  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    return NextResponse.next()
  }

  // FAST-PATH: If Supabase credentials are not configured, allow local testing of admin UI
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  // FAST-PATH: If local dev override cookie is set, allow immediate local access
  const cookies = request.cookies.getAll()
  const hasLocalDevCookie = cookies.some((c) => c.name === 'sb-local-dev-auth' && c.value === 'true')
  if (hasLocalDevCookie) {
    return NextResponse.next()
  }

  // FAST-PATH: If no Supabase auth cookies exist in request, redirect immediately in 0ms
  // without incurring an external network roundtrip
  const hasAuthCookie = cookies.some(
    (c) => c.name.includes('auth-token') || c.name.startsWith('sb-')
  )

  if (!hasAuthCookie) {
    const loginUrl = new URL('/admin/login/', request.url)
    loginUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(loginUrl)
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Fast timeout race (1.5s max) to guarantee proxy never hangs the server response
  try {
    const getUserPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null }, error: new Error('Auth timeout') }), 1500)
    )

    const {
      data: { user },
    } = await Promise.race([getUserPromise, timeoutPromise])

    if (!user) {
      const loginUrl = new URL('/admin/login/', request.url)
      loginUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(loginUrl)
    }
  } catch {
    // If Supabase network/DNS fails but auth cookie was present, allow local dev session
    if (process.env.NODE_ENV === 'development') {
      return response
    }
    const loginUrl = new URL('/admin/login/', request.url)
    loginUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
