import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import AmbientBackground from '@/components/layout/AmbientBackground'
import { getProfile } from '@/lib/data'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()

  return (
    <>
      <AmbientBackground />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer profile={profile} />
    </>
  )
}
