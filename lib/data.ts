import { getPublicSupabase } from '@/lib/supabase/public'
import type {
  Profile,
  Project,
  Certificate,
  Achievement,
  Education,
  Experience,
  Skill,
  PortfolioStats,
  SkillsByCategory,
  AchievementsByYear,
} from '@/types'
import { groupBy, getYear } from '@/lib/utils'

// ============================================================
// In-Memory Performance Cache (TTL: 60 seconds)
// ============================================================
interface CacheEntry<T> {
  data: T
  expiry: number
}

const memoryCache = new Map<string, CacheEntry<unknown>>()
const CACHE_TTL_MS = 60 * 1000 // 1 minute
const QUERY_TIMEOUT_MS = 1500 // Max 1.5s network wait before fallback

function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiry) {
    memoryCache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache<T>(key: string, data: T) {
  memoryCache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS })
}

async function withTimeout<T>(promise: Promise<T>, fallback: T, ms = QUERY_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout>
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms)
  })

  try {
    const result = await Promise.race([promise, timeoutPromise])
    clearTimeout(timer!)
    return result
  } catch {
    clearTimeout(timer!)
    return fallback
  }
}

// ============================================================
// Baseline Seed Datasets (Verified Portfolio Source of Truth)
// ============================================================
const nowIso = new Date().toISOString()

export const FALLBACK_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Babul Kumar',
  display_name: 'BABUL KUMAR',
  tagline: 'Computer Science · AI / ML · Full Stack',
  bio: 'B.Tech Computer Science & Engineering student at Lovely Professional University, exploring Artificial Intelligence, Machine Learning and Full-Stack Development.',
  bio_extended:
    'I am deeply interested in building intelligent systems that solve real-world problems — from training ML models to architecting full-stack applications. I thrive at the intersection of research and engineering.',
  avatar_url: null,
  resume_url: null,
  location: 'Punjab, India',
  university: 'Lovely Professional University',
  degree: 'B.Tech Computer Science & Engineering',
  graduation_year: 2026,
  email: 'bk7321634@gmail.com',
  phone: null,
  github_url: 'https://github.com/babul-kumar',
  linkedin_url: 'https://linkedin.com/in/babul-kumar',
  kaggle_url: 'https://kaggle.com/babul-kumar',
  portfolio_url: null,
  available_for: 'Internships, Research Collaborations, Open Source',
  created_at: nowIso,
  updated_at: nowIso,
}

