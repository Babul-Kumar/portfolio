import { getTrainings } from '@/lib/data'
import type { Metadata } from 'next'
import TrainingClientView from '@/components/training/TrainingClientView'
import AmbientSectionEnvironment from '@/components/ambient/AmbientSectionEnvironment'
import PageHeader from '@/components/layout/PageHeader'

export const revalidate = 60 // 1-minute ISR / on-demand revalidation

export const metadata: Metadata = {
  title: 'Training & Programs — Babul Kumar',
  description:
    'Industrial training, specialized bootcamps, and technical training programs completed by Babul Kumar across Full-Stack Systems, AI/ML, and Cloud Architecture.',
}

export default async function TrainingPage() {
  const trainings = await getTrainings()

  return (
    <div style={{ position: 'relative', overflow: 'hidden', padding: 'var(--section-gap) var(--container-pad)', minHeight: '85vh' }}>
      <AmbientSectionEnvironment variant="learning" intensity={0.5} accentMode="dual" />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Futuristic Module Page Header */}
        <PageHeader
          moduleTag="// TRAINING_MODULE_01"
          title={
            <>
              TECHNICAL TRAINING &amp;<br />
              FOUNDATIONAL PROGRAMS
            </>
          }
          quote="Learning systems, building systems."
          description="Curated industrial training, specialized bootcamps, and engineering programs focused on applied artificial intelligence, scalable distributed backends, and algorithmic system design."
          statusBadge="CURRICULUM_VERIFIED"
        />

        {/* Dynamic Database-Driven Training View */}
        <TrainingClientView initialTrainings={trainings} />
      </div>
    </div>
  )
}
