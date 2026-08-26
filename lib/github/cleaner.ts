/**
 * README Content Sanitizer & Technology Normalizer
 */

const BADGE_PATTERNS = [
  /\[!\[.*?\]\(https?:\/\/img\.shields\.io\/.*?\)\]\(.*?\)/gi,
  /!\[.*?\]\(https?:\/\/img\.shields\.io\/.*?\)/gi,
  /\[!\[.*?\]\(https?:\/\/badge\.fury\.io\/.*?\)\]\(.*?\)/gi,
  /!\[.*?\]\(https?:\/\/badge\.fury\.io\/.*?\)/gi,
  /\[!\[.*?\]\(https?:\/\/github\.com\/.*?\/workflows\/.*?\/badge\.svg\)\]\(.*?\)/gi,
  /!\[.*?\]\(https?:\/\/github\.com\/.*?\/workflows\/.*?\/badge\.svg\)/gi,
  /\[!\[.*?\]\(https?:\/\/codecov\.io\/.*?\)\]\(.*?\)/gi,
  /!\[.*?\]\(https?:\/\/codecov\.io\/.*?\)/gi,
  /\[!\[.*?\]\(https?:\/\/sonarcloud\.io\/.*?\)\]\(.*?\)/gi,
]

const KNOWN_TECH_MAP: Record<string, string> = {
  react: 'React',
  reactjs: 'React',
  'react.js': 'React',
  next: 'Next.js',
  nextjs: 'Next.js',
  'next.js': 'Next.js',
  vue: 'Vue.js',
  vuejs: 'Vue.js',
  'vue.js': 'Vue.js',
  angular: 'Angular',
  svelte: 'Svelte',
  sveltekit: 'SvelteKit',
  nuxt: 'Nuxt.js',
  nuxtjs: 'Nuxt.js',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  javascript: 'JavaScript',
  js: 'JavaScript',
  python: 'Python',
  py: 'Python',
  pytorch: 'PyTorch',
  tensorflow: 'TensorFlow',
  keras: 'Keras',
  scikitlearn: 'scikit-learn',
  'scikit-learn': 'scikit-learn',
  sklearn: 'scikit-learn',
  fastapi: 'FastAPI',
  flask: 'Flask',
  django: 'Django',
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  node: 'Node.js',
  express: 'Express',
  expressjs: 'Express',
  'express.js': 'Express',
  nestjs: 'NestJS',
  'nest.js': 'NestJS',
  tailwind: 'Tailwind CSS',
  tailwindcss: 'Tailwind CSS',
  'tailwind-css': 'Tailwind CSS',
  supabase: 'Supabase',
  firebase: 'Firebase',
  postgresql: 'PostgreSQL',
  postgres: 'PostgreSQL',
  mongodb: 'MongoDB',
  mongo: 'MongoDB',
  redis: 'Redis',
  prisma: 'Prisma',
  drizzle: 'Drizzle ORM',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  k8s: 'Kubernetes',
  graphql: 'GraphQL',
  gemini: 'Google Gemini',
  openai: 'OpenAI',
  langchain: 'LangChain',
  llamaindex: 'LlamaIndex',
  huggingface: 'Hugging Face',
  transformers: 'Transformers',
  rust: 'Rust',
  golang: 'Go',
  go: 'Go',
  flutter: 'Flutter',
  dart: 'Dart',
  reactnative: 'React Native',
  'react-native': 'React Native',
  solidity: 'Solidity',
  web3: 'Web3.js',
  ethers: 'Ethers.js',
  'ethers.js': 'Ethers.js',
  aws: 'AWS',
  gcp: 'Google Cloud',
  azure: 'Microsoft Azure',
  vercel: 'Vercel',
}

/**
 * Normalizes a list of technology strings (deduplicates & matches standard casing).
 */
export function normalizeTechnologies(techs: string[]): string[] {
  if (!Array.isArray(techs)) return []

  const result = new Set<string>()

  for (const raw of techs) {
    if (!raw || typeof raw !== 'string') continue
    const trimmed = raw.trim()
    if (!trimmed) continue

    const lookupKey = trimmed.toLowerCase().replace(/[^a-z0-9.-]/g, '')
    const canonical = KNOWN_TECH_MAP[lookupKey] || trimmed

    result.add(canonical)
  }

  return Array.from(result)
}

/**
 * Extracts candidate project screenshot URLs from markdown before badge stripping.
 */
export function extractCandidateScreenshots(
  markdown: string,
  rawBaseUrl: string,
  defaultBranch = 'main'
): string[] {
  const images: string[] = []
  const imgRegex = /!\[(.*?)\]\((.*?)\)/g
  let match: RegExpExecArray | null

  while ((match = imgRegex.exec(markdown)) !== null) {
    const alt = match[1]?.toLowerCase() || ''
    const src = match[2]?.trim() || ''

    if (!src) continue

    // Skip badge images, shields, avatars, and icons
    if (
      src.includes('img.shields.io') ||
      src.includes('badge.fury.io') ||
      src.includes('github.com/workflows') ||
      src.includes('codecov.io') ||
      src.includes('sonarcloud.io') ||
      src.includes('github-readme-stats') ||
      src.includes('github-profile-summary-cards') ||
      src.includes('license') ||
      alt.includes('badge') ||
      alt.includes('license') ||
      alt.includes('build') ||
      alt.includes('ci')
    ) {
      continue
    }

    // Resolve relative URL to raw GitHub URL
    if (src.startsWith('http://') || src.startsWith('https://')) {
      images.push(src)
    } else {
      const cleanPath = src.replace(/^\.\//, '').replace(/^\//, '')
      const fullUrl = `${rawBaseUrl}/${defaultBranch}/${cleanPath}`
      images.push(fullUrl)
    }
  }

  return images
}

/**
 * Sanitizes markdown content:
 * - Strips huge base64 image strings
 * - Removes CI / shield badges
 * - Removes HTML comments
 * - Truncates intelligently if exceeding maxCharLength
 */
export function sanitizeReadme(markdown: string, maxCharLength = 15000): string {
  if (!markdown) return ''

  let text = markdown

  // 1. Remove base64 data URIs
  text = text.replace(/data:image\/[a-zA-Z]+;base64,[a-zA-Z0-9+/=]+/g, '[IMAGE DATA STRIPPED]')

  // 2. Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '')

  // 3. Remove shields / badges
  for (const pattern of BADGE_PATTERNS) {
    text = text.replace(pattern, '')
  }

  // 4. Compress excessive whitespace
  text = text.replace(/\n{3,}/g, '\n\n')

  // 5. Intelligent truncation if too long
  if (text.length > maxCharLength) {
    // Keep first 12,000 characters and last 3,000 characters (where architecture/usage/tech notes often are)
    const head = text.substring(0, 11000)
    const tail = text.substring(text.length - 3500)
    text = `${head}\n\n[... CONTENT TRUNCATED FOR AI PROCESSING ...]\n\n${tail}`
  }

  return text.trim()
}