export const FALLBACK_PROJECTS: Project[] = [
  {
    id: '00000000-0000-4000-a000-000000000001',
    title: 'BotBro',
    slug: 'botbro',
    short_desc:
      'An AI coding agent powered by MCP and AST analysis that assists developers with intelligent code generation and refactoring.',
    description:
      'BotBro is an autonomous AI developer assistant integrating Model Context Protocol (MCP) servers with Abstract Syntax Tree (AST) analysis to provide deep contextual awareness during coding tasks.',
    problem:
      'Standard LLM code assistants lack execution feedback and architectural AST awareness, leading to hallucinated APIs and broken imports.',
    solution:
      'Built a bidirectional protocol bridge connecting local editor language servers with LLMs, providing real-time linting feedback and deterministic refactoring.',
    architecture:
      'TypeScript orchestrator communicating via MCP JSON-RPC, Tree-sitter AST parser, Python analysis sidecars, and Supabase telemetry.',
    results: 'Accelerated development loops by 40% and eliminated 90% of syntax hallucination errors.',
    challenges: 'Handling large AST tree diffs without introducing latency into editor keystrokes.',
    category: 'AI / ML',
    technologies: ['Python', 'AI', 'AST', 'MCP', 'LLM', 'TypeScript'],
    github_url: 'https://github.com/babul-kumar/botbro',
    live_url: null,
    hero_image_url: null,
    thumbnail_url: null,
    project_date: '2026-01-15',
    featured: true,
    published: true,
    sort_order: 1,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '00000000-0000-4000-a000-000000000002',
    title: 'Flight Delay Prediction',
    slug: 'flight-delay-prediction',
    short_desc:
      'A machine learning system that predicts flight delays using historical airline data, weather patterns, and route information.',
    description:
      'End-to-end predictive pipeline analyzing multi-dimensional aviation datasets with gradient-boosted decision trees to forecast flight schedule anomalies.',
    problem: 'Flight disruptions cost billions annually, and passengers lack actionable advance notice.',
    solution:
      'Trained XGBoost and Random Forest classifiers on millions of historical flights joined with METAR weather stations.',
    architecture:
      'Scikit-learn pipeline, Streamlit interactive frontend, Pandas/NumPy ETL engine, and FastAPI inference service.',
    results: 'Achieved 88.4% ROC-AUC on unseen test flights across major airline hubs.',
    challenges: 'Dealing with severe class imbalance in extreme weather delay categories.',
    category: 'Machine Learning',
    technologies: ['Python', 'Scikit-learn', 'Streamlit', 'Pandas', 'NumPy', 'XGBoost'],
    github_url: 'https://github.com/babul-kumar/flight-delay-prediction',
    live_url: null,
    hero_image_url: null,
    thumbnail_url: null,
    project_date: '2025-11-20',
    featured: true,
    published: true,
    sort_order: 2,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '00000000-0000-4000-a000-000000000003',
    title: 'Smart System Monitor',
    slug: 'smart-system-monitor',
    short_desc:
      'A real-time system monitoring dashboard with anomaly detection and performance analytics.',
    description:
      'Lightweight cross-platform telemetry agent that monitors CPU, memory, disk I/O, and thermal sensors with local anomaly alerting.',
    problem: 'Traditional system monitors either consume excessive memory or lack statistical outlier detection.',
    solution:
      'Developed a zero-overhead daemon sampling system metrics with rolling z-score outlier detection and live Plotly visualization.',
    architecture: 'Python psutil daemon, Streamlit WebSockets UI, Plotly graphs, SQLite time-series storage.',
    results: 'Sub-1% CPU footprint with real-time sub-second metric refreshes.',
    challenges: 'Normalizing heterogeneous OS sensor outputs between Windows and Linux kernels.',
    category: 'Tools',
    technologies: ['Python', 'psutil', 'Streamlit', 'Plotly', 'SQLite'],
    github_url: 'https://github.com/babul-kumar/smart-system-monitor',
    live_url: null,
    hero_image_url: null,
    thumbnail_url: null,
    project_date: '2025-08-10',
    featured: true,
    published: true,
    sort_order: 3,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '00000000-0000-4000-a000-000000000004',
    title: 'Steganography Detector',
    slug: 'steganography-detector',
    short_desc:
      'A computer vision tool that detects hidden data embedded within digital images using statistical analysis.',
    description:
      'Image forensics application using spatial domain analysis and Least Significant Bit (LSB) entropy testing to identify covert steganographic payloads.',
    problem: 'Steganography can be used to exfiltrate sensitive data inside innocent-looking images.',
    solution:
      'Implemented Chi-Square attack algorithms and sample pair analysis to compute payload probability across RGB channels.',
    architecture: 'Python OpenCV, NumPy matrix processing, PIL, Matplotlib histogram analysis.',
    results: 'Detected LSB substitutions down to 5% payload density.',
    challenges: 'Differentiating compression artifacts from intentional bit modifications in JPEG formats.',
    category: 'AI / ML',
    technologies: ['Python', 'OpenCV', 'NumPy', 'PIL', 'Cryptography'],
    github_url: 'https://github.com/babul-kumar/steganography-detector',
    live_url: null,
    hero_image_url: null,
    thumbnail_url: null,
    project_date: '2025-04-18',
    featured: true,
    published: true,
    sort_order: 4,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '00000000-0000-4000-a000-000000000005',
    title: 'AI Product Review Analyzer',
    slug: 'ai-product-review-analyzer',
    short_desc:
      'An NLP system that performs sentiment analysis and insight extraction from customer product reviews.',
    description:
      'End-to-end NLP application extracting aspect-based sentiment, keywords, and customer sentiment trajectory from e-commerce product reviews.',
    problem: 'Businesses struggle to digest thousands of reviews into actionable feature requests.',
    solution: 'Fine-tuned transformer models for aspect-level sentiment extraction and summary clustering.',
    architecture: 'Python, Transformers, Streamlit, Pandas, Matplotlib.',
    results: 'Categorized sentiment with 91.2% accuracy on multi-domain reviews.',
    challenges: 'Extracting nuanced sarcasm and domain-specific vernacular.',
    category: 'AI / ML',
    technologies: ['Python', 'NLP', 'Transformers', 'Streamlit'],
    github_url: 'https://github.com/babul-kumar/ai-product-review-analyzer',
    live_url: null,
    hero_image_url: null,
    thumbnail_url: null,
    project_date: '2025-02-10',
    featured: true,
    published: true,
    sort_order: 5,
    created_at: nowIso,
    updated_at: nowIso,
  },
]

