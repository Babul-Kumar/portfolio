import type { Metadata } from 'next'
import { getProfile } from '@/lib/data'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about Babul Kumar, background in Computer Science, AI/ML research interests, and full-stack engineering principles.',
}

export const revalidate = 60

export default async function AboutPage() {
  const profile = await getProfile()

  const name = profile?.name ?? 'Babul Kumar'
  const tagline = profile?.tagline ?? 'Computer Science · AI / ML · Full Stack'
  const bio =
    profile?.bio ??
    'B.Tech Computer Science & Engineering student at Lovely Professional University, exploring Artificial Intelligence, Machine Learning and Full-Stack Development.'
  const bioExtended =
    profile?.bio_extended ??
    'I am deeply interested in building intelligent systems that solve real-world problems — from training ML models to architecting full-stack applications. I thrive at the intersection of research and engineering.'

  return (
    <div style={{ padding: 'var(--section-gap) var(--container-pad)', minHeight: '85vh' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ marginBottom: '64px', borderBottom: '1px solid var(--color-border)', paddingBottom: '32px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>
            Identity & Engineering Philosophy
          </div>
          <h1 className="text-display">
            ABOUT<br />BABUL KUMAR
          </h1>
        </div>

        {/* Story Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 360px) 1fr',
            gap: '64px',
            alignItems: 'start',
            marginBottom: '80px',
          }}
          className="about-grid"
        >
          {/* Left Column: Profile Card */}
          <div
            className="glass-card"
            style={{
              padding: '32px',
            }}
          >
            {/* 3D Avatar Portrait */}
            <div
              style={{
                width: '100%',
                aspectRatio: '3/4',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                marginBottom: '24px',
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
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'rgba(10, 10, 12, 0.8)',
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
                <span>3D AI Engineer Avatar</span>
              </div>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>
              {name}
            </h3>
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-accent)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '24px',
              }}
            >
              {tagline}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                borderTop: '1px solid var(--color-border)',
                paddingTop: '20px',
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
                    marginBottom: '4px',
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
                    marginBottom: '4px',
                  }}
                >
                  Location
                </span>
                <span style={{ color: 'var(--color-text)' }}>{profile?.location ?? 'Punjab, India'}</span>
              </div>
              {profile?.available_for && (
                <div>
                  <span
                    style={{
                      color: 'var(--color-text-muted)',
                      display: 'block',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '4px',
                    }}
                  >
                    Open For
                  </span>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 500 }}>
                    {profile.available_for}
                  </span>
                </div>
              )}
            </div>

            <div style={{ marginTop: '32px' }}>
              <Link
                href="/contact"
                className="btn-primary"
                style={{ width: '100%' }}
              >
                Connect With Me
              </Link>
            </div>
          </div>

          {/* Right Column: Narrative & Core Domains */}
          <div>
            <div style={{ marginBottom: '48px' }}>
              <h2
                style={{
                  fontSize: 'clamp(24px, 3.5vw, 38px)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25,
                  color: 'var(--color-text)',
                  marginBottom: '24px',
                }}
              >
                &ldquo;Building intelligent systems where research curiosity meets resilient production engineering.&rdquo;
              </h2>
              <p
                style={{
                  fontSize: '16px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.8,
                  marginBottom: '20px',
                }}
              >
                {bio}
              </p>
              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.8,
                }}
              >
                {bioExtended}
              </p>
            </div>

            {/* Pillars */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '40px' }}>
              <div className="text-label" style={{ marginBottom: '24px' }}>
                Technical Focus Areas
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '20px',
                }}
              >
                <div className="glass-card" style={{ padding: '24px' }}>
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '8px',
                    }}
                  >
                    01 / Intelligence
                  </div>
                  <h4 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
                    AI & Machine Learning
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    Specializing in NLP, computer vision forensics, deep learning models, and agentic workflows via Model Context Protocol.
                  </p>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '8px',
                    }}
                  >
                    02 / Architecture
                  </div>
                  <h4 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
                    Full-Stack Systems
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    Architecting robust Next.js web applications, async FastAPI backends, and scalable PostgreSQL database schemas.
                  </p>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '8px',
                    }}
                  >
                    03 / Tooling
                  </div>
                  <h4 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
                    Developer Tooling & OS
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    Creating AST code analysis engines, real-time operating system telemetry daemons, and low-friction workflow utilities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 840px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  )
}
