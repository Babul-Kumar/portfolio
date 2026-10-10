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

### Redesigned Continuous Motion Narrative (~1.2s total duration)
1. **`0.00s – 0.08s` (`start`)**: Pure quiet dark obsidian canvas matching site theme (`#060709`).
2. **`0.08s – 0.42s` (`monogram`)**: Minimal **`BK /`** monogram mark fades in smoothly (`opacity: 0 -> 1`, `cubic-bezier(0.16, 1, 0.3, 1)`) with subtle terracotta slash (`#E45D2C`) and quiet ambient radial aura (`rgba(228, 93, 44, 0.08)`).
3. **`0.42s – 0.82s` (`identity`)**: Monogram seamlessly cross-fades into **`BABUL KUMAR`** with minute 3px rise, accompanied by **`AI • ML • FULL-STACK`** with cyan punctuation (`#14B8A6`). No scale jumping or subpixel text snapping.
4. **`0.82s – 1.20s` (`emerge`)**: The overlay veil lifts smoothly (`opacity: 1 -> 0`), dissolving the central overlay into the live homepage. The underlying hero grid (`.hero-grid`), ambient lighting, and 3D avatar on the right emerge naturally and settle into place (`opacity: 1`, `translate3d(0, 0, 0)`).
5. **`1.20s` (`complete`)**: Overlay unmounts completely from the DOM. Homepage is 100% interactive.

### Zero-Lag Motion Principles
* **No `scale()` on text**: Eliminates subpixel font rendering blurriness and glyph jitter.
* **No `filter: blur()`**: Avoids full-screen GPU re-rasterization bottlenecks.
* **Pure Opacity & Sub-6px Translation**: Uses only hardware-accelerated `translate3d(0, 0, 0)` with `will-change: opacity, transform`.
* **Coordinated Single Reveal**: Zero duplicate avatars or secondary canvases; the real hero environment simply emerges underneath.
* **Session Storage Replay Prevention**: `sessionStorage.getItem('bk_intro_seen')` skips intro on return visits; early inline script prevents dark flashes on reload.
* **Reduced Motion**: Immediately bypassed if `prefers-reduced-motion: reduce` is active.
* **User Skip**: Clicking anywhere or pressing `Escape`, `Enter`, or `Space` instantly skips the sequence.

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
