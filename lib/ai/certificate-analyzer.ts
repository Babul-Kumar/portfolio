import { GoogleGenAI } from '@google/genai'
import type {
  CertificateAnalysisType,
  GeminiTrainingExtraction,
  GeminiCoCurricularExtraction,
  GeminiCertificateExtraction,
  AnyDocumentExtraction,
} from '@/types'
import {
  geminiTrainingExtractionSchema,
  geminiCoCurricularExtractionSchema,
  geminiCertificateExtractionSchema,
} from '@/lib/validations'
import { sanitizeDateForDb } from '@/lib/utils'

const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const FALLBACK_MODEL = 'gemini-1.5-flash'

// ============================================================
// SYSTEM PROMPTS
// ============================================================

const TRAINING_SYSTEM_PROMPT = `
You are an expert AI certificate and document parsing engine specializing in Technical Training, Industrial Internships, Bootcamps, and Professional Courses.
Analyze the provided document (image or PDF) and extract factual structured training metadata into JSON format.

CRITICAL ZERO-HALLUCINATION RULES:
1. FACTUAL EXTRACTION ONLY: Extract ONLY information explicitly visible or evidenced in the document text, logos, or seals.
2. DO NOT HALLUCINATE: If a field is not stated, return null (or [] for arrays). Never fabricate dates, credential IDs, hours, or technologies.
3. TITLE: Extract the official course, training, or workshop title.
4. PROVIDER: The platform, academy, or company that conducted/issued the training (e.g. "Coursera", "Tech Veda", "DeepLearning.AI", "Stanford Online", "Google", "AWS", "Coding Blocks").
5. ORGANIZATION: The parent institution, university, or industry partner (e.g. "Lovely Professional University", "Ministry of Skill Development") if different from provider.
6. CATEGORY: Classify into EXACTLY ONE of the following allowed categories:
   - "AI / ML"
   - "Full Stack"
   - "Web Development"
   - "Data Science"
   - "Cloud & DevOps"
   - "Cybersecurity"
   - "Industrial Training"
   - "Workshop"
   - "Bootcamp"
   - "Other"
   (If uncertain, choose "Other").
7. DATES:
   - start_date: Starting date in strict YYYY-MM-DD format (e.g. "2025-01-01" if only year is visible, or "2025-04-25"). Do NOT return just a year like "2025". Return null if not visible.
   - end_date: Completion / issue date in strict YYYY-MM-DD format (e.g. "2025-04-26"). Return null if not visible.
   If only one completion/issue date is present on the certificate, set start_date or end_date to that date.
8. DURATION: Explicitly stated duration (e.g. "8 Weeks", "40 Hours", "6 Months", "15+ Hours"). If not mentioned, return null. Do NOT calculate or guess.
9. LOCATION: Venue, city, or campus if explicitly mentioned (null otherwise).
10. MODE: Classify into "Online", "Offline", or "Hybrid" if indicated or discernible. Default to "Online" if it is an online platform.
11. SKILLS: Extract an array of relevant demonstrated skills mentioned in the curriculum or certificate text (e.g. ["Supervised Learning", "Deep Learning", "REST APIs"]). Return [] if none.
12. TECHNOLOGIES: Extract an array of languages, frameworks, or tools explicitly mentioned (e.g. ["Python", "TensorFlow", "React", "PostgreSQL", "Docker"]).
13. CREDENTIAL ID: Extract the exact certificate/serial number/ID if visible (null if absent).
14. CREDENTIAL URL: Extract the verification link or URL printed on the certificate (null if absent).
15. DESCRIPTION: Write a concise, professional 1-2 sentence summary of what was learned and built based strictly on the certificate text.
16. RECIPIENT NAME: Extract the student/recipient's full name printed on the certificate.
17. WARNINGS: If the document is blurry, cropped, has unreadable text, or has conflicting information, return a list of short warning strings. Return [] if clear.
18. CONFIDENCE: Return confidence scores (0.0 to 1.0) for each extracted field based on text clarity and certainty.

Return ONLY valid JSON matching this exact structure:
{
  "title": string,
  "provider": string | null,
  "organization": string | null,
  "category": string,
  "description": string | null,
  "start_date": string | null,
  "end_date": string | null,
  "duration": string | null,
  "location": string | null,
  "mode": "Online" | "Offline" | "Hybrid",
  "skills": string[],
  "technologies": string[],
  "credential_id": string | null,
  "credential_url": string | null,
  "recipient_name": string | null,
  "warnings": string[],
  "confidence": {
    "title": number,
    "provider": number,
    "organization": number,
    "category": number,
    "start_date": number,
    "end_date": number,
    "duration": number,
    "location": number,
    "mode": number,
    "skills": number,
    "technologies": number,
    "credential_id": number,
    "credential_url": number,
    "description": number
  }
}
`

