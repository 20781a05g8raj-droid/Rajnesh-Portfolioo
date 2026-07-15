'use client'

import { motion, type Variant } from 'framer-motion'
import { type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  x?: number
  scale?: number
  duration?: number
  once?: boolean
  amount?: number
}

/**
 * Scroll-triggered fade/slide/scale reveal using Framer Motion.
 * Cinematic ease by default. Renders motion.div (pre-created component).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 32,
  x = 0,
  scale = 1,
  duration = 0.9,
  once = true,
  amount = 0.3,
}: RevealProps) {
  const hidden: Variant = { opacity: 0, y, x, scale }
  const visible: Variant = {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
  }
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{ hidden, visible }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Section header with "LEVEL XX" eyebrow + title.
 */
export function SectionHeader({
  level,
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  level: string
  eyebrow: string
  title: ReactNode
  description?: string
  align?: 'left' | 'center'
}) {
  return (
    <div
      className={`flex flex-col gap-3 ${
        align === 'center' ? 'items-center text-center' : 'items-start text-left'
      }`}
    >
      <Reveal>
        <div className="inline-flex items-center gap-2">
          <span className="h-px w-8 bg-gradient-to-r from-violet to-cyan" />
          <span className="text-[11px] font-medium uppercase tracking-[0.4em] text-muted-foreground">
            Level {level}
          </span>
          <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/60">
            · {eyebrow}
          </span>
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
          {title}
        </h2>
      </Reveal>
      {description ? (
        <Reveal delay={0.1}>
          <p
            className={`max-w-2xl text-base text-muted-foreground md:text-lg ${
              align === 'center' ? 'mx-auto' : ''
            }`}
          >
            {description}
          </p>
        </Reveal>
      ) : null}
    </div>
  )
}
