import type { Metadata } from 'next'
import {
  getProfile,
  getProjects,
  getCertificates,
  getEducation,
  getExperience,
} from '@/lib/data'
import HeroSection from '@/components/sections/Hero'
import EducationExperienceSection from '@/components/sections/EducationExperience'
import CertificatePreviewSection from '@/components/sections/CertificatePreview'
import SelectedWorkSection from '@/components/sections/SelectedWork'
import ContactSection from '@/components/sections/Contact'

export const revalidate = 3600 // Revalidate every hour

export const metadata: Metadata = {
  title: 'Babul Kumar — AI / ML & Full-Stack Software Engineer',
  description:
    'Computer Science student at Lovely Professional University. Engineering intelligent AI/ML systems, developer tooling, and modern full-stack architectures.',
}

export default async function HomePage() {
  const [profile, projects, certificates, education, experience] =
    await Promise.all([
      getProfile(),
      getProjects({ featured: true, limit: 6 }),
      getCertificates({ featured: true, limit: 6 }),
      getEducation(),
      getExperience(),
    ])

  return (
    <>
      {/* 01: Hero Section */}
      <HeroSection profile={profile} />

      {/* 02: About Section (#about) */}
      <EducationExperienceSection education={education} experience={experience} />

      {/* 03: Certificates Section (#certificates) */}
      <CertificatePreviewSection certificates={certificates} />

      {/* 04: Work Section (#work) */}
      <SelectedWorkSection projects={projects} />

      {/* 05: Contact Section (#contact) */}
      <ContactSection />
    </>
  )
}
