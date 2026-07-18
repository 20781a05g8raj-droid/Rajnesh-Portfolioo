'use client'

import { useEffect, useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line, Float, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useMotionProfile } from '@/lib/use-motion-profile'
import { useThemeStore } from '@/lib/theme-store'

// Define the winding road path in 3D
const ROAD_POINTS = [
  new THREE.Vector3(0, 0, 0),         // 0. Hero spawn
  new THREE.Vector3(0, 0, -20),
  new THREE.Vector3(6, 0, -45),       // 1. Curve right for About
  new THREE.Vector3(8, 0, -70),
  new THREE.Vector3(2, 0, -95),       // 2. Curve back left for Services
  new THREE.Vector3(-8, 0, -120),
  new THREE.Vector3(-10, 0, -145),
  new THREE.Vector3(-2, 0, -170),     // 3. Curve right for Work
  new THREE.Vector3(8, 0, -195),
  new THREE.Vector3(6, 0, -220),      // 4. Curve left for Process
  new THREE.Vector3(-4, 0, -245),     // 5. Testimonials clouds
  new THREE.Vector3(0, 0, -270),      // 6. Contact portal
]

const roadCurve = new THREE.CatmullRomCurve3(ROAD_POINTS)

// Custom hook to build flat winding road ribbon geometry
function useRoadGeometry(curve: THREE.CatmullRomCurve3, width = 3.0, segments = 220) {
  return useMemo(() => {
    const vertices: number[] = []
    const uvs: number[] = []
    const indices: number[] = []

    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const p = curve.getPointAt(t)
      const dir = curve.getTangentAt(t)
      const up = new THREE.Vector3(0, 1, 0)
      const side = new THREE.Vector3().crossVectors(dir, up).normalize()

      const left = p.clone().addScaledVector(side, -width * 0.5)
      const right = p.clone().addScaledVector(side, width * 0.5)

      vertices.push(left.x, left.y, left.z)
      vertices.push(right.x, right.y, right.z)

      const dist = t * 140
      uvs.push(0, dist)
      uvs.push(1, dist)

      if (i < segments) {
        const row1 = i * 2
        const row2 = (i + 1) * 2
        indices.push(row1, row1 + 1, row2)
        indices.push(row1 + 1, row2 + 1, row2)
      }
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geom.setIndex(indices)
    geom.computeVertexNormals()
    return geom
  }, [curve, width, segments])
}

// Custom hook for the road curbs
function useCurbGeometry(curve: THREE.CatmullRomCurve3, width = 3.0, height = 0.12, curbW = 0.2, segments = 220) {
  return useMemo(() => {
    const leftVertices: number[] = []
    const rightVertices: number[] = []
    const leftIndices: number[] = []
    const rightIndices: number[] = []

    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const p = curve.getPointAt(t)
      const dir = curve.getTangentAt(t)
      const up = new THREE.Vector3(0, 1, 0)
      const side = new THREE.Vector3().crossVectors(dir, up).normalize()

      // Left curb
      const lInner = p.clone().addScaledVector(side, -width * 0.5)
      const lOuter = p.clone().addScaledVector(side, -width * 0.5 - curbW)
      leftVertices.push(lInner.x, lInner.y + height, lInner.z)
      leftVertices.push(lOuter.x, lOuter.y + height, lOuter.z)

      // Right curb
      const rInner = p.clone().addScaledVector(side, width * 0.5)
      const rOuter = p.clone().addScaledVector(side, width * 0.5 + curbW)
      rightVertices.push(rInner.x, rInner.y + height, rInner.z)
      rightVertices.push(rOuter.x, rOuter.y + height, rOuter.z)

      if (i < segments) {
        const row1 = i * 2
        const row2 = (i + 1) * 2
        leftIndices.push(row1, row1 + 1, row2)
        leftIndices.push(row1 + 1, row2 + 1, row2)
        rightIndices.push(row1, row1 + 1, row2)
        rightIndices.push(row1 + 1, row2 + 1, row2)
      }
    }

    const lGeom = new THREE.BufferGeometry()
    lGeom.setAttribute('position', new THREE.Float32BufferAttribute(leftVertices, 3))
    lGeom.setIndex(leftIndices)
    lGeom.computeVertexNormals()

    const rGeom = new THREE.BufferGeometry()
    rGeom.setAttribute('position', new THREE.Float32BufferAttribute(rightVertices, 3))
    rGeom.setIndex(rightIndices)
    rGeom.computeVertexNormals()

    return { lGeom, rGeom }
  }, [curve, width, height, curbW, segments])
}

