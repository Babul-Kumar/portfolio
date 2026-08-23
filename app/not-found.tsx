import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--section-gap) var(--container-pad)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '520px' }}>
          <div
            className="text-label"
            style={{
              display: 'inline-block',
              marginBottom: '16px',
              padding: '4px 12px',
              background: 'var(--color-accent-bg)',
              border: '1px solid var(--color-accent-border)',
              borderRadius: '9999px',
              color: 'var(--color-accent)',
            }}
          >
            404 · Page Not Found
          </div>
          <h1
            className="text-display"
            style={{
              fontSize: 'clamp(48px, 8vw, 84px)',
              lineHeight: 1.05,
              marginBottom: '20px',
              color: 'var(--color-text)',
            }}
          >
            LOST IN<br />SPACE
          </h1>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '16px',
              lineHeight: 1.6,
              marginBottom: '32px',
            }}
          >
            The page or resource you are looking for has been moved, removed, or never existed in this sector.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-primary">
              Return Home
            </Link>
            <Link href="/projects" className="btn btn-ghost">
              Explore Projects
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
