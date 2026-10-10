'use client'

import { useState, useEffect } from 'react'
import type { Profile, Education, Project, SkillsByCategory } from '@/types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import {
  Download,
  ExternalLink,
  Mail,
  MapPin,
  Globe,
  Link2,
  Maximize2,
  Info,
  Sparkles,
} from 'lucide-react'
import PreviewModal, { type PreviewItem } from '@/components/ui/PreviewModal'

interface ResumeClientViewProps {
  profile: Profile | null
  resumeUrl: string | null
  education: Education[]
  projects: Project[]
  skillsGroup: SkillsByCategory
}

export default function ResumeClientView({
  profile,
  resumeUrl,
  education,
  projects,
  skillsGroup,
}: ResumeClientViewProps) {
  // Default to PDF view if an official resume is uploaded, otherwise Web CV
  const [viewMode, setViewMode] = useState<'pdf' | 'web'>(resumeUrl ? 'pdf' : 'web')
  const [previewModalOpen, setPreviewModalOpen] = useState(false)

  // Default the résumé page to the warm light theme matching the reference design
  useEffect(() => {
    const userTheme = localStorage.getItem('theme')
    if (userTheme !== 'dark') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else if (!sessionStorage.getItem('resume_theme_initialized')) {
      document.documentElement.setAttribute('data-theme', 'light')
      sessionStorage.setItem('resume_theme_initialized', 'true')
    }

    return () => {
      if (userTheme === 'dark' && sessionStorage.getItem('resume_theme_initialized') === 'true') {
        const currentTheme = document.documentElement.getAttribute('data-theme')
        if (currentTheme === 'light') {
          document.documentElement.setAttribute('data-theme', 'dark')
        }
      }
    }
  }, [])

  // Preview modal configuration for full-screen lightbox inspection
  const previewItem: PreviewItem | null = resumeUrl
    ? {
        type: 'certificate',
        headerTag: '// OFFICIAL_RESUME_CREDENTIAL',
        title: `${profile?.name || 'Babul Kumar'} — Official Curriculum Vitae`,
        category: 'RESUME_DOCUMENT',
        organizationOrIssuer: 'Babul Kumar // Professional Portfolio',
        dateOrDuration: 'Current',
        verificationUrl: resumeUrl,
        downloadUrl: resumeUrl,
        skills: ['Computer Science', 'AI / ML', 'Full-Stack Development'],
        media: [
          {
            url: resumeUrl,
            caption: 'Official Resume PDF Document',
            isPdf: true,
          },
        ],
      }
    : null

  return (
    <div className="resume-container">
      {/* 1. Page Header matching Reference Design */}
      <div className="resume-header-row">
        <div className="resume-title-group">
          <h1 className="resume-heading">RÉSUMÉ</h1>
          <div className="resume-specialty-badge">
            Applied AI/ML &amp; Scalable Systems Engineering
          </div>
        </div>

        {/* Live Document Status Badge */}
        {resumeUrl && (
          <div className="resume-status-badge" title="Live verified document stream from Supabase storage">
            <span className="resume-status-dot" />
            <span>LIVE_DOCUMENT_STREAM</span>
          </div>
        )}
      </div>

      {/* 2. Compact Document Toolbar */}
      <div className="resume-toolbar">
        {/* Left: Document Mode Switcher */}
        <div className="resume-toolbar-group">
          {resumeUrl && (
            <button
              type="button"
              onClick={() => setViewMode('pdf')}
              className={`resume-btn ${viewMode === 'pdf' ? 'resume-btn-pdf' : 'resume-btn-neutral'}`}
              aria-pressed={viewMode === 'pdf'}
            >
              <span>[ Preview PDF ]</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setViewMode('web')}
            className={`resume-btn ${viewMode === 'web' ? 'resume-btn-pdf' : 'resume-btn-neutral'}`}
            aria-pressed={viewMode === 'web'}
          >
            <span>[ Web Version ]</span>
          </button>
        </div>

        {/* Right: Actions (Full Screen, New Tab, Download) */}
        <div className="resume-toolbar-group">
          {resumeUrl ? (
            <>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(true)}
                className="resume-btn resume-btn-neutral"
                title="Open full-screen document viewer"
              >
                <span>Full Screen</span>
                <Maximize2 size={13} style={{ strokeWidth: 2 }} />
              </button>

              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="resume-btn resume-btn-neutral"
                title="Open original PDF in a new browser tab"
                aria-label="Open PDF in new tab"
                style={{ padding: '7px 11px' }}
              >
                <ExternalLink size={13} />
              </a>

              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                download="Babul_Kumar_Resume.pdf"
                className="resume-btn resume-btn-download"
                title="Download official PDF copy"
              >
                <Download size={13} />
                <span>Download PDF</span>
              </a>
            </>
          ) : (
            <Link
              href="/contact"
              className="resume-btn resume-btn-pdf"
            >
              <span>Request PDF Copy →</span>
            </Link>
          )}
        </div>
      </div>

      {/* 3. PDF Embedded Viewer (Matching Dark Frame with Centered PDF) */}
      {viewMode === 'pdf' && resumeUrl && (
        <>
          <div className="resume-viewer-frame">
            {/* Header Status Bar inside Dark Container */}
            <div className="resume-viewer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D9512B', fontWeight: 500 }}>
                <Info size={12} />
                <span>LIVE_DOCUMENT // SUB_BASIN_STORAGE_VERIFIED</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8F756C' }}>
                <Sparkles size={11} style={{ color: '#D9512B' }} />
                <span>Interactive Document Stream</span>
              </div>
            </div>

            {/* Dark Viewing Area with Centered PDF Presentation */}
            <div className="resume-viewer-body">
              <iframe
                src={`${resumeUrl}#toolbar=0&navpanes=0&view=FitH`}
                title="Babul Kumar Résumé Document"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                  backgroundColor: '#13151A',
                }}
              />
            </div>
          </div>

          {/* Understated Fallback Link */}
          <div className="resume-fallback-bar">
            <span>Having trouble?</span>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="resume-fallback-link"
            >
              Open in Viewer
            </a>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* 2. STRUCTURED WEB CV (HTML SHEET) */}
      {/* ============================================================ */}
      {viewMode === 'web' && (
        <div
          className="glass-card"
          style={{
            padding: 'clamp(28px, 6vw, 56px)',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Header */}
          <div
            style={{
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '28px',
              marginBottom: '36px',
            }}
          >
            <h2
              style={{
                fontSize: '32px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--color-text)',
                marginBottom: '6px',
              }}
            >
              {profile?.name ?? 'Babul Kumar'}
            </h2>
            <div
              style={{
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-accent)',
                fontWeight: 500,
                letterSpacing: '0.04em',
                marginBottom: '16px',
              }}
            >
              {profile?.tagline ?? 'Computer Science & Engineering · AI/ML · Full-Stack Development'}
            </div>
            <div
              style={{
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
              }}
            >
              {profile?.email && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={13} style={{ color: 'var(--color-accent)' }} /> {profile.email}
                </span>
              )}
              {profile?.location && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} style={{ color: 'var(--color-accent)' }} /> {profile.location}
                </span>
              )}
              {profile?.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: 'var(--color-accent)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Globe size={13} /> github.com/babul-kumar
                </a>
              )}
              {profile?.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: 'var(--color-accent)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Link2 size={13} /> LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Profile Summary */}
          <section style={{ marginBottom: '36px' }}>
            <h3
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: '14px',
                borderBottom: '1px solid var(--color-border-subtle)',
                paddingBottom: '6px',
              }}
            >
              Professional Summary
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.75 }}>
              {profile?.bio ??
                'Computer Science student with strong foundations in Artificial Intelligence, Machine Learning algorithms, and Full-Stack Web Development. Proven track record building end-to-end applications, developer tooling, and intelligent predictive models.'}
            </p>
          </section>

          {/* Education */}
          <section style={{ marginBottom: '36px' }}>
            <h3
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: '16px',
                borderBottom: '1px solid var(--color-border-subtle)',
                paddingBottom: '6px',
              }}
            >
              Academic Background
            </h3>
            {education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '18px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text)' }}>
                    {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                  </div>
                  <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                    {formatDate(edu.start_date, 'yyyy')} —{' '}
                    {edu.is_current ? 'Present' : formatDate(edu.end_date, 'yyyy')}
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  {edu.institution} {edu.grade ? `· Grade: ${edu.grade}` : ''}
                </div>
              </div>
            ))}
          </section>

          {/* Key Projects */}
          <section style={{ marginBottom: '36px' }}>
            <h3
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: '16px',
                borderBottom: '1px solid var(--color-border-subtle)',
                paddingBottom: '6px',
              }}
            >
              Featured Technical Projects
            </h3>
            {projects.map((proj) => (
              <div key={proj.id} style={{ marginBottom: '22px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text)' }}>
                    {proj.title}{' '}
                    <span style={{ fontSize: '11px', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
                      [{proj.category}]
                    </span>
                  </div>
                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-accent)',
                        textDecoration: 'none',
                      }}
                    >
                      Repository ↗
                    </a>
                  )}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                    marginTop: '4px',
                  }}
                >
                  {proj.short_desc}
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Stack: {proj.technologies.join(', ')}
                </div>
              </div>
            ))}
          </section>

          {/* Technical Skills */}
          <section>
            <h3
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: '16px',
                borderBottom: '1px solid var(--color-border-subtle)',
                paddingBottom: '6px',
              }}
            >
              Technical Core Competencies
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                fontSize: '13px',
              }}
            >
              {Object.entries(skillsGroup).map(([cat, skills]) => (
                <div key={cat}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px', fontSize: '13px' }}>
                    {cat}:
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px', lineHeight: 1.6 }}>
                    {skills.map((s) => s.name).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Lightbox Preview Modal for Fullscreen Document Review */}
      {previewItem && (
        <PreviewModal
          isOpen={previewModalOpen}
          item={previewItem}
          onClose={() => setPreviewModalOpen(false)}
        />
      )}
    </div>
  )
}
