'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SectionHeader } from './reveal'

const STEPS = [
  {
    n: '01',
    title: 'Discovery',
    desc: 'Stakeholder calls, brand audit, competitive teardown, and a written brief that locks scope, success metrics, and reference anchors before any pixel moves.',
    tag: 'Brief & Audit',
    color: 'violet',
  },
  {
    n: '02',
    title: 'Concept',
    desc: 'Moodboard, design system, art direction frames, and a clickable wireframe deck — so we agree on the cinematic direction long before build starts.',
    tag: 'Direction',
    color: 'cyan',
  },
  {
    n: '03',
    title: 'Design / Build',
    desc: 'Next.js scaffold, component system, Tailwind tokens, R3F scenes wired up, GSAP scroll timelines — the engineering backbone that makes the visuals perform.',
    tag: 'Engineering',
    color: 'violet',
  },
  {
    n: '04',
    title: 'AI Generation Layer',
    desc: 'Runway/Sora/ComfyUI video pipelines, Midjourney + SDXL poster systems, prompt banks, and refined outputs — the synthetic content layer dropped onto the backbone.',
    tag: 'AI Pipeline',
    color: 'cyan',
  },
  {
    n: '05',
    title: 'Delivery',
    desc: 'QA pass, performance audit (Lighthouse ≥ 85), accessibility check, content polish, deployment to Vercel, and a handover doc with editable prompts.',
    tag: 'Launch',
    color: 'magenta',
  },
]

const COLOR_HEX: Record<string, string> = {
  violet: '#a463f2',
  cyan: '#5ce5ff',
  magenta: '#ff5cc8',
}

export function ProcessSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const lineRef = useRef<SVGPathElement | null>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.7', 'end 0.5'],
  })

  // SVG path length is ~1200 in this layout; we animate strokeDashoffset
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section
      id="level-process"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-background py-24 md:py-36"
      aria-label="Process — Level 04 Roadmap"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-grid opacity-20 mask-fade-b" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <SectionHeader
          level="04"
          eyebrow="The Roadmap"
          title={
            <>
              <span className="text-gradient-mono">A five-node</span>
              <br />
              <span className="text-gradient-accent">quest path.</span>
            </>
          }
          description="From blank brief to a deployed, AI-augmented ship — each node lights up as you scroll past it. This is the path every project walks."
        />

        <div className="relative mt-20">
          {/* SVG glow line — self-drawing */}
          <svg
            className="pointer-events-none absolute left-[28px] top-0 z-0 h-full w-[2px] md:left-1/2 md:-translate-x-1/2"
            preserveAspectRatio="none"
            viewBox="0 0 2 1200"
            fill="none"
            aria-hidden
          >
            {/* Base (dim) line */}
            <line
              x1="1"
              y1="0"
              x2="1"
              y2="1200"
              stroke="oklch(1 0 0 / 8%)"
              strokeWidth="2"
            />
            {/* Animated gradient line */}
            <motion.line
              ref={lineRef as never}
              x1="1"
              y1="0"
              x2="1"
              y2="1200"
              stroke="url(#processGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                pathLength,
                filter: 'drop-shadow(0 0 6px oklch(0.62 0.24 290 / 80%))',
              }}
            />
            <defs>
              <linearGradient id="processGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a463f2" />
                <stop offset="50%" stopColor="#5ce5ff" />
                <stop offset="100%" stopColor="#ff5cc8" />
              </linearGradient>
            </defs>
          </svg>

          {/* Steps */}
          <ol className="relative z-10 flex flex-col gap-12 md:gap-16">
            {STEPS.map((step, i) => (
              <ProcessNode key={step.n} step={step} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function ProcessNode({
  step,
  index,
}: {
  step: (typeof STEPS)[number]
  index: number
}) {
  const isRight = index % 2 === 1
  const colorHex = COLOR_HEX[step.color]

  return (
    <motion.li
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex items-start gap-6 md:items-center ${
        isRight ? 'md:flex-row-reverse md:text-right' : ''
      }`}
    >
      {/* Node dot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 md:absolute md:left-1/2 md:-translate-x-1/2"
        style={{
          borderColor: colorHex,
          background: 'var(--background)',
          boxShadow: `0 0 24px -4px ${colorHex}`,
        }}
      >
        <span
          className="font-display text-sm font-bold"
          style={{ color: colorHex }}
        >
          {step.n}
        </span>
        {/* Pulse ring */}
        <span
          className="absolute inset-0 rounded-full animate-badge-pulse"
          style={{ border: `1px solid ${colorHex}` }}
        />
      </motion.div>

      {/* Content card */}
      <div
        className={`flex-1 md:w-[42%] md:flex-none ${
          isRight ? 'md:pr-12' : 'md:pl-12'
        }`}
      >
        <div className="glass hud-border relative overflow-hidden rounded-2xl p-6">
          {/* Glow */}
          <div
            className="absolute -inset-1 -z-10 opacity-30 blur-2xl"
            style={{ background: `radial-gradient(circle at 50% 0%, ${colorHex}50 0%, transparent 70%)` }}
          />
          <div className="mb-2 flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest"
              style={{
                background: `${colorHex}18`,
                color: colorHex,
                border: `1px solid ${colorHex}40`,
              }}
            >
              {step.tag}
            </span>
          </div>
          <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            {step.desc}
          </p>
        </div>
      </div>
    </motion.li>
  )
}
