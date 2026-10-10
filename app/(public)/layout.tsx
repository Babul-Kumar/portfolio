import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import AmbientBackground from '@/components/layout/AmbientBackground'
import { getProfile } from '@/lib/data'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-accent)] focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-white"
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
      >
        Skip to main content
      </a>
      <AmbientBackground />
      <Navbar />
      <main id="main-content" tabIndex={-1} style={{ position: 'relative', zIndex: 1, outline: 'none' }}>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer profile={profile} />
    </>
  )
}
