import { NextResponse } from 'next/server'
import { getProfile, getSiteSetting } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [settingUrl, profile] = await Promise.all([
      getSiteSetting('resume_url'),
      getProfile(),
    ])

    const resumeUrl = settingUrl || profile?.resume_url || null

    if (!resumeUrl) {
      return new NextResponse('Resume document not configured', { status: 404 })
    }

    const response = await fetch(resumeUrl, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return new NextResponse('Failed to fetch resume file', { status: 502 })
    }

    const arrayBuffer = await response.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Babul_Kumar_Resume.pdf"',
        'Content-Length': String(arrayBuffer.byteLength),
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Resume download error:', error)
    return new NextResponse('Internal server error downloading resume', { status: 500 })
  }
}
