import { getCoCurricularActivities } from '@/lib/data'
import type { Metadata } from 'next'
import CoCurricularClientView from '@/components/co-curricular/CoCurricularClientView'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'
import PageHeader from '@/components/layout/PageHeader'

export const revalidate = 60 // 1-minute ISR / on-demand revalidation

export const metadata: Metadata = {
  title: 'Co-Curricular & Leadership — Babul Kumar',
  description:
    'Technical events, hackathons, open-source sprints, and leadership initiatives undertaken by Babul Kumar beyond the traditional classroom.',
}

export default async function CoCurricularPage() {
  const activities = await getCoCurricularActivities()

  return (
    <div style={{ position: 'relative', overflow: 'hidden', padding: 'var(--section-gap) var(--container-pad)', minHeight: '85vh' }}>
      <AmbientSectionEnvironment variant="network" intensity={0.5} accentMode="dual" />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Futuristic Module Page Header */}
        <PageHeader
          moduleTag="// CO_CURRICULAR_ACTIVITIES"
          title={
            <>
              BEYOND THE CLASSROOM:<br />
              HACKATHONS, LEADERSHIP &amp; SPRINTS
            </>
          }
          quote="Beyond the classroom: building, competing, leading."
          description="Competitive hackathons, technical challenges, student clubs, and leadership experiences that shaped how I build, lead, and explore new frontiers."
          statusBadge="ACTIVITY_ARCHIVE_VERIFIED"
        />

        {/* Dynamic Database-Driven Activity Archive */}
        <CoCurricularClientView initialActivities={activities} />
      </div>
    </div>
  )
}