// Improved wet asphalt road shader with neon reflections
const RoadShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vec3 bg = vec3(0.04, 0.04, 0.06);
      float noise = fract(sin(dot(vUv * 120.0, vec2(127.1, 311.7))) * 43758.5453);
      bg += vec3(noise * 0.02);

      vec3 borderCol = mix(vec3(0.64, 0.39, 0.95), vec3(0.36, 0.90, 1.00), sin(vUv.y * 0.08) * 0.5 + 0.5);
      float borderLeft = smoothstep(0.045, 0.0, vUv.x);
      float borderRight = smoothstep(0.955, 1.0, vUv.x);
      vec3 borders = borderCol * (borderLeft + borderRight) * 2.2;

      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float spec = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
      vec3 specCol = borderCol * spec * 0.5;

      float centerDist = abs(vUv.x - 0.5);
      float centerLine = smoothstep(0.015, 0.003, centerDist);
      float dash = step(0.48, fract(vUv.y * 2.2));
      vec3 centerColor = vec3(0.98, 0.98, 0.98) * centerLine * dash * 0.9;

      vec3 col = bg + centerColor + borders + specCol;
      gl_FragColor = vec4(col, 0.98);
    }
  `
}

// Cylinder builder between two 3D vectors
function CylinderBetweenPoints({
  p1,
  p2,
  radius = 0.015,
  color = '#ff5cc8',
  metalness = 0.8,
  roughness = 0.2,
}: {
  p1: THREE.Vector3
  p2: THREE.Vector3
  radius?: number
  color?: string
  metalness?: number
  roughness?: number
}) {
  const { len, pos, quaternion } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(p2, p1)
    const len = dir.length()
    const pos = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)
    const up = new THREE.Vector3(0, 1, 0)
    const quaternion = new THREE.Quaternion()
    const normDir = dir.clone().normalize()
    quaternion.setFromUnitVectors(up, normDir)
    return { len, pos, quaternion }
  }, [p1, p2])

  return (
    <mesh position={pos} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, len, 8]} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} toneMapped={false} />
    </mesh>
  )
}

// Procedural 3D Rider character sitting on the motorcycle (Static Riding Pose)
function MotorcycleRider() {
  const hips = useMemo(() => new THREE.Vector3(-0.32, 0.70, 0), [])
  const hipR = useMemo(() => new THREE.Vector3(-0.32, 0.70, 0.09), [])
  const hipL = useMemo(() => new THREE.Vector3(-0.32, 0.70, -0.09), [])

  const shoulderR = useMemo(() => new THREE.Vector3(-0.12, 1.04, 0.12), [])
  const shoulderL = useMemo(() => new THREE.Vector3(-0.12, 1.04, -0.12), [])

  const handR = useMemo(() => new THREE.Vector3(0.48, 0.88, 0.22), [])
  const handL = useMemo(() => new THREE.Vector3(0.48, 0.88, -0.22), [])

  const footR = useMemo(() => new THREE.Vector3(-0.06, 0.38, 0.16), [])
  const footL = useMemo(() => new THREE.Vector3(-0.06, 0.38, -0.16), [])

  const kneeR = useMemo(() => new THREE.Vector3(-0.04, 0.65, 0.22), [])
  const kneeL = useMemo(() => new THREE.Vector3(-0.04, 0.65, -0.22), [])

  return (
    <group>
      <mesh position={hips}>
        <sphereGeometry args={[0.075, 8, 8]} />
        <meshStandardMaterial color="#1a1c24" roughness={0.8} />
      </mesh>

      <CylinderBetweenPoints p1={hips} p2={new THREE.Vector3(-0.12, 1.04, 0)} color="#15151b" radius={0.06} roughness={0.7} metalness={0.1} />

      <CylinderBetweenPoints p1={shoulderL} p2={shoulderR} color="#15151b" radius={0.03} />

      <mesh position={[-0.06, 1.18, 0]}>
        <sphereGeometry args={[0.095, 12, 12]} />
        <meshStandardMaterial color="#2d303b" metalness={0.9} roughness={0.1} toneMapped={false} />
      </mesh>
      <mesh position={[0.02, 1.20, 0]}>
        <boxGeometry args={[0.06, 0.04, 0.13]} />
        <meshStandardMaterial color="#0c0d12" metalness={1.0} roughness={0.05} />
      </mesh>

      <CylinderBetweenPoints p1={shoulderR} p2={handR} color="#15151b" radius={0.018} />
      <CylinderBetweenPoints p1={shoulderL} p2={handL} color="#15151b" radius={0.018} />

      <CylinderBetweenPoints p1={hipR} p2={kneeR} color="#15151b" radius={0.024} />
      <CylinderBetweenPoints p1={kneeR} p2={footR} color="#2b3a4a" radius={0.02} />

      <CylinderBetweenPoints p1={hipL} p2={kneeL} color="#15151b" radius={0.024} />
      <CylinderBetweenPoints p1={kneeL} p2={footL} color="#2b3a4a" radius={0.02} />
    </group>
  )
}

// Procedural Exhaust Smoke Particle System
function ExhaustSmoke() {
  const pointsRef = useRef<THREE.Points>(null)
  const particleCount = 20
  
  const particles = useMemo(() => {
    const data = []
    for (let i = 0; i < particleCount; i++) {
      data.push({
        pos: new THREE.Vector3(-0.8, 0.36, 0.2 * (Math.random() > 0.5 ? 1 : -1)),
        velocity: new THREE.Vector3(-1.5 - Math.random() * 2, -0.2 - Math.random() * 0.4, (Math.random() - 0.5) * 0.5),
        age: Math.random(),
        size: 0.02 + Math.random() * 0.05
      })
    }
    return data
  }, [])

  useFrame((_, dt) => {
    if (!pointsRef.current) return
    const geom = pointsRef.current.geometry
    const posArr = geom.attributes.position.array as Float32Array

    particles.forEach((p, i) => {
      p.age += dt * 1.5
      if (p.age > 1.0) {
        p.age = 0
        p.pos.set(-0.8, 0.34, 0.2 * (Math.random() > 0.5 ? 1 : -1))
      }
      p.pos.addScaledVector(p.velocity, dt)
      posArr[i * 3 + 0] = p.pos.x
      posArr[i * 3 + 1] = p.pos.y
      posArr[i * 3 + 2] = p.pos.z
    })
    geom.attributes.position.needsUpdate = true
  })

  const positions = useMemo(() => new Float32Array(particleCount * 3), [])

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#a463f2"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Procedural HIGH-POLY 3D Motorcycle Model
function MotorcycleModel({ wheelRot }: { wheelRot: number }) {
  const wheelRef1 = useRef<THREE.Group>(null)
  const wheelRef2 = useRef<THREE.Group>(null)

  useFrame(() => {
    if (wheelRef1.current) wheelRef1.current.rotation.z = -wheelRot
    if (wheelRef2.current) wheelRef2.current.rotation.z = -wheelRot
  })

  const spokes = useMemo(() => {
    const arr = []
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      arr.push(
        <CylinderBetweenPoints
          key={i}
          p1={new THREE.Vector3(0, 0, 0)}
          p2={new THREE.Vector3(Math.cos(angle) * 0.38, Math.sin(angle) * 0.38, 0)}
          radius={0.007}
          color="#ffffff"
          metalness={1.0}
          roughness={0.05}
        />
      )
    }
    return arr
  }, [])

  const engineFins = useMemo(() => {
    const fins = []
    for (let i = 0; i < 8; i++) {
      fins.push(
        <mesh key={i} position={[-0.05, 0.42 + i * 0.035, 0]}>
          <boxGeometry args={[0.34, 0.015, 0.28]} />
          <meshStandardMaterial color="#32353a" metalness={0.9} roughness={0.1} />
        </mesh>
      )
    }
    return fins
  }, [])

  return (
    <group>
      {/* 1. Wheels */}
      <group ref={wheelRef1} position={[-0.65, 0.42, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.28, 32]} />
          <meshStandardMaterial color="#0f0f12" roughness={0.9} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.32, 0.05, 12, 32]} />
          <meshStandardMaterial color="#dddddd" metalness={1.0} roughness={0.05} toneMapped={false} />
        </mesh>
        {spokes}
      </group>

      <group ref={wheelRef2} position={[0.65, 0.42, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.18, 32]} />
          <meshStandardMaterial color="#0f0f12" roughness={0.9} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.32, 0.04, 12, 32]} />
          <meshStandardMaterial color="#dddddd" metalness={1.0} roughness={0.05} toneMapped={false} />
        </mesh>
        {spokes}
      </group>

      {/* 2. Detailed Engine */}
      <group>
        <mesh position={[-0.05, 0.38, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.24, 12]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#2d3035" metalness={0.95} roughness={0.15} />
        </mesh>
        {engineFins}
      </group>

      {/* 3. Chrome Exhaust System */}
      <group>
        <CylinderBetweenPoints p1={new THREE.Vector3(-0.05, 0.38, 0.14)} p2={new THREE.Vector3(-0.45, 0.34, 0.18)} color="#ffffff" radius={0.024} metalness={1.0} roughness={0.05} />
        <mesh position={[-0.68, 0.36, 0.2]} rotation={[0.08, 0, -0.05]}>
          <cylinderGeometry args={[0.045, 0.045, 0.45, 12]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffffff" metalness={1.0} roughness={0.05} toneMapped={false} />
        </mesh>

        <CylinderBetweenPoints p1={new THREE.Vector3(-0.05, 0.38, -0.14)} p2={new THREE.Vector3(-0.45, 0.34, -0.18)} color="#ffffff" radius={0.024} metalness={1.0} roughness={0.05} />
        <mesh position={[-0.68, 0.36, -0.2]} rotation={[-0.08, 0, -0.05]}>
          <cylinderGeometry args={[0.045, 0.045, 0.45, 12]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffffff" metalness={1.0} roughness={0.05} toneMapped={false} />
        </mesh>
      </group>

      {/* 4. Fuel Tank */}
      <mesh position={[0.06, 0.70, 0]}>
        <boxGeometry args={[0.55, 0.32, 0.36]} />
        <meshStandardMaterial color="#ff5cc8" metalness={0.95} roughness={0.1} toneMapped={false} />
      </mesh>

      {/* 5. Frame & Forks */}
      <CylinderBetweenPoints p1={new THREE.Vector3(-0.65, 0.42, 0)} p2={new THREE.Vector3(-0.3, 0.70, 0)} color="#15161b" radius={0.026} />
      <CylinderBetweenPoints p1={new THREE.Vector3(-0.3, 0.70, 0)} p2={new THREE.Vector3(0.4, 0.86, 0)} color="#15161b" radius={0.026} />
      <CylinderBetweenPoints p1={new THREE.Vector3(-0.05, 0.38, 0)} p2={new THREE.Vector3(0.4, 0.86, 0)} color="#15161b" radius={0.026} />

      <CylinderBetweenPoints p1={new THREE.Vector3(0.42, 0.84, 0.07)} p2={new THREE.Vector3(0.65, 0.42, 0.07)} color="#ffffff" radius={0.02} metalness={1.0} roughness={0.05} />
      <CylinderBetweenPoints p1={new THREE.Vector3(0.42, 0.84, -0.07)} p2={new THREE.Vector3(0.65, 0.42, -0.07)} color="#ffffff" radius={0.02} metalness={1.0} roughness={0.05} />

      {/* 6. Handlebars */}
      <group position={[0.42, 0.86, 0]}>
        <CylinderBetweenPoints p1={new THREE.Vector3(0, 0, -0.25)} p2={new THREE.Vector3(0, 0, 0.25)} color="#ffffff" radius={0.016} metalness={1.0} roughness={0.05} />
        <CylinderBetweenPoints p1={new THREE.Vector3(0, 0, -0.22)} p2={new THREE.Vector3(0.08, 0.14, -0.26)} color="#ffffff" radius={0.008} metalness={1.0} />
        <CylinderBetweenPoints p1={new THREE.Vector3(0, 0, 0.22)} p2={new THREE.Vector3(0.08, 0.14, 0.26)} color="#ffffff" radius={0.008} metalness={1.0} />
        <mesh position={[0.08, 0.14, -0.26]}>
          <boxGeometry args={[0.08, 0.06, 0.01]} />
          <meshStandardMaterial color="#2d2d30" metalness={0.7} />
        </mesh>
        <mesh position={[0.08, 0.14, 0.26]}>
          <boxGeometry args={[0.08, 0.06, 0.01]} />
          <meshStandardMaterial color="#2d2d30" metalness={0.7} />
        </mesh>
      </group>

      {/* 7. Headlight */}
      <group position={[0.54, 0.80, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.12, 12]} />
          <meshStandardMaterial color="#1a1c22" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.061, 0]}>
          <sphereGeometry args={[0.078, 16, 16]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0.2, 0]} color="#ffffff" intensity={3.5} distance={12} />
      </group>

      {/* 8. Seat */}
      <mesh position={[-0.32, 0.68, 0]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.36, 0.08, 0.24]} />
        <meshStandardMaterial color="#121316" roughness={0.9} />
      </mesh>

      <MotorcycleRider />
      <ExhaustSmoke />
    </group>
  )
}

// --- SPORTS CAR IN DRIVEWAYS (Suburban Detail) ---
function ParkedSportsCar({ position, rotation = [0, 0, 0], color = '#e53e3e' }: { position: [number, number, number], rotation?: [number, number, number], color?: string }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Chassis Body */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[1.6, 0.28, 0.85]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.15} />
      </mesh>
      {/* Windshield Cabin */}
      <mesh position={[-0.1, 0.36, 0]}>
        <boxGeometry args={[0.7, 0.18, 0.72]} />
        <meshStandardMaterial color="#0c0c0f" roughness={0.05} metalness={0.9} />
      </mesh>
      {/* Spoiler */}
      <mesh position={[-0.7, 0.35, 0]}>
        <boxGeometry args={[0.1, 0.04, 0.85]} />
        <meshStandardMaterial color="#111115" metalness={0.9} />
      </mesh>
      <CylinderBetweenPoints p1={new THREE.Vector3(-0.7, 0.18, 0.38)} p2={new THREE.Vector3(-0.7, 0.35, 0.38)} color="#111115" radius={0.015} />
      <CylinderBetweenPoints p1={new THREE.Vector3(-0.7, 0.18, -0.38)} p2={new THREE.Vector3(-0.7, 0.35, -0.38)} color="#111115" radius={0.015} />

      {/* Wheels */}
      {[-0.52, 0.52].map((x) =>
        [-0.44, 0.44].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0.11, z]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.14, 0.14, 0.12, 12]} />
              <meshStandardMaterial color="#111114" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.061, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.01, 8]} />
              <meshStandardMaterial color="#aaaaaa" metalness={0.9} />
            </mesh>
          </group>
        ))
      )}
    </group>
  )
}

// --- COLORFUL MODERN REALISTIC HOUSE (WITH ROOF, WINDOWS, GATES, FENCE) ---
function LuxuryHouse({
  position,
  rotation = [0, 0, 0],
  wallColor = '#d95d39',
  roofColor = '#bf4040',
  poolColor = '#5ce5ff',
  hasPool = true,
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  wallColor?: string
  roofColor?: string
  poolColor?: string
  hasPool?: boolean
}) {
  const fencePosts = useMemo(() => {
    const posts = []
    for (let i = 0; i < 9; i++) {
      posts.push(
        <mesh key={i} position={[-2.4 + i * 0.6, 0.24, 1.8]}>
          <boxGeometry args={[0.04, 0.48, 0.04]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
        </mesh>
      )
    }
    return posts
  }, [])

  return (
    <group position={position} rotation={rotation}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[8.5, 6.5]} />
        <meshStandardMaterial color="#121b14" roughness={0.98} />
      </mesh>

      {/* Main Floor */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[3.4, 1.0, 2.6]} />
        <meshStandardMaterial color={wallColor} roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Upper level cantilever */}
      <mesh position={[0.4, 1.45, 0.1]}>
        <boxGeometry args={[2.4, 0.9, 2.2]} />
        <meshStandardMaterial color="#2d3748" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Slanted Pyramidal Tiled Roof */}
      <group position={[0.4, 2.25, 0.1]} rotation={[0, Math.PI / 4, 0]}>
        <mesh>
          <coneGeometry args={[2.0, 0.7, 4]} />
          <meshStandardMaterial color={roofColor} roughness={0.4} metalness={0.15} />
        </mesh>
      </group>

      {/* Windows with Glowing glass */}
      <group position={[-0.8, 0.5, 1.31]}>
        <mesh><boxGeometry args={[0.6, 0.5, 0.03]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[0, 0, 0.015]}><planeGeometry args={[0.5, 0.4]} /><meshBasicMaterial color="#ffd875" toneMapped={false} /></mesh>
      </group>
      <group position={[0.8, 0.5, 1.31]}>
        <mesh><boxGeometry args={[0.6, 0.5, 0.03]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[0, 0, 0.015]}><planeGeometry args={[0.5, 0.4]} /><meshBasicMaterial color="#ffd875" toneMapped={false} /></mesh>
      </group>
      <group position={[0.4, 1.45, 1.21]}>
        <mesh><boxGeometry args={[1.2, 0.5, 0.03]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[0, 0, 0.015]}><planeGeometry args={[1.1, 0.4]} /><meshBasicMaterial color="#5ce5ff" transparent opacity={0.6} toneMapped={false} /></mesh>
      </group>

      {/* Wooden Gate */}
      <group position={[0, 0.4, 1.31]}>
        <mesh><boxGeometry args={[0.54, 0.8, 0.04]} /><meshStandardMaterial color="#5a3d28" roughness={0.7} /></mesh>
        <mesh position={[0.2, 0, 0.03]}><sphereGeometry args={[0.024, 8, 8]} /><meshBasicMaterial color="#ffd875" toneMapped={false} /></mesh>
      </group>

      {/* Fence */}
      {fencePosts}
      <Line points={[[-2.45, 0.38, 1.81], [2.45, 0.38, 1.81]]} color="#8b5a2b" lineWidth={0.8} />

      <pointLight position={[0, 1.2, 1.8]} color="#ffd875" intensity={1.8} distance={6} />

      {/* Swimming Pool */}
      {hasPool && (
        <group position={[-1.6, 0.01, 1.6]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.0, 1.4]} />
            <meshBasicMaterial color={poolColor} transparent opacity={0.65} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 0.1, 0]} color={poolColor} intensity={2.2} distance={4} />
          <Line points={[[-1.0, 0, -0.7], [1.0, 0, -0.7], [1.0, 0, 0.7], [-1.0, 0, 0.7], [-1.0, 0, -0.7]]} color={poolColor} lineWidth={0.8} />
        </group>
      )}

      {/* Parked sports car in driveway */}
      <ParkedSportsCar position={[2.2, 0, 1.2]} rotation={[0, -0.05, 0]} color={roofColor} />
    </group>
  )
}

// --- CHECKPOINT / TRANSITION BILLBOARD (LEVEL CHECKS) ---
function TransitionBillboard({
  position,
  rotation = [0, 0, 0],
  color = '#5ce5ff',
  label = 'UPCOMING LEVEL',
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  color?: string
  label: string
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[-0.6, 0.7, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.4, 6]} />
        <meshStandardMaterial color="#2d2d3a" roughness={0.8} />
      </mesh>
      <mesh position={[0.6, 0.7, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.4, 6]} />
        <meshStandardMaterial color="#2d2d3a" roughness={0.8} />
      </mesh>

      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[2.6, 1.1, 0.08]} />
        <meshStandardMaterial color="#14141e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.8, 0.042]}>
        <planeGeometry args={[2.4, 0.9]} />
        <meshBasicMaterial color="#0b0b10" toneMapped={false} />
      </mesh>

      <Text
        position={[0, 1.8, 0.05]}
        fontSize={0.12}
        color={color}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        maxWidth={2.2}
        toneMapped={false}
      >
        {label}
      </Text>

      <Line
        points={[
          [-1.3, 1.35, 0.05],
          [1.3, 1.35, 0.05],
          [1.3, 2.25, 0.05],
          [-1.3, 2.25, 0.05],
          [-1.3, 1.35, 0.05],
        ]}
        color={color}
        lineWidth={1.2}
      />
    </group>
  )
}

// --- SUBURBAN LUXURY SCENERY (Zone 1: t=0 to 0.16) ---
function SuburbanZone() {
  return (
    <group>
      {/* Street Lamps */}
      <group position={[-2.0, 0, -8]}>
        <mesh position={[0, 1.1, 0]}><cylinderGeometry args={[0.03, 0.03, 2.2, 6]} /><meshStandardMaterial color="#303030" /></mesh>
        <mesh position={[0, 2.2, 0]}><sphereGeometry args={[0.1, 8, 8]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
        <pointLight position={[0, 2.2, 0]} color="#5ce5ff" intensity={2.5} distance={8} />
      </group>
      <group position={[2.0, 0, -22]}>
        <mesh position={[0, 1.1, 0]}><cylinderGeometry args={[0.03, 0.03, 2.2, 6]} /><meshStandardMaterial color="#303030" /></mesh>
        <mesh position={[0, 2.2, 0]}><sphereGeometry args={[0.1, 8, 8]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
        <pointLight position={[0, 2.2, 0]} color="#ff5cc8" intensity={2.5} distance={8} />
      </group>

      {/* Pine Trees */}
      <PineTree position={[-4.5, 0, -6]} />
      <PineTree position={[4.2, 0, -15]} />
      <PineTree position={[-4.2, 0, -22]} />
      <PineTree position={[4.5, 0, -28]} />
    </group>
  )
}

function PineTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.08, 0.12, 1.0, 5]} /><meshStandardMaterial color="#40281b" /></mesh>
      {/* Higher poly layers */}
      <mesh position={[0, 1.3, 0]}><coneGeometry args={[0.7, 1.0, 6]} /><meshStandardMaterial color="#1d422a" roughness={0.85} /></mesh>
      <mesh position={[0, 1.8, 0]}><coneGeometry args={[0.5, 0.8, 6]} /><meshStandardMaterial color="#224e32" roughness={0.85} /></mesh>
      <mesh position={[0, 2.2, 0]}><coneGeometry args={[0.3, 0.6, 6]} /><meshStandardMaterial color="#2c5a3d" roughness={0.85} /></mesh>
    </group>
  )
}

// --- CYBERPUNK CITY (Zone 2: t=0.16 to 0.32) ---
function CyberCityZone() {
  return (
    <group>
      {/* Tall Neon Skyscrapers */}
      <Skyscraper position={[-9.5, 0, -48]} size={[2.2, 9.0, 2.2]} color="#a463f2" />
      <Skyscraper position={[-11.5, 0, -62]} size={[3.0, 12.0, 3.0]} color="#5ce5ff" />
      <Skyscraper position={[9.8, 0, -56]} size={[2.5, 10.0, 2.5]} color="#ff5cc8" />
      <Skyscraper position={[12.2, 0, -72]} size={[3.2, 14.0, 3.2]} color="#a463f2" />
      <Skyscraper position={[-8.8, 0, -82]} size={[2.4, 8.5, 2.4]} color="#5ce5ff" />

      {/* Floating Holograms */}
      <Float speed={2.5} rotationIntensity={1.5} floatIntensity={0.8} position={[4.5, 2.2, -50]}>
        <mesh><torusGeometry args={[0.6, 0.08, 6, 20]} /><meshBasicMaterial color="#5ce5ff" wireframe toneMapped={false} /></mesh>
      </Float>
      <Float speed={2.0} rotationIntensity={2.0} floatIntensity={0.6} position={[-4.5, 3.0, -66]}>
        <mesh><torusGeometry args={[0.8, 0.06, 6, 20]} /><meshBasicMaterial color="#ff5cc8" wireframe toneMapped={false} /></mesh>
      </Float>
    </group>
  )
}

function Skyscraper({ position, size, color }: { position: [number, number, number], size: [number, number, number], color: string }) {
  const [w, h, d] = size
  const windowGrid = useMemo(() => {
    // Generate simple high-poly look windows
    const rows = []
    const wCount = 3
    const hCount = 8
    for (let r = 0; r < hCount; r++) {
      for (let c = 0; c < wCount; c++) {
        rows.push(
          <mesh key={`${r}-${c}`} position={[(c - 1) * (w / 3), 1.0 + r * (h / 9), d * 0.505]}>
            <planeGeometry args={[w * 0.2, h * 0.04]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} toneMapped={false} />
          </mesh>
        )
      }
    }
    return rows
  }, [w, h, d, color])

  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#0b0b14" roughness={0.4} metalness={0.6} />
      </mesh>
      {windowGrid}
      {/* Structural accent lines */}
      <Line points={[[-w/2, 0, d/2], [-w/2, h, d/2], [w/2, h, d/2], [w/2, 0, d/2]]} color={color} lineWidth={1.0} />
    </group>
  )
}

// --- INDUSTRIAL FACTORY (Zone 3: t=0.32 to 0.48) ---
function IndustrialZone() {
  return (
    <group>
      {/* Power plant blocks */}
      <FactoryBlock position={[-7.5, 0, -100]} color="#a463f2" />
      <FactoryBlock position={[7.8, 0, -112]} color="#5ce5ff" />
      <FactoryBlock position={[-8.2, 0, -126]} color="#ff5cc8" />
      <FactoryBlock position={[7.5, 0, -135]} color="#a463f2" />

      {/* Piping corridor */}
      <Line points={[[-6, 3, -95], [-6, 3, -140]]} color="#ffd875" lineWidth={1.5} />
      <Line points={[[6, 3.5, -105], [6, 3.5, -130]]} color="#5ce5ff" lineWidth={1.5} />
    </group>
  )
}

function FactoryBlock({ position, color }: { position: [number, number, number], color: string }) {
  return (
    <group position={position}>
      {/* Warehouse main body */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[3.2, 2.0, 2.5]} />
        <meshStandardMaterial color="#1b1c21" roughness={0.7} metalness={0.7} />
      </mesh>
      {/* Chimney structure */}
      <mesh position={[1.0, 2.4, -0.5]}>
        <cylinderGeometry args={[0.2, 0.25, 1.4, 8]} />
        <meshStandardMaterial color="#2d2d34" metalness={0.8} />
      </mesh>
      {/* Red warning light */}
      <mesh position={[1.0, 3.15, -0.5]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ff3333" toneMapped={false} />
      </mesh>
      {/* Pipes climbing the wall */}
      <CylinderBetweenPoints p1={new THREE.Vector3(-1.0, 0, 1.27)} p2={new THREE.Vector3(-1.0, 1.5, 1.27)} color={color} radius={0.04} />
      <CylinderBetweenPoints p1={new THREE.Vector3(-1.0, 1.5, 1.27)} p2={new THREE.Vector3(-0.4, 1.8, 1.27)} color={color} radius={0.04} />

      {/* Industrial fan on wall */}
      <group position={[0.2, 1.4, 1.27]}>
        <mesh><cylinderGeometry args={[0.34, 0.34, 0.04, 12]} rotation={[Math.PI/2, 0, 0]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh><cylinderGeometry args={[0.05, 0.05, 0.06, 8]} rotation={[Math.PI/2, 0, 0]} /><meshStandardMaterial color={color} /></mesh>
      </group>
    </group>
  )
}

// --- NEON DESERT OASIS (Zone 4: t=0.48 to 0.64) ---
function DesertZone() {
  return (
    <group>
      {/* Adobe homes */}
      <AdobeHouse position={[-8.0, 0, -152]} wallColor="#ddc0a2" poolColor="#5ce5ff" />
      <AdobeHouse position={[7.8, 0, -168]} wallColor="#cfae8b" poolColor="#ff5cc8" />
      <AdobeHouse position={[-8.5, 0, -182]} wallColor="#ddc0a2" poolColor="#a463f2" />

      {/* Cacti & Palms */}
      <PalmTree position={[-4.5, 0, -145]} />
      <PalmTree position={[4.2, 0, -158]} />
      <PalmTree position={[-4.0, 0, -172]} />
      <PalmTree position={[4.5, 0, -185]} />
    </group>
  )
}

function AdobeHouse({ position, wallColor, poolColor }: { position: [number, number, number], wallColor: string, poolColor: string }) {
  return (
    <group position={position}>
      {/* Sandy courtyard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[6.5, 5.5]} />
        <meshStandardMaterial color="#bf946b" roughness={0.99} />
      </mesh>
      {/* Rounded Adobe Block */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[2.5, 1.2, 2.0]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      {/* Arched front door */}
      <mesh position={[0, 0.45, 1.01]}>
        <boxGeometry args={[0.48, 0.8, 0.02]} />
        <meshStandardMaterial color="#4a2810" />
      </mesh>
      {/* Glowing Pool */}
      <group position={[-1.8, 0.01, 1.0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.5, 1.2]} />
          <meshBasicMaterial color={poolColor} transparent opacity={0.6} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0.1, 0]} color={poolColor} intensity={2.0} distance={5} />
      </group>
    </group>
  )
}

function PalmTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Curved trunk */}
      <mesh position={[0, 1.0, 0]} rotation={[0.08, 0, 0.05]}>
        <cylinderGeometry args={[0.06, 0.1, 2.0, 6]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
      {/* Palm Fronds */}
      {[0, 1, 2, 3, 4].map((i) => {
        const rot = (i / 5) * Math.PI * 2
        return (
          <group key={i} position={[0, 2.0, 0]} rotation={[0.3, rot, 0]}>
            <mesh position={[0, 0, 0.4]} rotation={[-0.1, 0, 0]}>
              <boxGeometry args={[0.15, 0.02, 0.8]} />
              <meshStandardMaterial color="#3f5a2b" roughness={0.8} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// --- SKY SANCTUARY (Zone 5: t=0.64 to 0.80) ---
function SkySanctuaryZone() {
  return (
    <group>
      {/* Floating Island Lands */}
      <FloatingIsland position={[-7.5, 0, -200]} color="#5ce5ff" />
      <FloatingIsland position={[7.8, 0.8, -212]} color="#ff5cc8" />
      <FloatingIsland position={[-8.2, 0.4, -225]} color="#a463f2" />
      <FloatingIsland position={[7.5, 1.2, -235]} color="#5ce5ff" />
    </group>
  )
}

function FloatingIsland({ position, color }: { position: [number, number, number], color: string }) {
  return (
    <group position={position}>
      {/* Rock base */}
      <mesh position={[0, -0.6, 0]}>
        <coneGeometry args={[2.0, 1.2, 6]} rotation={[Math.PI, 0, 0]} />
        <meshStandardMaterial color="#303138" roughness={0.95} />
      </mesh>
      {/* Grass top */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 0.06, 6]} />
        <meshStandardMaterial color="#2d5236" roughness={0.9} />
      </mesh>

      {/* Cybernetic Column */}
      <group position={[0, 0.8, 0]}>
        <mesh><cylinderGeometry args={[0.15, 0.15, 1.4, 6]} /><meshStandardMaterial color="#d4d4d8" metalness={0.7} /></mesh>
        {/* Glow rings */}
        <mesh position={[0, 0.4, 0]}><torusGeometry args={[0.18, 0.02, 6, 12]} rotation={[Math.PI/2, 0, 0]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
      </group>

      {/* Levitating Crystal */}
      <Float speed={3} floatIntensity={0.6} position={[0, 1.8, 0]}>
        <mesh>
          <octahedronGeometry args={[0.22]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      </Float>
    </group>
  )
}

// --- PORTAL GATEWAY (Zone 6: t=0.80 to 1.00) ---
function PortalZone() {
  const portalRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (portalRef.current) {
      portalRef.current.rotation.z = state.clock.getElapsedTime() * 0.35
    }
  })

  return (
    <group position={[0, 1.3, -265]}>
      {/* Spinning Outer Ring */}
      <group ref={portalRef}>
        <mesh>
          <torusGeometry args={[2.0, 0.12, 12, 48]} />
          <meshBasicMaterial color="#5ce5ff" toneMapped={false} />
        </mesh>
        {[0, 1, 2, 3].map((i) => {
          const rot = (i / 4) * Math.PI
          return (
            <mesh key={i} rotation={[0, 0, rot]}>
              <cylinderGeometry args={[0.008, 0.008, 4.0, 4]} />
              <meshBasicMaterial color="#ff5cc8" toneMapped={false} />
            </mesh>
          )
        })}
      </group>

      {/* Portal Horizon */}
      <mesh position={[0, 0, -0.02]}>
        <circleGeometry args={[1.9, 32]} />
        <meshBasicMaterial color="#a463f2" transparent opacity={0.35} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      {/* Energy pylons guiding the entry */}
      {[-2.2, 2.2].map((x) => (
        <group key={x} position={[x, -1.3, 5.0]}>
          <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.08, 0.14, 1.6, 6]} /><meshStandardMaterial color="#20222a" /></mesh>
          <mesh position={[0, 1.65, 0]}><sphereGeometry args={[0.12, 8, 8]} /><meshBasicMaterial color="#ff5cc8" toneMapped={false} /></mesh>
          <pointLight position={[0, 1.65, 0]} color="#ff5cc8" intensity={2.0} distance={5} />
        </group>
      ))}

      <pointLight position={[0, 1.0, 0.5]} color="#5ce5ff" intensity={4.5} distance={15} />
    </group>
  )
}

// --- ATMOSPHERIC PARTICLES FIELD (CORRIDOR SPAN) ---
function AtmosphericParticles({ count = 220 }) {
  const geomRef = useRef<THREE.BufferGeometry>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const z = -Math.random() * 280
      const progress = -z / 280
      const roadPos = roadCurve.getPointAt(progress)

      const spreadX = (Math.random() - 0.5) * 16.0
      const spreadY = Math.random() * 8.0 - 0.5

      arr[i * 3 + 0] = roadPos.x + spreadX
      arr[i * 3 + 1] = roadPos.y + spreadY
      arr[i * 3 + 2] = z
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (geomRef.current) {
      const pos = geomRef.current.attributes.position as THREE.BufferAttribute
      const time = state.clock.getElapsedTime() * 0.15
      for (let i = 0; i < count; i++) {
        const idx = i * 3
        pos.setY(idx, pos.getY(idx) + Math.sin(time + pos.getZ(idx) * 0.05) * 0.002)
      }
      pos.needsUpdate = true
    }
  })

  return (
    <points>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color="#5ce5ff"
        transparent
        opacity={0.45}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Background fading far-away sky grid
function AmbientBackground({ mode }: { mode: 'day' | 'night' }) {
  const uniforms = useMemo(
    () => ({
      uIsDay: { value: 0.0 },
    }),
    []
  )

  useEffect(() => {
    uniforms.uIsDay.value = mode === 'day' ? 1.0 : 0.0
  }, [mode, uniforms])

  return (
    <mesh scale={[180, 180, 180]}>
      <sphereGeometry args={[1, 16, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          varying vec3 vPos;
          uniform float uIsDay;
          void main() {
            vec3 n = normalize(vPos);
            vec3 nightCol = mix(vec3(0.02, 0.015, 0.04), vec3(0.01, 0.03, 0.05), n.z * 0.5 + 0.5);
            vec3 nightHorizon = vec3(0.12, 0.06, 0.20);

            vec3 dayCol = mix(vec3(0.55, 0.72, 0.95), vec3(0.92, 0.82, 0.75), n.z * 0.5 + 0.5);
            vec3 dayHorizon = vec3(1.0, 0.95, 0.88);

            vec3 baseCol = mix(nightCol, dayCol, uIsDay);
            vec3 horizonCol = mix(nightHorizon, dayHorizon, uIsDay);

            float horizon = smoothstep(-0.2, 0.3, n.y);
            baseCol += horizonCol * (1.0 - horizon) * 0.45;

            gl_FragColor = vec4(baseCol, 1.0);
          }
        `}
      />
    </mesh>
  )
}

