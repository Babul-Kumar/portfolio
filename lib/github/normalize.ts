/**
 * GitHub URL Normalization & Validation Helper
 * 
 * Supports URLs such as:
 * - https://github.com/owner/repo
 * - http://github.com/owner/repo
 * - github.com/owner/repo
 * - https://github.com/owner/repo/tree/main/subfolder
 * - https://github.com/owner/repo/blob/master/README.md
 * - https://github.com/owner/repo.git
 * - owner/repo
 */

export interface ParsedGitHubUrl {
  owner: string
  repo: string
  canonicalUrl: string
  apiUrl: string
  rawBaseUrl: string
}

export function parseGitHubUrl(inputUrl: string): ParsedGitHubUrl | null {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return null
  }

  const trimmed = inputUrl.trim()
  if (!trimmed) {
    return null
  }

  // Remove trailing slashes and .git
  let cleaned = trimmed.replace(/\/+$/, '').replace(/\.git$/i, '')

  // Remove protocol
  cleaned = cleaned.replace(/^https?:\/\//i, '')

  // Remove leading www.
  cleaned = cleaned.replace(/^www\./i, '')

  // If a domain is specified, it MUST be github.com
  if (cleaned.includes('.')) {
    const firstSegment = cleaned.split('/')[0].toLowerCase()
    if (firstSegment.includes('.') && firstSegment !== 'github.com') {
      // Non-GitHub domain e.g. gitlab.com, bitbucket.org, etc.
      return null
    }
  }

  // If starts with github.com/, strip it
  if (cleaned.toLowerCase().startsWith('github.com/')) {
    cleaned = cleaned.substring('github.com/'.length)
  } else if (cleaned.toLowerCase() === 'github.com') {
    return null
  }

  // Extract owner and repo from path segments
  const segments = cleaned.split('/').filter(Boolean)

  if (segments.length < 2) {
    return null
  }

  const owner = segments[0].trim()
  const repo = segments[1].trim()

  // Validate owner and repo names (GitHub characters: alphanumeric, dashes, underscores, dots)
  const validNameRegex = /^[a-zA-Z0-9_.-]+$/
  if (!validNameRegex.test(owner) || !validNameRegex.test(repo)) {
    return null
  }

  // Owner should not be a domain or reserved word
  if (owner.includes('.')) {
    return null
  }

  // Avoid reserved GitHub top-level paths
  const reservedPaths = [
    'explore',
    'trending',
    'features',
    'topics',
    'collections',
    'events',
    'settings',
    'login',
    'join',
    'contact',
    'about',
    'pricing',
    'security',
    'sponsors',
  ]
  if (reservedPaths.includes(owner.toLowerCase())) {
    return null
  }

  const canonicalUrl = `https://github.com/${owner}/${repo}`
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`
  const rawBaseUrl = `https://raw.githubusercontent.com/${owner}/${repo}`

  return {
    owner,
    repo,
    canonicalUrl,
    apiUrl,
    rawBaseUrl,
  }
}
