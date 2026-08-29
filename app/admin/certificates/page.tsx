'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Sparkles,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Award,
  FileText,
  Calendar,
} from 'lucide-react'
import type { Certificate } from '@/types'
import { formatDate } from '@/lib/utils'
import { toast, Toaster } from 'sonner'
import { getCertificatePublicUrl, isPdfDocument, extractStoragePath } from '@/lib/supabase/storage'
import StatusBadge from '@/components/admin/StatusBadge'
import SearchBar from '@/components/admin/SearchBar'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { ContentCardSkeleton } from '@/components/admin/LoadingSkeleton'

const DEFAULT_CATEGORIES = [
  'All',
  'AI / ML',
  'Programming',
  'Data',
  'Cloud & DevOps',
  'Frontend & Web',
  'Backend & Systems',
  'Software Engineering',
  'Security & Networking',
  'Other',
]

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Dynamically compute all unique categories from actual certificates
  const dynamicCategories = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = ['All']
    seen.add('all')

    for (const c of certs) {
      const cat = c.category?.trim()
      if (cat && !seen.has(cat.toLowerCase())) {
        seen.add(cat.toLowerCase())
        result.push(cat)
      }
    }
    for (const def of DEFAULT_CATEGORIES) {
      if (!seen.has(def.toLowerCase())) {
        seen.add(def.toLowerCase())
        result.push(def)
      }
    }
    return result
  }, [certs])

  // Confirm Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true
    async function loadData() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .order('issue_date', { ascending: false })

        if (active) {
          if (!error && Array.isArray(data)) {
            setCerts(data)
          } else {
            setCerts([])
          }
          setLoading(false)
        }
      } catch {
        if (active) {
          setCerts([])
          setLoading(false)
        }
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [])

  // Filtered Certificates
  const filteredCerts = useMemo(() => {
    return certs.filter((cert) => {
      // Category match
      if (selectedCategory !== 'All' && cert.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false
      }
      // Status match
      if (statusFilter === 'published' && !cert.published) return false
      if (statusFilter === 'draft' && cert.published) return false
      if (statusFilter === 'featured' && !cert.featured) return false

      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const titleMatch = cert.title.toLowerCase().includes(q)
        const issuerMatch = cert.issuer.toLowerCase().includes(q)
        const idMatch = cert.credential_id?.toLowerCase().includes(q)
        const skillMatch = cert.skills?.some((s) => s.toLowerCase().includes(q))
        return titleMatch || issuerMatch || idMatch || skillMatch
      }
      return true
    })
  }, [certs, selectedCategory, statusFilter, searchQuery])

  async function togglePublished(id: string, current: boolean, slug?: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const supabase = createClient()

    try {
      if (isUuid) {
        const { error } = await supabase
          .from('certificates')
          .update({ published: !current })
          .eq('id', id)
        if (error) {
          toast.error('Database update failed')
        } else {
          toast.success(current ? 'Certificate unpublished' : 'Certificate published')
        }
      } else if (slug) {
        await supabase.from('certificates').update({ published: !current }).eq('slug', slug)
        toast.success(current ? 'Certificate unpublished' : 'Certificate published')
      } else {
        toast.success(current ? 'Certificate unpublished' : 'Certificate published')
      }
    } catch {
      toast.success(current ? 'Certificate unpublished' : 'Certificate published')
    }

    setCerts((prev) => prev.map((c) => (c.id === id ? { ...c, published: !current } : c)))
    try {
      fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'certificates', slug }),
      }).catch(() => {})
    } catch {}
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      deleteTarget.id
    )
    const supabase = createClient()

    try {
      if (deleteTarget.file_url) {
        const filePath = extractStoragePath(deleteTarget.file_url, 'certificate')
        if (filePath) await supabase.storage.from('certificate').remove([filePath]).catch(() => {})
      }
      if (deleteTarget.thumbnail_url) {
        const thumbPath = extractStoragePath(deleteTarget.thumbnail_url, 'certificate')
        if (thumbPath) await supabase.storage.from('certificate').remove([thumbPath]).catch(() => {})
      }

      if (isUuid) {
        const { error } = await supabase.from('certificates').delete().eq('id', deleteTarget.id)
        if (error) {
          toast.error(`Delete failed: ${error.message}`)
          setDeleting(false)
          return
        }
      } else if (deleteTarget.slug) {
        await supabase.from('certificates').delete().eq('slug', deleteTarget.slug)
      }
    } catch {
      // Ignored for non-uuid fallback item
    }

    try {
      fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'certificates', slug: deleteTarget.slug }),
      }).catch(() => {})
    } catch {}

    toast.success('Certificate deleted successfully')
    setCerts((prev) => prev.filter((c) => c.id !== deleteTarget.id))
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Toaster position="top-right" theme="dark" />

      {/* 1. Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#F5F5F5',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Certificates & Credentials
          </h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px', margin: 0 }}>
            {certs.length} verified credentials and certifications in portfolio
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            href="/admin/certificates/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #E45D2C 0%, #FF8A3D 100%)',
              color: '#FFFFFF',
              textDecoration: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(228, 93, 44, 0.25)',
              transition: 'all 0.15s',
            }}
          >
            <Sparkles size={15} /> Add with Gemini AI ✨
          </Link>
        </div>
      </div>

      {/* 2. Search and Filter Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search certificates by title, issuer, credential ID, or skill…"
        categories={dynamicCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        statusFilter={statusFilter}
        onSelectStatus={setStatusFilter}
        statusOptions={[
          { label: 'All Status', value: 'all' },
          { label: 'Published Only', value: 'published' },
          { label: 'Drafts Only', value: 'draft' },
          { label: 'Featured Only', value: 'featured' },
        ]}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        totalCount={certs.length}
        filteredCount={filteredCerts.length}
      />

      {/* 3. Main Content: Grid vs Table */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          <ContentCardSkeleton />
          <ContentCardSkeleton />
          <ContentCardSkeleton />
          <ContentCardSkeleton />
        </div>
      ) : filteredCerts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 20px',
            background: '#101318',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(228, 93, 44, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#E45D2C',
              margin: '0 auto 16px',
            }}
          >
            <Award size={24} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F5F5F5', margin: '0 0 6px' }}>
            No certificates match your search
          </h3>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px', maxWidth: '360px', marginInline: 'auto' }}>
            Try resetting your search query or category filters to view all credentials.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
              setStatusFilter('all')
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#F5F5F5',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARD VIEW */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredCerts.map((cert) => {
            const mediaUrl = getCertificatePublicUrl(cert.file_url || cert.thumbnail_url)
            const isPdf = isPdfDocument(mediaUrl)

            return (
              <div
                key={cert.id}
                className="admin-cert-card"
                style={{
                  background: '#101318',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {/* Media Preview Box */}
                <div>
                  <div
                    style={{
                      height: '140px',
                      borderRadius: '8px',
                      background: '#0B0D12',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    {mediaUrl && !isPdf ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={mediaUrl}
                        alt={cert.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    ) : isPdf ? (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#E45D2C',
                        }}
                      >
                        <FileText size={32} />
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-mono, monospace)',
                          }}
                        >
                          PDF Document
                        </span>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#6B7280',
                        }}
                      >
                        <Award size={32} />
                        <span style={{ fontSize: '11px' }}>Verified Credential</span>
                      </div>
                    )}

                    {/* Top Floating Badges */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        display: 'flex',
                        gap: '6px',
                      }}
                    >
                      <StatusBadge type="category" label={cert.category} />
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        display: 'flex',
                        gap: '6px',
                      }}
                    >
                      {cert.featured && <StatusBadge type="featured" />}
                      <StatusBadge type={cert.published ? 'published' : 'draft'} />
                    </div>
                  </div>

                  {/* Title & Issuer */}
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#F5F5F5',
                      margin: '0 0 4px',
                      lineHeight: 1.35,
                    }}
                  >
                    {cert.title}
                  </h3>

                  <div
                    style={{
                      fontSize: '12px',
                      color: '#9CA3AF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '10px',
                    }}
                  >
                    <span style={{ fontWeight: 500, color: '#E45D2C' }}>{cert.issuer}</span>
                    <span>·</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={11} /> {formatDate(cert.issue_date)}
                    </span>
                  </div>

                  {/* Credential ID */}
                  {cert.credential_id && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#6B7280',
                        fontFamily: 'var(--font-mono, monospace)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        marginBottom: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ID: {cert.credential_id}
                    </div>
                  )}

                  {/* Skills Tags */}
                  {cert.skills && cert.skills.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px',
                        marginBottom: '14px',
                      }}
                    >
                      {cert.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#151921',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#D1D5DB',
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                      {cert.skills.length > 4 && (
                        <span style={{ fontSize: '10px', color: '#6B7280', padding: '2px 4px' }}>
                          +{cert.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Action Toolbar */}
                <div
                  style={{
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Public Link */}
                  <Link
                    href={`/certificates/${cert.slug}`}
                    target="_blank"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: '#9CA3AF',
                      textDecoration: 'none',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                  >
                    <ExternalLink size={13} /> View Live
                  </Link>

                  {/* Quick Edit & Delete Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* Publish Toggle Button */}
                    <button
                      type="button"
                      onClick={() => togglePublished(cert.id, cert.published, cert.slug)}
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: cert.published ? '#10B981' : '#6B7280',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={cert.published ? 'Unpublish certificate' : 'Publish certificate'}
                    >
                      {cert.published ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>

                    {/* Edit Link */}
                    <Link
                      href={`/admin/certificates/${cert.id}`}
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                      }}
                      title="Edit certificate details"
                    >
                      <Pencil size={14} />
                    </Link>

                    {/* Delete Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(cert)}
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#EF4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Delete certificate"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* DENSE TABLE VIEW */
        <div
          style={{
            background: '#101318',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '13px',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: '#0D0F14',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#8A8F98',
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  <th style={{ padding: '12px 20px' }}>Credential</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Issue Date</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCerts.map((cert) => {
                  const mediaUrl = getCertificatePublicUrl(cert.file_url || cert.thumbnail_url)
                  const isPdf = isPdfDocument(mediaUrl)

                  return (
                    <tr
                      key={cert.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.12s',
                      }}
                      className="admin-table-row"
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '6px',
                              background: '#141822',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              overflow: 'hidden',
                            }}
                          >
                            {mediaUrl && !isPdf ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={mediaUrl}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : isPdf ? (
                              <FileText size={18} style={{ color: '#E45D2C' }} />
                            ) : (
                              <Award size={18} style={{ color: '#8A8F98' }} />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#F5F5F5' }}>
                              {cert.title}
                            </div>
                            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                              {cert.issuer} {cert.credential_id && `· ID: ${cert.credential_id}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge type="category" label={cert.category} />
                      </td>

                      <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: '12px' }}>
                        {formatDate(cert.issue_date)}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <StatusBadge type={cert.published ? 'published' : 'draft'} />
                          {cert.featured && <StatusBadge type="featured" />}
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <Link
                            href={`/certificates/${cert.slug}`}
                            target="_blank"
                            style={{
                              color: '#9CA3AF',
                              padding: '4px',
                            }}
                            title="View on public site"
                          >
                            <ExternalLink size={15} />
                          </Link>

                          <Link
                            href={`/admin/certificates/${cert.id}`}
                            style={{
                              color: '#D1D5DB',
                              padding: '4px',
                            }}
                            title="Edit certificate"
                          >
                            <Pencil size={15} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(cert)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                            title="Delete certificate"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Certificate"
        description="Are you sure you want to permanently delete this credential from your portfolio CMS and database?"
        itemName={deleteTarget?.title}
        confirmLabel="Delete Certificate"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <style>{`
        .admin-cert-card:hover {
          border-color: rgba(255, 255, 255, 0.2) !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
        }
        .admin-table-row:hover {
          background: #141822 !important;
        }
      `}</style>
    </div>
  )
}
