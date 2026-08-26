# Training Public Page Synchronization & Certificate Media Root-Cause Fix Report

**Status:** Completed & Verified  
**Date:** August 26, 2026  
**Audience:** Developer / Architecture Team  
**Scope:** Shared Data Pipeline (Admin Form → Supabase Database → Supabase Storage → Public Query Data Layer → Homepage / Training Pages → Training Card & Media Components)

---

## 1. Executive Summary & Root-Cause Analysis

The portfolio platform exhibited an issue where published Training records (e.g. `CyberSecurity` at `Lovely Professional University`) visible as **Published / Live** in the Admin Dashboard were not appearing on the public portfolio homepage (`/`), and certificate/image previews were not rendered on the public training cards (`/training`).

### The Root Causes

1. **Homepage Filter Query Mismatch (`app/(public)/page.tsx`)**:
   - In `app/(public)/page.tsx`, the homepage section called `getTrainings({ featured: true, limit: 3 })`.
   - The published `CyberSecurity` record in Supabase had `featured = false` and `published = true`.
   - As a result, the Supabase query returned 0 rows matching `published = true AND featured = true`.
   
2. **Defective Fallback Logic in Data Layer (`lib/data.ts`)**:
   - In `lib/data.ts`, `getTrainings()` had the condition:
     ```ts
     const { data, error } = await query
     if (!error && Array.isArray(data) && data.length > 0) return data
     ```
   - Because `data.length === 0` (valid empty result for `featured=true`), the system mistakenly treated a successful query as a database failure and fell back to `FALLBACK_TRAININGS.filter(...)`.
   - This caused the homepage to render hardcoded mock data ("Full-Stack Web & Applied AI Systems Engineering", "Applied Machine Learning...") instead of real published records from the database.

3. **Decoupling of "Published" vs. "Featured"**:
   - The user specification dictates: **`published = true` determines public visibility**, while **`featured = true` optionally highlights/pins items**.
   - Public pages previously required `featured: true` to display records on the homepage. We decoupled these so all published records are queryable, with featured records sorted to the top.

4. **Missing Certificate / Media Rendering on Cards**:
   - Neither `TrainingClientView.tsx` (on `/training`) nor `TrainingSection.tsx` (on `/`) had any certificate or image component implemented on their cards. They only rendered text badges and metadata, completely ignoring `certificate_url` and `image_url`.
   - On `/training/[slug]`, the page attempted to load relative paths only from the `certificate` bucket, which broke if images were stored in other buckets (e.g. `projects`).

---

## 2. Shared Data Model & Supabase Database Verification

### Table Schema (`public.training`)
```sql
CREATE TABLE IF NOT EXISTS public.training (
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
```

### Row-Level Security (RLS) Policies
- **Public Read:** `CREATE POLICY "Public read published training" ON public.training FOR SELECT USING (published = TRUE);`
- **Admin CRUD:** Authenticated users (`auth.role() = 'authenticated'`) have full `SELECT`, `INSERT`, `UPDATE`, and `DELETE` access.

### Verified Database Record
Direct query via Supabase Anon client confirms the active record:
```json
{
  "id": "5835b002-87a6-4239-af22-5252f60a430f",
  "title": "CyberSecurity",
  "slug": "cybersecurity",
  "provider": "CipherSchools",
  "organization": "Lovely Professional University",
  "category": "Cybersecurity",
  "mode": "Online",
  "duration": "8 weeks",
  "start_date": "2026-06-10",
  "end_date": "2026-07-31",
  "certificate_url": "https://gmlgzuiuyhinxhjsbfkk.supabase.co/storage/v1/object/public/certificate/training/documents/1787738745844-dtnlui.png",
  "image_url": null,
  "credential_id": "CSW2026-18085",
  "skills": ["Network Security", "Ethical Hacking", "Cryptography", "Vulnerability Assessment"],
  "technologies": ["Wireshark", "Nmap", "Metasploit", "Burp Suite", "Linux"],
  "published": true,
  "featured": false,
  "display_order": 0
}
```

---

## 3. Storage & Asset URL Architecture

### Storage Buckets
1. **`certificate` (Public)**: Storing certificate documents (PDF/PNG/JPG/WEBP) uploaded via AI Analyzer or manual upload in `training/documents/`.
2. **`projects` (Public)**: Storing custom cover banners / thumbnails in `training/images/`.

### Verified Asset Accessibility
- **File:** `training/documents/1787738745844-dtnlui.png`
- **HTTP Status:** `200 OK`
- **Content-Type:** `image/png`
- **Content-Length:** `195,209 bytes`

### Asset Normalization Logic (`lib/supabase/storage.ts`)
We added the universal helper `getTrainingPublicAssetUrl(pathOrUrl?: string | null)`:
- Returns `null` for falsy/empty values.
- Retains existing full `http://`, `https://`, `blob:`, and `data:` URLs directly.
- Handles storage paths pointing to `projects/` or `training/images/` by resolving against the `projects` bucket.
- Defaults storage paths (e.g. `training/documents/...`) to the public `certificate` bucket.

