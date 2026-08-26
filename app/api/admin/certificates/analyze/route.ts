import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateFilePath, BUCKETS, ALLOWED_CERT_TYPES } from '@/lib/supabase/storage'
import { uploadFile } from '@/lib/supabase/storage-server'
import { analyzeDocumentWithGemini } from '@/lib/ai/certificate-analyzer'
import { FALLBACK_PROFILE, FALLBACK_CERTIFICATES } from '@/lib/data'

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
        { error: 'File size exceeds 20MB limit. Please upload a smaller file.' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    // 4. Store certificate asset in Supabase storage if available
    let publicFileUrl: string | null = null
    try {
      const filePath = generateFilePath(file.name, 'documents')
      const blob = new Blob([arrayBuffer], { type: file.type })
      const uploadRes = await uploadFile(BUCKETS.CERTIFICATES, filePath, blob, file.type)
      if (uploadRes.url) {
        publicFileUrl = uploadRes.url
      }
    } catch {
      console.warn('Supabase storage upload skipped or unconfigured.')
    }

    // 5. Fetch profile name for verification
    let ownerName = FALLBACK_PROFILE.name
    try {
      const { data: profile } = await supabase.from('profiles').select('name').limit(1).single()
      if (profile?.name) {
        ownerName = profile.name
      }
    } catch {
      // Use fallback
    }

    // 6. Call shared Gemini analyzer
    const extraction = await analyzeDocumentWithGemini(fileBuffer, file.type, 'certificate', ownerName)

    // 7. Check duplicate
    let duplicateWarning: string | null = null
    const credId = extraction.credential_id?.trim()
    if (credId) {
      try {
        const { data } = await supabase
          .from('certificates')
          .select('id, title, credential_id')
          .eq('credential_id', credId)
          .maybeSingle()
        if (data) {
          duplicateWarning = `Possible Duplicate: An existing certificate "${data.title}" has the same credential ID (${data.credential_id}).`
        }
      } catch {
        const found = FALLBACK_CERTIFICATES.find((c) => c.credential_id === credId)
        if (found) duplicateWarning = `Possible Duplicate: An existing certificate "${found.title}" has the same credential ID (${credId}).`
      }
    }

    return NextResponse.json({
      success: true,
      data: extraction,
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
        error: `AI analysis failed: ${message}. You can continue filling the certificate manually.`,
      },
      { status: 500 }
    )
  }
}
