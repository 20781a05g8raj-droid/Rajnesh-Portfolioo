'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SectionHeader } from './reveal'

type Category = 'websites' | 'videos' | 'posters'

interface Project {
  id: string
  title: string
  category: Category
  type: string
  year: string
  description: string
  tags: string[]
  gradient: string
  icon: string
  url: string
  screenshotUrl: string
  mediaUrl?: string
  aiPrompt?: string
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
  },
  {
    id: 'v1',
    title: 'Cyberpunk AI Brand Commercial',
    category: 'videos',
    type: 'AI Video Ad',
    year: '2025',
    description: 'Cinematic AI-generated commercial video featuring custom voiceover, motion graphics, and futuristic sound design.',
    tags: ['Runway Gen-3', 'Luma AI', 'Premiere Pro', 'AI Video'],
    gradient: 'linear-gradient(135deg, #ff007f 0%, #7f00ff 100%)',
    icon: '🎬',
    url: '#',
    screenshotUrl: '',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-41551-large.mp4',
    aiPrompt: 'Cinematic hyperrealistic cyberpunk city at night with flying neon vehicles, 8k resolution, volumetric lighting, unreal engine 5 render, anamorphic lens --ar 16:9 --v 6.0'
  },
  {
    id: 'v2',
    title: 'Luxury Perfume AI Showcase',
    category: 'videos',
    type: 'AI Product Ad',
    year: '2025',
    description: 'High-end product video ad generated using Midjourney v6 + Kling AI with photorealistic fluid physics.',
    tags: ['Midjourney', 'Kling AI', 'Product Ad', 'VFX'],
    gradient: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
    icon: '🎥',
    url: '#',
    screenshotUrl: '',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-41553-large.mp4',
    aiPrompt: 'Photorealistic crystalline perfume bottle bursting through liquid gold ripples, slow motion 120fps, macro shot, studio lighting, octanereder --ar 16:9'
  },
  {
    id: 'g1',
    title: 'Neon Odyssey Event Poster',
    category: 'posters',
    type: 'Poster Design',
    year: '2025',
    description: 'High-resolution creative poster design for digital music festival, blending 3D typography with AI artwork.',
    aiPrompt: 'Futuristic music festival poster artwork, cybernetic female DJ wearing glowing visor, holographic text "NEON ODYSSEY", vibrant magenta and cyan palette, 8k resolution, octane render --ar 3:4 --style raw',
    tags: ['Photoshop', 'Midjourney v6', 'Poster', 'Typography'],
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: '🖼',
    url: '#',
    screenshotUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'g2',
    title: 'Future Tech Summit Branding',
    category: 'posters',
    type: 'Brand Graphic',
    year: '2025',
    description: 'Complete promotional poster series and social media ad creative assets generated for tech conference.',
    aiPrompt: 'Minimalist AI conference promotional poster, floating 3D chrome geometric shapes reflecting iridescent violet lighting, sleek typography "FUTURE TECH 2025", studio lighting, trending on Behance --ar 3:4',
    tags: ['Illustrator', 'Midjourney', 'Social Media', 'AI Art'],
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    icon: '🎨',
    url: '#',
    screenshotUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  }
]

const FILTERS: { id: Category; label: string }[] = [
  { id: 'websites', label: 'Websites & Apps' },
  { id: 'videos', label: 'AI Videos & Ads' },
  { id: 'posters', label: 'Posters & Graphics' },
]

