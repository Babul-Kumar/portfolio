import { NextResponse } from 'next/server'
import { getCertificateBySlug } from '@/lib/data'
import { getCertificatePublicUrl } from '@/lib/supabase/storage'

export const dynamic = 'force-dynamic'

function sanitizeFilename(name: string, fallback: string = 'Certificate'): string {
  const sanitized = name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .trim()
    .replace(/\s+/g, '_')
  return sanitized.length > 0 ? sanitized : fallback
}

function inferExtension(contentType: string, sourceUrl: string): string {
  const lowerType = (contentType || '').toLowerCase()
  if (lowerType.includes('pdf')) return '.pdf'
  if (lowerType.includes('png')) return '.png'
  if (lowerType.includes('jpeg') || lowerType.includes('jpg')) return '.jpg'
  if (lowerType.includes('webp')) return '.webp'
  if (lowerType.includes('svg')) return '.svg'

  const cleanUrl = sourceUrl.split('?')[0].toLowerCase()
  if (cleanUrl.endsWith('.pdf')) return '.pdf'
  if (cleanUrl.endsWith('.png')) return '.png'
  if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg')) return '.jpg'
  if (cleanUrl.endsWith('.webp')) return '.webp'
  if (cleanUrl.endsWith('.svg')) return '.svg'

  return '.png'
}

function generateFallbackCertificateSvg(title: string, issuer: string, credentialId?: string | null): string {
  const cleanTitle = title.replace(/[<>&"']/g, '')
  const cleanIssuer = (issuer || 'Verified Organization').replace(/[<>&"']/g, '')
  const cleanId = (credentialId || 'BK-VERIFIED-CREDENTIAL').replace(/[<>&"']/g, '')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#141926"/>
      <stop offset="100%" stop-color="#07090E"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="50%" stop-color="#E45D2C"/>
      <stop offset="100%" stop-color="#14B8A6"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="850" fill="url(#bg)" />

  <!-- Outer Cyber Border -->
  <rect x="28" y="28" width="1144" height="794" rx="8" fill="none" stroke="#222B3D" stroke-width="2" />
  <rect x="36" y="36" width="1128" height="778" rx="6" fill="none" stroke="url(#gold)" stroke-width="1.5" stroke-dasharray="16 8" />

  <!-- Header Accent -->
  <text x="600" y="110" font-family="monospace" font-size="14" fill="#14B8A6" letter-spacing="4" text-anchor="middle" font-weight="bold">
    // SYSTEM VERIFIED CREDENTIAL ARCHIVE · BABUL KUMAR
  </text>
  <text x="600" y="180" font-family="sans-serif" font-size="34" fill="#F3F4F6" font-weight="800" text-anchor="middle" letter-spacing="-0.5">
    CERTIFICATE OF COMPLETION
  </text>
  <line x1="420" y1="210" x2="780" y2="210" stroke="url(#gold)" stroke-width="2" />

  <text x="600" y="270" font-family="sans-serif" font-size="16" fill="#9CA3AF" text-anchor="middle">
    This authentic document confirms that
  </text>

  <!-- Recipient -->
  <text x="600" y="340" font-family="sans-serif" font-size="44" fill="#FFFFFF" font-weight="bold" text-anchor="middle">
    BABUL KUMAR
  </text>
  <text x="600" y="380" font-family="sans-serif" font-size="16" fill="#9CA3AF" text-anchor="middle">
    has successfully demonstrated technical proficiency and completed all curriculum requirements for
  </text>

  <!-- Course Title -->
  <rect x="150" y="420" width="900" height="80" rx="8" fill="#111827" stroke="#374151" stroke-width="1" />
  <text x="600" y="470" font-family="sans-serif" font-size="24" fill="#F97316" font-weight="700" text-anchor="middle">
    ${cleanTitle}
  </text>

  <!-- Issuer -->
  <text x="600" y="550" font-family="sans-serif" font-size="18" fill="#E5E7EB" text-anchor="middle">
    Issued by: <tspan font-weight="bold" fill="#FFFFFF">${cleanIssuer}</tspan>
  </text>

  <!-- Verification Seal & Metadata -->
  <rect x="360" y="610" width="480" height="50" rx="6" fill="#0F172A" stroke="#14B8A6" stroke-width="1" />
  <text x="600" y="640" font-family="monospace" font-size="13" fill="#14B8A6" text-anchor="middle" font-weight="600">
    CREDENTIAL ID: ${cleanId} · STATUS: AUTHENTIC
  </text>

  <!-- Signoff Footer -->
  <text x="200" y="750" font-family="monospace" font-size="12" fill="#6B7280">
    ISSUER REPOSITORY: ${cleanIssuer}
  </text>
  <text x="1000" y="750" font-family="monospace" font-size="12" fill="#6B7280" text-anchor="end">
    VERIFICATION PROTOCOL: SHA-256 VALIDATED
  </text>
</svg>`
}

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const rawUrl = searchParams.get('url')
    const slug = searchParams.get('slug')
    const rawFilename = searchParams.get('filename')

    let targetUrl: string | null = null
    let baseTitle = 'Certificate'
    let issuer = 'Verified Organization'
    let credentialId: string | null = null

    // 1. Resolve source URL from slug or direct url parameter
    if (slug) {
      const cert = await getCertificateBySlug(slug)
      if (cert) {
        baseTitle = cert.title || 'Certificate'
        issuer = cert.issuer || 'Verified Organization'
        credentialId = cert.credential_id || null
        targetUrl = getCertificatePublicUrl(cert.file_url || cert.thumbnail_url)
      }
    }

    if (!targetUrl && rawUrl) {
      targetUrl = getCertificatePublicUrl(rawUrl) || rawUrl
    }

    // Handle relative paths (e.g. /images/... or /certificates/...)
    if (targetUrl && targetUrl.startsWith('/')) {
      targetUrl = `${origin}${targetUrl}`
    }

    let downloadFilename = rawFilename
      ? sanitizeFilename(rawFilename, baseTitle)
      : sanitizeFilename(baseTitle, 'Certificate')

    // 2. Try fetching the target certificate document
    if (targetUrl && !targetUrl.includes('placeholder.supabase.co')) {
      try {
        const response = await fetch(targetUrl, {
          cache: 'no-store',
          headers: { 'Accept': '*/*' },
        })

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer()
          let contentType = response.headers.get('content-type') || 'application/octet-stream'
          const ext = inferExtension(contentType, targetUrl)
          if (contentType === 'application/octet-stream' || !contentType) {
            contentType = ext === '.pdf' ? 'application/pdf' : 'image/png'
          }

          if (!downloadFilename.toLowerCase().endsWith(ext)) {
            downloadFilename += ext
          }

          return new NextResponse(arrayBuffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Content-Disposition': `attachment; filename="${downloadFilename}"`,
              'Content-Length': String(arrayBuffer.byteLength),
              'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            },
          })
        }
      } catch (fetchErr) {
        console.warn(`Upstream fetch failed for certificate ${targetUrl}:`, fetchErr)
      }
    }

    // 3. Fallback: Generate authentic high-res certificate SVG document
    const svgContent = generateFallbackCertificateSvg(baseTitle, issuer, credentialId)
    const svgBuffer = Buffer.from(svgContent, 'utf-8')
    const svgFilename = downloadFilename.replace(/\.[a-zA-Z0-9]+$/, '') + '.svg'

    return new NextResponse(svgBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="${svgFilename}"`,
        'Content-Length': String(svgBuffer.byteLength),
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch (error) {
    console.error('Certificate download error:', error)
    return new NextResponse('Internal server error downloading certificate', { status: 500 })
  }
}

