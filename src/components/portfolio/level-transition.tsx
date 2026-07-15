'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const LEVELS = ['hero', 'about', 'services', 'work', 'process', 'testimonials', 'contact']

const LABELS: Record<string, string> = {
  hero: '00 · Spawn',
  about: '01 · Character Profile',
  services: '02 · Skill Trees',
  work: '03 · Mission Log',
  process: '04 · The Roadmap',
  testimonials: '05 · Player Reviews',
  contact: '06 · Boss CTA',
}

/**
 * Lightweight level-transition overlay.
 * Fires a brief glitch-flash + "ENTERING LEVEL XX" badge whenever the active section changes.
 */
export function LevelTransition() {
  const [active, setActive] = useState<string>('hero')
  const [flash, setFlash] = useState<{ id: string; label: string } | null>(null)

  useEffect(() => {
    const sections = LEVELS.map((id) => document.getElementById(`level-${id}`)).filter(
      Boolean
    ) as HTMLElement[]
    let lastActive = 'hero'

    function onScroll() {
      const vh = window.innerHeight
      const center = window.scrollY + vh * 0.4
      let cur = 'hero'
      for (const s of sections) {
        if (center >= s.offsetTop) cur = s.id.replace('level-', '')
      }
      if (cur !== lastActive) {
        lastActive = cur
        setActive(cur)
        setFlash({ id: `${cur}-${Date.now()}`, label: LABELS[cur] ?? cur })
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {flash && active !== 'hero' ? (
        <motion.div
          key={flash.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Glitch flash background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.4, times: [0, 0.2, 1] }}
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, oklch(0.62 0.24 290 / 30%) 0%, oklch(0.78 0.18 200 / 20%) 50%, oklch(0.70 0.24 330 / 30%) 100%)',
              mixBlendMode: 'screen',
            }}
          />
          {/* Entering-level badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -10 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => setTimeout(() => setFlash(null), 900)}
            className="relative z-10 flex flex-col items-center gap-2"
          >
            <div className="text-[10px] uppercase tracking-[0.5em] text-cyan">
              Entering Level
            </div>
            <div className="font-display text-3xl font-bold text-gradient-accent md:text-5xl">
              {flash.label}
            </div>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </motion.div>

          {/* Scanlines */}
          <div className="absolute inset-0 scanlines opacity-40" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
