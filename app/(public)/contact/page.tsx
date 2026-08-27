import type { Metadata } from 'next'
import ContactSection from '@/components/sections/Contact'
import { getProfile } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Babul Kumar for internships, technical projects, AI/ML collaborations, or software development discussions.',
}

export const revalidate = 60

export default async function ContactPage() {
  const profile = await getProfile()

  return (
    <div style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <ContactSection profile={profile} />
    </div>
  )
}
