'use client'

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

export default function Home() {
  const mounted = useMounted()

  return (
    <SmoothScrollProvider>
      <main className="relative w-full overflow-x-hidden bg-background text-foreground">
        {/* Fixed overlays */}
        {mounted ? (
          <>
            <CustomCursor />
            <HudOverlay />
            <LevelTransition />
          </>
        ) : null}

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
      </main>
    </SmoothScrollProvider>
  )
}

