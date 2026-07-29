'use client'

import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { SmoothScrollProvider } from '@/components/portfolio/smooth-scroll-provider'
import { CustomCursor } from '@/components/portfolio/custom-cursor'
import { HudOverlay } from '@/components/portfolio/hud-overlay'
import { LevelTransition } from '@/components/portfolio/level-transition'
import { HeroSection } from '@/components/portfolio/hero-section'
import { AboutSection } from '@/components/portfolio/about-section'
import { ServicesSection } from '@/components/portfolio/services-section'
import { WorkSection } from '@/components/portfolio/work-section'
import { ProcessSection } from '@/components/portfolio/process-section'
import { ToolsMarquee } from '@/components/portfolio/tools-marquee'
import { TestimonialsSection } from '@/components/portfolio/testimonials-section'
import { ContactSection } from '@/components/portfolio/contact-section'
import { Footer } from '@/components/portfolio/footer'
import { useMounted } from '@/lib/use-mounted'
import { ScrollImageSequence } from '@/components/portfolio/scroll-image-sequence'

import { WhatsAppButton } from '@/components/portfolio/whatsapp-button'

const GlobalBackground3D = dynamic(
  () => import('@/components/portfolio/three/global-background-3d').then((m) => m.GlobalBackground3D),
  { ssr: false }
)

export default function Home() {
  const mounted = useMounted()
  const sequenceContainerRef = useRef<HTMLDivElement>(null)

  return (
    <SmoothScrollProvider>
      <main className="relative w-full overflow-x-clip bg-transparent text-foreground">
        {/* Fixed 3D scroll-driven background */}
        {mounted && <GlobalBackground3D />}

        {/* Scroll-driven image sequence for first 3 sections */}
        {mounted && <ScrollImageSequence containerRef={sequenceContainerRef} />}

        {/* Deep midnight violet vignette overlay for text legibility */}
        <div className="fixed inset-0 -z-5 pointer-events-none bg-gradient-to-b from-[#0d0a1b]/80 via-[#0d0a1b]/45 to-[#0d0a1b]/90" />

        {/* Fixed overlays */}
        {mounted ? (
          <>
            <CustomCursor />
            <HudOverlay />
            <LevelTransition />
            <WhatsAppButton />
          </>
        ) : null}

        {/* Wrapper for all sections to track scroll progress */}
        <div ref={sequenceContainerRef} className="relative w-full">
          {/* Level 0 — Hero */}
          <HeroSection />

          {/* Level 1 — About / Character Profile */}
          <AboutSection />

          {/* Level 2 — Services / Skill Trees */}
          <ServicesSection />

          {/* Level 3 — Featured Work / Mission Log */}
          <WorkSection />

          {/* Level 4 — Process / Roadmap */}
          <ProcessSection />

          {/* Inventory / Tools marquee */}
          <ToolsMarquee />

          {/* Level 5 — Testimonials / Player Reviews */}
          <TestimonialsSection />

          {/* Level 6 — Contact / Boss CTA */}
          <ContactSection />

          {/* End Credits */}
          <Footer />
        </div>
      </main>
    </SmoothScrollProvider>
  )
}


