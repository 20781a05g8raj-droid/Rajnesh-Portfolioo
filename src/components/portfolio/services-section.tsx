'use client'

import { useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { SectionHeader } from './reveal'

interface Service {
  id: string
  title: string
  subtitle: string
  description: string
  features: string[]
  icon: 'code' | 'video' | 'design'
  accent: 'violet' | 'cyan' | 'magenta'
}

const SERVICES: Service[] = [
  {
    id: 'dev',
    title: 'Website Development',
    subtitle: 'Engineering',
    description:
      'Production-grade Next.js apps with React Three Fiber, custom GLSL shaders, GSAP, and Tailwind — tuned for 60fps and shipped to Vercel.',
    features: [
      'Next.js + TypeScript App Router',
      'React Three Fiber / Three.js scenes',
      'GSAP + ScrollTrigger motion',
      'Custom GLSL shaders',
      'Vercel deployment & edge perf',
    ],
    icon: 'code',
    accent: 'violet',
  },
  {
    id: 'video',
    title: 'AI Video Generation',
    subtitle: 'Direction',
    description:
      'Cinematic AI-generated video — Runway, Sora, ComfyUI pipelines — cut, graded, and re-timed in After Effects until each clip reads like a trailer.',
    features: [
      'Runway Gen-3 + Sora pipelines',
      'ComfyUI custom workflows',
      'After Effects grading & cut',
      'Sound design & mix',
      'Multi-format delivery',
    ],
    icon: 'video',
    accent: 'cyan',
  },
  {
    id: 'design',
    title: 'AI Poster & Graphic Design',
    subtitle: 'Visual Identity',
    description:
      'Key art, social creatives, and brand systems generated with Midjourney + Stable Diffusion, refined in Figma and Photoshop into a coherent visual language.',
    features: [
      'Midjourney + SDXL pipelines',
      'Brand identity systems',
      'Poster & key art design',
      'Social creative suites',
      'Figma → Photoshop finish',
    ],
    icon: 'design',
    accent: 'magenta',
  },
]

const ACCENT_HEX: Record<Service['accent'], string> = {
  violet: '#a463f2',
  cyan: '#5ce5ff',
  magenta: '#ff5cc8',
}

/** Animated shader line SVG used inside each card (custom GLSL-style glow) */
function ShaderLineSVG({ color }: { color: string }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 400 200"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <linearGradient id={`g-${color.slice(1)}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={`glow-${color.slice(1)}`}>
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d="M0,100 Q100,40 200,100 T400,100"
        stroke={`url(#g-${color.slice(1)})`}
        strokeWidth="1.5"
        filter={`url(#glow-${color.slice(1)})`}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d="M0,120 Q120,60 220,120 T400,120"
        stroke={`url(#g-${color.slice(1)})`}
        strokeWidth="1"
        strokeOpacity="0.5"
        filter={`url(#glow-${color.slice(1)})`}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.5 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d="M0,80 Q80,30 180,80 T400,80"
        stroke={`url(#g-${color.slice(1)})`}
        strokeWidth="0.8"
        strokeOpacity="0.4"
        filter={`url(#glow-${color.slice(1)})`}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.4 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

function Icon({ kind, color }: { kind: Service['icon']; color: string }) {
  const stroke = { stroke: color, strokeWidth: 1.5, fill: 'none' } as const
  if (kind === 'code') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke}>
        <polyline points="8 6 3 12 8 18" />
        <polyline points="16 6 21 12 16 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>
    )
  }
  if (kind === 'video') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke}>
        <rect x="2" y="5" width="14" height="14" rx="2" />
        <polygon points="22,8 16,12 22,16" fill={color} stroke="none" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const inView = useInView(stageRef, { amount: 0.4, once: true })

  // Map scroll progress through this section to the card animation timeline.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // 0..1 progress of the shuffle/spread sequence
  // Sequence fires roughly between when section enters and reaches center.
  const phase = useTransform(scrollYProgress, [0.1, 0.45], [0, 1])

  const [currentPhase, setCurrentPhase] = useState(0)
  phase.on('change', (v) => setCurrentPhase(v))

  // Spread target positions (fan layout) — three cards arranged like a fanned hand
  const fanTargets = [
    { x: -180, y: 10, rotate: -12, z: 60 }, // left card
    { x: 0, y: -8, rotate: 0, z: 80 }, // center card
    { x: 180, y: 10, rotate: 12, z: 60 }, // right card
  ]

  // Final grid positions (after spread → settle)
  const gridTargets = [
    { x: -340, y: 0, rotate: 0, z: 1 },
    { x: 0, y: 0, rotate: 0, z: 1 },
    { x: 340, y: 0, rotate: 0, z: 1 },
  ]

  return (
    <section
      id="level-services"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-background py-24 md:py-36"
      aria-label="Services — Level 02 Skill Trees"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
        style={{
          background:
            'radial-gradient(50% 40% at 50% 50%, oklch(0.12 0.04 290 / 60%) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <SectionHeader
          level="02"
          eyebrow="Skill Trees"
          title={
            <>
              <span className="text-gradient-mono">Three pillars.</span>
              <br />
              <span className="text-gradient-accent">One creator, fully loaded.</span>
            </>
          }
          description="Watch the deck shuffle and fan out — each card is a full skill tree you can deploy. Scroll to deal."
        />

        {/* Card stage */}
        <div
          ref={stageRef}
          className="relative mt-20 flex min-h-[520px] items-center justify-center md:min-h-[600px]"
          style={{ perspective: '1400px' }}
        >
          {/* Phase progress meter (HUD) */}
          <div className="pointer-events-none absolute left-1/2 top-0 z-30 flex -translate-x-1/2 items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              Deck Phase
            </span>
            <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-violet via-cyan to-magenta transition-all"
                style={{ width: `${Math.min(100, currentPhase * 100)}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {Math.round(currentPhase * 100)}%
            </span>
          </div>

          {/* Cards */}
          {SERVICES.map((service, i) => {
            const accentHex = ACCENT_HEX[service.accent]
            // Stacked deck position (start)
            const stack = { x: 0, y: 0, rotate: (i - 1) * 4, z: 0 }

            // Interpolate stack -> fan -> grid based on phase
            // 0..0.5: stack -> fan
            // 0.5..1: fan -> grid
            let x: number
            let y: number
            let rotate: number
            let z: number
            if (currentPhase < 0.5) {
              const t = currentPhase / 0.5
              const ease = 1 - Math.pow(1 - t, 3)
              x = stack.x + (fanTargets[i].x - stack.x) * ease
              y = stack.y + (fanTargets[i].y - stack.y) * ease
              rotate = stack.rotate + (fanTargets[i].rotate - stack.rotate) * ease
              z = stack.z + (fanTargets[i].z - stack.z) * ease
            } else {
              const t = (currentPhase - 0.5) / 0.5
              const ease = 1 - Math.pow(1 - t, 3)
              x = fanTargets[i].x + (gridTargets[i].x - fanTargets[i].x) * ease
              y = fanTargets[i].y + (gridTargets[i].y - fanTargets[i].y) * ease
              rotate = fanTargets[i].rotate + (gridTargets[i].rotate - fanTargets[i].rotate) * ease
              z = fanTargets[i].z + (gridTargets[i].z - fanTargets[i].z) * ease
            }

            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="absolute w-[88vw] max-w-md will-change-transform"
                style={{
                  transform: `translate3d(${x}px, ${y}px, ${z}px) rotate(${rotate}deg)`,
                  transformStyle: 'preserve-3d',
                  zIndex: Math.round(z) + 10,
                  transition: 'transform 0.15s linear',
                }}
              >
                <Card3D service={service} accentHex={accentHex} index={i} />
              </motion.article>
            )
          })}

          {/* Faint shadow plate behind cards */}
          <div
            className="pointer-events-none absolute bottom-10 left-1/2 z-0 h-12 w-[60%] -translate-x-1/2 rounded-full bg-black/40 blur-2xl"
            aria-hidden
          />
        </div>

        {/* Helper copy */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="mx-auto mt-12 max-w-2xl text-center text-sm text-muted-foreground"
        >
          Each pillar is fully staffed — from raw engineering all the way to the final
          delivery polish. Pick one, or stack the deck.
        </motion.p>
      </div>
    </section>
  )
}

function Card3D({
  service,
  accentHex,
  index,
}: {
  service: Service
  accentHex: string
  index: number
}) {
  const cardRef = useRef<HTMLDivElement | null>(null)

  function onMove(e: React.MouseEvent) {
    const el = cardRef.current
    if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / rect.width
    const dy = (e.clientY - cy) / rect.height
    el.style.transform = `rotateX(${-dy * 6}deg) rotateY(${dx * 8}deg) translateZ(8px)`
  }
  function onLeave() {
    const el = cardRef.current
    if (!el) return
    el.style.transform = 'rotateX(0) rotateY(0) translateZ(0)'
  }

  return (
    <div
      style={{ transformStyle: 'preserve-3d' }}
      className="group relative"
      data-cursor="hover"
    >
      {/* Glow */}
      <div
        className="absolute -inset-1 z-0 rounded-2xl opacity-50 blur-xl transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: `radial-gradient(circle at 50% 0%, ${accentHex}40 0%, transparent 70%)` }}
        aria-hidden
      />

      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative z-10 overflow-hidden rounded-2xl glass-strong p-7 md:p-8"
        style={{
          boxShadow: `0 30px 80px -30px ${accentHex}40, inset 0 1px 0 0 oklch(1 0 0 / 8%)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Card top bar */}
        <div className="relative mb-5 flex items-center justify-between">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{
              background: `${accentHex}18`,
              border: `1px solid ${accentHex}40`,
            }}
          >
            <Icon kind={service.icon} color={accentHex} />
          </div>
          <div className="flex flex-col items-end">
            <span
              className="font-display text-3xl font-bold leading-none"
              style={{ color: accentHex }}
            >
              0{index + 1}
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
              {service.subtitle}
            </span>
          </div>
        </div>

        {/* Shader line behind title */}
        <div className="relative mb-4 h-12">
          <ShaderLineSVG color={accentHex} />
          <h3 className="relative z-10 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {service.title}
          </h3>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          {service.description}
        </p>

        {/* Features */}
        <ul className="mt-5 space-y-2">
          {service.features.map((f, fi) => (
            <motion.li
              key={f}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, delay: fi * 0.05 }}
              className="flex items-center gap-2.5 text-xs text-foreground/80 md:text-sm"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: accentHex, boxShadow: `0 0 8px ${accentHex}` }}
              />
              {f}
            </motion.li>
          ))}
        </ul>

        {/* Card footer edge */}
        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Skill Tree
          </span>
          <span
            className="font-display text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: accentHex }}
          >
            Deploy →
          </span>
        </div>

        {/* Scanline overlay for HUD feel */}
        <div className="pointer-events-none absolute inset-0 scanlines opacity-30" />
      </div>
    </div>
  )
}
