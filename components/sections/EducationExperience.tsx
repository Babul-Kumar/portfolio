import type { Education, Experience } from '@/types'
import { formatDate } from '@/lib/utils'

export default function EducationExperienceSection({
  education,
  experience,
}: {
  education: Education[]
  experience: Experience[]
}) {
  if (education.length === 0 && experience.length === 0) return null

  return (
    <section style={{ padding: 'var(--section-gap) var(--container-pad)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <div style={{ marginBottom: '64px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>06 / Background</div>
          <h2 className="text-display-sm">EDUCATION &<br />EXPERIENCE</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: experience.length > 0 ? '1fr 1fr' : '1fr',
          gap: '80px',
        }}>
          {/* Education */}
          {education.length > 0 && (
            <div>
              <div style={{
                fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--color-text-muted)', marginBottom: '32px',
                paddingBottom: '12px', borderBottom: '1px solid var(--color-border)',
              }}>
                Education
              </div>
              {education.map((item) => (
                <TimelineItem
                  key={item.id}
                  title={`${item.degree}${item.field ? ` in ${item.field}` : ''}`}
                  subtitle={item.institution}
                  meta={`${formatDate(item.start_date, 'yyyy')} — ${item.is_current ? 'Present' : formatDate(item.end_date, 'yyyy')}`}
                  detail={item.grade ?? undefined}
                  location={item.location ?? undefined}
                  current={item.is_current}
                />
              ))}
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div>
              <div style={{
                fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--color-text-muted)', marginBottom: '32px',
                paddingBottom: '12px', borderBottom: '1px solid var(--color-border)',
              }}>
                Experience
              </div>
              {experience.map((item) => (
                <TimelineItem
                  key={item.id}
                  title={item.role}
                  subtitle={item.company}
                  meta={`${formatDate(item.start_date, 'MMM yyyy')} — ${item.is_current ? 'Present' : formatDate(item.end_date, 'MMM yyyy')}`}
                  detail={item.type}
                  location={item.location ?? undefined}
                  current={item.is_current}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function TimelineItem({
  title, subtitle, meta, detail, location, current,
}: {
  title: string
  subtitle: string
  meta: string
  detail?: string
  location?: string
  current?: boolean
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '12px 1fr',
      gap: '20px',
      marginBottom: '32px',
      paddingBottom: '32px',
      borderBottom: '1px solid var(--color-border-subtle)',
    }}>
      {/* Dot */}
      <div style={{ paddingTop: '6px' }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: current ? 'var(--color-accent)' : 'var(--color-border)',
          border: '2px solid var(--color-bg)',
          boxShadow: '0 0 0 1px var(--color-border)',
        }} />
      </div>

      {/* Content */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{
              fontSize: '16px', fontWeight: 500, color: 'var(--color-text)',
              letterSpacing: '-0.01em', marginBottom: '2px',
            }}>
              {title}
            </h3>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {subtitle}
            </div>
          </div>
          {current && (
            <span style={{
              fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--color-accent)', border: '1px solid var(--color-accent)',
              padding: '3px 8px', borderRadius: '3px',
            }}>
              Current
            </span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <span>{meta}</span>
          {detail && <span>· {detail}</span>}
          {location && <span>· {location}</span>}
        </div>
      </div>
    </div>
  )
}
