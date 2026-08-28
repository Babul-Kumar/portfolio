import type { Metadata } from 'next'
import {
  getProfile,
  getProjects,
  getTrainings,
  getCertificates,
  getCoCurricularActivities,
  getEducation,
  getExperience,
} from '@/lib/data'
import HeroSection from '@/components/sections/Hero'
import EducationExperienceSection from '@/components/sections/EducationExperience'
import TrainingSection from '@/components/sections/TrainingSection'
import CertificatePreviewSection from '@/components/sections/CertificatePreview'
import CoCurricularSection from '@/components/sections/CoCurricularSection'
import SelectedWorkSection from '@/components/sections/SelectedWork'
import ContactSection from '@/components/sections/Contact'

export const revalidate = 60 // Revalidate every 60 seconds
 
export const metadata: Metadata = {
  title: 'Babul Kumar — AI / ML & Full-Stack Software Engineer',
  description:
    'Computer Science student at Lovely Professional University. Engineering intelligent AI/ML systems, developer tooling, and modern full-stack architectures.',
}

export default async function HomePage() {
  const [profile, projects, trainings, certificates, coCurricular, education, experience] =
    await Promise.all([
      getProfile(),
      getProjects(), // All published projects — completely data-driven
      getTrainings(),
      getCertificates(),
      getCoCurricularActivities(), // All published activities — no featured/limit filter
      getEducation(),
      getExperience(),
    ])

  return (
    <>
      {/* 01: Hero Section */}
      <HeroSection profile={profile} />

      {/* 02: About Section (#about) */}
      <EducationExperienceSection education={education} experience={experience} />

      {/* 03: Training Section (#training) */}
      <TrainingSection trainings={trainings} />

      {/* 04: Certificates Section (#certificates) */}
      <CertificatePreviewSection certificates={certificates} />

      {/* 05: Co-Curricular Section (#co-curricular) */}
      <CoCurricularSection activities={coCurricular} />

      {/* 06: Work Section (#work) */}
      <SelectedWorkSection projects={projects} />

      {/* 07: Contact Section (#contact) */}
      <ContactSection profile={profile} />
    </>
  )
}
