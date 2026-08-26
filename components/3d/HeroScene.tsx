'use client'

import { useRef, useMemo, useEffect, useSyncExternalStore } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Html, PerspectiveCamera } from '@react-three/drei'
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

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function subscribeNoop() {
  return () => {}
}

/* =========================================================================
   Deterministic 3D Network Topology (32 Spatial Nodes)
   ========================================================================= */
const NODE_COORDINATES: [number, number, number][] = [
  // Ingress & Data Layer (Left / Top-Left)
  [-1.5, 0.9, -0.3],
  [-1.3, 1.2, 0.4],
  [-1.6, 0.4, 0.2],
  [-1.1, 0.7, -0.6],
  [-1.2, 0.2, 0.5],
  [-0.9, 1.0, 0.2],

  // Model & Weight Matrix (Top & Mid-Upper)
  [-0.5, 1.3, -0.2],
  [0.0, 1.4, 0.3],
  [0.6, 1.2, -0.4],
  [-0.4, 0.8, 0.6],
  [0.3, 0.9, -0.2],
  [0.5, 0.7, 0.5],

  // Central Core Surround (Cluster around [0,0,0])
  [-0.55, 0.2, -0.4],
  [0.55, 0.2, -0.3],
  [-0.45, -0.3, 0.45],
  [0.45, -0.3, 0.4],
  [0.0, 0.45, 0.0],
  [0.0, -0.45, 0.0],
  [-0.4, 0.0, 0.4],
  [0.4, 0.0, -0.4],

  // Inference & Vector Cluster (Right / Mid-Right)
  [1.0, 0.8, -0.2],
  [1.3, 0.5, 0.3],
  [1.5, 0.1, -0.4],
  [1.1, 0.1, 0.5],
  [1.4, -0.4, 0.1],

  // Agent & Application Cluster (Bottom / Bottom-Right)
  [-0.7, -0.9, 0.3],
  [-0.2, -1.2, -0.4],
  [0.3, -1.1, 0.4],
  [0.8, -0.9, -0.3],
  [1.1, -1.0, 0.3],
  [-0.5, -0.6, -0.5],
  [0.6, -0.6, 0.5],
]

/* =========================================================================
   Responsive Camera Controller (Auto-Framing with Safe Area Padding)
   ========================================================================= */
function ResponsiveCameraController() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const { size } = useThree()

  useFrame(() => {
    const cam = cameraRef.current
    if (!cam) return

    const aspect = size.width / Math.max(size.height, 1)

    // Base distance to frame 32 nodes with 10-15% safe boundary margin
    let targetDist = 4.15
    if (size.width < 600) {
      targetDist = 5.2
    } else if (size.width < 960) {
      targetDist = 4.6
    }

    // Dynamic compensation for narrow aspect containers
    if (aspect < 1.1) {
      targetDist *= 1.1 / Math.max(aspect, 0.65)
    }

    const curZ = cam.position.z
    const newZ = THREE.MathUtils.lerp(curZ, targetDist, 0.1)
    const newY = THREE.MathUtils.lerp(cam.position.y, 0.15, 0.1)
    const newX = THREE.MathUtils.lerp(cam.position.x, 0.1, 0.1)

    cam.position.set(newX, newY, newZ)
    cam.lookAt(0, 0, 0)
    cam.updateProjectionMatrix()
  })

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0.1, 0.15, 4.3]} fov={38} />
}

/* =========================================================================
   3D Living Data Network Component (Full Rich Approved Architecture)
   ========================================================================= */
