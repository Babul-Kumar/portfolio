import type { Metadata } from 'next'
import { getProjects } from '@/lib/data'
import WorkShowcaseView from '@/components/work/WorkShowcaseView'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'
import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: 'Work & Projects — Babul Kumar',
  description:
    'A curated showcase of autonomous AI agents, gradient-boosted predictive models, telemetry monitors, and modern full-stack developer tools engineered by Babul Kumar.',
}

export const revalidate = 60

export default async function WorkPage() {
  const projects = await getProjects()

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'var(--section-gap) var(--container-pad)',
        minHeight: '85vh',
      }}
    >
      <AmbientSectionEnvironment variant="engineering" intensity={0.55} accentMode="dual" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Futuristic Page Header */}
        <PageHeader
          moduleTag="// PROJECT_ARCHIVE"
          title={
            <>
              PRODUCTION WORK &amp;<br />
              SYSTEMS ARCHITECTURE
            </>
          }
          quote="Code, systems, and intelligence in production."
          description="A curated showcase of autonomous AI agents, gradient-boosted predictive models, telemetry monitors, and modern full-stack developer systems."
          statusBadge="REPOSITORIES_SYNCHRONIZED"
        />

        {/* Work Showcase View with Category Tabs and Featured Hierarchy */}
        <WorkShowcaseView projects={projects} />
      </div>
    </div>
  )
}
