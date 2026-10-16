import type { Metadata } from 'next'
import ContactSection from '@/components/sections/Contact'
import { getProfile } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Get in touch with Babul Kumar for software engineering opportunities, AI/ML research collaborations, and open-source projects.",
}

export const revalidate = 60

export default async function ContactPage() {
  const profile = await getProfile()

  return (
    <section
      className="contact-page-wrapper"
      style={{
        position: 'relative',
        padding: 'calc(68px + clamp(20px, 3.5vw, 40px)) var(--container-pad) clamp(48px, 6vw, 80px)',
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '1060px',
          margin: '0 auto',
        }}
      >
        <ContactSection profile={profile} />
      </div>
    </section>
  )
}
