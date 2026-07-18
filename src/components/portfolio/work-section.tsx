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
  gradient: string
  icon: string
  url: string
  screenshotUrl: string
}

const PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'ERP School Portal',
    category: 'websites',
    type: 'Web App',
    year: '2025',
    description: 'A comprehensive ERP management dashboard for educational institutions, handling students, classes, and schedules.',
    tags: ['Next.js', 'Dashboard', 'ERP', 'Tailwind'],
    gradient: 'linear-gradient(135deg, #a463f2 0%, #5ce5ff 100%)',
    icon: '◆',
    url: 'https://erp-shool-five.vercel.app/',
    screenshotUrl: 'https://api.microlink.io?url=https://erp-shool-five.vercel.app/&screenshot=true&embed=screenshot.url'
  },
  {
    id: 'p2',
    title: 'Ivory Restaurant',
    category: 'websites',
    type: 'Landing Page',
    year: '2025',
    description: 'A premium restaurant landing page with elegant visual menus, interactive reservations, and food highlights.',
    tags: ['React', 'UI/UX', 'Restaurant', 'Vite'],
    gradient: 'linear-gradient(135deg, #5ce5ff 0%, #ff5cc8 100%)',
    icon: '▶',
    url: 'https://resturant2-ivory.vercel.app/',
    screenshotUrl: 'https://api.microlink.io?url=https://resturant2-ivory.vercel.app/&screenshot=true&embed=screenshot.url'
  },
  {
    id: 'p3',
    title: 'KTM Animation Restaurant',
    category: 'websites',
    type: 'Interactive Web',
    year: '2025',
    description: 'An animated, highly interactive digital dining experience showcasing food items with custom GSAP transitions.',
    tags: ['GSAP', 'Animations', 'Restaurant', 'Tailwind'],
    gradient: 'linear-gradient(135deg, #ff5cc8 0%, #a463f2 100%)',
    icon: '✦',
    url: 'https://ktm-animation-resturant.vercel.app/',
    screenshotUrl: 'https://api.microlink.io?url=https://ktm-animation-resturant.vercel.app/&screenshot=true&embed=screenshot.url'
  },
  {
    id: 'p4',
    title: 'Rajnesh Portfolio',
    category: 'websites',
    type: 'Portfolio',
    year: '2025',
    description: 'Personal developer portfolio and creative playground showcasing animated web elements and design concepts.',
    tags: ['Next.js', 'GSAP', 'Portfolio', 'Design'],
    gradient: 'linear-gradient(135deg, #a463f2 0%, #ff5cc8 100%)',
    icon: '◇',
    url: 'https://rajnesj-portfolio.vercel.app/',
    screenshotUrl: 'https://api.microlink.io?url=https://rajnesj-portfolio.vercel.app/&screenshot=true&embed=screenshot.url'
  },
  {
    id: 'p5',
    title: 'Iway Shoppe',
    category: 'websites',
    type: 'E-Commerce',
    year: '2024',
    description: 'A modern e-commerce storefront featuring dynamic product catalogs, shopping cart, and animated transitions.',
    tags: ['E-Commerce', 'React', 'State Management', 'Tailwind'],
    gradient: 'linear-gradient(135deg, #5ce5ff 0%, #a463f2 100%)',
    icon: '►',
    url: 'https://iway-shoppe.vercel.app/',
    screenshotUrl: 'https://api.microlink.io?url=https://iway-shoppe.vercel.app/&screenshot=true&embed=screenshot.url'
  },
  {
    id: 'p6',
    title: 'Oryizon Company',
    category: 'websites',
    type: 'Corporate Web',
    year: '2024',
    description: 'Corporate website for Oryizon Company detailing professional business services, workflows, and contact modules.',
    tags: ['Business', 'UI/UX', 'Next.js', 'SEO'],
    gradient: 'linear-gradient(135deg, #ff5cc8 0%, #5ce5ff 100%)',
    icon: '✧',
    url: 'https://oryizon-company.vercel.app/',
    screenshotUrl: 'https://api.microlink.io?url=https://oryizon-company.vercel.app/&screenshot=true&embed=screenshot.url'
  },
  {
    id: 'p7',
    title: 'Real Estate Three',
    category: 'websites',
    type: 'Web Portal',
    year: '2024',
    description: 'Property listing and real estate portal with search features, interactive galleries, and realtor contacts.',
    tags: ['Real Estate', 'React', 'Map API', 'Tailwind'],
    gradient: 'linear-gradient(135deg, #a463f2 0%, #5ce5ff 100%)',
    icon: '⬡',
    url: 'https://real-estate-three-roan.vercel.app/',
    screenshotUrl: 'https://api.microlink.io?url=https://real-estate-three-roan.vercel.app/&screenshot=true&embed=screenshot.url'
  },
  {
    id: 'p8',
    title: 'Restaurant w1id',
    category: 'websites',
    type: 'Bistro Menu',
    year: '2024',
    description: 'A clean and minimalist digital bistro menu design optimized for mobile dining and online ordering.',
    tags: ['Bistro', 'Mobile UI', 'Next.js', 'CSS'],
    gradient: 'linear-gradient(135deg, #5ce5ff 0%, #ff5cc8 100%)',
    icon: '▼',
    url: 'https://resturant-w1id.vercel.app/',
    screenshotUrl: 'https://api.microlink.io?url=https://resturant-w1id.vercel.app/&screenshot=true&embed=screenshot.url'
  },
  {
    id: 'p9',
    title: 'Indian Accent Restaurant',
    category: 'websites',
    type: 'Bespoke Dining',
    year: '2024',
    description: 'A custom dining presentation website styled for modern Indian fine dining, featuring interactive booking.',
    tags: ['Fine Dining', 'Web Design', 'GSAP', 'React'],
    gradient: 'linear-gradient(135deg, #ff5cc8 0%, #a463f2 100%)',
    icon: '▲',
    url: 'https://indian-acentresturant.vercel.app/',
    screenshotUrl: 'https://api.microlink.io?url=https://indian-acentresturant.vercel.app/&screenshot=true&embed=screenshot.url'
  },
  {
    id: 'p10',
    title: 'Shop 2 Topaz',
    category: 'websites',
    type: 'Shop Store',
    year: '2024',
    description: 'Curated jewelry and lifestyle shopping platform featuring high-fidelity product cards and interactive checkout.',
    tags: ['Jewelry Shop', 'Tailwind', 'Cart System', 'Vite'],
    gradient: 'linear-gradient(135deg, #a463f2 0%, #ff5cc8 100%)',
    icon: '⬢',
    url: 'https://shop2-topaz.vercel.app/',
    screenshotUrl: 'https://api.microlink.io?url=https://shop2-topaz.vercel.app/&screenshot=true&embed=screenshot.url'
  }
]

