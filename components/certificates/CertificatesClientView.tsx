'use client'

import { useState, useMemo } from 'react'
import type { Certificate } from '@/types'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Search, ExternalLink, ShieldCheck, Award, X, Eye, ArrowRight } from 'lucide-react'
import CertificateMedia from '@/components/certificates/CertificateMedia'
import PreviewModal, { type PreviewItem, type PreviewMedia } from '@/components/ui/PreviewModal'
import { getCertificatePublicUrl, isPdfDocument } from '@/lib/supabase/storage'

interface CertificatesClientViewProps {
  initialCertificates: Certificate[]
}

const CATEGORY_TABS = [
  'ALL',
  'AI / ML',
  'DEVELOPMENT',
  'CLOUD',
  'PROGRAMMING',
  'OTHER',
]

export default function CertificatesClientView({
  initialCertificates,
}: CertificatesClientViewProps) {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)
  const [category, setCategory] = useState('ALL')
  const [search, setSearch] = useState('')

  // Map selected certificate into unified PreviewItem
  const certPreviewItem: PreviewItem | null = useMemo(() => {
    if (!selectedCert) return null

    const resolvedUrl = getCertificatePublicUrl(
      selectedCert.file_url || selectedCert.thumbnail_url
    )
    const isPdf = isPdfDocument(resolvedUrl)

    const mediaList: PreviewMedia[] = []
    if (resolvedUrl) {
      mediaList.push({
        url: resolvedUrl,
        caption: selectedCert.title,
        isPdf,
      })
    }

    return {
      type: 'certificate',
      headerTag: `// CREDENTIAL_LIGHTBOX · ${selectedCert.category || 'VERIFIED'}`,
      title: selectedCert.title,
      category: selectedCert.category,
      organizationOrIssuer: selectedCert.issuer,
      dateOrDuration: selectedCert.issue_date
        ? formatDate(selectedCert.issue_date, 'MMMM yyyy')
        : undefined,
      credentialId: selectedCert.credential_id,
      description: selectedCert.description,
      skills: selectedCert.skills,
      media: mediaList,
      downloadUrl: resolvedUrl,
      verificationUrl: selectedCert.verification_url,
      detailsUrl: `/certificates/${selectedCert.slug}`,
      detailsLabel: 'FULL DETAILS',
    }
  }, [selectedCert])


  const filteredCerts = useMemo(() => {
    return initialCertificates.filter((c) => {
      // Category match
      let matchCat = true
      const catLower = (c.category || '').toLowerCase()

      if (category === 'AI / ML') {
        matchCat =
          catLower.includes('ai') ||
          catLower.includes('ml') ||
          catLower.includes('machine learning') ||
          catLower.includes('deep learning')
      } else if (category === 'DEVELOPMENT') {
        matchCat =
          catLower.includes('dev') ||
          catLower.includes('web') ||
          catLower.includes('full stack') ||
          catLower.includes('front') ||
          catLower.includes('back')
      } else if (category === 'CLOUD') {
        matchCat =
          catLower.includes('cloud') ||
          catLower.includes('devops') ||
          catLower.includes('aws') ||
          catLower.includes('azure')
      } else if (category === 'PROGRAMMING') {
        matchCat =
          catLower.includes('program') ||
          catLower.includes('c++') ||
          catLower.includes('python') ||
          catLower.includes('java') ||
          catLower.includes('dsa')
      } else if (category === 'OTHER') {
        matchCat =
          !catLower.includes('ai') &&
          !catLower.includes('ml') &&
          !catLower.includes('dev') &&
          !catLower.includes('cloud') &&
          !catLower.includes('program')
      }

      // Search match
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q) ||
        (c.credential_id && c.credential_id.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.skills && c.skills.some((s) => s.toLowerCase().includes(q)))

      return matchCat && matchSearch
    })
  }, [initialCertificates, category, search])

  return (
    <div>
      {/* Category Tabs & Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '36px',
        }}
      >
        {/* Exact Categories Requested by User */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {CATEGORY_TABS.map((tab) => {
            const isActive = category === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setCategory(tab)}
                style={{
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: isActive ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search credential or skill..."
            style={{
              width: '100%',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-sm)',
              padding: '8px 34px',
              color: 'var(--color-text)',
              fontSize: '12.5px',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Certificates Count Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        <span>SHOWING {filteredCerts.length} VERIFIED CREDENTIALS</span>
        <span>DATABASE STATUS: SYNCHRONIZED</span>
      </div>

      {/* Certificates Grid */}
      {filteredCerts.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '64px 24px',
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            border: '1px dashed var(--color-border)',
          }}
        >
          <Award size={40} style={{ color: 'var(--color-accent)', margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '18px', color: 'var(--color-text)', marginBottom: '8px' }}>
            No Certificates Found
          </h3>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>
            No credentials match your filter criteria. Try adjusting the search keywords.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setCategory('ALL')
            }}
            className="btn-secondary"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
            gap: '24px',
          }}
          className="certificates-grid"
        >
          {filteredCerts.map((cert) => (
            <article
              key={cert.id}
              className="glass-card cert-card-3d"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
              }}
            >
              <div>
                {/* Certificate Preview Frame with Modal Trigger */}
                <div
                  onClick={() => setSelectedCert(cert)}
                  style={{
                    cursor: 'pointer',
                    position: 'relative',
                    marginBottom: '16px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                  }}
                  title="Click to view full preview"
                >
                  <CertificateMedia
                    fileUrl={cert.file_url}
                    thumbnailUrl={cert.thumbnail_url}
                    title={cert.title}
                    issuer={cert.issuer}
                    category={cert.category}
                    aspectRatio="16/10"
                    interactive
                  />

                  {/* Hover Overlay Hint */}
                  <div
                    className="cert-preview-hover"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(10, 12, 16, 0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: 'var(--color-accent)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <Eye size={16} />
                    <span>PREVIEW CERTIFICATE</span>
                  </div>
                </div>

                {/* Category & Date Pill */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent)',
                      background: 'var(--color-accent-bg)',
                      border: '1px solid var(--color-accent-border)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                    }}
                  >
                    {cert.category || 'CERTIFICATION'}
                  </span>

                  {cert.issue_date && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {formatDate(cert.issue_date, 'MMM yyyy')}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '17px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    marginBottom: '6px',
                    lineHeight: 1.35,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {cert.title}
                </h3>

                {/* Issuer */}
                <div
                  style={{
                    fontSize: '12.5px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '12px',
                  }}
                >
                  Issued by <strong style={{ color: 'var(--color-text)' }}>{cert.issuer}</strong>
                </div>

                {/* Credential ID */}
                {cert.credential_id && (
                  <div
                    style={{
                      fontSize: '10.5px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-muted)',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <ShieldCheck size={12} style={{ color: 'var(--color-accent)' }} />
                    <span>ID: {cert.credential_id}</span>
                  </div>
                )}

                {/* Skills Covered */}
                {cert.skills && cert.skills.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '5px',
                      marginBottom: '16px',
                    }}
                  >
                    {cert.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          fontSize: '10.5px',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-2)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Bottom Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--color-border-subtle)',
                }}
              >
                {/* View Certificate Button (Lightbox Trigger) */}
                <button
                  type="button"
                  onClick={() => setSelectedCert(cert)}
                  style={{
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 12px',
                    color: 'var(--color-accent)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.2s ease',
                  }}
                  className="hover-accent-border"
                >
                  <Eye size={12} />
                  <span>VIEW CERTIFICATE</span>
                </button>

                {cert.verification_url ? (
                  <a
                    href={cert.verification_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '11.5px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-secondary)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    className="hover-accent-text"
                  >
                    <span>Verify</span>
                    <ExternalLink size={11} />
                  </a>
                ) : (
                  <Link
                    href={`/certificates/${cert.slug}`}
                    style={{
                      fontSize: '11.5px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-secondary)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    className="hover-accent-text"
                  >
                    <span>Details</span>
                    <ArrowRight size={11} />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Unified Preview Modal */}
      <PreviewModal
        isOpen={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
        item={certPreviewItem}
      />

      <style>{`
        .cert-card-3d {
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.22s ease, box-shadow 0.22s ease !important;
        }
        .cert-card-3d:hover {
          border-color: var(--color-accent-border) !important;
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45) !important;
        }
        .cert-card-3d:hover .cert-preview-hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}
