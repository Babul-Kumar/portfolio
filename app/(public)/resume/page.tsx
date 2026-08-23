import type { Metadata } from 'next'
import { getProfile, getSiteSetting, getSkillsByCategory, getEducation, getExperience, getProjects } from '@/lib/data'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Résumé',
  description: 'Official curriculum vitae and resume of Babul Kumar — Computer Science, AI/ML, and Full-Stack Engineering.',
}

export const revalidate = 3600

export default async function ResumePage() {
  const [profile, resumeSetting, skillsGroup, education, experience, projects] = await Promise.all([
    getProfile(),
    getSiteSetting('resume_url'),
    getSkillsByCategory(),
    getEducation(),
    getExperience(),
    getProjects({ featured: true, limit: 4 }),
  ])

  const resumeUrl = resumeSetting || profile?.resume_url || null

  return (
    <div style={{ padding: 'var(--section-gap) var(--container-pad)', minHeight: '80vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Top Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '64px',
        }}>
          <div>
            <div className="text-label" style={{ marginBottom: '12px' }}>Curriculum Vitae</div>
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
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--color-text)',
                    color: 'var(--color-bg)',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  ↓ Download PDF
                </a>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                    padding: '12px 20px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    textDecoration: 'none',
                  }}
                >
                  Open in New Tab ↗
                </a>
              </>
            ) : (
              <Link
                href="/contact"
                style={{
                  background: 'var(--color-accent)',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Request Latest PDF →
              </Link>
            )}
          </div>
        </div>

        {/* Formatted Clean Resume Sheet */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: 'clamp(28px, 6vw, 64px)',
          boxShadow: 'var(--shadow-md)',
        }}>
          {/* Header */}
          <div style={{ borderBottom: '2px solid var(--color-text)', paddingBottom: '24px', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-text)', marginBottom: '6px' }}>
              {profile?.name ?? 'Babul Kumar'}
            </h2>
            <div style={{ fontSize: '14px', color: 'var(--color-accent)', fontWeight: 500, letterSpacing: '0.04em', marginBottom: '12px' }}>
              {profile?.tagline ?? 'Computer Science & Engineering · AI/ML · Full-Stack Development'}
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {profile?.email && <span>✉ {profile.email}</span>}
              {profile?.location && <span>📍 {profile.location}</span>}
              {profile?.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  github.com/babul-kumar
                </a>
              )}
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Summary */}
          <section style={{ marginBottom: '36px' }}>
            <h3 style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
              Profile Summary
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              {profile?.bio ?? 'Computer Science student with strong foundations in Artificial Intelligence, Machine Learning algorithms, and Full-Stack Web Development. Proven track record building end-to-end applications, developer tooling, and intelligent predictive models.'}
            </p>
          </section>

          {/* Education */}
          <section style={{ marginBottom: '36px' }}>
            <h3 style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
              Education
            </h3>
            {education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontWeight: 500, fontSize: '15px', color: 'var(--color-text)' }}>
                    {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {formatDate(edu.start_date, 'yyyy')} — {edu.is_current ? 'Present' : formatDate(edu.end_date, 'yyyy')}
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  {edu.institution} {edu.grade ? `· CGPA/Grade: ${edu.grade}` : ''}
                </div>
              </div>
            ))}
          </section>

          {/* Selected Technical Projects */}
          <section style={{ marginBottom: '36px' }}>
            <h3 style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
              Selected Projects
            </h3>
            {projects.map((proj) => (
              <div key={proj.id} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontWeight: 500, fontSize: '15px', color: 'var(--color-text)' }}>
                    {proj.title} <span style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 400 }}>[{proj.category}]</span>
                  </div>
                  {proj.github_url && (
                    <a href={proj.github_url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                      Code ↗
                    </a>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginTop: '4px' }}>
                  {proj.short_desc}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Tech: {proj.technologies.join(', ')}
                </div>
              </div>
            ))}
          </section>

          {/* Technical Skills */}
          <section>
            <h3 style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
              Technical Skills
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '13px' }}>
              {Object.entries(skillsGroup).map(([category, skills]) => (
                <div key={category}>
                  <div style={{ fontWeight: 500, color: 'var(--color-text)', marginBottom: '4px' }}>{category}:</div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
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