export function WorkSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [filter, setFilter] = useState<Category>('websites')
  const [isDesktop, setIsDesktop] = useState(true)
  const [scrollRange, setScrollRange] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(900)
  const [selectedMedia, setSelectedMedia] = useState<Project | null>(null)
  const [modalCopied, setModalCopied] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const filtered = PROJECTS.filter((p) => p.category === filter)

  useEffect(() => {
    if (!isDesktop) return

    const updateRange = () => {
      setViewportHeight(window.innerHeight)
      if (trackRef.current) {
        const totalWidth = trackRef.current.scrollWidth
        const visibleWidth = window.innerWidth
        const range = Math.max(1000, totalWidth - visibleWidth + 180)
        setScrollRange(range)
      }
    }

    updateRange()
    const t1 = setTimeout(updateRange, 100)
    const t2 = setTimeout(updateRange, 500)
    const t3 = setTimeout(updateRange, 1000)
    window.addEventListener('resize', updateRange)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      window.removeEventListener('resize', updateRange)
    }
  }, [isDesktop, filter, filtered.length])

  // Horizontal scroll-jacking on desktop
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const handleFilterChange = (categoryId: Category) => {
    setFilter(categoryId)
    if (sectionRef.current) {
      const top = sectionRef.current.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  // Minimum targetX to prevent section height collapse on small category filters
  const targetX = Math.max(2000, scrollRange > 0 ? scrollRange : (filtered.length * 360))
  const x = useTransform(scrollYProgress, [0, 1], [0, -targetX])

  return (
    <section
      id="level-work"
      ref={sectionRef}
      className="relative w-full bg-transparent"
      style={isDesktop ? { height: `${targetX + viewportHeight}px` } : undefined}
      aria-label="Featured Showcase — Level 03 Mission Log"
    >
      {isDesktop ? (
        <div className="sticky top-0 flex h-screen w-full flex-col justify-between overflow-hidden pt-16 pb-4">
          {/* Top: Header with Category Filter Buttons */}
          <div className="shrink-0 bg-[#0d0a1b]/95 backdrop-blur-md border-b border-white/10 z-30">
            <div className="mx-auto max-w-7xl px-6 py-4 md:py-5">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                <SectionHeader
                  level="03"
                  eyebrow="Mission Log"
                  title={
                    <>
                      <span className="text-gradient-mono">Featured</span>{' '}
                      <span className="text-gradient-accent">Showcase.</span>
                    </>
                  }
                  description="Explore Websites, AI Video Ads, and Poster Graphics with generation prompts."
                />

                {/* Filter Tabs (No ALL button) */}
                <div className="flex flex-wrap items-center gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleFilterChange(f.id)}
                      className={`rounded-full px-5 py-2 text-xs font-mono font-medium transition-all duration-300 ${
                        filter === f.id
                          ? 'bg-gradient-to-r from-violet via-cyan to-magenta text-white shadow-[0_0_20px_rgba(92,229,255,0.3)] border border-cyan/50 scale-105'
                          : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/10'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                  <Link
                    href="/projects"
                    className="rounded-full border border-cyan/50 bg-cyan/15 px-4 py-2 text-xs font-mono font-bold text-cyan hover:bg-cyan/25 hover:scale-105 transition-all shadow-[0_0_15px_rgba(92,229,255,0.2)] ml-2 flex items-center gap-1.5"
                  >
                    Full Gallery Page ↗
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Horizontal track container */}
          <div className="flex-1 flex items-center overflow-hidden relative w-full my-auto">
            <motion.div
              ref={trackRef}
              style={{ x, paddingLeft: '6vw', paddingRight: '6vw' }}
              className="flex gap-8 will-change-transform items-center"
            >
              {filtered.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} onOpenMedia={(proj) => setSelectedMedia(proj)} />
              ))}
              <EndCard key="end" />
            </motion.div>
          </div>

          {/* Bottom: Progress hint */}
          <div className="shrink-0 flex justify-center pb-2 z-20">
            <div className="pointer-events-none flex items-center gap-3 rounded-full border border-white/10 bg-[#0d0a1b]/85 px-5 py-2 backdrop-blur md:flex shadow-lg">
              <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-mono">
                Showcase Progress
              </span>
              <ScrollProgressIndicator progress={scrollYProgress} />
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
          {/* Mobile Category Filter Buttons */}
          <div className="sticky top-16 z-30 flex flex-wrap justify-center gap-2 rounded-2xl border border-white/10 bg-[#0d0a1b]/90 p-2 backdrop-blur-md shadow-xl">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFilterChange(f.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-mono transition-all ${
                  filter === f.id
                    ? 'bg-gradient-to-r from-violet to-cyan text-black font-bold shadow-md'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
            <Link
              href="/projects"
              className="rounded-xl px-3.5 py-2 text-xs font-mono font-bold bg-cyan text-black hover:bg-cyan/80 transition-all flex items-center gap-1"
            >
              Full Gallery ↗
            </Link>
          </div>

          {filtered.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} onOpenMedia={(proj) => setSelectedMedia(proj)} />
          ))}
        </div>
      )}

      {/* Lightbox / Media Viewer Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full rounded-2xl glass-strong border border-white/20 p-5 md:p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 font-bold"
            >
              ✕
            </button>

            <div className="mb-4 pr-12">
              <span className="text-xs uppercase tracking-widest text-cyan font-mono">{selectedMedia.type}</span>
              <h3 className="text-2xl font-bold text-white font-display mt-1">{selectedMedia.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedMedia.description}</p>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-white/10 flex items-center justify-center">
              {selectedMedia.category === 'videos' && selectedMedia.mediaUrl ? (
                <video
                  src={selectedMedia.mediaUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : selectedMedia.screenshotUrl ? (
                <img
                  src={selectedMedia.screenshotUrl}
                  alt={selectedMedia.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div style={{ background: selectedMedia.gradient }} className="w-full h-full flex items-center justify-center text-6xl">
                  {selectedMedia.icon}
                </div>
              )}
            </div>

            {/* AI Prompt Section in Modal */}
            {selectedMedia.aiPrompt && (
              <div className="mt-4 rounded-xl border border-violet/40 bg-violet/10 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-violet font-bold flex items-center gap-1.5">
                    ✨ AI Generation Prompt
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMedia.aiPrompt || '')
                      setModalCopied(true)
                      setTimeout(() => setModalCopied(false), 2000)
                    }}
                    className="rounded-lg border border-violet/40 bg-violet/20 px-3 py-1 text-xs font-mono font-medium text-white hover:bg-violet/40 transition-all"
                  >
                    {modalCopied ? 'Copied to Clipboard! ✓' : 'Copy Prompt 📋'}
                  </button>
                </div>
                <p className="text-xs font-mono text-white/90 leading-relaxed italic bg-black/40 p-3 rounded-lg border border-white/10">
                  &quot;{selectedMedia.aiPrompt}&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function ScrollProgressIndicator({ progress }: { progress: any }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    return progress.on('change', (v: number) => {
      if (ref.current) ref.current.style.width = `${Math.min(100, Math.max(0, v * 100))}%`
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

function ProjectCard({ project, index, onOpenMedia }: { project: Project; index: number; onOpenMedia?: (project: Project) => void }) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [imgError, setImgError] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const isInteractive = project.category === 'videos' || project.category === 'posters' || project.url === '#'

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group relative w-full max-w-md shrink-0 md:w-[400px]"
      style={{ perspective: '1200px' }}
      data-cursor="view"
    >
      <div 
        onClick={() => {
          if (isInteractive) {
            onOpenMedia?.(project)
          } else if (project.url) {
            window.open(project.url, '_blank', 'noopener,noreferrer')
          }
        }} 
        className="block cursor-pointer"
      >
        {/* Header badge */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-mono">
            Item {String(index + 1).padStart(2, '0')}
          </span>
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.4 }}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-mono ${
              project.category === 'videos'
                ? 'border-magenta/40 bg-magenta/10 text-magenta'
                : project.category === 'posters'
                ? 'border-violet/40 bg-violet/10 text-violet'
                : 'border-cyan/35 bg-cyan/10 text-cyan'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            {project.category === 'videos' ? 'AI Video' : project.category === 'posters' ? 'Poster Design' : 'Live Project'}
          </motion.span>
        </div>

        <div
          ref={cardRef}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="relative overflow-hidden rounded-2xl glass-strong border border-white/10 group-hover:border-cyan/40 transition-all duration-300 group-hover:shadow-[0_20px_50px_rgba(92,229,255,0.15)]"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
            boxShadow: '0 30px 80px -30px oklch(0 0 0 / 60%)',
          }}
        >
          {/* Visual */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
            {project.category === 'videos' && project.mediaUrl ? (
              <div className="relative w-full h-full">
                <video
                  src={project.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur border border-white/40 text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                    ▶
                  </div>
                </div>
              </div>
            ) : !imgError && project.screenshotUrl ? (
              <img 
                src={project.screenshotUrl} 
                alt={project.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div style={{ background: project.gradient }} className="w-full h-full relative">
                {/* Pattern overlay */}
                <div className="absolute inset-0 bg-grid opacity-30 mix-blend-overlay" />
                <div className="absolute inset-0 bg-black/30" />

                {/* Big icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="font-display text-7xl font-bold text-white/80"
                    style={{ textShadow: '0 0 60px rgba(255,255,255,0.4)' }}
                  >
                    {project.icon}
                  </div>
                </div>
              </div>
            )}

            {/* Pattern overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

            {/* Top-left meta */}
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="rounded-full bg-[#0d0a1b]/80 border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-widest text-white backdrop-blur font-mono">
                {project.type}
              </span>
            </div>
            <div className="absolute right-4 top-4 text-[10px] uppercase tracking-widest text-white/90 drop-shadow font-mono">
              {project.year}
            </div>

            {/* Bottom morph overlay */}
            <div
              className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-violet to-cyan opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Body */}
          <div className="p-6">
            <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl text-white group-hover:text-cyan transition-colors duration-300">
              {project.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {project.description}
            </p>

            {/* AI Prompt Box if present */}
            {project.aiPrompt && (
              <div className="mt-3 rounded-lg border border-violet/30 bg-violet/10 p-2.5 backdrop-blur">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-violet font-bold flex items-center gap-1">
                    ✨ AI Prompt
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigator.clipboard.writeText(project.aiPrompt || '')
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="rounded bg-white/10 px-2 py-0.5 text-[9px] font-mono text-white/90 hover:bg-white/20 transition-colors"
                  >
                    {copied ? 'Copied! ✓' : 'Copy Prompt'}
                  </button>
                </div>
                <p className="text-[11px] font-mono text-white/80 line-clamp-2 italic">
                  &quot;{project.aiPrompt}&quot;
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-foreground/75 font-mono"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function EndCard() {
  return (
    <div className="flex w-full max-w-md shrink-0 flex-col items-center justify-center text-center md:w-[400px]">
      <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-mono">
        End of Category
      </div>
      <div className="mt-4 font-display text-4xl font-bold text-gradient-accent">
        Continue ↓
      </div>
      <div className="mt-3 text-sm text-muted-foreground">
        Next: process roadmap.
      </div>
    </div>
  )
}
