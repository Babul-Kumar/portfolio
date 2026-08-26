import { GoogleGenAI } from '@google/genai'
import type { GitHubProjectAnalysis } from '@/types'
import { FetchedRepositoryData } from '@/lib/github/fetcher'
import { ParsedGitHubUrl } from '@/lib/github/normalize'
import { githubProjectAnalysisSchema } from '@/lib/validations'
import { slugify } from '@/lib/utils'

const GITHUB_ANALYZER_SYSTEM_PROMPT = `
You are an expert Senior Full-Stack Engineer and Portfolio Content Strategist.
Analyze the provided GitHub repository metadata, dependency manifests, and README content, and extract structured project metadata for a professional developer portfolio.

CRITICAL ZERO-HALLUCINATION RULES:
1. FACTUAL EXTRACTION ONLY: Extract ONLY features, technologies, architecture, and facts that are explicitly mentioned or evidenced in the repository files, manifests, and README.
2. DO NOT HALLUCINATE: If a field (like problem statement, benchmark results, challenges, or live demo) is not mentioned in the repository, return null or empty string. NEVER invent statistics, user counts, or unmentioned technologies.
3. TITLE: Return a clean, human-readable Title Case project name (e.g. "Smart System Monitor" instead of "smart-system-monitor").
4. SLUG: Return a clean lowercase kebab-case slug matching the title (e.g. "smart-system-monitor").
5. SHORT DESCRIPTION: Write a concise 1-2 sentence executive elevator pitch highlighting the project's purpose and primary capability.
6. DESCRIPTION: Write a professional 2-3 paragraph technical overview covering the core workflow, design, and capabilities.
7. PROBLEM: Summarize the real-world problem or pain point this project solves (null if not specified).
8. SOLUTION: Summarize how the technical architecture/codebase solves the problem (null if not specified).
9. ARCHITECTURE: Describe the system architecture, component layers, or data flow if described in the README (null if not specified).
10. RESULTS: Extract any verifiable metrics, benchmarks, speedups, accuracy scores, or milestones stated in the repository (null if not specified).
11. CHALLENGES: Summarize key engineering challenges or tradeoffs mentioned (null if not specified).
12. CATEGORY: Classify the project into EXACTLY ONE of the following categories:
    - "AI & Machine Learning"
    - "Full-Stack Web"
    - "Systems & Infrastructure"
    - "Mobile Applications"
    - "Developer Tools"
    - "Cybersecurity"
    - "Data Science"
    - "Other"
13. TECHNOLOGIES: Extract an array of accurate, normalized technologies, languages, and frameworks actually used (e.g. ["Next.js", "TypeScript", "Tailwind CSS", "FastAPI", "PostgreSQL", "Docker"]).
14. FEATURES: Extract an array of 4-8 concise bullet points describing real features built into the application.
15. LIVE URL: Extract the live demo, deployment, or documentation URL if present in repository homepage or README. If no live URL is found, return null. NEVER invent URLs.
16. PREVIEW IMAGE: Select the best candidate screenshot URL from the provided candidate list if available, or null.

Return ONLY valid JSON matching this schema:
{
  "title": string,
  "slug": string,
  "short_desc": string,
  "description": string,
  "problem": string | null,
  "solution": string | null,
  "architecture": string | null,
  "results": string | null,
  "challenges": string | null,
  "category": string,
  "technologies": string[],
  "github_url": string,
  "live_url": string | null,
  "project_date": string | null,
  "features": string[],
  "preview_image_url": string | null
}
`

export async function analyzeRepositoryWithGemini(
  parsedUrl: ParsedGitHubUrl,
  repoData: FetchedRepositoryData
): Promise<GitHubProjectAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment (.env.local).')
  }

  const { metadata, sanitizedReadme, candidateImages, detectedDependencies, manifestSummary } =
    repoData

  // Assemble comprehensive context for AI
  const promptContext = `
GITHUB REPOSITORY CONTEXT:
- Canonical URL: ${parsedUrl.canonicalUrl}
- Repository Name: ${metadata.name}
- Full Name: ${metadata.full_name}
- Owner: ${metadata.owner}
- GitHub Description: ${metadata.description || 'None provided'}
- Primary Language: ${metadata.language || 'Unknown'}
- GitHub Topics: ${metadata.topics.join(', ') || 'None'}
- Repository Homepage / Live URL: ${metadata.homepage || 'None'}
- License: ${metadata.license || 'None'}
- Created Date: ${metadata.created_at || 'Unknown'}
- Updated Date: ${metadata.updated_at || 'Unknown'}
- Detected Dependencies: ${detectedDependencies.join(', ') || 'None'}
- Manifest Summary: ${manifestSummary || 'No manifest files found'}
- Candidate Screenshot Images: ${JSON.stringify(candidateImages.slice(0, 5))}

README.MD CONTENT:
${sanitizedReadme || '[No README.md content found in repository]'}
`

  const ai = new GoogleGenAI({ apiKey })

  let rawText = ''
  try {
    // Primary model: gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${GITHUB_ANALYZER_SYSTEM_PROMPT}\n\n${promptContext}` }],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    })
    rawText = response.text || ''
  } catch (primaryErr) {
    console.warn('Gemini 2.5 Flash failed, falling back to gemini-1.5-flash:', primaryErr)
    // Fallback model: gemini-1.5-flash
    const fallbackResponse = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${GITHUB_ANALYZER_SYSTEM_PROMPT}\n\n${promptContext}` }],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    })
    rawText = fallbackResponse.text || ''
  }

  if (!rawText) {
    throw new Error('Gemini AI returned an empty response during repository analysis.')
  }

  // Parse and validate structured JSON
  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(rawText)
  } catch {
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      parsedJson = JSON.parse(jsonMatch[1] || jsonMatch[0])
    } else {
      throw new Error('Failed to parse AI response as JSON.')
    }
  }

  const validated = githubProjectAnalysisSchema.parse(parsedJson)

  // Ensure fallback defaults if AI returned empty fields
  const finalTitle = validated.title || metadata.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const finalSlug = validated.slug || slugify(finalTitle)

  return {
    ...validated,
    title: finalTitle,
    slug: finalSlug,
    github_url: parsedUrl.canonicalUrl,
    live_url: validated.live_url || metadata.homepage || null,
    project_date:
      validated.project_date ||
      (metadata.created_at ? metadata.created_at.split('T')[0] : null),
    repo_metadata: metadata,
  }
}
