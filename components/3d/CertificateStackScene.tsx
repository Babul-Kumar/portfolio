'use client'

import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

interface CertificateSheetProps {
  position: [number, number, number]
  rotation: [number, number, number]
  index: number
  hovered: boolean
}

function CertificateSheet({
  position,
  rotation,
  index,
  hovered,
}: CertificateSheetProps) {
  const meshRef = useRef<THREE.Group>(null)

  // Document dimensions (proportions of standard certificate landscape: ~ 4:3)
  const width = 2.4
  const height = 1.68
  const thickness = 0.015

  // Layer offsets on hover
  const targetZ = hovered ? position[2] + (4 - index) * 0.18 : position[2]
  const targetRotX = hovered ? rotation[0] + 0.05 : rotation[0]
  const targetRotY = hovered ? rotation[1] + (index % 2 === 0 ? 0.06 : -0.06) : rotation[1]

  useFrame((_, delta) => {
    if (!meshRef.current) return
    meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, targetZ, 4, delta)
    meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, targetRotX, 4, delta)
    meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, targetRotY, 4, delta)
  })

  // Paper materials
  const paperColor = useMemo(() => {
    const tones = ['#FCFBF7', '#F5F3ED', '#EFECE4', '#E8E5DD', '#E0DDD4']
    return new THREE.Color(tones[index % tones.length])
  }, [index])

  const paperMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: paperColor,
        roughness: 0.85,
        metalness: 0.05,
      }),
    [paperColor]
  )

  const borderMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(index === 0 ? '#B65C3A' : '#D0C9BD'),
        roughness: 0.6,
        metalness: 0.1,
      }),
    [index]
  )

  const stampMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(index === 0 ? '#B65C3A' : '#8B7355'),
        roughness: 0.4,
        metalness: 0.3,
      }),
    [index]
  )

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
      {/* Main paper sheet body */}
      <mesh material={paperMaterial} castShadow receiveShadow>
        <boxGeometry args={[width, height, thickness]} />
      </mesh>

      {/* Decorative inset border line */}
      <mesh position={[0, 0, thickness / 2 + 0.002]} material={borderMaterial}>
        <ringGeometry args={[0.7, 0.708, 4]} />
      </mesh>

      {/* Outer border trim */}
      <lineSegments position={[0, 0, thickness / 2 + 0.001]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width * 0.94, height * 0.92, 0.001)]} />
        <lineBasicMaterial color={index === 0 ? '#B65C3A' : '#C8C1B3'} linewidth={1} />
      </lineSegments>

      {/* Subtle archival seal/stamp */}
      <mesh position={[width * 0.35, -height * 0.3, thickness / 2 + 0.003]} material={stampMaterial}>
        <cylinderGeometry args={[0.12, 0.12, 0.004, 24]} />
      </mesh>

      {/* Subtle header line representations */}
      <mesh position={[-width * 0.15, height * 0.28, thickness / 2 + 0.002]} material={borderMaterial}>
        <boxGeometry args={[width * 0.55, 0.015, 0.001]} />
      </mesh>
      <mesh position={[-width * 0.05, height * 0.15, thickness / 2 + 0.002]} material={borderMaterial}>
        <boxGeometry args={[width * 0.75, 0.01, 0.001]} />
      </mesh>
      <mesh position={[-width * 0.15, 0, thickness / 2 + 0.002]} material={borderMaterial}>
        <boxGeometry args={[width * 0.55, 0.008, 0.001]} />
      </mesh>
    </group>
  )
}

function StackGroup({
  mouse,
  hovered,
}: {
  mouse: React.RefObject<{ x: number; y: number }>
  hovered: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)

  const sheets = useMemo(
    () => [
      {
        position: [0, 0, 0.4] as [number, number, number],
        rotation: [-0.08, -0.12, 0.03] as [number, number, number],
        label: 'Machine Learning Specialization',
        issuer: 'Stanford & DeepLearning.AI',
        year: '2026',
      },
      {
        position: [0.15, 0.1, 0.15] as [number, number, number],
        rotation: [-0.02, 0.14, -0.05] as [number, number, number],
        label: 'Deep Learning Specialization',
        issuer: 'DeepLearning.AI',
        year: '2025',
      },
      {
        position: [-0.18, -0.08, -0.1] as [number, number, number],
        rotation: [0.06, -0.18, 0.04] as [number, number, number],
        label: 'TensorFlow Developer Certificate',
        issuer: 'Google',
        year: '2025',
      },
      {
        position: [0.22, -0.15, -0.35] as [number, number, number],
        rotation: [-0.1, 0.2, -0.08] as [number, number, number],
        label: 'Full Stack Open',
        issuer: 'University of Helsinki',
        year: '2024',
      },
      {
        position: [-0.25, 0.18, -0.6] as [number, number, number],
        rotation: [0.12, -0.25, 0.06] as [number, number, number],
        label: 'Generative AI Engineering',
        issuer: 'AWS & DeepLearning.AI',
        year: '2024',
      },
    ],
    []
  )

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()

    const mx = mouse.current?.x ?? 0
    const my = mouse.current?.y ?? 0

    // Subtle natural float + cursor parallax
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      Math.sin(t * 0.4) * 0.04 + mx * 0.25,
      0.05
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      Math.cos(t * 0.3) * 0.03 + my * -0.18,
      0.05
    )
    groupRef.current.position.y = Math.sin(t * 0.6) * 0.05
  })

  return (
    <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.25}>
      <group ref={groupRef}>
        {sheets.map((sheet, i) => (
          <CertificateSheet
            key={i}
            index={i}
            position={sheet.position}
            rotation={sheet.rotation}
            hovered={hovered}
          />
        ))}
      </group>
    </Float>
  )
}

export default function CertificateStackScene({
  mouse,
}: {
  mouse: React.RefObject<{ x: number; y: number }>
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{ width: '100%', height: '100%', cursor: 'grab' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-cursor-label="EXPLORE"
    >
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 38 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.75]}
      >
        {/* Museum lighting setup */}
        <ambientLight intensity={0.65} color="#FAF7F0" />
        <directionalLight position={[4, 4, 5]} intensity={1.4} color="#FFFBF2" castShadow />
        <directionalLight position={[-3, -2, -2]} intensity={0.45} color="#B65C3A" />
        <pointLight position={[0, 2, 2]} intensity={0.5} color="#FAF5EB" />

        <StackGroup mouse={mouse} hovered={hovered} />
      </Canvas>
    </div>
  )
}
