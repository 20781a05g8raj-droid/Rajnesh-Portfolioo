'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SectionHeader } from './reveal'

type Category = 'all' | 'websites' | 'videos' | 'posters'

interface Project {
  id: string
  title: string
  category: Exclude<Category, 'all'>
  type: string
  year: string
  description: string
  tags: string[]
  // Visual style: gradient + emoji for placeholder (no external assets)
  gradient: string
  icon: string
}

const PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Nova Finance Dashboard',
    category: 'websites',
    type: 'Web App',
    year: '2025',
    description:
      'A real-time fintech dashboard with WebGL data visualizations, custom charts, and a buttery onboarding flow. Built end-to-end in Next.js with R3F particle effects.',
    tags: ['Next.js', 'R3F', 'Prisma', 'Tailwind'],
    gradient: 'linear-gradient(135deg, #a463f2 0%, #5ce5ff 100%)',
    icon: '◆',
  },
  {
    id: 'p2',
    title: 'Sora — AI Brand Trailer',
    category: 'videos',
    type: 'AI Video',
    year: '2025',
    description:
      'A 60-second brand trailer generated with Sora + Runway Gen-3, graded and re-timed in After Effects with custom sound design for a D2C fashion launch.',
    tags: ['Sora', 'Runway', 'After Effects', 'Sound'],
    gradient: 'linear-gradient(135deg, #5ce5ff 0%, #ff5cc8 100%)',
    icon: '▶',
  },
  {
    id: 'p3',
    title: 'Pulse Festival Key Art',
    category: 'posters',
    type: 'Poster Series',
    year: '2025',
    description:
      'A 12-poster identity system for an electronic music festival — generated in Midjourney, refined in Photoshop, and delivered as OOH + social creative suites.',
    tags: ['Midjourney', 'Photoshop', 'Identity', 'OOH'],
    gradient: 'linear-gradient(135deg, #ff5cc8 0%, #a463f2 100%)',
    icon: '✦',
  },
  {
    id: 'p4',
    title: 'Atlas — 3D Product Configurator',
    category: 'websites',
    type: 'WebGL',
    year: '2024',
    description:
      'A 3D product configurator with realtime material swapping, AR preview, and a checkout flow. Three.js + GLSL for the custom material previewer.',
    tags: ['Three.js', 'GLSL', 'AR', 'Commerce'],
    gradient: 'linear-gradient(135deg, #a463f2 0%, #ff5cc8 100%)',
    icon: '◇',
  },
  {
    id: 'p5',
    title: 'Echoes — AI Short Film',
    category: 'videos',
    type: 'AI Video',
    year: '2024',
    description:
      'A 4-minute AI short film composited from ComfyUI-generated shots, with character continuity across 18 scenes and a fully synthetic voice-over.',
    tags: ['ComfyUI', 'SDXL', 'Voice', 'Edit'],
    gradient: 'linear-gradient(135deg, #5ce5ff 0%, #a463f2 100%)',
    icon: '►',
  },
  {
    id: 'p6',
    title: 'Vega — D2C Social Suite',
    category: 'posters',
    type: 'Social Pack',
    year: '2024',
    description:
      'A 24-asset social creative pack for a D2C skincare launch — Stable Diffusion + Photoshop with a single brand template driving 6 aspect ratios.',
    tags: ['Stable Diffusion', 'Photoshop', 'Social', 'D2C'],
    gradient: 'linear-gradient(135deg, #ff5cc8 0%, #5ce5ff 100%)',
    icon: '✧',
  },
]

const FILTERS: { id: Category; label: string }[] = [
  { id: 'all', label: 'All Quests' },
  { id: 'websites', label: 'Websites' },
  { id: 'videos', label: 'AI Videos' },
  { id: 'posters', label: 'AI Posters' },
]

