import * as THREE from 'three'

export interface GraphNodeDefinition {
  id: string
  position: [number, number, number]
  type: 'core' | 'primary' | 'secondary' | 'accent'
  label?: string
  priority: number // 1 = always show on mobile, 2 = tablet+, 3 = desktop only
}

export interface GraphEdgeDefinition {
  from: number // index in nodes
  to: number
  isHighlighted?: boolean
}

/* =========================================================================
   Carefully Bounded, Intentional AI Network Topology (18 Nodes, 24 Edges)
   All nodes strictly contained inside:
   x: [-1.25, +1.25]
   y: [-1.10, +1.10]
   z: [-0.35, +0.35]
   Maximum bounding radius: R <= 1.30
   ========================================================================= */

export const HERO_GRAPH_NODES: GraphNodeDefinition[] = [
  // 0: Central Core Hub
  { id: 'core', position: [0, 0, 0], type: 'core', label: 'CORE', priority: 1 },

  // 1-4: Inner Core Surround Ring
  { id: 'core-tr', position: [0.36, 0.24, 0.18], type: 'accent', priority: 1 },
  { id: 'core-tl', position: [-0.36, 0.24, -0.18], type: 'accent', priority: 1 },
  { id: 'core-br', position: [0.36, -0.24, -0.18], type: 'accent', priority: 1 },
  { id: 'core-bl', position: [-0.36, -0.24, 0.18], type: 'accent', priority: 1 },

  // 5-8: Model Layer (Top Cluster)
  { id: 'model-apex', position: [0.0, 1.05, 0.1], type: 'primary', label: 'MODEL', priority: 1 },
  { id: 'model-left', position: [-0.55, 0.75, -0.2], type: 'secondary', priority: 2 },
  { id: 'model-right', position: [0.55, 0.75, 0.22], type: 'secondary', priority: 2 },
  { id: 'model-mid', position: [-0.15, 0.58, 0.28], type: 'secondary', priority: 3 },

  // 9-12: Data & Vector Layer (Left Cluster)
  { id: 'data-anchor', position: [-1.15, 0.42, -0.15], type: 'primary', label: 'DATA', priority: 2 },
  { id: 'data-mid', position: [-0.9, -0.15, 0.25], type: 'secondary', priority: 2 },
  { id: 'data-upper', position: [-0.8, 0.52, 0.1], type: 'secondary', priority: 3 },
  { id: 'data-lower', position: [-0.98, -0.52, -0.18], type: 'secondary', priority: 3 },

  // 13-16: Agent & Orchestration Layer (Right Cluster)
  { id: 'agent-anchor', position: [1.12, 0.32, 0.18], type: 'primary', label: 'AGENT', priority: 2 },
  { id: 'agent-mid', position: [0.85, -0.18, -0.25], type: 'secondary', priority: 2 },
  { id: 'agent-upper', position: [0.75, 0.55, -0.18], type: 'secondary', priority: 3 },
  { id: 'agent-lower', position: [0.98, -0.58, 0.14], type: 'secondary', priority: 3 },

  // 17-18: Inference & Output Layer (Bottom Cluster)
  { id: 'infer-apex', position: [0.08, -0.95, -0.1], type: 'primary', priority: 2 },
  { id: 'infer-left', position: [-0.42, -0.8, 0.22], type: 'secondary', priority: 3 },
]

export const HERO_GRAPH_EDGES: GraphEdgeDefinition[] = [
  // Core to Inner Ring
  { from: 0, to: 1, isHighlighted: true },
  { from: 0, to: 2, isHighlighted: true },
  { from: 0, to: 3, isHighlighted: true },
  { from: 0, to: 4, isHighlighted: true },

  // Core & Ring to Primary Anchors
  { from: 0, to: 5, isHighlighted: true }, // Core -> Model
  { from: 0, to: 9, isHighlighted: true }, // Core -> Data
  { from: 0, to: 13, isHighlighted: true }, // Core -> Agent
  { from: 0, to: 17, isHighlighted: true }, // Core -> Infer

  // Model Cluster Structural Edges
  { from: 5, to: 6 },
  { from: 5, to: 7 },
  { from: 6, to: 8 },
  { from: 7, to: 8 },
  { from: 8, to: 1 },
  { from: 6, to: 2 },

  // Data Cluster Structural Edges
  { from: 9, to: 11 },
  { from: 9, to: 10 },
  { from: 10, to: 12 },
  { from: 11, to: 2 },
  { from: 10, to: 4 },

  // Agent Cluster Structural Edges
  { from: 13, to: 15 },
  { from: 13, to: 14 },
  { from: 14, to: 16 },
  { from: 15, to: 1 },
  { from: 14, to: 3 },

  // Inference Cluster Structural Edges
  { from: 17, to: 18 },
  { from: 18, to: 4 },
  { from: 17, to: 3 },
  { from: 16, to: 17 },
  { from: 12, to: 18 },
]

export function getGraphVectors(): THREE.Vector3[] {
  return HERO_GRAPH_NODES.map((n) => new THREE.Vector3(...n.position))
}