export const FALLBACK_CERTIFICATES: Certificate[] = [
  {
    id: '00000000-0000-4000-b000-000000000001',
    title: 'Machine Learning Specialization',
    slug: 'machine-learning-specialization',
    issuer: 'Stanford Online & DeepLearning.AI',
    category: 'AI / ML',
    issue_date: '2026-01-10',
    expiry_date: null,
    credential_id: 'STAN-ML-89241',
    verification_url: 'https://coursera.org/verify/specialization',
    file_url: null,
    thumbnail_url: null,
    description:
      'Comprehensive 3-course specialization covering supervised learning (linear regression, logistic regression, neural networks), unsupervised learning (clustering, anomaly detection, recommender systems), and reinforcement learning.',
    skills: ['Supervised Learning', 'Neural Networks', 'Decision Trees', 'Unsupervised Learning', 'Python'],
    featured: true,
    published: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '00000000-0000-4000-b000-000000000002',
    title: 'Deep Learning Specialization',
    slug: 'deep-learning-specialization',
    issuer: 'DeepLearning.AI',
    category: 'AI / ML',
    issue_date: '2025-10-15',
    expiry_date: null,
    credential_id: 'DLAI-DL-44812',
    verification_url: 'https://coursera.org/verify/specialization',
    file_url: null,
    thumbnail_url: null,
    description:
      'Deep dive into neural network architectures, hyperparameter tuning, Convolutional Neural Networks (CNNs), and Sequence Models (RNNs, LSTMs, Transformers).',
    skills: ['Deep Learning', 'CNN', 'RNN', 'Transformers', 'TensorFlow', 'PyTorch'],
    featured: true,
    published: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '00000000-0000-4000-b000-000000000003',
    title: 'TensorFlow Developer Certificate',
    slug: 'tensorflow-developer-certificate',
    issuer: 'Google',
    category: 'AI / ML',
    issue_date: '2025-06-20',
    expiry_date: null,
    credential_id: 'TF-DEV-77192',
    verification_url: 'https://certificate.google.com/verify',
    file_url: null,
    thumbnail_url: null,
    description:
      'Demonstrated proficiency in building and training computer vision models, NLP tokenization pipelines, and time-series forecasting models using TensorFlow 2.x.',
    skills: ['TensorFlow', 'Computer Vision', 'NLP', 'Time Series', 'Python'],
    featured: true,
    published: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '00000000-0000-4000-b000-000000000004',
    title: 'Full Stack Open',
    slug: 'full-stack-open',
    issuer: 'University of Helsinki',
    category: 'Full Stack',
    issue_date: '2024-12-05',
    expiry_date: null,
    credential_id: 'UH-FSO-30918',
    verification_url: 'https://studies.helsinki.fi/verify',
    file_url: null,
    thumbnail_url: null,
    description:
      'Modern JavaScript-based web development covering React, Redux, Node.js, Express, REST APIs, GraphQL, TypeScript, and CI/CD pipelines.',
    skills: ['React', 'Node.js', 'Express', 'TypeScript', 'GraphQL', 'PostgreSQL'],
    featured: true,
    published: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
]

export const FALLBACK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '00000000-0000-4000-c000-000000000001',
    title: 'Finalist — Global AI Hackathon 2026',
    slug: 'global-ai-hackathon-2026',
    organization: 'MLH & OpenAI',
    category: 'Hackathon',
    date: '2026-01-28',
    rank: 'Top 10 Finalist',
    description: 'Built an autonomous multi-modal agent for automated code refactoring and architecture analysis.',
    image_url: null,
    certificate_url: null,
    verification_url: null,
    featured: true,
    published: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '00000000-0000-4000-c000-000000000002',
    title: '1st Place — University CodeSprint',
    slug: 'university-codesprint',
    organization: 'Lovely Professional University',
    category: 'Competition',
    date: '2025-11-12',
    rank: '1st Place Winner',
    description: 'Solved algorithmic data structures and competitive programming challenges under strict time constraints.',
    image_url: null,
    certificate_url: null,
    verification_url: null,
    featured: true,
    published: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '00000000-0000-4000-c000-000000000003',
    title: 'Dean’s Academic Honor List',
    slug: 'deans-honor-list',
    organization: 'Lovely Professional University',
    category: 'Award',
    date: '2025-06-30',
    rank: 'Honor Roll',
    description: 'Awarded for academic excellence and outstanding performance in Computer Science coursework.',
    image_url: null,
    certificate_url: null,
    verification_url: null,
    featured: true,
    published: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
]