export function WorkSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [filter, setFilter] = useState<Category>('all')
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const filtered = PROJECTS.filter(
    (p) => filter === 'all' || p.category === filter
  )

  // Horizontal scroll-jacking on desktop
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ['0%', `-${Math.max(0, filtered.length - 1) * 60}%`]
  )

  return (
    <section
      id="level-work"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-background"
      aria-label="Featured Work — Level 03 Mission Log"
    >
      {/* Top: header + filter (sticky-positioned so it stays visible while track scrolls) */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeader
              level="03"
              eyebrow="Mission Log"
              title={
                <>
                  <span className="text-gradient-mono">Featured</span>{' '}
                  <span className="text-gradient-accent">Quests.</span>
                </>
              }
              description="Scroll to traverse the gallery. Filter by quest type — websites, AI video, or AI poster design."
            />
            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  data-cursor="filter"
                  className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-widest transition-all ${
                    filter === f.id
                      ? 'border-transparent bg-gradient-to-r from-violet to-cyan text-white shadow-[0_0_24px_-6px_oklch(0.62_0.24_290)]'
                      : 'border-white/15 bg-white/5 text-muted-foreground hover:border-white/30 hover:text-foreground'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal track (desktop) / vertical stack (mobile) */}
      {isDesktop ? (
        <div
          className="relative"
          style={{ height: `${filtered.length * 60}vh` }}
        >
          <div className="sticky top-0 flex h-screen items-center overflow-hidden">
            <motion.div
              ref={trackRef}
              style={{ x, paddingLeft: '6vw', paddingRight: '6vw' }}
              className="flex gap-8 will-change-transform"
            >
              {filtered.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
              <EndCard key="end" />
            </motion.div>
          </div>

          {/* Progress hint */}
          <div className="pointer-events-none fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-2 md:flex">
            <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              Mission
            </span>
            <ScrollProgressIndicator progress={scrollYProgress} />
          </div>
        </div>
      ) : (
        <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-12">
          {filtered.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}

function ScrollProgressIndicator({ progress }: { progress: any }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    return progress.on('change', (v: number) => {
      if (ref.current) ref.current.style.width = `${v * 100}%`
    })
  }, [progress])
  return (
    <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
      <div
        ref={ref}
        className="h-full bg-gradient-to-r from-violet to-cyan"
        style={{ width: '0%' }}
      />
    </div>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
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
    el.style.transform = `rotateX(${-dy * 8}deg) rotateY(${dx * 12}deg) translateZ(0)`
  }
  function onLeave() {
    const el = cardRef.current
    if (!el) return
    el.style.transform = 'rotateX(0) rotateY(0)'
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group relative w-[78vw] max-w-md shrink-0 md:w-[400px]"
      style={{ perspective: '1200px' }}
      data-cursor="view"
    >
      {/* Achievement unlocked badge */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          Quest {String(index + 1).padStart(2, '0')}
        </span>
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-1.5 rounded-full border border-cyan/30 bg-cyan/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-cyan"
        >
          <span className="h-1 w-1 rounded-full bg-cyan" />
          Unlocked
        </motion.span>
      </div>

      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative overflow-hidden rounded-2xl glass-strong"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 30px 80px -30px oklch(0 0 0 / 60%)',
        }}
      >
        {/* Visual */}
        <div
          className="relative aspect-[4/3] w-full overflow-hidden"
          style={{ background: project.gradient }}
        >
          {/* Pattern overlay */}
          <div className="absolute inset-0 bg-grid opacity-30 mix-blend-overlay" />
          <div className="absolute inset-0 bg-black/30" />

          {/* Big icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-7xl font-bold text-white/80"
              style={{ textShadow: '0 0 60px rgba(255,255,255,0.4)' }}
            >
              {project.icon}
            </motion.div>
          </div>

          {/* Top-left meta */}
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full bg-black/40 px-2 py-1 text-[10px] uppercase tracking-widest text-white backdrop-blur">
              {project.type}
            </span>
          </div>
          <div className="absolute right-4 top-4 text-[10px] uppercase tracking-widest text-white/80">
            {project.year}
          </div>

          {/* Bottom morph overlay (animated) */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-0 left-0 h-1 w-full bg-white"
            style={{ transformOrigin: '0% 50%' }}
          />
        </div>

        {/* Body */}
        <div className="p-6">
          <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
            {project.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-widest text-foreground/70"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function EndCard() {
  return (
    <div className="flex w-[60vw] max-w-md shrink-0 flex-col items-center justify-center text-center md:w-[400px]">
      <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
        End of Mission Log
      </div>
      <div className="mt-4 font-display text-4xl font-bold text-gradient-accent">
        Continue ↓
      </div>
      <div className="mt-3 text-sm text-muted-foreground">
        Next: the roadmap that powered these quests.
      </div>
    </div>
  )
}
