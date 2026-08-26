'use client'

import type { Education, Experience } from '@/types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Brain, Server, Terminal, Sparkles, GraduationCap, Briefcase, ArrowRight } from 'lucide-react'

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
            marginBottom: '40px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '20px',
          }}
        >
          <div className="text-label" style={{ marginBottom: '8px' }}>
            01 / Narrative & Engineering Focus
          </div>
          <h2 className="text-display-sm">
            I BUILD SYSTEMS THAT TURN<br />
            <span style={{ color: 'var(--color-accent)' }}>MATHEMATICAL IDEAS</span> INTO RESILIENT PRODUCTS.
          </h2>
        </div>

        {/* Narrative & 3-Domain Engineering Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1.3fr',
            gap: 'clamp(28px, 4vw, 48px)',
            marginBottom: '44px',
            alignItems: 'start',
          }}
          className="about-narrative-grid"
        >
          {/* Left: Bio Narrative */}
          <div>
            <p
              style={{
                fontSize: '17px',
                color: 'var(--color-text)',
                lineHeight: 1.65,
                marginBottom: '16px',
                fontWeight: 500,
              }}
            >
              I am a Computer Science & Engineering undergraduate at <strong>Lovely Professional University</strong>,
              focused on engineering intelligent systems where artificial intelligence, machine learning algorithms,
              and high-performance full-stack architectures converge.
            </p>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.7,
                marginBottom: '24px',
              }}
            >
              From designing AST-aware AI developer tooling (like <em>BotBro</em>) and predictive gradient-boosted models
              to building type-safe cloud systems, I care deeply about writing software that is mathematically sound,
              architecturally clean, and intuitively usable.
            </p>

            {/* Currently Exploring Callout Badge */}
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-sm)',
                padding: '14px 18px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'var(--color-accent-bg)',
                  border: '1px solid var(--color-accent-border)',
                  color: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Current Research Focus
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text)', fontWeight: 500 }}>
                  Multi-Agent Model Context Protocol (MCP) & AST Code Generation
                </div>
              </div>
            </div>

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
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              <span>Read Comprehensive Story</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Right: 3-Domain Technical Capabilities Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="glass-card card-3d-tilt" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ color: 'var(--color-accent)' }}>
                  <Brain size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', textTransform: 'uppercase', fontWeight: 600 }}>
                    01 / Intelligence
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                    AI & Machine Learning Engineering
                  </h4>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Predictive tabular modeling (XGBoost, Random Forests), NLP tokenization, frequency-domain computer vision forensics, and neural network fine-tuning with PyTorch.
              </p>
            </div>

            <div className="glass-card card-3d-tilt" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ color: 'var(--color-accent-teal)' }}>
                  <Server size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent-teal)', textTransform: 'uppercase', fontWeight: 600 }}>
                    02 / Architecture
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                    Full-Stack & Distributed Systems
                  </h4>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Next.js App Router, TypeScript microservices, FastAPI REST APIs, relational PostgreSQL schemas with Supabase, and WebGL interactive interfaces.
              </p>
            </div>

            <div className="glass-card card-3d-tilt" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ color: 'var(--color-accent)' }}>
                  <Terminal size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', textTransform: 'uppercase', fontWeight: 600 }}>
                    03 / Tooling & Agents
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                    AST-Aware Developer Tooling & MCP
                  </h4>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Autonomous coding agents, AST semantic code mutation, Model Context Protocol (MCP) server implementations, and intelligent developer workflows.
              </p>
            </div>
          </div>
        </div>

        {/* Dual-Rail Academic & Engineering Timeline */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: experience.length > 0 ? '1fr 1fr' : '1fr',
            gap: '28px',
          }}
          className="timeline-columns"
        >
          {/* Academic Foundation */}
          {education.length > 0 && (
            <div className="glass-card card-3d-tilt" style={{ padding: '28px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  marginBottom: '18px',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: '10px',
                  fontWeight: 600,
                }}
              >
                <GraduationCap size={15} /> Academic Foundation
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {education.map((edu) => (
                  <div key={edu.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                        {edu.degree}
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {formatDate(edu.start_date, 'yyyy')} — {edu.is_current ? 'Present' : formatDate(edu.end_date, 'yyyy')}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 500 }}>
                      {edu.institution}
                    </div>

                    {edu.field && (
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        Specialization: {edu.field}
                      </div>
                    )}

                    {edu.grade && (
                      <div style={{ fontSize: '11px', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                        Honors / Grade: {edu.grade}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Engineering Experience */}
          {experience.length > 0 && (
            <div className="glass-card card-3d-tilt" style={{ padding: '28px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent-teal)',
                  marginBottom: '18px',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: '10px',
                  fontWeight: 600,
                }}
              >
                <Briefcase size={15} /> Engineering & Research Experience
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {experience.map((exp) => (
                  <div key={exp.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                        {exp.role}
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {formatDate(exp.start_date, 'MMM yyyy')} — {exp.is_current ? 'Present' : formatDate(exp.end_date, 'MMM yyyy')}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
                      {exp.company} {exp.location ? `· ${exp.location}` : ''}
                    </div>

                    {exp.description && (
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '8px' }}>
                        {exp.description}
                      </p>
                    )}

                    {exp.technologies && exp.technologies.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {exp.technologies.map((t) => (
                          <span
                            key={t}
                            style={{
                              fontSize: '10px',
                              fontFamily: 'var(--font-mono)',
                              padding: '2px 7px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--color-surface-2)',
                              border: '1px solid var(--color-border)',
                              color: 'var(--color-text-secondary)',
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
          .about-narrative-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .timeline-columns {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </section>
  )
}
