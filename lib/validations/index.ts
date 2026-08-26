import { z } from 'zod'

// ============================================================
// Contact Form
// ============================================================
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

// ============================================================
// Project Form & Categories
// ============================================================
export const PROJECT_CATEGORIES = [
  'AI & Machine Learning',
  'Full-Stack Web',
  'Systems & Infrastructure',
  'Mobile Applications',
  'Developer Tools',
  'Cybersecurity',
  'Data Science',
  'Other',
] as const

export const projectCategoryEnum = z.enum(PROJECT_CATEGORIES)

export const projectSchema = z.object({
  title:        z.string().min(1, 'Title is required').max(200),
  slug:         z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, hyphens only'),
  short_desc:   z.string().max(500).optional().or(z.literal('')),
  description:  z.string().optional().or(z.literal('')),
  problem:      z.string().optional().or(z.literal('')),
  solution:     z.string().optional().or(z.literal('')),
  architecture: z.string().optional().or(z.literal('')),
  results:      z.string().optional().or(z.literal('')),
  challenges:   z.string().optional().or(z.literal('')),
  category:     z.string().min(1, 'Category is required'),
  technologies: z.string().optional().or(z.literal('')),
  github_url:   z.string().url('Must be a valid URL').optional().or(z.literal('')),
  live_url:     z.string().url('Must be a valid URL').optional().or(z.literal('')),
  project_date: z.string().optional().or(z.literal('')),
  featured:     z.boolean(),
  published:    z.boolean(),
})

// ============================================================
// GitHub URL Validation Schema
// ============================================================
export const githubRepoUrlSchema = z.string().trim().refine(
  (val) => {
    if (!val) return false
    const normalized = val.replace(/^https?:\/\//, '').replace(/^www\./, '')
    return /^(github\.com\/)?[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/.test(normalized)
  },
  { message: 'Please enter a valid GitHub repository URL (e.g. https://github.com/owner/repo)' }
)

// ============================================================
// GitHub AI Project Analysis Schema (Untrusted AI Output Validation)
// ============================================================
export const githubProjectAnalysisSchema = z.object({
  title:        z.string().min(1).max(200).default(''),
  slug:         z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).default(''),
  short_desc:   z.string().max(500).default(''),
  description:  z.string().max(5000).default(''),
  problem:      z.string().max(3000).nullable().catch(null),
  solution:     z.string().max(3000).nullable().catch(null),
  architecture: z.string().max(3000).nullable().catch(null),
  results:      z.string().max(2000).nullable().catch(null),
  challenges:   z.string().max(2000).nullable().catch(null),
  category:     z.string().default('AI & Machine Learning'),
  technologies: z.array(z.string().max(50)).default([]),
  github_url:   z.string().url().default(''),
  live_url:     z.string().url().nullable().catch(null),
  project_date: z.string().nullable().catch(null),
  features:     z.array(z.string().max(300)).default([]),
  preview_image_url: z.string().url().nullable().catch(null),
})

export type GitHubProjectAnalysisValues = z.infer<typeof githubProjectAnalysisSchema>

// ============================================================
// Certificate Form & Categories
// ============================================================
export const CERTIFICATE_CATEGORIES = [
  'AI / ML',
  'Full Stack',
  'Programming',
  'Cloud',
  'Data',
  'Cybersecurity',
  'Hackathon',
  'Other',
] as const

export const certificateCategoryEnum = z.enum(CERTIFICATE_CATEGORIES)

export const certificateSchema = z.object({
  title:            z.string().min(1, 'Title is required').max(300),
  slug:             z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/),
  issuer:           z.string().min(1, 'Issuer is required').max(200),
  category:         z.string().min(1, 'Category is required'),
  issue_date:       z.string().optional().or(z.literal('')),
  expiry_date:      z.string().optional().or(z.literal('')),
  credential_id:    z.string().optional().or(z.literal('')),
  verification_url: z.string().url().optional().or(z.literal('')),
  description:      z.string().optional().or(z.literal('')),
  skills:           z.string().optional().or(z.literal('')),
  featured:         z.boolean(),
  published:        z.boolean(),
})

// ============================================================
// Training Form & Categories
// ============================================================
export const TRAINING_CATEGORIES = [
  'AI / ML',
  'Full Stack',
  'Web Development',
  'Data Science',
  'Cloud & DevOps',
  'Cybersecurity',
  'Industrial Training',
  'Workshop',
  'Bootcamp',
  'Other',
] as const

export const trainingCategoryEnum = z.enum(TRAINING_CATEGORIES)

export const TRAINING_MODES = ['Online', 'Offline', 'Hybrid'] as const
export const trainingModeEnum = z.enum(TRAINING_MODES)

