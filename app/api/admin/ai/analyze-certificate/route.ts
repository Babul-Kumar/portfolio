import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateFilePath, BUCKETS, ALLOWED_CERT_TYPES } from '@/lib/supabase/storage'
import { uploadFile } from '@/lib/supabase/storage-server'
import { analyzeDocumentWithGemini } from '@/lib/ai/certificate-analyzer'
import type { CertificateAnalysisType } from '@/types'
import { FALLBACK_TRAININGS, FALLBACK_CO_CURRICULAR, FALLBACK_CERTIFICATES, FALLBACK_PROFILE } from '@/lib/data'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

export async function POST(request: NextRequest) {
  // 1. Verify admin authentication
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !user) {
    return NextResponse.json({ error: 'Unauthorized. Admin login required.' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const rawType = (formData.get('type') as string) || 'training'

    const type: CertificateAnalysisType =
      rawType === 'co_curricular' || rawType === 'certificate' || rawType === 'training'
        ? rawType
        : 'training'

    if (!file) {
      return NextResponse.json({ error: 'No certificate or document file provided.' }, { status: 400 })
    }

    // 2. Validate MIME type
    if (!ALLOWED_CERT_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file format (${file.type}). Please upload a PDF, JPG, PNG, or WEBP document.`,
        },
        { status: 400 }
      )
    }

    // 3. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 20MB limit. Please upload a smaller file.' },
        { status: 400 }
      )
    }

    // 4. Verify Gemini API Key configuration
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
    const fileBuffer = Buffer.from(arrayBuffer)

    // 5. Upload document asset to Supabase Storage
    let publicFileUrl: string | null = null
    try {
      const folderPrefix =
        type === 'training'
          ? 'training/documents'
          : type === 'co_curricular'
          ? 'co-curricular/documents'
          : 'documents'

      const filePath = generateFilePath(file.name, folderPrefix)
      const blob = new Blob([arrayBuffer], { type: file.type })
      const uploadRes = await uploadFile(BUCKETS.CERTIFICATES, filePath, blob, file.type)
      if (uploadRes.url) {
        publicFileUrl = uploadRes.url
      }
    } catch {
      // Non-blocking storage fallback for local/offline mock environments
      console.warn('Supabase storage upload skipped or unconfigured.')
    }

    // 6. Get portfolio owner name for recipient verification
    let ownerName = FALLBACK_PROFILE.name
    try {
      const { data: profile } = await supabase.from('profiles').select('name').limit(1).single()
      if (profile?.name) {
        ownerName = profile.name
      }
    } catch {
      // Use fallback
    }

    // 7. Run AI Document Analysis
    const extractionResult = await analyzeDocumentWithGemini(fileBuffer, file.type, type, ownerName)

    // 8. Check for potential duplicate records in the database
    let duplicateWarning: string | null = null
    const credId = extractionResult.credential_id?.trim()
    const title = extractionResult.title?.trim()

    try {
      if (type === 'training') {
        const query = supabase.from('training').select('id, title, credential_id')
        if (credId) {
          const { data } = await query.eq('credential_id', credId).maybeSingle()
          if (data) {
            duplicateWarning = `Possible Duplicate: An existing training record "${data.title}" has the same credential ID (${data.credential_id}).`
          }
        } else if (title) {
          const { data } = await supabase.from('training').select('id, title').ilike('title', title).maybeSingle()
          if (data) {
            duplicateWarning = `Possible Duplicate: A training record with the title "${data.title}" already exists.`
          }
        }
      } else if (type === 'co_curricular') {
        if (credId) {
          const { data } = await supabase
            .from('co_curricular_activities')
            .select('id, title, credential_id')
            .eq('credential_id', credId)
            .maybeSingle()
          if (data) {
            duplicateWarning = `Possible Duplicate: An existing co-curricular activity "${data.title}" has the same credential ID (${data.credential_id}).`
          }
        } else if (title) {
          const { data } = await supabase
            .from('co_curricular_activities')
            .select('id, title')
            .ilike('title', title)
            .maybeSingle()
          if (data) {
            duplicateWarning = `Possible Duplicate: A co-curricular activity with the title "${data.title}" already exists.`
          }
        }
      } else {
        if (credId) {
          const { data } = await supabase
            .from('certificates')
            .select('id, title, credential_id')
            .eq('credential_id', credId)
            .maybeSingle()
          if (data) {
            duplicateWarning = `Possible Duplicate: An existing certificate "${data.title}" has the same credential ID (${data.credential_id}).`
          }
        }
      }
    } catch {
      // Check in fallback datasets if DB query is unavailable
      if (type === 'training' && credId) {
        const found = FALLBACK_TRAININGS.find((t) => t.credential_id === credId)
        if (found) duplicateWarning = `Possible Duplicate: Fallback training record "${found.title}" has credential ID (${credId}).`
      } else if (type === 'co_curricular' && credId) {
        const found = FALLBACK_CO_CURRICULAR.find((c) => c.credential_id === credId)
        if (found) duplicateWarning = `Possible Duplicate: Fallback co-curricular record "${found.title}" has credential ID (${credId}).`
      } else if (type === 'certificate' && credId) {
        const found = FALLBACK_CERTIFICATES.find((c) => c.credential_id === credId)
        if (found) duplicateWarning = `Possible Duplicate: Fallback certificate "${found.title}" has credential ID (${credId}).`
      }
    }

    return NextResponse.json({
      success: true,
      data: extractionResult,
      file_url: publicFileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      duplicateWarning,
    })
  } catch (err: unknown) {
    console.error('Certificate analysis error:', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json(
      {
        error: `AI analysis failed: ${message}. You can continue filling the fields manually.`,
      },
      { status: 500 }
    )
  }
}
