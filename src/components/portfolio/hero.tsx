'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { usePrefersReducedMotion } from '@/lib/use-mounted'

const ROLES = ['Web Developer', 'AI Video Creator', 'AI Graphic Designer']

/** Scramble-text effect used for both name reveal and role morphing. */
function useScrambleText(target: string, active: boolean, speed = 1) {
  const [display, setDisplay] = useState('')
  const raf = useRef<number>(0)

  useEffect(() => {
    if (!active) {
      setDisplay(target)
      return
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&'
    const final = target
    let frame = 0
    const totalFrames = Math.max(20, final.length * 3)

    function tick() {
      frame++
      const progress = Math.min(1, frame / totalFrames)
      let out = ''
      for (let i = 0; i < final.length; i++) {
        const ch = final[i]
        if (ch === ' ') {
          out += ' '
          continue
        }
        const reveal = progress * final.length
        if (i < reveal) {
          out += ch
        } else {
          out += chars[Math.floor(Math.random() * chars.length)]
        }
      }
      setDisplay(out)
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick)
      } else {
        setDisplay(final)
      }
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, active, speed])

  return display
}

/** Letter-by-letter staggered reveal of the name. */
function KineticName({ name, active }: { name: string; active: boolean }) {
  const words = name.split(' ')
  return (
    <div className="flex flex-col items-center gap-1 md:gap-2">
      {words.map((word, wi) => (
        <div key={wi} className="overflow-hidden">
          <div className="flex">
            {word.split('').map((ch, i) => {
              const idx = wi * 100 + i
              return (
                <motion.span
                  key={i}
                  initial={{ y: '110%', opacity: 0, rotateX: -90 }}
                  animate={
                    active
                      ? { y: '0%', opacity: 1, rotateX: 0 }
                      : { y: '110%', opacity: 0, rotateX: -90 }
                  }
                  transition={{
                    duration: 0.85,
                    delay: 0.2 + idx * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block font-display font-bold tracking-tight"
                  style={{ transformOrigin: '50% 100%' }}
                >
                  {ch}
                </motion.span>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Rotating role tagline with shuffle/scramble morph between roles. */
function RoleTagline() {
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<'stable' | 'scrambling'>('stable')

  useEffect(() => {
    const cycleMs = 2400
    const id = setInterval(() => {
      setPhase('scrambling')
      setTimeout(() => {
        setIdx((p) => (p + 1) % ROLES.length)
        setPhase('stable')
      }, 380)
    }, cycleMs)
    return () => clearInterval(id)
  }, [])

  const display = useScrambleText(ROLES[idx], phase === 'scrambling')

  return (
    <div className="relative flex items-center justify-center">
      <span
        key={idx}
        className="font-display text-lg font-medium tracking-wide text-foreground/90 sm:text-2xl md:text-3xl"
      >
        <span className="text-gradient-accent">{display}</span>
      </span>
    </div>
  )
}

export function Hero({ pointerRef }: { pointerRef: React.RefObject<{ x: number; y: number }> }) {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const inView = useInView(sectionRef, { amount: 0.3, once: false })

  const reduced = usePrefersReducedMotion()

  const dots = useMemo(() => new Array(60).fill(0), [])

  return (
    <section
      id="level-hero"
      ref={sectionRef}
      className="relative min-h-[100svh] w-full overflow-hidden"
      aria-label="Hero — Level 00 Spawn"
    >
      {/* Particle field canvas (mounted by parent) */}
      <div className="absolute inset-0 z-0">{/* canvas injected via props */}</div>


      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-40"
        style={{
          background:
            'radial-gradient(40% 40% at 30% 30%, oklch(0.62 0.24 290 / 25%) 0%, transparent 70%), radial-gradient(35% 35% at 70% 70%, oklch(0.78 0.18 200 / 22%) 0%, transparent 70%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-10 bg-grid opacity-30 mask-fade-b" />

      {/* Floating micro dots (depth decor) */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {dots.map((_, i) => {
          const x = (i * 37) % 100
          const y = (i * 53) % 100
          const size = (i % 3) + 1
          return (
            <motion.span
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
              }}
              animate={
                reduced
                  ? {}
                  : { opacity: [0.2, 0.7, 0.2], y: [0, -10, 0] }
              }
              transition={{
                duration: 3 + (i % 5),
                repeat: Infinity,
                delay: (i % 7) * 0.3,
                ease: 'easeInOut',
              }}
            />
          )
        })}
      </div>

      {/* Main hero content */}
      <div className="relative z-20 flex min-h-[100svh] flex-col items-center justify-center px-6 py-20 text-center">
        {/* Level badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full glass hud-border px-4 py-1.5"
        >
          <span className="h-1.5 w-1.5 animate-badge-pulse rounded-full bg-cyan" />
          <span className="text-[11px] font-medium uppercase tracking-[0.4em] text-muted-foreground">
            Level 00 · Spawn
          </span>
        </motion.div>

        {/* Name */}
        <h1
          className="font-display text-[15vw] font-bold leading-[0.95] tracking-tight md:text-[12vw] lg:text-[160px]"
          style={{ perspective: '600px' }}
        >
          <KineticName name="RAJNESH" active={inView} />
          <span className="block text-gradient-accent">
            <KineticName name="UPADHYAY" active={inView} />
          </span>
        </h1>

        {/* Role tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-6 flex items-center gap-3"
        >
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-cyan md:w-12" />
          <RoleTagline />
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-violet md:w-12" />
        </motion.div>

        {/* Tagline sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.9, delay: 1 }}
          className="mt-6 max-w-xl text-balance text-sm text-muted-foreground sm:text-base"
        >
          A multi-disciplinary creator building cinematic web experiences,
          AI-generated video, and AI poster design — explored through a
          scroll-driven 3D world.
        </motion.p>

        {/* "Press Scroll to Start" prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <button
            data-cursor="scroll"
            onClick={() => {
              document.getElementById('level-about')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="group flex flex-col items-center gap-3"
            aria-label="Scroll to begin"
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.4em] text-muted-foreground transition-colors group-hover:text-cyan">
              Press Scroll to Start
            </span>
            <span className="relative flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1">
              <span className="h-2 w-1 animate-scroll-hint rounded-full bg-gradient-to-b from-violet to-cyan" />
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  )
}
