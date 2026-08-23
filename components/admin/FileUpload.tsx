'use client'

import { useCallback, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { Upload, X, File as FileIcon } from 'lucide-react'
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
  accept = { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 'application/pdf': ['.pdf'] },
  maxSize = 10 * 1024 * 1024,
  label = 'Upload file',
  hint,
  onFileSelect,
  currentUrl,
  onRemove,
  uploading = false,
  uploadProgress = 0,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
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
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  })

  const displayUrl = preview ?? currentUrl

  return (
    <div>
      <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>
        {label}
      </div>

      {displayUrl && (
        <div style={{ marginBottom: '12px', position: 'relative', display: 'inline-block' }}>
          {displayUrl.match(/\.(jpg|jpeg|png|webp|gif|avif)$/i) || preview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={displayUrl}
              alt="Preview"
              style={{ height: '80px', width: 'auto', borderRadius: '4px', border: '1px solid #2C2C2C', display: 'block' }}
            />
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', background: '#1A1A1A',
              border: '1px solid #2C2C2C', borderRadius: '4px',
              fontSize: '12px', color: '#888',
            }}>
              <FileIcon size={14} /> PDF file
            </div>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              style={{
                position: 'absolute', top: '-6px', right: '-6px',
                background: '#B65C3A', border: 'none', borderRadius: '50%',
                width: '18px', height: '18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
              }}
            >
              <X size={10} />
            </button>
          )}
        </div>
      )}

      <div
        {...getRootProps()}
        style={{
          border: `1.5px dashed ${isDragActive ? '#B65C3A' : '#2C2C2C'}`,
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragActive ? 'rgba(182,92,58,0.05)' : 'transparent',
          transition: 'all 0.2s',
        }}
      >
        <input {...getInputProps()} />
        <Upload size={20} style={{ color: '#444', margin: '0 auto 8px' }} />
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
          {isDragActive ? 'Drop file here' : 'Drag & drop or click to browse'}
        </div>
        {hint && <div style={{ fontSize: '11px', color: '#444' }}>{hint}</div>}
        {selectedFile && (
          <div style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
            {selectedFile.name} · {formatFileSize(selectedFile.size)}
          </div>
        )}
      </div>

      {uploading && (
        <div style={{ marginTop: '8px' }}>
          <div style={{
            height: '3px', background: '#1A1A1A', borderRadius: '2px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${uploadProgress}%`,
              background: '#B65C3A', borderRadius: '2px',
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
            Uploading… {uploadProgress}%
          </div>
        </div>
      )}

      {error && (
        <div style={{ fontSize: '12px', color: '#C96B46', marginTop: '6px' }}>{error}</div>
      )}
    </div>
  )
}
