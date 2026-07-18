'use client'

import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Reveal } from './reveal'
import { useMagnetic } from '@/lib/use-magnetic'
import { useMotionProfile } from '@/lib/use-motion-profile'

/**
 * Distortion-shader button: a small WebGL plane that distorts on hover.
 * Used as the primary "Start Game" CTA. Falls back to a CSS-only magnetic button
 * if WebGL is unavailable or reduced-motion is requested.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uHover;
  uniform float uTime;

  void main() {
    vUv = uv;
    vec3 pos = position;
    // Distort on hover
    float wave = sin(pos.x * 8.0 + uTime * 3.0) * 0.05 * uHover;
    pos.z += wave;
    pos.y += sin(pos.x * 4.0 + uTime * 2.0) * 0.03 * uHover;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uHover;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  void main() {
    vec2 uv = vUv;
    // Subtle distortion of UVs
    uv.x += sin(uv.y * 10.0 + uTime * 2.0) * 0.02 * uHover;
    uv.y += cos(uv.x * 10.0 + uTime * 2.0) * 0.02 * uHover;

    // Three-color sweep
    float t = uv.x;
    vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 0.5, t));
    col = mix(col, uColorC, smoothstep(0.5, 1.0, t));

    // Animated noise overlay
    float n = fract(sin(dot(uv * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
    col += (n - 0.5) * 0.06;

    // Glow band sweeping
    float band = smoothstep(0.0, 0.1, abs(fract(uv.x - uTime * 0.15) - 0.5));
    col += (1.0 - band) * 0.4 * (0.4 + uHover * 0.6);

    // Vignette
    float vig = smoothstep(0.7, 0.4, length(uv - 0.5));
    col *= 0.6 + vig * 0.7;

    gl_FragColor = vec4(col, 1.0);
  }
`

function ShaderButtonPlane({ hoverRef }: { hoverRef: React.RefObject<number> }) {
  const matRef = useRef<THREE.ShaderMaterial | null>(null)
  const uniforms = useMemo(
    () => ({
      uHover: { value: 0 },
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#a463f2') },
      uColorB: { value: new THREE.Color('#5ce5ff') },
      uColorC: { value: new THREE.Color('#ff5cc8') },
    }),
    []
  )
  useFrame((_, dt) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += dt
      const target = hoverRef.current
      matRef.current.uniforms.uHover.value +=
        (target - matRef.current.uniforms.uHover.value) * Math.min(1, dt * 6)
    }
  })
  return (
    <mesh>
      <planeGeometry args={[3.2, 1, 32, 8]} />
      <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  )
}

function ShaderButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  const hoverRef = useRef<number>(0)
  const innerRef = useRef<HTMLSpanElement | null>(null)
  const magRef = useMagnetic<HTMLDivElement>({
    strength: 0.4,
    radius: 180,
    innerRef,
    innerStrength: 0.7,
  })

  return (
    <div
      ref={magRef}
      data-cursor="start"
      onMouseEnter={() => (hoverRef.current = 1)}
      onMouseLeave={() => (hoverRef.current = 0)}
      onClick={onClick}
      className="relative cursor-pointer will-change-transform"
      style={{ width: 320, height: 100 }}
    >
      {/* WebGL plane */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 2], fov: 50 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%', borderRadius: 16 }}
        >
          <ShaderButtonPlane hoverRef={hoverRef} />
        </Canvas>
      </div>
      {/* Label overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          ref={innerRef}
          className="font-display text-xl font-bold uppercase tracking-[0.25em] text-white will-change-transform"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
        >
          {children}
        </span>
      </div>
    </div>
  )
}

function MagneticButtonCSS({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  const innerRef = useRef<HTMLSpanElement | null>(null)
  const magRef = useMagnetic<HTMLButtonElement>({ strength: 0.4, radius: 180, innerRef, innerStrength: 0.6 })
  return (
    <button
      ref={magRef}
      onClick={onClick}
      data-cursor="start"
      className="relative inline-flex h-[100px] w-[320px] items-center justify-center overflow-hidden rounded-2xl will-change-transform"
      style={{
        background: 'linear-gradient(120deg, #a463f2 0%, #5ce5ff 60%, #ff5cc8 100%)',
        boxShadow: '0 20px 60px -20px oklch(0.62 0.24 290 / 80%)',
      }}
    >
      <span
        ref={innerRef}
        className="font-display text-xl font-bold uppercase tracking-[0.25em] text-white will-change-transform"
      >
        {children}
      </span>
    </button>
  )
}

export function ContactSection() {
  const profile = useMotionProfile()
  const [form, setForm] = useState({ name: '', email: '', type: 'Website', message: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section
      id="level-contact"
      className="relative w-full overflow-hidden bg-transparent py-12 md:py-36"
      aria-label="Contact — Final Level Boss CTA"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, oklch(0.15 0.05 290 / 50%) 0%, transparent 70%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-grid opacity-20 mask-fade-b" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Header */}
        <Reveal className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass hud-border px-4 py-1.5">
            <span className="h-1.5 w-1.5 animate-badge-pulse rounded-full bg-magenta" />
            <span className="text-[11px] font-medium uppercase tracking-[0.4em] text-muted-foreground">
              Final Level · Boss CTA
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="mt-6 text-center font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            <span className="text-gradient-mono">Let&apos;s build</span>
            <br />
            <span className="text-gradient-accent">something extraordinary.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-center text-base text-muted-foreground md:text-lg">
            Whether it&apos;s a website that feels like a film, an AI video that punches
            above its budget, or a poster system that ships in days — start a quest.
          </p>
        </Reveal>

        {/* Start button */}
        <Reveal delay={0.15}>
          <div className="mt-12 flex justify-center">
            {profile.useWebGL ? (
              <ShaderButton onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}>
                Start Game
              </ShaderButton>
            ) : (
              <MagneticButtonCSS onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}>
                Start Game
              </MagneticButtonCSS>
            )}
          </div>
        </Reveal>

        {/* Form + links */}
        <div className="mt-20 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Form */}
          <Reveal>
            <form
              id="contact-form"
              onSubmit={handleSubmit}
              className="glass hud-border rounded-2xl p-6 md:p-8"
            >
              <h3 className="font-display text-xl font-semibold tracking-tight">
                Open a new quest
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell me about the project — type, timeline, and what success looks like.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4">
                <Field label="Your Name">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-violet/50 focus:bg-white/10"
                    placeholder="e.g. Priya Nair"
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-cyan/50 focus:bg-white/10"
                    placeholder="you@company.com"
                  />
                </Field>
                <Field label="Project Type">
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-magenta/50 focus:bg-white/10"
                  >
                    <option>Website Development</option>
                    <option>AI Video Generation</option>
                    <option>AI Poster / Graphic Design</option>
                    <option>Full Combo (all three)</option>
                  </select>
                </Field>
                <Field label="Message">
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-violet/50 focus:bg-white/10"
                    placeholder="Brief, timeline, budget range, references..."
                  />
                </Field>
                <button
                  type="submit"
                  data-cursor="submit"
                  className="group relative mt-2 w-full overflow-hidden rounded-lg bg-gradient-to-r from-violet via-cyan to-magenta p-[1px] transition-transform hover:scale-[1.01]"
                >
                  <span className="block rounded-lg bg-background/80 px-4 py-3 text-center text-sm font-semibold uppercase tracking-widest text-foreground backdrop-blur transition-colors group-hover:bg-transparent group-hover:text-white">
                    {submitted ? 'Quest Submitted ✓' : 'Submit Quest'}
                  </span>
                </button>
                {submitted ? (
                  <p className="text-center text-xs text-cyan">
                    Thanks — I&apos;ll get back to you within 24 hours.
                  </p>
                ) : null}
              </div>
            </form>
          </Reveal>

          {/* Direct links */}
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col gap-4">
              <ContactLink
                href="https://wa.me/919999999999"
                label="WhatsApp"
                value="+91 99999 99999"
                accent="cyan"
                icon="chat"
              />
              <ContactLink
                href="mailto:hello@rajnesh.dev"
                label="Email"
                value="hello@rajnesh.dev"
                accent="violet"
                icon="mail"
              />
              <ContactLink
                href="https://www.linkedin.com/in/rajnesh-upadhyay"
                label="LinkedIn"
                value="/in/rajnesh-upadhyay"
                accent="magenta"
                icon="link"
              />
              <ContactLink
                href="https://www.instagram.com/rajnesh.creates"
                label="Instagram"
                value="@rajnesh.creates"
                accent="cyan"
                icon="cam"
              />

              <div className="mt-auto rounded-2xl glass hud-border p-5">
                <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                  Availability
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                  <span className="font-display text-base font-semibold">
                    Open for Q3 / Q4 quests
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Currently taking on 2 new projects. Average response time under 24h.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

