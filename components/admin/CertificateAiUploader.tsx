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
  ArrowRight,
  ShieldAlert,
  Calendar,
  Building,
  Tag,
  Hash,
  Award,
  Layers,
} from 'lucide-react'
import { formatFileSize } from '@/lib/utils'
import type {
  CertificateAnalysisType,
  AnyDocumentExtraction,
} from '@/types'
import { toast } from 'sonner'

export type AnalysisStatus =
  | 'IDLE'
  | 'UPLOADED'
  | 'ANALYZING'
  | 'ANALYZED_PREVIEW'
  | 'APPLIED'
  | 'ERROR'

interface CertificateAiUploaderProps {
  type?: CertificateAnalysisType
  onExtractionSuccess: (
    extraction: AnyDocumentExtraction,
    file: File,
    previewUrl: string,
    storageUrl?: string | null
  ) => void
  onFileRemoved: () => void
  disabled?: boolean
}

const ANALYSIS_STEPS = [
  'Reading document buffer & visual layers…',
  'Analyzing visual & text hierarchies with Google Gemini AI…',
  'Extracting title, organization, dates, skills & credentials…',
  'Validating schema, confidence metrics & duplicate checks…',
]

export default function CertificateAiUploader({
  type = 'training',
  onExtractionSuccess,
  onFileRemoved,
  disabled = false,
}: CertificateAiUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<AnalysisStatus>('IDLE')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [extractedData, setExtractedData] = useState<AnyDocumentExtraction | null>(null)
  const [serverFileUrl, setServerFileUrl] = useState<string | null>(null)
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const isPDF = file?.type === 'application/pdf'

  const typeLabel =
    type === 'training'
      ? 'Training Certificate / Proof'
      : type === 'co_curricular'
      ? 'Activity Proof / Certificate'
      : 'Certificate Document'

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
      setExtractedData(null)
      setDuplicateAlert(null)

      if (selectedFile.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(selectedFile)
        setPreviewUrl(objectUrl)
      } else {
        setPreviewUrl(null)
      }

      toast.info(`Selected "${selectedFile.name}". Click "Analyze with Gemini" to extract details.`)
    },
    []
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    multiple: false,
    disabled: status === 'ANALYZING' || disabled,
  })

  function handleRemove() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
    setStatus('IDLE')
    setErrorMessage(null)
    setExtractedData(null)
    setServerFileUrl(null)
    setDuplicateAlert(null)
    if (intervalRef.current) clearInterval(intervalRef.current)
    onFileRemoved()
  }

  async function handleAnalyze() {
    if (!file) return

    setStatus('ANALYZING')
    setErrorMessage(null)
    setActiveStep(0)
    setDuplicateAlert(null)

    // Progress step ticker animation
    let step = 0
    intervalRef.current = setInterval(() => {
      step = (step + 1) % ANALYSIS_STEPS.length
      setActiveStep(step)
    }, 1300)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/admin/ai/analyze-certificate', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (intervalRef.current) clearInterval(intervalRef.current)

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to analyze certificate.')
      }

      const extraction: AnyDocumentExtraction = {
        ...result.data,
        file_url: result.file_url ?? null,
      }

      setExtractedData(extraction)
      setServerFileUrl(result.file_url ?? null)
      if (result.duplicateWarning) {
        setDuplicateAlert(result.duplicateWarning)
      }

      setStatus('ANALYZED_PREVIEW')
      toast.success('Document analysis completed! Review extracted metadata below.')
    } catch (err: unknown) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setStatus('ERROR')
      const msg = err instanceof Error ? err.message : 'Analysis failed'
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  function handleApplyToForm() {
    if (!extractedData || !file) return

    setStatus('APPLIED')
    onExtractionSuccess(extractedData, file, previewUrl || '', serverFileUrl)
    toast.success('Extracted details applied to the form! Please review and save.')
  }

  return (
    <div
      style={{
        background: '#0D1117',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient decorative glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '280px',
          height: '280px',
          background:
            'radial-gradient(circle at 100% 0%, rgba(228, 93, 44, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(228, 93, 44, 0.12)',
              border: '1px solid rgba(228, 93, 44, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FF8A3D',
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#F5F5F5',
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              Gemini AI Document Auto-Fill
            </h3>
            <p
              style={{
                fontSize: '12px',
                color: '#8A8F98',
                fontFamily: 'var(--font-mono)',
                margin: '2px 0 0',
              }}
            >
              Upload {typeLabel.toLowerCase()} (PDF, JPG, PNG, WEBP) to auto-extract structured details
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
              color: '#8A8F98',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '5px 10px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#EF4444'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#8A8F98'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
            }}
          >
            <X size={13} /> Remove Document
          </button>
        )}
      </div>

      {/* Dropzone State */}
      {!file ? (
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${
              isDragActive ? '#E45D2C' : 'rgba(255, 255, 255, 0.12)'
            }`,
            borderRadius: '10px',
            padding: '36px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragActive ? 'rgba(228, 93, 44, 0.06)' : '#101318',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <input {...getInputProps()} />
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: isDragActive ? 'rgba(228, 93, 44, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: isDragActive ? '#FF8A3D' : '#9CA3AF',
            }}
          >
            <Upload size={22} />
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#F5F5F5',
              marginBottom: '4px',
            }}
          >
            {isDragActive ? 'Drop document here…' : 'Drag & drop certificate or click to browse'}
          </div>
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#6B7280',
            }}
          >
            Supports PDF, JPG, PNG, WEBP up to 20MB
          </div>
        </div>
      ) : (
        <div>
          {/* File Badge Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#13171F',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              {previewUrl && !isPDF ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewUrl}
                  alt="Certificate Document Preview"
                  style={{
                    width: '48px',
                    height: '38px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '48px',
                    height: '38px',
                    borderRadius: '6px',
                    background: 'rgba(228, 93, 44, 0.12)',
                    border: '1px solid rgba(228, 93, 44, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF8A3D',
                    flexShrink: 0,
                  }}
                >
                  <FileText size={20} />
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#F5F5F5',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {file.name}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: '#8A8F98',
                  }}
                >
                  {formatFileSize(file.size)} · {isPDF ? 'PDF Document' : 'Image Document'}
                </div>
              </div>
            </div>

            {/* Status Pill */}
            <div>
              {status === 'UPLOADED' && (
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: '#FF8A3D',
                    padding: '3px 10px',
                    background: 'rgba(228, 93, 44, 0.1)',
                    borderRadius: '9999px',
                    border: '1px solid rgba(228, 93, 44, 0.2)',
                  }}
                >
                  Ready for AI Analysis
                </span>
              )}
              {status === 'ANALYZED_PREVIEW' && (
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: '#14B8A6',
                    padding: '3px 10px',
                    background: 'rgba(20, 184, 166, 0.1)',
                    borderRadius: '9999px',
                    border: '1px solid rgba(20, 184, 166, 0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Sparkles size={11} /> Analysis Ready
                </span>
              )}
              {status === 'APPLIED' && (
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: '#10B981',
                    padding: '3px 10px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '9999px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckCircle2 size={11} /> Applied to Form
                </span>
              )}
            </div>
          </div>

          {/* Analyzing Step-by-Step Scanning Animation */}
          {status === 'ANALYZING' && (
            <div
              style={{
                padding: '24px 18px',
                background: 'rgba(228, 93, 44, 0.05)',
                border: '1px solid rgba(228, 93, 44, 0.2)',
                borderRadius: '10px',
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
                  color: '#FF8A3D',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                <Cpu size={15} style={{ animation: 'spin 3s linear infinite' }} />
                <span>✦ GOOGLE GEMINI MULTIMODAL INFERENCE</span>
              </div>

              <div
                style={{
                  fontSize: '14px',
                  color: '#F5F5F5',
                  fontWeight: 500,
                  marginBottom: '16px',
                }}
              >
                {ANALYSIS_STEPS[activeStep]}
              </div>

              {/* Shimmer progress bar */}
              <div
                style={{
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  position: 'relative',
                  maxWidth: '380px',
                  margin: '0 auto',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '40%',
                    background: 'linear-gradient(90deg, #E45D2C, #FF8A3D)',
                    borderRadius: '2px',
                    animation: 'scanBar 1.4s ease-in-out infinite alternate',
                  }}
                />
              </div>
            </div>
          )}

          {/* Error Message & Retry Banner */}
          {status === 'ERROR' && (
            <div
              style={{
                padding: '16px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
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
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>AI Document Analysis Notice</div>
                <div>{errorMessage}</div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#8A8F98',
                    marginTop: '6px',
                  }}
                >
                  You can retry analysis or continue filling out the form fields manually.
                </div>
              </div>
            </div>
          )}

          {/* AI Extracted Preview Card (Shown before or after applying) */}
          {extractedData && (status === 'ANALYZED_PREVIEW' || status === 'APPLIED') && (
            <div
              style={{
                background: '#13171F',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '16px',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={15} style={{ color: '#FF8A3D' }} />
                  <span
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#F5F5F5',
                    }}
                  >
                    AI Extracted Information
                  </span>
                </div>

                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#8A8F98' }}>
                  Review details below before applying
                </div>
              </div>

              {/* Warnings Banner (if any) */}
              {((extractedData.warnings && extractedData.warnings.length > 0) ||
                duplicateAlert ||
                extractedData.recipient_warning) && (
                <div
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '12px',
                    color: '#F59E0B',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  {extractedData.recipient_warning && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldAlert size={14} style={{ flexShrink: 0 }} />
                      <span>{extractedData.recipient_warning}</span>
                    </div>
                  )}

                  {duplicateAlert && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                      <span>{duplicateAlert}</span>
                    </div>
                  )}

                  {extractedData.warnings?.map((w, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Extracted Details Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '14px',
                  marginBottom: '16px',
                }}
              >
                {/* Title */}
                <div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: '#8A8F98',
                      textTransform: 'uppercase',
                      marginBottom: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Layers size={11} /> Title
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#F5F5F5' }}>
                    {extractedData.title || <span style={{ color: '#6B7280' }}>Not specified</span>}
                  </div>
                </div>

                {/* Organization / Provider */}
                <div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: '#8A8F98',
                      textTransform: 'uppercase',
                      marginBottom: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Building size={11} />{' '}
                    {type === 'training'
                      ? 'Provider / Institution'
                      : type === 'co_curricular'
                      ? 'Organization / Host'
                      : 'Issuer'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#E2E8F0' }}>
                    {'provider' in extractedData && extractedData.provider
                      ? extractedData.provider
                      : 'organization' in extractedData && extractedData.organization
                      ? extractedData.organization
                      : 'issuer' in extractedData && extractedData.issuer
                      ? extractedData.issuer
                      : <span style={{ color: '#6B7280' }}>Not detected</span>}
                  </div>
                </div>

                {/* Category & Mode */}
                <div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: '#8A8F98',
                      textTransform: 'uppercase',
                      marginBottom: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Tag size={11} /> Category & Mode
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        padding: '1px 7px',
                        borderRadius: '4px',
                        background: 'rgba(228, 93, 44, 0.12)',
                        color: '#FF8A3D',
                        fontWeight: 600,
                      }}
                    >
                      {extractedData.category}
                    </span>
                    {'mode' in extractedData && extractedData.mode && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          padding: '1px 7px',
                          borderRadius: '4px',
                          background: 'rgba(20, 184, 166, 0.12)',
                          color: '#14B8A6',
                          fontWeight: 600,
                        }}
                      >
                        {extractedData.mode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: '#8A8F98',
                      textTransform: 'uppercase',
                      marginBottom: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Calendar size={11} /> Date / Schedule
                  </div>
                  <div style={{ fontSize: '13px', color: '#E2E8F0' }}>
                    {'start_date' in extractedData && extractedData.start_date
                      ? extractedData.start_date +
                        (extractedData.end_date ? ` to ${extractedData.end_date}` : '')
                      : 'date' in extractedData && extractedData.date
                      ? extractedData.date + (extractedData.end_date ? ` to ${extractedData.end_date}` : '')
                      : 'issue_date' in extractedData && extractedData.issue_date
                      ? extractedData.issue_date
                      : <span style={{ color: '#6B7280' }}>Not stated</span>}
                    {'duration' in extractedData && extractedData.duration && (
                      <span style={{ color: '#8A8F98', marginLeft: '6px' }}>
                        ({extractedData.duration})
                      </span>
                    )}
                  </div>
                </div>

                {/* Credential ID */}
                {extractedData.credential_id && (
                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: '#8A8F98',
                        textTransform: 'uppercase',
                        marginBottom: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Hash size={11} /> Credential ID
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        color: '#10B981',
                      }}
                    >
                      {extractedData.credential_id}
                    </div>
                  </div>
                )}

                {/* Role / Achievement (if Co-Curricular) */}
                {type === 'co_curricular' && 'role' in extractedData && (
                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: '#8A8F98',
                        textTransform: 'uppercase',
                        marginBottom: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Award size={11} /> Role & Achievement
                    </div>
                    <div style={{ fontSize: '13px', color: '#E2E8F0' }}>
                      {extractedData.role || 'Participant'}
                      {extractedData.achievement ? ` · ${extractedData.achievement}` : ''}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills Tags */}
              {extractedData.skills && extractedData.skills.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: '#8A8F98',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                    }}
                  >
                    Detected Skills:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {extractedData.skills.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: '#1A202C',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#CBD5E1',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Trigger Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {status === 'UPLOADED' && (
              <button
                type="button"
                onClick={handleAnalyze}
                style={{
                  padding: '11px 22px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #E45D2C 0%, #FF8A3D 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(228, 93, 44, 0.35)',
                  transition: 'all 0.2s',
                }}
              >
                <Sparkles size={15} />
                <span>Analyze with Gemini ✨</span>
              </button>
            )}

            {status === 'ANALYZED_PREVIEW' && (
              <>
                <button
                  type="button"
                  onClick={handleApplyToForm}
                  style={{
                    padding: '11px 24px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #E45D2C 0%, #FF8A3D 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(228, 93, 44, 0.35)',
                    transition: 'all 0.2s',
                  }}
                >
                  <ArrowRight size={15} />
                  <span>Apply to Form</span>
                </button>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  style={{
                    padding: '11px 18px',
                    borderRadius: '6px',
                    background: '#13171F',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#8A8F98',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RotateCcw size={13} /> Re-Analyze Document
                </button>
              </>
            )}

            {status === 'APPLIED' && (
              <button
                type="button"
                onClick={handleAnalyze}
                style={{
                  padding: '9px 16px',
                  borderRadius: '6px',
                  background: '#13171F',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#8A8F98',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RotateCcw size={13} /> Re-Analyze with Gemini
              </button>
            )}

            {status === 'ERROR' && (
              <button
                type="button"
                onClick={handleAnalyze}
                style={{
                  padding: '10px 18px',
                  borderRadius: '6px',
                  background: '#13171F',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FF8A3D',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
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
