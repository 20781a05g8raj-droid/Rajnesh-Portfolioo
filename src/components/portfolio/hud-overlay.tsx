'use client'

import { useEffect, useState } from 'react'

const LEVELS = [
  { id: 'hero', label: '00' },
  { id: 'about', label: '01' },
  { id: 'services', label: '02' },
  { id: 'work', label: '03' },
  { id: 'process', label: '04' },
  { id: 'testimonials', label: '05' },
  { id: 'contact', label: '06' },
]

/**
 * Fixed HUD-style overlay:
 * - Top-right: small level progress dots with "LEVEL XX" label
 * - Right-edge: thin vertical scroll progress bar
 * - Top-left: minimal brand mark
 */
export function HudOverlay() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const sections = LEVELS.map((l) => document.getElementById(`level-${l.id}`)).filter(
      Boolean
    ) as HTMLElement[]

    function onScroll() {
      const vh = window.innerHeight
      const center = window.scrollY + vh * 0.4
      let idx = 0
      for (let i = 0; i < sections.length; i++) {
        const top = sections[i].offsetTop
        if (center >= top) idx = i
      }
      setActiveIdx(idx)

      const docH = document.documentElement.scrollHeight - vh
      const p = docH > 0 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0
      setProgress(p)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <>
      {/* Top-left brand mark */}
      <div className="pointer-events-none fixed left-5 top-5 z-50 flex items-center gap-2 md:left-8 md:top-7">
        <div className="relative h-7 w-7">
          <div className="absolute inset-0 rounded-sm border border-white/30" />
          <div className="absolute inset-1 rounded-sm bg-gradient-to-br from-violet to-cyan" />
          <div className="absolute inset-0 flex items-center justify-center font-display text-[10px] font-bold text-white">
            R
          </div>
        </div>
        <div className="hidden flex-col leading-none sm:flex">
          <span className="font-display text-xs font-semibold tracking-wide text-foreground">
            RAJNESH
          </span>
          <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            UPADHYAY
          </span>
        </div>
      </div>

      {/* Top-right level HUD */}
      <div className="pointer-events-none fixed right-5 top-5 z-50 flex flex-col items-end gap-2 md:right-8 md:top-7">
        <div className="glass hud-border flex items-center gap-2 rounded-full px-3 py-1.5">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Level
          </span>
          <span className="font-display text-sm font-semibold text-gradient-accent tabular-nums">
            {LEVELS[activeIdx].label}
          </span>
          <span className="h-3 w-px bg-white/20" />
          <span className="text-[10px] text-muted-foreground tabular-nums">
            / {LEVELS[LEVELS.length - 1].label}
          </span>
        </div>
        <div className="hidden items-center gap-1.5 md:flex">
          {LEVELS.map((l, i) => (
            <button
              key={l.id}
              aria-label={`Jump to level ${l.label}`}
              onClick={() => {
                const el = document.getElementById(`level-${l.id}`)
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className={`pointer-events-auto h-1.5 rounded-full transition-all duration-300 ${
                i === activeIdx
                  ? 'w-6 bg-gradient-to-r from-violet to-cyan'
                  : i < activeIdx
                  ? 'w-1.5 bg-white/50'
                  : 'w-1.5 bg-white/15 hover:bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right-edge vertical scroll progress */}
      <div className="pointer-events-none fixed right-0 top-0 z-40 h-screen w-px bg-white/5">
        <div
          className="absolute left-0 top-0 w-px bg-gradient-to-b from-violet via-cyan to-magenta"
          style={{ height: `${progress * 100}%` }}
        />
      </div>
    </>
  )
}
