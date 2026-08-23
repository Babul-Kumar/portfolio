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
// Project Form
// ============================================================
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

// ============================================================
// Certificate Form
// ============================================================
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
export type ContactFormValues    = z.infer<typeof contactSchema>
export type ProjectFormValues    = z.infer<typeof projectSchema>
export type CertificateFormValues = z.infer<typeof certificateSchema>
export type AchievementFormValues = z.infer<typeof achievementSchema>
export type EducationFormValues  = z.infer<typeof educationSchema>
export type ExperienceFormValues = z.infer<typeof experienceSchema>
export type SkillFormValues      = z.infer<typeof skillSchema>
export type ProfileFormValues    = z.infer<typeof profileSchema>
