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

### Premium Android Boot Experience Motion Sequence (~4.35s total duration)
1. **`0.00s – 0.15s` (`start`)**: Calm, deep OLED obsidian dark canvas matching site theme (`#060709`).
2. **`0.15s – 1.20s` (`monogram`)**: **`BK /`** monogram mark gently awakens at center with soft backlight radial halo (`scale: 0.85 -> 1.0`), controlled scale easing (`scale: 0.94 -> 1.0`), and letter-spacing settling (`0.12em -> 0.08em`). Holds stably for clear visual recognition.
3. **`1.20s – 1.80s` (`transform`)**: Visually connected morph from `BK` into **`BABUL KUMAR`**. The monogram expands outward (`scale: 1.0 -> 1.05`, spacing `0.08em -> 0.18em`) as it dissolves, while `BABUL KUMAR` interpolates from `scale: 0.96 -> 1.0` at the exact same anchor with an authentic horizontal light sheen pass (`@keyframes androidSheenPass`, 0.65s). Technical sub-signature `AI • ML • FULL-STACK` emerges with cyan micro-glow accents.
4. **`1.80s – 2.80s` (`hold`)**: Deliberate, motionless 1.0-second reading hold. Complete typographical clarity and comfortable cognitive perception.
5. **`2.80s – 3.40s` (`wake`)**: Android wake-up activation: diffuse radial halo blooms and expands outward (`scale: 1.15 -> 3.4`), dissolving the dark canvas overlay (`transition: opacity 1.05s`) to illuminate the portfolio environment underneath.
6. **`3.40s – 4.35s` (`content`)**: `html.intro-content-reveal` activates. The real avatar, hero narrative, and fixed navbar resolve into resting view simultaneously via natural easing (`cubic-bezier(0.16, 1, 0.3, 1)`). Zero side curtains, zero abrupt jumps.
7. **`4.35s` (`complete`)**: Overlay unmounts completely from the DOM (`return null`). Full interactivity restored.

### Premium Boot Motion Principles
* **Connected Morphological Continuity**: Monogram doesn't vanish into a blank slate; it expands outward into the full identity at the exact same optical anchor.
* **Controlled Light Sheen**: A single restrained horizontal light beam (`androidSheenPass`) sweeps across the name during transformation, mimicking premium flagship hardware wakeups without cheesy neon glows.
* **Expanding Diffuse Radial Bloom**: Avoids cartoonish hard circle iris clips. Instead, a diffuse ambient radial halo scales outward (`scale 3.4`) while dissolving the dark overlay.
* **Unified Scene Emergence**: Navbar (`header`) and `.hero-grid` transition synchronously under `html.intro-content-reveal`, completely eliminating the optical illusion of side panels or curtains opening outward.
* **Pure Opacity Transitions**: Uses pure GPU-composited opacity with zero `clip-path`, `scaleX`, or width animations.
* **Coordinated Single Reveal**: Zero duplicate avatars or secondary canvases; the real hero environment simply emerges underneath.
* **Session Storage & Replay Testing**: `sessionStorage.getItem('bk_intro_seen')` prevents re-triggering for returning users. Testing overrides via URL parameters (`?replay=true`, `?intro=true`, `?intro_phase=<phase>`) or keyboard shortcuts (`Shift + R`, `Shift + I`).
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