export const trainingSchema = z.object({
  title:           z.string().min(1, 'Title is required').max(200),
  slug:            z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, hyphens only'),
  provider:        z.string().optional().or(z.literal('')),
  organization:    z.string().optional().or(z.literal('')),
  category:        z.string().min(1, 'Category is required'),
  description:     z.string().optional().or(z.literal('')),
  start_date:      z.string().optional().or(z.literal('')),
  end_date:        z.string().optional().or(z.literal('')),
  duration:        z.string().optional().or(z.literal('')),
  location:        z.string().optional().or(z.literal('')),
  mode:            z.string(),
  credential_id:   z.string().optional().or(z.literal('')),
  credential_url:  z.string().url('Must be a valid URL').optional().or(z.literal('')),
  skills:          z.string().optional().or(z.literal('')),
  technologies:    z.string().optional().or(z.literal('')),
  featured:        z.boolean(),
  published:       z.boolean(),
  display_order:   z.number(),
})

// ============================================================
// Co-Curricular Categories & Modes
// ============================================================
export const CO_CURRICULAR_CATEGORIES = [
  'Hackathon',
  'Technical Event',
  'Competition',
  'Workshop',
  'Conference',
  'Presentation',
  'Leadership',
  'Volunteering',
  'Club',
  'Open Source',
  'Entrepreneurship',
  'Innovation',
  'Cultural',
  'Sports',
  'Other',
] as const

export const coCurricularCategoryEnum = z.enum(CO_CURRICULAR_CATEGORIES)

export const CO_CURRICULAR_MODES = ['Offline', 'Online', 'Hybrid'] as const
export const coCurricularModeEnum = z.enum(CO_CURRICULAR_MODES)

export const coCurricularSchema = z.object({
  title:           z.string().min(1, 'Title is required').max(200),
  slug:            z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, hyphens only'),
  organization:    z.string().optional().or(z.literal('')),
  category:        z.string().min(1, 'Category is required'),
  description:     z.string().optional().or(z.literal('')),
  date:            z.string().optional().or(z.literal('')),
  end_date:        z.string().optional().or(z.literal('')),
  location:        z.string().optional().or(z.literal('')),
  mode:            z.string(),
  role:            z.string().optional().or(z.literal('')),
  achievement:     z.string().optional().or(z.literal('')),
  credential_id:   z.string().optional().or(z.literal('')),
  credential_url:  z.string().url('Must be a valid URL').optional().or(z.literal('')),
  skills:          z.string().optional().or(z.literal('')),
  technologies:    z.string().optional().or(z.literal('')),
  featured:        z.boolean(),
  published:       z.boolean(),
  display_order:   z.number(),
})

// ============================================================
// Certificate Analysis Types
// ============================================================
export const CERTIFICATE_ANALYSIS_TYPES = ['training', 'co_curricular', 'certificate'] as const
export const certificateAnalysisTypeEnum = z.enum(CERTIFICATE_ANALYSIS_TYPES)

// ============================================================
// Gemini Certificate Extraction Schema (Untrusted AI Output Validation)
// ============================================================
export const geminiExtractionConfidenceSchema = z.object({
  title:            z.number().min(0).max(1).default(0.5),
  issuer:           z.number().min(0).max(1).default(0.5),
  category:         z.number().min(0).max(1).default(0.5),
  issue_date:       z.number().min(0).max(1).default(0.5),
  expiry_date:      z.number().min(0).max(1).default(0),
  credential_id:    z.number().min(0).max(1).default(0.5),
  verification_url: z.number().min(0).max(1).default(0.5),
  description:      z.number().min(0).max(1).default(0.5),
  skills:           z.number().min(0).max(1).default(0.5),
})

export const geminiCertificateExtractionSchema = z.object({
  title:            z.string().max(300).default(''),
  issuer:           z.string().max(200).default(''),
  category:         certificateCategoryEnum.catch('AI / ML'),
  issue_date:       z.string().nullable().catch(null),
  expiry_date:      z.string().nullable().catch(null),
  credential_id:    z.string().nullable().catch(null),
  verification_url: z.string().url().nullable().catch(null),
  description:      z.string().max(1000).nullable().catch(null),
  skills:           z.array(z.string().max(50)).default([]),
  recipient_name:   z.string().nullable().catch(null),
  recipient_match:  z.boolean().nullable().catch(null),
  recipient_warning: z.string().nullable().catch(null),
  warnings:         z.array(z.string().max(200)).default([]),
  confidence:       geminiExtractionConfidenceSchema.default({
    title: 0.5,
    issuer: 0.5,
    category: 0.5,
    issue_date: 0.5,
    expiry_date: 0,
    credential_id: 0.5,
    verification_url: 0.5,
    description: 0.5,
    skills: 0.5,
  }),
})

