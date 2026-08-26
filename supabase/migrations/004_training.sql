-- ============================================================
-- BABUL KUMAR PORTFOLIO — TRAINING FEATURE
-- Migration 004: Training Table & RLS Policies
-- ============================================================

-- 1. Create training table
CREATE TABLE IF NOT EXISTS training (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  provider         TEXT,
  organization     TEXT,
  category         TEXT NOT NULL DEFAULT 'Other',
  description      TEXT,
  start_date       DATE,
  end_date         DATE,
  duration         TEXT,
  location         TEXT,
  mode             TEXT NOT NULL DEFAULT 'Online',
  certificate_url  TEXT,
  image_url        TEXT,
  skills           TEXT[] DEFAULT '{}',
  technologies     TEXT[] DEFAULT '{}',
  credential_id    TEXT,
  credential_url   TEXT,
  featured         BOOLEAN DEFAULT FALSE,
  published        BOOLEAN DEFAULT TRUE,
  display_order    INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_training_slug          ON training(slug);
CREATE INDEX IF NOT EXISTS idx_training_published     ON training(published);
CREATE INDEX IF NOT EXISTS idx_training_featured      ON training(featured);
CREATE INDEX IF NOT EXISTS idx_training_category      ON training(category);
CREATE INDEX IF NOT EXISTS idx_training_display_order ON training(display_order);
CREATE INDEX IF NOT EXISTS idx_training_start_date    ON training(start_date DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE training ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Public reads published training records only
CREATE POLICY "Public read published training" ON training
  FOR SELECT USING (published = TRUE);

-- Authenticated Admin can perform full CRUD
CREATE POLICY "Admin all training" ON training
  FOR ALL USING (auth.role() = 'authenticated');

-- 5. Auto-update updated_at trigger (reuses handle_updated_at if defined)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
    DROP TRIGGER IF EXISTS on_training_updated ON training;
    CREATE TRIGGER on_training_updated
      BEFORE UPDATE ON training
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;
