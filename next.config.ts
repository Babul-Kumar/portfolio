import type { NextConfig } from 'next'

let supabaseHostname: string | undefined
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  }
} catch {
  // Ignore invalid URL in build/fallback mode
}

const isStaticExport =
  process.env.NEXT_PUBLIC_UNOPTIMIZED_IMAGES === 'true' ||
  process.env.GITHUB_PAGES === 'true' ||
  process.env.BUILD_TARGET === 'static'

const nextConfig: NextConfig = {
  devIndicators: false,
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  images: {
    unoptimized: isStaticExport,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      ...(supabaseHostname
        ? [
            {
              protocol: 'https' as const,
              hostname: supabaseHostname,
              pathname: '/storage/v1/object/**',
            },
          ]
        : []),
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
      {
        source: '/projects',
        destination: '/work/',
        permanent: true,
      },
      {
        source: '/projects/:slug',
        destination: '/work/:slug/',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