export type GeminiCertificateExtractionValues = z.infer<typeof geminiCertificateExtractionSchema>

// ============================================================
// Gemini Training Extraction Schema
// ============================================================
export const trainingExtractionConfidenceSchema = z.object({
  title:          z.number().min(0).max(1).default(0.5),
  provider:       z.number().min(0).max(1).default(0.5),
  organization:   z.number().min(0).max(1).default(0.5),
  category:       z.number().min(0).max(1).default(0.5),
  start_date:     z.number().min(0).max(1).default(0.5),
  end_date:       z.number().min(0).max(1).default(0.5),
  duration:       z.number().min(0).max(1).default(0.5),
  location:       z.number().min(0).max(1).default(0.5),
  mode:           z.number().min(0).max(1).default(0.5),
  skills:         z.number().min(0).max(1).default(0.5),
  technologies:   z.number().min(0).max(1).default(0.5),
  credential_id:  z.number().min(0).max(1).default(0.5),
  credential_url: z.number().min(0).max(1).default(0.5),
  description:    z.number().min(0).max(1).default(0.5),
})

export const geminiTrainingExtractionSchema = z.object({
  title:            z.string().max(300).default(''),
  provider:         z.string().max(200).nullable().catch(null),
  organization:     z.string().max(200).nullable().catch(null),
  category:         trainingCategoryEnum.catch('Other'),
  description:      z.string().max(1500).nullable().catch(null),
  start_date:       z.string().nullable().catch(null),
  end_date:         z.string().nullable().catch(null),
  duration:         z.string().max(100).nullable().catch(null),
  location:         z.string().max(200).nullable().catch(null),
  mode:             trainingModeEnum.catch('Online'),
  skills:           z.array(z.string().max(50)).default([]),
  technologies:     z.array(z.string().max(50)).default([]),
  credential_id:    z.string().max(100).nullable().catch(null),
  credential_url:   z.string().url().nullable().catch(null),
  recipient_name:   z.string().nullable().catch(null),
  recipient_match:  z.boolean().nullable().catch(null),
  recipient_warning: z.string().nullable().catch(null),
  warnings:         z.array(z.string().max(200)).default([]),
  confidence:       trainingExtractionConfidenceSchema.default({
    title: 0.5,
    provider: 0.5,
    organization: 0.5,
    category: 0.5,
    start_date: 0.5,
    end_date: 0.5,
    duration: 0.5,
    location: 0.5,
    mode: 0.5,
    skills: 0.5,
    technologies: 0.5,
    credential_id: 0.5,
    credential_url: 0.5,
    description: 0.5,
  }),
})

export type GeminiTrainingExtractionValues = z.infer<typeof geminiTrainingExtractionSchema>

// ============================================================
// Gemini Co-Curricular Extraction Schema
// ============================================================
export const coCurricularExtractionConfidenceSchema = z.object({
  title:          z.number().min(0).max(1).default(0.5),
  organization:   z.number().min(0).max(1).default(0.5),
  category:       z.number().min(0).max(1).default(0.5),
  date:           z.number().min(0).max(1).default(0.5),
  end_date:       z.number().min(0).max(1).default(0.5),
  location:       z.number().min(0).max(1).default(0.5),
  mode:           z.number().min(0).max(1).default(0.5),
  role:           z.number().min(0).max(1).default(0.5),
  achievement:    z.number().min(0).max(1).default(0.5),
  skills:         z.number().min(0).max(1).default(0.5),
  technologies:   z.number().min(0).max(1).default(0.5),
  credential_id:  z.number().min(0).max(1).default(0.5),
  credential_url: z.number().min(0).max(1).default(0.5),
  description:    z.number().min(0).max(1).default(0.5),
})

