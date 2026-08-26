import { getPublicSupabase } from '@/lib/supabase/public'
import type {
  Profile,
  Project,
  Certificate,
  Training,
  CoCurricularActivity,
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
const QUERY_TIMEOUT_MS = 6000 // 6s network timeout before fallback

export function invalidateCertificateCache(): void {
  for (const key of memoryCache.keys()) {
    if (key.startsWith('certs_') || key.startsWith('cert_')) {
      memoryCache.delete(key)
    }
  }
}

export function invalidateProjectCache(): void {
  for (const key of memoryCache.keys()) {
    if (key.startsWith('projects_') || key.startsWith('project_')) {
      memoryCache.delete(key)
    }
  }
}

export function invalidateTrainingCache(): void {
  for (const key of memoryCache.keys()) {
    if (key.startsWith('trainings_') || key.startsWith('training_') || key.startsWith('admin_trainings')) {
      memoryCache.delete(key)
    }
  }
}

export function invalidateCoCurricularCache(): void {
  for (const key of memoryCache.keys()) {
    if (key.startsWith('co_curr_') || key.startsWith('admin_co_curr')) {
      memoryCache.delete(key)
    }
  }
}

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
    id: '94341db2-b91e-4a4b-8486-4545c3350444',
    title: "Intro to AI: A Beginner's Guide to Artificial Intelligence",
    slug: 'intro-to-ai-a-beginners-guide-to-artificial-intelligence',
    issuer: 'Udemy',
    category: 'AI / ML',
    issue_date: '2026-08-20',
    expiry_date: null,
    credential_id: 'UC-71dc0a0c-e699-4442-af0f-6d23058fdf17',
    verification_url: null,
    description:
      'This certificate signifies completion of an introductory course designed to provide a foundational understanding of Artificial Intelligence for beginners.',
    file_url:
      'https://gmlgzuiuyhinxhjsbfkk.supabase.co/storage/v1/object/public/certificate/documents/1787773122588-gelv4k.png',
    thumbnail_url:
      'https://gmlgzuiuyhinxhjsbfkk.supabase.co/storage/v1/object/public/certificate/thumbnails/1787773168798-3wtxsd.png',
    skills: ['Artificial Intelligence', 'AI Concepts'],
    featured: false,
    published: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: 'cff246a0-1ee6-47a9-91a6-56a80854a43c',
    title: 'Generative AI for Beginners',
    slug: 'generative-ai-for-beginners',
    issuer: 'Infosys | Springboard',
    category: 'AI / ML',
    issue_date: '2026-08-20',
    expiry_date: null,
    credential_id: null,
    verification_url: 'https://verify.onwingspan.com',
    description:
      'This certificate acknowledges successful completion of an introductory course on Generative AI, covering fundamental concepts for beginners.',
    file_url:
      'https://gmlgzuiuyhinxhjsbfkk.supabase.co/storage/v1/object/public/certificate/documents/1787773009454-gudxkq.png',
    thumbnail_url:
      'https://gmlgzuiuyhinxhjsbfkk.supabase.co/storage/v1/object/public/certificate/thumbnails/1787773044688-yzv4up.png',
    skills: ['Generative AI', 'Artificial Intelligence'],
    featured: true,
    published: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: 'ba8fc20d-89c4-40bd-b251-f618512f0c32',
    title: 'AI for Everyone: Understanding and Applying the Basics',
    slug: 'ai-for-everyone-understanding-and-applying-the-basics',
    issuer: 'Udemy',
    category: 'AI / ML',
    issue_date: '2026-08-20',
    expiry_date: null,
    credential_id: 'UC-ae526453-a227-46b8-b857-1a60ef520482',
    verification_url: 'https://ude.my/UC-ae526453-a227-46b8-b857-1a60ef520482',
    description:
      'This certificate signifies completion of a course focused on understanding and applying the fundamental concepts of Artificial Intelligence.',
    file_url:
      'https://gmlgzuiuyhinxhjsbfkk.supabase.co/storage/v1/object/public/certificate/documents/1787772882903-3tsl2c.png',
    thumbnail_url:
      'https://gmlgzuiuyhinxhjsbfkk.supabase.co/storage/v1/object/public/certificate/thumbnails/1787772920656-a2yx2r.png',
    skills: ['Artificial Intelligence', 'AI Concepts', 'AI Application'],
    featured: true,
    published: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: 'ce3615a0-75b7-42de-b7d5-0182abc9bc82',
    title: 'Database Management System Part - 1',
    slug: 'database-management-system-part-1',
    issuer: 'Infosys',
    category: 'Data',
    issue_date: '2026-08-01',
    expiry_date: null,
    credential_id: null,
    verification_url: 'https://verify.onwingspan.com',
    description:
      'This certificate signifies successful completion of the first part of a course on Database Management Systems, covering fundamental concepts and principles of managing data.',
    file_url:
      'https://gmlgzuiuyhinxhjsbfkk.supabase.co/storage/v1/object/public/certificate/documents/1787691126709-4iuhho.png',
    thumbnail_url: null,
    skills: ['Database Management System', 'Data Management'],
    featured: true,
    published: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: 'bc82b7b3-23f8-4c72-a32a-1bbd31ee3680',
    title: 'Introduction to DSA with Proctored exam',
    slug: 'introduction-to-dsa-with-proctored-exam',
    issuer: 'CODING TANTRA',
    category: 'Programming',
    issue_date: '2025-01-24',
    expiry_date: null,
    credential_id: 'CT-01/2025-ITD-184',
    verification_url: null,
    description:
      'This certificate signifies the completion of a 15+ hour MOOC on Introduction to Data Structures and Algorithms, validated by a proctored examination. It demonstrates proficiency in fundamental programming concepts and problem-solving techniques.',
    file_url:
      'https://gmlgzuiuyhinxhjsbfkk.supabase.co/storage/v1/object/public/certificate/documents/1787688103605-pewnxi.png',
    thumbnail_url:
      'https://gmlgzuiuyhinxhjsbfkk.supabase.co/storage/v1/object/public/certificate/thumbnails/1787688125343-ldoziu.png',
    skills: ['Data Structures', 'Algorithms', 'DSA'],
    featured: true,
    published: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '76f96743-2a2d-4b11-a326-55393267222b',
    title: 'Effective Time Management',
    slug: 'effective-time-management',
    issuer: 'Master Union',
    category: 'Other',
    issue_date: '2024-10-19',
    expiry_date: null,
    credential_id: 'MU/OCT24/ETM/A505',
    verification_url: null,
    description:
      'This certificate acknowledges the completion of a short-duration MOOC on Effective Time Management, which included passing a comprehensive proctored examination. It demonstrates a strong commitment to developing effective time management skills, continuous improvement, and professional growth.',
    file_url:
      'https://gmlgzuiuyhinxhjsbfkk.supabase.co/storage/v1/object/public/certificate/documents/1787687052610-2s1bhe.png',
    thumbnail_url:
      'https://gmlgzuiuyhinxhjsbfkk.supabase.co/storage/v1/object/public/certificate/thumbnails/1787687066343-68osts.png',
    skills: ['Time Management', 'Professional Growth', 'Continuous Improvement'],
    featured: true,
    published: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '6accb593-2ad2-41a5-9a6d-7787c36ad177',
    title: 'REACT.JS MOOC',
    slug: 'reactjs-mooc',
    issuer: 'TECH VEDA',
    category: 'Programming',
    issue_date: '2025-03-22',
    expiry_date: null,
    credential_id: 'TV/MAR25/RJ/337',
    verification_url: null,
    description:
      'This certificate acknowledges the completion of a 15+ hour Massive Open Online Course (MOOC) on REACT.JS, which included passing a comprehensive proctored examination. It signifies a strong dedication to continuous learning and personal development in front-end web development.',
    file_url:
      'https://gmlgzuiuyhinxhjsbfkk.supabase.co/storage/v1/object/public/certificate/documents/1787686167405-gv62pm.png',
    thumbnail_url:
      'https://gmlgzuiuyhinxhjsbfkk.supabase.co/storage/v1/object/public/certificate/thumbnails/1787686172890-bvr11i.png',
    skills: ['REACT.JS', 'Front-end Development', 'JavaScript'],
    featured: true,
    published: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
]

