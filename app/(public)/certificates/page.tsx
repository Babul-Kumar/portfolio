'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Certificate } from '@/types'
import { FALLBACK_CERTIFICATES } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Search, ExternalLink, ShieldCheck, Award } from 'lucide-react'

const CATEGORIES = ['All', 'AI / ML', 'Full Stack', 'Programming', 'Cloud']

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>(FALLBACK_CERTIFICATES)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('published', true)
          .order('issue_date', { ascending: false })
        if (active && !error && data && data.length > 0) {
          setCerts(data)
        }
      } catch {
        // Fallback already set
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const filteredCerts = useMemo(() => {
    return certs.filter((c) => {
      const matchCat = category === 'All' || c.category === category
      const matchSearch =
        !search.trim() ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.issuer.toLowerCase().includes(search.toLowerCase()) ||
        (c.skills && c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())))
      return matchCat && matchSearch
    })
  }, [certs, category, search])

  return (
    <div style={{ padding: 'var(--section-gap) var(--container-pad)', minHeight: '85vh' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '56px', borderBottom: '1px solid var(--color-border)', paddingBottom: '32px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>
            Verified Specializations
          </div>
          <h1 className="text-display" style={{ maxWidth: '700px', marginBottom: '20px' }}>
            ALL<br />CERTIFICATES
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
              maxWidth: '560px',
              lineHeight: 1.65,
            }}
          >
            Verified credentials and technical specializations across Artificial Intelligence,
            Machine Learning, Deep Learning, and Modern Full-Stack Systems.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          {/* Category Chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => {
              const isActive = cat === category
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    padding: '7px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: isActive ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.03)',
                    color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills, issuers..."
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px 10px 38px',
                color: 'var(--color-text)',
                fontSize: '13px',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
            />
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
              Try adjusting your search query or selecting &quot;All&quot; categories.
            </p>
            <button
              onClick={() => {
                setSearch('')
                setCategory('All')
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {filteredCerts.map((cert) => (
              <div
                key={cert.id}
                className="glass-card"
                style={{
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '300px',
                }}
              >
                <div>
                  {/* Badge & Date */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
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
                      fontSize: '19px',
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
                      marginBottom: '16px',
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
                        marginBottom: '16px',
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                      {cert.skills.map((skill) => (
                        <span
                          key={skill}
                          style={{
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--color-border-subtle)',
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
                      Verify Credential <ExternalLink size={12} />
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
