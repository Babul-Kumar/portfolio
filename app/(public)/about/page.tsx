import type { Metadata } from 'next'
import { getProfile } from '@/lib/data'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'

export const metadata: Metadata = {
  title: 'About — Babul Kumar',
  description:
    'B.Tech CSE student at Lovely Professional University interested in AI/ML, Python, FastAPI, React, and building practical software projects.',
}

export const revalidate = 60

export default async function AboutPage() {
  const profile = await getProfile()

  const name = profile?.name ?? 'Babul Kumar'
  const tagline = profile?.tagline ?? 'Computer Science · AI / ML · Software Development'

  const OLD_DEFAULT_BIO =
    'B.Tech Computer Science & Engineering student at Lovely Professional University, exploring Artificial Intelligence, Machine Learning and Full-Stack Development.'
  const OLD_DEFAULT_BIO_EXTENDED =
    'I am deeply interested in building intelligent systems that solve real-world problems — from training ML models to architecting full-stack applications. I thrive at the intersection of research and engineering.'

  const intro =
    profile?.bio && profile.bio !== OLD_DEFAULT_BIO
      ? profile.bio
      : 'I’m a B.Tech CSE student at Lovely Professional University with an interest in AI/ML and software development.'

  const defaultParagraphs = [
    'I have knowledge of Python, Machine Learning, FastAPI, React, and Generative AI, and I enjoy learning new technologies by building projects.',
    'I’ve worked on projects like a Flight Delay Prediction System and AI-powered applications, which have helped me gain practical experience in machine learning and full-stack development.',
    'I’m looking for internships and real-world projects where I can apply what I know, learn from others, and improve my skills.',
    'If you’re working on AI/ML, GenAI, or software development projects, feel free to connect with me and collaborate.',
  ]

  const customParagraphs = profile?.bio_extended
    ? profile.bio_extended
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
    : []

  const paragraphs =
    customParagraphs.length > 1 && profile?.bio_extended !== OLD_DEFAULT_BIO_EXTENDED
      ? customParagraphs
      : defaultParagraphs

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'var(--section-gap) var(--container-pad)',
        minHeight: '85vh',
      }}
    >
      <AmbientSectionEnvironment variant="architecture" intensity={0.45} accentMode="dual" />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
        }}
      >
        {/* Section Header */}
        <div
          style={{
            marginBottom: '48px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '24px',
          }}
        >
          <div className="text-label" style={{ marginBottom: '10px' }}>
            Background & Engineering Journey
          </div>
          <h1 className="text-display">
            ABOUT<br />BABUL KUMAR
          </h1>
        </div>

        {/* Story Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 340px) 1fr',
            gap: 'clamp(32px, 4vw, 56px)',
            alignItems: 'start',
            marginBottom: '64px',
          }}
          className="about-grid"
        >
          {/* Left Column: Profile Card */}
          <div
            className="glass-card"
            style={{
              padding: '28px',
              position: 'sticky',
              top: '96px',
            }}
          >
            {/* 3D Avatar Portrait */}
            <div
              style={{
                width: '100%',
                aspectRatio: '3/4',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                marginBottom: '20px',
                border: '1px solid var(--color-border)',
                position: 'relative',
                background: 'var(--color-surface-subtle)',
              }}
            >
              <Image
                src={profile?.avatar_url || '/images/profilepicture.jpg'}
                alt={name}
                width={480}
                height={640}
                priority
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  right: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'rgba(10, 10, 12, 0.82)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.04em',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--color-accent)',
                    boxShadow: '0 0 8px var(--color-accent)',
                    display: 'inline-block',
                  }}
                />
                <span>3D Developer Avatar</span>
              </div>
            </div>

            <h3
              style={{
                fontSize: '19px',
                fontWeight: 600,
                color: 'var(--color-text)',
                marginBottom: '4px',
              }}
            >
              {name}
            </h3>

            <div
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-accent)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}
            >
              {tagline}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                borderTop: '1px solid var(--color-border)',
                paddingTop: '18px',
              }}
            >
              <div>
                <span
                  style={{
                    color: 'var(--color-text-muted)',
                    display: 'block',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '3px',
                  }}
                >
                  Education
                </span>
                <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                  {profile?.degree ?? 'B.Tech CSE'}
                </span>
                <br />
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {profile?.university ?? 'Lovely Professional University'}
                </span>
              </div>

              <div>
                <span
                  style={{
                    color: 'var(--color-text-muted)',
                    display: 'block',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '3px',
                  }}
                >
                  Location
                </span>
                <span style={{ color: 'var(--color-text)' }}>
                  {profile?.location ?? 'Punjab, India'}
                </span>
              </div>

              <div>
                <span
                  style={{
                    color: 'var(--color-text-muted)',
                    display: 'block',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '3px',
                  }}
                >
                  Open For
                </span>
                <span style={{ color: 'var(--color-accent)', fontWeight: 500 }}>
                  {profile?.available_for ?? 'Internships & Software Projects'}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <Link
                href="/contact"
                className="btn-primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>Get In Touch</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right Column: Narrative & Technical Focus */}
          <div style={{ maxWidth: '720px' }}>
            {/* Introduction Heading */}
            <div style={{ marginBottom: '32px' }}>
              <h2
                style={{
                  fontSize: 'clamp(20px, 2.4vw, 28px)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.35,
                  color: 'var(--color-text)',
                  marginBottom: '24px',
                }}
              >
                {intro}
              </h2>

              {/* 3-4 Readable Paragraphs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {paragraphs.map((para, index) => (
                  <p
                    key={index}
                    style={{
                      fontSize: '15px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.8,
                      margin: 0,
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Technical Focus Areas */}
            <div
              style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: '36px',
                marginBottom: '36px',
              }}
            >
              <div className="text-label" style={{ marginBottom: '20px' }}>
                Technical Focus Areas
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: '16px',
                }}
              >
                {/* 01 / AI & Machine Learning */}
                <div
                  className="glass-card"
                  style={{
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '8px',
                      fontWeight: 700,
                    }}
                  >
                    01 / AI & Machine Learning
                  </div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      marginBottom: '8px',
                      lineHeight: 1.3,
                    }}
                  >
                    AI & Machine Learning
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    AI / ML, Generative AI, predictive modeling, and practical machine learning projects.
                  </p>
                </div>

                {/* 02 / Full-Stack Development */}
                <div
                  className="glass-card"
                  style={{
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-accent-teal)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '8px',
                      fontWeight: 700,
                    }}
                  >
                    02 / Full-Stack Development
                  </div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      marginBottom: '8px',
                      lineHeight: 1.3,
                    }}
                  >
                    Full-Stack Development
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    Python, FastAPI, React, Next.js, APIs, and building complete web applications.
                  </p>
                </div>

                {/* 03 / Project-Based Learning */}
                <div
                  className="glass-card"
                  style={{
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '8px',
                      fontWeight: 700,
                    }}
                  >
                    03 / Project-Based Learning
                  </div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      marginBottom: '8px',
                      lineHeight: 1.3,
                    }}
                  >
                    Project-Based Learning
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    Learning new technologies by building practical projects such as the Flight Delay Prediction System and AI-powered applications.
                  </p>
                </div>
              </div>
            </div>

            {/* Clear Collaboration CTA */}
            <div style={{ paddingTop: '8px' }}>
              <Link
                href="/contact"
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                <span>Connect With Me</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .about-grid > div:first-child {
            position: static !important;
          }
        }
      `}</style>
    </div>
  )
}
