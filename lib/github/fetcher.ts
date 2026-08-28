import type { GitHubRepoMetadata } from '@/types'
import { ParsedGitHubUrl } from './normalize'
import { sanitizeReadme, extractCandidateScreenshots, normalizeTechnologies } from './cleaner'

export interface FetchedRepositoryData {
  metadata: GitHubRepoMetadata
  rawReadme: string
  sanitizedReadme: string
  candidateImages: string[]
  detectedDependencies: string[]
  manifestSummary: string | null
}

const COMMON_MANIFEST_FILES = [
  'package.json',
  'requirements.txt',
  'pyproject.toml',
  'go.mod',
  'Cargo.toml',
  'pubspec.yaml',
  'composer.json',
  'pom.xml',
  'Dockerfile',
  'docker-compose.yml',
]

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'User-Agent': 'Portfolio-CMS-GitHub-Analyzer/1.0',
    Accept: 'application/vnd.github.v3+json',
  }

  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_API_KEY
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

/**
 * Scrapes repository metadata and default branch from public GitHub HTML and raw CDN
 * when the GitHub REST API is rate-limited (403) or unauthenticated.
 */
async function scrapePublicGitHubRepo(parsed: ParsedGitHubUrl): Promise<GitHubRepoMetadata> {
  const { owner, repo, canonicalUrl, rawBaseUrl } = parsed

  let html = ''
  let defaultBranch = 'main'
  let description: string | null = null
  let homepage: string | null = null
  let language: string | null = null
  const topics: string[] = []
  let stars = 0
  let forks = 0

  try {
    const res = await fetch(canonicalUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 300 },
    })

    if (res.status === 404) {
      throw new Error(
        `GitHub repository "${owner}/${repo}" was not found or is private. If it is private, configure GITHUB_TOKEN in .env.local.`
      )
    }

    if (res.ok) {
      html = await res.text()
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('was not found or is private')) {
      throw err
    }
    console.warn(`Public web fetch failed for ${owner}/${repo}:`, err)
  }

  if (html) {
    // 1. Try extracting from embedded JSON payload (modern GitHub embeds SSR state)
    try {
      const matchDefaultBranch = html.match(/"defaultBranch"\s*:\s*"([^"]+)"/)
      if (matchDefaultBranch && matchDefaultBranch[1]) {
        defaultBranch = matchDefaultBranch[1]
      }

      const matchDesc = html.match(/"description"\s*:\s*"([^"]+)"/)
      if (matchDesc && matchDesc[1]) {
        description = matchDesc[1]
      }

      const matchWebsite = html.match(/"website"\s*:\s*"([^"]+)"/)
      if (matchWebsite && matchWebsite[1]) {
        homepage = matchWebsite[1]
      }

      const matchStars = html.match(/"stargazerCount"\s*:\s*(\d+)/)
      if (matchStars && matchStars[1]) {
        stars = parseInt(matchStars[1], 10)
      }

      const matchForks = html.match(/"forksCount"\s*:\s*(\d+)/)
      if (matchForks && matchForks[1]) {
        forks = parseInt(matchForks[1], 10)
      }

      const matchTopics = html.match(/"topics"\s*:\s*\[([^\]]*)\]/)
      if (matchTopics && matchTopics[1]) {
        const topicItems = matchTopics[1].match(/"([^"]+)"/g)
        if (topicItems) {
          topics.push(...topicItems.map((t) => t.replace(/"/g, '')))
        }
      }
    } catch {
      // Ignore JSON extraction errors
    }

    // 2. Fallback meta tag extraction
    if (!description) {
      const metaDesc =
        html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
        html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i)
      if (metaDesc && metaDesc[1]) {
        const d = metaDesc[1].trim()
        if (!d.startsWith('Contribute to ') && !d.includes('development by creating an account on GitHub')) {
          description = d
        }
      }
    }

    // 3. Fallback language extraction
    if (!language) {
      const langMatch = html.match(/itemprop=["']programmingLanguage["'][^>]*>([^<]+)<\/span>/i)
      if (langMatch && langMatch[1]) {
        language = langMatch[1].trim()
      }
    }

    // 4. Fallback topics extraction from HTML
    if (topics.length === 0) {
      const topicMatches = html.matchAll(/href=["']\/topics\/([a-zA-Z0-9_-]+)["']/g)
      for (const m of topicMatches) {
        if (m[1] && !topics.includes(m[1])) {
          topics.push(m[1])
        }
      }
    }
  }

  // 5. Probe default branch on raw CDN if uncertain
  if (defaultBranch === 'main') {
    try {
      const mainCheck = await fetch(`${rawBaseUrl}/main/README.md`, { method: 'HEAD' })
      if (!mainCheck.ok) {
        const masterCheck = await fetch(`${rawBaseUrl}/master/README.md`, { method: 'HEAD' })
        if (masterCheck.ok) {
          defaultBranch = 'master'
        }
      }
    } catch {
      // keep default 'main'
    }
  }

  return {
    name: repo,
    full_name: `${owner}/${repo}`,
    owner: owner,
    description: description,
    stars: stars,
    forks: forks,
    language: language,
    topics: Array.from(new Set(topics)),
    default_branch: defaultBranch,
    license: null,
    created_at: '',
    updated_at: '',
    homepage: homepage,
    has_readme: false,
  }
}

/**
 * Fetch public or authenticated repository metadata and README from GitHub API.
 * Gracefully falls back to public web scraping and raw CDN if API rate limits are exceeded.
 */
export async function fetchGitHubRepository(
  parsed: ParsedGitHubUrl
): Promise<FetchedRepositoryData> {
  const { owner, repo, apiUrl, rawBaseUrl } = parsed
  const headers = getHeaders()

  let metadata: GitHubRepoMetadata | null = null
  let defaultBranch = 'main'
  let isRateLimited = false

  // 1. Fetch Repository Metadata
  try {
    const repoRes = await fetch(apiUrl, { headers, next: { revalidate: 300 } })

    if (repoRes.ok) {
      const repoData = await repoRes.json()
      defaultBranch = repoData.default_branch || 'main'

      metadata = {
        name: repoData.name || repo,
        full_name: repoData.full_name || `${owner}/${repo}`,
        owner: repoData.owner?.login || owner,
        description: repoData.description || null,
        stars: repoData.stargazers_count || 0,
        forks: repoData.forks_count || 0,
        language: repoData.language || null,
        topics: Array.isArray(repoData.topics) ? repoData.topics : [],
        default_branch: defaultBranch,
        license: repoData.license?.name || repoData.license?.spdx_id || null,
        created_at: repoData.created_at || '',
        updated_at: repoData.updated_at || '',
        homepage: repoData.homepage || null,
        has_readme: false,
      }
    } else if (repoRes.status === 403) {
      console.warn(
        `GitHub API rate limit reached for ${owner}/${repo}. Falling back to raw CDN & web extraction.`
      )
      isRateLimited = true
    } else if (repoRes.status === 404) {
      // Could be private or nonexistent
      const webCheck = await fetch(parsed.canonicalUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      }).catch(() => null)

      if (!webCheck || webCheck.status === 404) {
        throw new Error(
          `GitHub repository "${owner}/${repo}" was not found or is private. If it is private, configure GITHUB_TOKEN on the server.`
        )
      }
      isRateLimited = true
    } else {
      isRateLimited = true
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('was not found or is private')) {
      throw err
    }
    console.warn(`GitHub API request failed for ${owner}/${repo}:`, err)
    isRateLimited = true
  }

  // Fallback to web scraping & raw CDN if API was rate-limited or failed
  if (!metadata || isRateLimited) {
    metadata = await scrapePublicGitHubRepo(parsed)
    defaultBranch = metadata.default_branch || 'main'
  }

  // 2. Fetch README
  let rawReadme = ''
  try {
    // Only query api.github.com/readme if not rate limited
    if (!isRateLimited) {
      const readmeRes = await fetch(`${apiUrl}/readme`, {
        headers: {
          ...headers,
          Accept: 'application/vnd.github.raw+json',
        },
      })
      if (readmeRes.ok) {
        rawReadme = await readmeRes.text()
      }
    }

    if (!rawReadme) {
      // Direct raw content fallback from raw.githubusercontent.com
      const candidateFiles = [
        'README.md',
        'readme.md',
        'README',
        'Readme.md',
        'README.markdown',
        'readme.markdown',
        'README.txt',
      ]
      const branchesToTry = Array.from(new Set([defaultBranch, 'main', 'master']))

      for (const branch of branchesToTry) {
        for (const filename of candidateFiles) {
          try {
            const rawRes = await fetch(`${rawBaseUrl}/${branch}/${filename}`)
            if (rawRes.ok) {
              rawReadme = await rawRes.text()
              defaultBranch = branch
              metadata.default_branch = branch
              break
            }
          } catch {
            // continue
          }
        }
        if (rawReadme) break
      }
    }
  } catch (err) {
    console.warn('README fetch failed:', err)
  }

  metadata.has_readme = Boolean(rawReadme.trim())

  // 3. Extract candidate screenshots from README
  const candidateImages = extractCandidateScreenshots(rawReadme, rawBaseUrl, defaultBranch)

  // 4. Sanitize README
  const sanitizedReadme = sanitizeReadme(rawReadme)

  // 5. Inspect Dependency Manifests
  const detectedDependencies: string[] = []
  const manifestSnippets: string[] = []

  if (metadata.language) {
    detectedDependencies.push(metadata.language)
  }
  for (const topic of metadata.topics) {
    detectedDependencies.push(topic)
  }

  // Probe manifest files concurrently
  const branchesToTry = Array.from(new Set([defaultBranch, 'main', 'master']))

  const manifestChecks = COMMON_MANIFEST_FILES.map(async (filename) => {
    for (const branch of branchesToTry) {
      try {
        const res = await fetch(`${rawBaseUrl}/${branch}/${filename}`, {
          headers: { 'User-Agent': 'Portfolio-CMS-GitHub-Analyzer/1.0' },
        })
        if (res.ok) {
          const content = await res.text()
          return { filename, content }
        }
      } catch {
        // continue
      }
    }
    return null
  })

  const manifestResults = await Promise.all(manifestChecks)

  for (const item of manifestResults) {
    if (!item) continue
    const { filename, content } = item

    if (filename === 'package.json') {
      try {
        const pkg = JSON.parse(content)
        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
        }
        const depKeys = Object.keys(allDeps)
        for (const dep of depKeys) {
          detectedDependencies.push(dep)
        }
        manifestSnippets.push(
          `package.json Dependencies: ${depKeys.slice(0, 25).join(', ')}`
        )
      } catch {
        // Ignored json parse error
      }
    } else if (filename === 'requirements.txt' || filename === 'pyproject.toml') {
      const lines = content
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'))
      for (const line of lines.slice(0, 20)) {
        const pkgName = line.split(/[=<>~]/)[0].trim()
        if (pkgName) detectedDependencies.push(pkgName)
      }
      manifestSnippets.push(`Python Requirements: ${lines.slice(0, 15).join(', ')}`)
    } else if (filename === 'Cargo.toml') {
      manifestSnippets.push('Rust Cargo.toml detected')
      detectedDependencies.push('Rust')
    } else if (filename === 'go.mod') {
      manifestSnippets.push('Go go.mod detected')
      detectedDependencies.push('Go')
    } else if (filename === 'Dockerfile' || filename === 'docker-compose.yml') {
      detectedDependencies.push('Docker')
    }
  }

  const normalizedDeps = normalizeTechnologies(detectedDependencies)

  return {
    metadata,
    rawReadme,
    sanitizedReadme,
    candidateImages,
    detectedDependencies: normalizedDeps,
    manifestSummary: manifestSnippets.join(' | ') || null,
  }
}
