'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import HeroGraphNodes from './HeroGraphNodes'
import HeroGraphEdges from './HeroGraphEdges'
import HeroGraphLabels from './HeroGraphLabels'

interface Hero3DSceneProps {
  mouse: React.RefObject<{ x: number; y: number }>
  isLight: boolean
}

function ResponsiveCameraController() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const { size } = useThree()

  useFrame(() => {
    const cam = cameraRef.current
    if (!cam) return

    const aspect = size.width / Math.max(size.height, 1)

    // Base distance required to frame radius R = 1.30 with 25% margin
    let targetDist = 3.9
    if (size.width < 600) {
      targetDist = 4.9
    } else if (size.width < 960) {
      targetDist = 4.3
    }

    // If container is narrow (aspect < 1.1), pull back to guarantee no side clipping
    if (aspect < 1.1) {
      targetDist *= 1.1 / Math.max(aspect, 0.65)
    }

    const curZ = cam.position.z
    const newZ = THREE.MathUtils.lerp(curZ, targetDist, 0.1)
    const newY = THREE.MathUtils.lerp(cam.position.y, 0.15, 0.1)
    const newX = THREE.MathUtils.lerp(cam.position.x, 0.0, 0.1)

    cam.position.set(newX, newY, newZ)
    cam.lookAt(0, 0, 0)
    cam.updateProjectionMatrix()
  })

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0.15, 4.2]} fov={38} />
}

export default function Hero3DScene({ mouse, isLight }: Hero3DSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { size } = useThree()

  const screenSize = useMemo<'desktop' | 'tablet' | 'mobile'>(() => {
    if (size.width < 600) return 'mobile'
    if (size.width < 960) return 'tablet'
    return 'desktop'
  }, [size.width])

  const isMobile = screenSize === 'mobile'

  // Gentle, stable rotation with subtle cursor parallax
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const targetX = (mouse.current?.x ?? 0) * 0.12
    const targetY = (mouse.current?.y ?? 0) * -0.08

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        t * 0.06 + targetX,
        2.0,
        delta
      )
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        Math.sin(t * 0.04) * 0.04 + targetY,
        2.0,
        delta
      )
    }
  })

  return (
    <>
      <ResponsiveCameraController />

      {/* Lighting Setup */}
      <ambientLight intensity={isLight ? 0.95 : 0.6} color="#FFFFFF" />
      <directionalLight
        position={[4, 5, 4]}
        intensity={isLight ? 1.3 : 1.5}
        color={isLight ? '#FFFFFF' : '#FFF5EB'}
      />
      <directionalLight
        position={[-3, -2, -3]}
        intensity={0.6}
        color={isLight ? '#D45024' : '#E45D2C'}
      />
      <pointLight
        position={[0, 0, 0]}
        intensity={isLight ? 1.2 : 1.8}
        color={isLight ? '#D45024' : '#FF6B35'}
        distance={3.5}
      />

      {/* Floating 3D AI Graph Structure */}
      <Float speed={0.9} rotationIntensity={0.03} floatIntensity={0.15}>
        <group ref={groupRef} position={[0, 0, 0]}>
          <HeroGraphNodes isLight={isLight} isMobile={isMobile} />
          <HeroGraphEdges isLight={isLight} isMobile={isMobile} />
          <HeroGraphLabels isLight={isLight} screenSize={screenSize} />
        </group>
      </Float>
    </>
  )
}