const CO_CURRICULAR_SYSTEM_PROMPT = `
You are an expert AI certificate and document parsing engine specializing in Co-Curricular Activities, Hackathons, Technical Competitions, Conferences, Leadership, and Community Contributions.
Analyze the provided document (image or PDF) and extract factual structured activity metadata into JSON format.

CRITICAL ZERO-HALLUCINATION RULES:
1. FACTUAL EXTRACTION ONLY: Extract ONLY information explicitly visible or evidenced in the document text, logos, or seals.
2. DO NOT HALLUCINATE: If a field is not stated, return null (or [] for arrays). Never turn a "Participant" into a "Winner" without proof.
3. TITLE: Extract the official event or competition name (e.g. "Smart India Hackathon 2025", "CodeSprint Conclave").
4. ORGANIZATION: The organizing body, university, community, or host (e.g. "Ministry of Education & AICTE", "IEEE Student Branch", "Developer Student Clubs").
5. CATEGORY: Classify into EXACTLY ONE of the following allowed categories:
   - "Hackathon"
   - "Technical Event"
   - "Competition"
   - "Workshop"
   - "Conference"
   - "Presentation"
   - "Leadership"
   - "Volunteering"
   - "Club"
   - "Open Source"
   - "Entrepreneurship"
   - "Innovation"
   - "Cultural"
   - "Sports"
   - "Other"
   (If uncertain, choose "Other").
6. DATES:
   - date: Event start date or single date in strict YYYY-MM-DD format (e.g. "2025-01-01" if only year is visible, or "2025-04-25"). Do NOT return just a 4-digit year like "2025". Return null if absent.
   - end_date: Event conclusion date in strict YYYY-MM-DD format if multi-day, or null.
7. LOCATION: Event venue, campus, or nodal center (null if not specified).
8. MODE: "Offline", "Online", or "Hybrid" based on evidence.
9. ROLE: Participant role if stated (e.g. "Team Lead", "Participant", "Keynote Speaker", "Volunteer", "Core Contributor", "Organizer"). If not specified, return null.
10. ACHIEVEMENT: Specific honor, award, rank, or outcome if stated (e.g. "Winner", "1st Runner Up", "National Finalist", "Top 10", "Special Recognition", "Participant"). Return null if no distinct achievement is given.
11. SKILLS: Extract demonstrated soft or technical skills (e.g. ["Team Leadership", "Rapid Prototyping", "Public Speaking", "System Architecture"]). Return [] if none.
12. TECHNOLOGIES: Extract languages, frameworks, or tools explicitly mentioned (e.g. ["Next.js", "FastAPI", "PyTorch", "WebSockets"]).
13. CREDENTIAL ID: Certificate serial number or reference ID (null if absent).
14. CREDENTIAL URL: Verification link if printed (null if absent).
15. DESCRIPTION: Concise 1-2 sentence professional summary of the activity scope and contribution based on visible text.
16. RECIPIENT NAME: Extract the recipient's full name printed on the certificate.
17. WARNINGS: If document is blurry, cropped, or text is illegible, include warning strings.
18. CONFIDENCE: Return confidence scores (0.0 to 1.0) for each field.

Return ONLY valid JSON matching this exact structure:
{
  "title": string,
  "organization": string | null,
  "category": string,
  "description": string | null,
  "date": string | null,
  "end_date": string | null,
  "location": string | null,
  "mode": "Offline" | "Online" | "Hybrid",
  "role": string | null,
  "achievement": string | null,
  "skills": string[],
  "technologies": string[],
  "credential_id": string | null,
  "credential_url": string | null,
  "recipient_name": string | null,
  "warnings": string[],
  "confidence": {
    "title": number,
    "organization": number,
    "category": number,
    "date": number,
    "end_date": number,
    "location": number,
    "mode": number,
    "role": number,
    "achievement": number,
    "skills": number,
    "technologies": number,
    "credential_id": number,
    "credential_url": number,
    "description": number
  }
}
`

const CERTIFICATE_SYSTEM_PROMPT = `
You are an expert AI certificate parsing engine for a software engineer's portfolio CMS.
Analyze the provided certificate document (image or PDF) and extract all factual metadata into strict JSON format.

RULES:
1. TITLE: Extract the official course, specialization, or certification title.
2. ISSUER: Extract the exact organization, university, learning platform, or company that issued the credential.
3. CATEGORY: Classify into EXACTLY one of: "AI / ML", "Full Stack", "Programming", "Cloud", "Data", "Cybersecurity", "Hackathon", "Other".
4. ISSUE DATE: Date of completion/issue in ISO format (YYYY-MM-DD or YYYY-MM or YYYY).
5. EXPIRY DATE: Expiration date if explicitly visible, or null.
6. CREDENTIAL ID: Credential ID / serial number if visible, or null.
7. VERIFICATION URL: Verification link if printed, or null.
8. DESCRIPTION: Concise 1-2 sentence professional curriculum summary.
9. SKILLS: Demonstrated technical skills or languages represented.
10. RECIPIENT NAME: Extract the recipient's full name printed on the certificate.
11. WARNINGS: Any clarity, illegibility, or formatting warnings.
12. CONFIDENCE: Score between 0.00 and 1.00 for each field.

Return ONLY valid JSON matching this schema:
{
  "title": string,
  "issuer": string,
  "category": string,
  "issue_date": string | null,
  "expiry_date": string | null,
  "credential_id": string | null,
  "verification_url": string | null,
  "description": string | null,
  "skills": string[],
  "recipient_name": string | null,
  "warnings": string[],
  "confidence": {
    "title": number,
    "issuer": number,
    "category": number,
    "issue_date": number,
    "expiry_date": number,
    "credential_id": number,
    "verification_url": number,
    "description": number,
    "skills": number
  }
}
`

