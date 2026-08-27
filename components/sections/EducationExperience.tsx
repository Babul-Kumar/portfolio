'use client'

import { useMemo } from 'react'
import type { Education, Experience } from '@/types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Brain, Server, Terminal, Sparkles, GraduationCap, Briefcase, ArrowRight } from 'lucide-react'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'

export default function EducationExperienceSection({
  education,
  experience,
}: {
  education: Education[]
  experience: Experience[]
}) {
  // Sort education records: current degree first, then descending chronological
  const sortedEducation = useMemo(() => {
    return [...education].sort((a, b) => {
      if (a.is_current && !b.is_current) return -1
      if (!a.is_current && b.is_current) return 1
      const dateA = a.start_date ? new Date(a.start_date).getTime() : 0
      const dateB = b.start_date ? new Date(b.start_date).getTime() : 0
      return dateB - dateA
    })
  }, [education])

  return (
    <section id="about" className="section" style={{ position: 'relative' }}>
      <AmbientSectionEnvironment variant="architecture" intensity={0.55} accentMode="dual" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* =========================================================================
            1. SECTION EYEBROW & BALANCED HEADING
            ========================================================================= */}
        <div
          style={{
            marginBottom: '40px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '24px',
          }}
        >
          <div className="text-label" style={{ marginBottom: '10px' }}>
            01 / Narrative & Engineering Focus
          </div>

          <h2
            style={{
              fontSize: 'clamp(24px, 3.2vw, 36px)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.22,
              color: 'var(--color-text)',
              maxWidth: '760px',
              margin: 0,
            }}
          >
            I BUILD SYSTEMS THAT TURN{' '}
            <span style={{ color: 'var(--color-accent)' }}>MATHEMATICAL IDEAS</span> INTO RESILIENT PRODUCTS.
          </h2>
        </div>

        {/* =========================================================================
            2. TWO-COLUMN EDITORIAL COMPOSITION (Desktop ~45% / ~55%)
            ========================================================================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 45fr) minmax(0, 55fr)',
            gap: 'clamp(32px, 4vw, 56px)',
            alignItems: 'start',
          }}
          className="about-upper-grid"
        >
          {/* ----------------- LEFT COLUMN ----------------- */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Primary Bio Paragraph */}
            <p
              style={{
                fontSize: 'clamp(16px, 1.25vw, 17.5px)',
                color: 'var(--color-text)',
                lineHeight: 1.7,
                marginBottom: '16px',
                fontWeight: 500,
                maxWidth: '620px',
              }}
            >
              I am a Computer Science & Engineering undergraduate at{' '}
              <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>Lovely Professional University</strong>,
              focused on engineering intelligent systems where artificial intelligence, machine learning algorithms,
              and high-performance full-stack architectures converge.
            </p>

            {/* Secondary Supporting Paragraph */}
            <p
              style={{
                fontSize: 'clamp(13.5px, 1.05vw, 14.5px)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.7,
                marginBottom: '24px',
                maxWidth: '620px',
              }}
            >
              From designing AST-aware AI developer tooling (like <em>BotBro</em>) and predictive gradient-boosted models
              to building type-safe cloud systems, I care deeply about writing software that is mathematically sound,
              architecturally clean, and intuitively usable.
            </p>

            {/* Current Research Focus Card */}
            <div
              className="research-focus-card"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 18px',
                marginBottom: '20px',
                maxWidth: '620px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                transition: 'all 0.25s ease',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-sm)',
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
                <div
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-accent)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '3px',
                  }}
                >
                  Current Research Focus
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text)',
                    fontWeight: 600,
                    lineHeight: 1.35,
                  }}
                >
                  Multi-Agent Model Context Protocol (MCP) & AST Code Generation
                </div>
              </div>
            </div>

            {/* CTA: Read Comprehensive Story */}
            <div>
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
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-accent-bg)',
                  border: '1px solid var(--color-accent-border)',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
                className="hover-accent-btn"
              >
                <span>Read Comprehensive Story</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* ----------------- RIGHT COLUMN: 3 ENGINEERING CAPABILITY CARDS ----------------- */}
          <div
            className="capability-stack"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              position: 'relative',
            }}
          >
            {/* Subtle architectural system connector between cards 01 -> 02 -> 03 */}
            <div
              style={{
                position: 'absolute',
                left: '35px',
                top: '36px',
                bottom: '36px',
                width: '1px',
                background: 'linear-gradient(180deg, rgba(249, 115, 22, 0.5) 0%, rgba(6, 182, 212, 0.6) 50%, rgba(249, 115, 22, 0.5) 100%)',
                pointerEvents: 'none',
                zIndex: 1,
                opacity: 0.45,
              }}
            >
              <div
                className="capability-pulse-dot"
                style={{
                  position: 'absolute',
                  left: '-2px',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: 'var(--color-accent)',
                  boxShadow: '0 0 8px var(--color-accent)',
                  animation: 'systemDataPulse 4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                }}
              />
            </div>

            {/* Card 01: Intelligence */}
            <div
              className="glass-card capability-card"
              style={{
                padding: '18px 22px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.25s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div
                  style={{
                    color: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-accent-bg)',
                    border: '1px solid var(--color-accent-border)',
                  }}
                >
                  <Brain size={16} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontWeight: 700,
                    }}
                  >
                    01 / Intelligence
                  </div>
                  <h4
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      margin: '1px 0 0',
                    }}
                  >
                    AI & Machine Learning Engineering
                  </h4>
                </div>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                  paddingLeft: '38px',
                }}
              >
                Predictive tabular modeling (XGBoost, Random Forests), NLP tokenization, frequency-domain computer vision forensics, and neural network fine-tuning with PyTorch.
              </p>
            </div>

            {/* Card 02: Architecture */}
            <div
              className="glass-card capability-card"
              style={{
                padding: '18px 22px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.25s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div
                  style={{
                    color: 'var(--color-accent-teal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(20, 184, 166, 0.1)',
                    border: '1px solid rgba(20, 184, 166, 0.3)',
                  }}
                >
                  <Server size={16} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-accent-teal)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontWeight: 700,
                    }}
                  >
                    02 / Architecture
                  </div>
                  <h4
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      margin: '1px 0 0',
                    }}
                  >
                    Full-Stack & Distributed Systems
                  </h4>
                </div>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                  paddingLeft: '38px',
                }}
              >
                Next.js App Router, TypeScript microservices, FastAPI REST APIs, relational PostgreSQL schemas with Supabase, and WebGL interactive interfaces.
              </p>
            </div>

            {/* Card 03: Tooling & Agents */}
            <div
              className="glass-card capability-card"
              style={{
                padding: '18px 22px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.25s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div
                  style={{
                    color: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-accent-bg)',
                    border: '1px solid var(--color-accent-border)',
                  }}
                >
                  <Terminal size={16} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontWeight: 700,
                    }}
                  >
                    03 / Tooling & Agents
                  </div>
                  <h4
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      margin: '1px 0 0',
                    }}
                  >
                    AST-Aware Developer Tooling & MCP
                  </h4>
                </div>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                  paddingLeft: '38px',
                }}
              >
                Autonomous coding agents, AST semantic code mutation, Model Context Protocol (MCP) server implementations, and intelligent developer workflows.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. COMPACT ACADEMIC FOUNDATION & EXPERIENCE TIMELINE
            ========================================================================= */}
        <div
          style={{
            marginTop: '56px',
            display: 'grid',
            gridTemplateColumns: experience.length > 0 ? '1fr 1fr' : '1fr',
            gap: '28px',
          }}
          className="timeline-grid"
        >
          {/* Academic Foundation Compact Container */}
          {sortedEducation.length > 0 && (
            <div
              className="glass-card"
              style={{
                padding: 'clamp(24px, 3vw, 32px)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <AmbientSectionEnvironment variant="education" intensity={0.35} accentMode="orange" />
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
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
                  paddingBottom: '12px',
                  fontWeight: 700,
                }}
              >
                <GraduationCap size={16} />
                <span>Academic Foundation</span>
              </div>

              {/* Compact Timeline Rows */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {sortedEducation.map((edu, idx) => {
                  const isLast = idx === sortedEducation.length - 1
                  const startYr = edu.start_date ? formatDate(edu.start_date, 'yyyy') : ''
                  const endYr = edu.is_current ? 'Present' : (edu.end_date ? formatDate(edu.end_date, 'yyyy') : '')
                  const yearDisplay = startYr ? `${startYr} — ${endYr}` : endYr

                  return (
                    <div
                      key={edu.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '16px',
                        alignItems: 'start',
                        padding: '16px 0',
                        borderBottom: isLast ? 'none' : '1px solid var(--color-border-subtle)',
                      }}
                      className="education-row"
                    >
                      {/* Left: Degree, Institution, Specialization & Grade */}
                      <div>
                        <h4
                          style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: 'var(--color-text)',
                            margin: '0 0 3px',
                            lineHeight: 1.3,
                          }}
                        >
                          {edu.degree}
                        </h4>

                        <div
                          style={{
                            fontSize: '13px',
                            color: 'var(--color-text-secondary)',
                            fontWeight: 500,
                            marginBottom: '4px',
                          }}
                        >
                          {edu.institution}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            flexWrap: 'wrap',
                            fontSize: '12px',
                          }}
                        >
                          {edu.field && (
                            <span style={{ color: 'var(--color-text-muted)' }}>
                              Specialization:{' '}
                              <span style={{ color: 'var(--color-text-secondary)' }}>{edu.field}</span>
                            </span>
                          )}

                          {edu.grade && (
                            <span
                              style={{
                                color: 'var(--color-accent)',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 600,
                              }}
                            >
                              Honors / Grade: {edu.grade}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Year Range */}
                      {yearDisplay && (
                        <div
                          style={{
                            fontSize: '12px',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--color-text-muted)',
                            whiteSpace: 'nowrap',
                            paddingTop: '2px',
                          }}
                        >
                          {yearDisplay}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              </div>
            </div>
          )}

          {/* Engineering Experience (when present) */}
          {experience.length > 0 && (
            <div
              className="glass-card"
              style={{
                padding: 'clamp(24px, 3vw, 32px)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
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
                  paddingBottom: '12px',
                  fontWeight: 700,
                }}
              >
                <Briefcase size={16} />
                <span>Engineering & Research Experience</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {experience.map((exp, idx) => {
                  const isLast = idx === experience.length - 1
                  const startYr = exp.start_date ? formatDate(exp.start_date, 'MMM yyyy') : ''
                  const endYr = exp.is_current ? 'Present' : (exp.end_date ? formatDate(exp.end_date, 'MMM yyyy') : '')
                  const yearDisplay = startYr ? `${startYr} — ${endYr}` : endYr

                  return (
                    <div
                      key={exp.id}
                      style={{
                        padding: '16px 0',
                        borderBottom: isLast ? 'none' : '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          marginBottom: '3px',
                          flexWrap: 'wrap',
                          gap: '6px',
                        }}
                      >
                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                          {exp.role}
                        </h4>
                        {yearDisplay && (
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {yearDisplay}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
                        {exp.company} {exp.location ? `· ${exp.location}` : ''}
                      </div>

                      {exp.description && (
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: '0 0 8px' }}>
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
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .capability-card:hover {
          transform: translateY(-2px);
          border-color: var(--color-accent-border) !important;
          box-shadow: 0 6px 20px rgba(255, 138, 61, 0.08);
        }
        .research-focus-card:hover {
          transform: translateY(-2px);
          border-color: var(--color-accent-border) !important;
          box-shadow: 0 4px 16px rgba(255, 138, 61, 0.07);
        }
        .hover-accent-btn:hover {
          background: rgba(255, 138, 61, 0.15) !important;
          border-color: var(--color-accent) !important;
        }
        @media (max-width: 900px) {
          .about-upper-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .timeline-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
        @media (max-width: 560px) {
          .education-row {
            grid-template-columns: 1fr !important;
            gap: 6px !important;
          }
        }
      `}</style>
    </section>
  )
}