function LivingDataNetwork({
  mouse,
  isLight,
}: {
  mouse: React.RefObject<{ x: number; y: number }>
  isLight: boolean
}) {
  const networkRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Group>(null)
  const innerCoreRef = useRef<THREE.Mesh>(null)
  const signalPointsRef = useRef<THREE.Points>(null)
  const { size } = useThree()

  const isMobile = size.width < 640

  // Theme-aware palette (High-contrast for Dark and Light themes)
  const coreColor = isLight ? '#D45024' : '#FF6B35'
  const activeNodeColor = isLight ? '#D45024' : '#FF7844'
  const standardNodeColor = isLight ? '#262422' : '#CBD5E1'
  const secondaryNodeColor = isLight ? '#0F766E' : '#2DD4BF'
  const lineColor = isLight ? '#8C827A' : '#71717A'
  const activeLineColor = isLight ? '#D45024' : '#FF6B35'

  // Geometries
  const coreGeo = useMemo(() => new THREE.OctahedronGeometry(0.38, 0), [])
  const coreWireGeo = useMemo(() => new THREE.OctahedronGeometry(0.42, 0), [])
  const innerCoreGeo = useMemo(() => new THREE.IcosahedronGeometry(0.18, 0), [])
  const nodeStandardGeo = useMemo(() => new THREE.SphereGeometry(0.045, 12, 12), [])
  const nodeActiveGeo = useMemo(() => new THREE.SphereGeometry(0.065, 12, 12), [])

  // Build network connections based on distance threshold
  const { lineGeo, activeLineGeo, edges } = useMemo(() => {
    const standardLines: THREE.Vector3[] = []
    const activeLines: THREE.Vector3[] = []
    const edgeList: { from: THREE.Vector3; to: THREE.Vector3 }[] = []

    const vectors = NODE_COORDINATES.map(([x, y, z]) => new THREE.Vector3(x, y, z))

    for (let i = 0; i < vectors.length; i++) {
      for (let j = i + 1; j < vectors.length; j++) {
        const d = vectors[i].distanceTo(vectors[j])
        if (d < 1.05) {
          edgeList.push({ from: vectors[i], to: vectors[j] })
          // Highlight connections leading to center
          if (vectors[i].length() < 0.7 || vectors[j].length() < 0.7) {
            activeLines.push(vectors[i], vectors[j])
          } else {
            standardLines.push(vectors[i], vectors[j])
          }
        }
      }
    }

    const sGeo = new THREE.BufferGeometry().setFromPoints(standardLines)
    const aGeo = new THREE.BufferGeometry().setFromPoints(activeLines)

    return { lineGeo: sGeo, activeLineGeo: aGeo, edges: edgeList }
  }, [])

  // Animated Data Signal Packets traveling along edges
  const packetCount = 28
  const signalGeo = useMemo(() => {
    const positions = new Float32Array(packetCount * 3)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [packetCount])

  // Materials
  const coreMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(coreColor),
        emissive: new THREE.Color(coreColor),
        emissiveIntensity: isLight ? 0.45 : 0.95,
        roughness: 0.15,
        metalness: 0.85,
      }),
    [coreColor, isLight]
  )

  const coreWireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(coreColor),
        wireframe: true,
        transparent: true,
        opacity: isLight ? 0.7 : 0.9,
      }),
    [coreColor, isLight]
  )

  const innerCoreMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(secondaryNodeColor),
        emissive: new THREE.Color(secondaryNodeColor),
        emissiveIntensity: isLight ? 0.5 : 1.2,
        roughness: 0.1,
      }),
    [secondaryNodeColor, isLight]
  )

  const nodeStandardMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(standardNodeColor),
        roughness: 0.25,
        metalness: isLight ? 0.1 : 0.7,
      }),
    [standardNodeColor, isLight]
  )

  const nodeActiveMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(activeNodeColor),
        emissive: new THREE.Color(activeNodeColor),
        emissiveIntensity: isLight ? 0.5 : 1.0,
        roughness: 0.1,
      }),
    [activeNodeColor, isLight]
  )

  const nodeSecondaryMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(secondaryNodeColor),
        emissive: new THREE.Color(secondaryNodeColor),
        emissiveIntensity: isLight ? 0.4 : 0.8,
        roughness: 0.2,
      }),
    [secondaryNodeColor, isLight]
  )

  const lineMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(lineColor),
        transparent: true,
        opacity: isLight ? 0.45 : 0.55,
      }),
    [lineColor, isLight]
  )

  const activeLineMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(activeLineColor),
        transparent: true,
        opacity: isLight ? 0.75 : 0.85,
      }),
    [activeLineColor, isLight]
  )

  const signalMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color(activeNodeColor),
        size: isLight ? 0.075 : 0.085,
        transparent: true,
        opacity: isLight ? 0.85 : 0.95,
        blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
      }),
    [activeNodeColor, isLight]
  )

  // Cleanup
  useEffect(() => {
    return () => {
      coreGeo.dispose()
      coreWireGeo.dispose()
      innerCoreGeo.dispose()
      nodeStandardGeo.dispose()
      nodeActiveGeo.dispose()
      lineGeo.dispose()
      activeLineGeo.dispose()
      signalGeo.dispose()
      coreMat.dispose()
      coreWireMat.dispose()
      innerCoreMat.dispose()
      nodeStandardMat.dispose()
      nodeActiveMat.dispose()
      nodeSecondaryMat.dispose()
      lineMat.dispose()
      activeLineMat.dispose()
      signalMat.dispose()
    }
  }, [
    coreGeo,
    coreWireGeo,
    innerCoreGeo,
    nodeStandardGeo,
    nodeActiveGeo,
    lineGeo,
    activeLineGeo,
    signalGeo,
    coreMat,
    coreWireMat,
    innerCoreMat,
    nodeStandardMat,
    nodeActiveMat,
    nodeSecondaryMat,
    lineMat,
    activeLineMat,
    signalMat,
  ])

  // Animation Frame
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime

    // Smooth subtle cursor parallax (2 to 4 degrees)
    const targetX = (mouse.current?.x ?? 0) * 0.18
    const targetY = (mouse.current?.y ?? 0) * -0.14

    if (networkRef.current) {
      networkRef.current.rotation.y = THREE.MathUtils.damp(
        networkRef.current.rotation.y,
        t * 0.08 + targetX,
        2.5,
        delta
      )
      networkRef.current.rotation.x = THREE.MathUtils.damp(
        networkRef.current.rotation.x,
        Math.sin(t * 0.05) * 0.06 + targetY,
        2.5,
        delta
      )
    }

    // Core pulsing & crystalline rotation
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.25
      coreRef.current.rotation.z = Math.sin(t * 0.2) * 0.15
      const scale = 1 + Math.sin(t * 2.2) * 0.06
      coreRef.current.scale.set(scale, scale, scale)
    }

    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.x = -t * 0.5
      innerCoreRef.current.rotation.y = t * 0.4
    }

    // Move data signal packets along network edges
    if (signalPointsRef.current && edges.length > 0) {
      const pos = signalPointsRef.current.geometry.attributes.position
      const arr = pos.array as Float32Array

      for (let i = 0; i < packetCount; i++) {
        const edge = edges[(i * 3 + Math.floor(t * 0.5)) % edges.length]
        const progress = (t * 0.45 + i * (1 / packetCount)) % 1
        const currentPos = edge.from.clone().lerp(edge.to, progress)

        arr[i * 3] = currentPos.x
        arr[i * 3 + 1] = currentPos.y
        arr[i * 3 + 2] = currentPos.z
      }
      pos.needsUpdate = true
    }
  })

  // Small, integrated 3D node annotation style
  const labelStyle = {
    fontSize: '9px',
    fontFamily: 'var(--font-mono, monospace)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: isLight ? '#141312' : '#F5F6F8',
    background: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(16, 20, 29, 0.88)',
    border: `1px solid ${isLight ? 'rgba(20, 19, 18, 0.18)' : 'rgba(255, 255, 255, 0.16)'}`,
    boxShadow: 'var(--shadow-sm)',
    padding: '2px 6px',
    borderRadius: '3px',
    whiteSpace: 'nowrap' as const,
    pointerEvents: 'none' as const,
    userSelect: 'none' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: 600,
  }

  return (
    <Float speed={1.1} rotationIntensity={0.05} floatIntensity={0.2}>
      <group ref={networkRef}>
        {/* =========================================================================
            1. CENTRAL INTELLIGENCE CORE
            ========================================================================= */}
        <group ref={coreRef} position={[0, 0, 0]}>
          <mesh geometry={coreGeo} material={coreMat} />
          <mesh geometry={coreWireGeo} material={coreWireMat} />
          <mesh ref={innerCoreRef} geometry={innerCoreGeo} material={innerCoreMat} />
        </group>

        {/* =========================================================================
            2. 3D COMPUTATIONAL NODES (32 Spatial Nodes)
            ========================================================================= */}
        {NODE_COORDINATES.map(([x, y, z], idx) => {
          const isCoreAdjacent = Math.sqrt(x * x + y * y + z * z) < 0.65
          const isSecondary = idx % 5 === 0
          const geo = isCoreAdjacent ? nodeActiveGeo : nodeStandardGeo
          const mat = isCoreAdjacent
            ? nodeActiveMat
            : isSecondary
            ? nodeSecondaryMat
            : nodeStandardMat

          return (
            <mesh key={idx} position={[x, y, z]} geometry={geo} material={mat} />
          )
        })}

        {/* =========================================================================
            3. INTERCONNECTED TOPOLOGICAL EDGES
            ========================================================================= */}
        <lineSegments geometry={lineGeo} material={lineMat} />
        <lineSegments geometry={activeLineGeo} material={activeLineMat} />

        {/* =========================================================================
            4. ACTIVE DATA PACKETS STREAMING THROUGH PATHS
            ========================================================================= */}
        <points ref={signalPointsRef} geometry={signalGeo} material={signalMat} />

        {/* =========================================================================
            5. TECHNICAL 3D ANNOTATIONS (Inward Offset Safe Framing)
            ========================================================================= */}
        {!isMobile && (
          <Html position={[-1.35, 0.85, -0.2]} center distanceFactor={7}>
            <div style={labelStyle}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: coreColor }} />
              DATA
            </div>
          </Html>
        )}

        <Html position={[0.0, 1.32, 0.25]} center distanceFactor={7}>
          <div style={labelStyle}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: secondaryNodeColor }} />
            MODEL
          </div>
        </Html>

        <Html position={[0.55, 0.25, -0.3]} center distanceFactor={7}>
          <div style={labelStyle}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: coreColor }} />
            CORE
          </div>
        </Html>

        {!isMobile && (
          <Html position={[0.95, -0.92, 0.25]} center distanceFactor={7}>
            <div style={labelStyle}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: secondaryNodeColor }} />
              AGENT
            </div>
          </Html>
        )}
      </group>
    </Float>
  )
}

