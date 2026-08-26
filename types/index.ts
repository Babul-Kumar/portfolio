// ============================================================
// TypeScript Types — mirrors the database schema exactly
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Profile {
  id: string
  name: string
  display_name: string | null
  tagline: string | null
  bio: string | null
  bio_extended: string | null
  location: string | null
  university: string | null
  degree: string | null
  graduation_year: number | null
  email: string | null
  phone: string | null
  github_url: string | null
  linkedin_url: string | null
  kaggle_url: string | null
  portfolio_url: string | null
  resume_url: string | null
  avatar_url: string | null
  available_for: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  slug: string
  short_desc: string | null
  description: string | null
  problem: string | null
  solution: string | null
  architecture: string | null
  category: string
  technologies: string[]
  github_url: string | null
  live_url: string | null
  hero_image_url: string | null
  thumbnail_url: string | null
  project_date: string | null
  featured: boolean
  published: boolean
  sort_order: number
  results: string | null
  challenges: string | null
  created_at: string
  updated_at: string
  project_images?: ProjectImage[]
}

export interface ProjectImage {
  id: string
  project_id: string
  url: string
  caption: string | null
  sort_order: number
  created_at: string
}

export interface Certificate {
  id: string
  title: string
  slug: string
  issuer: string
  category: string
  issue_date: string | null
  expiry_date: string | null
  credential_id: string | null
  verification_url: string | null
  description: string | null
  file_url: string | null
  thumbnail_url: string | null
  skills: string[]
  featured: boolean
  published: boolean
  created_at: string
  updated_at: string
}

export interface ExtractionConfidence {
  title: number
  issuer: number
  category: number
  issue_date: number
  expiry_date: number
  credential_id: number
  verification_url: number
  description: number
  skills: number
}

export type CertificateAnalysisType = 'training' | 'co_curricular' | 'certificate'

export interface TrainingExtractionConfidence {
  title: number
  provider: number
  organization: number
  category: number
  start_date: number
  end_date: number
  duration: number
  location: number
  mode: number
  skills: number
  technologies: number
  credential_id: number
  credential_url: number
  description: number
}

export interface GeminiTrainingExtraction {
  title: string
  provider: string | null
  organization: string | null
  category: string
  description: string | null
  start_date: string | null
  end_date: string | null
  duration: string | null
  location: string | null
  mode: 'Online' | 'Offline' | 'Hybrid' | string
  skills: string[]
  technologies: string[]
  credential_id: string | null
  credential_url: string | null
  recipient_name: string | null
  recipient_match: boolean | null
  recipient_warning: string | null
  warnings: string[]
  confidence: TrainingExtractionConfidence
  file_url?: string | null
}

export interface CoCurricularExtractionConfidence {
  title: number
  organization: number
  category: number
  date: number
  end_date: number
  location: number
  mode: number
  role: number
  achievement: number
  skills: number
  technologies: number
  credential_id: number
  credential_url: number
  description: number
}

export interface GeminiCoCurricularExtraction {
  title: string
  organization: string | null
  category: string
  description: string | null
  date: string | null
  end_date: string | null
  location: string | null
  mode: 'Offline' | 'Online' | 'Hybrid' | string
  role: string | null
  achievement: string | null
  skills: string[]
  technologies: string[]
  credential_id: string | null
  credential_url: string | null
  recipient_name: string | null
  recipient_match: boolean | null
  recipient_warning: string | null
  warnings: string[]
  confidence: CoCurricularExtractionConfidence
  file_url?: string | null
}

export interface GeminiCertificateExtraction {
  title: string
  issuer: string
  category: CertificateCategory
  issue_date: string | null
  expiry_date: string | null
  credential_id: string | null
  verification_url: string | null
  description: string | null
  skills: string[]
  recipient_name?: string | null
  recipient_match?: boolean | null
  recipient_warning?: string | null
  warnings?: string[]
  confidence: ExtractionConfidence
  file_url?: string | null
}

export type AnyDocumentExtraction =
  | GeminiTrainingExtraction
  | GeminiCoCurricularExtraction
  | GeminiCertificateExtraction

export interface Achievement {
  id: string
  title: string
  slug: string
  organization: string | null
  category: string
  date: string | null
  rank: string | null
  description: string | null
  image_url: string | null
  certificate_url: string | null
  verification_url: string | null
  featured: boolean
  published: boolean
  created_at: string
  updated_at: string
}