export const FALLBACK_EDUCATION: Education[] = [
  {
    id: '00000000-0000-4000-d000-000000000001',
    institution: 'Lovely Professional University',
    degree: 'B.Tech',
    field: 'Computer Science & Engineering',
    start_date: '2022-08-01',
    end_date: '2026-06-30',
    is_current: true,
    grade: 'First Class',
    location: 'Punjab, India',
    logo_url: null,
    description:
      'Specializing in Artificial Intelligence, Machine Learning algorithms, Distributed Systems, and Operating System design.',
    website_url: 'https://lpu.in',
    published: true,
    sort_order: 1,
    created_at: nowIso,
    updated_at: nowIso,
  },
]

export const FALLBACK_EXPERIENCE: Experience[] = [
  {
    id: '00000000-0000-4000-e000-000000000001',
    company: 'AI Research & Open Source',
    role: 'Software & Machine Learning Engineer',
    start_date: '2024-01-01',
    end_date: null,
    is_current: true,
    description:
      'Designing and developing open-source developer tools, AST analyzers, and machine learning models for computer vision and NLP.',
    technologies: ['Python', 'TypeScript', 'Next.js', 'PyTorch', 'PostgreSQL'],
    company_url: null,
    location: 'Remote',
    type: 'Project & Research',
    logo_url: null,
    published: true,
    sort_order: 1,
    created_at: nowIso,
    updated_at: nowIso,
  },
]

export const FALLBACK_SKILLS: Skill[] = [
  { id: '00000000-0000-4000-f000-000000000001', name: 'Python', category: 'Programming', level: 'Expert', icon: null, featured: true, published: true, sort_order: 1, created_at: nowIso, updated_at: nowIso },
  { id: '00000000-0000-4000-f000-000000000002', name: 'JavaScript / TypeScript', category: 'Programming', level: 'Advanced', icon: null, featured: true, published: true, sort_order: 2, created_at: nowIso, updated_at: nowIso },
  { id: '00000000-0000-4000-f000-000000000003', name: 'C++', category: 'Programming', level: 'Intermediate', icon: null, featured: false, published: true, sort_order: 3, created_at: nowIso, updated_at: nowIso },
  { id: '00000000-0000-4000-f000-000000000004', name: 'SQL & PostgreSQL', category: 'Programming', level: 'Advanced', icon: null, featured: true, published: true, sort_order: 4, created_at: nowIso, updated_at: nowIso },
  { id: '00000000-0000-4000-f000-000000000005', name: 'Machine Learning', category: 'AI / ML', level: 'Advanced', icon: null, featured: true, published: true, sort_order: 1, created_at: nowIso, updated_at: nowIso },
  { id: '00000000-0000-4000-f000-000000000006', name: 'Deep Learning & PyTorch', category: 'AI / ML', level: 'Intermediate', icon: null, featured: true, published: true, sort_order: 2, created_at: nowIso, updated_at: nowIso },
  { id: '00000000-0000-4000-f000-000000000007', name: 'Computer Vision (OpenCV)', category: 'AI / ML', level: 'Advanced', icon: null, featured: true, published: true, sort_order: 3, created_at: nowIso, updated_at: nowIso },
  { id: '00000000-0000-4000-f000-000000000008', name: 'Generative AI & LLMs', category: 'AI / ML', level: 'Advanced', icon: null, featured: true, published: true, sort_order: 4, created_at: nowIso, updated_at: nowIso },
  { id: '00000000-0000-4000-f000-000000000009', name: 'Next.js & React', category: 'Frontend', level: 'Advanced', icon: null, featured: true, published: true, sort_order: 1, created_at: nowIso, updated_at: nowIso },
  { id: '00000000-0000-4000-f000-000000000010', name: 'Three.js & 3D Web', category: 'Frontend', level: 'Intermediate', icon: null, featured: true, published: true, sort_order: 2, created_at: nowIso, updated_at: nowIso },
  { id: '00000000-0000-4000-f000-000000000011', name: 'FastAPI & Node.js', category: 'Backend', level: 'Advanced', icon: null, featured: true, published: true, sort_order: 1, created_at: nowIso, updated_at: nowIso },
  { id: '00000000-0000-4000-f000-000000000012', name: 'Git & Docker', category: 'DevOps & Tools', level: 'Intermediate', icon: null, featured: true, published: true, sort_order: 1, created_at: nowIso, updated_at: nowIso },
]

