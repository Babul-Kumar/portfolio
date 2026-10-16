import type { Metadata } from 'next'
import ContactSection from '@/components/sections/Contact'
import { getProfile } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Contact — Babul Kumar',
  description:
    "Get in touch with Babul Kumar for software engineering opportunities, AI/ML research collaborations, and open-source projects.",
}

export const revalidate = 60

export default async function ContactPage() {
  const profile = await getProfile()

  return (
    <main
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'calc(68px + clamp(16px, 3vw, 36px)) var(--container-pad) clamp(48px, 6vw, 80px)',
        minHeight: '85vh',
      }}
    >
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <ContactSection profile={profile} />
      </div>
    </main>
  )
}
