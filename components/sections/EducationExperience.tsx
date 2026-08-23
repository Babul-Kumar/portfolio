'use client'

import type { Education, Experience } from '@/types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function EducationExperienceSection({
  education,
  experience,
}: {
  education: Education[]
  experience: Experience[]
}) {
  return (
    <section id="about" className="section">
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            marginBottom: '56px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '24px',
          }}
        >
          <div className="text-label" style={{ marginBottom: '12px' }}>
            01 / About & Narrative
          </div>
          <h2 className="text-display-sm">
            BUILDING WITH CURIOSITY.<br />
            LEARNING THROUGH CODE.
          </h2>
        </div>

        {/* Asymmetric Editorial Narrative & Interactive Visual Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '48px',
            marginBottom: '64px',
            alignItems: 'start',
          }}
          className="about-narrative-grid"
        >
          <div>
            <p
              style={{
                fontSize: '18px',
                color: 'var(--color-text)',
                lineHeight: 1.7,
                marginBottom: '20px',
                fontWeight: 400,
              }}
            >
              I am a Computer Science & Engineering student at <strong>Lovely Professional University</strong>,
              focused on building intelligent software where artificial intelligence, machine learning algorithms,
              and high-performance full-stack architectures meet.
            </p>
            <p
              style={{
                fontSize: '15px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.75,
                marginBottom: '28px',
              }}
            >
              From designing AST-aware AI developer tooling and predictive gradient-boosted models
              to crafting modern WebGL interactive interfaces, I believe in building software that is
              both mathematically sound and intuitively designed.
            </p>

            <Link
              href="/about"
              style={{
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-accent)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-accent-bg)',
                border: '1px solid var(--color-accent-border)',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
            >
              <span>Read Full Story</span>
              <span>→</span>
            </Link>
          </div>

          {/* Core Domains & Mini Computational Artifact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="glass-card card-3d-tilt" style={{ padding: '24px' }}>
              <div
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '6px',
                  fontWeight: 600,
                }}
              >
                01 / Intelligence
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}>
                AI & Machine Learning
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Predictive modeling, NLP tokenization, computer vision forensics, and multimodal LLM orchestration.
              </p>
            </div>

            <div className="glass-card card-3d-tilt" style={{ padding: '24px' }}>
              <div
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '6px',
                  fontWeight: 600,
                }}
              >
                02 / Architecture
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}>
                Full-Stack Systems
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Modern Next.js applications, TypeScript microservices, FastAPI REST endpoints, and resilient PostgreSQL data structures.
              </p>
            </div>
          </div>
        </div>

        {/* Education & Experience Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: experience.length > 0 ? '1fr 1fr' : '1fr',
            gap: '36px',
          }}
          className="timeline-columns"
        >
          {/* Education */}
          {education.length > 0 && (
            <div className="glass-card card-3d-tilt" style={{ padding: '32px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  marginBottom: '20px',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: '8px',
                  fontWeight: 600,
                }}
              >
                Academic Foundation
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)' }}>
                        {edu.degree}
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {formatDate(edu.start_date, 'yyyy')} — {edu.is_current ? 'Present' : formatDate(edu.end_date, 'yyyy')}
                      </span>
                    </div>

                    <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                      {edu.institution}
                    </div>

                    {edu.field && (
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        Major: {edu.field}
                      </div>
                    )}

                    {edu.grade && (
                      <div style={{ fontSize: '12px', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                        CGPA / Honors: {edu.grade}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="glass-card card-3d-tilt" style={{ padding: '32px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  marginBottom: '20px',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: '8px',
                  fontWeight: 600,
                }}
              >
                Engineering & Research Experience
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)' }}>
                        {exp.role}
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {formatDate(exp.start_date, 'MMM yyyy')} — {exp.is_current ? 'Present' : formatDate(exp.end_date, 'MMM yyyy')}
                      </span>
                    </div>

                    <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                      {exp.company} {exp.type ? `· ${exp.type}` : ''}
                    </div>

                    {exp.description && (
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
                        {exp.description}
                      </p>
                    )}

                    {exp.technologies && exp.technologies.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        {exp.technologies.map((t) => (
                          <span
                            key={t}
                            style={{
                              fontSize: '10px',
                              fontFamily: 'var(--font-mono)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--color-surface-2)',
                              border: '1px solid var(--color-border)',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .about-narrative-grid,
          .timeline-columns {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
        }
      `}</style>
    </section>
  )
}
