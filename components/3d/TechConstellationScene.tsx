'use client'

import { useState } from 'react'

interface TechNode {
  id: string
  name: string
  category: 'AI / ML' | 'Frontend' | 'Backend' | 'Systems & DevOps' | 'Core'
  level: 'Expert' | 'Advanced' | 'Intermediate'
  description: string
  projects: string[]
  x: number // percentage
  y: number // percentage
}

const TECH_NODES: TechNode[] = [
  {
    id: 'babul',
    name: 'BABUL KUMAR',
    category: 'Core',
    level: 'Expert',
    description: 'AI/ML & Full-Stack Systems Engineer building intelligent developer tools and predictive models.',
    projects: ['BotBro', 'Flight Delay Prediction', 'Smart System Monitor', 'Steganography Detector'],
    x: 50,
    y: 50,
  },
  {
    id: 'python',
    name: 'Python',
    category: 'AI / ML',
    level: 'Expert',
    description: 'Primary language for ML modeling, AST analysis, scientific computing, and backend microservices.',
    projects: ['BotBro', 'Flight Delay Prediction', 'Smart System Monitor', 'Steganography Detector'],
    x: 24,
    y: 28,
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    category: 'AI / ML',
    level: 'Advanced',
    description: 'Supervised & unsupervised learning, XGBoost, Random Forests, model evaluation, and feature engineering.',
    projects: ['Flight Delay Prediction', 'Stanford ML Specialization'],
    x: 18,
    y: 62,
  },
  {
    id: 'pytorch',
    name: 'Deep Learning / PyTorch',
    category: 'AI / ML',
    level: 'Intermediate',
    description: 'Neural networks, CNNs for computer vision, sequence models, and Transformer fine-tuning.',
    projects: ['Steganography Detector', 'DeepLearning.AI Specialization'],
    x: 34,
    y: 78,
  },
  {
    id: 'genai',
    name: 'Generative AI & LLMs',
    category: 'AI / ML',
    level: 'Advanced',
    description: 'Model Context Protocol (MCP), prompt orchestration, function calling, and AST-aware agentic loops.',
    projects: ['BotBro', 'Global AI Hackathon 2026'],
    x: 36,
    y: 18,
  },
  {
    id: 'cv',
    name: 'Computer Vision',
    category: 'AI / ML',
    level: 'Advanced',
    description: 'OpenCV image forensics, spatial domain entropy analysis, and feature extraction.',
    projects: ['Steganography Detector'],
    x: 15,
    y: 44,
  },
  {
    id: 'ts',
    name: 'TypeScript / JS',
    category: 'Frontend',
    level: 'Advanced',
    description: 'Type-safe frontend development, asynchronous streaming architectures, and AST tooling.',
    projects: ['BotBro', 'Portfolio', 'Full Stack Open'],
    x: 76,
    y: 28,
  },
  {
    id: 'nextjs',
    name: 'Next.js & React',
    category: 'Frontend',
    level: 'Advanced',
    description: 'App router, Server Components, WebGL integration, state management, and modern responsive UI/UX.',
    projects: ['Portfolio', 'Full Stack Open'],
    x: 82,
    y: 48,
  },
  {
    id: 'fastapi',
    name: 'FastAPI & Node.js',
    category: 'Backend',
    level: 'Advanced',
    description: 'High-performance async REST APIs, WebSocket streaming, and Python sidecar integration.',
    projects: ['BotBro', 'Flight Delay Prediction API'],
    x: 64,
    y: 78,
  },
  {
    id: 'sql',
    name: 'SQL & PostgreSQL',
    category: 'Backend',
    level: 'Advanced',
    description: 'Relational data modeling, indexing optimization, time-series metrics, and Supabase integrations.',
    projects: ['Smart System Monitor', 'Portfolio Supabase'],
    x: 78,
    y: 70,
  },
  {
    id: 'docker',
    name: 'Git & Docker',
    category: 'Systems & DevOps',
    level: 'Intermediate',
    description: 'Containerized deployment workflows, reproducible environments, and CI/CD pipelines.',
    projects: ['BotBro', 'System Monitor Telemetry'],
    x: 62,
    y: 16,
  },
]