export const FALLBACK_TRAININGS: Training[] = [
  {
    id: '10000000-0000-4000-a000-000000000001',
    title: 'Full-Stack Web & Applied AI Systems Engineering',
    slug: 'full-stack-web-ai-systems-engineering',
    provider: 'Centre for Professional Development',
    organization: 'Lovely Professional University & Industry Partners',
    category: 'Industrial Training',
    description:
      'Intensive industrial curriculum focused on architecting scalable full-stack applications with Next.js, FastAPI, and PostgreSQL, integrated with real-time AI inference pipelines, vector embeddings, and AST-aware agents.',
    start_date: '2025-06-01',
    end_date: '2025-07-25',
    duration: '8 Weeks',
    location: 'Punjab, India',
    mode: 'Hybrid',
    certificate_url: null,
    image_url: null,
    skills: ['Next.js', 'React', 'FastAPI', 'PostgreSQL', 'AI Agent Runtimes', 'Vector Embeddings'],
    technologies: ['TypeScript', 'Python', 'Supabase', 'Tailwind CSS', 'Docker'],
    credential_id: 'TRN-2025-FS-8812',
    credential_url: null,
    featured: true,
    published: true,
    display_order: 1,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '10000000-0000-4000-a000-000000000002',
    title: 'Applied Machine Learning & Neural Network Architectures',
    slug: 'applied-machine-learning-neural-architectures',
    provider: 'DeepLearning.AI & Coursera',
    organization: 'DeepLearning.AI',
    category: 'AI / ML',
    description:
      'Rigorous specialization covering gradient-boosted decision trees, deep neural networks, CNNs for computer vision, attention mechanisms, and fine-tuning transformer models for predictive analytics.',
    start_date: '2025-01-10',
    end_date: '2025-03-05',
    duration: '8 Weeks',
    location: 'Remote',
    mode: 'Online',
    certificate_url: null,
    image_url: null,
    skills: ['Supervised Learning', 'Deep Neural Networks', 'XGBoost', 'Feature Engineering', 'Model Evaluation'],
    technologies: ['PyTorch', 'TensorFlow', 'Scikit-learn', 'NumPy', 'Pandas'],
    credential_id: 'TRN-DL-2025-9041',
    credential_url: null,
    featured: true,
    published: true,
    display_order: 2,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '10000000-0000-4000-a000-000000000003',
    title: 'Cloud Architecture & Distributed Microservices Workshop',
    slug: 'cloud-architecture-distributed-microservices',
    provider: 'AWS Cloud Academy',
    organization: 'Amazon Web Services Training & Certification',
    category: 'Cloud & DevOps',
    description:
      'Hands-on technical workshop on designing highly available distributed cloud architectures, serverless RPC backends, container orchestration with Docker/K8s, and automated CI/CD deployment pipelines.',
    start_date: '2024-09-01',
    end_date: '2024-10-15',
    duration: '6 Weeks',
    location: 'Remote',
    mode: 'Online',
    certificate_url: null,
    image_url: null,
    skills: ['Cloud Infrastructure', 'Microservices', 'CI/CD Pipelines', 'Container Orchestration'],
    technologies: ['AWS', 'Docker', 'GitHub Actions', 'Terraform', 'Linux'],
    credential_id: 'TRN-AWS-2024-5519',
    credential_url: null,
    featured: false,
    published: true,
    display_order: 3,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '10000000-0000-4000-a000-000000000004',
    title: 'Advanced Data Structures & Algorithmic Engineering Bootcamp',
    slug: 'advanced-data-structures-algorithmic-engineering',
    provider: 'Coding Blocks & GeeksforGeeks',
    organization: 'Algorithmic Systems Lab',
    category: 'Workshop',
    description:
      'Comprehensive masterclass mastering dynamic programming, graph algorithms (Dijkstra, Tarjan, MST), advanced tree structures (Segment Trees, Trie, Fenwick), and optimal time-space complexity engineering.',
    start_date: '2024-05-15',
    end_date: '2024-07-20',
    duration: '10 Weeks',
    location: 'Remote',
    mode: 'Online',
    certificate_url: null,
    image_url: null,
    skills: ['Dynamic Programming', 'Graph Theory', 'Advanced Trees', 'Algorithmic Optimization'],
    technologies: ['C++', 'Java', 'Python', 'Algorithms Analysis'],
    credential_id: 'TRN-DSA-2024-1120',
    credential_url: null,
    featured: false,
    published: true,
    display_order: 4,
    created_at: nowIso,
    updated_at: nowIso,
  },
]

