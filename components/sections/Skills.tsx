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
        <div style={{ marginBottom: '36px', borderBottom: '1px solid var(--color-border)', paddingBottom: '20px' }}>
          <div className="text-label" style={{ marginBottom: '8px' }}>
            04 / Core Competencies & Tooling
          </div>
          <h2 className="text-display-sm">
            TECHNOLOGY<br />
            <span style={{ color: 'var(--color-accent)' }}>MATRIX</span> & CAPABILITIES.
          </h2>
        </div>

        {/* Interactive 3D Technology Constellation */}
        <div style={{ marginBottom: '40px' }}>
          <TechConstellationScene />
        </div>

        {/* Categorized Skills Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          {categories.map((category) => (
            <div
              key={category}
              className="glass-card card-3d-tilt"
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
                  marginBottom: '16px',
                  paddingBottom: '10px',
                  borderBottom: '1px solid var(--color-border)',
                  fontWeight: 600,
                }}
              >
                {category}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {skillsByCategory[category].map((skill) => (
                  <div
                    key={skill.id}
                    style={{
                      padding: '5px 11px',
                      borderRadius: 'var(--radius-sm)',
                      background: skill.featured
                        ? 'var(--color-accent-bg)'
                        : 'var(--color-surface)',
                      border: `1px solid ${
                        skill.featured ? 'var(--color-accent-border)' : 'var(--color-border)'
                      }`,
                      fontSize: '12px',
                      color: skill.featured ? 'var(--color-accent)' : 'var(--color-text)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 500,
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
