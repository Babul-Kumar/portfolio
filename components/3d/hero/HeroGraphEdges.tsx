'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HERO_GRAPH_NODES, HERO_GRAPH_EDGES } from './hero-topology'

interface HeroGraphEdgesProps {
  isLight: boolean
  isMobile?: boolean
}

export default function HeroGraphEdges({ isLight, isMobile }: HeroGraphEdgesProps) {
  const signalPointsRef = useRef<THREE.Points>(null)

  // Colors
  const standardLineColor = isLight ? '#9E978F' : '#52525B'
  const highlightLineColor = isLight ? '#D45024' : '#FF6B35'
  const packetColor = isLight ? '#D45024' : '#FF7844'

  // Build edge geometries from topology
  const { standardGeo, highlightGeo, activeEdgeList } = useMemo(() => {
    const sPoints: THREE.Vector3[] = []
    const hPoints: THREE.Vector3[] = []
    const edges: { from: THREE.Vector3; to: THREE.Vector3 }[] = []

    const maxPriority = isMobile ? 2 : 3

    for (const edge of HERO_GRAPH_EDGES) {
      const fromNode = HERO_GRAPH_NODES[edge.from]
      const toNode = HERO_GRAPH_NODES[edge.to]

      if (!fromNode || !toNode) continue
      if (fromNode.priority > maxPriority || toNode.priority > maxPriority) continue

      const vFrom = new THREE.Vector3(...fromNode.position)
      const vTo = new THREE.Vector3(...toNode.position)

      edges.push({ from: vFrom, to: vTo })

      if (edge.isHighlighted) {
        hPoints.push(vFrom, vTo)
      } else {
        sPoints.push(vFrom, vTo)
      }
    }

    const sGeo = new THREE.BufferGeometry().setFromPoints(sPoints)
    const hGeo = new THREE.BufferGeometry().setFromPoints(hPoints)

    return { standardGeo: sGeo, highlightGeo: hGeo, activeEdgeList: edges }
  }, [isMobile])

  // Data Signal Packets (Controlled count: 14 packets)
  const packetCount = isMobile ? 10 : 16
  const signalGeo = useMemo(() => {
    const positions = new Float32Array(packetCount * 3)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [packetCount])

  // Materials
  const standardLineMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(standardLineColor),
        transparent: true,
        opacity: isLight ? 0.4 : 0.45,
      }),
    [standardLineColor, isLight]
  )

  const highlightLineMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(highlightLineColor),
        transparent: true,
        opacity: isLight ? 0.7 : 0.8,
      }),
    [highlightLineColor, isLight]
  )

  const signalMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color(packetColor),
        size: isLight ? 0.065 : 0.075,
        transparent: true,
        opacity: isLight ? 0.85 : 0.95,
        blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
      }),
    [packetColor, isLight]
  )

  // Cleanup
  useEffect(() => {
    return () => {
      standardGeo.dispose()
      highlightGeo.dispose()
      signalGeo.dispose()

      standardLineMat.dispose()
      highlightLineMat.dispose()
      signalMat.dispose()
    }
  }, [standardGeo, highlightGeo, signalGeo, standardLineMat, highlightLineMat, signalMat])

  // Animation: Traverse data packets along active paths
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (signalPointsRef.current && activeEdgeList.length > 0) {
      const pos = signalPointsRef.current.geometry.attributes.position
      const arr = pos.array as Float32Array

      for (let i = 0; i < packetCount; i++) {
        const edgeIndex = (i * 2 + Math.floor(t * 0.3)) % activeEdgeList.length
        const edge = activeEdgeList[edgeIndex]
        const progress = ((t * 0.4 + i * (1 / packetCount)) % 1)
        const currentPos = edge.from.clone().lerp(edge.to, progress)

        arr[i * 3] = currentPos.x
        arr[i * 3 + 1] = currentPos.y
        arr[i * 3 + 2] = currentPos.z
      }
      pos.needsUpdate = true
    }
  })

  return (
    <group>
      <lineSegments geometry={standardGeo} material={standardLineMat} />
      <lineSegments geometry={highlightGeo} material={highlightLineMat} />
      <points ref={signalPointsRef} geometry={signalGeo} material={signalMat} />
    </group>
  )
}
