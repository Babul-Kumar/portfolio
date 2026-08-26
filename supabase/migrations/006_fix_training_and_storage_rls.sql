-- ============================================================
-- BABUL KUMAR PORTFOLIO — COMPLETE CRUD & STORAGE RLS FIX
-- Migration 006: Comprehensive RLS for Training, Co-Curricular & Storage
-- ============================================================

-- 1. Ensure RLS is enabled on all tables
ALTER TABLE IF EXISTS public.training ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.co_curricular_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;

-- 2. Training Table Policies (Explicit separate actions for reliability)
DROP POLICY IF EXISTS "Public read published training" ON public.training;
DROP POLICY IF EXISTS "Admin all training" ON public.training;
DROP POLICY IF EXISTS "Admin can view all training" ON public.training;
DROP POLICY IF EXISTS "Admin can insert training" ON public.training;
DROP POLICY IF EXISTS "Admin can update training" ON public.training;
DROP POLICY IF EXISTS "Admin can delete training" ON public.training;

-- Public can view published training records
CREATE POLICY "Public read published training"
  ON public.training
  FOR SELECT
  USING (published = TRUE);

-- Authenticated administrator full CRUD policies
CREATE POLICY "Admin can view all training"
  ON public.training
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Admin can insert training"
  ON public.training
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Admin can update training"
  ON public.training
  FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Admin can delete training"
  ON public.training
  FOR DELETE
  TO authenticated
  USING (TRUE);


-- 3. Co-Curricular Activities Table Policies
DROP POLICY IF EXISTS "Public can view published co_curricular_activities" ON public.co_curricular_activities;
DROP POLICY IF EXISTS "Admin can view all co_curricular_activities" ON public.co_curricular_activities;
DROP POLICY IF EXISTS "Admin can insert co_curricular_activities" ON public.co_curricular_activities;
DROP POLICY IF EXISTS "Admin can update co_curricular_activities" ON public.co_curricular_activities;
DROP POLICY IF EXISTS "Admin can delete co_curricular_activities" ON public.co_curricular_activities;

CREATE POLICY "Public can view published co_curricular_activities"
  ON public.co_curricular_activities
  FOR SELECT
  USING (published = TRUE);

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


-- 4. Storage Bucket Cleanup Permissions (storage.objects)
-- Ensure authenticated users can upload and delete objects in standard portfolio buckets
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    -- Public read for public buckets
    DROP POLICY IF EXISTS "Public read storage objects" ON storage.objects;
    CREATE POLICY "Public read storage objects"
      ON storage.objects
      FOR SELECT
      USING (bucket_id IN ('certificate', 'certificates', 'projects', 'achievements', 'profile picture', 'profile', 'resume'));

    -- Authenticated Admin insert
    DROP POLICY IF EXISTS "Admin insert storage objects" ON storage.objects;
    CREATE POLICY "Admin insert storage objects"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id IN ('certificate', 'certificates', 'projects', 'achievements', 'profile picture', 'profile', 'resume'));

    -- Authenticated Admin update
    DROP POLICY IF EXISTS "Admin update storage objects" ON storage.objects;
    CREATE POLICY "Admin update storage objects"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id IN ('certificate', 'certificates', 'projects', 'achievements', 'profile picture', 'profile', 'resume'))
      WITH CHECK (bucket_id IN ('certificate', 'certificates', 'projects', 'achievements', 'profile picture', 'profile', 'resume'));

    -- Authenticated Admin delete
    DROP POLICY IF EXISTS "Admin delete storage objects" ON storage.objects;
    CREATE POLICY "Admin delete storage objects"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id IN ('certificate', 'certificates', 'projects', 'achievements', 'profile picture', 'profile', 'resume'));
  END IF;
END $$;
