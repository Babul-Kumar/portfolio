'use client'

import { useCallback, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { UploadCloud, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'

interface FileUploadProps {
  accept?: Record<string, string[]>
  maxSize?: number
  label?: string
  hint?: string
  onFileSelect: (file: File) => void
  currentUrl?: string | null
  onRemove?: () => void
  uploading?: boolean
  uploadProgress?: number
}

export default function FileUpload({
  accept = { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.avif'], 'application/pdf': ['.pdf'] },
  maxSize = 20 * 1024 * 1024,
  label = 'Upload Media / File',
  hint = 'Supports PDF, PNG, JPG, WEBP (Max 20MB)',
  onFileSelect,
  currentUrl,
  onRemove,
  uploading = false,
  uploadProgress = 0,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      setError(null)
      if (rejected.length > 0 && rejected[0].errors.length > 0) {
        setError(rejected[0].errors[0].message)
        return
      }
      if (accepted.length === 0) return
      const file = accepted[0]
      setSelectedFile(file)
      onFileSelect(file)

      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  })

  const displayUrl = preview ?? currentUrl
  const isPdf = Boolean(
    selectedFile?.name.toLowerCase().endsWith('.pdf') ||
    (displayUrl && displayUrl.toLowerCase().split('?')[0].endsWith('.pdf'))
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && (
        <label
          style={{
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#8A8F98',
            fontWeight: 600,
          }}
        >
          {label}
        </label>
      )}

      {/* Uploaded Media / File Plaque */}
      {displayUrl && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: '#13171F',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            {isPdf ? (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '6px',
                  background: 'rgba(228, 93, 44, 0.12)',
                  border: '1px solid rgba(228, 93, 44, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#E45D2C',
                  flexShrink: 0,
                }}
              >
                <FileText size={20} />
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={displayUrl}
                alt="File preview"
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  flexShrink: 0,
                }}
              />
            )}

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '13px',
                  color: '#F5F5F5',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedFile?.name || (isPdf ? 'PDF Document' : 'Uploaded Image')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 500,
                  }}
                >
                  <CheckCircle2 size={11} /> Attached
                </span>
                {selectedFile && (
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>
                    · {formatFileSize(selectedFile.size)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {onRemove && (
            <button
              type="button"
              onClick={() => {
                setPreview(null)
                setSelectedFile(null)
                onRemove()
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#9CA3AF',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#EF4444'
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9CA3AF'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              }}
              aria-label="Remove attached file"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        {...getRootProps()}
        style={{
          border: `1.5px dashed ${
            isDragActive
              ? '#E45D2C'
              : 'rgba(255, 255, 255, 0.12)'
          }`,
          borderRadius: '10px',
          padding: '24px 16px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: isDragActive
            ? 'rgba(228, 93, 44, 0.06)'
            : '#101318',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <input {...getInputProps()} disabled={uploading} />
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isDragActive ? 'rgba(228, 93, 44, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px',
            color: isDragActive ? '#E45D2C' : '#9CA3AF',
          }}
        >
          <UploadCloud size={20} />
        </div>

        <div style={{ fontSize: '13px', color: '#F3F4F6', fontWeight: 500, marginBottom: '4px' }}>
          {isDragActive ? 'Drop file to upload' : 'Click to upload or drag & drop'}
        </div>
        <div style={{ fontSize: '11px', color: '#6B7280' }}>{hint}</div>
      </div>

      {/* Upload Progress Bar */}
      {uploading && (
        <div style={{ marginTop: '4px' }}>
          <div
            style={{
              height: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${uploadProgress > 0 ? uploadProgress : 100}%`,
                background: '#E45D2C',
                borderRadius: '9999px',
                transition: 'width 0.3s ease',
                animation: uploadProgress === 0 ? 'indeterminate 1.5s infinite linear' : 'none',
              }}
            />
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#8A8F98',
              marginTop: '4px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Uploading to Supabase Storage…</span>
            {uploadProgress > 0 && <span>{uploadProgress}%</span>}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          style={{
            fontSize: '12px',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '2px',
          }}
        >
          <AlertCircle size={13} /> {error}
        </div>
      )}
    </div>
  )
}
