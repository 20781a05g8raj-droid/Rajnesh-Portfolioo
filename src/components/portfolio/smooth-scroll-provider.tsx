'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useLenisSmoothScroll } from '@/lib/use-lenis'

const SmoothScrollContext = createContext<{ enabled: boolean }>({ enabled: false })

export function useSmoothScroll() {
  return useContext(SmoothScrollContext)
}

/**
 * Wraps children with Lenis smooth scrolling (skipped when prefers-reduced-motion).
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useLenisSmoothScroll(true)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as unknown as { __lenis?: unknown }).__lenis = lenisRef.current
    }
  }, [lenisRef])
  return (
    <SmoothScrollContext.Provider value={{ enabled: !!lenisRef }}>
      {children}
    </SmoothScrollContext.Provider>
  )
}