export const geminiCoCurricularExtractionSchema = z.object({
  title:            z.string().max(300).default(''),
  organization:     z.string().max(200).nullable().catch(null),
  category:         coCurricularCategoryEnum.catch('Other'),
  description:      z.string().max(1500).nullable().catch(null),
  date:             z.string().nullable().catch(null),
  end_date:         z.string().nullable().catch(null),
  location:         z.string().max(200).nullable().catch(null),
  mode:             coCurricularModeEnum.catch('Offline'),
  role:             z.string().max(150).nullable().catch(null),
  achievement:      z.string().max(200).nullable().catch(null),
  skills:           z.array(z.string().max(50)).default([]),
  technologies:     z.array(z.string().max(50)).default([]),
  credential_id:    z.string().max(100).nullable().catch(null),
  credential_url:   z.string().url().nullable().catch(null),
  recipient_name:   z.string().nullable().catch(null),
  recipient_match:  z.boolean().nullable().catch(null),
  recipient_warning: z.string().nullable().catch(null),
  warnings:         z.array(z.string().max(200)).default([]),
  confidence:       coCurricularExtractionConfidenceSchema.default({
    title: 0.5,
    organization: 0.5,
    category: 0.5,
    date: 0.5,
    end_date: 0.5,
    location: 0.5,
    mode: 0.5,
    role: 0.5,
    achievement: 0.5,
    skills: 0.5,
    technologies: 0.5,
    credential_id: 0.5,
    credential_url: 0.5,
    description: 0.5,
  }),
})

export type GeminiCoCurricularExtractionValues = z.infer<typeof geminiCoCurricularExtractionSchema>

// ============================================================
// Achievement Form
// ============================================================
export const achievementSchema = z.object({
  title:            z.string().min(1, 'Title is required').max(300),
  slug:             z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/),
  organization:     z.string().optional().or(z.literal('')),
  category:         z.string().min(1, 'Category is required'),
  date:             z.string().optional().or(z.literal('')),
  rank:             z.string().optional().or(z.literal('')),
  description:      z.string().optional().or(z.literal('')),
  verification_url: z.string().url().optional().or(z.literal('')),
  featured:         z.boolean(),
  published:        z.boolean(),
})

// ============================================================
// Education Form
// ============================================================
export const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree:      z.string().min(1, 'Degree is required'),
  field:       z.string().optional().or(z.literal('')),
  start_date:  z.string().optional().or(z.literal('')),
  end_date:    z.string().optional().or(z.literal('')),
  is_current:  z.boolean(),
  grade:       z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  location:    z.string().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
  published:   z.boolean(),
})

// ============================================================
// Experience Form
// ============================================================
export const experienceSchema = z.object({
  company:      z.string().min(1, 'Company is required'),
  role:         z.string().min(1, 'Role is required'),
  start_date:   z.string().optional().or(z.literal('')),
  end_date:     z.string().optional().or(z.literal('')),
  is_current:   z.boolean(),
  description:  z.string().optional().or(z.literal('')),
  technologies: z.string().optional().or(z.literal('')),
  company_url:  z.string().url().optional().or(z.literal('')),
  location:     z.string().optional().or(z.literal('')),
  type:         z.string(),
  published:    z.boolean(),
})

// ============================================================
// Skill Form
// ============================================================
export const skillSchema = z.object({
  name:      z.string().min(1, 'Name is required'),
  category:  z.string().min(1, 'Category is required'),
  icon:      z.string().optional().or(z.literal('')),
  level:     z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
  featured:  z.boolean(),
  published: z.boolean(),
})

// ============================================================
// Profile Form
// ============================================================
export const profileSchema = z.object({
  name:            z.string().min(1, 'Name is required'),
  display_name:    z.string().optional().or(z.literal('')),
  tagline:         z.string().optional().or(z.literal('')),
  bio:             z.string().optional().or(z.literal('')),
  bio_extended:    z.string().optional().or(z.literal('')),
  location:        z.string().optional().or(z.literal('')),
  university:      z.string().optional().or(z.literal('')),
  degree:          z.string().optional().or(z.literal('')),
  graduation_year: z.string().optional().or(z.literal('')),
  email:           z.string().email().optional().or(z.literal('')),
  phone:           z.string().optional().or(z.literal('')),
  github_url:      z.string().url().optional().or(z.literal('')),
  linkedin_url:    z.string().url().optional().or(z.literal('')),
  kaggle_url:      z.string().url().optional().or(z.literal('')),
  portfolio_url:   z.string().url().optional().or(z.literal('')),
  available_for:   z.string().optional().or(z.literal('')),
})

// ============================================================
// Inferred Types
// ============================================================
export type ContactFormValues        = z.infer<typeof contactSchema>
export type ProjectFormValues        = z.infer<typeof projectSchema>
export type CertificateFormValues     = z.infer<typeof certificateSchema>
export type TrainingFormValues        = z.infer<typeof trainingSchema>
export type CoCurricularFormValues    = z.infer<typeof coCurricularSchema>
export type AchievementFormValues    = z.infer<typeof achievementSchema>
export type EducationFormValues      = z.infer<typeof educationSchema>
export type ExperienceFormValues     = z.infer<typeof experienceSchema>
export type SkillFormValues          = z.infer<typeof skillSchema>
export type ProfileFormValues        = z.infer<typeof profileSchema>
