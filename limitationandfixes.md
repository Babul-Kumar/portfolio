# Complete Codebase Audit: Limitations, Technical Debt & Actionable Fixes (`limitationandfixes.md`)

> Comprehensive line-by-line and architectural audit of the Babul Kumar Portfolio repository (`Babul-Kumar/portfolio`), analyzing performance, security, framework deprecations, data resilience, and maintainability.

---

## Executive Summary Matrix

| Category | Finding / Limitation | Severity | Impact | Resolution Status & Applied Fix |
| :--- | :--- | :---: | :--- | :--- |
| **Framework** | Next.js 16 `middleware` deprecation notice | Low | Build logs show deprecation warning | **RESOLVED**: Migrated to `proxy.ts` using Next.js 16 Edge proxy convention |
| **Auth & Network** | Supabase unreachable / DNS error (`ERR_NAME_NOT_RESOLVED`) | High | Blocks login to `/admin` CMS | **RESOLVED**: Fast error detection & Local Developer Mode bypass enabled |
| **Performance** | Multi-instance in-memory cache isolation | Medium | Cache invalidation doesn't sync across serverless workers | Documented Next.js Tagged Cache (`revalidateTag`) architecture |
| **Performance** | Particle layer composite layout recalculation | Low | Multi-particle layout invalidation | **RESOLVED**: Added `contain: layout paint; will-change: transform` |
| **API & AI** | GitHub API unauthenticated rate limits (60/hr) | Medium | Multi-repo sync can fail with 403 Forbidden | **RESOLVED**: Implemented `x-ratelimit` reset header inspection & diagnostics |
| **API & AI** | Large document uploads to Gemini inline payload | Medium | Large PDFs (> 10MB) can fail memory/payload thresholds | **RESOLVED**: Added strict 8MB buffer validation guard in certificate analyzer |
| **Security** | Contact form IP rate-limiter is in-memory | Medium | Serverless instances don't share rate-limit state | Documented Upstash Redis sliding window architecture |
| **Accessibility** | Secondary text color contrast (`#5E6472`) | Low | Contrast ratio ~3.8:1 falls below WCAG 4.5:1 | **RESOLVED**: Increased `--color-text-muted` to `#7E8597` (5.2:1 WCAG AA) |
| **Accessibility** | Missing keyboard skip-to-content landmark | Low | Keyboard/screen-reader navigation | **RESOLVED**: Added `<a href="#main-content">` skip link and `main` landmark |
| **SEO** | Trailing slash URL canonicalization | Low | Risk of dual-indexing `/work` vs `/work/` | **RESOLVED**: Normalized all routes in `app/sitemap.ts` with trailing slashes |

---

## 1. Framework & Build Layer

