# Babul Kumar Portfolio & CMS Platform — System Memory (`memory.md`)

> **Single Source of Truth** for the architecture, data structures, AI pipelines, motion design, and technical decisions of the Babul Kumar portfolio application.

---

## 1. System Identity & Technical Overview

* **Developer & Owner**: Babul Kumar (AI / ML & Full-Stack Software Engineer)
* **Education**: Computer Science & Engineering, Lovely Professional University (2022 – 2026)
* **Framework**: Next.js 16.3.1 (App Router, Turbopack, React 19.2.8)
* **Language & Typing**: TypeScript 5.x (Strict mode, zero compilation warnings)
* **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`), Curated CSS Design Token System (`globals.css`)
* **Motion & Animation**: GPU-accelerated CSS transforms (`translate3d`), Framer Motion 13.1.0, micro-particle engine
* **Database & BaaS**: Supabase PostgreSQL, Row Level Security (RLS), Supabase Storage, `@supabase/ssr`
* **AI & Intelligence Engine**: Google Gemini API via official `@google/genai` SDK (`gemini-2.5-flash` model)
* **Form & Validation**: React Hook Form 7.85, Zod 4.4, `@hookform/resolvers`
* **Icons & Notifications**: Lucide React 1.31.0, Sonner 2.0.8

---

## 2. Directory Architecture & Module Map

```
portfolio/
├── app/
│   ├── (public)/                      # Public-facing portfolio pages
│   │   ├── page.tsx                   # Main homepage (Intro, Hero, About, TechStack, Radar)
│   │   ├── layout.tsx                 # Public layout (Navbar, AmbientBackground, PageTransition, Footer)
│   │   ├── work/ & projects/          # Featured engineering projects & case studies
│   │   ├── training/                  # Industry trainings, bootcamps, and specialized courses
│   │   ├── certificates/              # Verified credentials with AI-powered data extraction
│   │   ├── co-curricular/             # Hackathons, technical leadership, and conclaves
│   │   ├── about/, education/, experience/, contact/, resume/
│   ├── admin/                         # Secured content management suite
│   │   ├── dashboard/                 # Metrics, quick actions, analytics overview
│   │   ├── projects/, certificates/, training/, co-curricular/, profile/, skills/, settings/
│   │   ├── login/                     # Secure admin authentication gateway
│   ├── api/                           # Route handlers
│   │   ├── admin/ai/                  # Gemini certificate & training analyzer
│   │   ├── admin/projects/analyze-github/ # Automated GitHub repo scraper & draft generator
│   │   ├── admin/sync/                # Bi-directional DB synchronization & integrity verification
│   │   ├── admin/upload/              # Secure file uploads to Supabase storage
│   │   └── contact/                   # Contact form endpoint with in-memory IP rate limiting
│   ├── globals.css                    # Design tokens, typography, dark/light themes, animations
│   ├── layout.tsx                     # Root layout, theme early script, security headers
│   ├── sitemap.ts & robots.ts         # Automated SEO XML generation
├── components/
│   ├── intro/PortfolioIntro.tsx       # Apple-inspired brand signature intro (0-lag, 3.8s calm flow)
│   ├── hero/                          # Hero visual stage, 3D avatar container, blueprint grid, particles
│   ├── sections/Hero.tsx              # Hero 2-column layout (Left: Narrative/CTAs, Right: Avatar stage)
│   ├── home/                          # HomeAboutSection, HomeTechStackSection, HomeModuleRadarSection
│   ├── layout/                        # Navbar, Footer, AmbientBackground, PageTransition
│   ├── admin/                         # Form builders, table views, AI modal analyzers, upload zones
│   └── ui/                            # Buttons, badges, modal primitives, card containers
├── lib/
│   ├── ai/                            # Gemini 2.5 Flash OCR & schema extraction logic
│   ├── github/                        # GitHub API fetcher, README cleaner, language normalizer, cache
│   ├── supabase/                      # Public, server, admin, and storage client factories
│   ├── data.ts                        # Central data access layer, in-memory cache (TTL: 60s), fallbacks
│   └── validations/                   # Strict Zod schemas for all database entities
├── public/                            # Static assets, avatar cutout (`/images/babul_avatar_cutout.webp`)
├── supabase/migrations/               # 7 SQL migrations (PostgreSQL schemas, RLS, seeds, storage)
├── types/index.ts                     # Strict TypeScript interfaces matching PostgreSQL schema
├── middleware.ts                      # Route protection for `/admin/*` via cookie pre-check & Supabase auth
└── next.config.ts                     # Remote patterns, security headers, redirects, static export flags
```

---

## 3. Database Schema & RLS Architecture

The database is built on Supabase PostgreSQL with **Row Level Security (RLS)** strictly enforced on every table. Public access is granted strictly to published records, while all write mutations require authenticated admin sessions:

| Table | Purpose | Public Policy | Admin Policy |
| :--- | :--- | :--- | :--- |
| `profiles` | Developer identity, bio, contact, social links | `SELECT (true)` | `ALL (auth.uid() = id)` |
| `projects` | Software engineering projects & architectures | `SELECT (published = true)` | `ALL (authenticated)` |
| `project_images` | Gallery screenshots and architecture diagrams | `SELECT (true)` | `ALL (authenticated)` |
| `certificates` | Licenses, cloud certifications, credentials | `SELECT (published = true)` | `ALL (authenticated)` |
| `trainings` | Structured apprenticeships, internships, courses | `SELECT (published = true)` | `ALL (authenticated)` |
| `co_curricular_activities` | Hackathons, code sprints, leadership roles | `SELECT (published = true)` | `ALL (authenticated)` |
| `achievements` | Honors, awards, hackathon podium placements | `SELECT (published = true)` | `ALL (authenticated)` |
| `education` | University degrees, CGPA, graduation years | `SELECT (published = true)` | `ALL (authenticated)` |
| `experience` | Industry employment and technical internships | `SELECT (published = true)` | `ALL (authenticated)` |
| `skills` | Grouped technical competencies (AI/ML, Web, Cloud) | `SELECT (true)` | `ALL (authenticated)` |
| `contact_messages` | Inbound inquiries submitted through `/contact` | `INSERT (true)` | `SELECT, DELETE (authenticated)` |

### Storage Buckets
* **`certificate`**: Canonical public bucket storing certificates, training verification documents, and project media.
* Legacy aliases (`certificates`, `training`, `projects`) are automatically rewritten by `normalizeBucketName()` in `lib/supabase/storage.ts` to route to `certificate`.

---

## 4. Resilient Caching & Offline Fallback Architecture

Located in `lib/data.ts`:
1. **In-Memory Cache (`Map<string, CacheEntry<T>>`)**:
   * Global TTL: **60 seconds**.
   * Instant microsecond resolution for warm queries, avoiding redundant Supabase network roundtrips.
2. **Network Timeout Guard (`QUERY_TIMEOUT_MS = 6000`)**:
   * Every database call is raced against a 6-second timeout promise.
3. **Deterministic Typed Fallback Datasets**:
   * If the Supabase instance is unreachable, unconfigured, or offline, the application seamlessly returns full, production-grade typed mock records for every entity.
   * Enables Next.js static site generation (`npm run build`) and local offline development to succeed without active cloud credentials.

---

## 5. AI Ingestion & Automated Developer Workflows

### Gemini Multimodal Certificate & Document Analyzer (`lib/ai/certificate-analyzer.ts`)
* Uses `@google/genai` with model `gemini-2.5-flash`.
* Supports PDF, PNG, JPEG, and WebP credential documents.
* Automatically extracts structured metadata with per-field confidence scoring (0.0 to 1.0):
  * `title`, `issuer` / `organization`, `category`, `issue_date`, `expiry_date`, `credential_id`, `verification_url`, `skills`, `technologies`, `description`.
* Validates untrusted AI JSON output through strict Zod schemas before returning to the admin UI.

### GitHub Repository Ingestion & Markdown AST Parser (`lib/ai/github-analyzer.ts` & `lib/github/*`)
* Parses GitHub repo URLs, queries repository metadata via GitHub REST API.
* Fetches raw `README.md`, cleans markdown formatting, badges, and image links.
* Automatically identifies primary technology stack, architecture highlights, and generates drafted project records.

---

## 6. Opening Sequence & Motion Engineering (`PortfolioIntro.tsx`)

A personal brand opening sequence communicating:
> *"Welcome to Babul Kumar's AI / ML / Full-Stack portfolio."*

### Continuous Boot Experience Motion Choreography (4.40s Master Timeline)
1. **`0.00s – 0.20s` (Dark Stillness)**: Calm, deep OLED obsidian dark canvas matching site theme (`#060709`). Zero initial flash or layout jitter.
2. **`0.20s – 1.15s` (BK Mark Awakening)**: **`BK /`** awakens at the shared optical center with diffuse terracotta radial halo (`rgba(228, 93, 44, 0.35)` core, `rgba(20, 184, 166, 0.16)` mid), settling smoothly (`scale: 0.94 -> 1.0`, `opacity: 0 -> 1`), and holds stably for clear cognitive recognition.
3. **`0.95s – 1.85s` (True Overlapping Morph)**: Connected transformation between persistent elements. `BK` gently expands (`scale: 1.0 -> 1.045`) as its opacity decreases (`1.0 -> 0.0`), while **`BABUL KUMAR`** simultaneously crystallizes (`scale: 0.96 -> 1.0`, `opacity: 0 -> 1`) at the exact same geometric anchor. Subtitle is positioned absolutely (`top: calc(100% + 14px)`) to eliminate any vertical center drift. Continuous overlap ensures zero empty frame and zero opaque collision.
4. **`1.85s – 2.60s` (Stationary Reading Hold & Sheen Pass)**: Motionless reading hold on `BABUL KUMAR`. An authentic horizontal light sheen beam sweeps across the typographic signature between 1.89s and 2.45s (`introSheenSweep`).
5. **`2.45s – 3.55s` (Radial Halo Bloom & Overlay Dissolution)**: Central radial halo blooms outward from `scale: 1.18` to `scale: 4.4`, lighting up the viewport. The dark overlay dissolves (`opacity: 1 -> 0`), revealing the authentic portfolio background and technical grid underneath. The identity softly dissolves into the light bloom.
6. **`3.10s – 4.35s` (Progressive Content Emergence)**: The real avatar stage (`2.85s–3.75s`), hero narrative (`3.05s–3.90s`), and fixed navbar (`3.30s–4.10s`) emerge progressively and settle in unison with natural easing. Zero side curtains, zero abrupt jumps.
7. **`4.35s` (Clean Completion)**: Overlay cleanly unmounts from the DOM (`return null`). Full interactivity restored.

### Motion Engineering Architecture
* **Single Master CSS Timeline**: All layers run on the compositor via synchronized `@keyframes` over a shared 4.40s duration, completely eliminating React timer drift and re-render interruptions.
* **Millimeter-Precise Optical Anchor**: Monogram and full name share the exact same `(50%, 50%)` anchor in `.intro-optical-stage`.
* **Persistent Overlapping Elements**: Elements stay mounted during the cross-transition, smoothly blending opacities.
* **Controlled Light Sheen & Diffuse Bloom**: High-contrast reflection sweep on stationary text; diffuse halo expansion (`scale 4.4`) without hard circle clipping.
* **Progressive Homepage Revealing**: Background grid, avatar stage, and narrative emerge through the dissolving overlay.
* **Session Storage & Replay Testing**: `sessionStorage.getItem('bk_intro_seen')` prevents re-triggering. Testing overrides via URL parameters (`?replay=true`, `?intro=true`, `?intro_phase=<phase>`) or keyboard shortcuts (`Shift + R`, `Shift + I`).
* **Instant User Skip**: Pressing `Escape`, `Space`, or `Enter`, or clicking anywhere immediately skips the intro.
* **Reduced Motion Compliance**: Immediately bypassed if `prefers-reduced-motion: reduce` is detected.

---

## 7. Design System & Visual Palette

* **Dark Theme (Default)**:
  * Background: `#060709` (`--color-bg`)
  * Surface Layers: `#10131A`, `#151922`, `#1E2330`
  * Text Primary: `#F5F6F8` (`--color-text`)
  * Text Secondary: `#9499A6` (`--color-text-secondary`)
  * Accent Primary: `#E45D2C` (Burnt Terracotta Orange)
  * Accent Teals: `#14B8A6`, `#38BDF8` (Cyber Teal & Ambient Cyan)
* **Light Theme (Swiss Architectural Paper)**:
  * Background: `#F7F5F0` (Alabaster architectural paper)
  * Text: `#141312` (Carbon black)
  * Accent: `#D45024` (Swiss burnt terracotta)
* **Typography**:
  * Display: `DM Serif Display`, Georgia, serif
  * Sans-serif: `Geist`, -apple-system, sans-serif
  * Monospace: `Geist Mono`, Consolas, monospace
* **3D Avatar Asset**:
  * Located at `/public/images/babul_avatar_cutout.webp`.
  * Preserved 37px top headroom clearance and precise contact shadows.
  * Single DOM instance rendered inside `HeroAvatarStage.tsx` (no duplicate 3D trees).

---

## 8. Separation of Home Overview & Dedicated About Page

* **Homepage (`/`)**:
  * Focuses on a concise, high-density, visually engaging professional overview.
  * Features the Apple-inspired brand intro sequence, interactive hero with 3D avatar stage, availability indicator, core focus tags, brief origin overview (`HomeAboutSection`), 12-technology radar, and exploration links.
* **Dedicated About Page (`/about`)**:
  * Distinct editorial profile dossier displaying Babul Kumar's real profile photograph (`/images/profilepicture.jpg`) in a refined architectural frame.
  * In-depth biography covering his background, engineering drive, applied AI/ML systems (MCP, AST telemetry, tabular predictive modeling), and full-stack architecture.
  * Structured academic foundation from Lovely Professional University (B.Tech CSE, 2022 – 2026, First Class).
  * Direct linkages to verified honors (Global AI Hackathon 2026 finalist, University CodeSprint 1st Place, Dean's Honor Roll), specialized trainings (`/training`), and representative projects (`/work`).
* **Routing & Navigation**:
  * Removed legacy redirect in `next.config.ts`.
  * Navbar `ABOUT` item now navigates directly to `/about` on both desktop and mobile, with accurate active state tracking.
  * Logo returns visitors to `/`.

---

## 9. Permanent Factual Integrity Architecture (`.agents/rules/factual-integrity.md`)

* **Rule Authority**: Established in `.agents/rules/factual-integrity.md` and registered via root `AGENTS.md`. Operates in tandem with `.agents/rules/ponytail.md`.
* **Protected Scope**: Full name, degrees, institutions, GPA/grades, graduation dates, employment/internship timelines, project metrics/technologies, certificate dates/issuers/IDs, awards, and biographical facts.
* **Strict Invariants**:
  1. **Strict No-Invention**: Zero hallucinated, estimated, or inferred factual values.
  2. **Separation of Design and Content**: UI/UX, CSS styling, responsiveness, or refactoring tasks never authorize modifying factual content.
  3. **Explicit Authorization**: Factual edits require explicit user direction for that specific datum.
  4. **Pre- & Post-Edit Diff Validation**: Verification diffs must be performed and reported.

---

## 10. Résumé Page & Document Control System (`/resume` & `/resume/viewer`)

* **Enlarged Preview**: Container widened to `min(1060px, 94vw)` and preview body heightened to `clamp(580px, 72vh, 860px)` (mobile: `clamp(480px, 68vh, 640px)`). Balanced centering, aspect ratio, and surrounding whitespace preserved.
* **Stream-Themed Wording Cleaned**: Removed misleading decorative phrases (`LIVE_DOCUMENT_STREAM`, `Interactive Document Stream`, `SUB_BASIN_STORAGE_VERIFIED`), replaced by professional indicators (`VERIFIED PDF`, `Babul Kumar — Curriculum Vitae (PDF)`).
* **Distinct Differentiated Controls**:
  1. `[ Preview PDF ]`: Toggles inline PDF preview inside the card.
  2. `[ Web Version ]`: Toggles structured semantic HTML Curriculum Vitae.
  3. `[ Dedicated Viewer ]`: Direct route to `/resume/viewer` offering distraction-free, full-height reader mode with clean document chrome.
  4. `[ Full Screen ]`: Native HTML5 Fullscreen API invoked directly on the viewer frame with exit button and <kbd>Esc</kbd> support; graceful fallback to lightbox modal.
  5. `[ Open in New Tab ]`: Raw PDF link with `target="_blank" rel="noopener noreferrer"`.
  6. `[ Download PDF ]`: Authentic local file download (`Babul_Kumar_Resume.pdf`) via client-side blob fetch and direct streaming fallback endpoint (`/api/resume/download` with `Content-Disposition: attachment`).