---

## 4. Next.js Caching, ISR & Revalidation Pipeline

1. **Static Prerendering with Incremental Static Regeneration (ISR)**:
   - `/training`: `revalidate = 60` (1 minute).
   - `/training/[slug]`: `revalidate = 60` with `generateStaticParams()` dynamically mapping all slugs from Supabase.
   - `/`: `revalidate = 3600` (1 hour).
2. **On-Demand Cache Invalidation**:
   - In `app/api/admin/revalidate/route.ts`:
     - Calls `invalidateTrainingCache()` to purge in-memory cache.
     - Calls `revalidatePath('/training')`.
     - Calls `revalidatePath('/')`.
     - Calls `revalidatePath('/training/[slug]')`.
   - In `TrainingForm.tsx` & `app/admin/training/page.tsx`:
     - Mutations (insert, update, toggle publish, toggle featured, delete) automatically trigger `/api/admin/revalidate` with `type: 'training'`.

---

## 5. Summary of Code Modifications

### 1. `lib/supabase/storage.ts`
- Added `getTrainingPublicAssetUrl` helper to normalize training media assets across buckets and external URLs.

### 2. `lib/data.ts`
- Fixed `getTrainings()` fallback bug by replacing `if (!error && Array.isArray(data) && data.length > 0)` with `if (!error && Array.isArray(data))`.
- Updated training ordering: `.order('featured', { ascending: false }).order('display_order', { ascending: true }).order('start_date', { ascending: false })`.
- Fixed fallback checks across `getProjects`, `getAchievements`, `getEducation`, `getExperience`, `getSkills`.
- Updated `getPortfolioStats` to query real database counts for `training` and `co_curricular_activities`.

### 3. `components/training/TrainingMedia.tsx` (NEW)
- Created a robust, responsive media component for training cards supporting:
  - **Image Mode**: Certificate / thumbnail with smooth zoom hover, controlled aspect ratio (`16/10`), object containment, and `onError` fallback.
  - **PDF Mode**: Styled PDF document preview plaque with document icon, provider name, and verified seal.
  - **Aesthetic Plaque Fallback**: Digital credential seal when no media is attached or if an image fails to load (preventing card collapse).

### 4. `components/sections/TrainingSection.tsx`
- Integrated `<TrainingMedia>` into each homepage training card.
- Displays Category, Mode, Duration, Title, Provider, Skills, and direct link to curriculum.
- Fully responsive 3-column grid with smooth hover interactions.

### 5. `components/training/TrainingClientView.tsx`
- Added `<TrainingMedia>` preview column to each training card on `/training`.
- Modernized the responsive 2-column layout (stacks smoothly on mobile/tablet).
- Included 'Cybersecurity' in default categories and cleaned category count badges.

### 6. `app/(public)/page.tsx`
- Changed `getTrainings({ featured: true, limit: 3 })` to `getTrainings({ limit: 3 })`.
- Ensures any published training appears on the homepage, with featured items prioritized first.

### 7. `app/(public)/training/[slug]/page.tsx`
- Updated document viewer to use `getTrainingPublicAssetUrl(training.certificate_url || training.image_url)`.

---

## 6. Verification Results & Evidence

### A. TypeScript Type Check
```powershell
npx tsc --noEmit
# Exit Code: 0 (0 errors)
```

### B. ESLint
```powershell
npm run lint
# Exit Code: 0 (0 warnings / errors)
```

### C. Next.js Production Build
```powershell
npm run build
# Result: Successfully compiled 59 routes
# Route output includes:
#   ├ ○ /training                     1m
#   └   /training/[slug]
#     └ ● /training/cybersecurity     1m (SSG prerendered from Supabase)
# Exit Code: 0
```

### D. Supabase Query Verification
```powershell
node -e "..."
# Output:
# Error: null
# Count: 1
# Record: CyberSecurity at Lovely Professional University (Published: true, Featured: false)
```

---

## 7. Future-Proofing & Quality Checklist

- [x] **Zero Hardcoding**: No hardcoded IDs or titles in application code.
- [x] **No Frontend-Only Fallbacks**: All records flow directly through Supabase DB and Storage.
- [x] **Published vs Featured**: Any future training record marked `published = true` will automatically appear on `/training` and `/` (top 3, featured prioritized).
- [x] **Dual Asset Type Support**: Supports full URLs, relative paths, PNG/JPG/WEBP images, and PDF documents.
- [x] **Image Resilience**: `onError` handling ensures the card NEVER disappears or breaks if an external image fails to load.
- [x] **Instant Synchronization**: Admin CRUD operations trigger Next.js cache revalidation (`/api/admin/revalidate`), updating public pages in real time.
