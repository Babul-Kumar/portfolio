-- ============================================================
-- STORAGE RLS POLICIES FOR 'certificate' & 'profile picture'
-- Run this in the Supabase SQL Editor if buckets are created
-- ============================================================

-- 1. Policies for 'certificate' bucket
CREATE POLICY "Public Read Access for certificate" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'certificate');

CREATE POLICY "Admin Upload for certificate" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'certificate' AND auth.role() = 'authenticated');

CREATE POLICY "Admin Update for certificate" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'certificate' AND auth.role() = 'authenticated');

CREATE POLICY "Admin Delete for certificate" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'certificate' AND auth.role() = 'authenticated');

-- 2. Policies for 'profile picture' bucket
CREATE POLICY "Public Read Access for profile picture" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile picture');

CREATE POLICY "Admin Upload for profile picture" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'profile picture' AND auth.role() = 'authenticated');

CREATE POLICY "Admin Update for profile picture" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'profile picture' AND auth.role() = 'authenticated');

CREATE POLICY "Admin Delete for profile picture" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'profile picture' AND auth.role() = 'authenticated');
