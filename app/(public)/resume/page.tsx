import type { Metadata } from 'next'
import {
  getProfile,
  getSiteSetting,
  getSkillsByCategory,
  getEducation,
  getProjects,
} from '@/lib/data'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Download, ExternalLink, Mail, MapPin, Globe, Link2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Résumé',
  description:
    'Official curriculum vitae and resume of Babul Kumar — Computer Science, AI/ML, and Full-Stack Engineering.',
}

export const revalidate = 3600

export default async function ResumePage() {
  const [profile, resumeSetting, skillsGroup, education, projects] = await Promise.all([
    getProfile(),
    getSiteSetting('resume_url'),
    getSkillsByCategory(),
    getEducation(),
    getProjects({ featured: true, limit: 4 }),
  ])

  const resumeUrl = resumeSetting || profile?.resume_url || null

  return (
    <div style={{ padding: 'var(--section-gap) var(--container-pad)', minHeight: '85vh' }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>
        {/* Top Header & Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '24px',
            marginBottom: '48px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '28px',
          }}
        >
          <div>
            <div className="text-label" style={{ marginBottom: '12px' }}>
              Curriculum Vitae
            </div>
            <h1 className="text-display-sm" style={{ color: 'var(--color-text)' }}>
              RÉSUMÉ
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {resumeUrl ? (
              <>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="btn-primary"
                >
                  <Download size={14} /> Download PDF
                </a>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                >
                  <ExternalLink size={14} /> Open in New Tab
                </a>
              </>
            ) : (
              <Link
                href="/contact"
                className="btn-primary"
              >
                Request Updated PDF →
              </Link>
            )}
          </div>
        </div>

        {/* Clean Resume Document Sheet */}
        <div
          className="glass-card"
          style={{
            padding: 'clamp(28px, 6vw, 56px)',
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
                  style={{ color: 'var(--color-accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Globe size={13} /> github.com/babul-kumar
                </a>
              )}
              {profile?.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--color-accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
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
      </div>
    </div>
  )
}
