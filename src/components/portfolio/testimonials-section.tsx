'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionHeader } from './reveal'

interface Testimonial {
  id: string
  quote: string
  name: string
  role: string
  rating: number
  accent: 'violet' | 'cyan' | 'magenta'
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    quote:
      'Rajnesh delivered a website that felt like a film — every scroll was a cut, every section a scene. Our investor deck got 3x more replies after we shipped the new site.',
    name: 'Aarav Mehta',
    role: 'Founder, Nova Finance',
    rating: 5,
    accent: 'violet',
  },
  {
    id: 't2',
    quote:
      'The AI trailer Rajnesh cut for our launch outperformed every traditional ad we ran. Frame-for-frame, it held up against films that cost 50x more.',
    name: 'Priya Nair',
    role: 'CMO, Pulse Festival',
    rating: 5,
    accent: 'cyan',
  },
  {
    id: 't3',
    quote:
      'He turned around 24 poster variants in 3 days, all on-brand, all ready to ship. We have never worked with anyone who could match that pace with that quality.',
    name: 'Daniel Okafor',
    role: 'Brand Lead, Vega D2C',
    rating: 5,
    accent: 'magenta',
  },
  {
    id: 't4',
    quote:
      'Rare combo — someone who can write shader code AND direct a key art frame. Rajnesh is now on permanent retainer for our studio.',
    name: 'Sara Klein',
    role: 'Creative Director, Atlas Studio',
    rating: 5,
    accent: 'violet',
  },
]

const ACCENT_HEX: Record<Testimonial['accent'], string> = {
  violet: '#a463f2',
  cyan: '#5ce5ff',
  magenta: '#ff5cc8',
}

export function TestimonialsSection() {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setIdx((p) => (p + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(id)
  }, [paused])

  const t = TESTIMONIALS[idx]
  const accentHex = ACCENT_HEX[t.accent]

  return (
    <section
      id="level-testimonials"
      className="relative w-full overflow-hidden bg-background py-24 md:py-36"
      aria-label="Testimonials — Level 05 Player Reviews"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <SectionHeader
          level="05"
          eyebrow="Player Reviews"
          title={
            <>
              <span className="text-gradient-mono">From the</span>{' '}
              <span className="text-gradient-accent">leaderboard.</span>
            </>
          }
          description="Founders, CMOs, and creative directors who have shipped with Rajnesh across all three pillars."
        />

        <div
          className="relative mt-16 flex min-h-[360px] items-center justify-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Morphing blob background */}
          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 blur-3xl"
              style={{
                background: `radial-gradient(circle at 40% 40%, ${accentHex}30 0%, transparent 60%), radial-gradient(circle at 60% 60%, ${accentHex}25 0%, transparent 70%)`,
                borderRadius: '60% 40% 50% 50% / 50% 60% 40% 50%',
                animation: 'morph 8s ease-in-out infinite',
              }}
            />
          </AnimatePresence>

          {/* Blob morph animation keyframe */}
          <style jsx>{`
            @keyframes morph {
              0%, 100% { border-radius: 60% 40% 50% 50% / 50% 60% 40% 50%; transform: translate(-50%, -50%) rotate(0deg); }
              33% { border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%; transform: translate(-50%, -50%) rotate(120deg); }
              66% { border-radius: 50% 50% 40% 60% / 40% 60% 50% 50%; transform: translate(-50%, -50%) rotate(240deg); }
            }
          `}</style>

          {/* Quote */}
          <div className="relative z-10 max-w-3xl px-4 text-center">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={t.id}
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Rating */}
                <div className="mb-6 flex items-center justify-center gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span
                      key={i}
                      className="font-display text-lg"
                      style={{ color: accentHex, textShadow: `0 0 12px ${accentHex}` }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="font-display text-2xl font-medium leading-snug tracking-tight text-balance md:text-3xl lg:text-4xl">
                  <span className="text-muted-foreground">“</span>
                  {t.quote}
                  <span className="text-muted-foreground">”</span>
                </p>
                <div className="mt-6">
                  <div className="font-display text-base font-semibold text-foreground">
                    {t.name}
                  </div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </motion.blockquote>
            </AnimatePresence>
          </div>
        </div>

        {/* Dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {TESTIMONIALS.map((tt, i) => (
            <button
              key={tt.id}
              aria-label={`Show review ${i + 1}`}
              onClick={() => setIdx(i)}
              data-cursor="jump"
              className={`h-1.5 rounded-full transition-all ${
                i === idx
                  ? 'w-8 bg-gradient-to-r from-violet to-cyan'
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
