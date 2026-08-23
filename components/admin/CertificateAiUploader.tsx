'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import {
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RotateCcw,
  X,
  Cpu,
} from 'lucide-react'
import { formatFileSize } from '@/lib/utils'
import type { GeminiCertificateExtraction } from '@/types'
import { toast } from 'sonner'

export type AnalysisStatus =
  | 'IDLE'
  | 'UPLOADED'
  | 'ANALYZING'
  | 'SUCCESS'
  | 'PARTIAL_SUCCESS'
  | 'ERROR'

interface CertificateAiUploaderProps {
  onExtractionSuccess: (extraction: GeminiCertificateExtraction, file: File, previewUrl: string) => void
  onFileRemoved: () => void
  disabled?: boolean
}

const ANALYSIS_STEPS = [
  'Reading certificate document…',
  'Analyzing visual & text hierarchies with Gemini AI…',
  'Extracting title, issuer, dates & credentials…',
  'Validating structured schema & confidence scores…',
]

export default function CertificateAiUploader({
  onExtractionSuccess,
  onFileRemoved,
  disabled = false,
}: CertificateAiUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<AnalysisStatus>('IDLE')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const isPDF = file?.type === 'application/pdf'

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const err = fileRejections[0].errors[0]?.message || 'Invalid file type or size'
        toast.error(err)
        return
      }

      if (acceptedFiles.length === 0) return

      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      setStatus('UPLOADED')
      setErrorMessage(null)

      if (selectedFile.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(selectedFile)
        setPreviewUrl(objectUrl)
      } else {
        setPreviewUrl(null)
      }

      toast.info(`Uploaded "${selectedFile.name}". Click "Analyze with Gemini" to auto-fill.`)
    },
    []
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 15 * 1024 * 1024, // 15MB
    multiple: false,
    disabled: status === 'ANALYZING' || disabled,
  })

  function handleRemove() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
    setStatus('IDLE')
    setErrorMessage(null)
    if (intervalRef.current) clearInterval(intervalRef.current)
    onFileRemoved()
  }

  async function handleAnalyze() {
    if (!file) return

    setStatus('ANALYZING')
    setErrorMessage(null)
    setActiveStep(0)

    // Progress animation ticker
    let step = 0
    intervalRef.current = setInterval(() => {
      step = (step + 1) % ANALYSIS_STEPS.length
      setActiveStep(step)
    }, 1200)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/certificates/analyze', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (intervalRef.current) clearInterval(intervalRef.current)

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to analyze certificate.')
      }

      const extraction: GeminiCertificateExtraction = {
        ...result.data,
        file_url: result.file_url ?? null,
      }

      // Check if critical fields were extracted
      const isPartial =
        !extraction.title || !extraction.issuer || !extraction.issue_date

      setStatus(isPartial ? 'PARTIAL_SUCCESS' : 'SUCCESS')

      if (isPartial) {
        toast.warning(
          'Gemini extracted some details. Please review and complete remaining fields.'
        )
      } else {
        toast.success(
          'Certificate analyzed! Fields have been auto-populated with AI confidence scores.'
        )
      }

      onExtractionSuccess(extraction, file, previewUrl || '')
    } catch (err: unknown) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setStatus('ERROR')
      const msg = err instanceof Error ? err.message : 'Analysis failed'
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle Gemini gradient glow accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '240px',
          height: '240px',
          background:
            'radial-gradient(circle at 100% 0%, rgba(229, 106, 61, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-accent-bg)',
              border: '1px solid var(--color-accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent)',
            }}
          >
            <Sparkles size={14} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--color-text)',
                letterSpacing: '-0.01em',
              }}
            >
              AI Certificate Auto-Fill
            </h3>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Upload certificate image or PDF to extract details with Google Gemini
            </p>
          </div>
        </div>

        {file && status !== 'ANALYZING' && (
          <button
            type="button"
            onClick={handleRemove}
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
            className="hover-accent-text"
          >
            <X size={13} /> Remove File
          </button>
        )}
      </div>

      {/* Dropzone or Uploaded Preview State */}
      {!file ? (
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${
              isDragActive ? 'var(--color-accent)' : 'var(--color-border)'
            }`,
            borderRadius: 'var(--radius-sm)',
            padding: '36px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragActive ? 'var(--color-accent-bg)' : 'rgba(255, 255, 255, 0.01)',
            transition: 'all 0.2s ease',
          }}
        >
          <input {...getInputProps()} />
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: 'var(--color-accent)',
            }}
          >
            <Upload size={20} />
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '4px',
            }}
          >
            {isDragActive
              ? 'Drop your certificate here…'
              : 'Drag & drop certificate or click to browse'}
          </div>
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
            }}
          >
            Supports JPG, PNG, WEBP, and PDF up to 15MB
          </div>
        </div>
      ) : (
        <div>
          {/* File Card Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {previewUrl && !isPDF ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewUrl}
                  alt="Certificate Preview"
                  style={{
                    width: '48px',
                    height: '36px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '48px',
                    height: '36px',
                    borderRadius: '4px',
                    background: 'var(--color-accent-bg)',
                    border: '1px solid var(--color-accent-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-accent)',
                  }}
                >
                  <FileText size={18} />
                </div>
              )}
              <div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                  }}
                >
                  {file.name}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {formatFileSize(file.size)} · {isPDF ? 'PDF Document' : 'Image Document'}
                </div>
              </div>
            </div>

            {/* Status Badges */}
            <div>
              {status === 'UPLOADED' && (
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-muted)',
                    padding: '3px 8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  Ready for AI Analysis
                </span>
              )}
              {status === 'SUCCESS' && (
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: '#10B981',
                    padding: '3px 8px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckCircle2 size={12} /> Auto-Filled with Gemini
                </span>
              )}
              {status === 'PARTIAL_SUCCESS' && (
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: '#F59E0B',
                    padding: '3px 8px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <AlertTriangle size={12} /> Partially Extracted
                </span>
              )}
            </div>
          </div>

          {/* Analyzing Scanning Animation */}
          {status === 'ANALYZING' && (
            <div
              style={{
                padding: '24px 18px',
                background: 'rgba(229, 106, 61, 0.04)',
                border: '1px solid var(--color-accent-border)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  color: 'var(--color-accent)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                <Cpu size={15} className="pulse-slow" />
                <span>✦ GEMINI MULTIMODAL INFERENCE</span>
              </div>

              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text)',
                  fontWeight: 500,
                  marginBottom: '16px',
                }}
              >
                {ANALYSIS_STEPS[activeStep]}
              </div>

              {/* Progress Loading Bar */}
              <div
                style={{
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  position: 'relative',
                  maxWidth: '360px',
                  margin: '0 auto',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '40%',
                    background: 'var(--color-accent)',
                    borderRadius: '2px',
                    animation: 'scanBar 1.4s ease-in-out infinite alternate',
                  }}
                />
              </div>
            </div>
          )}

          {/* Error Message & Retry */}
          {status === 'ERROR' && (
            <div
              style={{
                padding: '16px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>AI Analysis Notice</div>
                <div>{errorMessage}</div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    marginTop: '6px',
                  }}
                >
                  You can retry or continue filling out the certificate fields manually below.
                </div>
              </div>
            </div>
          )}

          {/* Action Triggers */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {status !== 'ANALYZING' && (
              <button
                type="button"
                onClick={handleAnalyze}
                className="btn-primary"
                style={{
                  padding: '10px 20px',
                  fontSize: '13px',
                }}
              >
                <Sparkles size={14} />
                <span>
                  {status === 'SUCCESS' || status === 'PARTIAL_SUCCESS'
                    ? 'Re-Analyze with Gemini ✨'
                    : 'Analyze with Gemini ✨'}
                </span>
              </button>
            )}

            {status === 'ERROR' && (
              <button
                type="button"
                onClick={handleAnalyze}
                className="btn-secondary"
                style={{ padding: '10px 18px', fontSize: '13px' }}
              >
                <RotateCcw size={13} /> Retry Analysis
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes scanBar {
          0% { left: 0%; width: 25%; }
          50% { width: 50%; }
          100% { left: 75%; width: 25%; }
        }
      `}</style>
    </div>
  )
}
