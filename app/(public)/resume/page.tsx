import type { Metadata } from 'next'
import {
  getProfile,
  getSiteSetting,
  getSkillsByCategory,
  getEducation,
  getProjects,
} from '@/lib/data'
import PageHeader from '@/components/layout/PageHeader'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'
import ResumeClientView from '@/components/resume/ResumeClientView'

export const metadata: Metadata = {
  title: 'Curriculum Vitae & Résumé — Babul Kumar',
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
    <div style={{ position: 'relative', overflow: 'hidden', padding: 'var(--section-gap) var(--container-pad)', minHeight: '85vh' }}>
      <AmbientSectionEnvironment variant="verification" intensity={0.4} accentMode="dual" />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Module Page Header */}
        <PageHeader
          moduleTag="// CURRICULUM_VITAE"
          title={
            <>
              OFFICIAL RÉSUMÉ &amp; <br />
              PROFESSIONAL DOSSIER
            </>
          }
          quote="Computer Science, Applied AI/ML, and Scalable Systems Engineering."
          description="Interactive curriculum vitae and verified PDF credentials document showcasing engineering experience, technical projects, and academic background."
          statusBadge={resumeUrl ? 'DOCUMENT_STREAM_LIVE' : 'VERIFIED_PROFILE'}
        />

        {/* Client Interactive Resume View */}
        <ResumeClientView
          profile={profile}
          resumeUrl={resumeUrl}
          education={education}
          projects={projects}
          skillsGroup={skillsGroup}
        />
      </div>
    </div>
  )
}
