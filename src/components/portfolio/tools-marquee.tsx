'use client'

const TOOLS = [
  'Next.js',
  'React',
  'TypeScript',
  'Three.js',
  'R3F',
  'GSAP',
  'Framer Motion',
  'Tailwind',
  'Midjourney',
  'Runway Gen-3',
  'Sora',
  'Stable Diffusion',
  'ComfyUI',
  'After Effects',
  'Figma',
  'Photoshop',
  'Illustrator',
  'Prisma',
  'Vercel',
  'Lenis',
]

export function ToolsMarquee() {
  return (
    <section
      className="relative w-full overflow-hidden border-y border-white/5 bg-background py-12"
      aria-label="Tools & Tech Inventory"
    >
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-background to-transparent" />

      <div className="mb-6 flex items-center justify-center gap-3">
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-violet" />
        <span className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
          Inventory · Loadout
        </span>
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-cyan" />
      </div>

      <div className="relative flex">
        {/* Row 1 — scroll left */}
        <div className="flex shrink-0 animate-marquee gap-3 pr-3" style={{ willChange: 'transform' }}>
          {[...TOOLS, ...TOOLS].map((t, i) => (
            <ToolChip key={`r1-${i}`} name={t} />
          ))}
        </div>
        <div className="flex shrink-0 animate-marquee gap-3 pr-3" aria-hidden>
          {[...TOOLS, ...TOOLS].map((t, i) => (
            <ToolChip key={`r1b-${i}`} name={t} />
          ))}
        </div>
      </div>

      <div className="relative mt-3 flex">
        {/* Row 2 — scroll right (reverse) */}
        <div className="flex shrink-0 animate-marquee-rev gap-3 pr-3" style={{ willChange: 'transform' }}>
          {[...TOOLS, ...TOOLS].reverse().map((t, i) => (
            <ToolChip key={`r2-${i}`} name={t} variant="alt" />
          ))}
        </div>
        <div className="flex shrink-0 animate-marquee-rev gap-3 pr-3" aria-hidden>
          {[...TOOLS, ...TOOLS].reverse().map((t, i) => (
            <ToolChip key={`r2b-${i}`} name={t} variant="alt" />
          ))}
        </div>
      </div>
    </section>
  )
}

function ToolChip({ name, variant = 'default' }: { name: string; variant?: 'default' | 'alt' }) {
  return (
    <div
      className={`group flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 transition-all hover:-translate-y-0.5 ${
        variant === 'alt'
          ? 'border-cyan/20 bg-cyan/5 hover:border-cyan/50'
          : 'border-violet/20 bg-violet/5 hover:border-violet/50'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          variant === 'alt' ? 'bg-cyan' : 'bg-violet'
        } group-hover:animate-pulse`}
      />
      <span className="font-display text-sm font-medium tracking-wide text-foreground/80">
        {name}
      </span>
    </div>
  )
}
