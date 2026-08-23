import type { Metadata } from 'next'
import { getProfile, getSkillsByCategory } from '@/lib/data'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Babul Kumar, background in Computer Science, AI/ML research interests, and full-stack engineering principles.',
}

export const revalidate = 3600

export default async function AboutPage() {
  const [profile, skillsByCategory] = await Promise.all([
    getProfile(),
    getSkillsByCategory(),
  ])

  const name = profile?.name ?? 'Babul Kumar'
  const tagline = profile?.tagline ?? 'Computer Science · AI / ML · Full Stack'
  const bio = profile?.bio ?? 'B.Tech Computer Science & Engineering student at Lovely Professional University, exploring Artificial Intelligence, Machine Learning and Full-Stack Development.'
  const bioExtended = profile?.bio_extended ?? 'I am deeply interested in building intelligent systems that solve real-world problems — from training ML models to architecting full-stack applications. I thrive at the intersection of research and engineering.'

  return (
    <div style={{ padding: 'var(--section-gap) var(--container-pad)', minHeight: '80vh' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ marginBottom: '80px' }}>
          <div className="text-label" style={{ marginBottom: '16px' }}>Identity & Background</div>
          <h1 className="text-display">
            ABOUT<br />BABUL
          </h1>
        </div>

        {/* Editorial Story Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 340px) 1fr',
          gap: '80px',
          alignItems: 'start',
          marginBottom: '96px',
        }} className="about-grid">
          {/* Left Column: Quick Profile Snapshot */}
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '32px',
          }}>
            {profile?.avatar_url && (
              <div style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '6px',
                overflow: 'hidden',
                marginBottom: '24px',
                border: '1px solid var(--color-border)',
              }}>
                <img
                  src={profile.avatar_url}
                  alt={name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <h3 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-text)', marginBottom: '4px' }}>
              {name}
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--color-accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px' }}>
              {tagline}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Education</span>
                {profile?.degree ?? 'B.Tech CSE'}
                <br />
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{profile?.university ?? 'LPU'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Location</span>
                {profile?.location ?? 'India'}
              </div>
              {profile?.available_for && (
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Open For</span>
                  <span style={{ color: 'var(--color-accent)' }}>{profile.available_for}</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: '28px' }}>
              <Link href="/contact" style={{
                display: 'block',
                textAlign: 'center',
                background: 'var(--color-text)',
                color: 'var(--color-bg)',
                padding: '12px 20px',
                borderRadius: '4px',
                fontSize: '12px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                fontWeight: 500,
              }}>
                Get in Touch
              </Link>
            </div>
          </div>

          {/* Right Column: Narrative & Focus Areas */}
          <div>
            <div style={{ marginBottom: '48px' }}>
              <h2 style={{
                fontSize: 'clamp(24px, 3.5vw, 42px)',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                color: 'var(--color-text)',
                marginBottom: '28px',
              }}>
                &ldquo;Building intelligent systems and thoughtful digital experiences.&rdquo;
              </h2>
              <p style={{
                fontSize: '17px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.8,
                marginBottom: '24px',
              }}>
                {bio}
              </p>
              <p style={{
                fontSize: '16px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.8,
              }}>
                {bioExtended}
              </p>
            </div>

            {/* Core Pillars */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '48px' }}>
              <div className="text-label" style={{ marginBottom: '24px' }}>Core Domains</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px',
              }}>
                <div style={{
                  background: 'var(--color-surface)',
                  padding: '24px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>01 / Intelligence</div>
                  <h4 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text)', marginBottom: '8px' }}>AI & Machine Learning</h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    Specializing in NLP, computer vision, deep learning models, and generative AI pipelines that transform raw data into actionable intelligence.
                  </p>
                </div>

                <div style={{
                  background: 'var(--color-surface)',
                  padding: '24px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>02 / Architecture</div>
                  <h4 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text)', marginBottom: '8px' }}>Full-Stack Systems</h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    Architecting robust web applications, high-performance backends, RESTful APIs, and scalable PostgreSQL schemas with clean developer experiences.
                  </p>
                </div>

                <div style={{
                  background: 'var(--color-surface)',
                  padding: '24px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>03 / Craft</div>
                  <h4 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text)', marginBottom: '8px' }}>Developer Tools & OS</h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    Exploring operating system fundamentals, security, AST manipulation, automated tooling, and low-friction workflow utilities.
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
            gap: 48px !important;
          }
        }
      `}</style>
    </div>
  )
}
