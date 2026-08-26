-- ============================================================
-- Migration: 005_co_curricular_activities.sql
-- Description: Create co_curricular_activities table with RLS and triggers
-- ============================================================

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

-- Indexes for high performance querying
CREATE INDEX IF NOT EXISTS idx_co_curr_slug ON public.co_curricular_activities (slug);
CREATE INDEX IF NOT EXISTS idx_co_curr_published ON public.co_curricular_activities (published);
CREATE INDEX IF NOT EXISTS idx_co_curr_category ON public.co_curricular_activities (category);
CREATE INDEX IF NOT EXISTS idx_co_curr_featured ON public.co_curricular_activities (featured);
CREATE INDEX IF NOT EXISTS idx_co_curr_date ON public.co_curricular_activities (date DESC);
CREATE INDEX IF NOT EXISTS idx_co_curr_display_order ON public.co_curricular_activities (display_order ASC);

-- Row Level Security
ALTER TABLE public.co_curricular_activities ENABLE ROW LEVEL SECURITY;

-- 1. Public can view only published activities
CREATE POLICY "Public can view published co_curricular_activities"
  ON public.co_curricular_activities
  FOR SELECT
  USING (published = TRUE);

-- 2. Authenticated Admin can perform all operations (SELECT, INSERT, UPDATE, DELETE)
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

-- Updated_at trigger
DROP TRIGGER IF EXISTS tr_co_curricular_activities_updated_at ON public.co_curricular_activities;
CREATE TRIGGER tr_co_curricular_activities_updated_at
  BEFORE UPDATE ON public.co_curricular_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
