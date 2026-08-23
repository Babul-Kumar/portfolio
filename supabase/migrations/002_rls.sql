-- ============================================================
-- BABUL KUMAR PORTFOLIO — ROW LEVEL SECURITY
-- Migration 002: RLS Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects           ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE education          ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience         ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills             ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links       ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- profiles — Public can read; authenticated admin can write
-- ============================================================
CREATE POLICY "Public read profiles" ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Admin write profiles" ON profiles
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- projects — Public reads published; admin CRUD all
-- ============================================================
CREATE POLICY "Public read published projects" ON projects
  FOR SELECT USING (published = TRUE);

CREATE POLICY "Admin all projects" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

-- project_images mirrors project visibility
CREATE POLICY "Public read project images" ON project_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_images.project_id
        AND p.published = TRUE
    )
  );

CREATE POLICY "Admin all project images" ON project_images
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- certificates — Public reads published; admin CRUD all
-- ============================================================
CREATE POLICY "Public read published certs" ON certificates
  FOR SELECT USING (published = TRUE);

CREATE POLICY "Admin all certs" ON certificates
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- achievements
-- ============================================================
CREATE POLICY "Public read published achievements" ON achievements
  FOR SELECT USING (published = TRUE);

CREATE POLICY "Admin all achievements" ON achievements
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- education
-- ============================================================
CREATE POLICY "Public read published education" ON education
  FOR SELECT USING (published = TRUE);

CREATE POLICY "Admin all education" ON education
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- experience
-- ============================================================
CREATE POLICY "Public read published experience" ON experience
  FOR SELECT USING (published = TRUE);

CREATE POLICY "Admin all experience" ON experience
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- skills
-- ============================================================
CREATE POLICY "Public read published skills" ON skills
  FOR SELECT USING (published = TRUE);

CREATE POLICY "Admin all skills" ON skills
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- social_links
-- ============================================================
CREATE POLICY "Public read published social links" ON social_links
  FOR SELECT USING (published = TRUE);

CREATE POLICY "Admin all social links" ON social_links
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- contact_messages — Public can insert; only admin can read/delete
-- ============================================================
CREATE POLICY "Public insert messages" ON contact_messages
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admin read messages" ON contact_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin delete messages" ON contact_messages
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin update messages" ON contact_messages
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- site_settings — Public read; admin write
-- ============================================================
CREATE POLICY "Public read settings" ON site_settings
  FOR SELECT USING (TRUE);

CREATE POLICY "Admin write settings" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Storage Buckets (run in Supabase Storage UI or via API)
-- Buckets to create manually in Supabase Storage:
--   certificates  (public)
--   projects      (public)
--   achievements  (public)
--   profile       (public)
--   resume        (public)
-- ============================================================
