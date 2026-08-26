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
 * Fetch public or authenticated repository metadata and README from GitHub API.
 */
export async function fetchGitHubRepository(
  parsed: ParsedGitHubUrl
): Promise<FetchedRepositoryData> {
  const { owner, repo, apiUrl, rawBaseUrl } = parsed
  const headers = getHeaders()

  // 1. Fetch Repository Metadata
  const repoRes = await fetch(apiUrl, { headers, next: { revalidate: 300 } })

  if (!repoRes.ok) {
    if (repoRes.status === 404) {
      throw new Error(
        `GitHub repository "${owner}/${repo}" was not found or is private. If it is private, configure GITHUB_TOKEN on the server.`
      )
    }
    if (repoRes.status === 403) {
      const rateLimitRemaining = repoRes.headers.get('x-ratelimit-remaining')
      if (rateLimitRemaining === '0') {
        throw new Error(
          'GitHub API rate limit exceeded. Please wait a moment or configure GITHUB_TOKEN in .env.local.'
        )
      }
      throw new Error('GitHub API access was forbidden. Please verify repository permissions.')
    }
    throw new Error(`GitHub API error (${repoRes.status}): ${repoRes.statusText}`)
  }

  const repoData = await repoRes.json()

  const defaultBranch = repoData.default_branch || 'main'

  const metadata: GitHubRepoMetadata = {
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

  // 2. Fetch README
  let rawReadme = ''
  try {
    const readmeRes = await fetch(`${apiUrl}/readme`, {
      headers: {
        ...headers,
        Accept: 'application/vnd.github.raw+json',
      },
    })

    if (readmeRes.ok) {
      rawReadme = await readmeRes.text()
    } else {
      // Direct raw content fallback
      const candidateFiles = ['README.md', 'readme.md', 'README', 'Readme.md']
      for (const filename of candidateFiles) {
        const rawRes = await fetch(`${rawBaseUrl}/${defaultBranch}/${filename}`)
        if (rawRes.ok) {
          rawReadme = await rawRes.text()
          break
        }
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
  const manifestChecks = COMMON_MANIFEST_FILES.map(async (filename) => {
    try {
      const res = await fetch(`${rawBaseUrl}/${defaultBranch}/${filename}`, {
        headers: { 'User-Agent': 'Portfolio-CMS-GitHub-Analyzer/1.0' },
      })
      if (!res.ok) return null
      const content = await res.text()
      return { filename, content }
    } catch {
      return null
    }
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
