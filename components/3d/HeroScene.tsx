'use client'

import { useRef, useMemo, useEffect, useSyncExternalStore } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

interface HeroSceneProps {
  mouse: React.RefObject<{ x: number; y: number }>
  isVisible?: boolean
}

function getThemeSnapshot(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'dark'
}

function subscribeTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

function createParticleGeometry(count = 75) {
  const positions = new Float32Array(count * 3)
  const scales = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const u = (i + 0.5) / count
    const theta = i * 2.399963229728653
    const phi = Math.acos(2 * u - 1)
    const radius = 1.15 + (Math.sin(i * 12.9898) * 0.5 + 0.5) * 1.4

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    scales[i] = (Math.cos(i * 78.233) * 0.5 + 0.5) * 0.8 + 0.2
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('scale', new THREE.BufferAttribute(scales, 1))
  return geo
}

function ComputationalCore({
  mouse,
  isLight,
}: {
  mouse: React.RefObject<{ x: number; y: number }>
  isLight: boolean
}) {
  const coreRef = useRef<THREE.Group>(null)
  const outerRingRef = useRef<THREE.Mesh>(null)
  const midRingRef = useRef<THREE.Mesh>(null)
  const innerRingRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const telemetryNodesRef = useRef<THREE.Group>(null)

  // Geometries
  const coreGeo = useMemo(() => new THREE.IcosahedronGeometry(0.88, 2), [])
  const innerCoreGeo = useMemo(() => new THREE.OctahedronGeometry(0.52, 0), [])
  const outerRingGeo = useMemo(() => new THREE.TorusGeometry(1.58, 0.014, 16, 64), [])
  const midRingGeo = useMemo(() => new THREE.TorusGeometry(1.28, 0.012, 16, 64), [])
  const innerRingGeo = useMemo(() => new THREE.TorusGeometry(1.04, 0.01, 16, 48), [])
  const telemetryNodeGeo = useMemo(() => new THREE.SphereGeometry(0.024, 8, 8), [])
  const particleGeo = useMemo(() => createParticleGeometry(75), [])

  // Palette colors based on light vs dark theme
  const accentColor = isLight ? '#D95428' : '#E45D2C'
  const coreColor = isLight ? '#2B2824' : '#101318'
  const ringColor = isLight ? '#736E67' : '#88847E'

  // Materials designed for high visual aesthetic across both light & dark themes
  const coreMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(coreColor),
        roughness: isLight ? 0.35 : 0.2,
        metalness: isLight ? 0.6 : 0.85,
        wireframe: false,
      }),
    [coreColor, isLight]
  )

  const wireframeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(accentColor),
        emissive: new THREE.Color(accentColor),
        emissiveIntensity: isLight ? 0.45 : 0.75,
        wireframe: true,
        transparent: true,
        opacity: isLight ? 0.5 : 0.6,
      }),
    [accentColor, isLight]
  )

  const innerCoreMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(accentColor),
        emissive: new THREE.Color(accentColor),
        emissiveIntensity: isLight ? 0.6 : 0.9,
        roughness: 0.1,
        metalness: 0.9,
      }),
    [accentColor, isLight]
  )

  const ringMat1 = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(ringColor),
        roughness: 0.35,
        metalness: 0.8,
        transparent: true,
        opacity: isLight ? 0.45 : 0.6,
      }),
    [ringColor, isLight]
  )

  const ringMat2 = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(accentColor),
        emissive: new THREE.Color(accentColor),
        emissiveIntensity: isLight ? 0.4 : 0.6,
        roughness: 0.2,
        metalness: 0.85,
      }),
    [accentColor, isLight]
  )

  const particleMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color(accentColor),
        size: 0.034,
        transparent: true,
        opacity: isLight ? 0.6 : 0.75,
        blending: THREE.AdditiveBlending,
      }),
    [accentColor, isLight]
  )

  const nodeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(accentColor),
        emissive: new THREE.Color(accentColor),
        emissiveIntensity: 0.8,
        roughness: 0.1,
      }),
    [accentColor]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      coreGeo.dispose()
      innerCoreGeo.dispose()
      outerRingGeo.dispose()
      midRingGeo.dispose()
      innerRingGeo.dispose()
      telemetryNodeGeo.dispose()
      particleGeo.dispose()
      coreMat.dispose()
      wireframeMat.dispose()
      innerCoreMat.dispose()
      ringMat1.dispose()
      ringMat2.dispose()
      particleMat.dispose()
      nodeMat.dispose()
    }
  }, [
    coreGeo,
    innerCoreGeo,
    outerRingGeo,
    midRingGeo,
    innerRingGeo,
    telemetryNodeGeo,
    particleGeo,
    coreMat,
    wireframeMat,
    innerCoreMat,
    ringMat1,
    ringMat2,
    particleMat,
    nodeMat,
  ])

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime

    // Smooth cursor inertia tracking without React state updates
    const targetX = (mouse.current?.x ?? 0) * 0.32
    const targetY = (mouse.current?.y ?? 0) * -0.22

    if (coreRef.current) {
      coreRef.current.rotation.y = THREE.MathUtils.damp(
        coreRef.current.rotation.y,
        t * 0.12 + targetX,
        3,
        delta
      )
      coreRef.current.rotation.x = THREE.MathUtils.damp(
        coreRef.current.rotation.x,
        Math.sin(t * 0.08) * 0.07 + targetY,
        3,
        delta
      )
      coreRef.current.rotation.z = Math.sin(t * 0.06) * 0.04
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = t * 0.16
      outerRingRef.current.rotation.y = t * 0.12
    }

    if (midRingRef.current) {
      midRingRef.current.rotation.x = -t * 0.14 + 0.4
      midRingRef.current.rotation.z = t * 0.18
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.y = t * 0.24
      innerRingRef.current.rotation.z = -t * 0.12
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.035
      particlesRef.current.rotation.x = Math.sin(t * 0.03) * 0.035
    }

    if (telemetryNodesRef.current) {
      telemetryNodesRef.current.rotation.y = -t * 0.14
      telemetryNodesRef.current.rotation.z = t * 0.08
    }
  })

  return (
    <Float speed={1.3} rotationIntensity={0.1} floatIntensity={0.32}>
      <group ref={coreRef}>
        {/* Main Solid Icosahedron */}
        <mesh geometry={coreGeo} material={coreMat} />

        {/* Emissive Glowing Wireframe Cage */}
        <mesh geometry={coreGeo} material={wireframeMat} scale={1.02} />

        {/* Inner Pulsating Quantum Core */}
        <mesh geometry={innerCoreGeo} material={innerCoreMat} />

        {/* Multi-axis Orbital Telemetry Rings */}
        <mesh ref={outerRingRef} geometry={outerRingGeo} material={ringMat1} />
        <mesh
          ref={midRingRef}
          geometry={midRingGeo}
          material={ringMat2}
          rotation={[Math.PI / 3, 0.4, 0]}
        />
        <mesh
          ref={innerRingRef}
          geometry={innerRingGeo}
          material={ringMat1}
          rotation={[-Math.PI / 4, 0.2, 0.6]}
        />

        {/* Telemetry Orbit Nodes */}
        <group ref={telemetryNodesRef}>
          <mesh position={[1.58, 0, 0]} geometry={telemetryNodeGeo} material={nodeMat} />
          <mesh position={[-1.58, 0, 0]} geometry={telemetryNodeGeo} material={nodeMat} />
          <mesh position={[0, 1.28, 0]} geometry={telemetryNodeGeo} material={nodeMat} />
          <mesh position={[0, -1.28, 0]} geometry={telemetryNodeGeo} material={nodeMat} />
        </group>

        {/* Floating Neural Particles */}
        <points ref={particlesRef} geometry={particleGeo} material={particleMat} />
      </group>
    </Float>
  )
}

export default function HeroScene({ mouse, isVisible = true }: HeroSceneProps) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark' as const)
  const isLight = theme === 'light'

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 4.0], fov: 42 }}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          depth: true,
        }}
        dpr={[1, 1.6]}
        frameloop={isVisible ? 'always' : 'never'}
      >
        {/* Balanced Studio Lighting */}
        <ambientLight intensity={isLight ? 0.9 : 0.6} color="#FFFFFF" />
        <directionalLight
          position={[4, 5, 4]}
          intensity={isLight ? 1.4 : 1.6}
          color={isLight ? '#FFFFFF' : '#FFF7F0'}
        />
        <directionalLight
          position={[-4, -3, -2]}
          intensity={0.7}
          color={isLight ? '#D95428' : '#E45D2C'}
        />
        <pointLight
          position={[0, 0, 0]}
          intensity={1.2}
          color={isLight ? '#D95428' : '#E45D2C'}
          distance={3.2}
        />
        <pointLight position={[2, 3, 2]} intensity={0.5} color="#FAF4EE" distance={6} />

        <ComputationalCore mouse={mouse} isLight={isLight} />
      </Canvas>
    </div>
  )
}