export const FALLBACK_CO_CURRICULAR: CoCurricularActivity[] = [
  {
    id: '00000000-0000-4000-b500-000000000001',
    title: 'Smart India Hackathon (SIH)',
    slug: 'smart-india-hackathon',
    organization: 'Ministry of Education & AICTE',
    category: 'Hackathon',
    description:
      'Spearheaded a 6-member engineering team to design and develop an intelligent AI-driven disaster response and resource dispatch management system under a 36-hour continuous hackathon format.',
    date: '2025-12-18',
    end_date: '2025-12-20',
    location: 'Nodal Centre, India',
    mode: 'Offline',
    role: 'Team Lead & Full-Stack Architect',
    achievement: 'National Finalist',
    skills: ['Team Leadership', 'System Architecture', 'Rapid Prototyping', 'Public Pitching'],
    technologies: ['Next.js', 'FastAPI', 'PyTorch', 'PostgreSQL', 'WebSockets'],
    image_url: null,
    document_url: null,
    credential_id: 'SIH-2025-FIN-842',
    credential_url: null,
    featured: true,
    published: true,
    display_order: 1,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '00000000-0000-4000-b500-000000000002',
    title: 'LPU Developer Community Tech Conclave',
    slug: 'lpu-developer-community-tech-conclave',
    organization: 'Developer Student Clubs & CSE Dept',
    category: 'Technical Event',
    description:
      'Delivered an in-depth technical workshop on modern frontend architectures, WebGL/Three.js rendering pipelines, and building autonomous agentic tools to over 300 engineering students.',
    date: '2025-10-15',
    end_date: null,
    location: 'Shanti Devi Mittal Auditorium, LPU',
    mode: 'Offline',
    role: 'Technical Speaker & Organizer',
    achievement: 'Keynote Speaker — 300+ Attendees',
    skills: ['Technical Speaking', 'Workshop Delivery', 'Community Building', 'Developer Evangelism'],
    technologies: ['Three.js', 'React', 'TypeScript', 'WebGL', 'Next.js'],
    image_url: null,
    document_url: null,
    credential_id: null,
    credential_url: null,
    featured: true,
    published: true,
    display_order: 2,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '00000000-0000-4000-b500-000000000003',
    title: 'Inter-University AI & Computer Vision Challenge',
    slug: 'inter-university-ai-vision-challenge',
    organization: 'IEEE Student Branch',
    category: 'Competition',
    description:
      'Engineered a real-time object tracking and spatial depth estimation model using lightweight convolutional networks optimized for edge inference with high FPS constraints.',
    date: '2025-08-22',
    end_date: null,
    location: 'Punjab, India',
    mode: 'Hybrid',
    role: 'Solo Participant & ML Engineer',
    achievement: '1st Runner Up',
    skills: ['Edge AI', 'Model Quantization', 'Spatial Analysis', 'Computer Vision'],
    technologies: ['Python', 'OpenCV', 'PyTorch', 'TensorRT'],
    image_url: null,
    document_url: null,
    credential_id: 'IEEE-CV-2025-082',
    credential_url: null,
    featured: true,
    published: true,
    display_order: 3,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: '00000000-0000-4000-b500-000000000004',
    title: 'Global Open Source Contribution Sprint',
    slug: 'global-open-source-contribution-sprint',
    organization: 'Open Source Initiative & GitHub Community',
    category: 'Open Source',
    description:
      'Collaborated with international developers to improve TypeScript AST parsers, developer CLI utilities, and automated accessibility auditing tools.',
    date: '2025-05-10',
    end_date: '2025-05-17',
    location: 'Global / Remote',
    mode: 'Online',
    role: 'Core Contributor',
    achievement: 'Merged 8 Major PRs into Developer Tooling Repos',
    skills: ['Open Source Collaboration', 'AST Parsing', 'Git Workflows', 'CI/CD Automation'],
    technologies: ['TypeScript', 'Node.js', 'GitHub Actions', 'Jest'],
    image_url: null,
    document_url: null,
    credential_id: null,
    credential_url: null,
    featured: false,
    published: true,
    display_order: 4,
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

    const { data, error } = await query
    if (!error && Array.isArray(data)) return data

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

    const { data, error } = await query
    if (!error && Array.isArray(data)) return data

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
      .maybeSingle()
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

// ============================================================
// Training Queries
// ============================================================
export async function getTrainings(options?: {
  category?: string
  provider?: string
  search?: string
  limit?: number
  featured?: boolean
}): Promise<Training[]> {
  const cacheKey = `trainings_${JSON.stringify(options ?? {})}`
  const cached = getCached<Training[]>(cacheKey)
  if (cached) return cached

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    let query = supabase
      .from('training')
      .select('*')
      .eq('published', true)
      .order('featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('start_date', { ascending: false })

    if (options?.category && options.category !== 'All') {
      query = query.eq('category', options.category)
    }
    if (options?.provider) {
      query = query.or(`provider.ilike.%${options.provider}%,organization.ilike.%${options.provider}%`)
    }
    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,provider.ilike.%${options.search}%,organization.ilike.%${options.search}%`)
    }
    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query
    if (!error && Array.isArray(data)) return data

    let filtered = FALLBACK_TRAININGS.filter((t) => t.published)
    if (options?.category && options.category !== 'All') {
      filtered = filtered.filter((t) => t.category === options.category)
    }
    if (options?.featured !== undefined) {
      filtered = filtered.filter((t) => t.featured === options.featured)
    }
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit)
    }
    return filtered
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_TRAININGS)
  setCache(cacheKey, data)
  return data
}

export async function getPublishedTrainings(): Promise<Training[]> {
  return getTrainings()
}

export async function getTrainingBySlug(slug: string): Promise<Training | null> {
  const cached = getCached<Training>(`training_slug_${slug}`)
  if (cached) return cached

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    const { data, error } = await supabase
      .from('training')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()
    if (!error && data) return data
    return data || FALLBACK_TRAININGS.find((t) => t.slug === slug) || null
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_TRAININGS.find((t) => t.slug === slug) || null)
  if (data) setCache(`training_slug_${slug}`, data)
  return data
}

export async function getTrainingById(id: string): Promise<Training | null> {
  const cached = getCached<Training>(`training_id_${id}`)
  if (cached) return cached

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    const { data, error } = await supabase
      .from('training')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (!error && data) return data
    return data || FALLBACK_TRAININGS.find((t) => t.id === id) || null
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_TRAININGS.find((t) => t.id === id) || null)
  if (data) setCache(`training_id_${id}`, data)
  return data
}

export async function getAllTrainingSlugs(): Promise<string[]> {
  const list = await getTrainings()
  return list.map((t) => t.slug)
}

export async function getTrainingProviders(): Promise<string[]> {
  const list = await getTrainings()
  const providers = [...new Set(list.map((t) => t.provider || t.organization).filter(Boolean) as string[])]
  return providers.sort()
}

// ============================================================
// Co-Curricular Activities Queries
// ============================================================
export async function getCoCurricularActivities(options?: {
  category?: string
  mode?: string
  search?: string
  limit?: number
  featured?: boolean
}): Promise<CoCurricularActivity[]> {
  const cacheKey = `co_curr_${JSON.stringify(options ?? {})}`
  const cached = getCached<CoCurricularActivity[]>(cacheKey)
  if (cached) return cached

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    let query = supabase
      .from('co_curricular_activities')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true })
      .order('date', { ascending: false })

    if (options?.category && options.category !== 'All') {
      query = query.eq('category', options.category)
    }
    if (options?.mode && options.mode !== 'All') {
      query = query.eq('mode', options.mode)
    }
    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query
    if (!error && Array.isArray(data)) return data

    let filtered = FALLBACK_CO_CURRICULAR.filter((a) => a.published)
    if (options?.category && options.category !== 'All') {
      filtered = filtered.filter((a) => a.category?.toLowerCase() === options.category?.toLowerCase())
    }
    if (options?.mode && options.mode !== 'All') {
      filtered = filtered.filter((a) => a.mode?.toLowerCase() === options.mode?.toLowerCase())
    }
    if (options?.featured !== undefined) {
      filtered = filtered.filter((a) => a.featured === options.featured)
    }
    if (options?.search) {
      const q = options.search.toLowerCase().trim()
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.organization && a.organization.toLowerCase().includes(q)) ||
          (a.role && a.role.toLowerCase().includes(q)) ||
          (a.achievement && a.achievement.toLowerCase().includes(q)) ||
          (a.skills && a.skills.some((s) => s.toLowerCase().includes(q)))
      )
    }
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit)
    }
    return filtered
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_CO_CURRICULAR)
  setCache(cacheKey, data)
  return data
}

export async function getPublishedCoCurricularActivities(options?: {
  category?: string
  limit?: number
}): Promise<CoCurricularActivity[]> {
  return getCoCurricularActivities(options)
}

export async function getFeaturedCoCurricularActivities(limit = 3): Promise<CoCurricularActivity[]> {
  return getCoCurricularActivities({ featured: true, limit })
}

export async function getCoCurricularActivityBySlug(slug: string): Promise<CoCurricularActivity | null> {
  const cached = getCached<CoCurricularActivity>(`co_curr_slug_${slug}`)
  if (cached) return cached

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    const { data } = await supabase
      .from('co_curricular_activities')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()
    return data || FALLBACK_CO_CURRICULAR.find((a) => a.slug === slug) || null
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_CO_CURRICULAR.find((a) => a.slug === slug) || null)
  if (data) setCache(`co_curr_slug_${slug}`, data)
  return data
}

export async function getCoCurricularActivityById(id: string): Promise<CoCurricularActivity | null> {
  const cached = getCached<CoCurricularActivity>(`co_curr_id_${id}`)
  if (cached) return cached

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    const { data } = await supabase
      .from('co_curricular_activities')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    return data || FALLBACK_CO_CURRICULAR.find((a) => a.id === id) || null
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_CO_CURRICULAR.find((a) => a.id === id) || null)
  if (data) setCache(`co_curr_id_${id}`, data)
  return data
}

export async function getAllCoCurricularSlugs(): Promise<string[]> {
  const list = await getCoCurricularActivities()
  return list.map((a) => a.slug)
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

    const { data, error } = await query
    if (!error && Array.isArray(data)) return data
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
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
    if (!error && Array.isArray(data)) return data
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
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
    if (!error && Array.isArray(data)) return data
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

    const { data, error } = await query
    if (!error && Array.isArray(data)) return data
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
    trainings: FALLBACK_TRAININGS.length,
    coCurricular: FALLBACK_CO_CURRICULAR.length,
  }

  const fetchPromise = (async () => {
    const supabase = getPublicSupabase()
    const [
      { count: projects },
      { count: certificates },
      { count: achievements },
      { count: hackathons },
      { count: trainings },
      { count: coCurricular },
    ] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('achievements').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true })
        .eq('published', true)
        .eq('category', 'Hackathon'),
      supabase.from('training').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('co_curricular_activities').select('*', { count: 'exact', head: true }).eq('published', true),
    ])

    return {
      projects: projects ?? fallbackStats.projects,
      certificates: certificates ?? fallbackStats.certificates,
      achievements: achievements ?? fallbackStats.achievements,
      hackathons: hackathons ?? fallbackStats.hackathons,
      trainings: trainings ?? fallbackStats.trainings,
      coCurricular: coCurricular ?? fallbackStats.coCurricular,
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
    try {
      const supabase = getPublicSupabase()
      const { data } = await supabase.from('site_settings').select('value').eq('key', key).single()
      const row = data as { value?: string } | null
      return row?.value ?? null
    } catch {
      return null
    }
  })()

  const data = await withTimeout(fetchPromise, null)
  setCache(`setting_${key}`, data)
  return data
}

// ============================================================
// Unified Admin CMS Fetchers (Shared Source of Truth)
// ============================================================

export async function getAdminProjects(): Promise<Project[]> {
  const cached = getCached<Project[]>('admin_projects')
  if (cached !== null) return cached

  const fetchPromise = (async () => {
    try {
      const supabase = getPublicSupabase()
      const { data, error } = await supabase.from('projects').select('*').order('sort_order', { ascending: true })
      if (!error && Array.isArray(data)) return data
      return FALLBACK_PROJECTS
    } catch {
      return FALLBACK_PROJECTS
    }
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_PROJECTS, 1000)
  setCache('admin_projects', data)
  return data
}

export async function getAdminCertificates(): Promise<Certificate[]> {
  const cached = getCached<Certificate[]>('admin_certificates')
  if (cached !== null) return cached

  const fetchPromise = (async () => {
    try {
      const supabase = getPublicSupabase()
      const { data, error } = await supabase.from('certificates').select('*').order('issue_date', { ascending: false })
      if (!error && Array.isArray(data)) return data
      return FALLBACK_CERTIFICATES
    } catch {
      return FALLBACK_CERTIFICATES
    }
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_CERTIFICATES, 1000)
  setCache('admin_certificates', data)
  return data
}

export async function getAdminAchievements(): Promise<Achievement[]> {
  const cached = getCached<Achievement[]>('admin_achievements')
  if (cached !== null) return cached

  const fetchPromise = (async () => {
    try {
      const supabase = getPublicSupabase()
      const { data, error } = await supabase.from('achievements').select('*').order('date', { ascending: false })
      if (!error && Array.isArray(data)) return data
      return FALLBACK_ACHIEVEMENTS
    } catch {
      return FALLBACK_ACHIEVEMENTS
    }
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_ACHIEVEMENTS, 1000)
  setCache('admin_achievements', data)
  return data
}

export async function getAdminEducation(): Promise<Education[]> {
  const cached = getCached<Education[]>('admin_education')
  if (cached !== null) return cached

  const fetchPromise = (async () => {
    try {
      const supabase = getPublicSupabase()
      const { data, error } = await supabase.from('education').select('*').order('sort_order', { ascending: true })
      if (!error && Array.isArray(data)) return data
      return FALLBACK_EDUCATION
    } catch {
      return FALLBACK_EDUCATION
    }
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_EDUCATION, 1000)
  setCache('admin_education', data)
  return data
}

export async function getAdminExperience(): Promise<Experience[]> {
  const cached = getCached<Experience[]>('admin_experience')
  if (cached !== null) return cached

  const fetchPromise = (async () => {
    try {
      const supabase = getPublicSupabase()
      const { data, error } = await supabase.from('experience').select('*').order('sort_order', { ascending: true })
      if (!error && Array.isArray(data)) return data
      return FALLBACK_EXPERIENCE
    } catch {
      return FALLBACK_EXPERIENCE
    }
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_EXPERIENCE, 1000)
  setCache('admin_experience', data)
  return data
}

export async function getAdminSkills(): Promise<Skill[]> {
  const cached = getCached<Skill[]>('admin_skills')
  if (cached !== null) return cached

  const fetchPromise = (async () => {
    try {
      const supabase = getPublicSupabase()
      const { data, error } = await supabase.from('skills').select('*').order('category').order('sort_order')
      if (!error && Array.isArray(data)) return data
      return FALLBACK_SKILLS
    } catch {
      return FALLBACK_SKILLS
    }
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_SKILLS, 1000)
  setCache('admin_skills', data)
  return data
}

export async function getAdminProfile(): Promise<Profile> {
  const cached = getCached<Profile>('admin_profile')
  if (cached !== null) return cached

  const fetchPromise = (async () => {
    try {
      const supabase = getPublicSupabase()
      const { data } = await supabase.from('profiles').select('*').limit(1).single()
      return data || FALLBACK_PROFILE
    } catch {
      return FALLBACK_PROFILE
    }
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_PROFILE, 1000)
  setCache('admin_profile', data)
  return data
}

export async function getAdminTrainings(): Promise<Training[]> {
  const cached = getCached<Training[]>('admin_trainings')
  if (cached !== null) return cached

  const fetchPromise = (async () => {
    try {
      const supabase = getPublicSupabase()
      const { data, error } = await supabase
        .from('training')
        .select('*')
        .order('display_order', { ascending: true })
        .order('start_date', { ascending: false })
      if (!error && Array.isArray(data)) return data
      return FALLBACK_TRAININGS
    } catch {
      return FALLBACK_TRAININGS
    }
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_TRAININGS, 1000)
  setCache('admin_trainings', data)
  return data
}

export async function getAdminCoCurricularActivities(): Promise<CoCurricularActivity[]> {
  const cached = getCached<CoCurricularActivity[]>('admin_co_curr')
  if (cached) return cached

  const fetchPromise = (async () => {
    try {
      const supabase = getPublicSupabase()
      const { data, error } = await supabase
        .from('co_curricular_activities')
        .select('*')
        .order('display_order', { ascending: true })
        .order('date', { ascending: false })
      if (!error && Array.isArray(data)) return data
      return FALLBACK_CO_CURRICULAR
    } catch {
      return FALLBACK_CO_CURRICULAR
    }
  })()

  const data = await withTimeout(fetchPromise, FALLBACK_CO_CURRICULAR, 1000)
  setCache('admin_co_curr', data)
  return data
}

export async function getAdminDashboardStats(): Promise<{
  projects: number
  certificates: number
  trainings: number
  coCurricular: number
  achievements: number
  education: number
  experience: number
  skills: number
  messages: number
}> {
  const cached = getCached<{
    projects: number
    certificates: number
    trainings: number
    coCurricular: number
    achievements: number
    education: number
    experience: number
    skills: number
    messages: number
  }>('admin_dashboard_stats')
  if (cached !== null) return cached

  const fetchPromise = (async () => {
    const [projects, certs, trainings, coCurr, achievements, education, experience, skills] = await Promise.all([
      getAdminProjects(),
      getAdminCertificates(),
      getAdminTrainings(),
      getAdminCoCurricularActivities(),
      getAdminAchievements(),
      getAdminEducation(),
      getAdminExperience(),
      getAdminSkills(),
    ])

    let unreadMessages = 0
    try {
      const supabase = getPublicSupabase()
      const { count } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('read', false)
      unreadMessages = count ?? 0
    } catch {
      unreadMessages = 0
    }

    return {
      projects: projects.length,
      certificates: certs.length,
      trainings: trainings.length,
      coCurricular: coCurr.length,
      achievements: achievements.length,
      education: education.length,
      experience: experience.length,
      skills: skills.length,
      messages: unreadMessages,
    }
  })()

  const fallbackStats = {
    projects: FALLBACK_PROJECTS.length,
    certificates: FALLBACK_CERTIFICATES.length,
    trainings: FALLBACK_TRAININGS.length,
    coCurricular: FALLBACK_CO_CURRICULAR.length,
    achievements: FALLBACK_ACHIEVEMENTS.length,
    education: FALLBACK_EDUCATION.length,
    experience: FALLBACK_EXPERIENCE.length,
    skills: FALLBACK_SKILLS.length,
    messages: 0,
  }

  const data = await withTimeout(fetchPromise, fallbackStats, 1000)
  setCache('admin_dashboard_stats', data)
  return data
}