export default function TechConstellationScene() {
  const [selectedId, setSelectedId] = useState<string>('babul')
  const selectedNode = TECH_NODES.find((n) => n.id === selectedId) || TECH_NODES[0]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.4fr) 1fr',
        gap: '40px',
        alignItems: 'center',
      }}
      className="tech-constellation-container"
    >
      {/* Visual Constellation Map */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1.25',
          minHeight: '380px',
          background: 'radial-gradient(circle at 50% 50%, var(--color-accent-bg) 0%, transparent 75%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          padding: '24px',
        }}
        className="constellation-canvas"
      >
        {/* SVG Connection Lines */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {TECH_NODES.filter((n) => n.id !== 'babul').map((node) => {
            const isHighlighted = selectedId === node.id || selectedId === 'babul'
            return (
              <line
                key={node.id}
                x1="50%"
                y1="50%"
                x2={`${node.x}%`}
                y2={`${node.y}%`}
                stroke={isHighlighted ? 'var(--color-accent)' : 'var(--color-border)'}
                strokeWidth={isHighlighted ? 1.5 : 1}
                strokeDasharray={isHighlighted ? 'none' : '4 4'}
                opacity={isHighlighted ? 0.85 : 0.4}
                style={{ transition: 'all 0.35s ease' }}
              />
            )
          })}
        </svg>

        {/* Constellation Nodes */}
        {TECH_NODES.map((node) => {
          const isSelected = selectedId === node.id
          const isCore = node.id === 'babul'

          return (
            <button
              key={node.id}
              onClick={() => setSelectedId(node.id)}
              onMouseEnter={() => setSelectedId(node.id)}
              aria-label={`Select technology: ${node.name}`}
              style={{
                position: 'absolute',
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                background: isSelected
                  ? isCore
                    ? 'var(--color-accent)'
                    : 'var(--color-surface-2)'
                  : isCore
                  ? 'var(--color-accent-bg)'
                  : 'var(--color-surface)',
                border: `1px solid ${
                  isSelected
                    ? 'var(--color-accent)'
                    : isCore
                    ? 'var(--color-accent-border)'
                    : 'var(--color-border)'
                }`,
                borderRadius: isCore ? 'var(--radius-md)' : 'var(--radius-full)',
                padding: isCore ? '10px 18px' : '7px 14px',
                color: isSelected && isCore ? '#FFFFFF' : isSelected ? 'var(--color-accent)' : 'var(--color-text)',
                fontSize: isCore ? '12px' : '11px',
                fontWeight: isCore ? 600 : 500,
                letterSpacing: isCore ? '0.08em' : '0.02em',
                cursor: 'pointer',
                transition: 'all 0.25s var(--ease-out)',
                boxShadow: isSelected
                  ? '0 0 20px var(--color-accent-glow)'
                  : 'var(--shadow-sm)',
                whiteSpace: 'nowrap',
                zIndex: isSelected ? 10 : 2,
                backdropFilter: 'blur(8px)',
              }}
            >
              {isCore ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="status-pulse" /> {node.name}
                </span>
              ) : (
                node.name
              )}
            </button>
          )
        })}
      </div>

      {/* Node Inspector Details Panel */}
      <div
        className="glass-card"
        style={{
          padding: '32px',
          minHeight: '380px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Category Tag & Proficiency Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {selectedNode.category}
            </span>

            <span
              style={{
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-accent-bg)',
                border: '1px solid var(--color-accent-border)',
                color: 'var(--color-accent)',
                fontWeight: 500,
              }}
            >
              {selectedNode.level}
            </span>
          </div>

          {/* Node Title */}
          <h3
            style={{
              fontSize: '24px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--color-text)',
              marginBottom: '12px',
            }}
          >
            {selectedNode.name}
          </h3>

          {/* Description */}
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.65,
              marginBottom: '28px',
            }}
          >
            {selectedNode.description}
          </p>

          {/* Associated Projects */}
          <div>
            <div
              style={{
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginBottom: '10px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Applied In Projects
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedNode.projects.map((proj) => (
                <span
                  key={proj}
                  style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  {proj}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Prompt */}
        <div
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          Hover or click any node to explore connections
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .tech-constellation-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
