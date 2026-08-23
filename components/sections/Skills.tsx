'use client'

import type { SkillsByCategory } from '@/types'
import TechConstellationScene from '@/components/3d/TechConstellationScene'

export default function SkillsSection({
  skillsByCategory,
}: {
  skillsByCategory: SkillsByCategory
}) {
  const categories = Object.keys(skillsByCategory)

  return (
    <section id="skills" className="section">
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '48px', borderBottom: '1px solid var(--color-border)', paddingBottom: '24px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>
            05 / Capabilities
          </div>
          <h2 className="text-display-sm">
            TECHNOLOGY /<br />STACK
          </h2>
        </div>

        {/* Interactive 3D Technology Constellation */}
        <div style={{ marginBottom: '64px' }}>
          <TechConstellationScene />
        </div>

        {/* Categorized Skills Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
          }}
        >
          {categories.map((category) => (
            <div
              key={category}
              className="glass-card"
              style={{
                padding: '24px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  marginBottom: '18px',
                  paddingBottom: '10px',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {category}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {skillsByCategory[category].map((skill) => (
                  <div
                    key={skill.id}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: skill.featured
                        ? 'rgba(229, 106, 61, 0.08)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${
                        skill.featured ? 'var(--color-accent-border)' : 'var(--color-border)'
                      }`,
                      fontSize: '12px',
                      color: skill.featured ? 'var(--color-accent)' : 'var(--color-text)',
                      fontFamily: 'var(--font-mono)',
                      transition: 'all 0.2s ease',
                      cursor: 'default',
                    }}
                  >
                    {skill.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
