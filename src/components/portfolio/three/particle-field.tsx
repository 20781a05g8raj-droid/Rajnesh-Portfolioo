'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Hero particle field:
 *  - ~5000 particles arranged on a sphere shell, slowly rotating.
 *  - Reacts to cursor: particles drift toward/away from pointer in screen space.
 *  - Subtle color gradient (violet -> cyan -> magenta) by radius.
 *
 * Performance: Uses BufferGeometry + custom shader (points), single draw call.
 */
const PARTICLE_COUNT = 4500

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;

  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  uniform float uPixelRatio;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Gentle ambient swirl
    float t = uTime * 0.18 + aPhase * 6.2831;
    pos.x += sin(t) * 0.06;
    pos.y += cos(t * 0.8) * 0.06;
    pos.z += sin(t * 1.2) * 0.04;

    // Pointer attraction (in view space, approximate)
    vec2 dir = uPointer - pos.xy;
    float dist = length(dir);
    float influence = smoothstep(2.5, 0.0, dist) * uPointerStrength;
    pos.xy -= normalize(dir + vec2(0.0001)) * influence * 0.35;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float size = aSize * (1.0 + influence * 1.5);
    gl_PointSize = size * uPixelRatio * (300.0 / -mv.z);

    vColor = aColor;
    vAlpha = 0.55 + influence * 0.45;
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    // Soft glow
    float glow = pow(a, 2.0);
    gl_FragColor = vec4(vColor * (0.6 + glow * 1.4), a * vAlpha);
  }
`

function Particles({ pointerRef }: { pointerRef: React.RefObject<{ x: number; y: number }> }) {
  const { viewport } = useThree()
  const matRef = useRef<THREE.ShaderMaterial | null>(null)
  const pointsRef = useRef<THREE.Points | null>(null)

  const { positions, colors, sizes, phases } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const phases = new Float32Array(PARTICLE_COUNT)

    const violet = new THREE.Color('#a463f2')
    const cyan = new THREE.Color('#5ce5ff')
    const magenta = new THREE.Color('#ff5cc8')

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Even spherical distribution (shell with some thickness)
      const r = 4.5 + Math.random() * 2.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi) * 0.6

      // Color: blend by y for violet->cyan->magenta sweep
      const t = (positions[i * 3 + 1] + 5) / 10
      const c = t < 0.5
        ? violet.clone().lerp(cyan, t * 2)
        : cyan.clone().lerp(magenta, (t - 0.5) * 2)
      colors[i * 3 + 0] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b

      sizes[i] = 1.5 + Math.random() * 2.5
      phases[i] = Math.random()
    }
    return { positions, colors, sizes, phases }
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerStrength: { value: 0 },
      uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 },
    }),
    []
  )

  useFrame((_, dt) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += dt
      const target = pointerRef.current
      const px = target.x * viewport.width * 0.5
      const py = target.y * viewport.height * 0.5
      matRef.current.uniforms.uPointer.value.set(px, py)
      matRef.current.uniforms.uPointerStrength.value += (target.x === 0 && target.y === 0 ? 0 : 1) * dt
      matRef.current.uniforms.uPointerStrength.value = Math.min(
        1,
        matRef.current.uniforms.uPointerStrength.value
      )
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += dt * 0.04
      pointsRef.current.rotation.x += dt * 0.01
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function BackgroundGradient() {
  // A faint, far-away gradient sphere as the world backdrop
  return (
    <mesh scale={[40, 40, 40]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        side={THREE.BackSide}
        uniforms={{
          uTime: { value: 0 },
        }}
        vertexShader={/* glsl */ `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          varying vec3 vPos;
          uniform float uTime;
          void main() {
            vec3 n = normalize(vPos);
            float t = 0.5 + 0.5 * sin(uTime * 0.05 + n.y * 1.5);
            vec3 c1 = vec3(0.04, 0.02, 0.10); // deep purple-black
            vec3 c2 = vec3(0.02, 0.06, 0.10); // deep cyan-black
            vec3 col = mix(c1, c2, t);
            // Faint horizon glow
            float horizon = smoothstep(0.0, 0.4, abs(n.y));
            col += vec3(0.18, 0.10, 0.30) * (1.0 - horizon) * 0.5;
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  )
}

export function ParticleField({
  pointerRef,
}: {
  pointerRef: React.RefObject<{ x: number; y: number }>
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <BackgroundGradient />
      <Particles pointerRef={pointerRef} />
    </Canvas>
  )
}