function ContactLink({
  href,
  label,
  value,
  accent,
  icon,
}: {
  href: string
  label: string
  value: string
  accent: 'violet' | 'cyan' | 'magenta'
  icon: 'chat' | 'mail' | 'link' | 'cam'
}) {
  const hex = accent === 'violet' ? '#a463f2' : accent === 'cyan' ? '#5ce5ff' : '#ff5cc8'
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="open"
      className="group flex items-center justify-between rounded-2xl glass hud-border p-5 transition-all hover:border-white/30 hover:bg-white/8"
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: `${hex}18`, border: `1px solid ${hex}40` }}
        >
          <ContactIcon kind={icon} color={hex} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {label}
          </div>
          <div className="font-display text-base font-medium text-foreground">{value}</div>
        </div>
      </div>
      <span className="font-display text-sm text-muted-foreground transition-transform group-hover:translate-x-1" style={{ color: hex }}>
        →
      </span>
    </a>
  )
}

function ContactIcon({ kind, color }: { kind: 'chat' | 'mail' | 'link' | 'cam'; color: string }) {
  const s = { stroke: color, strokeWidth: 1.6, fill: 'none' } as const
  if (kind === 'chat') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...s}>
        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9 9 0 0 1-4-1L3 20l1-5a8.5 8.5 0 0 1 17-3.5z" />
      </svg>
    )
  }
  if (kind === 'mail') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...s}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <polyline points="3 7 12 13 21 7" />
      </svg>
    )
  }
  if (kind === 'cam') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...s}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="12" cy="12" r="3.5" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" {...s}>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
    </svg>
  )
}