/* =========================================================================
   Fallback Technical Constellation SVG (When WebGL is unavailable)
   ========================================================================= */
function WebGLFallback() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      aria-label="3D AI Neural Structure Visual"
      role="img"
    >
      <svg viewBox="0 0 240 240" style={{ width: '85%', maxHeight: '380px', opacity: 0.9 }}>
        {/* Network connections */}
        <line x1="40" y1="80" x2="90" y2="50" stroke="var(--color-border-hover)" strokeWidth="1" />
        <line x1="90" y1="50" x2="160" y2="60" stroke="var(--color-border-hover)" strokeWidth="1" />
        <line x1="160" y1="60" x2="200" y2="100" stroke="var(--color-border-hover)" strokeWidth="1" />
        <line x1="40" y1="80" x2="120" y2="120" stroke="var(--color-accent)" strokeWidth="1.5" />
        <line x1="160" y1="60" x2="120" y2="120" stroke="var(--color-accent)" strokeWidth="1.5" />
        <line x1="200" y1="100" x2="120" y2="120" stroke="var(--color-accent)" strokeWidth="1.5" />
        <line x1="120" y1="120" x2="60" y2="170" stroke="var(--color-border-hover)" strokeWidth="1" />
        <line x1="120" y1="120" x2="180" y2="180" stroke="var(--color-border-hover)" strokeWidth="1" />
        <line x1="60" y1="170" x2="120" y2="195" stroke="var(--color-accent-teal)" strokeWidth="1.2" />
        <line x1="180" y1="180" x2="120" y2="195" stroke="var(--color-accent-teal)" strokeWidth="1.2" />

        {/* Nodes */}
        <circle cx="40" cy="80" r="4.5" fill="var(--color-accent)" />
        <circle cx="90" cy="50" r="4" fill="var(--color-text-secondary)" />
        <circle cx="160" cy="60" r="4.5" fill="var(--color-accent-teal)" />
        <circle cx="200" cy="100" r="4" fill="var(--color-text-secondary)" />
        <circle cx="60" cy="170" r="4" fill="var(--color-text-secondary)" />
        <circle cx="180" cy="180" r="4.5" fill="var(--color-accent-teal)" />
        <circle cx="120" cy="195" r="4" fill="var(--color-accent)" />

        {/* Central Core */}
        <polygon points="120,105 135,120 120,135 105,120" fill="var(--color-accent)" />
        <circle cx="120" cy="120" r="14" fill="none" stroke="var(--color-accent)" strokeWidth="1.2" strokeDasharray="3 3" />
      </svg>
    </div>
  )
}

