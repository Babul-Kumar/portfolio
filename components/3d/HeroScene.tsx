'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function SculpturalObject({ mouse }: { mouse: React.RefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null)

  // Build a parametric icosahedron-based sculpture
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 3), [])
  const innerGeo = useMemo(() => new THREE.OctahedronGeometry(0.6, 0), [])
  const ringGeo = useMemo(() => new THREE.TorusGeometry(1.35, 0.02, 8, 64), [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()

    // Subtle mouse-based rotation
    const mx = mouse.current?.x ?? 0
    const my = mouse.current?.y ?? 0

    groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.15 + mx * 0.3
    groupRef.current.rotation.x = Math.cos(t * 0.15) * 0.05 + my * -0.15
    groupRef.current.rotation.z = Math.sin(t * 0.1) * 0.03
  })

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#D4C5A9'),
        roughness: 0.3,
        metalness: 0.6,
      }),
    []
  )

  const wireframeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#B65C3A'),
        roughness: 0.5,
        metalness: 0.2,
        wireframe: true,
        opacity: 0.2,
        transparent: true,
      }),
    []
  )

  const ringMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#8B7355'),
        roughness: 0.25,
        metalness: 0.85,
      }),
    []
  )

  const innerMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#B65C3A'),
        roughness: 0.3,
        metalness: 0.75,
      }),
    []
  )

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Main icosphere */}
        <mesh geometry={geo} material={material} />
        {/* Wireframe overlay */}
        <mesh geometry={geo} material={wireframeMat} />
        {/* Inner octahedron */}
        <mesh geometry={innerGeo} material={innerMat} />
        {/* Orbital ring */}
        <mesh geometry={ringGeo} material={ringMat} rotation={[Math.PI / 2.5, 0.3, 0]} />
        {/* Second ring at different angle */}
        <mesh geometry={ringGeo} material={ringMat} rotation={[-Math.PI / 3, 0.8, 0.2]} />
      </group>
    </Float>
  )
}

export default function HeroScene({ mouse }: { mouse: React.RefObject<{ x: number; y: number }> }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 40 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.75]}
    >
      {/* Self-contained studio lighting (Zero external network dependencies) */}
      <ambientLight intensity={0.65} color="#FAF6EE" />
      <hemisphereLight args={['#FFFFFF', '#E6DEC8', 0.6]} />
      <directionalLight position={[4, 4, 4]} intensity={1.5} color="#FFF8EB" />
      <directionalLight position={[-3, -2, -3]} intensity={0.6} color="#B65C3A" />
      <pointLight position={[0, 2, 3]} intensity={0.8} color="#FAF4E8" />
      <SculpturalObject mouse={mouse} />
    </Canvas>
  )
}
