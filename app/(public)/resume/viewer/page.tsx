import type { Metadata } from 'next'
import { getProfile, getSiteSetting } from '@/lib/data'
import DedicatedResumeViewer from '@/components/resume/DedicatedResumeViewer'

export const metadata: Metadata = {
  title: 'Dedicated Résumé Reader — Babul Kumar',
  description:
    'Dedicated high-definition document reader for Babul Kumar’s curriculum vitae and resume.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DedicatedResumeViewerPage() {
  const [profile, resumeSetting] = await Promise.all([
    getProfile(),
    getSiteSetting('resume_url'),
  ])

  const resumeUrl = resumeSetting || profile?.resume_url || null

  return (
    <DedicatedResumeViewer
      resumeUrl={resumeUrl}
      candidateName={profile?.name || 'Babul Kumar'}
    />
  )
}
