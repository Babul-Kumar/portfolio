'use client'

import { useState } from 'react'
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
  FileText,
  Code2,
  Maximize2,
  CheckCircle2,
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
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Top Controls & View Mode Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* View Mode Toggle */}
        <div
          style={{
            display: 'inline-flex',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '4px',
            gap: '4px',
          }}
        >
          {resumeUrl && (
            <button
              type="button"
              onClick={() => setViewMode('pdf')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: viewMode === 'pdf' ? 'var(--color-accent)' : 'transparent',
                color: viewMode === 'pdf' ? '#FFFFFF' : 'var(--color-text-secondary)',
                boxShadow: viewMode === 'pdf' ? '0 2px 10px rgba(228, 93, 44, 0.35)' : 'none',
              }}
            >
              <FileText size={14} />
              <span>OFFICIAL PDF RESUME</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setViewMode('web')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: viewMode === 'web' ? 'var(--color-accent)' : 'transparent',
              color: viewMode === 'web' ? '#FFFFFF' : 'var(--color-text-secondary)',
              boxShadow: viewMode === 'web' ? '0 2px 10px rgba(228, 93, 44, 0.35)' : 'none',
            }}
          >
            <Code2 size={14} />
            <span>STRUCTURED WEB CV</span>
          </button>
        </div>

        {/* Global Actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {resumeUrl ? (
            <>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(true)}
                className="btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  padding: '8px 14px',
                }}
                title="Open Fullscreen Lightbox Preview"
              >
                <Maximize2 size={13} />
                <span>Fullscreen</span>
              </button>

              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  padding: '8px 14px',
                }}
              >
                <ExternalLink size={13} />
                <span>New Tab</span>
              </a>

              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                download="Babul_Kumar_Resume.pdf"
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  padding: '8px 16px',
                }}
              >
                <Download size={13} />
                <span>Download PDF</span>
              </a>
            </>
          ) : (
            <Link
              href="/contact"
              className="btn-primary"
              style={{ fontSize: '12px', padding: '8px 16px' }}
            >
              Request PDF Copy →
            </Link>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. PDF DOCUMENT EMBEDDED VIEWER */}
      {/* ============================================================ */}
      {viewMode === 'pdf' && resumeUrl && (
        <div
          style={{
            position: 'relative',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(228, 93, 44, 0.1)',
          }}
        >
          {/* Cyber Header Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 18px',
              background: 'rgba(10, 12, 18, 0.95)',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)' }}>
              <CheckCircle2 size={13} />
              <span>LIVE_DOCUMENT // SUPABASE_STORAGE_VERIFIED</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={11} style={{ color: 'var(--color-accent)' }} /> Interactive Document Stream
              </span>
            </div>
          </div>

          {/* PDF Viewer Container */}
          <div
            style={{
              width: '100%',
              height: 'clamp(620px, 82vh, 980px)',
              background: '#0d1117',
              position: 'relative',
            }}
          >
            <iframe
              src={`${resumeUrl}#toolbar=0&navpanes=0&view=FitH`}
              title="Babul Kumar Resume Document"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>

          {/* Quick Footer Action strip */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 20px',
              background: 'var(--color-surface)',
              borderTop: '1px solid var(--color-border)',
              fontSize: '12px',
            }}
          >
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Having trouble rendering the preview?
            </span>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'var(--color-accent)',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Open PDF in Dedicated Viewer <ExternalLink size={12} />
            </a>
          </div>
        </div>
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
