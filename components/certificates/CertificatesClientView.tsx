'use client'

import { useState, useMemo } from 'react'
import type { Certificate } from '@/types'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Search, ExternalLink, ShieldCheck, Award, X } from 'lucide-react'
import CertificateMedia from '@/components/certificates/CertificateMedia'

interface CertificatesClientViewProps {
  initialCertificates: Certificate[]
}

const DEFAULT_CATEGORIES = [
  'AI / ML',
  'Full Stack',
  'Programming',
  'Cloud & DevOps',
  'Data',
  'Cybersecurity',
  'Other',
]

export default function CertificatesClientView({
  initialCertificates,
}: CertificatesClientViewProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  // Dynamically compute all unique categories present in actual certificates
  const categories = useMemo(() => {
    const present = new Set<string>()
    for (const c of initialCertificates) {
      if (c.category?.trim()) present.add(c.category.trim())
    }
    // Merge with defaults
    for (const def of DEFAULT_CATEGORIES) {
      present.add(def)
    }
    return ['All', ...Array.from(present)]
  }, [initialCertificates])

  const filteredCerts = useMemo(() => {
    return initialCertificates.filter((c) => {
      const matchCat = category === 'All' || c.category?.toLowerCase() === category.toLowerCase()
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
      {/* Filter & Search Bar */}
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
        {/* Category Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((cat) => {
            const isActive = cat === category
            const count =
              cat === 'All'
                ? initialCertificates.length
                : initialCertificates.filter((c) => c.category?.toLowerCase() === cat.toLowerCase()).length

            // Hide empty default categories if no certs match, unless active or 'All'
            if (count === 0 && cat !== 'All' && !isActive) return null

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: isActive ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  boxShadow: isActive ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{cat}</span>
                <span
                  style={{
                    fontSize: '10px',
                    opacity: 0.85,
                    background: isActive ? 'rgba(0,0,0,0.2)' : 'var(--color-surface-2)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search Box */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
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
            placeholder="Search title, issuer, skills..."
            style={{
              width: '100%',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-sm)',
              padding: '9px 34px 9px 34px',
              color: 'var(--color-text)',
              fontSize: '13px',
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

      {/* Certificates Grid */}
      {filteredCerts.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
          }}
        >
          <Award size={36} style={{ color: 'var(--color-accent)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', color: 'var(--color-text)', marginBottom: '8px' }}>
            No Certificates Found
          </h3>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>
            {initialCertificates.length === 0
              ? 'No certificates have been published yet.'
              : 'Try adjusting your search keywords or selecting "All" categories.'}
          </p>
          {initialCertificates.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setCategory('All')
              }}
              className="btn-secondary"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            gap: '24px',
          }}
        >
          {filteredCerts.map((cert) => (
            <article
              key={cert.id}
              className="glass-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '380px',
              }}
            >
              <div>
                {/* Certificate Document / Image Preview */}
                <Link
                  href={`/certificates/${cert.slug}`}
                  style={{ display: 'block', textDecoration: 'none', marginBottom: '20px' }}
                  aria-label={`View certificate ${cert.title}`}
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
                </Link>

                {/* Badge & Date */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent)',
                      background: 'var(--color-accent-bg)',
                      border: '1px solid var(--color-accent-border)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                    }}
                  >
                    {cert.category}
                  </span>

                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {formatDate(cert.issue_date, 'MMM yyyy')}
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    marginBottom: '8px',
                    lineHeight: 1.3,
                  }}
                >
                  <Link
                    href={`/certificates/${cert.slug}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {cert.title}
                  </Link>
                </h3>

                {/* Issuer */}
                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '14px',
                  }}
                >
                  Issued by <strong style={{ color: 'var(--color-text)' }}>{cert.issuer}</strong>
                </div>

                {/* Credential ID */}
                {cert.credential_id && (
                  <div
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-muted)',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <ShieldCheck size={13} style={{ color: 'var(--color-accent)' }} />
                    <span>ID: {cert.credential_id}</span>
                  </div>
                )}

                {/* Skills Covered */}
                {cert.skills && cert.skills.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginBottom: '20px',
                    }}
                  >
                    {cert.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          padding: '3px 8px',
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

              {/* Card Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                {cert.verification_url ? (
                  <a
                    href={cert.verification_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-accent)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Verify <ExternalLink size={11} />
                  </a>
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Verified</span>
                )}

                <Link
                  href={`/certificates/${cert.slug}`}
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  className="hover-accent-text"
                >
                  View Details →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
