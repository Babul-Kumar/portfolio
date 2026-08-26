'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HERO_GRAPH_NODES } from './hero-topology'

interface HeroGraphNodesProps {
  isLight: boolean
  isMobile?: boolean
}

export default function HeroGraphNodes({ isLight, isMobile }: HeroGraphNodesProps) {
  const coreGroupRef = useRef<THREE.Group>(null)
  const innerCoreRef = useRef<THREE.Mesh>(null)

  // Color tokens
  const coreColor = isLight ? '#D45024' : '#FF6B35'
  const activeNodeColor = isLight ? '#D45024' : '#FF7844'
  const primaryNodeColor = isLight ? '#2A2724' : '#CBD5E1'
  const secondaryNodeColor = isLight ? '#0F766E' : '#2DD4BF'

  // Scale factor for mobile
  const sizeMultiplier = isMobile ? 0.85 : 1.0

  // Core Geometries (Refined proportions: 0.20 radius outer, 0.10 inner)
  const coreGeo = useMemo(() => new THREE.OctahedronGeometry(0.20 * sizeMultiplier, 0), [sizeMultiplier])
  const coreWireGeo = useMemo(() => new THREE.OctahedronGeometry(0.225 * sizeMultiplier, 0), [sizeMultiplier])
  const innerCoreGeo = useMemo(() => new THREE.IcosahedronGeometry(0.10 * sizeMultiplier, 0), [sizeMultiplier])

  // Node Geometries
  const primaryGeo = useMemo(() => new THREE.SphereGeometry(0.045 * sizeMultiplier, 16, 16), [sizeMultiplier])
  const secondaryGeo = useMemo(() => new THREE.SphereGeometry(0.032 * sizeMultiplier, 12, 12), [sizeMultiplier])
  const accentGeo = useMemo(() => new THREE.SphereGeometry(0.048 * sizeMultiplier, 16, 16), [sizeMultiplier])

  // Materials
  const coreMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(coreColor),
        emissive: new THREE.Color(coreColor),
        emissiveIntensity: isLight ? 0.4 : 0.9,
        roughness: 0.2,
        metalness: 0.8,
      }),
    [coreColor, isLight]
  )

  const coreWireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(coreColor),
        wireframe: true,
        transparent: true,
        opacity: isLight ? 0.65 : 0.85,
      }),
    [coreColor, isLight]
  )

  const innerCoreMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(secondaryNodeColor),
        emissive: new THREE.Color(secondaryNodeColor),
        emissiveIntensity: isLight ? 0.5 : 1.1,
        roughness: 0.1,
      }),
    [secondaryNodeColor, isLight]
  )

  const primaryMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(primaryNodeColor),
        roughness: 0.25,
        metalness: isLight ? 0.1 : 0.6,
      }),
    [primaryNodeColor, isLight]
  )

  const secondaryMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(secondaryNodeColor),
        emissive: new THREE.Color(secondaryNodeColor),
        emissiveIntensity: isLight ? 0.35 : 0.75,
        roughness: 0.2,
      }),
    [secondaryNodeColor, isLight]
  )

  const accentMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(activeNodeColor),
        emissive: new THREE.Color(activeNodeColor),
        emissiveIntensity: isLight ? 0.45 : 0.95,
        roughness: 0.15,
      }),
    [activeNodeColor, isLight]
  )

  // Cleanup
  useEffect(() => {
    return () => {
      coreGeo.dispose()
      coreWireGeo.dispose()
      innerCoreGeo.dispose()
      primaryGeo.dispose()
      secondaryGeo.dispose()
      accentGeo.dispose()

      coreMat.dispose()
      coreWireMat.dispose()
      innerCoreMat.dispose()
      primaryMat.dispose()
      secondaryMat.dispose()
      accentMat.dispose()
    }
  }, [
    coreGeo,
    coreWireGeo,
    innerCoreGeo,
    primaryGeo,
    secondaryGeo,
    accentGeo,
    coreMat,
    coreWireMat,
    innerCoreMat,
    primaryMat,
    secondaryMat,
    accentMat,
  ])

  // Subtle core breathing animation
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (coreGroupRef.current) {
      coreGroupRef.current.rotation.y = t * 0.22
      coreGroupRef.current.rotation.z = Math.sin(t * 0.2) * 0.12
      const scale = 1 + Math.sin(t * 1.8) * 0.04
      coreGroupRef.current.scale.set(scale, scale, scale)
    }

    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.x = -t * 0.45
      innerCoreRef.current.rotation.y = t * 0.35
    }
  })

  // Filter nodes based on priority (mobile shows priority 1 and 2 only)
  const visibleNodes = useMemo(() => {
    if (isMobile) {
      return HERO_GRAPH_NODES.filter((n) => n.priority <= 2)
    }
    return HERO_GRAPH_NODES
  }, [isMobile])

  return (
    <group>
      {/* Central Core Octahedron */}
      <group ref={coreGroupRef} position={[0, 0, 0]}>
        <mesh geometry={coreGeo} material={coreMat} />
        <mesh geometry={coreWireGeo} material={coreWireMat} />
        <mesh ref={innerCoreRef} geometry={innerCoreGeo} material={innerCoreMat} />
      </group>

      {/* Network Nodes */}
      {visibleNodes.map((node) => {
        if (node.type === 'core') return null // rendered above
        const geo =
          node.type === 'accent'
            ? accentGeo
            : node.type === 'primary'
            ? primaryGeo
            : secondaryGeo
        const mat =
          node.type === 'accent'
            ? accentMat
            : node.type === 'primary'
            ? primaryMat
            : secondaryMat

        return (
          <mesh
            key={node.id}
            position={node.position}
            geometry={geo}
            material={mat}
          />
        )
      })}
    </group>
  )
}
