import type { SkillsByCategory } from '@/types'

const LEVEL_WEIGHT: Record<string, number> = {
  Expert: 4, Advanced: 3, Intermediate: 2, Beginner: 1,
}

export default function SkillsSection({ skillsByCategory }: { skillsByCategory: SkillsByCategory }) {
  const categories = Object.keys(skillsByCategory)
  if (categories.length === 0) return null

  return (
    <section style={{
      padding: 'var(--section-gap) var(--container-pad)',
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <div style={{ marginBottom: '64px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>05 / Capabilities</div>
          <h2 className="text-display-sm">SKILLS &<br />TOOLS</h2>
        </div>

        {/* Two-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0 80px',
        }}>
          {categories.map((category) => (
            <SkillGroup key={category} category={category} skills={skillsByCategory[category]} />
          ))}
        </div>
      </div>
    </section>
  )
}

function SkillGroup({ category, skills }: { category: string; skills: { id: string; name: string; level: string; featured: boolean }[] }) {
  const sorted = [...skills].sort((a, b) => (LEVEL_WEIGHT[b.level] ?? 2) - (LEVEL_WEIGHT[a.level] ?? 2))

  return (
    <div style={{ marginBottom: '48px' }}>
      <div style={{
        fontSize: '11px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--color-text-muted)',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {category}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {sorted.map((skill) => (
          <div
            key={skill.id}
            className="hover-border-accent"
            style={{
              padding: '6px 14px',
              background: skill.featured ? 'var(--color-accent-bg)' : 'transparent',
              border: `1px solid ${skill.featured ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: '4px',
              fontSize: '13px',
              color: skill.featured ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              letterSpacing: '0.02em',
              cursor: 'default',
            }}
          >
            {skill.name}
          </div>
        ))}
      </div>
    </div>
  )
}
