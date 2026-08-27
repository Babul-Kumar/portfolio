import { getCoCurricularActivities } from '@/lib/data'
import type { Metadata } from 'next'
import CoCurricularClientView from '@/components/co-curricular/CoCurricularClientView'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'

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
        {/* Page Header */}
        <div
          style={{
            marginBottom: '48px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '28px',
          }}
        >
          <div className="text-label" style={{ marginBottom: '12px' }}>
            04 / Beyond the Classroom
          </div>
          <h1 className="text-display" style={{ maxWidth: '800px', marginBottom: '18px' }}>
            BEYOND THE<br />CLASSROOM.
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
              maxWidth: '640px',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Hackathons, technical competitions, leadership experiences, community initiatives, and
            collaborative engineering events that shaped how I build, lead, and explore new frontiers.
          </p>
        </div>

        {/* Dynamic Database-Driven Activity Archive */}
        <CoCurricularClientView initialActivities={activities} />
      </div>
    </div>
  )
}