// ============================================================
// HELPER: Recipient Name Matcher
// ============================================================
function checkRecipientName(
  extractedName: string | null | undefined,
  expectedName: string
): { match: boolean | null; warning: string | null } {
  if (!extractedName || !extractedName.trim()) {
    return { match: null, warning: null }
  }

  const cleanExtracted = extractedName.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
  const cleanExpected = expectedName.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()

  const extractedTokens = cleanExtracted.split(/\s+/).filter(Boolean)
  const expectedTokens = cleanExpected.split(/\s+/).filter(Boolean)

  // Check if primary name tokens intersect (e.g. "Babul" and "Kumar")
  const hasCommonToken = expectedTokens.some((token) => extractedTokens.includes(token))

  if (hasCommonToken || cleanExtracted.includes(cleanExpected) || cleanExpected.includes(cleanExtracted)) {
    return { match: true, warning: null }
  }

  return {
    match: false,
    warning: `The document appears to be issued to "${extractedName}" rather than "${expectedName}". Please verify.`,
  }
}

// ============================================================
// CORE ANALYZER FUNCTION
// ============================================================
export async function analyzeDocumentWithGemini(
  fileBuffer: Buffer,
  mimeType: string,
  type: CertificateAnalysisType,
  ownerName = 'Babul Kumar'
): Promise<AnyDocumentExtraction> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment (.env.local).')
  }

  const base64Data = fileBuffer.toString('base64')
  const ai = new GoogleGenAI({ apiKey })

  let systemPrompt: string
  if (type === 'training') {
    systemPrompt = TRAINING_SYSTEM_PROMPT
  } else if (type === 'co_curricular') {
    systemPrompt = CO_CURRICULAR_SYSTEM_PROMPT
  } else {
    systemPrompt = CERTIFICATE_SYSTEM_PROMPT
  }

  let rawText = ''

  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType,
              },
            },
            {
              text: `Analyze this ${type} certificate document and extract metadata according to the strict system instructions and JSON schema.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    })
    rawText = response.text || ''
  } catch (primaryErr) {
    console.warn(`Primary Gemini model (${PRIMARY_MODEL}) failed, falling back to ${FALLBACK_MODEL}:`, primaryErr)
    const fallbackResponse = await ai.models.generateContent({
      model: FALLBACK_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType,
              },
            },
            {
              text: `${systemPrompt}\n\nAnalyze this document and output structured JSON now.`,
            },
          ],
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
    throw new Error('Gemini AI returned an empty response during document analysis.')
  }

  // Parse structured JSON safely
  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(rawText)
  } catch {
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      parsedJson = JSON.parse(jsonMatch[1] || jsonMatch[0])
    } else {
      throw new Error('Failed to parse AI response as valid JSON.')
    }
  }

  // Validate according to mode schema
  if (type === 'training') {
    const validated = geminiTrainingExtractionSchema.parse(parsedJson)
    const { match, warning } = checkRecipientName(validated.recipient_name, ownerName)
    const allWarnings = [...(validated.warnings || [])]
    if (warning && !allWarnings.includes(warning)) {
      allWarnings.push(warning)
    }

    return {
      ...validated,
      start_date: sanitizeDateForDb(validated.start_date),
      end_date: sanitizeDateForDb(validated.end_date),
      recipient_match: match,
      recipient_warning: warning,
      warnings: allWarnings,
    } as GeminiTrainingExtraction
  }

  if (type === 'co_curricular') {
    const validated = geminiCoCurricularExtractionSchema.parse(parsedJson)
    const { match, warning } = checkRecipientName(validated.recipient_name, ownerName)
    const allWarnings = [...(validated.warnings || [])]
    if (warning && !allWarnings.includes(warning)) {
      allWarnings.push(warning)
    }

    return {
      ...validated,
      date: sanitizeDateForDb(validated.date),
      end_date: sanitizeDateForDb(validated.end_date),
      recipient_match: match,
      recipient_warning: warning,
      warnings: allWarnings,
    } as GeminiCoCurricularExtraction
  }

  // Standard certificate mode
  const validated = geminiCertificateExtractionSchema.parse(parsedJson)
  const { match, warning } = checkRecipientName(validated.recipient_name, ownerName)
  const allWarnings = [...(validated.warnings || [])]
  if (warning && !allWarnings.includes(warning)) {
    allWarnings.push(warning)
  }

  return {
    ...validated,
    issue_date: sanitizeDateForDb(validated.issue_date),
    expiry_date: sanitizeDateForDb(validated.expiry_date),
    recipient_match: match,
    recipient_warning: warning,
    warnings: allWarnings,
  } as GeminiCertificateExtraction
}
