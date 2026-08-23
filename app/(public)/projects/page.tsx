import type { Metadata } from 'next'
import { getProjects } from '@/lib/data'
import InteractiveProjectList from '@/components/projects/InteractiveProjectList'

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'A collection of projects by Babul Kumar — AI/ML systems, predictive models, web applications, and developer tools.',
}

export const revalidate = 3600

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div style={{ padding: 'var(--section-gap) var(--container-pad)', minHeight: '85vh' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '56px', borderBottom: '1px solid var(--color-border)', paddingBottom: '32px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>
            Work & Architecture
          </div>
          <h1 className="text-display" style={{ maxWidth: '700px', marginBottom: '20px' }}>
            ALL<br />PROJECTS
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
              maxWidth: '560px',
              lineHeight: 1.65,
            }}
          >
            A curated showcase of autonomous AI agents, gradient-boosted predictive models,
            telemetry monitors, and modern full-stack developer tools.
          </p>
        </div>

        {/* Interactive List */}
        <InteractiveProjectList projects={projects} />
      </div>
    </div>
  )
}
