-- ============================================================
-- BABUL KUMAR PORTFOLIO — DATABASE SCHEMA
-- Migration 001: Core Tables
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- profiles — Single row representing Babul's identity
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL DEFAULT 'Babul Kumar',
  display_name  TEXT DEFAULT 'BABUL KUMAR',
  tagline       TEXT DEFAULT 'Computer Science · AI / ML · Full Stack',
  bio           TEXT DEFAULT 'B.Tech Computer Science & Engineering student at Lovely Professional University, exploring Artificial Intelligence, Machine Learning and Full-Stack Development.',
  bio_extended  TEXT,
  location      TEXT DEFAULT 'India',
  university    TEXT DEFAULT 'Lovely Professional University',
  degree        TEXT DEFAULT 'B.Tech Computer Science & Engineering',
  graduation_year INTEGER DEFAULT 2026,
  email         TEXT,
  phone         TEXT,
  github_url    TEXT DEFAULT 'https://github.com/babul-kumar',
  linkedin_url  TEXT,
  kaggle_url    TEXT,
  portfolio_url TEXT,
  resume_url    TEXT,
  avatar_url    TEXT,
  available_for TEXT DEFAULT 'Internships, Collaborations, Open Source',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- projects
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  short_desc      TEXT,
  description     TEXT,
  problem         TEXT,
  solution        TEXT,
  architecture    TEXT,
  category        TEXT NOT NULL DEFAULT 'Other',
  technologies    TEXT[] DEFAULT '{}',
  github_url      TEXT,
  live_url        TEXT,
  hero_image_url  TEXT,
  thumbnail_url   TEXT,
  project_date    DATE,
  featured        BOOLEAN DEFAULT FALSE,
  published       BOOLEAN DEFAULT FALSE,
  sort_order      INTEGER DEFAULT 0,
  results         TEXT,
  challenges      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_slug      ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_featured  ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_category  ON projects(category);

-- ============================================================
-- project_images — Multiple images per project
-- ============================================================
CREATE TABLE IF NOT EXISTS project_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  caption     TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_images_project ON project_images(project_id);

-- ============================================================
-- certificates
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  issuer           TEXT NOT NULL,
  category         TEXT NOT NULL DEFAULT 'Other',
  issue_date       DATE,
  expiry_date      DATE,
  credential_id    TEXT,
  verification_url TEXT,
  description      TEXT,
  file_url         TEXT,
  thumbnail_url    TEXT,
  skills           TEXT[] DEFAULT '{}',
  featured         BOOLEAN DEFAULT FALSE,
  published        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certs_slug      ON certificates(slug);
CREATE INDEX IF NOT EXISTS idx_certs_category  ON certificates(category);
CREATE INDEX IF NOT EXISTS idx_certs_issuer    ON certificates(issuer);
CREATE INDEX IF NOT EXISTS idx_certs_published ON certificates(published);
CREATE INDEX IF NOT EXISTS idx_certs_featured  ON certificates(featured);
CREATE INDEX IF NOT EXISTS idx_certs_date      ON certificates(issue_date DESC);

-- ============================================================
-- achievements
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  organization     TEXT,
  category         TEXT NOT NULL DEFAULT 'Other',
  date             DATE,
  rank             TEXT,
  description      TEXT,
  image_url        TEXT,
  certificate_url  TEXT,
  verification_url TEXT,
  featured         BOOLEAN DEFAULT FALSE,
  published        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_published ON achievements(published);
CREATE INDEX IF NOT EXISTS idx_achievements_category  ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_date      ON achievements(date DESC);

-- ============================================================
-- education
-- ============================================================
CREATE TABLE IF NOT EXISTS education (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution TEXT NOT NULL,
  degree      TEXT NOT NULL,
  field       TEXT,
  start_date  DATE,
  end_date    DATE,
  is_current  BOOLEAN DEFAULT FALSE,
  grade       TEXT,
  description TEXT,
  location    TEXT,
  logo_url    TEXT,
  website_url TEXT,
  sort_order  INTEGER DEFAULT 0,
  published   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_education_published ON education(published);

-- ============================================================
-- experience
-- ============================================================
CREATE TABLE IF NOT EXISTS experience (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company      TEXT NOT NULL,
  role         TEXT NOT NULL,
  start_date   DATE,
  end_date     DATE,
  is_current   BOOLEAN DEFAULT FALSE,
  description  TEXT,
  technologies TEXT[] DEFAULT '{}',
  company_url  TEXT,
  location     TEXT,
  type         TEXT DEFAULT 'Full-time',
  logo_url     TEXT,
  sort_order   INTEGER DEFAULT 0,
  published    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experience_published ON experience(published);

-- ============================================================
-- skills
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'Other',
  icon       TEXT,
  level      TEXT DEFAULT 'Intermediate',
  featured   BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  published  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_category  ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_published ON skills(published);

-- ============================================================
-- social_links
-- ============================================================
CREATE TABLE IF NOT EXISTS social_links (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform   TEXT NOT NULL,
  url        TEXT NOT NULL,
  label      TEXT,
  icon       TEXT,
  sort_order INTEGER DEFAULT 0,
  published  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- contact_messages — Submitted via contact form
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  ip_address TEXT,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_read ON contact_messages(read);

-- ============================================================
-- site_settings — Key-value store for global settings
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default settings
INSERT INTO site_settings (key, value) VALUES
  ('resume_url', ''),
  ('site_title', 'Babul Kumar — Digital Archive'),
  ('maintenance_mode', 'false'),
  ('contact_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER profiles_updated_at    BEFORE UPDATE ON profiles    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER projects_updated_at    BEFORE UPDATE ON projects    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER certificates_updated_at BEFORE UPDATE ON certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER achievements_updated_at BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER education_updated_at   BEFORE UPDATE ON education   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER experience_updated_at  BEFORE UPDATE ON experience  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER skills_updated_at      BEFORE UPDATE ON skills      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
