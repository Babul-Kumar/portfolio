import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  GraduationCap,
  Award,
  BookOpen,
  Code2,
  ExternalLink,
  Mail,
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Compass,
} from 'lucide-react'
import {
  getProfile,
  getEducation,
  getAchievements,
  getTrainings,
  getProjects,
} from '@/lib/data'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'
import PageHeader from '@/components/layout/PageHeader'

export const revalidate = 60 // 1-minute on-demand revalidation

export const metadata: Metadata = {
  title: 'About Babul Kumar — Personal Profile, Education & Journey',
  description:
    'Detailed profile, academic foundation, technical journey, and verified engineering achievements of Babul Kumar, AI/ML practitioner and full-stack software engineer.',
}

export default async function AboutPage() {
  const [profile, educationList, achievementsList, trainingsList, featuredProjects] =
    await Promise.all([
      getProfile(),
      getEducation(),
      getAchievements(),
      getTrainings(),
      getProjects({ featured: true }),
    ])

  const education = educationList[0] || null
  const achievements = achievementsList.slice(0, 4)
  const trainings = trainingsList.slice(0, 3)
  const projects = featuredProjects.slice(0, 3)

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'calc(68px + 24px) var(--container-pad) var(--section-gap)',
        minHeight: '100vh',
      }}
    >
      <AmbientSectionEnvironment variant="architecture" intensity={0.4} accentMode="dual" />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
        }}
      >
        {/* Module HUD Header */}
        <PageHeader
          moduleTag="// IDENTITY_DOSSIER_01 · PROFILE & BIOGRAPHY"
          title={
            <>
              ENGINEERING IDENTITY,<br />
              ACADEMIC ROOTS &amp; JOURNEY
            </>
          }
          quote="Curiosity grounded in foundational computer science."
          description="A detailed look at my background, university education at Lovely Professional University, applied machine learning research, and technical milestones."
          statusBadge="ACTIVE_ENGINEER_PROFILE"
        />

        {/* =========================================================================
            SECTION A: Profile Showcase — Real Photograph & Executive Introduction
           ========================================================================= */}
        <section
          aria-labelledby="about-profile-heading"
          style={{
            marginBottom: '56px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            alignItems: 'start',
          }}
        >
          {/* Authentic Portrait Presentation */}
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: '16px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {/* Corner Blueprint Crosshairs */}
            <span
              style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--color-accent)',
                opacity: 0.7,
                userSelect: 'none',
              }}
            >
              +
            </span>
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--color-accent)',
                opacity: 0.7,
                userSelect: 'none',
              }}
            >
              +
            </span>

            {/* Profile Image Frame */}
            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                backgroundColor: 'var(--color-surface-2)',
                aspectRatio: '4 / 5',
                width: '100%',
              }}
            >
              <Image
                src="/images/profilepicture.jpg"
                alt="Babul Kumar — Computer Science & Engineering Undergraduate"
                width={600}
                height={750}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 480px"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 15%',
                  display: 'block',
                }}
              />

              {/* Ambient Bottom Gradient Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top, rgba(6, 7, 9, 0.72) 0%, rgba(6, 7, 9, 0.1) 40%, transparent 60%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Identity Badge Overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  left: '14px',
                  right: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(16, 19, 26, 0.85)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={14} style={{ color: '#10B981' }} />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      color: '#F5F6F8',
                    }}
                  >
                    VERIFIED PORTFOLIO IDENTITY
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '10px',
                    color: 'var(--color-accent)',
                  }}
                >
                  BK_AUTH_2026
                </span>
              </div>
            </div>

            {/* Quick Metadata Strip */}
            <div
              style={{
                marginTop: '16px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={13} style={{ color: 'var(--color-accent)' }} />
                <span>Punjab, India (Open to Remote &amp; On-Site)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={13} style={{ color: 'var(--color-accent)' }} />
                <span>B.Tech CSE Class of 2026 (2022 — 2026)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={13} style={{ color: 'var(--color-accent)' }} />
                <span>Available: {profile?.available_for ?? 'Internships & Software Projects'}</span>
              </div>
            </div>
          </div>

          {/* Profile Introduction & Core Identity */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                  marginBottom: '10px',
                }}
              >
                <span>{'// DEVELOPER_BIO'}</span>
              </div>

              <h2
                id="about-profile-heading"
                className="text-display"
                style={{
                  fontSize: 'clamp(32px, 4vw, 48px)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  margin: '0 0 12px',
                  color: 'var(--color-text)',
                }}
              >
                BABUL KUMAR
              </h2>

              <p
                style={{
                  fontSize: 'clamp(15px, 1.2vw, 17px)',
                  fontWeight: 500,
                  color: 'var(--color-accent)',
                  fontFamily: 'var(--font-mono, monospace)',
                  marginBottom: '20px',
                }}
              >
                AI / ML Practitioner &amp; Full-Stack Systems Engineer
              </p>

              <div
                style={{
                  fontSize: '15px',
                  lineHeight: 1.75,
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <p>
                  I am a Computer Science &amp; Engineering undergraduate at{' '}
                  <strong style={{ color: 'var(--color-text)' }}>Lovely Professional University</strong> (2022 — 2026)
                  specializing in practical artificial intelligence and modern full-stack web architectures.
                </p>
                <p>
                  My engineering journey focuses on the bridge between machine learning models and real-world execution.
                  Rather than treating intelligence as an isolated script or notebook, I build end-to-end applications—ranging
                  from local agentic developer assistants powered by AST code telemetry to gradient-boosted tabular delay prediction
                  engines and responsive, accessible user interfaces.
                </p>
                <p>
                  I am driven by clean code, strong algorithmic foundations, low-latency API pipelines, and high-density user
                  experiences that feel deliberate, responsive, and reliable.
                </p>
              </div>
            </div>

            {/* Direct Connect & Social Actions */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                paddingTop: '8px',
              }}
            >
              <a
                href="mailto:babulkumar0220@gmail.com"
                className="hover-accent-text"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-accent-bg)',
                  border: '1px solid var(--color-accent-border)',
                  color: 'var(--color-accent)',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s var(--ease-out)',
                }}
              >
                <Mail size={14} />
                <span>babulkumar0220@gmail.com</span>
              </a>

              <a
                href="https://github.com/babul-kumar"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '12px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s var(--ease-out)',
                }}
              >
                <span>GitHub</span>
                <ExternalLink size={12} style={{ opacity: 0.7 }} />
              </a>

              <a
                href="https://www.linkedin.com/in/babul-kumar2007/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '12px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s var(--ease-out)',
                }}
              >
                <span>LinkedIn</span>
                <ExternalLink size={12} style={{ opacity: 0.7 }} />
              </a>

              <Link
                href="/resume"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '12px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s var(--ease-out)',
                }}
              >
                <span>Official Résumé</span>
                <ArrowRight size={12} style={{ opacity: 0.7 }} />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION B: Academic Foundation (Education)
           ========================================================================= */}
        <section
          aria-labelledby="about-education-heading"
          style={{
            marginBottom: '56px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GraduationCap size={20} style={{ color: 'var(--color-accent)' }} />
              <h3
                id="about-education-heading"
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-text)',
                  margin: 0,
                }}
              >
                ACADEMIC FOUNDATION
              </h3>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                letterSpacing: '0.08em',
              }}
            >
              VERIFIED UNIVERSITY RECORD
            </span>
          </div>

          <div
            className="glass-card"
            style={{
              padding: 'clamp(24px, 3.5vw, 36px)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div>
                <h4
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    margin: '0 0 4px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {education?.degree ?? 'B.Tech'} in {education?.field ?? 'Computer Science & Engineering'}
                </h4>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-accent)',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {education?.institution ?? 'Lovely Professional University'} · {education?.location ?? 'Punjab, India'}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '11px',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  2022 — 2026
                </span>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '11px',
                    color: '#10B981',
                    fontWeight: 600,
                  }}
                >
                  {education?.grade ?? 'First Class'}
                </span>
              </div>
            </div>

            <p
              style={{
                fontSize: '14.5px',
                lineHeight: 1.7,
                color: 'var(--color-text-secondary)',
                marginBottom: '20px',
                maxWidth: '840px',
              }}
            >
              {education?.description ??
                'Specializing in Artificial Intelligence, Machine Learning algorithms, Distributed Systems, and Operating System design.'}
            </p>

            {/* Core Coursework Badges */}
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono, monospace)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--color-text-muted)',
                  marginBottom: '10px',
                  fontWeight: 600,
                }}
              >
                Key Academic Coursework &amp; Competencies:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  'Data Structures & Algorithms',
                  'Machine Learning & Predictive Modeling',
                  'Operating System Internals & Paging',
                  'Database Management Systems (PostgreSQL)',
                  'Distributed Computing & Microservices',
                  'Computer Networks & Protocols',
                  'Object-Oriented Software Design',
                ].map((course) => (
                  <span
                    key={course}
                    style={{
                      fontSize: '11.5px',
                      fontFamily: 'var(--font-mono, monospace)',
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {course}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION C: Technical Journey & Achievements
           ========================================================================= */}
        <section
          aria-labelledby="about-achievements-heading"
          style={{
            marginBottom: '56px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={20} style={{ color: 'var(--color-accent)' }} />
              <h3
                id="about-achievements-heading"
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-text)',
                  margin: 0,
                }}
              >
                HONORS &amp; TECHNICAL ACHIEVEMENTS
              </h3>
            </div>
            <Link
              href="/co-curricular"
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11.5px',
                color: 'var(--color-accent)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              className="hover-accent-text"
            >
              <span>View All Co-Curricular</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {achievements.map((item) => (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                      }}
                    >
                      {item.category.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {item.date}
                    </span>
                  </div>

                  <h4
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      margin: '0 0 6px',
                      lineHeight: 1.35,
                    }}
                  >
                    {item.title}
                  </h4>

                  <div
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: 'var(--color-text-secondary)',
                      marginBottom: '10px',
                    }}
                  >
                    {item.organization} · <span style={{ color: '#10B981' }}>{item.rank}</span>
                  </div>

                  <p
                    style={{
                      fontSize: '13px',
                      lineHeight: 1.6,
                      color: 'var(--color-text-secondary)',
                      margin: 0,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION D: Industry Training & Applied Specializations
           ========================================================================= */}
        <section
          aria-labelledby="about-training-heading"
          style={{
            marginBottom: '56px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={20} style={{ color: 'var(--color-accent)' }} />
              <h3
                id="about-training-heading"
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-text)',
                  margin: 0,
                }}
              >
                SPECIALIZED INDUSTRIAL TRAINING
              </h3>
            </div>
            <Link
              href="/training"
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11.5px',
                color: 'var(--color-accent)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              className="hover-accent-text"
            >
              <span>Explore All Trainings</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {trainings.map((trn) => (
              <div
                key={trn.id}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                      }}
                    >
                      {trn.category}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {trn.duration}
                    </span>
                  </div>

                  <h4
                    style={{
                      fontSize: '17px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      margin: '0 0 6px',
                      lineHeight: 1.35,
                    }}
                  >
                    {trn.title}
                  </h4>

                  <div
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: 'var(--color-text-secondary)',
                      marginBottom: '12px',
                    }}
                  >
                    {trn.provider}
                  </div>

                  <p
                    style={{
                      fontSize: '13px',
                      lineHeight: 1.6,
                      color: 'var(--color-text-secondary)',
                      margin: 0,
                    }}
                  >
                    {trn.description}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: '12px',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {trn.skills.slice(0, 3).map((sk) => (
                      <span
                        key={sk}
                        style={{
                          fontSize: '10.5px',
                          fontFamily: 'var(--font-mono, monospace)',
                          background: 'var(--color-surface-2)',
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/training/${trn.slug}`}
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: 'var(--color-accent)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    className="hover-accent-text"
                  >
                    <span>Inspect</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION E: Selected Production Architectures (Projects Linkage)
           ========================================================================= */}
        <section
          aria-labelledby="about-projects-heading"
          style={{
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Code2 size={20} style={{ color: 'var(--color-accent)' }} />
              <h3
                id="about-projects-heading"
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-text)',
                  margin: 0,
                }}
              >
                REPRESENTATIVE ENGINEERING ARCHITECTURES
              </h3>
            </div>
            <Link
              href="/work"
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11.5px',
                color: 'var(--color-accent)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              className="hover-accent-text"
            >
              <span>Explore All Projects</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                      }}
                    >
                      {proj.category}
                    </span>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {proj.project_date}
                    </span>
                  </div>

                  <h4
                    style={{
                      fontSize: '17px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      margin: '0 0 6px',
                    }}
                  >
                    {proj.title}
                  </h4>

                  <p
                    style={{
                      fontSize: '13px',
                      lineHeight: 1.6,
                      color: 'var(--color-text-secondary)',
                      margin: 0,
                    }}
                  >
                    {proj.short_desc}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: '12px',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {proj.technologies.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        style={{
                          fontSize: '10.5px',
                          fontFamily: 'var(--font-mono, monospace)',
                          background: 'var(--color-surface-2)',
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/work/${proj.slug}`}
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: 'var(--color-accent)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    className="hover-accent-text"
                  >
                    <span>Deep Dive</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION F: Bottom Collaboration Banner
           ========================================================================= */}
        <section
          style={{
            padding: '36px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-accent-border)',
            background:
              'radial-gradient(circle at 80% 20%, rgba(228, 93, 44, 0.08) 0%, var(--color-surface) 60%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '18px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              fontWeight: 600,
            }}
          >
            <Sparkles size={14} />
            <span>LET’S BUILD SOMETHING RESILIENT</span>
          </div>

          <h3
            className="text-display"
            style={{
              fontSize: 'clamp(24px, 3.5vw, 36px)',
              letterSpacing: '-0.02em',
              margin: 0,
              color: 'var(--color-text)',
            }}
          >
            INTERESTED IN COLLABORATING OR DISCUSSING APPLIED AI?
          </h3>

          <p
            style={{
              fontSize: '14.5px',
              color: 'var(--color-text-secondary)',
              maxWidth: '620px',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Whether you are exploring internships, software engineering projects, or applied AI research,
            I am always open to discussing new technical challenges.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              marginTop: '6px',
            }}
          >
            <Link
              href="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-accent)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                letterSpacing: '0.04em',
                transition: 'all 0.2s var(--ease-out)',
              }}
            >
              <span>Get in Touch</span>
              <ArrowRight size={13} />
            </Link>

            <Link
              href="/resume"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                letterSpacing: '0.04em',
                transition: 'all 0.2s var(--ease-out)',
              }}
            >
              <span>View Résumé Document</span>
              <ExternalLink size={12} style={{ opacity: 0.8 }} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
