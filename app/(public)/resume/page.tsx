import type { Metadata } from 'next'
import {
  getProfile,
  getSiteSetting,
  getSkillsByCategory,
  getEducation,
  getProjects,
} from '@/lib/data'
import ResumeClientView from '@/components/resume/ResumeClientView'

export const metadata: Metadata = {
  title: 'Curriculum Vitae & Résumé',
  description:
    'Official curriculum vitae and resume of Babul Kumar — Computer Science, AI/ML, and Full-Stack Engineering.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ResumePage() {
  const [profile, resumeSetting, skillsGroup, education, projects] = await Promise.all([
    getProfile(),
    getSiteSetting('resume_url'),
    getSkillsByCategory(),
    getEducation(),
    getProjects({ featured: true, limit: 6 }),
  ])

  const resumeUrl = resumeSetting || profile?.resume_url || null

  return (
    <main className="resume-page-canvas">
      <ResumeClientView
        profile={profile}
        resumeUrl={resumeUrl}
        education={education}
        projects={projects}
        skillsGroup={skillsGroup}
      />
    </main>
  )
}