/* =========================================================================
   Exported HeroScene Canvas
   ========================================================================= */
export default function HeroScene({ mouse, isVisible = true }: HeroSceneProps) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'dark' as const)
  const isLight = theme === 'light'
  const isWebGLSupported = useSyncExternalStore(subscribeNoop, checkWebGLSupport, () => true)

  if (!isWebGLSupported) {
    return <WebGLFallback />
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0.1, 0.15, 4.3], fov: 38 }}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          depth: true,
        }}
        dpr={[1, 1.5]}
        frameloop={isVisible ? 'always' : 'never'}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = isLight ? 1.05 : 1.15
        }}
      >
        <ResponsiveCameraController />

        {/* High-Contrast Studio Lighting */}
        <ambientLight intensity={isLight ? 1.0 : 0.65} color="#FFFFFF" />
        <directionalLight
          position={[4, 6, 4]}
          intensity={isLight ? 1.4 : 1.6}
          color={isLight ? '#FFFFFF' : '#FFF6ED'}
        />
        <directionalLight
          position={[-4, -3, -3]}
          intensity={0.7}
          color={isLight ? '#D45024' : '#E45D2C'}
        />
        <pointLight
          position={[0, 0, 0]}
          intensity={isLight ? 1.4 : 2.0}
          color={isLight ? '#D45024' : '#FF6B35'}
          distance={4}
        />
        <pointLight position={[2, 3, 2]} intensity={0.6} color="#FAF4EE" distance={6} />

        <LivingDataNetwork mouse={mouse} isLight={isLight} />
      </Canvas>
    </div>
  )
}
