import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadFile, generateFilePath, BUCKETS, ALLOWED_CERT_TYPES } from '@/lib/supabase/storage'
import { geminiCertificateExtractionSchema } from '@/lib/validations'
import { GoogleGenAI } from '@google/genai'

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 MB

const EXTRACTION_SYSTEM_PROMPT = `
You are an expert AI certificate parsing engine for a software engineer's portfolio CMS.
Analyze the provided certificate document (image or PDF) and extract all factual metadata into strict JSON format.

RULES:
1. TITLE: Extract the official course, specialization, or certification title. Do not use the issuing organization as the title.
2. ISSUER: Extract the exact organization, university, learning platform, or company that issued the credential (e.g., Stanford Online, DeepLearning.AI, Google, University of Helsinki, Coursera, AWS, Meta, IBM, etc.).
3. CATEGORY: Classify the certificate into EXACTLY one of these allowed categories:
   - "AI / ML"
   - "Full Stack"
   - "Programming"
   - "Cloud"
   - "Data"
   - "Cybersecurity"
   - "Hackathon"
   - "Other"
4. ISSUE DATE: Extract the date of completion/issue. Format as "YYYY-MM-DD" if day is present, "YYYY-MM" if only month/year is present, or "YYYY" if only year is present. If not found, return null.
5. EXPIRY DATE: Extract the expiration/valid-through date only if explicitly visible on the certificate. If not specified, return null. Do NOT guess or invent expiry dates.
6. CREDENTIAL ID: Extract the official credential, certificate, or serial number if visible. If not visible, return null.
7. VERIFICATION URL: Extract the official verification URL if printed on the certificate. Do not invent a URL. If not visible, return null.
8. DESCRIPTION: Write a concise, professional 1-2 sentence description explaining the curriculum, topics, and practical capabilities represented by this certificate.
9. SKILLS: Extract an array of relevant technical skills, algorithms, programming languages, or frameworks explicitly represented (e.g. ["Python", "TensorFlow", "Deep Learning", "Convolutional Neural Networks"]). Return an empty array [] if none are discernible.
10. CONFIDENCE: Provide a confidence score between 0.00 and 1.00 for each field:
    - title: number (0.0 to 1.0)
    - issuer: number (0.0 to 1.0)
    - category: number (0.0 to 1.0)
    - issue_date: number (0.0 to 1.0)
    - expiry_date: number (0.0 to 1.0)
    - credential_id: number (0.0 to 1.0)
    - verification_url: number (0.0 to 1.0)
    - description: number (0.0 to 1.0)
    - skills: number (0.0 to 1.0)

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

export async function POST(request: NextRequest) {
  // 1. Verify admin authentication
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If Supabase is configured in production, enforce strict authentication
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !user) {
    return NextResponse.json({ error: 'Unauthorized. Admin login required.' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No certificate file provided.' }, { status: 400 })
    }

    // 2. Validate MIME type
    if (!ALLOWED_CERT_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file format (${file.type}). Please upload a JPG, PNG, WEBP, or PDF.` },
        { status: 400 }
      )
    }

    // 3. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 15MB limit. Please upload a smaller file.' },
        { status: 400 }
      )
    }

    // 4. Verify Gemini API Key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY is not configured on the server. Please add your Gemini API key to .env.local.',
        },
        { status: 503 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')

    // 5. Store certificate asset in Supabase storage if available
    let publicFileUrl: string | null = null
    try {
      const filePath = generateFilePath(file.name, 'documents')
      const blob = new Blob([arrayBuffer], { type: file.type })
      const uploadRes = await uploadFile(BUCKETS.CERTIFICATES, filePath, blob, file.type)
      if (uploadRes.url) {
        publicFileUrl = uploadRes.url
      }
    } catch {
      // Non-blocking storage fallback for local environments
      console.warn('Supabase storage upload skipped or unconfigured.')
    }

    // 6. Call Google Gemini Multimodal AI
    const ai = new GoogleGenAI({ apiKey })

    let rawText = ''
    try {
      // Primary model: gemini-2.5-flash with structured JSON response
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: file.type,
                },
              },
              {
                text: 'Extract the certificate metadata according to the strict extraction rules and JSON schema.',
              },
            ],
          },
        ],
        config: {
          systemInstruction: EXTRACTION_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      })
      rawText = response.text || ''
    } catch (primaryErr) {
      console.warn('Gemini 2.5 flash attempt failed, falling back to gemini-1.5-flash:', primaryErr)
      // Fallback model: gemini-1.5-flash
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: file.type,
                },
              },
              {
                text: `${EXTRACTION_SYSTEM_PROMPT}\nExtract metadata from this certificate now.`,
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
      return NextResponse.json(
        { error: 'Gemini AI was unable to parse the certificate document.' },
        { status: 500 }
      )
    }

    // 7. Parse and Validate Untrusted AI Output with Zod
    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(rawText)
    } catch {
      // Attempt to extract JSON markdown block if present
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedJson = JSON.parse(jsonMatch[1] || jsonMatch[0])
      } else {
        throw new Error('Malformed AI response string')
      }
    }

    const validatedResult = geminiCertificateExtractionSchema.parse(parsedJson)

    return NextResponse.json({
      success: true,
      data: validatedResult,
      file_url: publicFileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })
  } catch (err: unknown) {
    console.error('Certificate analysis error:', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json(
      {
        error: `AI analysis failed: ${message}. You can continue filling the certificate manually.`,
      },
      { status: 500 }
    )
  }
}
