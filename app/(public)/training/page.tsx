import { getTrainings } from '@/lib/data'
import type { Metadata } from 'next'
import TrainingClientView from '@/components/training/TrainingClientView'

export const revalidate = 60 // 1-minute ISR / on-demand revalidation

export const metadata: Metadata = {
  title: 'Training & Programs — Babul Kumar',
  description:
    'Industrial training, specialized bootcamps, and technical training programs completed by Babul Kumar across Full-Stack Systems, AI/ML, and Cloud Architecture.',
}

export default async function TrainingPage() {
  const trainings = await getTrainings()

  return (
    <div style={{ padding: 'var(--section-gap) var(--container-pad)', minHeight: '85vh' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Page Header */}
        <div
          style={{
            marginBottom: '48px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '28px',
          }}
        >
          <div className="text-label" style={{ marginBottom: '12px' }}>
            03 / TRAINING
          </div>
          <h1 className="text-display" style={{ maxWidth: '800px', marginBottom: '18px' }}>
            TRAINING THAT<br />BUILT MY FOUNDATION.
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
              maxWidth: '620px',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Curated industrial training, specialized workshops, and engineering programs focused on
            applied artificial intelligence, scalable distributed backends, and algorithmic system design.
          </p>
        </div>

        {/* Dynamic Database-Driven Training View */}
        <TrainingClientView initialTrainings={trainings} />
      </div>
    </div>
  )
}
