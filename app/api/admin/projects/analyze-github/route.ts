import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseGitHubUrl } from '@/lib/github/normalize'
import { fetchGitHubRepository } from '@/lib/github/fetcher'
import { analyzeRepositoryWithGemini } from '@/lib/ai/github-analyzer'
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/github/cache'

export async function POST(request: NextRequest) {
  // 1. Verify admin authentication via session or service role key
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const authHeader = request.headers.get('authorization')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const isServiceAuth = Boolean(serviceKey && authHeader === `Bearer ${serviceKey}`)

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !user && !isServiceAuth) {
    return NextResponse.json({ error: 'Unauthorized. Admin login required.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { url, forceRefresh } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid GitHub repository URL.' },
        { status: 400 }
      )
    }

    // 2. Normalize and validate GitHub URL
    const parsed = parseGitHubUrl(url)
    if (!parsed) {
      return NextResponse.json(
        {
          error:
            'Invalid GitHub URL format. Please enter a URL like "https://github.com/username/repository".',
        },
        { status: 400 }
      )
    }

    const cacheKey = `${parsed.owner}/${parsed.repo}`

    // 3. Check in-memory cache unless force refresh requested
    if (!forceRefresh) {
      const cached = getCachedAnalysis(cacheKey)
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          cached: true,
        })
      }
    }

    // 4. Fetch GitHub repository data, README, and dependency manifests
    const repoData = await fetchGitHubRepository(parsed)

    // 5. Run AI Analysis
    const analysis = await analyzeRepositoryWithGemini(parsed, repoData)

    // 6. Cache analysis
    setCachedAnalysis(cacheKey, analysis)

    return NextResponse.json({
      success: true,
      data: analysis,
      cached: false,
    })
  } catch (err: unknown) {
    console.error('GitHub repository analysis error:', err)
    const message =
      err instanceof Error ? err.message : 'An error occurred while analyzing the repository.'
    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    )
  }
}
