import { Suspense } from 'react'
import type { Metadata } from 'next'
import {
  getProfile, getProjects, getCertificates,
  getAchievements, getPortfolioStats, getSkillsByCategory,
  getEducation, getExperience
} from '@/lib/data'
import HeroSection from '@/components/sections/Hero'
import StatsSection from '@/components/sections/Stats'
import SelectedWorkSection from '@/components/sections/SelectedWork'
import AchievementTimelineSection from '@/components/sections/AchievementTimeline'
import CertificatePreviewSection from '@/components/sections/CertificatePreview'
import SkillsSection from '@/components/sections/Skills'
import EducationExperienceSection from '@/components/sections/EducationExperience'
import ResumeCTASection from '@/components/sections/ResumeCTA'
import ContactSection from '@/components/sections/Contact'

export const revalidate = 3600 // Revalidate every hour

export const metadata: Metadata = {
  title: 'Babul Kumar — Digital Archive',
  description:
    'Computer Science student at Lovely Professional University. Building intelligent systems in AI, ML, and Full-Stack Development.',
}

export default async function HomePage() {
  const [profile, projects, certificates, achievements, stats, skillsByCategory, education, experience] =
    await Promise.all([
      getProfile(),
      getProjects({ featured: true, limit: 6 }),
      getCertificates({ featured: true, limit: 6 }),
      getAchievements({ limit: 10 }),
      getPortfolioStats(),
      getSkillsByCategory(),
      getEducation(),
      getExperience(),
    ])

  const resumeUrl = profile?.resume_url ?? null

  return (
    <>
      <HeroSection profile={profile} />
      <StatsSection stats={stats} />
      <SelectedWorkSection projects={projects} />
      <AchievementTimelineSection achievements={achievements} />
      <CertificatePreviewSection certificates={certificates} />
      <SkillsSection skillsByCategory={skillsByCategory} />
      <EducationExperienceSection education={education} experience={experience} />
      <ResumeCTASection resumeUrl={resumeUrl} />
      <ContactSection />
    </>
  )
}
