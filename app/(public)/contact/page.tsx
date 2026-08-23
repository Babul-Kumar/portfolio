import type { Metadata } from 'next'
import ContactSection from '@/components/sections/Contact'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Babul Kumar for internships, technical projects, AI/ML collaborations, or software development discussions.',
}

export default function ContactPage() {
  return (
    <div style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <ContactSection />
    </div>
  )
}