export interface Training {
  id: string
  title: string
  slug: string
  provider: string | null
  organization: string | null
  category: string
  description: string | null
  start_date: string | null
  end_date: string | null
  duration: string | null
  location: string | null
  mode: 'Online' | 'Offline' | 'Hybrid' | string
  certificate_url: string | null
  image_url: string | null
  skills: string[]
  technologies: string[]
  credential_id: string | null
  credential_url: string | null
  featured: boolean
  published: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type CoCurricularCategory =
  | 'Hackathon'
  | 'Technical Event'
  | 'Competition'
  | 'Workshop'
  | 'Conference'
  | 'Presentation'
  | 'Leadership'
  | 'Volunteering'
  | 'Club'
  | 'Open Source'
  | 'Entrepreneurship'
  | 'Innovation'
  | 'Cultural'
  | 'Sports'
  | 'Other'
  | string

export type CoCurricularMode = 'Offline' | 'Online' | 'Hybrid' | string

export interface CoCurricularActivity {
  id: string
  title: string
  slug: string
  organization: string | null
  category: string
  description: string | null
  date: string | null
  end_date: string | null
  location: string | null
  mode: 'Offline' | 'Online' | 'Hybrid' | string
  role: string | null
  achievement: string | null
  skills: string[]
  technologies: string[]
  image_url: string | null
  document_url: string | null
  credential_id: string | null
  credential_url: string | null
  featured: boolean
  published: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean
  grade: string | null
  description: string | null
  location: string | null
  logo_url: string | null
  website_url: string | null
  sort_order: number
  published: boolean
  created_at: string
  updated_at: string
}

export interface Experience {
  id: string
  company: string
  role: string
  start_date: string | null
  end_date: string | null
  is_current: boolean
  description: string | null
  technologies: string[]
  company_url: string | null
  location: string | null
  type: string
  logo_url: string | null
  sort_order: number
  published: boolean
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  name: string
  category: string
  icon: string | null
  level: string
  featured: boolean
  sort_order: number
  published: boolean
  created_at: string
  updated_at: string
}

export interface SocialLink {
  id: string
  platform: string
  url: string
  label: string | null
  icon: string | null
  sort_order: number
  published: boolean
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  ip_address: string | null
  read: boolean
  created_at: string
}

export interface SiteSetting {
  key: string
  value: string | null
  updated_at: string
}

// ============================================================
// Group types for grouped display
// ============================================================
export type SkillsByCategory = Record<string, Skill[]>

export type AchievementsByYear = Record<string, Achievement[]>

// ============================================================
// Filter / sort option types
// ============================================================
export type CertificateCategory = 'All' | 'AI / ML' | 'Full Stack' | 'Programming' | 'Cloud' | 'Data' | 'Cybersecurity' | 'Hackathon' | 'Other'

export type TrainingCategory =
  | 'All'
  | 'AI / ML'
  | 'Full Stack'
  | 'Web Development'
  | 'Data Science'
  | 'Cloud & DevOps'
  | 'Cybersecurity'
  | 'Industrial Training'
  | 'Workshop'
  | 'Bootcamp'
  | 'Other'

export type ProjectCategory = 'All' | 'AI / ML' | 'Machine Learning' | 'Full Stack' | 'Tools' | 'Security' | 'Other'

export type AchievementCategory = 'All' | 'Hackathon' | 'Competition' | 'Award' | 'Certification' | 'Other'

export type SortOrder = 'newest' | 'oldest' | 'az' | 'za'

// ============================================================
// Form types
// ============================================================
export interface ContactFormData {
  name: string
  email: string
  message: string
}

export interface ProjectFormData {
  title: string
  slug: string
  short_desc: string
  description: string
  problem: string
  solution: string
  architecture: string
  category: string
  technologies: string
  github_url: string
  live_url: string
  project_date: string
  featured: boolean
  published: boolean
  results: string
  challenges: string
}

export interface CertificateFormData {
  title: string
  slug: string
  issuer: string
  category: string
  issue_date: string
  expiry_date: string
  credential_id: string
  verification_url: string
  description: string
  skills: string
  featured: boolean
  published: boolean
}

export interface TrainingFormData {
  title: string
  slug: string
  provider: string
  organization: string
  category: string
  start_date: string
  end_date: string
  duration: string
  location: string
  mode: string
  credential_id: string
  credential_url: string
  description: string
  skills: string
  technologies: string
  featured: boolean
  published: boolean
  display_order: number
}

export interface CoCurricularFormData {
  title: string
  slug: string
  organization: string
  category: string
  description: string
  date: string
  end_date: string
  location: string
  mode: string
  role: string
  achievement: string
  credential_id: string
  credential_url: string
  skills: string
  technologies: string
  featured: boolean
  published: boolean
  display_order: number
}

// ============================================================
// Stats type used on homepage
// ============================================================
export interface PortfolioStats {
  projects: number
  certificates: number
  achievements: number
  hackathons: number
  trainings?: number
  coCurricular?: number
}

// ============================================================
// GitHub AI Repository Analysis Types
// ============================================================
export interface GitHubRepoMetadata {
  name: string
  full_name: string
  owner: string
  description: string | null
  stars: number
  forks: number
  language: string | null
  topics: string[]
  default_branch: string
  license: string | null
  created_at: string
  updated_at: string
  homepage: string | null
  has_readme: boolean
}

export interface GitHubProjectAnalysis {
  title: string
  slug: string
  short_desc: string
  description: string
  problem: string | null
  solution: string | null
  architecture: string | null
  results: string | null
  challenges: string | null
  category: string
  technologies: string[]
  github_url: string
  live_url: string | null
  project_date: string | null
  features: string[]
  preview_image_url: string | null
  repo_metadata?: GitHubRepoMetadata
}

export interface GitHubAnalysisResponse {
  success: boolean
  data?: GitHubProjectAnalysis
  error?: string
  cached?: boolean
}