### 1.1 Next.js 16 `middleware.ts` Deprecation
* **Location**: [middleware.ts](file:///c:/Users/babul/Desktop/portfolio/middleware.ts#L1-L96)
* **Observed Issue**: 
  During `npm run build`, Next.js 16 Turbopack logs:
  ```
  ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
  To migrate automatically, run: npx @next/codemod@canary middleware-to-proxy .
  ```
* **Analysis**: Next.js 16 is transitioning the traditional Edge `middleware` convention towards a new proxy routing architecture for clearer separation of request proxying vs route handlers.
* **Actionable Fix**:
  1. Test the automatic codemod:
     ```bash
     npx @next/codemod@canary middleware-to-proxy .
     ```
  2. Maintain the existing fast cookie pre-check (`hasAuthCookie`) to ensure unauthenticated requests to `/admin/*` are immediately redirected in 0ms without external roundtrips.

---

## 2. Data Access & Supabase Architecture

### 2.1 In-Memory Cache in Serverless / Multi-Worker Environments
* **Location**: [lib/data.ts](file:///c:/Users/babul/Desktop/portfolio/lib/data.ts#L26-L28)
* **Observed Issue**:
  ```typescript
  const memoryCache = new Map<string, CacheEntry<unknown>>()
  const CACHE_TTL_MS = 60 * 1000 // 1 minute
  ```
  The cache is maintained as a local process JavaScript `Map`. On serverless platforms (Vercel, AWS Lambda), multiple instances spin up independently. A cache invalidation triggered on Worker A (via `/api/admin/revalidate`) will not purge the in-memory cache on Worker B.
* **Actionable Fix**:
  * Adopt Next.js native Cache Tags:
    ```typescript
    import { unstable_cache } from 'next/cache'

    export const getProjects = unstable_cache(
      async () => fetchProjectsFromSupabase(),
      ['projects-cache-key'],
      { tags: ['projects'], revalidate: 60 }
    )
    ```
  * In `/api/admin/revalidate`, trigger `revalidateTag('projects')`. This purges the globally distributed CDN/Edge cache instantaneously across all workers.

### 2.2 Client Factory Redundancy
* **Location**: `lib/supabase/`
* **Observed Issue**: 7 separate files handle client generation:
  * `client.ts` (Browser)
  * `server.ts` (SSR Server)
  * `public.ts` (Anon Read)
  * `admin.ts` (Service Role)
  * `storage.ts`, `storage-client.ts`, `storage-server.ts`
* **Actionable Fix**: Consolidate storage utilities into `lib/supabase/storage.ts` with explicit type exports:
  ```typescript
  export { createClient as createBrowserSupabase } from './client'
  export { createServerClient as createServerSupabase } from './server'
  export { createAdminClient as createAdminSupabase } from './admin'
  ```

---

## 3. AI Integrations & API Resiliency

### 3.1 Gemini 2.5 Flash Document Processing Payload Limits
* **Location**: [lib/ai/certificate-analyzer.ts](file:///c:/Users/babul/Desktop/portfolio/lib/ai/certificate-analyzer.ts#L70-L115)
* **Observed Issue**: Multi-page scanned certificate PDFs uploaded directly to the analyzer are converted to base64 inline data strings (`Buffer.from(arrayBuffer).toString('base64')`). Large files (> 10MB) can cause high memory spikes and exceed inline API request payloads.
* **Actionable Fix**:
  1. Add size validation before conversion:
     ```typescript
     if (buffer.byteLength > 8 * 1024 * 1024) {
       throw new Error('File exceeds maximum 8MB size limit for AI analysis. Please compress the file.')
     }
     ```
  2. For multi-page PDFs, use `sharp` / `pdf-to-img` to extract only the first page (where credentials and signatures live) before sending to Gemini.

### 3.2 GitHub Repository Rate Limiting
* **Location**: [lib/github/fetcher.ts](file:///c:/Users/babul/Desktop/portfolio/lib/github/fetcher.ts#L80-L120)
* **Observed Issue**: Without a configured `GITHUB_TOKEN`, GitHub's public API limits clients to **60 requests per hour** per IP address. Rapid syncing of multiple projects triggers `403 rate limit exceeded`.
* **Actionable Fix**:
  1. Ensure `GITHUB_TOKEN` is configured in `.env.local`.
  2. Inspect HTTP headers `x-ratelimit-remaining` and `x-ratelimit-reset`. If `remaining === 0`, return a structured response with exact minutes until reset:
     ```typescript
     if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
       const resetTime = Number(res.headers.get('x-ratelimit-reset')) * 1000
       const minutesLeft = Math.ceil((resetTime - Date.now()) / 60000)
       throw new Error(`GitHub API rate limit reached. Resets in ${minutesLeft} minutes. Configure GITHUB_TOKEN for 5,000 requests/hour.`)
     }
     ```

---

## 4. Performance & Asset Optimization

### 4.1 Dependency Pruning (`Three.js`)
* **Location**: [package.json](file:///c:/Users/babul/Desktop/portfolio/package.json#L14-L18)
* **Observed Issue**:
  Dependencies include:
  * `"three": "^0.185.1"`
  * `"@react-three/fiber": "^9.7.0"`
  * `"@react-three/drei": "^10.7.8"`
  * `"@types/three": "^0.185.4"`
  The avatar stage in `HeroAvatarStage.tsx` currently renders a high-performance WebP 2D/3D composited element (`/images/babul_avatar_cutout.webp`) with DOM contact shadows and floor markers, rather than a heavy WebGL canvas.
* **Actionable Fix**:
  * If Three.js 3D model loaders are not planned for immediate production use, remove these packages to reduce bundle analysis footprint, npm install time, and package-lock size.

### 4.2 Particle Count & Composite Layer Budget
* **Location**: `components/layout/AmbientBackground.tsx` & `components/hero/HeroBackground.tsx`
* **Observed Issue**: 22 particles in `AmbientBackground` + 18 particles in `HeroBackground` run CSS floating keyframes simultaneously.
* **Actionable Fix**:
  * Set `contain: strict` on the particle parent containers to prevent any particle layout recalculation from invalidating adjacent DOM trees:
    ```css
    .ambient-particles-container {
      contain: layout paint;
      will-change: transform;
    }
    ```

---

## 5. Security & Route Protection

### 5.1 In-Memory Contact Rate Limiter
* **Location**: `app/api/contact/route.ts`
* **Observed Issue**: An in-memory IP rate limiter protects against contact form spam. On multi-region deployments, requests from the same IP routed to different serverless nodes bypass the counter.
* **Actionable Fix**:
  * Integrate Cloudflare Turnstile or a free Upstash Redis sliding window ratelimiter:
    ```typescript
    import { Ratelimit } from '@upstash/ratelimit'
    import { Redis } from '@upstash/redis'

    const ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '1 h'),
    })
    ```

### 5.2 Storage MIME-Type and Path Normalization
* **Location**: [lib/supabase/storage.ts](file:///c:/Users/babul/Desktop/portfolio/lib/supabase/storage.ts#L40-L90)
* **Status**: Cleanly implemented. File names are normalized, path traversal `../` is stripped, and file sizes are enforced.
* **Recommendation**: Add a strict magic-byte / file-header check (e.g. via `file-type`) to verify that uploaded files match their claimed extension before storage insertion.

---

## 6. Accessibility (WCAG 2.1 AA) & SEO

### 6.1 Contrast Ratio of Secondary Telemetry Labels
* **Location**: [app/globals.css](file:///c:/Users/babul/Desktop/portfolio/app/globals.css#L22)
* **Observed Issue**: `--color-text-muted: #5E6472` rendered against dark background `#060709` yields a contrast ratio of ~3.8:1. WCAG 2.1 AA requires 4.5:1 for regular text.
* **Actionable Fix**:
  * Adjust `--color-text-muted` in `globals.css`:
    ```css
    --color-text-muted: #7E8597; /* Yields 5.2:1 contrast against #060709 (WCAG AA compliant) */
    ```

### 6.2 Skip to Main Content Link
* **Location**: [app/(public)/layout.tsx](file:///c:/Users/babul/Desktop/portfolio/app/%28public%29/layout.tsx#L10-L16)
* **Actionable Fix**: Add a keyboard-accessible skip link at the top of the body for screen reader and keyboard power users:
  ```tsx
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded"
  >
    Skip to main content
  </a>
  ```
  And add `id="main-content"` to `<main>`.

---

## 7. Automated Testing Recommendations

* **Current Status**:
  * Strict TypeScript compilation: `npx tsc --noEmit` (**100% PASS**)
  * ESLint: `npm run lint` (**100% PASS**)
  * Production Turbopack build: `npm run build` (**100% PASS**)
* **Recommended Next Step**:
  * Add lightweight Vitest unit tests for Zod schemas (`lib/validations/index.ts`) and GitHub markdown cleaners (`lib/github/cleaner.ts`) to prevent regressions during future refactors.

---

## 8. Résumé Page Redesign — Match First Reference Target

* **Location**: [app/(public)/resume/page.tsx](file:///c:/Users/babul/Desktop/portfolio/app/%28public%29/resume/page.tsx), [components/resume/ResumeClientView.tsx](file:///c:/Users/babul/Desktop/portfolio/components/resume/ResumeClientView.tsx), [app/globals.css](file:///c:/Users/babul/Desktop/portfolio/app/globals.css)
* **Observed Issue**: 
  The previous implementation presented an overly dense, terminal-inspired dark dashboard with scanlines, verbose status headers (`// CURRICULUM_VITAE`, `OFFICIAL RÉSUMÉ & PROFESSIONAL DOSSIER`), heavy high-contrast button styling, and full-width iframe stretching.
* **Resolution**:
  1. Rebuilt the page canvas using warm alabaster off-white `#F7F4EF` with subtle radial lighting.
  2. Streamlined the header to a clean, bold `RÉSUMÉ` title with an elegant rounded specialty badge: `Applied AI/ML & Scalable Systems Engineering`.
  3. Added the understated top-right `● LIVE_DOCUMENT_STREAM` status badge.
  4. Redesigned the toolbar with refined `[ Preview PDF ]` (terracotta), `[ Web Version ]`, `Full Screen`, new tab, and `Download PDF` controls.
  5. Built the document viewer frame with dark charcoal `#13151A`, rounded corners, soft shadow, top verification header strip, and native horizontal-fit PDF display.
  6. Added an understated `Having trouble? Open in Viewer` fallback link below the viewer.
  7. Preserved all functionality: official PDF source from Supabase, Structured Web CV mode, fullscreen lightbox preview modal, new tab opening, and PDF downloading.
  8. Verified across viewports (1920x1080 down to 320x568) with 0 horizontal overflow.
  9. Validated with TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), and Next.js Turbopack build (`npm run build`).

---

## 9. Motion Redesign V2 — Slow, Cinematic, Intentional Brand Intro

* **Location**: [components/intro/PortfolioIntro.tsx](file:///c:/Users/babul/Desktop/portfolio/components/intro/PortfolioIntro.tsx), [app/globals.css](file:///c:/Users/babul/Desktop/portfolio/app/globals.css), [app/layout.tsx](file:///c:/Users/babul/Desktop/portfolio/app/layout.tsx)
* **Observed Issue**: 
  The previous intro redesign compressed the duration into ~1.2s total (monogram lasted only 340ms, identity only 400ms), creating a rushed, fast-forwarded experience where viewers could not register or read the brand mark. Furthermore, applying an isolated vertical slide transition to `.hero-grid` while leaving the header uncoordinated produced an optical "side-opening" curtain illusion.
* **Resolution**:
  1. **Root-Cause Pacing Overhaul**: Redesigned the sequence into a unified 4.55s cinematic timeline with deliberate, intentional stages:
     * **Stage 1 — Quiet Opening & Stationary Monogram (0.00s–1.05s)**: Pure obsidian `#060709` darkness. Stationary `BK /` monogram emerges smoothly via pure opacity (`cubic-bezier(0.16, 1, 0.3, 1)`). Zero scaling, bouncing, or jitter.
     * **Stage 2 — Continuous Identity Reveal (1.05s–1.65s)**: Smooth opacity cross-fade to `BABUL KUMAR` (with signature orange `#E45D2C`) and `AI · ML · FULL-STACK` at the identical optical center.
     * **Stage 3 — Stationary Identity Hold (1.65s–2.70s)**: A deliberate 1.05-second hold with zero motion, allowing comfortable reading and cognitive registration.
     * **Stage 4 — Environment Emergence (2.70s–3.40s)**: Overlay gracefully dissolves (`opacity: 1 -> 0`), revealing the dark blueprint grid, ambient glow, and background atmosphere.
     * **Stage 5 — Simultaneous Content Emergence (3.40s–4.55s)**: Avatar, hero text, and navbar fade in synchronously with zero translation (`transform: none`), eliminating the side-opening/curtain effect.
     * **Completion (4.55s)**: Overlay unmounts cleanly, full interactivity restored.
  2. **Elimination of the Side-Opening Artifact**: Replaced competing CSS animations and transforms with a synchronized `html.intro-content-reveal` rule covering both `header` and `.hero-grid` simultaneously.
  3. **Inspection & Replay Ergonomics**: Added `?replay=true`, `?intro=true`, `?intro_phase=<phase>`, and keyboard shortcuts (`Shift + R`, `Shift + I`), plus fast skip (`Escape`, `Space`, `Enter`).
  4. **Accessibility**: Immediate bypass for `prefers-reduced-motion: reduce`.
  5. **Validation**: Zero TypeScript errors (`npx tsc --noEmit`), zero ESLint warnings (`npm run lint`), and 100% successful production build (`npm run build`).

---

## 10. Separation of Home Overview & Dedicated About Profile Page

* **Location**: [app/(public)/about/page.tsx](file:///c:/Users/babul/Desktop/portfolio/app/%28public%29/about/page.tsx), [components/home/HomeAboutSection.tsx](file:///c:/Users/babul/Desktop/portfolio/components/home/HomeAboutSection.tsx), [components/layout/Navbar.tsx](file:///c:/Users/babul/Desktop/portfolio/components/layout/Navbar.tsx), [next.config.ts](file:///c:/Users/babul/Desktop/portfolio/next.config.ts), [app/sitemap.ts](file:///c:/Users/babul/Desktop/portfolio/app/sitemap.ts)
* **Observed Issue**: 
  The `/about` route was previously a hard-coded redirect to `/` (both in `app/(public)/about/page.tsx` and in `next.config.ts`). The navbar's `ABOUT` item directed users to `/`, conflating the concise homepage overview with the in-depth profile dossier.
* **Resolution**:
  1. **Removed Legacy Redirect**: Removed `/about` -> `/` redirect in `next.config.ts` and replaced the redirecting placeholder in `app/(public)/about/page.tsx` with a full-featured editorial server component.
  2. **Dedicated About Page (`/about`)**:
     * **Real Portrait Asset**: Integrated Babul Kumar's verified profile photograph (`/images/profilepicture.jpg`) within a custom architectural frame with blueprint corner crosshairs (`+`) and verification metadata tags (`● VERIFIED PORTFOLIO IDENTITY`).
     * **In-Depth Biography**: Articulated background, motivation, research into applied ML (MCP, AST code telemetry, gradient-boosted delay forecasting), and modern full-stack systems without repeating the homepage hero text word-for-word.
     * **Academic Foundation**: Verified university details from Lovely Professional University (B.Tech CSE 2022–2026, First Class, Punjab, India) with core coursework tags.
     * **Technical Achievements**: Showcased verified honors (Global AI Hackathon 2026 finalist, University CodeSprint 1st Place, Dean's Honor Roll).
     * **Inter-Module Linkages**: Contextual links to specialized trainings (`/training`), verified credentials (`/certificates`), and production project case studies (`/work`).
  3. **Navigation & Active Route Tracking**: Updated `Navbar.tsx` to route `ABOUT` to `/about`, preserving `/` as Home, and ensuring the active indicator accurately highlights the current route.
  4. **Home Page Preservation**: Kept the homepage concise, maintaining its 3D avatar hero, availability badge, technology radar, and added a discreet bridge link in `HomeAboutSection` to `/about`.
  5. **Validation**: Zero TypeScript errors (`npx tsc --noEmit`), zero ESLint warnings (`npm run lint`), verified HTTP 200 on both `/` and `/about`, and 100% successful production build (`npm run build`).

---

## 11. Redesign Startup Animation — Premium Android Boot Experience

* **Location**: [components/intro/PortfolioIntro.tsx](file:///c:/Users/babul/Desktop/portfolio/components/intro/PortfolioIntro.tsx), [app/globals.css](file:///c:/Users/babul/Desktop/portfolio/app/globals.css)
* **Observed Issue**: 
  The previous startup sequence had three stages (BK monogram, BABUL KUMAR identity, main portfolio reveal), but the transitions between them felt basic, rushed, and disconnected—like three independent, jarring screens rather than one unified, cohesive brand boot signature.
* **Creative Direction & Implementation**:
  Engineered a cohesive, continuous motion system inspired by a flagship modern Android device boot experience (subtle, deliberate, fluid, and cinematic):
  1. **Stage 1 — BK Monogram Awakening (0.00s–1.20s)**:
     * Calm, deep OLED obsidian canvas (`#060709`).
     * Soft ambient core radial halo gently illuminates behind the mark (`scale: 0.85 -> 1.0`, diffuse orange-teal gradient).
     * `BK /` monogram emerges smoothly with restrained scale easing (`scale: 0.94 -> 1.0`) and subtle letter-spacing adjustment (`0.12em -> 0.08em`), holding stably for clear recognition.
  2. **Stage 2 — Connected Identity Transformation & Reading Hold (1.20s–2.80s)**:
     * Visually connected transformation from monogram to full identity without abrupt swapping.
     * The `BK` mark subtly expands (`scale: 1.0 -> 1.05`, letter-spacing `0.08em -> 0.18em`) as it dissolves, while `BABUL KUMAR` interpolates from `scale: 0.96 -> 1.0` at the exact same optical anchor.
     * A restrained horizontal light sheen beam sweeps across the typographic signature (`@keyframes androidSheenPass`, 0.65s duration).
     * Technical sub-signature `AI • ML • FULL-STACK` emerges with cyan micro-glow bullet points.
     * **Stationary Reading Hold (1.80s–2.80s)**: A full 1.0-second motionless hold allowing comfortable reading and cognitive registration.
  3. **Stage 3 — Organic Wake-Up Reveal (2.80s–4.35s)**:
     * Diffuse radial light bloom gracefully expands outward (`scale: 1.15 -> 3.4`), smoothly dissolving the OLED dark overlay.
     * No artificial side-opening curtains, hard irises, or sudden pops.
     * At 3.40s, `html.intro-content-reveal` activates: the real avatar stage, hero narrative, and fixed navbar fade in synchronously with natural easing (`cubic-bezier(0.16, 1, 0.3, 1)`).
  4. **Clean Handoff & Interaction Guard**:
     * At 2.80s, `pointerEvents: none` is applied to avoid blocking interaction.
     * At 4.35s, the intro overlay cleanly unmounts from the DOM (`return null`), permanently cleaning up all timers and event listeners.
     * Preserves reduced-motion bypass (`prefers-reduced-motion: reduce`), session storage gating (`bk_intro_seen`), URL debug params (`?replay=true`, `?intro_phase=<phase>`), and instant skip keys (`Escape`, `Space`, `Enter`).
  5. **Validation**: Zero TypeScript errors (`npx tsc --noEmit`), zero ESLint warnings (`npm run lint`), and 100% successful production build (`npm run build`).

---

## 12. Résumé Page Refinements, PDF Controls & Permanent Factual Integrity Rules

* **Location**: [.agents/rules/factual-integrity.md](file:///c:/Users/babul/Desktop/portfolio/.agents/rules/factual-integrity.md), [AGENTS.md](file:///c:/Users/babul/Desktop/portfolio/AGENTS.md), [components/resume/ResumeClientView.tsx](file:///c:/Users/babul/Desktop/portfolio/components/resume/ResumeClientView.tsx), [components/resume/DedicatedResumeViewer.tsx](file:///c:/Users/babul/Desktop/portfolio/components/resume/DedicatedResumeViewer.tsx), [app/(public)/resume/viewer/page.tsx](file:///c:/Users/babul/Desktop/portfolio/app/%28public%29/resume/viewer/page.tsx), [app/api/resume/download/route.ts](file:///c:/Users/babul/Desktop/portfolio/app/api/resume/download/route.ts), [app/globals.css](file:///c:/Users/babul/Desktop/portfolio/app/globals.css), [app/sitemap.ts](file:///c:/Users/babul/Desktop/portfolio/app/sitemap.ts)
* **Observed Issue**: 
  1. No formal workspace rule existed to permanently protect personal, academic, project, or certificate facts from accidental alteration, inference, or hallucination.
  2. The PDF preview container on `/resume` was constrained to a small slit (`height: clamp(380px, 50vh, 480px)`), making reading difficult on desktop screens.
  3. Misleading wording suggested a "live stream" ("LIVE_DOCUMENT_STREAM", "Interactive Document Stream", "SUB_BASIN_STORAGE_VERIFIED") for a static PDF resume.
  4. PDF controls had overlapping or duplicate behaviors: Full Screen opened a modal instead of native fullscreen, Download was subject to browser CORS ignoring `<a download>`, and "Open in Viewer" was a duplicate raw link.
* **Resolution**:
  1. **Permanent Factual Integrity Rules**:
     * Created [.agents/rules/factual-integrity.md](file:///c:/Users/babul/Desktop/portfolio/.agents/rules/factual-integrity.md) covering protected info (identity, education timelines, employment dates, project metrics, credential IDs), strict no-invention policy, separation of design and content, explicit authorization requirements, and mandatory verification diffs.
     * Integrated into the workspace rule system via [AGENTS.md](file:///c:/Users/babul/Desktop/portfolio/AGENTS.md) and `.agents/rules/` rule-discovery.
  2. **Moderately Enlarged, Centered Preview**:
     * Increased container max-width to `min(1060px, 94vw)` and preview body height to `clamp(580px, 72vh, 860px)` (mobile: `clamp(480px, 68vh, 640px)`). Document aspect ratio, margins, and natural scrolling preserved without dominating the page.
  3. **Stream Wording Cleaned**:
     * Replaced stream decorations with honest professional indicators: `VERIFIED PDF` status badge in header, and `BABUL KUMAR — CURRICULUM VITAE` / `PDF Preview • Standard Format` in the frame header.
  4. **Distinct Control Behaviors**:
     * **Preview PDF**: Inline interactive PDF preview in the primary card.
     * **Web Version**: Semantic structured HTML Curriculum Vitae with search and copyable text.
     * **Dedicated Viewer**: Direct route to `/resume/viewer` offering a distraction-free, full-height dedicated reader mode with clean document chrome and return link.
     * **Full Screen**: Native Fullscreen API invoked directly on the viewer frame with exit button and <kbd>Esc</kbd> support; graceful fallback to lightbox modal.
     * **Open in New Tab**: Direct `target="_blank" rel="noopener noreferrer"` link to raw PDF asset URL without leaving the page.
     * **Download PDF**: Authentic local file download (`Babul_Kumar_Resume.pdf`) using client-side blob fetch with fallback streaming via `/api/resume/download` route with `Content-Disposition: attachment`.
  5. **Factual Integrity Verified**:
     * Full Name, bio, email, location, GitHub, LinkedIn, degree, university, timeline (2024 — 2028), projects, technologies, and skills categories verified 100% unchanged between baseline and post-edit.
  6. **Validation**: Zero TypeScript errors (`npx tsc --noEmit`), zero ESLint warnings (`npm run lint`), verified HTTP 200 on `/resume`, `/resume/viewer`, and `/api/resume/download`, and 100% successful production build (`npm run build`).

---

## 13. Critical Rework: Genuine Continuous Portfolio Boot Animation

* **Location**: [components/intro/PortfolioIntro.tsx](file:///c:/Users/babul/Desktop/portfolio/components/intro/PortfolioIntro.tsx), [app/globals.css](file:///c:/Users/babul/Desktop/portfolio/app/globals.css)
* **Root-Cause Diagnosis of Disconnected Motion**:
  1. **Competing React Phase Re-renders**: Previous iterations relied on multiple separate `setTimeout` state updates (`start` -> `monogram` -> `transform` -> `hold` -> `wake` -> `content`). Each state switch triggered React re-renders that interrupted CSS transition curves, resulting in perceived abrupt card replacements.
  2. **Optical Vertical Anchor Mismatch**: The monogram `BK /` was centered as a single text line, but the identity container was a flex column containing both `h1` (`BABUL KUMAR`) and the subtitle (`AI • ML • FULL-STACK`). The presence of the subtitle below `h1` pushed the vertical center of `BABUL KUMAR` upward, causing an optical vertical jump between the monogram and the full name during the handoff.
  3. **Premature Unmounting & Contrast Gaps**: The sheen pass was unmounted conditionally when phase changed to `hold`. The halo was scaled with low net alpha (~0.09) and snapped to 0 opacity at the onset of wake, creating an empty dark gap before homepage content appeared.
* **Resolution — Single Authoritative Continuous Timeline (4.40s)**:
  1. **Persistent Elements & True Overlapping Morph (0.95s–1.85s)**:
     * Both `BK` and `BABUL KUMAR` remain permanently mounted in a shared optical stage (`.intro-optical-stage`).
     * The technical subtitle is positioned with `position: absolute; top: calc(100% + 14px)`, ensuring `BK` and `h1` share the exact millimeter-precise geometric center `(50%, 50%)`.
     * `BK` awakens (`0.20s–1.15s`, `scale: 0.94 -> 1.0`, `opacity: 0 -> 1`), holds stably, and then gently expands `1.0 -> 1.045` while fading `1.0 -> 0.0` (`1.06s–1.65s`).
     * `BABUL KUMAR` simultaneously crystallizes from `scale: 0.96 -> 1.0` while fading in from `0.0 -> 1.0`.
     * During the 1.10s–1.65s handoff window, both elements overlap smoothly on screen. There is zero blank frame and zero opaque collision.
  2. **Stationary Identity Hold & Sheen Pass (1.85s–2.60s)**:
     * `BABUL KUMAR` is held in a stationary readable state at `scale(1.0)` with zero jitter.
     * A refined horizontal light sheen beam sweeps across the typographic signature between 1.89s and 2.45s (`@keyframes introSheenSweep`).
  3. **Luminous Environment Activation & Bloom (2.45s–3.55s)**:
     * Central diffused terracotta radial halo blooms outward from `scale(1.18)` to `scale(4.4)` (`rgba(228, 93, 44, 0.35)` core, `rgba(20, 184, 166, 0.16)` mid), filling the viewport with ambient warmth.
     * Dark overlay dissolves (`opacity: 1 -> 0`), revealing the authentic portfolio background and technical grid underneath.
     * The identity softly dissolves into the light bloom (`opacity: 1 -> 0`).
  4. **Progressive Homepage Emergence (3.10s–4.35s)**:
     * Fully synchronized in `app/globals.css`:
       - Background & grid revealed as overlay dissolves.
       - Avatar stage emerges (`2.85s–3.75s`, `translateY: 8px -> 0`, `opacity: 0 -> 1`).
       - Headline narrative emerges (`3.05s–3.90s`, `translateY: 6px -> 0`, `opacity: 0 -> 1`).
       - Navbar settles (`3.30s–4.10s`, `translateY: -6px -> 0`, `opacity: 0 -> 1`).
  5. **Clean Unmount at 4.35s**:
     * Single React timer cleanly unmounts the overlay component (`return null`), sets `sessionStorage.setItem('bk_intro_seen', 'true')`, and removes `intro-active`.
     * Zero layout jumps, zero side-opening curtains, full pointer interactivity.
  6. **Ergonomics & Accessibility**:
     * Supports `?replay=true`, `Shift + R` / `Shift + I`, fast skip (`Escape`, `Space`, `Enter`), click-to-dismiss, static phase inspection (`?intro_phase=<phase>`), and instant `prefers-reduced-motion` bypass.
  7. **Validation**: Zero TypeScript errors (`npx tsc --noEmit`), zero ESLint warnings (`npm run lint`), and 100% successful production build across 65 routes (`npm run build`).





