'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Reveal, SectionHeader } from './reveal'
import { useMotionProfile } from '@/lib/use-motion-profile'
import { useMounted } from '@/lib/use-mounted'

const AboutObject = dynamic(
  () => import('./three/about-object').then((m) => m.AboutObject),
  { ssr: false }
)

const SKILL_TAGS = [
  { label: 'Next.js', depth: 1, cat: 'dev' },
  { label: 'React', depth: 0, cat: 'dev' },
  { label: 'TypeScript', depth: 2, cat: 'dev' },
  { label: 'Three.js / R3F', depth: 1, cat: 'dev' },
  { label: 'Tailwind CSS', depth: 0, cat: 'dev' },
  { label: 'GSAP', depth: 2, cat: 'dev' },
  { label: 'Framer Motion', depth: 1, cat: 'dev' },
  { label: 'Midjourney', depth: 0, cat: 'ai' },
  { label: 'Runway Gen-3', depth: 2, cat: 'ai' },
  { label: 'Sora', depth: 1, cat: 'ai' },
  { label: 'Stable Diffusion', depth: 0, cat: 'ai' },
  { label: 'ComfyUI', depth: 1, cat: 'ai' },
  { label: 'Figma', depth: 0, cat: 'design' },
  { label: 'Photoshop', depth: 1, cat: 'design' },
  { label: 'Illustrator', depth: 2, cat: 'design' },
  { label: 'After Effects', depth: 0, cat: 'design' },
]

const STATS = [
  { label: 'Years of Craft', value: '6+' },
  { label: 'Projects Shipped', value: '50+' },
  { label: 'Client Satisfaction', value: '98%' },
]

export function AboutSection() {
  const profile = useMotionProfile()
  const sectionRef = useRef<HTMLElement | null>(null)
  const objectScrollRef = useRef<number>(0)
  const mounted = useMounted()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Map scroll progress to a 0..1 value the 3D object reads each frame
  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      objectScrollRef.current = v
    })
  }, [scrollYProgress])

  // Parallax layers
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '-25%'])
  const yMid = useTransform(scrollYProgress, [0, 1], ['0%', '-12%'])
  const yFg = useTransform(scrollYProgress, [0, 1], ['0%', '6%'])

  return (
    <section
      id="level-about"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-transparent py-12 md:py-36"
      aria-label="About — Level 01 Character Profile"
    >
      {/* Parallax background */}
      <motion.div
        style={{ y: yBg }}
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div
          className="absolute -left-32 top-20 h-[40vmin] w-[40vmin] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, oklch(0.62 0.24 290 / 40%) 0%, transparent 70%)' }}
        />
      </motion.div>
      <motion.div
        style={{ y: yMid }}
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div
          className="absolute right-0 bottom-20 h-[35vmin] w-[35vmin] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, oklch(0.78 0.18 200 / 40%) 0%, transparent 70%)' }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <SectionHeader
          level="01"
          eyebrow="Character Profile"
          title={
            <>
              <span className="text-gradient-mono">A creator who</span>
              <br />
              <span className="text-gradient-accent">speaks in three dialects.</span>
            </>
          }
          description="Rajnesh operates at the intersection of engineering, cinematic AI video, and visual identity — flipping between code, frames, and posters without dropping the cinematic thread that ties them all together."
        />

        {/* Split layout: text/stats left, 3D object right */}
        <div className="mt-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left column */}
          <motion.div style={{ y: yFg }} className="flex flex-col gap-8">
            <Reveal>
              <p className="text-base leading-relaxed text-zinc-100 md:text-lg">
                I build websites that feel like films — engineered with{' '}
                <span className="text-gradient-accent">Next.js, React Three Fiber, and custom GLSL</span>{' '}
                shaders, tuned for buttery 60fps motion. Then I switch hats and direct
                AI-generated video with Runway, Sora, and ComfyUI pipelines — cutting,
                re-timing, and grading them in After Effects until they read like a trailer.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-base leading-relaxed text-zinc-300 md:text-lg">
                And the third dialect — AI poster & graphic design — pulls everything
                together: key art, social creatives, and brand systems generated with
                Midjourney and Stable Diffusion, refined in Figma and Photoshop until
                they ship as a coherent visual identity, not just a feed of pretty images.
              </p>
            </Reveal>

            {/* Stats row */}
            <Reveal delay={0.15}>
              <div className="grid grid-cols-3 gap-4">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="glass hud-border rounded-xl p-4 text-center"
                  >
                    <div className="font-display text-2xl font-bold text-gradient-accent md:text-3xl">
                      {s.value}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Skill tags floating at different parallax depths */}
            <Reveal delay={0.2}>
              <div className="relative">
                <div className="mb-3 text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
                  Skill Inventory
                </div>
                <div className="flex flex-wrap gap-2">
                  {SKILL_TAGS.map((tag, i) => (
                    <motion.span
                      key={tag.label}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.03,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      data-depth={tag.depth}
                      className="group relative inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-violet/40 hover:text-foreground"
                      style={{
                        // depth-based parallax: nearer = slightly larger / brighter
                        fontSize: `${0.78 + tag.depth * 0.06}rem`,
                        opacity: 0.6 + tag.depth * 0.2,
                      }}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          tag.cat === 'dev'
                            ? 'bg-violet'
                            : tag.cat === 'ai'
                            ? 'bg-cyan'
                            : 'bg-magenta'
                        }`}
                      />
                      {tag.label}
                    </motion.span>
                  ))}
                </div>
                <div className="mt-3 flex gap-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet" /> Development
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan" /> AI Generation
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-magenta" /> Design
                  </span>
                </div>
              </div>
            </Reveal>
          </motion.div>

          {/* Right column: 3D object */}
          <div className="relative">
            <div className="relative aspect-square w-full max-w-xl mx-auto">
              {/* Decorative HUD frame */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute left-0 top-0 h-8 w-8 border-l border-t border-white/30" />
                <div className="absolute right-0 top-0 h-8 w-8 border-r border-t border-white/30" />
                <div className="absolute left-0 bottom-0 h-8 w-8 border-l border-b border-white/30" />
                <div className="absolute right-0 bottom-0 h-8 w-8 border-r border-b border-white/30" />
                <div className="absolute left-1/2 top-2 -translate-x-1/2 text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
                  Avatar · Model Viewer
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-cyan" />
                  Live · WebGL
                </div>
              </div>

              {/* Developer Profile Hologram Image */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="relative aspect-square h-4/5 overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-2xl">
                  {/* Photo stream from converted Google Drive ID */}
                  <img
                    src="https://lh3.googleusercontent.com/d/18c9-YRBOvL4prowS57WTWreJQZQ38ymk"
                    alt="Rajnesh Upadhyay"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  {/* Scanner overlay effect */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-violet/20 via-transparent to-cyan/20 mix-blend-overlay" />
                  <div className="pointer-events-none absolute left-0 top-0 h-0.5 w-full bg-cyan/70 shadow-[0_0_8px_#5ce5ff] animate-scanline" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