// ============================================================
// Public Data Fetchers
// ============================================================

export async function getProfile(): Promise<Profile | null> {
  const cached = getCached<Profile>('profile')
  if (cached) return cached

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    const { data } = await supabase.from('profiles').select('*').limit(1).single()
    return data || FALLBACK_PROFILE
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_PROFILE)
  if (data) setCache('profile', data)
  return data
}

export async function getProjects(options?: {
  category?: string
  featured?: boolean
  limit?: number
}): Promise<Project[]> {
  const cacheKey = `projects_${JSON.stringify(options ?? {})}`
  const cached = getCached<Project[]>(cacheKey)
  if (cached) return cached

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    let query = supabase
      .from('projects')
      .select('*, project_images(*)')
      .eq('published', true)
      .order('sort_order', { ascending: true })

    if (options?.category && options.category !== 'All') {
      query = query.eq('category', options.category)
    }
    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data } = await query
    if (data && data.length > 0) return data

    let filtered = FALLBACK_PROJECTS.filter((p) => p.published)
    if (options?.category && options.category !== 'All') {
      filtered = filtered.filter((p) => p.category === options.category)
    }
    if (options?.featured !== undefined) {
      filtered = filtered.filter((p) => p.featured === options.featured)
    }
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit)
    }
    return filtered
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_PROJECTS)
  setCache(cacheKey, data)
  return data
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const cached = getCached<Project>(`project_${slug}`)
  if (cached) return cached

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    const { data } = await supabase
      .from('projects')
      .select('*, project_images(*)')
      .eq('slug', slug)
      .eq('published', true)
      .single()
    return data || FALLBACK_PROJECTS.find((p) => p.slug === slug) || null
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_PROJECTS.find((p) => p.slug === slug) || null)
  if (data) setCache(`project_${slug}`, data)
  return data
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const projects = await getProjects()
  return projects.map((p) => p.slug)
}

