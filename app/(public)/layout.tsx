import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getProfile } from '@/lib/data'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer profile={profile} />
    </>
  )
}
