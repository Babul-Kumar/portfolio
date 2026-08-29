import type { Metadata } from 'next'
import ContactSection from '@/components/sections/Contact'
import PageHeader from '@/components/layout/PageHeader'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'
import { getProfile } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Contact & Inquiries — Babul Kumar',
  description:
    'Get in touch with Babul Kumar for internships, technical projects, AI/ML collaborations, or software development engineering opportunities.',
}

export const revalidate = 60

export default async function ContactPage() {
  const profile = await getProfile()

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'var(--section-gap) var(--container-pad)',
        minHeight: '85vh',
      }}
    >
      <AmbientSectionEnvironment variant="communication" intensity={0.4} accentMode="orange" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Futuristic Page Header */}
        <PageHeader
          moduleTag="// COMMUNICATION_TERMINAL"
          title={
            <>
              TRANSMISSION TERMINAL &amp;<br />
              DIRECT DISPATCH
            </>
          }
          quote="Direct communication channel open."
          description="Send an inquiry regarding Software Development Engineering, Applied AI/ML roles, research collaborations, or technical software systems."
          statusBadge="PORTS_OPEN_LISTENING"
        />

        {/* Terminal Contact Form & Social Dispatch Cards */}
        <ContactSection profile={profile} />
      </div>
    </div>
  )
}