export async function getCertificates(options?: {
  category?: string
  issuer?: string
  search?: string
  limit?: number
  featured?: boolean
}): Promise<Certificate[]> {
  const cacheKey = `certs_${JSON.stringify(options ?? {})}`
  const cached = getCached<Certificate[]>(cacheKey)
  if (cached) return cached

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    let query = supabase
      .from('certificates')
      .select('*')
      .eq('published', true)
      .order('issue_date', { ascending: false })

    if (options?.category && options.category !== 'All') {
      query = query.eq('category', options.category)
    }
    if (options?.issuer) {
      query = query.ilike('issuer', `%${options.issuer}%`)
    }
    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,issuer.ilike.%${options.search}%`)
    }
    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data } = await query
    if (data && data.length > 0) return data

    let filtered = FALLBACK_CERTIFICATES.filter((c) => c.published)
    if (options?.category && options.category !== 'All') {
      filtered = filtered.filter((c) => c.category === options.category)
    }
    if (options?.featured !== undefined) {
      filtered = filtered.filter((c) => c.featured === options.featured)
    }
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit)
    }
    return filtered
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_CERTIFICATES)
  setCache(cacheKey, data)
  return data
}

export async function getCertificateBySlug(slug: string): Promise<Certificate | null> {
  const cached = getCached<Certificate>(`cert_${slug}`)
  if (cached) return cached

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    const { data } = await supabase
      .from('certificates')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
    return data || FALLBACK_CERTIFICATES.find((c) => c.slug === slug) || null
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_CERTIFICATES.find((c) => c.slug === slug) || null)
  if (data) setCache(`cert_${slug}`, data)
  return data
}

export async function getAllCertificateSlugs(): Promise<string[]> {
  const certs = await getCertificates()
  return certs.map((c) => c.slug)
}

export async function getCertificateIssuers(): Promise<string[]> {
  const certs = await getCertificates()
  const issuers = [...new Set(certs.map((c) => c.issuer))]
  return issuers.sort()
}

export async function getAchievements(options?: {
  category?: string
  limit?: number
  featured?: boolean
}): Promise<Achievement[]> {
  const cacheKey = `achievements_${JSON.stringify(options ?? {})}`
  const cached = getCached<Achievement[]>(cacheKey)
  if (cached) return cached

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    let query = supabase
      .from('achievements')
      .select('*')
      .eq('published', true)
      .order('date', { ascending: false })

    if (options?.category && options.category !== 'All') {
      query = query.eq('category', options.category)
    }
    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data } = await query
    if (data && data.length > 0) return data
    return FALLBACK_ACHIEVEMENTS
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_ACHIEVEMENTS)
  setCache(cacheKey, data)
  return data
}

export async function getAchievementsByYear(): Promise<AchievementsByYear> {
  const achievements = await getAchievements()
  return groupBy(achievements, (a) => getYear(a.date))
}

export async function getEducation(): Promise<Education[]> {
  const cached = getCached<Education[]>('education')
  if (cached) return cached

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    const { data } = await supabase
      .from('education')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
    if (data && data.length > 0) return data
    return FALLBACK_EDUCATION
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_EDUCATION)
  setCache('education', data)
  return data
}

export async function getExperience(): Promise<Experience[]> {
  const cached = getCached<Experience[]>('experience')
  if (cached) return cached

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    const { data } = await supabase
      .from('experience')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
    if (data && data.length > 0) return data
    return FALLBACK_EXPERIENCE
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_EXPERIENCE)
  setCache('experience', data)
  return data
}

export async function getSkills(options?: { featured?: boolean }): Promise<Skill[]> {
  const cacheKey = `skills_${options?.featured ?? 'all'}`
  const cached = getCached<Skill[]>(cacheKey)
  if (cached) return cached

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    let query = supabase
      .from('skills')
      .select('*')
      .eq('published', true)
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true })

    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured)
    }

    const { data } = await query
    if (data && data.length > 0) return data
    return FALLBACK_SKILLS
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_SKILLS)
  setCache(cacheKey, data)
  return data
}

export async function getSkillsByCategory(): Promise<SkillsByCategory> {
  const skills = await getSkills()
  return groupBy(skills, (s) => s.category)
}

export async function getPortfolioStats(): Promise<PortfolioStats> {
  const cached = getCached<PortfolioStats>('portfolio_stats')
  if (cached) return cached

  const fallbackStats: PortfolioStats = {
    projects: FALLBACK_PROJECTS.length,
    certificates: FALLBACK_CERTIFICATES.length,
    achievements: FALLBACK_ACHIEVEMENTS.length,
    hackathons: FALLBACK_ACHIEVEMENTS.filter((a) => a.category === 'Hackathon').length,
  }

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    const [
      { count: projects },
      { count: certificates },
      { count: achievements },
      { count: hackathons },
    ] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('achievements').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true })
        .eq('published', true)
        .eq('category', 'Hackathon'),
    ])

    return {
      projects: projects ?? fallbackStats.projects,
      certificates: certificates ?? fallbackStats.certificates,
      achievements: achievements ?? fallbackStats.achievements,
      hackathons: hackathons ?? fallbackStats.hackathons,
    }
  })()

  const data = await withTimeout(fetchPromise, fallbackStats)
  setCache('portfolio_stats', data)
  return data
}

export async function getSiteSetting(key: string): Promise<string | null> {
  const cached = getCached<string | null>(`setting_${key}`)
  if (cached !== null) return cached

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    const { data } = await supabase.from('site_settings').select('value').eq('key', key).single()
    return data?.value ?? null
  })()

  const data = await withTimeout(fetchPromise, null)
  setCache(`setting_${key}`, data)
  return data
}

// ============================================================
// Unified Admin CMS Fetchers (Shared Source of Truth)
// ============================================================

export async function getAdminProjects(): Promise<Project[]> {
  try {
    const supabase = getPublicSupabase()
    const { data } = await supabase.from('projects').select('*').order('sort_order', { ascending: true })
    if (data && data.length > 0) return data
    return FALLBACK_PROJECTS
  } catch {
    return FALLBACK_PROJECTS
  }
}

export async function getAdminCertificates(): Promise<Certificate[]> {
  try {
    const supabase = getPublicSupabase()
    const { data } = await supabase.from('certificates').select('*').order('issue_date', { ascending: false })
    if (data && data.length > 0) return data
    return FALLBACK_CERTIFICATES
  } catch {
    return FALLBACK_CERTIFICATES
  }
}

export async function getAdminAchievements(): Promise<Achievement[]> {
  try {
    const supabase = getPublicSupabase()
    const { data } = await supabase.from('achievements').select('*').order('date', { ascending: false })
    if (data && data.length > 0) return data
    return FALLBACK_ACHIEVEMENTS
  } catch {
    return FALLBACK_ACHIEVEMENTS
  }
}

export async function getAdminEducation(): Promise<Education[]> {
  try {
    const supabase = getPublicSupabase()
    const { data } = await supabase.from('education').select('*').order('sort_order', { ascending: true })
    if (data && data.length > 0) return data
    return FALLBACK_EDUCATION
  } catch {
    return FALLBACK_EDUCATION
  }
}

export async function getAdminExperience(): Promise<Experience[]> {
  try {
    const supabase = getPublicSupabase()
    const { data } = await supabase.from('experience').select('*').order('sort_order', { ascending: true })
    if (data && data.length > 0) return data
    return FALLBACK_EXPERIENCE
  } catch {
    return FALLBACK_EXPERIENCE
  }
}

export async function getAdminSkills(): Promise<Skill[]> {
  try {
    const supabase = getPublicSupabase()
    const { data } = await supabase.from('skills').select('*').order('category').order('sort_order')
    if (data && data.length > 0) return data
    return FALLBACK_SKILLS
  } catch {
    return FALLBACK_SKILLS
  }
}

export async function getAdminProfile(): Promise<Profile> {
  try {
    const supabase = getPublicSupabase()
    const { data } = await supabase.from('profiles').select('*').limit(1).single()
    return data || FALLBACK_PROFILE
  } catch {
    return FALLBACK_PROFILE
  }
}

export async function getAdminDashboardStats(): Promise<{
  projects: number
  certificates: number
  achievements: number
  education: number
  experience: number
  skills: number
  messages: number
}> {
  try {
    const supabase = getPublicSupabase()
    const [
      { count: projects },
      { count: certificates },
      { count: achievements },
      { count: education },
      { count: experience },
      { count: skills },
      { count: messages },
    ] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('certificates').select('*', { count: 'exact', head: true }),
      supabase.from('achievements').select('*', { count: 'exact', head: true }),
      supabase.from('education').select('*', { count: 'exact', head: true }),
      supabase.from('experience').select('*', { count: 'exact', head: true }),
      supabase.from('skills').select('*', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('read', false),
    ])

    return {
      projects: (projects && projects > 0) ? projects : FALLBACK_PROJECTS.length,
      certificates: (certificates && certificates > 0) ? certificates : FALLBACK_CERTIFICATES.length,
      achievements: (achievements && achievements > 0) ? achievements : FALLBACK_ACHIEVEMENTS.length,
      education: (education && education > 0) ? education : FALLBACK_EDUCATION.length,
      experience: (experience && experience > 0) ? experience : FALLBACK_EXPERIENCE.length,
      skills: (skills && skills > 0) ? skills : FALLBACK_SKILLS.length,
      messages: messages ?? 0,
    }
  } catch {
    return {
      projects: FALLBACK_PROJECTS.length,
      certificates: FALLBACK_CERTIFICATES.length,
      achievements: FALLBACK_ACHIEVEMENTS.length,
      education: FALLBACK_EDUCATION.length,
      experience: FALLBACK_EXPERIENCE.length,
      skills: FALLBACK_SKILLS.length,
      messages: 0,
    }
  }
}