// --- MAIN CONTROLLER: MANAGES SCROLL AND LERP CAM/MOTORCYCLE ---
function ScrollerSceneController() {
  const targetScroll = useRef(0)
  const currentScroll = useRef(0)

  const bikeGroupRef = useRef<THREE.Group>(null)
  const [wheelRot, setWheelRot] = useState(0)
  const wRot = useRef(0)

  const luxuryVillas = useMemo(() => {
    const houseConfigs = [
      { t: 0.02, side: -4.6, wall: '#d95d39', roof: '#bf4040', pool: '#5ce5ff', hasPool: true },
      { t: 0.07, side: 4.6, wall: '#2b8a8b', roof: '#dd6b20', pool: '#ff5cc8', hasPool: true },
      { t: 0.14, side: -4.8, wall: '#805ad5', roof: '#3182ce', pool: '#a463f2', hasPool: false },
    ]

    return houseConfigs.map((c, i) => {
      const p = roadCurve.getPointAt(c.t)
      const dir = roadCurve.getTangentAt(c.t).normalize()
      const up = new THREE.Vector3(0, 1, 0)
      const sideVec = new THREE.Vector3().crossVectors(dir, up).normalize()
      const pos = p.clone().addScaledVector(sideVec, c.side)

      const angle = Math.atan2(dir.x, dir.z) + (c.side > 0 ? -Math.PI / 2 : Math.PI / 2)

      return {
        id: i,
        position: [pos.x, pos.y, pos.z] as [number, number, number],
        rotation: [0, angle, 0] as [number, number, number],
        wallColor: c.wall,
        roofColor: c.roof,
        poolColor: c.pool,
        hasPool: c.hasPool,
      }
    })
  }, [])

  // Section checkpoint transition billboards
  const transitionBillboards = useMemo(() => {
    const transitions = [
      { t: 0.12, label: 'UPCOMING LEVEL:\nLEVEL 01: CHARACTER PROFILE', color: '#5ce5ff' },
      { t: 0.28, label: 'UPCOMING LEVEL:\nLEVEL 02: TECH SKILL TREES', color: '#ff5cc8' },
      { t: 0.44, label: 'UPCOMING LEVEL:\nLEVEL 03: MISSION LOGS', color: '#a463f2' },
      { t: 0.60, label: 'UPCOMING LEVEL:\nLEVEL 04: THE ROADMAP', color: '#ffd875' },
      { t: 0.76, label: 'UPCOMING LEVEL:\nLEVEL 05: PLAYER REVIEWS', color: '#5ce5ff' },
      { t: 0.90, label: 'UPCOMING LEVEL:\nLEVEL 06: BOSS CHALLENGE', color: '#ff5cc8' },
    ]

    return transitions.map((tr, i) => {
      const p = roadCurve.getPointAt(tr.t)
      const dir = roadCurve.getTangentAt(tr.t).normalize()
      const up = new THREE.Vector3(0, 1, 0)
      const sideVec = new THREE.Vector3().crossVectors(dir, up).normalize()

      const sideOffset = i % 2 === 0 ? -4.5 : 4.5
      const pos = p.clone().addScaledVector(sideVec, sideOffset)
      const angle = Math.atan2(dir.x, dir.z) + (sideOffset > 0 ? -Math.PI / 2 : Math.PI / 2)

      return {
        id: i,
        position: [pos.x, pos.y, pos.z] as [number, number, number],
        rotation: [0, angle, 0] as [number, number, number],
        label: tr.label,
        color: tr.color,
      }
    })
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 0) {
        targetScroll.current = Math.min(1.0, Math.max(0.0, window.scrollY / docHeight))
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useFrame((state) => {
    const prevScroll = currentScroll.current

    const lerpFactor = 0.07
    currentScroll.current += (targetScroll.current - currentScroll.current) * lerpFactor

    const currentT = currentScroll.current
    const bikePos = roadCurve.getPointAt(currentT)
    const bikeTangent = roadCurve.getTangentAt(currentT).normalize()

    if (bikeGroupRef.current) {
      bikeGroupRef.current.position.copy(bikePos)
      const lookTarget = bikePos.clone().add(bikeTangent)
      bikeGroupRef.current.lookAt(lookTarget)
    }

    const deltaProgress = currentT - prevScroll
    const totalLength = 280.0
    const distTraveled = deltaProgress * totalLength

    wRot.current += distTraveled / 0.42
    setWheelRot(wRot.current)

    const camTargetPos = bikePos.clone()
      .sub(bikeTangent.clone().multiplyScalar(4.5))
      .add(new THREE.Vector3(0, 1.8, 0))

    state.camera.position.lerp(camTargetPos, 0.08)

    const cameraLookAtTarget = bikePos.clone().add(bikeTangent.clone().multiplyScalar(1.2))
    state.camera.lookAt(cameraLookAtTarget)
  })

  // Setup winding road geometry and curbs
  const roadGeom = useRoadGeometry(roadCurve, 3.0, 160)
  const { lGeom, rGeom } = useCurbGeometry(roadCurve, 3.0, 0.06, 0.16, 160)

  return (
    <group>
      {/* 1. Road surface */}
      <mesh geometry={roadGeom}>
        <shaderMaterial
          vertexShader={RoadShader.vertexShader}
          fragmentShader={RoadShader.fragmentShader}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>

      {/* 2. Elevated road curbs */}
      <mesh geometry={lGeom}>
        <meshStandardMaterial color="#42454f" roughness={0.65} metalness={0.1} />
      </mesh>
      <mesh geometry={rGeom}>
        <meshStandardMaterial color="#42454f" roughness={0.65} metalness={0.1} />
      </mesh>

      {/* 3. The Player Motorcycle */}
      <group ref={bikeGroupRef}>
        <group rotation={[0, -Math.PI / 2, 0]}>
          <MotorcycleModel wheelRot={wheelRot} />
        </group>
      </group>

      {/* Modern luxury villas (Suburban section) */}
      {luxuryVillas.map((villa) => (
        <LuxuryHouse
          key={villa.id}
          position={villa.position}
          rotation={villa.rotation}
          wallColor={villa.wallColor}
          roofColor={villa.roofColor}
          poolColor={villa.poolColor}
          hasPool={villa.hasPool}
        />
      ))}

      {/* Checkpoint transition billboards */}
      {transitionBillboards.map((board) => (
        <TransitionBillboard
          key={board.id}
          position={board.position}
          rotation={board.rotation}
          label={board.label}
          color={board.color}
        />
      ))}

      {/* Segmented Town Zones */}
      <SuburbanZone />
      <CyberCityZone />
      <IndustrialZone />
      <DesertZone />
      <SkySanctuaryZone />
      <PortalZone />

      <AtmosphericParticles count={250} />
    </group>
  )
}

export function GlobalBackground3D() {
  const profile = useMotionProfile()
  const mode = useThemeStore((state) => state.mode)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      document.body.classList.add('webgl-active')
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.body.classList.remove('webgl-active')
      }
    }
  }, [])

  if (!mounted || !profile.useWebGL) {
    return null
  }

  const isDay = mode === 'day'
  const bgColor = isDay ? '#99bbf2' : '#030205'
  const sunColor = isDay ? '#fff3db' : '#ffffff'
  const ambientIntensity = isDay ? 1.0 : 0.5
  const sunIntensity = isDay ? 1.5 : 0.8

  return (
    <div className="fixed inset-0 -z-10 h-screen w-screen overflow-hidden pointer-events-none">
      <Canvas
        camera={{ position: [0, 1.8, 5], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 10, 45]} />
        <ambientLight intensity={ambientIntensity} />
        <directionalLight position={[5, 15, 5]} color={sunColor} intensity={sunIntensity} />

        <AmbientBackground mode={mode} />
        <ScrollerSceneController />
      </Canvas>
    </div>
  )
}
