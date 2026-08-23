'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import type { Certificate } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate, debounce, groupBy, getYear } from '@/lib/utils'
import { Search, X, ExternalLink, ShieldCheck, Eye, Download, Layers } from 'lucide-react'

// Lazy load 3D scene
const CertificateStackScene = dynamic(
  () => import('@/components/3d/CertificateStackScene'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at center, var(--color-surface) 0%, transparent 70%)',
          borderRadius: '12px',
        }}
      >
        <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
          Loading 3D Archive…
        </div>
      </div>
    ),
  }
)

const CATEGORIES = [
  'All',
  'AI / ML',
  'Full Stack',
  'Programming',
  'Cloud',
  'Data',
  'Cybersecurity',
  'Hackathon',
  'Other',
]

const DOMAIN_TAGS = [
  'AI / ML',
  'FULL STACK',
  'COMPUTER VISION',
  'GENERATIVE AI',
  'DEEP LEARNING',
  'SOFTWARE ARCHITECTURE',
  'CLOUD SYSTEMS',
  'NATURAL LANGUAGE PROCESSING',
  'NEURAL NETWORKS',
  'POSTGRESQL & SQL',
]

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)

  const mouse = useRef({ x: 0, y: 0 })
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)

    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const fetchCerts = useCallback(
    async (searchVal: string, cat: string, sort: 'newest' | 'oldest') => {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from('certificates')
        .select('*')
        .eq('published', true)
        .order('issue_date', { ascending: sort === 'oldest' })

      if (cat !== 'All') query = query.eq('category', cat)
      if (searchVal.trim()) {
        query = query.or(`title.ilike.%${searchVal}%,issuer.ilike.%${searchVal}%`)
      }

      const { data } = await query
      setCerts(data ?? [])
      setLoading(false)
    },
    []
  )

  const debouncedFetch = useCallback(
    debounce((s: string) => fetchCerts(s, category, sortOrder), 250),
    [category, sortOrder, fetchCerts]
  )

  useEffect(() => {
    fetchCerts('', 'All', 'newest')
  }, [fetchCerts])

  useEffect(() => {
    debouncedFetch(search)
  }, [search, debouncedFetch])

  useEffect(() => {
    fetchCerts(search, category, sortOrder)
  }, [category, sortOrder])

  // Group by year for the exhibition section
  const certsByYear = groupBy(certs, (c) => (c.issue_date ? getYear(c.issue_date) : 'Undated'))
  const years = Object.keys(certsByYear).sort((a, b) =>
    sortOrder === 'newest' ? b.localeCompare(a) : a.localeCompare(b)
  )

  return (
    <div style={{ minHeight: '90vh', position: 'relative' }}>
      {/* ============================================================
          HERO SECTION — Two-Column Asymmetric Composition
          ============================================================ */}
      <section
        style={{
          padding: '48px var(--container-pad) 40px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '48px',
            alignItems: 'center',
          }}
          className="hero-archive-grid"
        >
          {/* Left Column: Metadata, Title, Description, Search Controls */}
          <div>
            {/* Archival metadata badges */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '20px',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-accent)',
                  padding: '3px 8px',
                  borderRadius: '3px',
                  fontWeight: 600,
                }}
              >
                ARCHIVE / 001
              </span>
              <span
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                }}
              >
                PERSONAL CREDENTIALS
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-border)' }}>·</span>
              <span
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                }}
              >
                CATALOG 2026
              </span>
            </div>

            {/* Responsive Balanced Headline */}
            <h1
              style={{
                fontSize: 'clamp(36px, 5.5vw, 68px)',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                lineHeight: 0.98,
                color: 'var(--color-text)',
                marginBottom: '20px',
              }}
            >
              CERTIFICATE<br />
              <span style={{ color: 'var(--color-accent)' }}>ARCHIVE</span>
            </h1>

            {/* Narrative Subtitle */}
            <p
              style={{
                fontSize: 'clamp(14px, 1.2vw, 16px)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.65,
                maxWidth: '480px',
                marginBottom: '32px',
              }}
            >
              A curated physical & digital record of academic milestones, verified professional
              certifications, and technical specializations across AI, Machine Learning, and Software
              Engineering.
            </p>

            {/* Controls Bar: Search + Sort */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              {/* Search Box */}
              <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search credentials, skills, or issuers…"
                  style={{
                    width: '100%',
                    paddingLeft: '36px',
                    paddingRight: search ? '36px' : '14px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: 'var(--color-text)',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      padding: '2px',
                    }}
                    title="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Sort Order Selector */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  letterSpacing: '0.04em',
                  color: 'var(--color-text)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.04em',
                    padding: '5px 11px',
                    border: `1px solid ${cat === category ? 'var(--color-text)' : 'var(--color-border)'}`,
                    borderRadius: '3px',
                    background: cat === category ? 'var(--color-text)' : 'transparent',
                    color: cat === category ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                  className={cat !== category ? 'hover-border-accent' : ''}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive 3D Physical Certificate Stack */}
          <div
            style={{
              height: 'clamp(280px, 32vw, 440px)',
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
            className="hero-3d-box"
          >
            {!reducedMotion ? (
              <CertificateStackScene mouse={mouse} />
            ) : (
              /* Fallback static geometric certificate stack illustration */
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '24px',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Layers size={36} style={{ color: 'var(--color-accent)', margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>
                    Archival Document Stack
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    {certs.length} Catalogued Credentials
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          HORIZONTAL MARQUEE RIBBON — Subtle Textural Movement
          ============================================================ */}
      <div
        style={{
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          padding: '10px 0',
        }}
      >
        <div className="marquee-container">
          <div className="marquee-track">
            {[...DOMAIN_TAGS, ...DOMAIN_TAGS].map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <span>{tag}</span>
                <span style={{ color: 'var(--color-accent)', fontSize: '12px' }}>◈</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          PHYSICAL EXHIBITION ARCHIVE — Grouped by Year
          ============================================================ */}
      <section style={{ padding: '60px var(--container-pad) 100px' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          {/* Section Summary Counter */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '48px',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              {loading ? (
                'Indexing archive catalog…'
              ) : (
                <>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>01</span> /{' '}
                  <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                    {certs.length.toString().padStart(2, '0')}
                  </span>{' '}
                  Verified Credentials Found
                </>
              )}
            </div>

            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  color: 'var(--color-accent)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Clear filter &quot;{search}&quot;
              </button>
            )}
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: '280px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>
          ) : certs.length === 0 ? (
            /* Museum Empty State */
            <div
              style={{
                textAlign: 'center',
                padding: '96px 24px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                maxWidth: '680px',
                margin: '40px auto',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--color-accent)' }}>
                ◇
              </div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  color: 'var(--color-text)',
                  marginBottom: '8px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                No Documents Match Filter
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '24px',
                  maxWidth: '400px',
                  margin: '0 auto 24px',
                }}
              >
                No certificate records match your current query. Try adjusting your search term or category
                filter.
              </p>
              <button
                onClick={() => {
                  setSearch('')
                  setCategory('All')
                }}
                style={{
                  background: 'var(--color-text)',
                  color: 'var(--color-bg)',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Exhibition Chronological Sections */
            <div>
              {years.map((year) => {
                const yearCerts = certsByYear[year]
                if (!yearCerts || yearCerts.length === 0) return null

                return (
                  <div key={year} style={{ marginBottom: '64px' }}>
                    {/* Year Exhibition Header */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        alignItems: 'center',
                        gap: '24px',
                        marginBottom: '28px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 'clamp(20px, 3vw, 28px)',
                          fontWeight: 500,
                          color: 'var(--color-text)',
                          letterSpacing: '-0.02em',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {year}
                      </div>
                      <div style={{ height: '1px', background: 'var(--color-border)', width: '100%' }} />
                    </div>

                    {/* Exhibition Document Cards Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '24px',
                      }}
                    >
                      {yearCerts.map((cert, index) => (
                        <DocumentExhibitionCard
                          key={cert.id}
                          cert={cert}
                          index={index + 1}
                          onQuickView={() => setSelectedCert(cert)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          IN-PLACE DOCUMENT QUICK-VIEW MODAL
          ============================================================ */}
      {selectedCert && (
        <CertificateQuickViewModal
          cert={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}

      <style>{`
        @media (max-width: 900px) {
          .hero-archive-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .hero-3d-box {
            height: 300px !important;
          }
        }
      `}</style>
    </div>
  )
}

/* ============================================================
   SUB-COMPONENT: Physical Exhibition Document Card
   ============================================================ */
function DocumentExhibitionCard({
  cert,
  index,
  onQuickView,
}: {
  cert: Certificate
  index: number
  onQuickView: () => void
}) {
  return (
    <article
      className="document-card"
      style={{
        borderRadius: '6px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
      data-cursor-label="VIEW"
    >
      {/* Top Bar: Index number & Category */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--color-surface-2)',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.08em',
          }}
        >
          {index.toString().padStart(2, '0')} ──
        </span>
        <span
          style={{
            fontSize: '10px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            fontWeight: 600,
          }}
        >
          {cert.category}
        </span>
      </div>

      {/* Paper Document Preview Thumbnail */}
      <div
        onClick={onQuickView}
        style={{
          height: '180px',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {cert.thumbnail_url ? (
          <Image
            src={cert.thumbnail_url}
            alt={cert.title}
            width={440}
            height={180}
            style={{ objectFit: 'cover', width: '100%', height: '100%', transition: 'transform 0.4s ease' }}
          />
        ) : (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              border: '1px dashed var(--color-border)',
              borderRadius: '4px',
              margin: '16px',
              width: 'calc(100% - 32px)',
              height: 'calc(100% - 32px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'var(--color-surface-2)',
            }}
          >
            <ShieldCheck size={28} style={{ color: 'var(--color-accent)', marginBottom: '8px', opacity: 0.8 }} />
            <span style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              Verified Document
            </span>
          </div>
        )}

        {/* Floating Quick-Look Button */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(17, 17, 17, 0.85)',
            backdropFilter: 'blur(6px)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '3px',
            fontSize: '10px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Eye size={11} /> Quick View
        </div>
      </div>

      {/* Bottom Information */}
      <div style={{ padding: '18px 16px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 500,
              color: 'var(--color-text)',
              lineHeight: 1.35,
              marginBottom: '6px',
              letterSpacing: '-0.01em',
            }}
          >
            <Link
              href={`/certificates/${cert.slug}`}
              className="hover-text-accent"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {cert.title}
            </Link>
          </h3>

          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
            {cert.issuer} {cert.issue_date ? `· ${formatDate(cert.issue_date, 'MMM yyyy')}` : ''}
          </div>

          {/* Skill chips */}
          {cert.skills && cert.skills.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {cert.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  style={{
                    fontSize: '10px',
                    padding: '2px 7px',
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '2px',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {skill}
                </span>
              ))}
              {cert.skills.length > 3 && (
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', padding: '2px 4px' }}>
                  +{cert.skills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--color-border-subtle)',
            paddingTop: '12px',
            marginTop: '8px',
          }}
        >
          <Link
            href={`/certificates/${cert.slug}`}
            className="hover-text-accent"
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text)',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Explore Document ↗
          </Link>

          {cert.verification_url && (
            <a
              href={cert.verification_url}
              target="_blank"
              rel="noreferrer"
              title="Verify with issuer"
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
              className="hover-text-accent"
            >
              Verify <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

/* ============================================================
   SUB-COMPONENT: In-Place Full Document Quick-View Modal
   ============================================================ */
function CertificateQuickViewModal({
  cert,
  onClose,
}: {
  cert: Certificate
  onClose: () => void
}) {
  const isPDF = cert.file_url?.toLowerCase().endsWith('.pdf')

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(10, 10, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          maxWidth: '960px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
        }}
        className="modal-container-grid"
      >
        {/* Left: Document View Area */}
        <div
          style={{
            background: 'var(--color-surface-2)',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid var(--color-border)',
            minHeight: '380px',
          }}
        >
          {cert.thumbnail_url ? (
            <img
              src={cert.thumbnail_url}
              alt={cert.title}
              style={{
                maxWidth: '100%',
                maxHeight: '440px',
                objectFit: 'contain',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}
            />
          ) : isPDF && cert.file_url ? (
            <iframe
              src={`${cert.file_url}#view=Fit`}
              style={{ width: '100%', height: '420px', border: 'none', borderRadius: '4px' }}
              title={cert.title}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <ShieldCheck size={48} style={{ color: 'var(--color-accent)', margin: '0 auto 12px' }} />
              <div style={{ fontSize: '13px', color: 'var(--color-text)' }}>Official Credential</div>
            </div>
          )}
        </div>

        {/* Right: Metadata & Details */}
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <span
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                }}
              >
                {cert.category}
              </span>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '4px',
                }}
                className="hover-text-accent"
              >
                <X size={18} />
              </button>
            </div>

            <h2
              style={{
                fontSize: '22px',
                fontWeight: 500,
                color: 'var(--color-text)',
                lineHeight: 1.25,
                marginBottom: '8px',
                letterSpacing: '-0.02em',
              }}
            >
              {cert.title}
            </h2>

            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              {cert.issuer} {cert.issue_date ? `· ${formatDate(cert.issue_date, 'MMMM yyyy')}` : ''}
            </div>

            {/* Description */}
            {cert.description && (
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: '24px' }}>
                {cert.description}
              </p>
            )}

            {/* Credential ID */}
            {cert.credential_id && (
              <div style={{ marginBottom: '20px', background: 'var(--color-surface)', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '3px' }}>
                  Credential Identifier
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--color-text)' }}>
                  {cert.credential_id}
                </div>
              </div>
            )}

            {/* Skills */}
            {cert.skills && cert.skills.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  Skills Covered
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {cert.skills.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '3px',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
            {cert.verification_url && (
              <a
                href={cert.verification_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--color-accent)',
                  color: '#fff',
                  padding: '10px 18px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  letterSpacing: '0.04em',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Verify Credential ↗
              </a>
            )}
            {cert.file_url && (
              <a
                href={cert.file_url}
                target="_blank"
                rel="noreferrer"
                download
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  padding: '10px 16px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  textDecoration: 'none',
                }}
                className="hover-border-primary"
              >
                <Download size={13} /> Download
              </a>
            )}
            <Link
              href={`/certificates/${cert.slug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                padding: '10px 16px',
                borderRadius: '4px',
                fontSize: '12px',
                textDecoration: 'none',
              }}
              className="hover-border-primary"
            >
              Permanent View →
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .modal-container-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
