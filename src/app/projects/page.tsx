'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { SmoothScrollProvider } from '@/components/portfolio/smooth-scroll-provider'
import { CustomCursor } from '@/components/portfolio/custom-cursor'
import { WhatsAppButton } from '@/components/portfolio/whatsapp-button'
import { Footer } from '@/components/portfolio/footer'
import { useMounted } from '@/lib/use-mounted'

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

const ALL_PROJECTS: Project[] = [
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

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'websites', label: 'Websites & Apps', icon: '💻' },
  { id: 'videos', label: 'AI Videos & Ads', icon: '🎬' },
  { id: 'posters', label: 'Posters & Graphics', icon: '🎨' },
]

export default function ProjectsPage() {
  const mounted = useMounted()
  const [filter, setFilter] = useState<Category>('websites')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<Project | null>(null)
  const [modalCopied, setModalCopied] = useState(false)

  const filteredProjects = ALL_PROJECTS.filter((p) => {
    const matchesCategory = p.category === filter
    const matchesSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.aiPrompt && p.aiPrompt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen w-full bg-[#0d0a1b] text-foreground selection:bg-cyan/30">
        {mounted && <CustomCursor />}
        {mounted && <WhatsAppButton />}

        {/* Navigation Header */}
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0d0a1b]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-8 w-8">
                <div className="absolute inset-0 rounded bg-gradient-to-br from-violet to-cyan opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center font-display text-xs font-bold text-white">
                  R
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-sm font-semibold tracking-wide text-white group-hover:text-cyan transition-colors">
                  RAJNESH UPADHYAY
                </span>
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">
                  ← Back to Home
                </span>
              </div>
            </Link>

            <a
              href="https://wa.me/918521311624?text=Hello%20Rajnesh!%20I%20visited%20your%20Projects%20gallery."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-mono text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Chat on WhatsApp 💬
            </a>
          </div>
        </header>

        {/* Hero Banner */}
        <div className="relative border-b border-white/10 bg-gradient-to-b from-transparent via-violet/5 to-transparent px-6 py-12 md:py-20">
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-4 py-1 text-xs font-mono text-cyan mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-ping" />
              Dedicated Showcase Gallery
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
              <span className="text-gradient-mono">Featured</span>{' '}
              <span className="text-gradient-accent">Works &amp; Creations.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Explore complete Web Applications, AI Commercial Video Ads, and Graphic Poster designs along with exact AI Prompts.
            </p>

            {/* Category Filter Buttons (No ALL button) */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilter(cat.id)}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-mono font-bold transition-all duration-300 ${
                    filter === cat.id
                      ? 'bg-gradient-to-r from-violet via-cyan to-magenta text-white shadow-[0_0_25px_rgba(92,229,255,0.35)] border border-cyan/50 scale-105'
                      : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Real-time Search Box */}
            <div className="mx-auto mt-6 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, tag, or AI prompt..."
                  className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 pl-11 text-xs font-mono text-white placeholder:text-muted-foreground outline-none focus:border-cyan/50 focus:bg-white/10 transition-colors shadow-lg"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  🔍
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid Container */}
        <main className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Category: <span className="text-cyan font-bold">{CATEGORIES.find((c) => c.id === filter)?.label}</span>
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-white/80">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project, idx) => (
                <ProjectCardItem
                  key={project.id}
                  project={project}
                  index={idx}
                  onOpenMedia={(p) => setSelectedMedia(p)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <h3 className="text-lg font-bold text-white font-display">No items found</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search query or switching categories.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 rounded-full border border-cyan/40 bg-cyan/10 px-4 py-1.5 text-xs font-mono text-cyan hover:bg-cyan/20 transition-all"
              >
                Clear Search Filter
              </button>
            </div>
          )}
        </main>

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

        <Footer />
      </div>
    </SmoothScrollProvider>
  )
}

function ProjectCardItem({ project, index, onOpenMedia }: { project: Project; index: number; onOpenMedia?: (project: Project) => void }) {
  const [imgError, setImgError] = useState(false)
  const [copied, setCopied] = useState(false)

  const isInteractive = project.category === 'videos' || project.category === 'posters' || project.url === '#'

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="group relative flex flex-col rounded-2xl glass-strong border border-white/10 overflow-hidden hover:border-cyan/40 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(92,229,255,0.12)]"
    >
      <div
        onClick={() => {
          if (isInteractive) {
            onOpenMedia?.(project)
          } else if (project.url) {
            window.open(project.url, '_blank', 'noopener,noreferrer')
          }
        }}
        className="flex flex-col h-full cursor-pointer"
      >
        {/* Media Preview */}
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
              <div className="absolute inset-0 bg-grid opacity-30 mix-blend-overlay" />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="font-display text-6xl font-bold text-white/80">
                  {project.icon}
                </div>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="rounded-full bg-[#0d0a1b]/80 border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-widest text-white backdrop-blur font-mono">
              {project.type}
            </span>
          </div>
          <div className="absolute right-3 top-3 text-[10px] uppercase tracking-widest text-white/90 drop-shadow font-mono">
            {project.year}
          </div>
        </div>

        {/* Card Content */}
        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-display text-lg font-bold text-white group-hover:text-cyan transition-colors">
              {project.title}
            </h3>
            <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              project.category === 'videos'
                ? 'border-magenta/40 bg-magenta/10 text-magenta'
                : project.category === 'posters'
                ? 'border-violet/40 bg-violet/10 text-violet'
                : 'border-cyan/35 bg-cyan/10 text-cyan'
            }`}>
              {project.category}
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
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
              <p className="text-[10px] font-mono text-white/80 line-clamp-2 italic">
                &quot;{project.aiPrompt}&quot;
              </p>
            </div>
          )}

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-white/5">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-widest text-foreground/75 font-mono"
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