const FILTERS: { id: Category; label: string }[] = [
  { id: 'all', label: 'All Projects' }
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
    ['0%', `-${Math.max(0, PROJECTS.length - 1) * 60}%`]
  )

  return (
    <section
      id="level-work"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-transparent"
      aria-label="Featured Work — Level 03 Mission Log"
    >
      {/* Top: header (sticky-positioned so it stays visible while track scrolls) */}
      <div className="sticky top-0 z-30 bg-[#0d0a1b]/80 backdrop-blur-md border-b border-white/10">
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
              description="Scroll to traverse the gallery. Click on any card to visit the live website."
            />
          </div>
        </div>
      </div>

      {/* Horizontal track (desktop) / vertical stack (mobile) */}
      {isDesktop ? (
        <div
          className="relative"
          style={{ height: `${PROJECTS.length * 60}vh` }}
        >
          <div className="sticky top-0 flex h-screen items-center overflow-hidden">
            <motion.div
              ref={trackRef}
              style={{ x, paddingLeft: '6vw', paddingRight: '6vw' }}
              className="flex gap-8 will-change-transform"
            >
              {PROJECTS.map((p, i) => (
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
          {PROJECTS.map((p, i) => (
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
      <a 
        href={project.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block cursor-pointer"
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
            className="flex items-center gap-1.5 rounded-full border border-cyan/35 bg-cyan/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-cyan"
          >
            <span className="h-1 w-1 rounded-full bg-cyan animate-pulse" />
            Live Project
          </motion.span>
        </div>

        <div
          ref={cardRef}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="relative overflow-hidden rounded-2xl glass-strong border border-white/10 hover:border-cyan/35 transition-all duration-300"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 30px 80px -30px oklch(0 0 0 / 60%)',
          }}
        >
          {/* Visual */}
          <div
            className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950"
          >
            {project.screenshotUrl ? (
              <img 
                src={project.screenshotUrl} 
                alt={project.title}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div style={{ background: project.gradient }} className="w-full h-full">
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
              </div>
            )}

            {/* Pattern overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

            {/* Top-left meta */}
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="rounded-full bg-[#0d0a1b]/60 border border-white/10 px-2 py-1 text-[10px] uppercase tracking-widest text-white backdrop-blur">
                {project.type}
              </span>
            </div>
            <div className="absolute right-4 top-4 text-[10px] uppercase tracking-widest text-white/80 drop-shadow">
              {project.year}
            </div>

            {/* Bottom morph overlay (animated) */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-violet to-cyan"
              style={{ transformOrigin: '0% 50%' }}
            />
          </div>

          {/* Body */}
          <div className="p-6">
            <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl text-white group-hover:text-cyan transition-colors duration-300">
              {project.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-widest text-foreground/75"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </a>
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
