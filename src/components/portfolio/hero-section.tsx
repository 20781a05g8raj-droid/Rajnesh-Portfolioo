'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { Hero } from './hero'
import { useMotionProfile } from '@/lib/use-motion-profile'
import { useMounted } from '@/lib/use-mounted'

// WebGL particle field is client-only and lazily loaded
const ParticleField = dynamic(
  () => import('./three/particle-field').then((m) => m.ParticleField),
  { ssr: false }
)

/**
 * Hero wrapper: decides whether to mount the WebGL particle field
 * or fall back to a CSS-only animated background.
 */
export function HeroSection() {
  const profile = useMotionProfile()
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const mounted = useMounted()

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -((e.clientY / window.innerHeight) * 2 - 1)
      pointerRef.current = { x, y }
    }
    function onLeave() {
      pointerRef.current = { x: 0, y: 0 }
    }
    if (!profile.prefersReducedMotion) {
      window.addEventListener('mousemove', onMove, { passive: true })
      window.addEventListener('mouseleave', onLeave)
    }
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [profile.prefersReducedMotion])

  return (
    <div className="relative">
      {/* WebGL layer */}
      {mounted && profile.useWebGL ? (
        <ParticleField pointerRef={pointerRef} />
      ) : (
        <FallbackBackground />
      )}
      <Hero pointerRef={pointerRef} />
    </div>
  )
}

/** CSS-only animated fallback when WebGL is off / reduced-motion / low-power. */
function FallbackBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 40%, oklch(0.15 0.05 290 / 60%) 0%, var(--background) 70%)',
        }}
      />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div
        className="absolute -left-1/4 top-1/4 h-[60vmin] w-[60vmin] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, oklch(0.62 0.24 290 / 60%) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -right-1/4 bottom-1/4 h-[60vmin] w-[60vmin] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, oklch(0.78 0.18 200 / 50%) 0%, transparent 70%)' }}
      />
    </div>
  )
}
