-- ============================================================
-- Migration: 005_co_curricular_activities.sql
-- Description: Create co_curricular_activities table with RLS, triggers, and baseline seed data
-- Execute this script in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

-- 1. Create co_curricular_activities table
CREATE TABLE IF NOT EXISTS public.co_curricular_activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  organization    TEXT,
  category        TEXT NOT NULL DEFAULT 'Other',
  description     TEXT,
  date            DATE,
  end_date        DATE,
  location        TEXT,
  mode            TEXT NOT NULL DEFAULT 'Offline',
  role            TEXT,
  achievement     TEXT,
  skills          TEXT[] DEFAULT '{}',
  technologies    TEXT[] DEFAULT '{}',
  image_url       TEXT,
  document_url    TEXT,
  credential_id   TEXT,
  credential_url  TEXT,
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  published       BOOLEAN NOT NULL DEFAULT TRUE,
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for high performance querying
CREATE INDEX IF NOT EXISTS idx_co_curr_slug ON public.co_curricular_activities (slug);
CREATE INDEX IF NOT EXISTS idx_co_curr_published ON public.co_curricular_activities (published);
CREATE INDEX IF NOT EXISTS idx_co_curr_category ON public.co_curricular_activities (category);
CREATE INDEX IF NOT EXISTS idx_co_curr_featured ON public.co_curricular_activities (featured);
CREATE INDEX IF NOT EXISTS idx_co_curr_date ON public.co_curricular_activities (date DESC);
CREATE INDEX IF NOT EXISTS idx_co_curr_display_order ON public.co_curricular_activities (display_order ASC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.co_curricular_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent conflict
DROP POLICY IF EXISTS "Public can view published co_curricular_activities" ON public.co_curricular_activities;
DROP POLICY IF EXISTS "Admin can view all co_curricular_activities" ON public.co_curricular_activities;
DROP POLICY IF EXISTS "Admin can insert co_curricular_activities" ON public.co_curricular_activities;
DROP POLICY IF EXISTS "Admin can update co_curricular_activities" ON public.co_curricular_activities;
DROP POLICY IF EXISTS "Admin can delete co_curricular_activities" ON public.co_curricular_activities;

-- Public can view only published activities
CREATE POLICY "Public can view published co_curricular_activities"
  ON public.co_curricular_activities
  FOR SELECT
  USING (published = TRUE);

-- Authenticated Admin can perform all operations (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admin can view all co_curricular_activities"
  ON public.co_curricular_activities
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Admin can insert co_curricular_activities"
  ON public.co_curricular_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Admin can update co_curricular_activities"
  ON public.co_curricular_activities
  FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Admin can delete co_curricular_activities"
  ON public.co_curricular_activities
  FOR DELETE
  TO authenticated
  USING (TRUE);

-- 4. Safe updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_co_curricular_activities_updated_at ON public.co_curricular_activities;
CREATE TRIGGER tr_co_curricular_activities_updated_at
  BEFORE UPDATE ON public.co_curricular_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Seed initial verified co-curricular activities
INSERT INTO public.co_curricular_activities (
  title, slug, organization, category, description, date, end_date, location, mode, role, achievement, skills, technologies, featured, published, display_order
) VALUES
(
  'Smart India Hackathon (SIH)',
  'smart-india-hackathon',
  'Ministry of Education & AICTE',
  'Hackathon',
  'Spearheaded a 6-member engineering team to design and develop an intelligent AI-driven disaster response and resource dispatch management system under a 36-hour continuous hackathon format.',
  '2025-12-18',
  '2025-12-20',
  'Nodal Centre, India',
  'Offline',
  'Team Lead & Full-Stack Architect',
  'National Finalist',
  ARRAY['Team Leadership', 'System Architecture', 'Rapid Prototyping', 'Public Pitching'],
  ARRAY['Next.js', 'FastAPI', 'PyTorch', 'PostgreSQL', 'WebSockets'],
  TRUE,
  TRUE,
  1
),
(
  'LPU Developer Community Tech Conclave',
  'lpu-developer-community-tech-conclave',
  'Developer Student Clubs & CSE Dept',
  'Technical Event',
  'Delivered an in-depth technical workshop on modern frontend architectures, WebGL/Three.js rendering pipelines, and building autonomous agentic tools to over 300 engineering students.',
  '2025-10-15',
  NULL,
  'Shanti Devi Mittal Auditorium, LPU',
  'Offline',
  'Technical Speaker & Organizer',
  'Keynote Speaker — 300+ Attendees',
  ARRAY['Technical Speaking', 'Workshop Delivery', 'Community Building', 'Developer Evangelism'],
  ARRAY['Three.js', 'React', 'TypeScript', 'WebGL', 'Next.js'],
  TRUE,
  TRUE,
  2
),
(
  'Inter-University AI & Computer Vision Challenge',
  'inter-university-ai-vision-challenge',
  'IEEE Student Branch',
  'Competition',
  'Engineered a real-time object tracking and spatial depth estimation model using lightweight convolutional networks optimized for edge inference with high FPS constraints.',
  '2025-08-22',
  NULL,
  'Punjab, India',
  'Hybrid',
  'Solo Participant & ML Engineer',
  '1st Runner Up',
  ARRAY['Edge AI', 'Model Quantization', 'Spatial Analysis', 'Computer Vision'],
  ARRAY['Python', 'OpenCV', 'PyTorch', 'TensorRT'],
  TRUE,
  TRUE,
  3
),
(
  'Global Open Source Contribution Sprint',
  'global-open-source-contribution-sprint',
  'Open Source Initiative & GitHub Community',
  'Open Source',
  'Collaborated with international developers to improve TypeScript AST parsers, developer CLI utilities, and automated accessibility auditing tools.',
  '2025-05-10',
  '2025-05-17',
  'Global / Remote',
  'Online',
  'Core Contributor',
  'Merged 8 Major PRs into Developer Tooling Repos',
  ARRAY['Open Source Collaboration', 'AST Parsing', 'Git Workflows', 'CI/CD Automation'],
  ARRAY['TypeScript', 'Node.js', 'GitHub Actions', 'Jest'],
  TRUE,
  TRUE,
  4
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  organization = EXCLUDED.organization,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  date = EXCLUDED.date,
  end_date = EXCLUDED.end_date,
  location = EXCLUDED.location,
  mode = EXCLUDED.mode,
  role = EXCLUDED.role,
  achievement = EXCLUDED.achievement,
  skills = EXCLUDED.skills,
  technologies = EXCLUDED.technologies,
  featured = EXCLUDED.featured,
  published = EXCLUDED.published,
  display_order = EXCLUDED.display_order;
